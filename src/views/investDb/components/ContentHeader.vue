<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SearchOutlined } from '@ant-design/icons-vue'
import RegionCascadeFilter from '@/components/common/RegionCascadeFilter.vue'
import ResultCountBar from '@/components/common/ResultCountBar.vue'
import SelectedConditionsBar from '@/components/common/SelectedConditionsBar.vue'
import { useRegionStore } from '@/stores/region'
import { clearRegionSelection } from '@/utils/regionActions'
import { investTypeTabs } from '../../../mock/investDb'

const props = defineProps<{
  totalCount: number
  keyword: string
  activeType: string
  counts: Record<string, number>
  tabs?: Array<{ key: string; label: string }>
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  'update:activeType': [value: string]
  search: []
}>()

const { selectedLabel: regionLabel } = storeToRefs(useRegionStore())

const tabs = computed(
  () =>
    props.tabs ??
    investTypeTabs.map((item) => ({ key: item.key, label: item.label })),
)

const placeholder = computed(() =>
  regionLabel.value
    ? `搜索${regionLabel.value}项目名称、代码或单位`
    : '搜索项目名称、代码或单位',
)

const selectedConditions = computed(() =>
  regionLabel.value
    ? [{ key: 'region', label: `省市：${regionLabel.value}` }]
    : [],
)

const onKeyword = (value: string) => {
  emit('update:keyword', value)
  if (!value.trim()) emit('search')
}

const submitSearch = () => {
  emit('search')
}
</script>

<template>
  <div class="content-header">
    <section class="search-panel">
      <div class="toolbar">
        <ResultCountBar
          class="invest-count"
          prefix="共收录"
          :total="totalCount"
          unit="家企业"
          decorated
        />
        <div class="project-search">
          <a-input
            :value="keyword"
            allow-clear
            :placeholder="placeholder"
            @update:value="onKeyword"
            @press-enter="submitSearch"
          >
            <template #prefix>
              <SearchOutlined class="search-icon" />
            </template>
          </a-input>
          <a-button type="primary" @click="submitSearch">
            <span>搜索</span>
          </a-button>
        </div>
      </div>

      <RegionCascadeFilter
        label="选择省市："
        :collapsed-count="14"
        initial-expanded
      />

      <SelectedConditionsBar
        :conditions="selectedConditions"
        @remove="clearRegionSelection"
        @clear="clearRegionSelection"
      />
    </section>

    <section class="content-panel">
      <div class="type-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="type-tab"
          :class="{ active: activeType === tab.key }"
          :aria-selected="activeType === tab.key"
          @click="emit('update:activeType', tab.key)"
        >
          <span class="type-tab-label">{{ tab.label }}</span>
          <span class="type-tab-count">{{ counts[tab.key] ?? 0 }}</span>
        </button>
      </div>

      <slot />
    </section>
  </div>
</template>

<style scoped lang="scss">
.content-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-panel,
.content-panel {
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--pb-shadow-card);
}

.search-panel {
  padding: 16px 24px 8px;
  --filter-row-border: none;
  --filter-label-width: 84px;
  --filter-font-size: 14px;
  --filter-options-gap: 2px 22px;
  --filter-row-padding: 6px 0;
}

.content-panel {
  padding: 16px 24px 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}

.invest-count {
  --rc-em-margin: 0;
  --rc-color: #595959;
  flex-shrink: 0;
}

.project-search {
  display: flex;
  width: 473px;
  max-width: 100%;

  :deep(.ant-input-affix-wrapper) {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :deep(.ant-btn) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    padding-inline: 20px;
    font-weight: 500;
    height: 36px;
  }
}

.search-icon {
  color: #bfbfbf;
}

:deep(.filter-label),
:deep(.option-link),
:deep(.more-link) {
  font-size: 14px;
}

:deep(button.option-link) {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

:deep(.region-filter),
:deep(.selected-section) {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

:deep(.condition-tag) {
  display: inline-flex;
  align-items: center;
  height: 28px;
  margin: 0;
  padding: 0 8px 0 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 26px;
}

:deep(.clear-link) {
  font-size: 14px;
}

.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
}

.type-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #e6eef6;
  border-radius: 6px;
  background: #f7fafc;
  color: #434343;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;

  &:hover:not(.active) {
    color: var(--pb-primary);
    border-color: #b7d6ff;
    background: #f3f8ff;

    .type-tab-count {
      color: var(--pb-primary);
    }
  }

  &.active {
    color: var(--pb-primary);
    font-weight: 600;
    background: #fff;
    border-color: var(--pb-primary);
    box-shadow: 0 1px 2px rgba(22, 119, 255, 0.08);

    .type-tab-count {
      color: var(--pb-primary);
    }
  }
}

.type-tab-count {
  color: #8c8c8c;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

@include below-lg {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .project-search {
    width: 100%;
  }
}
</style>
