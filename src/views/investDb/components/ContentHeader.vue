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

    <div class="type-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="type-tab"
        :class="{ active: activeType === tab.key }"
        @click="emit('update:activeType', tab.key)"
      >
        {{ tab.label }} {{ counts[tab.key] ?? 0 }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
  margin-bottom: 8px;
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

:deep(.selected-section) {
  margin-top: 2px;
  padding-top: 2px;
  border-top: none;
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
  align-items: stretch;
  margin: 8px 0 16px;
  padding: 4px;
  background: #f4f8fc;
  border: 1px solid #e7eef6;
  border-radius: 8px;
}

.type-tab {
  position: relative;
  flex: 0 0 auto;
  padding: 8px 22px;
  border: 0;
  background: transparent;
  color: #595959;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;

  & + &::before {
    content: '';
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 1px;
    background: #dce6f0;
  }

  &:hover:not(.active) {
    color: var(--pb-primary);
  }

  &.active {
    color: var(--pb-primary);
    font-weight: 600;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(22, 119, 255, 0.06);

    &::before {
      display: none;
    }
  }

  &.active + &::before {
    display: none;
  }
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
