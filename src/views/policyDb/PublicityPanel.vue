<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  DownOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import {
  policyDbYears,
  publicityAddresses,
  publicityCategories,
  publicityObtainedPolicies,
  type PolicyDbPublicity,
  type PolicyDbPublicityCategory,
} from '../../mock/policyDb'
import { filterPolicyDbPublicity } from '@/utils/filterPolicies'
import titleStyleBg from '../../assets/home/title-style.png'

defineOptions({ name: 'PolicyDbPublicityPanel' })

const COLLAPSED_COUNT = 8

const props = defineProps<{
  list: PolicyDbPublicity[]
  regionLabel: string
}>()

const category = ref<PolicyDbPublicityCategory>('approved')
const currentPage = ref(1)
const pageSize = 10
const showMoreAddresses = ref(false)
const showMorePolicies = ref(false)
const keywordInput = ref('')
const appliedKeyword = ref('')

const filters = reactive({
  district: '',
  years: [] as number[],
  obtainedPolicy: '',
})

const resetFilters = () => {
  filters.district = ''
  filters.years = []
  filters.obtainedPolicy = ''
  keywordInput.value = ''
  appliedKeyword.value = ''
  currentPage.value = 1
  showMoreAddresses.value = false
  showMorePolicies.value = false
}

watch(
  () => props.list,
  () => {
    category.value = 'approved'
    resetFilters()
  },
)

const categoryList = computed(() =>
  props.list.filter((item) => item.category === category.value),
)

const addressOptions = computed(() => {
  const counts = new Map<string, number>()
  counts.set('郑州市', categoryList.value.length)
  for (const item of categoryList.value) {
    counts.set(item.district, (counts.get(item.district) ?? 0) + 1)
  }
  const options = publicityAddresses.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
  return showMoreAddresses.value ? options : options.slice(0, COLLAPSED_COUNT)
})

const policyOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const item of categoryList.value) {
    counts.set(item.obtainedPolicy, (counts.get(item.obtainedPolicy) ?? 0) + 1)
  }
  const options = publicityObtainedPolicies.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
  return showMorePolicies.value ? options : options.slice(0, 5)
})

const filteredList = computed(() =>
  filterPolicyDbPublicity(props.list, {
    category: category.value,
    district: filters.district,
    years: filters.years,
    obtainedPolicy: filters.obtainedPolicy,
    keyword: appliedKeyword.value,
  }),
)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

const selectCategory = (value: PolicyDbPublicityCategory) => {
  category.value = value
  currentPage.value = 1
}

const selectDistrict = (district: string) => {
  filters.district = filters.district === district ? '' : district
  currentPage.value = 1
}

const toggleYear = (year: number) => {
  const index = filters.years.indexOf(year)
  if (index >= 0) filters.years.splice(index, 1)
  else filters.years.push(year)
  currentPage.value = 1
}

const selectPolicy = (value: string) => {
  filters.obtainedPolicy = filters.obtainedPolicy === value ? '' : value
  currentPage.value = 1
}

const onSearch = () => {
  appliedKeyword.value = keywordInput.value
  currentPage.value = 1
}

const formatAmount = (amount: number | null) =>
  amount == null ? '—' : amount.toFixed(3)

const downloadCsv = (filename: string, rows: string[][]) => {
  const bom = '\uFEFF'
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

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
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
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
      <div class="filter-row">
        <span class="filter-label">注册地址：</span>
        <div class="filter-options">
          <a
            v-for="item in addressOptions"
            :key="item.label"
            class="option-link"
            :class="{ active: filters.district === item.label }"
            @click="selectDistrict(item.label)"
          >
            {{ item.label }} ({{ item.count }})
          </a>
        </div>
        <a class="more-link" @click="showMoreAddresses = !showMoreAddresses">
          {{ showMoreAddresses ? '收起' : '更多' }}
          <DownOutlined :class="{ rotated: showMoreAddresses }" />
        </a>
      </div>

      <div class="filter-row">
        <span class="filter-label">选择年份：</span>
        <div class="filter-options">
          <a
            v-for="year in policyDbYears"
            :key="year"
            class="option-link"
            :class="{ active: filters.years.includes(year) }"
            @click="toggleYear(year)"
          >
            {{ year }}
          </a>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">已获政策：</span>
        <div class="filter-options">
          <a
            v-for="item in policyOptions"
            :key="item.label"
            class="option-link"
            :class="{ active: filters.obtainedPolicy === item.label }"
            @click="selectPolicy(item.label)"
          >
            {{ item.label }}
          </a>
        </div>
        <a class="more-link" @click="showMorePolicies = !showMorePolicies">
          {{ showMorePolicies ? '收起' : '更多' }}
          <DownOutlined :class="{ rotated: showMorePolicies }" />
        </a>
      </div>

      <div class="filter-row search-row">
        <span class="filter-label">原文标题：</span>
        <a-input
          v-model:value="keywordInput"
          class="search-input"
          allow-clear
          placeholder="请输入内容"
          @press-enter="onSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="onSearch">查询</a-button>
        <a-button @click="resetFilters">重置</a-button>
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

    <a-table
      class="db-table"
      bordered
      :columns="columns"
      :data-source="pagedList"
      :pagination="false"
      :row-key="(row: PolicyDbPublicity) => row.id"
      size="middle"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ (currentPage - 1) * pageSize + index + 1 }}
        </template>
        <template v-else-if="column.key === 'amount'">
          {{ formatAmount(record.amount as number | null) }}
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
}

.filter-row {
  display: flex;
  gap: 12px;
  font-size: 15px;
  padding: 8px 0;
  border-bottom: 1px dashed #ebebeb;

  &:last-child {
    border-bottom: none;
  }
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

.search-row {
  align-items: center;
  padding-top: 12px;
}

.search-input {
  width: 320px;
  max-width: 100%;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 4px;
}

@media (max-width: 768px) {
  .category-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-label {
    width: auto;
  }

  .search-input {
    width: 100%;
  }
}
</style>
