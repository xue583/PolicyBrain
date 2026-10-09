<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  policyDbUpdateStatuses,
  policyDbYears,
  policyGrades,
  type PolicyDbUpdate,
  type PolicyDbUpdateStatus,
} from '../../mock/policyDb'
import { filterPolicyDbUpdates } from '@/utils/filterPolicies'
import { useFilteredList } from '@/composables/useFilteredList'
import { useCollapsedList } from '@/composables/useCollapsedList'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import SearchRow from '@/components/common/SearchRow.vue'

defineOptions({ name: 'PolicyDbUpdatesPanel' })

const COLLAPSED_COUNT = 10

const props = defineProps<{
  updates: PolicyDbUpdate[]
}>()

const appliedKeyword = ref('')
const contactOpen = ref(false)
const contactUpdate = ref<PolicyDbUpdate | null>(null)
const searchRowRef = ref<InstanceType<typeof SearchRow>>()

const filters = reactive({
  grade: '',
  years: [] as number[],
  statuses: [] as PolicyDbUpdateStatus[],
})

const { showMore: showMoreGrades, visibleList: visibleGrades } =
  useCollapsedList(policyGrades, COLLAPSED_COUNT)

const filteredSource = computed(() =>
  filterPolicyDbUpdates(props.updates, {
    grade: filters.grade,
    years: filters.years,
    statuses: filters.statuses,
    keyword: appliedKeyword.value,
  }),
)

const { currentPage, pageSize, pagedList, total, resetPage } =
  useFilteredList(filteredSource)

const resetFilters = () => {
  filters.grade = ''
  filters.years = []
  filters.statuses = []
  appliedKeyword.value = ''
  searchRowRef.value?.clearKeyword()
  showMoreGrades.value = false
  resetPage()
}

const selectGrade = (grade: string) => {
  filters.grade = filters.grade === grade ? '' : grade
  resetPage()
}

const toggleYear = (year: number) => {
  const index = filters.years.indexOf(year)
  if (index >= 0) filters.years.splice(index, 1)
  else filters.years.push(year)
  resetPage()
}

const toggleStatus = (status: PolicyDbUpdateStatus) => {
  const index = filters.statuses.indexOf(status)
  if (index >= 0) filters.statuses.splice(index, 1)
  else filters.statuses.push(status)
  resetPage()
}

const onSearch = (keyword: string) => {
  appliedKeyword.value = keyword
  resetPage()
}

const openContact = (record: unknown) => {
  contactUpdate.value = record as PolicyDbUpdate
  contactOpen.value = true
}

const columns = [
  { title: '标题', key: 'title', ellipsis: true },
  { title: '政策级别', dataIndex: 'grade', key: 'grade', width: 140 },
  { title: '发布单位', dataIndex: 'department', key: 'department', width: 150 },
  { title: '发布日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '截止日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
  { title: '剩余天数', key: 'remain', width: 110 },
  { title: '联系方式', key: 'contact', width: 110 },
]
</script>

<template>
  <div class="update-filters">
    <FilterRow label="选择等级：" v-model:expanded="showMoreGrades" collapsible>
      <a
        v-for="grade in visibleGrades"
        :key="grade"
        class="option-link"
        :class="{ active: filters.grade === grade }"
        @click="selectGrade(grade)"
      >
        {{ grade }}
      </a>
    </FilterRow>

    <FilterRow label="选择年份：">
      <a
        v-for="year in policyDbYears"
        :key="year"
        class="option-link"
        :class="{ active: filters.years.includes(year) }"
        @click="toggleYear(year)"
      >
        {{ year }}
      </a>
    </FilterRow>

    <FilterRow label="政策状态：">
      <a
        v-for="item in policyDbUpdateStatuses"
        :key="item.value"
        class="option-link"
        :class="{ active: filters.statuses.includes(item.value) }"
        @click="toggleStatus(item.value)"
      >
        {{ item.label }}
      </a>
    </FilterRow>

    <div class="filter-row search-row">
      <span class="filter-label">原文标题：</span>
      <SearchRow ref="searchRowRef" @search="onSearch" @reset="resetFilters" />
    </div>
  </div>

  <PagedTable
    v-model:current="currentPage"
    class="updates-table"
    :total="total"
    :page-size="pageSize"
    :columns="columns"
    :data-source="pagedList"
    :row-key="(row: PolicyDbUpdate) => row.id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'title'">
        <router-link
          class="update-title"
          :to="{
            name: 'news-detail',
            params: { id: String(record.newsId) },
          }"
        >
          {{ record.title }}
        </router-link>
      </template>
      <template v-else-if="column.key === 'remain'">
        <span v-if="record.expired" class="expired-text">已过期</span>
        <span v-else>{{ record.daysRemaining }}</span>
      </template>
      <template v-else-if="column.key === 'contact'">
        <a class="contact-link" @click="openContact(record)">点击查看</a>
      </template>
    </template>
  </PagedTable>

  <a-modal
    v-model:open="contactOpen"
    title="联系方式"
    :footer="null"
    destroy-on-close
  >
    <div v-if="contactUpdate" class="contact-modal">
      <p>
        <span>发布单位：</span>
        {{ contactUpdate.department }}
      </p>
      <p>
        <span>联系电话：</span>
        {{ contactUpdate.phone }}
      </p>
    </div>
  </a-modal>
</template>

<style scoped lang="scss">
.update-filters {
  margin-bottom: 16px;
  --filter-font-size: 15px;
  --filter-row-padding: 8px 0;
}

.updates-table {
  --pagination-padding: 20px 0 4px;
}

.search-row {
  align-items: center;
  padding-top: 12px;
}

.update-title,
.contact-link {
  color: var(--pb-primary);
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }
}

.expired-text {
  color: #ff4d4f;
}

.contact-modal {
  p {
    margin: 0 0 12px;
    font-size: 15px;
    color: #262626;

    span {
      color: #8c8c8c;
    }
  }
}

@media (max-width: 768px) {
  :deep(.filter-label) {
    width: auto;
  }

  .search-row {
    --search-input-width: 100%;
  }
}
</style>
