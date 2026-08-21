<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  DownloadOutlined,
  DownOutlined,
  FileTextOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType, UploadProps } from 'ant-design-vue'
import {
  ageOptions,
  capitalOptions,
  economyOptions,
  electronicsIndustry,
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
import searchIcon from '../../assets/export/search.png'
import search2Icon from '../../assets/export/search2.png'
import stepDownloadIcon from '../../assets/export/download.png'
import stepUploadIcon from '../../assets/export/upload-icon.png'
import stepExportIcon from '../../assets/export/export-icon.png'
import stepArrowIcon from '../../assets/export/step-arrow.png'
import upload3dIcon from '../../assets/export/upload.png'

defineOptions({ name: 'DataExport' })

type QueryMode = 'advanced' | 'batch'
type FilterTab = 'policy' | 'basic'
type FilterKey = 'industry' | 'ip' | 'capital' | 'age' | 'economy'

const mode = ref<QueryMode>('advanced')
const filterTab = ref<FilterTab>('basic')
const searchedTab = ref<FilterTab>('basic')
const hasSearched = ref(true)
const currentPage = ref(1)
const pageSize = 10
const uploadedName = ref('')

const filters = reactive({
  keyword: '',
  policies: [] as string[],
  year: 2026 as number | null,
  province: '河南省',
  industry: electronicsIndustry,
  ip: '',
  capital: '',
  age: '',
  economy: '',
})

const openGroups = reactive<Record<FilterKey | 'province', boolean>>({
  province: false,
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

    if (searchedTab.value === 'policy') {
      if (filters.year && item.year !== filters.year) return false
      if (
        filters.policies.length &&
        !filters.policies.some((p) => item.policies.includes(p))
      ) {
        return false
      }
      return true
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
  searchedTab.value = filterTab.value
  currentPage.value = 1
  openGroups.province = filterTab.value === 'basic'
  openGroups.industry = false
  openGroups.ip = false
  openGroups.capital = false
  openGroups.age = false
  openGroups.economy = false
}

const viewResults = () => {
  hasSearched.value = true
  searchedTab.value = filterTab.value
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
        @click="switchMode('batch')"
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
        <aside class="filter-sider">
          <div class="filter-tabs">
            <button
              type="button"
              :class="{ active: filterTab === 'policy' }"
              @click="filterTab = 'policy'"
            >
              政策资讯
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
            <a-button class="reset-btn" @click="resetFilters"
              >重置筛选</a-button
            >
            <a-button type="primary" class="view-btn" @click="viewResults">
              <FileTextOutlined />
              查看结果
            </a-button>
          </div>
        </aside>
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

    <div v-else class="batch-panel">
      <div class="batch-steps">
        <div class="step">
          <img class="step-icon" :src="stepDownloadIcon" alt="" />
          <div class="step-copy">
            <strong>第一步：下载Excel模板</strong>
            <p>下载标准模板，按照模板格式填入企业名称</p>
            <a-button
              type="primary"
              ghost
              size="small"
              @click.stop="downloadTemplate"
            >
              <DownloadOutlined />
              下载模板
            </a-button>
          </div>
          <img class="step-arrow" :src="stepArrowIcon" alt="" />
        </div>
        <div class="step">
          <img class="step-icon" :src="stepUploadIcon" alt="" />
          <div class="step-copy">
            <strong>第二步：上传企业名单</strong>
            <p>上传填写好的Excel文件进行批量查询</p>
          </div>
          <img class="step-arrow" :src="stepArrowIcon" alt="" />
        </div>
        <div class="step">
          <img class="step-icon" :src="stepExportIcon" alt="" />
          <div class="step-copy">
            <strong>第三步：导出查询结果</strong>
            <p>查看查询结果并一键导出Excel</p>
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
        <img class="upload-visual" :src="upload3dIcon" alt="" />
        <p class="upload-title">将文件拖拽到此处或 <em>点击上传</em></p>
        <p class="upload-sub">下载Excel示例文件并填充企业名录信息</p>
        <p class="upload-hint">
          文件大小不超过5M · 仅支持Excel格式(.xls/.xlsx) · 单次查询限500家企业
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
  margin-top: -130px;
}

.filter-card,
.result-card {
  border-radius: 20px;
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
    font-size: 20px;
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
  font-size: 16px;
  color: #333333;
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
  background: #eeeeee;
  color: #6f6f6f;
  font-size: 14px;
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
  gap: 20px;
}

.batch-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 24px 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.06);
}

.step {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 8px 28px;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: -22px;
    bottom: 16px;
    height: 167px;
    right: 0;
    width: 1px;
    border-right: 1px solid #d8d8d8;
  }
}

.step-icon {
  height: 109px;
  flex-shrink: 0;
  object-fit: contain;
}

.step-arrow {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 1;
  width: 20px;
  height: 20px;
  transform: translate(50%, -50%);
  background: #fff;
  object-fit: contain;
}

.step-copy {
  min-width: 0;
  padding-top: 2px;

  strong {
    display: block;
    margin-bottom: 6px;
    font-size: 18px;
    font-weight: 600;
    line-height: 22px;
    color: #262626;
  }

  p {
    margin: 0 0 10px;
    font-size: 14px;
    line-height: 20px;
    color: #333333;
  }
}

.upload-zone {
  padding: 48px 24px 40px;
  background: #f7fbff;
  border: 1px dashed #91caff !important;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.04);

  :deep(.ant-upload-drag) {
    background: transparent;
    border: none;
  }

  :deep(.ant-upload-btn) {
    padding: 0;
  }
}

.upload-visual {
  display: block;
  width: 222px;
  height: auto;
  margin: 0 auto 16px;
  object-fit: contain;
}

.upload-title {
  margin: 0 0 15px;
  font-size: 24px;
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
  font-size: 24px;
  line-height: 20px;
  color: #8c8c8c;
}

.upload-hint {
  margin-top: 15px;
  font-size: 24px;
}

.pick-btn {
  margin-top: 31px;
  height: 36px;
  padding-inline: 28px;
  border-radius: 6px;
}

.batch-toolbar {
  margin-top: 8px;
}

@media (max-width: 992px) {
  .mode-row,
  .workspace {
    grid-template-columns: 1fr;
  }

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

  .step-arrow,
  .step:not(:last-child)::after {
    display: none;
  }
}
</style>
