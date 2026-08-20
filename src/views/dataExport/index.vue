<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  CloudUploadOutlined,
  DownloadOutlined,
  DownOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType, UploadProps } from 'ant-design-vue'
import {
  ageOptions,
  capitalOptions,
  economyOptions,
  exportEnterpriseTotal,
  exportIndustries,
  hotPolicies,
  ipOptions,
  mockExportEnterprises,
  policyYears,
  provinces,
  type ExportEnterprise,
} from '../../mock/dataExport'
import ExportEmptyState from './ExportEmptyState.vue'
import ExportResultTable from './ExportResultTable.vue'

defineOptions({ name: 'DataExport' })

type QueryMode = 'advanced' | 'batch'
type FilterTab = 'policy' | 'basic'
type FilterKey = 'industry' | 'ip' | 'capital' | 'age' | 'economy'

const mode = ref<QueryMode>('advanced')
const filterTab = ref<FilterTab>('policy')
const hasSearched = ref(false)
const currentPage = ref(1)
const pageSize = 10
const batchStep = ref(2)
const uploadedName = ref('')

const filters = reactive({
  keyword: '',
  policies: [] as string[],
  year: 2026 as number | null,
  province: '河南省',
  industry: '',
  ip: '',
  capital: '',
  age: '',
  economy: '',
})

const openGroups = reactive<Record<FilterKey | 'province', boolean>>({
  province: true,
  industry: false,
  ip: false,
  capital: false,
  age: false,
  economy: false,
})

const groupMeta: { key: FilterKey; label: string; options: string[] }[] = [
  { key: 'industry', label: '所属行业', options: exportIndustries },
  { key: 'ip', label: '知识产权', options: ipOptions },
  { key: 'capital', label: '注册资本', options: capitalOptions },
  { key: 'age', label: '成立年限', options: ageOptions },
  { key: 'economy', label: '经济类型', options: economyOptions },
]

const filteredList = computed(() => {
  return mockExportEnterprises.filter((item) => {
    const kw = filters.keyword.trim()
    if (kw && !item.name.includes(kw) && !item.address.includes(kw))
      return false
    if (filters.year && item.year !== filters.year) return false
    if (
      filters.policies.length &&
      !filters.policies.some((p) => item.policies.includes(p))
    ) {
      return false
    }
    if (filters.province && item.province !== filters.province) return false
    if (filters.industry && item.industry !== filters.industry) return false
    if (filters.ip && !item.ipTypes.includes(filters.ip)) return false
    if (filters.capital && item.capitalRange !== filters.capital) return false
    if (filters.age && item.ageRange !== filters.age) return false
    if (filters.economy && item.economyType !== filters.economy) return false
    return true
  })
})

const displayList = computed(() =>
  hasSearched.value ? filteredList.value : [],
)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return displayList.value.slice(start, start + pageSize)
})

const total = computed(() => displayList.value.length)

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

const toggleTag = (list: string[], value: string) => {
  const index = list.indexOf(value)
  if (index >= 0) list.splice(index, 1)
  else list.push(value)
}

const togglePolicy = (name: string) => {
  toggleTag(filters.policies, name)
}

const selectYear = (year: number) => {
  filters.year = filters.year === year ? null : year
}

const selectProvince = (name: string) => {
  filters.province = filters.province === name ? '' : name
}

const selectOption = (key: FilterKey, value: string) => {
  filters[key] = filters[key] === value ? '' : value
}

const toggleGroup = (key: FilterKey | 'province') => {
  openGroups[key] = !openGroups[key]
}

const resetFilters = () => {
  filters.keyword = ''
  filters.policies = []
  filters.year = 2026
  filters.province = '河南省'
  filters.industry = ''
  filters.ip = ''
  filters.capital = ''
  filters.age = ''
  filters.economy = ''
  hasSearched.value = false
  currentPage.value = 1
  openGroups.province = true
}

const viewResults = () => {
  hasSearched.value = true
  currentPage.value = 1
  openGroups.province = false
  openGroups.industry = false
  openGroups.ip = false
  openGroups.capital = false
  openGroups.age = false
  openGroups.economy = false
}

const switchMode = (next: QueryMode) => {
  mode.value = next
  if (next === 'batch') {
    batchStep.value = uploadedName.value ? 3 : 2
  }
}

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

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['xls', 'xlsx', 'csv'].includes(ext)) {
    message.error('仅支持 Excel 格式（.xls / .xlsx）')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    message.error('文件大小不能超过 5MB')
    return false
  }
  uploadedName.value = file.name
  hasSearched.value = true
  batchStep.value = 3
  currentPage.value = 1
  message.success('名单已上传，已匹配查询结果')
  return false
}
</script>

<template>
  <div class="data-export">
    <div class="mode-row">
      <button
        type="button"
        class="mode-card"
        :class="{ active: mode === 'advanced' }"
        @click="switchMode('advanced')"
      >
        <span class="mode-icon search">
          <FileSearchOutlined />
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
        @click="switchMode('batch')"
      >
        <span class="mode-icon upload">
          <CloudUploadOutlined />
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
      <aside class="filter-sider">
        <div class="filter-tabs">
          <button
            type="button"
            :class="{ active: filterTab === 'policy' }"
            @click="filterTab = 'policy'"
          >
            ·
          </button>
          <button
            type="button"
            :class="{ active: filterTab === 'basic' }"
            @click="filterTab = 'basic'"
          >
            基本筛选
          </button>
        </div>

        <div class="filter-body">
          <template v-if="filterTab === 'policy'">
            <label class="field-label">搜索政策名称</label>
            <a-input
              v-model:value="filters.keyword"
              allow-clear
              placeholder="请输入政策名称关键词搜索"
            />

            <label class="field-label">热门政策</label>
            <div class="tag-grid">
              <button
                v-for="item in hotPolicies"
                :key="item"
                type="button"
                class="filter-tag"
                :class="{ active: filters.policies.includes(item) }"
                @click="togglePolicy(item)"
              >
                {{ item }}
              </button>
            </div>

            <label class="field-label">认定年度</label>
            <div class="tag-grid years">
              <button
                v-for="year in policyYears"
                :key="year"
                type="button"
                class="filter-tag"
                :class="{ active: filters.year === year }"
                @click="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </template>

          <template v-else>
            <label class="field-label">关键词搜索</label>
            <a-input
              v-model:value="filters.keyword"
              allow-clear
              placeholder="请输入政策名称关键词搜索"
            />

            <div class="filter-group">
              <button
                type="button"
                class="group-head"
                @click="toggleGroup('province')"
              >
                <span>注册地址</span>
                <span
                  v-if="filters.province && !openGroups.province"
                  class="group-value"
                >
                  {{ filters.province }}
                </span>
                <DownOutlined :class="{ rotated: openGroups.province }" />
              </button>
              <div v-show="openGroups.province" class="tag-grid">
                <button
                  v-for="item in provinces"
                  :key="item"
                  type="button"
                  class="filter-tag"
                  :class="{ active: filters.province === item }"
                  @click="selectProvince(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>

            <div
              v-for="group in groupMeta"
              :key="group.key"
              class="filter-group"
            >
              <button
                type="button"
                class="group-head"
                @click="toggleGroup(group.key)"
              >
                <span>{{ group.label }}</span>
                <span
                  v-if="filters[group.key] && !openGroups[group.key]"
                  class="group-value"
                >
                  {{ filters[group.key] }}
                </span>
                <DownOutlined :class="{ rotated: openGroups[group.key] }" />
              </button>
              <div v-show="openGroups[group.key]" class="tag-grid">
                <button
                  v-for="item in group.options"
                  :key="item"
                  type="button"
                  class="filter-tag"
                  :class="{ active: filters[group.key] === item }"
                  @click="selectOption(group.key, item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="filter-actions">
          <a-button class="reset-btn" @click="resetFilters">重置筛选</a-button>
          <a-button type="primary" class="view-btn" @click="viewResults">
            <FileTextOutlined />
            查看结果
          </a-button>
        </div>
      </aside>

      <section class="result-pane">
        <ExportEmptyState
          v-if="!hasSearched"
          title="无查询结果"
          description="请选择筛选条件后点击「查看结果」"
          note="可筛选郑州企业，支持一键导出 Excel"
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
    </div>

    <div v-else class="batch-panel">
      <div class="batch-steps">
        <div
          class="step"
          :class="{ done: batchStep > 1, current: batchStep === 1 }"
        >
          <span class="step-index">1</span>
          <div class="step-copy">
            <strong>第一步：下载Excel模板</strong>
            <p>按标准格式填写企业名称</p>
            <a-button
              type="primary"
              ghost
              size="small"
              @click="downloadTemplate"
            >
              <DownloadOutlined />
              下载模板
            </a-button>
          </div>
        </div>
        <span class="step-line" />
        <div
          class="step"
          :class="{ done: batchStep > 2, current: batchStep === 2 }"
        >
          <span class="step-index">2</span>
          <div class="step-copy">
            <strong>第二步：上传企业名单</strong>
            <p>上传已填写的 Excel 文件</p>
          </div>
        </div>
        <span class="step-line" />
        <div class="step" :class="{ current: batchStep === 3 }">
          <span class="step-index">3</span>
          <div class="step-copy">
            <strong>第三步：导出查询结果</strong>
            <p>查看结果并一键导出 Excel</p>
          </div>
        </div>
      </div>

      <a-upload-dragger
        class="upload-zone"
        accept=".xls,.xlsx,.csv"
        :max-count="1"
        :show-upload-list="true"
        :before-upload="beforeUpload"
      >
        <p class="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p class="upload-title">将文件拖拽到此处或 <em>点击上传</em></p>
        <p class="upload-sub">下载 Excel 示例文件并填充企业名录信息</p>
        <p class="upload-hint">
          文件大小不超过 5MB · 仅支持 Excel 格式（.xls / .xlsx） · 单次查询限
          500 家企业
        </p>
        <a-button type="primary" class="pick-btn">选择文件</a-button>
      </a-upload-dragger>

      <template v-if="uploadedName">
        <ExportResultTable
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
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-export {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mode-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 88px;
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

  &:hover {
    border-color: var(--pb-primary);
  }

  &.active {
    background: linear-gradient(90deg, #e8f3ff 0%, #f5f9ff 100%);
    border-color: var(--pb-primary);
    box-shadow: 0 8px 20px rgba(22, 119, 255, 0.12);
  }
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
  color: var(--pb-primary);
  background: #e6f4ff;
  flex-shrink: 0;
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
  color: #8c8c8c;
}

.workspace {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  min-height: 560px;
  align-items: stretch;
}

.filter-sider {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 560px;
  max-height: 640px;
  padding-right: 8px;
  border-right: 1px solid #f0f0f0;
}

.filter-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  button {
    position: relative;
    padding: 0 0 10px;
    background: none;
    border: none;
    font-size: 15px;
    color: #8c8c8c;
    cursor: pointer;

    &.active {
      color: var(--pb-primary);
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 2px;
        background: var(--pb-primary);
        border-radius: 1px;
      }
    }
  }
}

.filter-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 8px;
}

.field-label {
  display: block;
  margin: 12px 0 8px;
  font-size: 13px;
  color: #8c8c8c;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.years {
    margin-bottom: 8px;
  }
}

.filter-tag {
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fafafa;
  color: #434343;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover,
  &.active {
    color: var(--pb-primary);
    background: #e6f4ff;
    border-color: #91caff;
  }
}

.filter-group {
  margin-top: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 0;
  background: none;
  border: none;
  font-size: 14px;
  color: #262626;
  cursor: pointer;

  span:first-child {
    flex-shrink: 0;
  }

  .anticon {
    margin-left: auto;
    color: #bfbfbf;
    font-size: 12px;
    transition: transform 0.2s;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.group-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  font-size: 13px;
  color: var(--pb-primary);
}

.filter-actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  padding-top: 16px;
  margin-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.reset-btn,
.view-btn {
  height: 40px;
}

.result-pane {
  min-width: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  text-align: center;
  color: #8c8c8c;

  h3 {
    margin: 8px 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #434343;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.empty-icon {
  width: 120px;
  height: 120px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty-note {
  margin-top: 8px !important;
  color: #bfbfbf;
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
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

.export-btn {
  height: 36px;
}

.result-table {
  :deep(.ant-table) {
    background: transparent;
    font-size: 14px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-weight: 600;
    border-bottom: none;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    color: #434343;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr:nth-child(even) > td) {
    background: #f8fbff;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #eef6ff;
  }
}

.ent-name {
  color: var(--pb-primary);
  font-weight: 500;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;

  &.high {
    color: #389e0d;
    background: #f6ffed;
  }

  &.low {
    color: #d4380d;
    background: #fff2e8;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 4px;
}

.batch-panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.batch-steps {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: start;
  gap: 12px;
}

.step {
  display: flex;
  gap: 12px;
  color: #8c8c8c;

  &.current,
  &.done {
    color: var(--pb-primary);

    .step-index {
      background: var(--pb-primary);
      color: #fff;
    }
  }
}

.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #8c8c8c;
  font-weight: 600;
  flex-shrink: 0;
}

.step-copy {
  min-width: 0;

  strong {
    display: block;
    margin-bottom: 4px;
    font-size: 15px;
    color: inherit;
  }

  p {
    margin: 0 0 10px;
    font-size: 12px;
    color: #8c8c8c;
  }
}

.step-line {
  width: 48px;
  height: 2px;
  margin-top: 13px;
  background: repeating-linear-gradient(
    90deg,
    #d6e4ff 0 8px,
    transparent 8px 14px
  );
}

.upload-zone {
  padding: 36px 24px 28px;
  background: #f8fbff;
  border: 1px dashed #91caff !important;
  border-radius: 12px;

  :deep(.ant-upload-drag-icon) {
    margin-bottom: 8px;

    .anticon {
      font-size: 48px;
      color: var(--pb-primary);
    }
  }
}

.upload-title {
  margin: 0 0 6px;
  font-size: 16px;
  color: #262626;

  em {
    font-style: normal;
    color: var(--pb-primary);
    font-weight: 600;
  }
}

.upload-sub,
.upload-hint {
  margin: 0;
  font-size: 13px;
  color: #8c8c8c;
}

.upload-hint {
  margin-top: 6px;
  font-size: 12px;
}

.pick-btn {
  margin-top: 18px;
  height: 36px;
  padding-inline: 28px;
}

.batch-toolbar {
  margin-top: 8px;
}

@media (max-width: 992px) {
  .mode-row,
  .workspace,
  .batch-steps {
    grid-template-columns: 1fr;
  }

  .filter-sider {
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;
    min-height: 0;
    max-height: none;
  }

  .step-line {
    display: none;
  }
}
</style>
