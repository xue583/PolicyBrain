<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { policyGrades, type PolicyDbSupportMeasure } from '../../mock/policyDb'
import {
  attachGradeRowSpan,
  filterPolicyDbSupport,
  type PolicyDbSupportRow,
} from '@/utils/filterPolicies'
import { useFilteredList } from '@/composables/useFilteredList'
import { useCollapsedList } from '@/composables/useCollapsedList'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'

defineOptions({ name: 'PolicyDbSupportPanel' })

const COLLAPSED_COUNT = 10

const props = defineProps<{
  list: PolicyDbSupportMeasure[]
}>()

const grade = ref('')

const { showMore: showMoreGrades, visibleList: visibleGrades } =
  useCollapsedList(policyGrades, COLLAPSED_COUNT)

const filteredList = computed(() =>
  filterPolicyDbSupport(props.list, grade.value),
)

const {
  currentPage,
  pageSize,
  pagedList: pagedRaw,
  total,
  resetPage,
} = useFilteredList(filteredList)

const pagedList = computed(() => attachGradeRowSpan(pagedRaw.value))

watch(
  () => props.list,
  () => {
    grade.value = ''
    showMoreGrades.value = false
    resetPage()
  },
)

const selectGrade = (value: string) => {
  grade.value = grade.value === value ? '' : value
  resetPage()
}

const columns = [
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
    <FilterRow label="选择等级：" v-model:expanded="showMoreGrades" collapsible>
      <a
        v-for="item in visibleGrades"
        :key="item"
        class="option-link"
        :class="{ active: grade === item }"
        @click="selectGrade(item)"
      >
        {{ item }}
      </a>
    </FilterRow>

    <PagedTable
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
      :columns="columns"
      :data-source="pagedList"
      :row-key="(row: PolicyDbSupportRow) => row.id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'grade'">
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
    </PagedTable>
  </div>
</template>

<style scoped lang="scss">
.support-panel {
  --pagination-padding: 20px 0 4px;
}

.filter-row {
  --filter-font-size: 15px;
  --filter-row-padding: 4px 0 16px;
  --filter-row-border: none;
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

@media (max-width: 768px) {
  :deep(.filter-label) {
    width: auto;
  }
}
</style>
