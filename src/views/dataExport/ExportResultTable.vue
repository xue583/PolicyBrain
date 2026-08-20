<script setup lang="ts">
import { DownloadOutlined } from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import type { ExportEnterprise } from '@/mock/dataExport'

defineOptions({ name: 'ExportResultTable' })

defineProps<{
  columns: TableColumnType<ExportEnterprise>[]
  list: ExportEnterprise[]
  total: number
  currentPage: number
  pageSize: number
  countText?: string
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
  export: []
}>()
</script>

<template>
  <div class="result-toolbar">
    <slot name="count">
      <span class="result-count">{{ countText }}</span>
    </slot>
    <a-button type="primary" ghost class="export-btn" @click="emit('export')">
      <DownloadOutlined />
      导出Excel
    </a-button>
  </div>

  <a-table
    class="result-table"
    :columns="columns"
    :data-source="list"
    :pagination="false"
    :row-key="(row: ExportEnterprise) => row.id"
    size="middle"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'name'">
        <span class="ent-name">{{ record.name }}</span>
      </template>
      <template v-else-if="column.key === 'policyCount'">
        <span
          class="count-badge"
          :class="record.policyCount >= 3 ? 'high' : 'low'"
        >
          {{ record.policyCount }}
        </span>
      </template>
    </template>
  </a-table>

  <div class="pagination-wrap">
    <a-pagination
      :current="currentPage"
      :total="total"
      :page-size="pageSize"
      show-quick-jumper
      :show-size-changer="false"
      :show-total="(t: number) => `共 ${t} 条`"
      @update:current="emit('update:currentPage', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.result-count {
  font-size: 14px;
  color: #595959;

  :deep(em) {
    margin: 0 4px;
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
  }
}

.file-name {
  color: #8c8c8c;
}

.export-btn {
  height: 36px;
}

.result-table {
  :deep(.ant-table) {
    background: transparent;
    font-size: 14px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-weight: 600;
    border-bottom: none;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    color: #434343;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr:nth-child(even) > td) {
    background: #f8fbff;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #eef6ff;
  }
}

.ent-name {
  color: var(--pb-primary);
  font-weight: 500;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;

  &.high {
    color: #389e0d;
    background: #f6ffed;
  }

  &.low {
    color: #d4380d;
    background: #fff2e8;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0 4px;
}
</style>
