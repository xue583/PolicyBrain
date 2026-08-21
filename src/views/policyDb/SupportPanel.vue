<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { policyGrades, type PolicyDbSupportMeasure } from '../../mock/policyDb'
import {
  attachGradeRowSpan,
  filterPolicyDbSupport,
  type PolicyDbSupportRow,
} from '@/utils/filterPolicies'

defineOptions({ name: 'PolicyDbSupportPanel' })

const COLLAPSED_COUNT = 10

const props = defineProps<{
  list: PolicyDbSupportMeasure[]
}>()

const grade = ref('')
const currentPage = ref(1)
const pageSize = 10
const showMoreGrades = ref(false)

watch(
  () => props.list,
  () => {
    grade.value = ''
    currentPage.value = 1
    showMoreGrades.value = false
  },
)

const visibleGrades = computed(() =>
  showMoreGrades.value ? policyGrades : policyGrades.slice(0, COLLAPSED_COUNT),
)

const filteredList = computed(() =>
  filterPolicyDbSupport(props.list, grade.value),
)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return attachGradeRowSpan(filteredList.value.slice(start, start + pageSize))
})

const total = computed(() => filteredList.value.length)

const selectGrade = (value: string) => {
  grade.value = grade.value === value ? '' : value
  currentPage.value = 1
}

const columns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  {
    title: '支持等级',
    dataIndex: 'grade',
    key: 'grade',
    width: 120,
    align: 'center' as const,
    customCell: (record: PolicyDbSupportRow) => ({
      rowSpan: record.gradeSpan,
    }),
  },
  { title: '资助条件', dataIndex: 'condition', key: 'condition' },
  { title: '资助金额', dataIndex: 'amount', key: 'amount' },
  { title: '参考文件', key: 'document' },
]
</script>

<template>
  <div class="support-panel">
    <div class="filter-row">
      <span class="filter-label">选择等级：</span>
      <div class="filter-options">
        <a
          v-for="item in visibleGrades"
          :key="item"
          class="option-link"
          :class="{ active: grade === item }"
          @click="selectGrade(item)"
        >
          {{ item }}
        </a>
      </div>
      <a class="more-link" @click="showMoreGrades = !showMoreGrades">
        {{ showMoreGrades ? '收起' : '更多' }}
        <DownOutlined :class="{ rotated: showMoreGrades }" />
      </a>
    </div>

    <a-table
      class="db-table"
      bordered
      :columns="columns"
      :data-source="pagedList"
      :pagination="false"
      :row-key="(row: PolicyDbSupportRow) => row.id"
      size="middle"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (currentPage - 1) * pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'grade'">
          <span class="grade-cell">{{ record.grade }}</span>
        </template>
        <template v-else-if="column.key === 'document'">
          <a
            class="doc-link"
            :href="record.documentUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ record.document }}
          </a>
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
  </div>
</template>

<style scoped lang="scss">
.filter-row {
  display: flex;
  gap: 12px;
  font-size: 15px;
  padding: 4px 0 16px;
}

.filter-label {
  flex-shrink: 0;
  width: 88px;
  color: #8c8c8c;
  line-height: 32px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  flex: 1;
  min-width: 0;
}

.option-link {
  color: #262626;
  line-height: 32px;
  cursor: pointer;

  &.active,
  &:hover {
    color: var(--pb-primary);
  }
}

.more-link {
  flex-shrink: 0;
  align-self: flex-start;
  color: var(--pb-primary);
  line-height: 32px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  cursor: pointer;

  .anticon {
    margin-left: 2px;
    font-size: 16px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.db-table {
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  background: #fff;

  :deep(.ant-table) {
    font-size: 15px;
    background: #fff;
    overflow: hidden;
    border-radius: 12px;
  }

  :deep(.ant-table-container) {
    overflow: hidden;
    border: none !important;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 15px;
    font-weight: 600;
    border-color: #e8e8e8 !important;
    padding: 16px 18px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 15px;
    background: #fff !important;
    border-color: #e8e8e8 !important;
    vertical-align: middle;
    padding: 16px 18px !important;
  }
}

.grade-cell {
  font-weight: 600;
  color: #262626;
}

.doc-link {
  color: var(--pb-primary);

  &:hover {
    color: #4096ff;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

@media (max-width: 768px) {
  .filter-label {
    width: auto;
  }
}
</style>
