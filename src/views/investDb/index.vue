<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EnvironmentOutlined,
} from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import {
  investEnterpriseTotal,
  investRegions,
  investTypeTabs,
  mockInvestProjects,
  type InvestProject,
  type InvestProjectType,
} from '../../mock/investDb'

defineOptions({ name: 'InvestDb' })

const selectedRegion = ref('henan')
const selectedRegionKeys = ref<string[]>(['henan'])
const activeType = ref<InvestProjectType>('all')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 8

const regionLabel = computed(
  () =>
    investRegions.find((item) => item.key === selectedRegion.value)?.label ??
    '',
)

const regionProjects = computed(() => {
  if (selectedRegion.value === 'national') return mockInvestProjects
  return mockInvestProjects.filter(
    (item) => item.region === selectedRegion.value,
  )
})

const typeCounts = computed(() => {
  const counts: Record<InvestProjectType, number> = {
    all: regionProjects.value.length,
    'filing-public': 0,
    'approval-pre': 0,
    'approval-announce': 0,
    'review-pre': 0,
    'review-announce': 0,
    energy: 0,
  }
  for (const item of regionProjects.value) {
    counts[item.type] += 1
  }
  return counts
})

const filteredList = computed(() => {
  let list = regionProjects.value
  if (activeType.value !== 'all') {
    list = list.filter((item) => item.type === activeType.value)
  }
  const kw = keyword.value.trim()
  if (kw) {
    list = list.filter(
      (item) =>
        item.name.includes(kw) ||
        item.code.includes(kw) ||
        item.recordUnit.includes(kw) ||
        item.approvalUnit.includes(kw),
    )
  }
  return list
})

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const total = computed(() => filteredList.value.length)

watch([selectedRegion, activeType, keyword], () => {
  currentPage.value = 1
})

const onRegionSelect = ({ key }: { key: string | number }) => {
  selectedRegion.value = String(key)
}

const columns: TableColumnType<InvestProject>[] = [
  {
    title: '项目代码',
    dataIndex: 'code',
    key: 'code',
    width: 200,
  },
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '审批单位',
    dataIndex: 'approvalUnit',
    key: 'approvalUnit',
    width: 200,
  },
  {
    title: '审批结果',
    dataIndex: 'result',
    key: 'result',
    width: 160,
  },
  {
    title: '审批时间',
    dataIndex: 'approvalDate',
    key: 'approvalDate',
    width: 130,
  },
  {
    title: '备案单位名称',
    dataIndex: 'recordUnit',
    key: 'recordUnit',
    width: 200,
  },
]
</script>

<template>
  <a-layout class="invest-db" has-sider>
    <a-layout-sider class="region-sider" theme="light" :width="220">
      <div class="region-title">
        <EnvironmentOutlined />
        <span>选择地区</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedRegionKeys"
        mode="inline"
        class="region-menu"
        @select="onRegionSelect"
      >
        <a-menu-item v-for="item in investRegions" :key="item.key">
          <div class="region-item">
            <span>{{ item.label }}</span>
            <span class="region-count">{{ item.count }}</span>
          </div>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout-content class="invest-content">
      <a-flex
        class="toolbar"
        justify="space-between"
        align="center"
        wrap="wrap"
        :gap="12"
      >
        <span class="result-count">
          共收录
          <em>{{ investEnterpriseTotal.toLocaleString('zh-CN') }}</em>
          家企业
        </span>
        <a-input-search
          v-model:value="keyword"
          class="project-search"
          :placeholder="`搜索${regionLabel}项目名称、代码或单位`"
          enter-button="搜索"
          allow-clear
        />
      </a-flex>

      <a-radio-group v-model:value="activeType" class="type-tabs">
        <a-radio-button
          v-for="tab in investTypeTabs"
          :key="tab.key"
          :value="tab.key"
        >
          {{ tab.label }} {{ typeCounts[tab.key] }}
        </a-radio-button>
      </a-radio-group>

      <a-table
        class="invest-table"
        :columns="columns"
        :data-source="pagedList"
        :pagination="false"
        :row-key="(row: InvestProject) => row.id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a class="project-name">{{ record.name }}</a>
          </template>
          <template v-else-if="column.key === 'result'">
            <span class="result" :class="record.result">
              <CheckCircleFilled v-if="record.result === 'passed'" />
              <CloseCircleFilled v-else />
              {{
                record.result === 'passed' ? '办结（通过）' : '未办结（驳回）'
              }}
            </span>
          </template>
        </template>
      </a-table>

      <div class="pagination-wrap">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :page-size="pageSize"
          show-quick-jumper
          :show-size-changer="false"
          :show-total="(t: number) => `共 ${t} 条`"
        />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped lang="scss">
.invest-db {
  background: transparent;
  gap: 28px;
}

.region-sider {
  background: transparent !important;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.region-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;

  .anticon {
    color: var(--pb-primary);
    font-size: 16px;
  }
}

.region-menu {
  border-inline-end: none !important;
  background: transparent;

  :deep(.ant-menu-item) {
    width: 100%;
    height: 44px;
    margin: 4px 0 !important;
    padding-inline: 16px !important;
    line-height: 44px;
    border-radius: 8px;
    color: #595959;
  }

  :deep(.ant-menu-item-selected) {
    background: var(--pb-primary) !important;
    color: #fff;

    &::after {
      display: none !important;
    }

    .region-count {
      color: #fff;
    }
  }

  :deep(.ant-menu-item:hover:not(.ant-menu-item-selected)) {
    background: #e6f4ff;
    color: var(--pb-primary);
  }
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.region-count {
  color: #8c8c8c;
  font-variant-numeric: tabular-nums;
}

.invest-content {
  min-width: 0;
  background: transparent;
}

.toolbar {
  margin-bottom: 16px;
}

.result-count {
  font-size: 15px;
  color: #595959;

  em {
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
    margin: 0 4px;
  }
}

.project-search {
  width: 360px;
  max-width: 100%;

  :deep(.ant-input-search-button) {
    font-weight: 500;
  }
}

.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;

  :deep(.ant-radio-button-wrapper) {
    height: auto;
    padding: 6px 14px;
    border-radius: 999px !important;
    border-inline-start-width: 1px;
    line-height: 22px;
    font-size: 14px;
    color: #595959;
    background: #fff;

    &::before {
      display: none;
    }
  }

  :deep(.ant-radio-button-wrapper-checked) {
    color: var(--pb-primary);
    border-color: var(--pb-primary) !important;
    background: #fff;
    font-weight: 500;
  }
}

.invest-table {
  :deep(.ant-table) {
    background: transparent;
    font-size: 15px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #eaf4ff;
    color: #262626;
    font-size: 15px;
    font-weight: 600;
    border-bottom: none;
    padding: 16px 14px !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    font-size: 14px;
    color: #434343;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
    padding: 18px 14px !important;
  }

  :deep(.ant-table-tbody > tr:nth-child(even) > td) {
    background: #f8fbff;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #eef6ff;
  }

  :deep(.ant-table-container table) {
    border-radius: 0;
  }
}

.project-name {
  color: var(--pb-primary);
  line-height: 1.6;
}

.result {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &.passed {
    color: #52c41a;
  }

  &.rejected {
    color: #ff4d4f;
  }

  .anticon {
    font-size: 15px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 4px;
}

@media (max-width: 992px) {
  .invest-db {
    flex-direction: column;
    gap: 16px;
  }

  .region-sider {
    width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
  }

  .project-search {
    width: 100%;
  }
}
</style>
