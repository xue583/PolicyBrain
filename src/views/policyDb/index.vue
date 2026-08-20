<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BankOutlined, EyeOutlined } from '@ant-design/icons-vue'
import {
  mockPolicyDb,
  policyDbLevels,
  type PolicyDbItem,
} from '../../mock/policyDb'

defineOptions({ name: 'PolicyDb' })

const route = useRoute()
const keyword = computed(() => String(route.query.q ?? ''))

const currentPage = ref(1)
const pageSize = 10
const levels = ref<string[]>(['municipal'])

const statusText: Record<PolicyDbItem['status'], string> = {
  idle: '暂无动态',
  expired: '疑似过期',
}

const filteredList = computed(() => {
  let list = mockPolicyDb

  if (levels.value.length) {
    list = list.filter((item) => levels.value.includes(item.level))
  }

  const kw = keyword.value.trim()
  if (kw) {
    list = list.filter(
      (item) =>
        item.name.includes(kw) ||
        item.department.includes(kw) ||
        item.support.includes(kw),
    )
  }

  return list
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

watch([levels, keyword], () => {
  currentPage.value = 1
})

const columns = [
  {
    title: '政策名称/支持产业',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '支持力度',
    dataIndex: 'support',
    key: 'support',
    ellipsis: true,
  },
  {
    title: '发布部门',
    dataIndex: 'department',
    key: 'department',
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    key: 'views',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
]
</script>

<template>
  <div class="policy-db">
    <div class="db-panel">
      <div class="toolbar">
        <span class="result-count">
          共找到 <em>{{ total }}</em> 项政策
        </span>
        <div class="level-filter">
          <span class="level-label">政策等级:</span>
          <a-checkbox-group v-model:value="levels" :options="policyDbLevels" />
        </div>
      </div>

      <a-table
        class="db-table"
        :columns="columns"
        :data-source="pagedList"
        :pagination="false"
        :row-key="(row: PolicyDbItem) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <span class="policy-name">{{ record.name }}</span>
          </template>
          <template v-else-if="column.key === 'support'">
            <span :class="record.support ? 'support-text' : 'support-empty'">
              {{ record.support || '—' }}
            </span>
          </template>
          <template v-else-if="column.key === 'department'">
            <div class="dept-cell">
              <BankOutlined class="dept-icon" />
              <span class="dept-city">{{ record.city }}</span>
              <span class="dept-name">{{ record.department }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'views'">
            <span class="views-cell">
              <EyeOutlined />
              {{ record.views }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <span class="status-tag" :class="record.status">
              {{ statusText[record.status as PolicyDbItem['status']] }}
            </span>
          </template>
        </template>
      </a-table>

      <div class="pagination-wrap">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          show-quick-jumper
          :show-total="(t: number) => `共 ${t} 条`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.db-panel {
  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 0 0 12px;
}

.result-count {
  font-size: 15px;
  color: #595959;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
    margin: 0 2px;
  }
}

.level-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 18px;

  :deep(.ant-checkbox-wrapper) {
    font-size: 18px;
    color: #262626;
  }
}

.level-label {
  color: #8c8c8c;
  white-space: nowrap;
}

.db-table {
  :deep(.ant-table) {
    background: transparent;
    font-size: 16px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 16px;
    font-weight: 600;
    border-bottom: none;
    padding: 22px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
    padding: 22px !important;
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

.policy-name {
  color: #1f1f1f;
  font-weight: 500;
}

.support-text {
  color: #595959;
}

.support-empty {
  color: #bfbfbf;
}

.dept-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: #595959;
}

.dept-icon {
  color: var(--pb-primary);
  font-size: 14px;
}

.dept-city {
  color: var(--pb-primary);
}

.dept-name {
  color: #595959;
}

.views-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;

  .anticon {
    font-size: 14px;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;

  &.idle {
    color: #d48806;
    background: #fff7e6;
  }

  &.expired {
    color: #cf1322;
    background: #fff1f0;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0 4px;
}

@media (max-width: 768px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
