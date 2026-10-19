<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import { fetchInvestProjects, fetchInvestRegions } from '@/api/invest'
import type { InvestCategory } from '@/api/invest'
import type { InvestRegion } from '../../mock/investDb'
import { useServerPage } from '@/composables/useServerPage'
import { toErrorMessage } from '@/utils/apiError'
import ContentHeader from './components/ContentHeader.vue'
import ProjectTable from './components/ProjectTable.vue'

defineOptions({ name: 'InvestDb' })

const regions = ref<InvestRegion[]>([])
const regionError = ref('')
const categories = ref<InvestCategory[]>([])
const selectedRegionKeys = ref<string[]>(['henan'])
const selectedRegion = computed(() => selectedRegionKeys.value[0] ?? 'henan')
const activeType = ref('all')
const keyword = ref('')
const appliedKeyword = ref('')

let keywordTimer = 0
watch(keyword, (value) => {
  window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(() => {
    appliedKeyword.value = value.trim()
  }, 300)
})

const regionLabel = computed(
  () =>
    regions.value.find((item) => item.key === selectedRegion.value)?.label ??
    '',
)

watch(selectedRegion, () => {
  activeType.value = 'all'
  categories.value = []
})

const typeTabs = computed(() => [
  { key: 'all', label: '全部' },
  ...categories.value.map((item) => ({ key: item.name, label: item.name })),
])

const {
  currentPage,
  pageSize,
  items: pagedList,
  total,
  loading,
  error,
  reload,
} = useServerPage(
  async (pageIndex, pageSize) => {
    const result = await fetchInvestProjects({
      province: selectedRegion.value,
      category: activeType.value === 'all' ? undefined : activeType.value,
      search: appliedKeyword.value,
      pageIndex,
      pageSize,
    })
    if (result.categories.length) categories.value = result.categories
    return result.page
  },
  () =>
    JSON.stringify({
      region: selectedRegion.value,
      category: activeType.value,
      search: appliedKeyword.value,
    }),
  8,
)

const typeCounts = computed(() => {
  const regionCount =
    regions.value.find((item) => item.key === selectedRegion.value)?.count ??
    total.value
  const counts: Record<string, number> = { all: regionCount }
  for (const item of categories.value) counts[item.name] = item.count
  return counts
})

onMounted(() => {
  void fetchInvestRegions()
    .then((list) => {
      regions.value = list
      if (
        list.length &&
        !list.some((item) => item.key === selectedRegion.value)
      ) {
        selectedRegionKeys.value = [list[0]!.key]
      }
    })
    .catch((err: unknown) => {
      regionError.value = toErrorMessage(err, '地区加载失败')
    })
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
            <a-menu-item v-for="item in regions" :key="item.key">
              <div class="region-item">
                <span>{{ item.label }}</span>
                <span class="region-count">{{ item.count }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-layout-sider>

      <a-layout-content class="invest-content">
        <a-alert
          v-if="regionError || error"
          type="error"
          show-icon
          :message="regionError || error"
          style="margin-bottom: 12px"
        >
          <template #action>
            <a-button size="small" @click="reload">重试</a-button>
          </template>
        </a-alert>
        <ContentHeader
          :total-count="
            regions.find((item) => item.key === selectedRegion)?.count ?? total
          "
          :region-label="regionLabel"
          v-model:keyword="keyword"
          v-model:active-type="activeType"
          :counts="typeCounts"
          :tabs="typeTabs"
        />

        <ProjectTable
          :loading="loading"
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
  margin-top: -189px;
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
