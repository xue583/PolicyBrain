<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
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
import { useFilteredList } from '@/composables/useFilteredList'
import { downloadCsv } from '@/utils/downloadCsv'
import EmptyState from '@/components/common/EmptyState.vue'
import FilterRow from '@/components/common/FilterRow.vue'
import PagedTable from '@/components/common/PagedTable.vue'
import SearchRow from '@/components/common/SearchRow.vue'
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
const appliedKeyword = ref('')
const filters = reactive({
  year: null as number | null,
})
const searchRowRef = ref<InstanceType<typeof SearchRow>>()

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

const currentList = computed<{ id: number }[]>(() => {
  if (subTab.value === 'personnel') return filteredPersonnel.value
  if (subTab.value === 'reviews') return filteredReviews.value
  return filteredCerts.value
})

const { currentPage, pagedList, total, resetPage, pageSize } = useFilteredList(
  currentList,
  { pageSize: PAGE_SIZE },
)

const resetFilters = () => {
  filters.year = null
  appliedKeyword.value = ''
  searchRowRef.value?.clearKeyword()
  resetPage()
}

const selectSubTab = (tab: QualSubTab) => {
  subTab.value = tab
  resetPage()
}

const selectYear = (year: number) => {
  filters.year = filters.year === year ? null : year
  resetPage()
}

const onSearch = (keyword: string) => {
  appliedKeyword.value = keyword
  resetPage()
}

const certColumns = [
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

    <FilterRow label="选择年份：">
      <a
        v-for="year in enterpriseQualYears"
        :key="year"
        class="option-link"
        :class="{ active: filters.year === year }"
        @click="selectYear(year)"
      >
        {{ year }}
      </a>
    </FilterRow>

    <div class="filter-row search-row">
      <span class="filter-label">搜索：</span>
      <SearchRow
        ref="searchRowRef"
        placeholder="请输入关键词搜索"
        @search="onSearch"
        @reset="resetFilters"
      />
    </div>

    <PagedTable
      v-model:current="currentPage"
      :show-pagination="total > 0"
      :total="total"
      :page-size="pageSize"
      :columns="columns"
      :data-source="pagedList"
      :row-key="(row: { id: number }) => row.id"
    >
      <template #emptyText>
        <EmptyState
          class="qual-empty"
          :image="emptyIllustration"
          :image-width="280"
        />
      </template>
    </PagedTable>
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

.qual-panel {
  --pagination-padding: 20px 0 0;

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

.filter-row {
  --filter-font-size: 15px;
  --filter-row-padding: 8px 0;
  --filter-row-border: none;
  --filter-options-gap: 8px 20px;
}

.option-link.active {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.search-row {
  align-items: center;
  margin-bottom: 16px;
  --search-input-width: auto;

  :deep(.search-input) {
    flex: 1;
    min-width: 0;
  }

  :deep(.search-reset) {
    color: var(--pb-primary);
    border-color: var(--pb-primary);
    background: #fff;

    &:hover,
    &:focus {
      color: var(--pb-primary-hover);
      border-color: var(--pb-primary-hover);
    }
  }
}

:deep(.ant-table-placeholder) {
  padding: 48px 16px !important;
}

:deep(.ant-empty-image) {
  display: none;
}

.qual-empty {
  --empty-gap: 8px;
  --empty-padding: 12px 0 8px;
  --empty-text-size: 15px;
  --empty-text-weight: 400;
}

@media (max-width: 768px) {
  .qual-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  :deep(.filter-label) {
    width: auto;
  }

  .search-row {
    flex-wrap: wrap;

    :deep(.search-input) {
      flex: 1 1 100%;
      max-width: 100%;
    }
  }
}
</style>
