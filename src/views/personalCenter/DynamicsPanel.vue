<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DeleteOutlined,
  ExportOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue'
import emptyImg from '@/assets/personalCenter/empty-message.png'

defineOptions({ name: 'DynamicsPanel' })

type DynamicsRecord = {
  id: number
  companyName: string
  changeType: string
  before: string
  after: string
  changedAt: string
}

type PolicyChange = {
  id: number
  policyName: string
  changeType: string
  before: string
  after: string
  changedAt: string
}

/** 视觉还原用 Mock 数据，接入后端后替换 */
const companyNames = [
  '河南中科干细胞基因工程有限公司',
  '郑州紫江包装有限公司',
  '众智学府信息技术有限公司',
]

const dynamicsRecords = ref<DynamicsRecord[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    companyName: companyNames[i % companyNames.length]!,
    // 图中变动类型列展示为占位符 ——，接入后端后填充
    changeType: '',
    before: '包装制造',
    after: '包装制造',
    changedAt: '2026-08-11',
  })),
)

const policyNames = [
  '关于组织开展2026年度高新技术企业认定工作的通知',
  '郑州市推进制造业数字化转型专项资金申报指南',
  '关于印发河南省专精特新中小企业培育实施方案的通知',
  '郑州市人工智能创新发展若干措施申报工作安排',
  '关于公开征集2026年重点领域科技攻关需求的通知',
]
const changeTypes = ['申报条件', '支持力度', '申报时间', '依据文件']
const changePairs = [
  ['企业成立满 1 年', '企业成立满 2 年'],
  ['最高补贴 50 万元', '最高补贴 80 万元'],
  ['申报截止 2026/9/30', '申报截止 2026/10/31'],
  ['需提供市级资质', '需提供省级资质'],
] as const

const policyRecords = ref<PolicyChange[]>(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    policyName: policyNames[i % policyNames.length]!,
    changeType: changeTypes[i % changeTypes.length]!,
    before: changePairs[i % changePairs.length]![0],
    after: changePairs[i % changePairs.length]![1],
    changedAt: '2026/8/24 09:15:07',
  })),
)

const companyOptions = companyNames.map((name) => ({ value: name }))

const changeTypeOptions = [
  '政策变动',
  '资金发放',
  '经营范围',
  '股东变更',
  '知识产权',
  '资质证书',
  '招投标',
  '经营异常',
  '违法违规',
]
const yearOptions = ['2026', '2025', '2024', '2023', '2022']

const activeTab = ref<'company' | 'policy'>('company')
const selectedCompany = ref<string | undefined>()
const activeType = ref('')
const activeYear = ref('')
const selectedRowKeys = ref<number[]>([])

const current = ref(1)
const pageSize = 10

const filteredRecords = computed(() => {
  if (activeTab.value === 'policy') return policyRecords.value
  if (!selectedCompany.value) return dynamicsRecords.value
  return dynamicsRecords.value.filter(
    (item) => item.companyName === selectedCompany.value,
  )
})

const pagedRecords = computed(() =>
  filteredRecords.value.slice(
    (current.value - 1) * pageSize,
    current.value * pageSize,
  ),
)

const handleRowSelect = (keys: readonly (number | string)[]) => {
  selectedRowKeys.value = keys.map(Number)
}

const switchTab = (tab: 'company' | 'policy') => {
  activeTab.value = tab
  selectedRowKeys.value = []
  current.value = 1
}

const toggleType = (type: string) => {
  activeType.value = activeType.value === type ? '' : type
}

const toggleYear = (year: string) => {
  activeYear.value = activeYear.value === year ? '' : year
}

const resetFilters = () => {
  selectedCompany.value = undefined
  activeType.value = ''
  activeYear.value = ''
  selectedRowKeys.value = []
  current.value = 1
}

const batchRemove = () => {
  if (selectedRowKeys.value.length === 0) return
  dynamicsRecords.value = dynamicsRecords.value.filter(
    (item) => !selectedRowKeys.value.includes(item.id),
  )
  selectedRowKeys.value = []
  if (pagedRecords.value.length === 0 && current.value > 1) current.value -= 1
}
</script>

<template>
  <div class="dynamics-panel">
    <div class="dynamics-tabs">
      <button
        type="button"
        class="dynamics-tab"
        :class="{ active: activeTab === 'company' }"
        @click="switchTab('company')"
      >
        企业
      </button>
      <button
        type="button"
        class="dynamics-tab"
        :class="{ active: activeTab === 'policy' }"
        @click="switchTab('policy')"
      >
        政策
      </button>
    </div>

    <!-- 企业 tab 筛选区 -->
    <template v-if="activeTab === 'company'">
      <div class="filter-row">
        <span class="filter-label">选择企业：</span>
        <a-select
          v-model:value="selectedCompany"
          class="company-select"
          show-search
          allow-clear
          placeholder="请选择"
          :options="companyOptions"
        />
        <div class="filter-actions">
          <a-button class="reset-btn" @click="resetFilters">
            <template #icon><SyncOutlined /></template>
            重置
          </a-button>
          <a-button class="export-btn" @click.prevent>
            <template #icon><ExportOutlined /></template>
            导出
          </a-button>
          <a-button
            class="batch-btn"
            :disabled="selectedRowKeys.length === 0"
            @click="batchRemove"
          >
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
        </div>
      </div>
    </template>

    <div class="filter-row">
      <span class="filter-label">变动类型：</span>
      <div class="filter-options">
        <button
          v-for="type in changeTypeOptions"
          :key="type"
          type="button"
          class="filter-option"
          :class="{ active: activeType === type }"
          @click="toggleType(type)"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div class="filter-row">
      <span class="filter-label">选择年份：</span>
      <div class="filter-options">
        <button
          v-for="year in yearOptions"
          :key="year"
          type="button"
          class="filter-option"
          :class="{ active: activeYear === year }"
          @click="toggleYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <a-table
      class="dynamics-table"
      :columns="
        activeTab === 'company'
          ? [
              { title: '企业名称', dataIndex: 'companyName' },
              { title: '变动类型', dataIndex: 'changeType', width: 84 },
              { title: '变动前', dataIndex: 'before', width: 84 },
              { title: '变动后', dataIndex: 'after', width: 84 },
              { title: '变动时间', dataIndex: 'changedAt', width: 104 },
            ]
          : [
              { title: '序号', dataIndex: 'id', width: 48 },
              { title: '政策名称', dataIndex: 'policyName', ellipsis: true },
              { title: '变动类型', dataIndex: 'changeType', width: 90 },
              { title: '变动前', dataIndex: 'before', ellipsis: true },
              { title: '变动后', dataIndex: 'after', ellipsis: true },
              { title: '变动时间', dataIndex: 'changedAt', width: 150 },
            ]
      "
      :data-source="pagedRecords"
      :pagination="false"
      row-key="id"
      :row-selection="
        activeTab === 'company'
          ? {
              selectedRowKeys: selectedRowKeys,
              onChange: handleRowSelect,
              columnWidth: 40,
            }
          : undefined
      "
    >
      <template #bodyCell="{ column, record }">
        <template
          v-if="column.dataIndex === 'changeType' && activeTab === 'company'"
        >
          {{ (record as DynamicsRecord).changeType || '——' }}
        </template>
      </template>
      <template #emptyText>
        <div class="table-empty">
          <img :src="emptyImg" alt="" />
          <p>暂无数据</p>
        </div>
      </template>
    </a-table>

    <div v-if="filteredRecords.length > 0" class="table-pagination">
      <span class="table-total">共{{ filteredRecords.length }}条</span>
      <a-pagination
        v-model:current="current"
        :total="filteredRecords.length"
        :page-size="pageSize"
        :show-size-changer="false"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dynamics-tabs {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--pb-line);
}

.dynamics-tab {
  position: relative;
  padding: 0 2px 14px;
  border: none;
  background: none;
  font-size: 16px;
  font-family: inherit;
  color: var(--pb-text);
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
      height: 3px;
      border-radius: 2px;
      background: var(--pb-primary);
    }
  }
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.filter-label {
  width: 76px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--pb-text);
}

.company-select {
  flex: 1;
  max-width: 560px;

  &:deep(.ant-select-selector) {
    border-color: var(--pb-primary) !important;
    border-radius: 4px;
  }
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

:deep(.reset-btn) {
  color: var(--pb-primary);
  border-color: var(--pb-primary);
  border-radius: 4px;
}

:deep(.export-btn) {
  color: #f68817;
  border-color: #f68817;
  border-radius: 4px;
}

:deep(.batch-btn) {
  color: #ff4d4f;
  border-color: #ff4d4f;
  border-radius: 4px;

  &:not(:disabled):hover {
    color: #ff7875;
    border-color: #ff7875;
  }
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 32px;
}

.filter-option {
  padding: 0;
  border: none;
  background: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--pb-text);
  cursor: pointer;

  &.active {
    color: var(--pb-primary);
    font-weight: 600;
  }
}

.dynamics-table {
  :deep(.ant-table-cell) {
    padding: 13px 8px;
    font-size: 13px;
  }

  :deep(.ant-checkbox-inner) {
    border-radius: 4px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #ecf3ff;
    color: var(--pb-text);
    font-weight: 600;
  }

  :deep(.ant-table-container) {
    border: 1px solid #dce7f9;
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.ant-table-tbody > tr > td:first-child) {
    padding-left: 16px;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f7faff;
  }
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 0 48px;

  img {
    width: 150px;
    height: auto;
    user-select: none;
  }

  p {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--pb-primary);
  }
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0 8px;
}

.table-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--pb-text);
}
</style>
