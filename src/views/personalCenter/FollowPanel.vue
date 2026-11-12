<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import {
  FOLLOW_ENTERPRISE,
  FOLLOW_POLICY,
  fetchAccountFollows,
  unfollowTarget,
  type AccountFollow,
  type FollowTargetType,
} from '@/api/account'
import { forgetFollow } from '@/composables/useFollowable'
import { useServerPage } from '@/composables/useServerPage'
import { toErrorMessage } from '@/utils/apiError'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'FollowPanel' })

const POLICY_LEVEL: Record<number, string> = {
  0: '国家级',
  1: '省级',
  2: '市级',
  3: '区县级',
}

const router = useRouter()
const activeTab = ref<'company' | 'policy'>('company')
const initialized = ref(false)
const removingId = ref<string | null>(null)

const targetType = computed<FollowTargetType>(() =>
  activeTab.value === 'company' ? FOLLOW_ENTERPRISE : FOLLOW_POLICY,
)

const { currentPage, pageSize, items, total, loading, error, reload } =
  useServerPage(
    (pageIndex, size) =>
      fetchAccountFollows({
        targetType: targetType.value,
        pageIndex,
        pageSize: size,
      }),
    () => activeTab.value,
  )

watch(loading, (value, prev) => {
  if (prev && !value) initialized.value = true
})

const visibleItems = computed(() =>
  items.value.filter(
    (item) => !item.targetType || item.targetType === targetType.value,
  ),
)

const showEmpty = computed(
  () =>
    initialized.value &&
    !loading.value &&
    !error.value &&
    visibleItems.value.length === 0,
)

const formatTime = (value?: string | null) => {
  if (!value) return '—'
  const time = dayjs(value)
  return time.isValid() ? time.format('YYYY-MM-DD HH:mm') : value
}

const regionText = (item: AccountFollow) => {
  const text = [item.provinceName, item.cityName].filter(Boolean).join(' ')
  return text || '—'
}

const levelText = (level?: number | null) => {
  if (level == null) return '—'
  return POLICY_LEVEL[level] || '—'
}

const rowKey = (record: AccountFollow) =>
  record.followId || record.targetId || record.name || 'follow'

const openTarget = (item: AccountFollow) => {
  if (!item.targetId) return
  const name =
    item.targetType === FOLLOW_POLICY
      ? 'policy-db-detail'
      : 'enterprise-db-detail'
  void router.push({ name, params: { id: String(item.targetId) } })
}

const removeFollow = async (item: AccountFollow) => {
  const id = item.targetId?.trim() ?? ''
  const type = item.targetType || targetType.value
  if (!id || removingId.value != null) return
  removingId.value = id
  try {
    await unfollowTarget(type, id)
    forgetFollow(type, id)
    message.success('已取消关注')
    if (visibleItems.value.length <= 1 && currentPage.value > 1) {
      currentPage.value -= 1
      return
    }
    await reload()
  } catch (err) {
    message.error(toErrorMessage(err, '取消关注失败'))
  } finally {
    removingId.value = null
  }
}
</script>

<template>
  <div class="follow-panel">
    <PanelTabs
      class="panel-tabs-mb"
      :tabs="[
        { key: 'company', label: '企业' },
        { key: 'policy', label: '政策' },
      ]"
      :active-key="activeTab"
      @update:active-key="activeTab = $event"
    />

    <a-alert
      v-if="error"
      class="follow-error"
      type="error"
      show-icon
      :message="error"
    >
      <template #action>
        <a-button size="small" @click="reload">重试</a-button>
      </template>
    </a-alert>

    <a-spin :spinning="loading">
      <EmptyState v-if="showEmpty" :image="emptyImg" text="暂无关注内容" />

      <template v-else>
        <a-table
          class="follow-table"
          :columns="
            activeTab === 'company'
              ? [
                  { title: '序号', dataIndex: 'index', width: 64 },
                  { title: '企业名称', dataIndex: 'name', ellipsis: true },
                  {
                    title: '所在地区',
                    dataIndex: 'provinceName',
                    ellipsis: true,
                  },
                  { title: '法人', dataIndex: 'legalPerson', width: 100 },
                  { title: '关注时间', dataIndex: 'followTime', width: 160 },
                  { title: '操作', dataIndex: 'action', width: 88 },
                ]
              : [
                  { title: '序号', dataIndex: 'index', width: 64 },
                  { title: '政策名称', dataIndex: 'name', ellipsis: true },
                  { title: '政策等级', dataIndex: 'policyLevel', width: 90 },
                  {
                    title: '发布单位',
                    dataIndex: 'issuingAuthority',
                    ellipsis: true,
                  },
                  { title: '关注时间', dataIndex: 'followTime', width: 160 },
                  { title: '操作', dataIndex: 'action', width: 88 },
                ]
          "
          :data-source="visibleItems"
          :pagination="false"
          :row-key="rowKey"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </template>
            <template v-else-if="column.dataIndex === 'name'">
              <a class="name-link" @click.prevent="openTarget(record)">
                {{ record.name || '—' }}
              </a>
            </template>
            <template v-else-if="column.dataIndex === 'provinceName'">
              {{ regionText(record) }}
            </template>
            <template v-else-if="column.dataIndex === 'legalPerson'">
              {{ record.legalPerson || '—' }}
            </template>
            <template v-else-if="column.dataIndex === 'policyLevel'">
              {{ levelText(record.policyLevel) }}
            </template>
            <template v-else-if="column.dataIndex === 'issuingAuthority'">
              {{ record.issuingAuthority || '—' }}
            </template>
            <template v-else-if="column.dataIndex === 'followTime'">
              {{ formatTime(record.followTime) }}
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <a class="remove-link" @click.prevent="removeFollow(record)">
                {{ removingId === record.targetId ? '取消中' : '取消关注' }}
              </a>
            </template>
          </template>
        </a-table>

        <PaginationBar
          v-if="!loading && total > 0 && visibleItems.length > 0"
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
        />
      </template>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">
.panel-tabs-mb {
  margin-bottom: 20px;
}

.follow-error {
  margin-bottom: 16px;
}

.follow-table {
  @include pc-table($hover: true, $indent-first: true);

  :deep(.ant-table-tbody > tr > td) {
    border-inline-end: none;
  }
}

.name-link,
.remove-link {
  color: var(--pb-primary);
  cursor: pointer;
}
</style>
