<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import {
  investEnterpriseTotal,
  investRegions,
  mockInvestProjects,
  type InvestProjectType,
} from '../../mock/investDb'
import { useFilteredList } from '@/composables/useFilteredList'
import ContentHeader from './components/ContentHeader.vue'
import ProjectTable from './components/ProjectTable.vue'

defineOptions({ name: 'InvestDb' })

const selectedRegionKeys = ref<string[]>(['henan'])
const selectedRegion = computed(() => selectedRegionKeys.value[0] ?? 'henan')
const activeType = ref<InvestProjectType>('all')
const keyword = ref('')

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

const { currentPage, pageSize, pagedList, total, resetPage } = useFilteredList(
  filteredList,
  { pageSize: 8 },
)

watch([selectedRegion, activeType, keyword], () => {
  resetPage()
})
</script>

<template>
  <PageState>
    <a-layout class="invest-db" has-sider>
      <a-layout-sider class="region-sider" theme="light" :width="220">
        <a-card :bordered="false" class="region-card">
          <div class="region-title">
            <EnvironmentOutlined />
            <span>选择地区</span>
          </div>
          <a-menu
            v-model:selectedKeys="selectedRegionKeys"
            mode="inline"
            class="region-menu"
          >
            <a-menu-item v-for="item in investRegions" :key="item.key">
              <div class="region-item">
                <span>{{ item.label }}</span>
                <span class="region-count">{{ item.count }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-layout-sider>

      <a-layout-content class="invest-content">
        <ContentHeader
          :total-count="investEnterpriseTotal"
          :region-label="regionLabel"
          v-model:keyword="keyword"
          v-model:active-type="activeType"
          :counts="typeCounts"
        />

        <ProjectTable
          :data-source="pagedList"
          :total="total"
          v-model:current-page="currentPage"
          :page-size="pageSize"
        />
      </a-layout-content>
    </a-layout>
  </PageState>
</template>

<style scoped lang="scss">
.invest-db {
  background: transparent;
  gap: 28px;
  margin-top: -130px;
}

.region-sider {
  background: transparent;

  :deep(.ant-layout-sider-children) {
    display: flex;
    flex-direction: column;
  }
}

.region-card {
  border-radius: 12px;
}

.region-title {
  display: flex;
  justify-content: center;
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
  background: transparent;

  // antd 用 .ant-menu-light.ant-menu-root.ant-menu-inline 写右边框，单 class 压不过
  &.ant-menu-root.ant-menu-inline {
    border-inline-end: none;
  }

  :deep(.ant-menu-item) {
    width: 100%;
    height: 44px;
    margin: 4px 0;
    padding-inline: 16px;
    line-height: 44px;
    border-radius: 8px;
    color: #595959;
  }

  :deep(.ant-menu-item-selected) {
    background: #ebf2fc;
    color: #226ce6;

    &::after {
      display: none;
    }

    .region-count {
      color: #226ce6;
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

@include below-lg {
  .invest-db {
    flex-direction: column;
    gap: 16px;
  }

  .region-sider {
    @include sider-stack;
  }
}
</style>
