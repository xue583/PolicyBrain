<script setup lang="ts">
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import type { InvestProject } from '../../../mock/investDb'

defineProps<{
  dataSource: InvestProject[]
  total: number
  currentPage: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
}>()

const columns: TableColumnType<InvestProject>[] = [
  {
    title: '项目代码',
    dataIndex: 'code',
    key: 'code',
    width: '20%',
  },
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
    width: '24%',
  },
  {
    title: '审批单位',
    dataIndex: 'approvalUnit',
    key: 'approvalUnit',
    width: '15%',
  },
  {
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
    width: '16%',
  },
  {
    title: '审批时间',
    dataIndex: 'approvalDate',
    key: 'approvalDate',
    width: '12%',
  },
  {
    title: '备案单位名称',
    dataIndex: 'recordUnit',
    key: 'recordUnit',
    width: '13%',
  },
]
</script>

<template>
  <a-card :bordered="false" class="project-table-card">
    <a-table
      class="invest-table"
      table-layout="fixed"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :row-key="(row: InvestProject) => row.id"
      size="middle"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a class="project-name">{{ record.name }}</a>
        </template>
        <template v-else-if="column.key === 'result'">
          <span class="result" :class="record.result">
            <CheckCircleFilled v-if="record.result === 'passed'" />
            <CloseCircleFilled v-else />
            {{ record.result === 'passed' ? '办结（通过）' : '未办结（驳回）' }}
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
  </a-card>
</template>

<style scoped lang="scss">
.project-table-card {
  border-radius: 12px;

  :deep(.ant-card-body) {
    overflow-x: auto;
  }
}

.invest-table {
  :deep(.ant-table) {
    background: transparent;
    font-size: 15px;
  }

  :deep(table) {
    table-layout: fixed;
    width: 100%;
    min-width: 980px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 15px;
    font-weight: 600;
    border-bottom: none;
    white-space: nowrap;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 14px;
    color: #434343;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
    word-break: break-word;
    padding: 18px 14px !important;
  }

  :deep(.ant-table-tbody > tr:nth-child(even) > td) {
    background: #f8fbff;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #eef6ff;
  }

  :deep(.ant-table-container table) {
    border-radius: 0;
  }
}

.project-name {
  display: inline;
  color: var(--pb-primary);
  line-height: 1.6;
  white-space: normal;
  word-break: break-word;
}

.result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &.passed {
    color: #52c41a;
  }

  &.rejected {
    color: #ff4d4f;
  }

  .anticon {
    font-size: 15px;
  }
}

.pagination-wrap {
  --pagination-justify: flex-end;
  --pagination-padding: 16px 20px 4px;
}
</style>
