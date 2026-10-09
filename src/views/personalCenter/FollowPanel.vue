<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import {
  buildPolicyChanges,
  companyNames,
  type PolicyChange,
} from '@/mock/personalCenter'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'FollowPanel' })

type FollowedCompany = {
  id: number
  name: string
  address: string
  industry: string
  policyCount: number
}

/** 视觉还原用 Mock 数据，接入后端后替换 */
const companyAddresses = [
  '河南省 郑州市 郑州航空港经济综合试验区',
  '河南省 郑州市 郑州高新技术产业开发区',
  '河南省 郑州市 中原区',
]
const policyCounts = [6, 7, 4, 8, 6, 7, 4, 8, 1, 1, 5, 3, 2, 9, 6]

const companyRecords = ref<FollowedCompany[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: companyNames[i % companyNames.length]!,
    address: companyAddresses[i % companyAddresses.length]!,
    industry: '包装制造',
    policyCount: policyCounts[i]!,
  })),
)

const policyRecords = ref(buildPolicyChanges())

const activeTab = ref<'company' | 'policy'>('company')

const activeRecords = computed(() =>
  activeTab.value === 'company' ? companyRecords.value : policyRecords.value,
)

const { currentPage, pageSize, total, pagedList, resetPage } = usePagination<
  FollowedCompany | PolicyChange
>(() => activeRecords.value)

const switchTab = (tab: 'company' | 'policy') => {
  activeTab.value = tab
  resetPage()
}

const removeCompany = (id: number) => {
  companyRecords.value = companyRecords.value.filter((item) => item.id !== id)
  if (pagedList.value.length === 0 && currentPage.value > 1)
    currentPage.value -= 1
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
      @update:active-key="switchTab"
    />

    <a-table
      class="follow-table"
      :columns="
        activeTab === 'company'
          ? [
              { title: '序号', dataIndex: 'id', width: 48 },
              { title: '企业名称', dataIndex: 'name', ellipsis: true },
              { title: '注册地址', dataIndex: 'address', ellipsis: true },
              { title: '所属行业', dataIndex: 'industry', width: 90 },
              { title: '获取政策数量', dataIndex: 'policyCount', width: 104 },
              { title: '操作', dataIndex: 'action', width: 64 },
            ]
          : [
              { title: '序号', dataIndex: 'id', width: 48 },
              { title: '政策名称', dataIndex: 'policyName', ellipsis: true },
              { title: '变动类型', dataIndex: 'changeType', width: 90 },
              { title: '变动前', dataIndex: 'before', ellipsis: true },
              { title: '变动后', dataIndex: 'after', ellipsis: true },
              { title: '变动时间', dataIndex: 'changedAt', width: 150 },
            ]
      "
      :data-source="pagedList"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a
            class="remove-link"
            @click.prevent="removeCompany((record as FollowedCompany).id)"
            >删除</a
          >
        </template>
      </template>
      <template #emptyText>
        <EmptyState :image="emptyImg" />
      </template>
    </a-table>

    <PaginationBar
      v-if="total > 0"
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
    />
  </div>
</template>

<style scoped lang="scss">
.panel-tabs-mb {
  margin-bottom: 20px;
}

.follow-table {
  @include pc-table($hover: true, $indent-first: true);

  :deep(.ant-table-tbody > tr > td) {
    border-inline-end: none;
  }
}

.remove-link {
  color: var(--pb-primary);
  cursor: pointer;
}
</style>
