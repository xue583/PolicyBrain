<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { policyGrades, type PolicyDbSupportMeasure } from '../../mock/policyDb'
import {
  attachGradeRowSpan,
  filterPolicyDbSupport,
  type PolicyDbSupportRow,
} from '@/utils/filterPolicies'
import { useFilteredList } from '@/composables/useFilteredList'

defineOptions({ name: 'PolicyDbSupportPanel' })

const COLLAPSED_COUNT = 10

const props = defineProps<{
  list: PolicyDbSupportMeasure[]
}>()

const grade = ref('')
const showMoreGrades = ref(false)

const visibleGrades = computed(() =>
  showMoreGrades.value ? policyGrades : policyGrades.slice(0, COLLAPSED_COUNT),
)

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
  .filter-label {
    width: auto;
  }
}
</style>
