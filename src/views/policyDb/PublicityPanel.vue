<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'
import {
  policyDbYears,
  publicityAddresses,
  publicityCategories,
  publicityObtainedPolicies,
  type PolicyDbPublicity,
  type PolicyDbPublicityCategory,
} from '../../mock/policyDb'
import { filterPolicyDbPublicity } from '@/utils/filterPolicies'
import { useFilteredList } from '@/composables/useFilteredList'
import { useCollapsedList } from '@/composables/useCollapsedList'
import { downloadCsv } from '@/utils/downloadCsv'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import SearchRow from '@/components/common/SearchRow.vue'
import titleStyleBg from '../../assets/home/title-style.png'

defineOptions({ name: 'PolicyDbPublicityPanel' })

const COLLAPSED_COUNT = 8

const props = defineProps<{
  list: PolicyDbPublicity[]
  regionLabel: string
}>()

const category = ref<PolicyDbPublicityCategory>('approved')
const appliedKeyword = ref('')
const searchRowRef = ref<InstanceType<typeof SearchRow>>()

const filters = reactive({
  district: '',
  years: [] as number[],
  obtainedPolicy: '',
})

const addressOptionsAll = computed(() => {
  const counts = new Map<string, number>()
  counts.set('郑州市', categoryList.value.length)
  for (const item of categoryList.value) {
    counts.set(item.district, (counts.get(item.district) ?? 0) + 1)
  }
  return publicityAddresses.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
})

const policyOptionsAll = computed(() => {
  const counts = new Map<string, number>()
  for (const item of categoryList.value) {
    counts.set(item.obtainedPolicy, (counts.get(item.obtainedPolicy) ?? 0) + 1)
  }
  return publicityObtainedPolicies.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
})

const { showMore: showMoreAddresses, visibleList: addressOptions } =
  useCollapsedList(addressOptionsAll, COLLAPSED_COUNT)
const { showMore: showMorePolicies, visibleList: policyOptions } =
  useCollapsedList(policyOptionsAll, 5)

const categoryList = computed(() =>
  props.list.filter((item) => item.category === category.value),
)

const filteredList = computed(() =>
  filterPolicyDbPublicity(props.list, {
    category: category.value,
    district: filters.district,
    years: filters.years,
    obtainedPolicy: filters.obtainedPolicy,
    keyword: appliedKeyword.value,
  }),
)

const { currentPage, pageSize, pagedList, total, resetPage } =
  useFilteredList(filteredList)

const resetFilters = () => {
  filters.district = ''
  filters.years = []
  filters.obtainedPolicy = ''
  appliedKeyword.value = ''
  searchRowRef.value?.clearKeyword()
  showMoreAddresses.value = false
  showMorePolicies.value = false
  resetPage()
}

watch(
  () => props.list,
  () => {
    category.value = 'approved'
    resetFilters()
  },
)

const selectCategory = (value: PolicyDbPublicityCategory) => {
  category.value = value
  resetPage()
}

const selectDistrict = (district: string) => {
  filters.district = filters.district === district ? '' : district
  resetPage()
}

const toggleYear = (year: number) => {
  const index = filters.years.indexOf(year)
  if (index >= 0) filters.years.splice(index, 1)
  else filters.years.push(year)
  resetPage()
}

const selectPolicy = (value: string) => {
  filters.obtainedPolicy = filters.obtainedPolicy === value ? '' : value
  resetPage()
}

const onSearch = (keyword: string) => {
  appliedKeyword.value = keyword
  resetPage()
}

const formatAmount = (amount: number | null) =>
  amount == null ? '—' : amount.toFixed(3)

const exportList = () => {
  if (!filteredList.value.length) {
    message.warning('暂无可导出的数据')
    return
  }
  const rows = [
    ['序号', '企业名称', '所在区域', '所属行业', '支持金额', '年度'],
    ...filteredList.value.map((item, index) => [
      String(index + 1),
      item.name,
      item.region,
      item.industry,
      formatAmount(item.amount),
      String(item.year),
    ]),
  ]
  downloadCsv('公示名单.csv', rows)
  message.success('已导出公示名单')
}

const columns = [
  { title: '企业名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '所在区域', dataIndex: 'region', key: 'region', ellipsis: true },
  { title: '所属行业', dataIndex: 'industry', key: 'industry', width: 120 },
  { title: '支持金额', key: 'amount', width: 120 },
  { title: '年度', dataIndex: 'year', key: 'year', width: 90 },
]
</script>

<template>
  <div class="publicity-panel">
    <div class="category-row">
      <div class="category-links">
        <a
          v-for="item in publicityCategories"
          :key="item.value"
          :class="{ active: category === item.value }"
          @click="selectCategory(item.value)"
        >
          {{ item.label }}
        </a>
      </div>
      <a-button class="export-btn" @click="exportList">
        <template #icon><FileTextOutlined /></template>
        导出
      </a-button>
    </div>

    <div class="filter-box">
      <FilterRow
        label="注册地址："
        v-model:expanded="showMoreAddresses"
        collapsible
      >
        <a
          v-for="item in addressOptions"
          :key="item.label"
          class="option-link"
          :class="{ active: filters.district === item.label }"
          @click="selectDistrict(item.label)"
        >
          {{ item.label }} ({{ item.count }})
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

      <FilterRow
        label="已获政策："
        v-model:expanded="showMorePolicies"
        collapsible
      >
        <a
          v-for="item in policyOptions"
          :key="item.label"
          class="option-link"
          :class="{ active: filters.obtainedPolicy === item.label }"
          @click="selectPolicy(item.label)"
        >
          {{ item.label }}
        </a>
      </FilterRow>

      <div class="filter-row search-row">
        <span class="filter-label">原文标题：</span>
        <SearchRow
          ref="searchRowRef"
          @search="onSearch"
          @reset="resetFilters"
        />
      </div>
    </div>

    <div class="summary-bar">
      <span
        class="result-count"
        :style="{ '--result-count-bg': `url(${titleStyleBg})` }"
        >共找到 {{ total }} 条公示名单</span
      >
      <span class="current-region">当前区域：{{ regionLabel }}</span>
    </div>

    <PagedTable
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
      :columns="columns"
      :data-source="pagedList"
      :row-key="(row: PolicyDbPublicity) => row.id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'amount'">
          {{ formatAmount(record.amount as number | null) }}
        </template>
      </template>
    </PagedTable>
  </div>
</template>

<style scoped lang="scss">
.publicity-panel {
  --pagination-padding: 20px 0 4px;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.category-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  min-width: 0;

  a {
    color: #262626;
    font-size: 15px;
    line-height: 32px;
    cursor: pointer;

    &.active,
    &:hover {
      color: var(--pb-primary);
    }
  }
}

.export-btn {
  flex-shrink: 0;
  color: #fff;
  background: #c1963c;
  border-color: #c1963c;

  &:hover,
  &:focus {
    color: #fff;
    background: #d4a84a;
    border-color: #d4a84a;
  }
}

.filter-box {
  padding: 4px 16px 8px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: #f7f8fa;
  --filter-font-size: 15px;
  --filter-row-padding: 8px 0;
  --filter-row-border: 1px dashed #ebebeb;
}

.search-row {
  align-items: center;
  padding-top: 12px;
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.result-count {
  display: inline-block;
  padding-left: 20px;
  font-size: 15px;
  line-height: 26px;
  color: #343434;
  background: var(--result-count-bg) no-repeat left center;
  background-size: 94px 26px;
}

.current-region {
  color: #8c8c8c;
  font-size: 14px;
}

@media (max-width: 768px) {
  .category-row {
    align-items: flex-start;
    flex-direction: column;
  }

  :deep(.filter-label) {
    width: auto;
  }

  .search-row {
    --search-input-width: 100%;
  }
}
</style>
