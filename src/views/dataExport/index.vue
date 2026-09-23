<script setup lang="ts">
import { computed, ref } from 'vue'
import { RightOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'
import {
  electronicsIndustry,
  exportEnterpriseTotal,
  mockExportEnterprises,
  type ExportEnterprise,
} from '../../mock/dataExport'
import ExportEmptyState from './ExportEmptyState.vue'
import ExportResultTable from './ExportResultTable.vue'
import ExportFilterSider, {
  type ExportFilters,
  type FilterKey,
  type FilterTab,
} from './ExportFilterSider.vue'
import BatchQueryPanel from './BatchQueryPanel.vue'
import { useFilteredList } from '@/composables/useFilteredList'
import { downloadCsv } from '@/utils/downloadCsv'
import searchIcon from '../../assets/export/search.png'
import search2Icon from '../../assets/export/search2.png'

defineOptions({ name: 'DataExport' })

type QueryMode = 'advanced' | 'batch'

const mode = ref<QueryMode>('advanced')
const filterTab = ref<FilterTab>('basic')
const searchedTab = ref<FilterTab>('basic')
const hasSearched = ref(true)
const uploadedName = ref('')

const filters = ref<ExportFilters>({
  keyword: '',
  policies: [],
  year: 2026,
  province: '河南省',
  industry: electronicsIndustry,
  ip: '',
  capital: '',
  age: '',
  economy: '',
})

const openGroups = ref<Record<FilterKey | 'province', boolean>>({
  province: false,
  industry: false,
  ip: false,
  capital: false,
  age: false,
  economy: false,
})

const filteredList = computed(() => {
  const current = filters.value
  return mockExportEnterprises.filter((item) => {
    const kw = current.keyword.trim()
    if (kw && !item.name.includes(kw) && !item.address.includes(kw))
      return false

    if (searchedTab.value === 'policy') {
      if (current.year && item.year !== current.year) return false
      if (
        current.policies.length &&
        !current.policies.some((p) => item.policies.includes(p))
      ) {
        return false
      }
      return true
    }

    if (current.province && item.province !== current.province) return false
    if (current.industry && item.industry !== current.industry) return false
    if (current.ip && !item.ipTypes.includes(current.ip)) return false
    if (current.capital && item.capitalRange !== current.capital) return false
    if (current.age && item.ageRange !== current.age) return false
    if (current.economy && item.economyType !== current.economy) return false
    return true
  })
})

const displayList = computed(() =>
  hasSearched.value ? filteredList.value : [],
)

const { currentPage, pageSize, pagedList, total, resetPage } =
  useFilteredList(displayList)

const columns: TableColumnType<ExportEnterprise>[] = [
  {
    title: '序号',
    key: 'index',
    width: 72,
    align: 'center',
  },
  { title: '企业名称', dataIndex: 'name', key: 'name' },
  { title: '注册地址', dataIndex: 'address', key: 'address' },
  { title: '所属行业', dataIndex: 'industry', key: 'industry' },
  {
    title: '已获政策数量',
    dataIndex: 'policyCount',
    key: 'policyCount',
    width: 140,
    align: 'center',
  },
]

const collapseGroups = () => {
  openGroups.value.province = false
  openGroups.value.industry = false
  openGroups.value.ip = false
  openGroups.value.capital = false
  openGroups.value.age = false
  openGroups.value.economy = false
}

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.policies = []
  filters.value.year = 2026
  filters.value.province = '河南省'
  filters.value.industry = ''
  filters.value.ip = ''
  filters.value.capital = ''
  filters.value.age = ''
  filters.value.economy = ''
  hasSearched.value = false
  searchedTab.value = filterTab.value
  resetPage()
  openGroups.value.province = filterTab.value === 'basic'
  openGroups.value.industry = false
  openGroups.value.ip = false
  openGroups.value.capital = false
  openGroups.value.age = false
  openGroups.value.economy = false
}

const viewResults = () => {
  hasSearched.value = true
  searchedTab.value = filterTab.value
  resetPage()
  collapseGroups()
}

const downloadTemplate = () => {
  downloadCsv('企业批量查询模板.csv', [['企业名称'], ['示例企业有限公司']])
  message.success('模板已下载')
}

const exportExcel = () => {
  if (!displayList.value.length) {
    message.warning('暂无可导出的数据')
    return
  }
  const rows = [
    ['序号', '企业名称', '注册地址', '所属行业', '已获政策数量'],
    ...displayList.value.map((item, index) => [
      String(index + 1),
      item.name,
      item.address,
      item.industry,
      String(item.policyCount),
    ]),
  ]
  downloadCsv('企业数据导出.csv', rows)
  message.success('已导出 Excel 文件')
}

const onBatchUploaded = (name: string) => {
  uploadedName.value = name
  hasSearched.value = true
  resetPage()
}
</script>

<template>
  <PageState>
    <div class="data-export">
      <div class="mode-row">
        <button
          type="button"
          class="mode-card"
          :class="{ active: mode === 'advanced' }"
          @click="mode = 'advanced'"
        >
          <span class="mode-icon search">
            <img :src="search2Icon" alt="" />
          </span>
          <span class="mode-copy">
            <span class="mode-title">
              高级搜索
              <RightOutlined />
            </span>
            <span class="mode-desc">选择条件，热门政策</span>
          </span>
        </button>

        <button
          type="button"
          class="mode-card"
          :class="{ active: mode === 'batch' }"
          @click="mode = 'batch'"
        >
          <span class="mode-icon upload">
            <img :src="searchIcon" alt="" />
          </span>
          <span class="mode-copy">
            <span class="mode-title">
              批量查询
              <RightOutlined />
            </span>
            <span class="mode-desc">模版填入，上传查询</span>
          </span>
        </button>
      </div>

      <div v-if="mode === 'advanced'" class="workspace">
        <a-card class="filter-card" :bordered="false">
          <ExportFilterSider
            v-model:filters="filters"
            v-model:filter-tab="filterTab"
            v-model:open-groups="openGroups"
            @reset="resetFilters"
            @view="viewResults"
          />
        </a-card>

        <a-card class="result-card" :bordered="false">
          <section class="result-pane">
            <ExportEmptyState
              v-if="!hasSearched"
              title="无查询结果"
              description="请选择筛选条件后点击“查看结果”"
              note="筛选符合条件的郑州企业，支持一键导出Excel"
            />

            <ExportEmptyState
              v-else-if="!total"
              title="无查询结果"
              description="未找到符合条件的企业，请调整筛选后再试"
            />

            <ExportResultTable
              v-else
              :columns="columns"
              :list="pagedList"
              :total="total"
              :current-page="currentPage"
              :page-size="pageSize"
              count-text=""
              @update:current-page="currentPage = $event"
              @export="exportExcel"
            >
              <template #count>
                <span class="result-count">
                  共收录
                  <em>{{ exportEnterpriseTotal.toLocaleString('zh-CN') }}</em>
                  家企业
                </span>
              </template>
            </ExportResultTable>
          </section>
        </a-card>
      </div>

      <BatchQueryPanel
        v-else
        @download-template="downloadTemplate"
        @uploaded="onBatchUploaded"
      >
        <ExportResultTable
          v-if="uploadedName"
          :columns="columns"
          :list="pagedList"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          count-text=""
          @update:current-page="currentPage = $event"
          @export="exportExcel"
        >
          <template #count>
            <span class="result-count">
              已匹配 <em>{{ total }}</em> 家企业
              <span class="file-name">（{{ uploadedName }}）</span>
            </span>
          </template>
        </ExportResultTable>
      </BatchQueryPanel>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.data-export {
  display: flex;
  flex-direction: column;
  gap: var(--pb-gap);
  margin-top: -130px;
}

.filter-card,
.result-card {
  border-radius: var(--pb-radius-lg);
}

.mode-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 236px;
  height: 98px;
  padding: 16px 24px;
  text-align: left;
  background: #fff;
  border: 1px solid #d6e4ff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.06);
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;

  &:hover:not(.active) {
    border-color: var(--pb-primary);
  }

  &.active {
    border-color: transparent;
    border-radius: 0;
    background-color: transparent;
    background-image: url('../../assets/export/bottom.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    background-origin: border-box;
    background-clip: border-box;
    box-shadow: none;
  }
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.mode-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mode-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--pb-primary);

  .anticon {
    font-size: 12px;
  }
}

.mode-desc {
  font-size: 13px;
  color: #0e5dd8;
}

.workspace {
  display: grid;
  grid-template-columns: 30% minmax(0, 1fr);
  gap: var(--pb-gap);
  min-height: 560px;
  align-items: stretch;
}

.result-pane {
  min-width: 0;
}

.result-count {
  font-size: 14px;
  color: #595959;

  em {
    margin: 0 4px;
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
  }
}

.file-name {
  color: #8c8c8c;
}

@include below-lg {
  .mode-row {
    flex-wrap: wrap;
  }

  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
