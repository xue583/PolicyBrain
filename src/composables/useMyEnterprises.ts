import { computed, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import {
  fetchMyEnterprises,
  unbindMyEnterprise,
  type PolicyUserEnterprise,
  type PolicyUserEnterpriseList,
} from '@/api/account'
import { PolicyUserType } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/request'
import { toErrorMessage } from '@/utils/apiError'
import { softFail } from '@/utils/softFail'

const emptyList = (): PolicyUserEnterpriseList => ({ items: [] })

const list = ref<PolicyUserEnterpriseList>(emptyList())
const loading = ref(false)
const loaded = ref(false)
let inflight: Promise<void> | null = null

/** 测试隔离。进行中的请求结束后仍可能写回，调用方需先等它结束 */
export const resetMyEnterprises = () => {
  list.value = emptyList()
  loading.value = false
  loaded.value = false
  inflight = null
}

/** 个人中心与工作台企业管理共用：已绑定企业、是否还能绑定、解绑 */
export const useMyEnterprises = () => {
  const auth = useAuthStore()

  const items = computed(() => list.value.items ?? [])

  const canBindMore = computed(() => {
    if (typeof list.value.canBindMore === 'boolean')
      return list.value.canBindMore
    const identity = Number(auth.user?.identity)
    if (identity === PolicyUserType.EnterpriseService) return true
    return items.value.length < 1
  })

  const load = () => {
    if (inflight) return inflight
    loading.value = true
    const task = fetchMyEnterprises()
      .then((data) => {
        list.value = data
        loaded.value = true
      })
      .catch((error) => {
        // 主列表失败：显式报错并清空（不用 softFail，见 softFail.ts）
        list.value = emptyList()
        loaded.value = false
        message.error(toErrorMessage(error, '我的企业列表加载失败'))
      })
      .finally(() => {
        loading.value = false
        if (inflight === task) inflight = null
      })
    inflight = task
    return task
  }

  const unbind = (item: PolicyUserEnterprise) => {
    const name = item.name?.trim() || '该企业'
    const specialist =
      Number(auth.user?.identity) === PolicyUserType.EnterpriseSpecialist
    Modal.confirm({
      title: '解绑企业',
      content: specialist
        ? `确定解绑「${name}」吗？解绑后将清空个人资料中的公司名称与统一社会信用代码。`
        : `确定解绑「${name}」吗？`,
      okText: '解绑',
      cancelText: '取消',
      onOk: async () => {
        try {
          list.value = await unbindMyEnterprise(item.enterpriseId)
          loaded.value = true
          message.success('已解绑')
          if (specialist) {
            await auth
              .loadCurrentUser()
              .catch(softFail(undefined, '登录信息刷新'))
          }
        } catch (err) {
          message.error(
            err instanceof ApiError ? err.message : '解绑失败，请稍后重试',
          )
          throw err
        }
      },
    })
  }

  return { list, items, loading, loaded, canBindMore, load, unbind }
}
