<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import type { InvestProject } from '../../../mock/investDb'

defineProps<{
  dataSource: InvestProject[]
  total: number
  currentPage: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
}>()

const listLocale = {
  ...zhCN,
  Pagination: { ...zhCN.Pagination, jump_to: '前往' },
}

const resultLabel = (record: InvestProject) =>
  record.resultLabel ||
  (record.result === 'passed' ? '办结（通过）' : '未办结（驳回）')

const columns: TableColumnType<InvestProject>[] = [
  {
    title: '项目代码',
    dataIndex: 'code',
    key: 'code',
    width: '18%',
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
    width: '20%',
  },
  {
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
    width: '14%',
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
    width: '12%',
  },
]
</script>

<template>
  <div class="project-table">
    <a-table
      class="db-table invest-table"
      table-layout="fixed"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :loading="loading"
      :row-key="(row: InvestProject) => row.code || row.id"
      size="middle"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'code'">
          <span class="code-cell">{{ record.code }}</span>
        </template>
        <template v-else-if="column.key === 'name'">
          <a
            v-if="record.url"
            class="project-name"
            :href="record.url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ record.name }}</a
          >
          <span v-else class="project-name">{{ record.name }}</span>
        </template>
        <template v-else-if="column.key === 'approvalUnit'">
          <a-tooltip :title="record.approvalUnit">
            <span class="clamp-cell">{{ record.approvalUnit }}</span>
          </a-tooltip>
        </template>
        <template v-else-if="column.key === 'recordUnit'">
          <span class="clamp-cell">{{ record.recordUnit }}</span>
        </template>
        <template v-else-if="column.key === 'result'">
          <span class="result" :class="record.result">
            <CheckCircleFilled v-if="record.result === 'passed'" />
            <CloseCircleFilled v-else />
            {{ resultLabel(record) }}
          </span>
        </template>
      </template>
    </a-table>

    <div class="pagination-wrap">
      <a-config-provider :locale="listLocale">
        <a-pagination
          :current="currentPage"
          :total="total"
          :page-size="pageSize"
          show-quick-jumper
          :show-size-changer="false"
          :show-total="(t: number) => `共${t}条`"
          @update:current="emit('update:currentPage', $event)"
        />
      </a-config-provider>
    </div>
  </div>
</template>

<style scoped lang="scss">
.invest-table {
  --db-table-font-size: 14px;
  --db-table-cell-padding: 14px 12px;

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f9ff;
  }
}

.code-cell {
  white-space: nowrap;
}

.clamp-cell {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.5;
}

.project-name {
  line-height: 1.6;
  white-space: normal;
  word-break: break-word;

  &:hover {
    color: var(--pb-primary);
  }
}

a.project-name {
  cursor: pointer;
}

.result {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;

  &.passed {
    color: #52c41a;
    background: #f6ffed;
  }

  &.rejected {
    color: #ff4d4f;
    background: #fff2f0;
  }

  .anticon {
    font-size: 14px;
  }
}

.pagination-wrap {
  --pagination-justify: center;
  --pagination-padding: 18px 0 8px;

  :deep(.ant-pagination-item-active) {
    background: var(--pb-primary);
    border-color: var(--pb-primary);

    a {
      color: #fff;
    }
  }
}
</style>
