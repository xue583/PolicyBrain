<script setup lang="ts">
import { usePagination } from '@/composables/usePagination'
import type { EnterprisePolicyRecord } from '../../mock/enterpriseDb'

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
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
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
  <h2 class="section-title">
    政策扶持记录
    <em>{{ records.length }}</em>
    条
  </h2>
  <a-table
    class="db-table"
    bordered
    :columns="columns"
    :data-source="pagedList"
    :pagination="false"
    :row-key="(row: EnterprisePolicyRecord) => row.id"
    size="middle"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'name'">
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
  </a-table>
  <div class="pagination-wrap">
    <a-pagination
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
      :show-total="(t: number) => `共 ${t} 条`"
    />
  </div>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: #262626;
  background: var(--section-title-bg) no-repeat left center;
  background-size: 94px 26px;

  em {
    font-style: normal;
    color: var(--pb-primary);
  }
}

.policy-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}

.pagination-wrap {
  --pagination-padding: 20px 0 0;
}
</style>
