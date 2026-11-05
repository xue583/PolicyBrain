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

const emptyList = (): PolicyUserEnterpriseList => ({ items: [] })

/** 个人中心与工作台企业管理共用：已绑定企业、是否还能绑定、解绑 */
export const useMyEnterprises = () => {
  const auth = useAuthStore()
  const list = ref<PolicyUserEnterpriseList>(emptyList())
  const loading = ref(false)
  const loaded = ref(false)

  const items = computed(() => list.value.items ?? [])

  const canBindMore = computed(() => {
    if (typeof list.value.canBindMore === 'boolean')
      return list.value.canBindMore
    const identity = Number(auth.user?.identity)
    if (identity === PolicyUserType.EnterpriseService) return true
    return items.value.length < 1
  })

  const load = async () => {
    loading.value = true
    try {
      list.value = await fetchMyEnterprises()
      loaded.value = true
    } catch {
      loaded.value = false
    } finally {
      loading.value = false
    }
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
            await auth.loadCurrentUser().catch(() => undefined)
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
