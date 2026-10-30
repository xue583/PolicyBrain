<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RightOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'
import ExportEmptyState from './ExportEmptyState.vue'
import ExportResultTable from './ExportResultTable.vue'
import ExportFilterSider, {
  type ExportFilters,
  type FilterKey,
  type FilterTab,
} from './ExportFilterSider.vue'
import BatchQueryPanel from './BatchQueryPanel.vue'
import { downloadCsv } from '@/utils/downloadCsv'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import { loadRegionOptions, type CityOption } from '@/api/meta'
import {
  buildExportJobRequest,
  createEnterpriseExportJob,
  exportEnterpriseBatch,
  fetchEnterpriseBatchPage,
  fetchEnterpriseExportJob,
  searchEnterprisesByPolicy,
  searchExportEnterprises,
  submitEnterpriseBatchQuery,
  toAdvancedQuery,
  toPolicyQuery,
  type ExportEnterpriseRow,
  type ExportFilterInput,
} from '@/api/enterpriseExport'
import { toErrorMessage } from '@/utils/apiError'
import searchIcon from '../../assets/export/search.png'
import search2Icon from '../../assets/export/search2.png'

defineOptions({ name: 'DataExport' })

type QueryMode = 'advanced' | 'batch'

const pageSize = 10
const mode = ref<QueryMode>('advanced')
const filterTab = ref<FilterTab>('basic')
const searchedTab = ref<FilterTab>('basic')
const hasSearched = ref(false)
const uploadedName = ref('')
const regions = ref<CityOption[]>([])

const filters = ref<ExportFilters>({
  keyword: '',
  policies: [],
  year: null,
  province: '河南省',
  industry: '',
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

const appliedFilters = ref<ExportFilters | null>(null)
const advancedRows = ref<ExportEnterpriseRow[]>([])
const advancedTotal = ref(0)
const advancedPage = ref(1)
const advancedLoading = ref(false)
const advancedError = ref('')
const batchRows = ref<ExportEnterpriseRow[]>([])
const batchTotal = ref(0)
const batchPage = ref(1)
const batchToken = ref('')
const batchLoading = ref(false)
const exporting = ref(false)
const pendingJobId = ref('')
let advancedSeq = 0
let batchSeq = 0

const columns: TableColumnType<ExportEnterpriseRow>[] = [
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

const snapshotFilters = (value: ExportFilters): ExportFilters => ({
  ...value,
  policies: [...value.policies],
})

const provinceIdOf = (name: string) =>
  regions.value.find((item) => item.label === name)?.id

const toFilterInput = (value: ExportFilters): ExportFilterInput => ({
  keyword: value.keyword,
  policies: value.policies,
  year: value.year,
  provinceId: provinceIdOf(value.province),
  industry: value.industry,
  ip: value.ip,
  capital: value.capital,
  age: value.age,
  economy: value.economy,
})

const resetFilters = () => {
  filters.value.keyword = ''
  filters.value.policies = []
  filters.value.year = null
  filters.value.province = '河南省'
  filters.value.industry = ''
  filters.value.ip = ''
  filters.value.capital = ''
  filters.value.age = ''
  filters.value.economy = ''
  hasSearched.value = false
  searchedTab.value = filterTab.value
  appliedFilters.value = null
  pendingJobId.value = ''
  advancedRows.value = []
  advancedTotal.value = 0
  advancedPage.value = 1
  advancedError.value = ''
  openGroups.value.province = filterTab.value === 'basic'
  openGroups.value.industry = false
  openGroups.value.ip = false
  openGroups.value.capital = false
  openGroups.value.age = false
  openGroups.value.economy = false
}

const loadAdvanced = async () => {
  const applied = appliedFilters.value
  if (!hasSearched.value || !applied) return
  const id = ++advancedSeq
  advancedLoading.value = true
  advancedError.value = ''
  const input = toFilterInput(applied)
  const policyQuery =
    searchedTab.value === 'policy' ? toPolicyQuery(input) : null
  if (searchedTab.value === 'policy' && !policyQuery) {
    advancedRows.value = []
    advancedTotal.value = 0
    advancedLoading.value = false
    return
  }
  try {
    const page = policyQuery
      ? await searchEnterprisesByPolicy(policyQuery, {
          pageIndex: advancedPage.value,
          pageSize,
        })
      : await searchExportEnterprises(toAdvancedQuery(input), {
          pageIndex: advancedPage.value,
          pageSize,
        })
    if (id !== advancedSeq) return
    advancedRows.value = page.items
    advancedTotal.value = page.totalElements
  } catch (err) {
    if (id !== advancedSeq) return
    advancedRows.value = []
    advancedTotal.value = 0
    advancedError.value = toErrorMessage(err)
  } finally {
    if (id === advancedSeq) advancedLoading.value = false
  }
}

const viewResults = () => {
  if (
    filterTab.value === 'policy' &&
    !toPolicyQuery(toFilterInput(filters.value))
  ) {
    message.warning('请输入政策名称或选择热门政策')
    return
  }
  appliedFilters.value = snapshotFilters(filters.value)
  hasSearched.value = true
  searchedTab.value = filterTab.value
  advancedPage.value = 1
  pendingJobId.value = ''
  collapseGroups()
  void loadAdvanced()
}

const onAdvancedPage = (page: number) => {
  advancedPage.value = page
  void loadAdvanced()
}

const downloadTemplate = () => {
  downloadCsv('企业批量查询模板.csv', [['企业名称'], ['示例企业有限公司']])
  message.success('模板已下载')
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const pollExportJob = async (jobId: string) => {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const job = await fetchEnterpriseExportJob(jobId)
    if (job.status === 2) {
      pendingJobId.value = ''
      if (!job.downloadUrl) throw new Error('导出完成，但未返回下载链接')
      return job.downloadUrl
    }
    if (job.status === 3) {
      pendingJobId.value = ''
      throw new Error(job.message || job.statusText || '导出失败')
    }
    if (attempt < 89) await sleep(2000)
  }
  throw new Error('导出仍在处理，请稍后再次点击导出')
}

const exportQueryFile = async () => {
  const applied = appliedFilters.value
  if (!applied) throw new Error('请先查询后再导出')
  const body = buildExportJobRequest(searchedTab.value, toFilterInput(applied))
  if (!body) throw new Error('请先查询后再导出')
  let jobId = pendingJobId.value
  if (!jobId) {
    const created = await createEnterpriseExportJob(body)
    if (!created.jobId) throw new Error('未返回导出任务号')
    jobId = created.jobId
    pendingJobId.value = jobId
  }
  return pollExportJob(jobId)
}

const exportExcel = async () => {
  if (exporting.value) return
  if (mode.value === 'batch' && !batchToken.value) {
    message.warning('请先上传企业名单')
    return
  }
  if (mode.value === 'advanced' && !advancedTotal.value) {
    message.warning('暂无可导出的数据')
    return
  }
  const popup = window.open('', '_blank')
  exporting.value = true
  const hide = message.loading('正在生成导出文件，数据较多时请稍候…', 0)
  try {
    const url =
      mode.value === 'batch'
        ? await exportEnterpriseBatch(batchToken.value)
        : await exportQueryFile()
    if (!url) throw new Error('未返回下载链接')
    if (popup && !popup.closed) {
      popup.opener = null
      popup.location.href = url
    } else {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
    message.success('导出文件已生成，下载链接约 30 分钟内有效')
  } catch (err) {
    popup?.close()
    message.error(toErrorMessage(err, '导出失败'))
  } finally {
    hide()
    exporting.value = false
  }
}

const applyBatchPage = (
  page: Awaited<ReturnType<typeof submitEnterpriseBatchQuery>>,
  fileName?: string,
) => {
  batchToken.value = page.token || batchToken.value
  batchRows.value = page.items
  batchTotal.value = page.totalElements
  batchPage.value = page.pageIndex || 1
  if (fileName) uploadedName.value = fileName
  if (!page.unmatchedNames.length) return
  const preview = page.unmatchedNames.slice(0, 3).join('、')
  const suffix =
    page.unmatchedNames.length > 3 ? `等 ${page.unmatchedNames.length} 家` : ''
  message.warning(`未匹配企业：${preview}${suffix}`)
}

const onBatchUploaded = async (file: File) => {
  const id = ++batchSeq
  batchLoading.value = true
  try {
    const page = await submitEnterpriseBatchQuery(file, {
      pageIndex: 1,
      pageSize,
    })
    if (id !== batchSeq) return
    applyBatchPage(page, file.name)
    if (page.totalElements) message.success('名单已上传，已匹配查询结果')
  } catch (err) {
    if (id !== batchSeq) return
    message.error(toErrorMessage(err, '批量查询失败'))
  } finally {
    if (id === batchSeq) batchLoading.value = false
  }
}

const onBatchPage = async (pageIndex: number) => {
  if (!batchToken.value) return
  const id = ++batchSeq
  batchPage.value = pageIndex
  batchLoading.value = true
  try {
    const page = await fetchEnterpriseBatchPage(batchToken.value, {
      pageIndex,
      pageSize,
    })
    if (id !== batchSeq) return
    applyBatchPage(page)
  } catch (err) {
    if (id !== batchSeq) return
    message.error(toErrorMessage(err, '翻页失败'))
  } finally {
    if (id === batchSeq) batchLoading.value = false
  }
}

onMounted(() => {
  void (async () => {
    try {
      regions.value = await loadRegionOptions()
    } catch {
      regions.value = []
    }
    appliedFilters.value = snapshotFilters(filters.value)
    hasSearched.value = true
    searchedTab.value = 'basic'
    await loadAdvanced()
  })()
})
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
            <a-spin :spinning="advancedLoading">
              <a-alert
                v-if="advancedError"
                type="error"
                show-icon
                :message="advancedError"
                style="margin-bottom: 16px"
              >
                <template #action>
                  <a-button size="small" @click="loadAdvanced">重试</a-button>
                </template>
              </a-alert>

              <ExportEmptyState
                v-else-if="!hasSearched && !advancedLoading"
                title="无查询结果"
                description="请选择筛选条件后点击“查看结果”"
                note="筛选符合条件的企业，支持一键导出Excel"
              />

              <ExportEmptyState
                v-else-if="hasSearched && !advancedLoading && !advancedTotal"
                title="无查询结果"
                description="未找到符合条件的企业，请调整筛选后再试"
              />

              <ExportResultTable
                v-else-if="advancedTotal"
                :columns="columns"
                :list="advancedRows"
                :total="advancedTotal"
                :current-page="advancedPage"
                :page-size="pageSize"
                :exporting="exporting"
                count-text=""
                @update:current-page="onAdvancedPage"
                @export="exportExcel"
              >
                <template #count>
                  <ResultCountBar
                    class="export-count"
                    prefix="共收录"
                    :total="advancedTotal.toLocaleString('zh-CN')"
                    unit="家企业"
                  />
                </template>
              </ExportResultTable>
            </a-spin>
          </section>
        </a-card>
      </div>

      <BatchQueryPanel
        v-else
        @download-template="downloadTemplate"
        @uploaded="onBatchUploaded"
      >
        <a-spin :spinning="batchLoading">
          <ExportEmptyState
            v-if="uploadedName && !batchLoading && !batchTotal"
            title="无查询结果"
            description="上传名单中没有匹配到企业，请检查名称后重试"
          />
          <ExportResultTable
            v-else-if="uploadedName && batchTotal"
            :columns="columns"
            :list="batchRows"
            :total="batchTotal"
            :current-page="batchPage"
            :page-size="pageSize"
            :exporting="exporting"
            count-text=""
            @update:current-page="onBatchPage"
            @export="exportExcel"
          >
            <template #count>
              <ResultCountBar
                class="export-count"
                prefix="已匹配"
                :total="batchTotal"
                unit="家企业"
              >
                <span class="file-name">（{{ uploadedName }}）</span>
              </ResultCountBar>
            </template>
          </ExportResultTable>
        </a-spin>
      </BatchQueryPanel>
    </div>
  </PageState>
</template>

<style scoped lang="scss">
.data-export {
  display: flex;
  flex-direction: column;
  gap: var(--pb-gap);
  margin-top: -150px;
}

.filter-card,
.result-card {
  border-radius: var(--pb-radius-lg);
}

.mode-row {
  display: flex;
  align-items: flex-end;
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
  appearance: none;
  user-select: none;
  background: #fff;
  border: 1px solid #d6e4ff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.06);
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover:not(.active) {
    border-color: var(--pb-primary);
  }

  &.active {
    // 背景图顶部有 12px 选中耳朵，加高后补上内边距，文字仍落在白色卡片内
    height: 110px;
    padding-top: 28px;
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
    transition: none;
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

.export-count {
  --rc-font-size: 14px;
  --rc-em-margin: 4px;
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
