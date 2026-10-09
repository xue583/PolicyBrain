<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DeleteOutlined,
  ExportOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/common/EmptyState.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PanelTabs from '@/components/common/PanelTabs.vue'
import {
  buildPolicyChanges,
  companyNames,
  type PolicyChange,
} from '@/mock/personalCenter'
import emptyImg from '@/assets/personalCenter/empty-message.png'
import PcFilterRow from './components/PcFilterRow.vue'

defineOptions({ name: 'DynamicsPanel' })

type DynamicsRecord = {
  id: number
  companyName: string
  changeType: string
  before: string
  after: string
  changedAt: string
}

/** 视觉还原用 Mock 数据，接入后端后替换 */
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

const policyRecords = ref(buildPolicyChanges())

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

const filteredRecords = computed(() => {
  if (activeTab.value === 'policy') return policyRecords.value
  if (!selectedCompany.value) return dynamicsRecords.value
  return dynamicsRecords.value.filter(
    (item) => item.companyName === selectedCompany.value,
  )
})

const { currentPage, pageSize, total, pagedList, resetPage } = usePagination<
  DynamicsRecord | PolicyChange
>(() => filteredRecords.value)

const handleRowSelect = (keys: readonly (number | string)[]) => {
  selectedRowKeys.value = keys.map(Number)
}

const switchTab = (tab: 'company' | 'policy') => {
  activeTab.value = tab
  selectedRowKeys.value = []
  resetPage()
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
  resetPage()
}

const batchRemove = () => {
  if (selectedRowKeys.value.length === 0) return
  dynamicsRecords.value = dynamicsRecords.value.filter(
    (item) => !selectedRowKeys.value.includes(item.id),
  )
  selectedRowKeys.value = []
  if (pagedList.value.length === 0 && currentPage.value > 1)
    currentPage.value -= 1
}
</script>

<template>
  <div class="dynamics-panel">
    <PanelTabs
      class="panel-tabs-mb"
      :tabs="[
        { key: 'company', label: '企业' },
        { key: 'policy', label: '政策' },
      ]"
      :active-key="activeTab"
      @update:active-key="switchTab"
    />

    <!-- 企业 tab 筛选区 -->
    <template v-if="activeTab === 'company'">
      <PcFilterRow label="选择企业：">
        <a-select
          v-model:value="selectedCompany"
          class="company-select"
          show-search
          allow-clear
          placeholder="请选择"
          :options="companyOptions"
        />
        <template #actions>
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
        </template>
      </PcFilterRow>
    </template>

    <PcFilterRow label="变动类型：">
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
    </PcFilterRow>

    <PcFilterRow label="选择年份：">
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
    </PcFilterRow>

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
      :data-source="pagedList"
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
        <EmptyState :image="emptyImg" />
      </template>
    </a-table>

    <PaginationBar
      v-if="total > 0"
      v-model:current="currentPage"
      :total="total"
      :page-size="pageSize"
    />
  </div>
</template>

<style scoped lang="scss">
.panel-tabs-mb {
  margin-bottom: 20px;
}

.company-select {
  flex: 1;
  max-width: 560px;

  &:deep(.ant-select-selector) {
    border-color: var(--pb-primary) !important;
    border-radius: 4px;
  }
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
  @include pc-table($hover: true, $indent-first: true, $checkbox: true);
}
</style>
