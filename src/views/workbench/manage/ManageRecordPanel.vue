<script setup lang="ts">
import { computed } from 'vue'
import { usePagination } from '@/composables/usePagination'
import type { ManageMetric, ManageRow } from '@/mock/manage'
import WbDataTable from '../components/WbDataTable.vue'
import WbPagination from '../components/WbPagination.vue'

defineOptions({ name: 'ManageRecordPanel' })

const PAGE_SIZE = 10

const props = withDefaults(
  defineProps<{
    title: string
    metrics?: ManageMetric[]
    columns: Array<{
      title: string
      dataIndex?: string
      key: string
      width?: number
      ellipsis?: boolean
    }>
    rows: ManageRow[]
    minWidth?: number
  }>(),
  { metrics: () => [], minWidth: 860 },
)

const emit = defineEmits<{
  action: [row: ManageRow]
}>()

const { currentPage, pagedList, total, pageSize } = usePagination(
  () => props.rows,
  { pageSize: PAGE_SIZE },
)

const tableColumns = computed(() => [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  ...props.columns,
])

const statusClass = (status: string) => {
  if (status === '离职' || status === '闲置') return 'is-muted'
  if (status === '已结题') return 'is-info'
  return 'is-ok'
}

const cellText = (
  record: Record<string, unknown>,
  column: { dataIndex?: string },
) => {
  if (!column.dataIndex) return ''
  const value = record[column.dataIndex]
  return value == null ? '' : String(value)
}
</script>

<template>
  <section class="record-panel">
    <h3 class="sec-title"><span class="sec-bar" />{{ title }}</h3>

    <div v-if="metrics.length" class="metric-row">
      <article v-for="item in metrics" :key="item.label" class="metric-card">
        <p class="metric-label">{{ item.label }}</p>
        <p class="metric-value">
          {{ item.value }}
          <span v-if="item.unit">{{ item.unit }}</span>
        </p>
      </article>
    </div>

    <WbDataTable
      :columns="tableColumns"
      :data-source="pagedList"
      :min-width="minWidth"
      row-key="id"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (currentPage - 1) * pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'status'">
          <span
            class="status-pill"
            :class="statusClass(String(record.status ?? ''))"
          >
            {{ record.status }}
          </span>
        </template>
        <template v-else-if="column.key === 'action'">
          <button
            type="button"
            class="link-btn"
            @click="emit('action', record as ManageRow)"
          >
            下载
          </button>
        </template>
        <span
          v-else
          :class="{ 'ellipsis-cell': column.ellipsis }"
          :title="cellText(record, column)"
        >
          {{ cellText(record, column) }}
        </span>
      </template>
      <template #emptyText>暂无数据</template>
    </WbDataTable>

    <WbPagination
      v-if="total > pageSize"
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
    />
  </section>
</template>

<style scoped lang="scss">
.sec-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 600;
}

.sec-bar {
  width: 4px;
  height: 16px;
  background: var(--pb-primary);
  border-radius: 2px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.metric-card {
  min-width: 0;
  padding: 14px 16px;
  background: #f8f9fb;
  border: 1px solid #eef0f4;
  border-radius: 8px;
}

.metric-label {
  margin: 0;
  color: #999;
  font-size: 13px;
  line-height: 1.4;
}

.metric-value {
  margin: 8px 0 0;
  color: var(--pb-primary);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;

  span {
    margin-left: 4px;
    color: #666;
    font-size: 13px;
    font-weight: 400;
  }
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  font-size: 13px;
  line-height: 20px;
  border-radius: 4px;

  &.is-ok {
    color: #2fb182;
    background: #e6f7ef;
  }

  &.is-info {
    color: #3e7bfa;
    background: #e8f1ff;
  }

  &.is-muted {
    color: #8c8c8c;
    background: #f5f5f5;
  }
}

.ellipsis-cell {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.link-btn {
  padding: 0;
  color: var(--pb-primary);
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--pb-primary-hover, #4096ff);
  }
}

@include below-lg {
  .metric-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
