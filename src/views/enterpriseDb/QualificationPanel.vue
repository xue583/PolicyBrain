<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import {
  enterpriseQualYears,
  type EnterpriseQualPersonnel,
  type EnterpriseQualReview,
  type EnterpriseQualification,
} from '../../mock/enterpriseDb'
import {
  filterEnterpriseQualifications,
  filterEnterpriseQualPersonnel,
  filterEnterpriseQualReviews,
} from '@/utils/filterPolicies'
import emptyIllustration from '../../assets/enterpriseDb/empty-illustration.png'
import exportIcon from '../../assets/enterpriseDb/export.png'
import tipsIcon from '../../assets/enterpriseDb/tips.png'

defineOptions({ name: 'EnterpriseQualificationPanel' })

type QualSubTab = 'certs' | 'personnel' | 'reviews'

const PAGE_SIZE = 10

const props = defineProps<{
  qualifications: EnterpriseQualification[]
  personnel: EnterpriseQualPersonnel[]
  reviews: EnterpriseQualReview[]
}>()

const subTab = ref<QualSubTab>('certs')
const currentPage = ref(1)
const keywordInput = ref('')
const appliedKeyword = ref('')
const filters = reactive({
  year: null as number | null,
})

const resetFilters = () => {
  filters.year = null
  keywordInput.value = ''
  appliedKeyword.value = ''
  currentPage.value = 1
}

const selectSubTab = (tab: QualSubTab) => {
  subTab.value = tab
  currentPage.value = 1
}

const selectYear = (year: number) => {
  filters.year = filters.year === year ? null : year
  currentPage.value = 1
}

const onSearch = () => {
  appliedKeyword.value = keywordInput.value
  currentPage.value = 1
}

const tabFilters = computed(() => ({
  year: filters.year,
  keyword: appliedKeyword.value,
}))

const filteredCerts = computed(() =>
  filterEnterpriseQualifications(props.qualifications, tabFilters.value),
)
const filteredPersonnel = computed(() =>
  filterEnterpriseQualPersonnel(props.personnel, tabFilters.value),
)
const filteredReviews = computed(() =>
  filterEnterpriseQualReviews(props.reviews, tabFilters.value),
)

const currentList = computed(() => {
  if (subTab.value === 'personnel') return filteredPersonnel.value
  if (subTab.value === 'reviews') return filteredReviews.value
  return filteredCerts.value
})

const total = computed(() => currentList.value.length)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return currentList.value.slice(start, start + PAGE_SIZE)
})

const certColumns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  { title: '证书类别', dataIndex: 'category', key: 'category', ellipsis: true },
  { title: '证书名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '证书编号', dataIndex: 'certNo', key: 'certNo', width: 220 },
  { title: '发证日期', dataIndex: 'issueDate', key: 'issueDate', width: 130 },
  {
    title: '发证有效期',
    dataIndex: 'validUntil',
    key: 'validUntil',
    width: 130,
  },
]

const personnelColumns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  {
    title: '人员证书编号',
    dataIndex: 'certNo',
    key: 'certNo',
    ellipsis: true,
  },
  { title: '发证日期', dataIndex: 'issueDate', key: 'issueDate', width: 130 },
  { title: '到期日期', dataIndex: 'expireDate', key: 'expireDate', width: 130 },
  { title: '证书状态', dataIndex: 'status', key: 'status', width: 120 },
  { title: '发证机构', dataIndex: 'issuer', key: 'issuer', ellipsis: true },
]

const reviewColumns = [
  { title: '序号', key: 'index', width: 72, align: 'center' as const },
  {
    title: '资质申请事项',
    dataIndex: 'matter',
    key: 'matter',
    ellipsis: true,
  },
  {
    title: '申请事项审查决定',
    dataIndex: 'decision',
    key: 'decision',
    width: 180,
  },
  {
    title: '审查决定原因',
    dataIndex: 'reason',
    key: 'reason',
    ellipsis: true,
  },
  {
    title: '审查决定公告日期',
    dataIndex: 'announceDate',
    key: 'announceDate',
    width: 180,
  },
]

const columns = computed(() => {
  if (subTab.value === 'personnel') return personnelColumns
  if (subTab.value === 'reviews') return reviewColumns
  return certColumns
})

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
  if (!currentList.value.length) {
    message.warning('暂无可导出的数据')
    return
  }

  if (subTab.value === 'personnel') {
    downloadCsv('人员信息.csv', [
      [
        '序号',
        '姓名',
        '人员证书编号',
        '发证日期',
        '到期日期',
        '证书状态',
        '发证机构',
      ],
      ...filteredPersonnel.value.map((item, index) => [
        String(index + 1),
        item.name,
        item.certNo,
        item.issueDate,
        item.expireDate,
        item.status,
        item.issuer,
      ]),
    ])
    message.success('已导出人员信息')
    return
  }

  if (subTab.value === 'reviews') {
    downloadCsv('申请审查.csv', [
      [
        '序号',
        '资质申请事项',
        '申请事项审查决定',
        '审查决定原因',
        '审查决定公告日期',
      ],
      ...filteredReviews.value.map((item, index) => [
        String(index + 1),
        item.matter,
        item.decision,
        item.reason,
        item.announceDate,
      ]),
    ])
    message.success('已导出申请/审查')
    return
  }

  downloadCsv('资质证书.csv', [
    ['序号', '证书类别', '证书名称', '证书编号', '发证日期', '发证有效期'],
    ...filteredCerts.value.map((item, index) => [
      String(index + 1),
      item.category,
      item.name,
      item.certNo,
      item.issueDate,
      item.validUntil,
    ]),
  ])
  message.success('已导出资质证书')
}
</script>

<template>
  <div class="qual-panel">
    <div class="qual-nav">
      <div class="qual-tabs">
        <a
          :class="{ active: subTab === 'certs' }"
          @click="selectSubTab('certs')"
        >
          资质证书
          <span
            class="tab-count"
            :style="{ backgroundImage: `url(${tipsIcon})` }"
          >
            {{ qualifications.length }}
          </span>
        </a>
        <a
          :class="{ active: subTab === 'personnel' }"
          @click="selectSubTab('personnel')"
        >
          人员信息
        </a>
        <a
          :class="{ active: subTab === 'reviews' }"
          @click="selectSubTab('reviews')"
        >
          申请/审查
        </a>
      </div>
      <button type="button" class="export-btn" @click="exportList">
        <img :src="exportIcon" alt="" />
        <span>导出</span>
      </button>
    </div>

    <div class="filter-row">
      <span class="filter-label">选择年份：</span>
      <div class="filter-options">
        <a
          v-for="year in enterpriseQualYears"
          :key="year"
          class="option-link"
          :class="{ active: filters.year === year }"
          @click="selectYear(year)"
        >
          {{ year }}
        </a>
      </div>
    </div>

    <div class="filter-row search-row">
      <span class="filter-label">搜索：</span>
      <a-input
        v-model:value="keywordInput"
        class="search-input"
        allow-clear
        placeholder="请输入关键词搜索"
        @press-enter="onSearch"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
      <a-button type="primary" @click="onSearch">查询</a-button>
      <a-button class="reset-btn" @click="resetFilters">重置</a-button>
    </div>

    <a-table
      class="db-table"
      bordered
      :columns="columns"
      :data-source="pagedList"
      :pagination="false"
      :row-key="(row: { id: number }) => row.id"
      size="middle"
    >
      <template #emptyText>
        <div class="table-empty">
          <img :src="emptyIllustration" alt="" />
          <p>暂无数据</p>
        </div>
      </template>
      <template #bodyCell="{ column, index }">
        <template v-if="column.key === 'index'">
          {{ (currentPage - 1) * PAGE_SIZE + index + 1 }}
        </template>
      </template>
    </a-table>

    <div v-if="total" class="pagination-wrap">
      <a-pagination
        v-model:current="currentPage"
        :total="total"
        :page-size="PAGE_SIZE"
        :show-total="(t: number) => `共 ${t} 条`"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.qual-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.qual-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  min-width: 0;

  a {
    position: relative;
    padding: 8px 2px 12px;
    color: #262626;
    font-size: 15px;
    line-height: 24px;
    cursor: pointer;

    &:hover,
    &.active {
      color: var(--pb-primary);
    }

    &.active {
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--pb-primary);
      }
    }
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 1px 5px 4px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  color: var(--pb-primary);
  font-size: 12px;
  font-weight: 600;
}

.export-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0 0 8px;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    height: 32px;
    width: 66px;
    object-fit: cover;
    object-position: left center;
  }

  span {
    display: flex;
    align-items: center;
    height: 32px;
    margin-left: -1px;
    padding: 0 16px 0 4px;
    border-radius: 0 16px 16px 0;
    background: #402626;
    color: #f8cb84;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  &:hover span,
  &:focus span {
    background: #4a2e2e;
  }
}

.filter-row {
  display: flex;
  gap: 12px;
  font-size: 15px;
  padding: 8px 0;
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
  gap: 8px 20px;
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

  &.active {
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 6px;
  }
}

.search-row {
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  min-width: 0;
}

.reset-btn {
  color: var(--pb-primary);
  border-color: var(--pb-primary);
  background: #fff;

  &:hover,
  &:focus {
    color: var(--pb-primary-hover);
    border-color: var(--pb-primary-hover);
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

  :deep(.ant-table-placeholder) {
    padding: 48px 16px !important;
  }

  :deep(.ant-empty-image) {
    display: none;
  }
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0 8px;

  img {
    width: min(280px, 100%);
    height: auto;
  }

  p {
    margin: 8px 0 0;
    color: var(--pb-primary);
    font-size: 15px;
  }
}

.pagination-wrap {
  display: flex;
  padding: 20px 0 0;

  :deep(.ant-pagination) {
    width: 100%;
    display: flex;
    align-items: center;
  }

  :deep(.ant-pagination-total-text) {
    flex: 1;
    margin-inline-end: 0;
  }
}

@media (max-width: 768px) {
  .qual-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-label {
    width: auto;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>
