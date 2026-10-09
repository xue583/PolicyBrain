<script setup lang="ts">
import { usePagination } from '@/composables/usePagination'
import type { EnterprisePolicyRecord } from '../../mock/enterpriseDb'
import PagedTable from '@/components/common/PagedTable.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'

defineOptions({ name: 'EnterprisePolicyRecordsPanel' })

const props = defineProps<{
  records: EnterprisePolicyRecord[]
}>()

const PAGE_SIZE = 10
const { currentPage, pagedList, total, pageSize } = usePagination(
  () => props.records,
  { pageSize: PAGE_SIZE },
)

const columns = [
  { title: '政策名称', key: 'name', ellipsis: true },
  { title: '政策级别', dataIndex: 'grade', key: 'grade', width: 120 },
  { title: '扶持金额(万元)', dataIndex: 'amount', key: 'amount', width: 140 },
  { title: '项目备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  {
    title: '年度',
    dataIndex: 'year',
    key: 'year',
    width: 90,
    align: 'center' as const,
  },
  { title: '发布单位', dataIndex: 'department', key: 'department', width: 140 },
]
</script>

<template>
  <SectionTitle title="政策扶持记录" :count="records.length" />
  <PagedTable
    v-model:current="currentPage"
    class="records-table"
    :total="total"
    :page-size="pageSize"
    :columns="columns"
    :data-source="pagedList"
    :row-key="(row: EnterprisePolicyRecord) => row.id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <router-link
          class="policy-link"
          :to="{
            name: 'policy-db-detail',
            params: { id: String(record.policyId) },
          }"
        >
          {{ record.name }}
        </router-link>
      </template>
    </template>
  </PagedTable>
</template>

<style scoped lang="scss">
.records-table {
  --pagination-padding: 20px 0 0;
}

.policy-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}
</style>
