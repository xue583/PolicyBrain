<script setup lang="ts">
import { computed, ref } from 'vue'
import { ClearOutlined } from '@ant-design/icons-vue'
import WbFilterRow from './WbFilterRow.vue'

defineOptions({ name: 'WbRegionFilter' })

const props = withDefaults(
  defineProps<{
    provinces: string[]
    cityMap: Record<string, string[]>
    label?: string
    collapsible?: boolean
    /** 收起态展示的省份数量 */
    collapsedCount?: number
    /** 已选标签底色（成果转化浅蓝底 / 产业数据白底） */
    filledTag?: boolean
    gap?: number
    expandText?: string
    reserveFoldSpace?: boolean
  }>(),
  {
    label: '区域筛选',
    collapsible: false,
    collapsedCount: 0,
    filledTag: false,
    gap: 28,
    expandText: '展开',
    reserveFoldSpace: true,
  },
)

const selected = defineModel<string[]>('selected', { required: true })

const expanded = ref(true)

const visibleProvinces = computed(() =>
  !props.collapsible || expanded.value
    ? props.provinces
    : props.provinces.slice(0, props.collapsedCount),
)

const getPopupContainer = (node: HTMLElement) =>
  node.parentElement ?? document.body

const toggle = (label: string) => {
  const list = selected.value
  const index = list.indexOf(label)
  if (index > -1) list.splice(index, 1)
  else list.push(label)
}

const clear = () => {
  selected.value = []
}
</script>

<template>
  <WbFilterRow
    v-model:expanded="expanded"
    :label="props.label"
    :collapsible="props.collapsible"
    :expand-text="props.expandText"
    :gap="props.gap"
    :reserve-fold-space="props.reserveFoldSpace"
  >
    <template v-for="p in visibleProvinces" :key="p">
      <a-dropdown
        v-if="props.cityMap[p]"
        :trigger="['hover', 'click']"
        placement="bottomLeft"
        :get-popup-container="getPopupContainer"
      >
        <span
          class="region-item"
          :class="{ 'is-active': selected.includes(p) }"
          @click="toggle(p)"
        >
          {{ p }}
        </span>
        <template #overlay>
          <div class="city-panel">
            <span
              v-for="c in props.cityMap[p]"
              :key="c"
              class="city-item"
              :class="{ 'is-active': selected.includes(c) }"
              @click="toggle(c)"
            >
              {{ c }}
            </span>
          </div>
        </template>
      </a-dropdown>
      <span
        v-else
        class="region-item"
        :class="{ 'is-active': selected.includes(p) }"
        @click="toggle(p)"
      >
        {{ p }}
      </span>
    </template>
  </WbFilterRow>

  <div v-if="selected.length" class="filter-row selected-row">
    <span class="filter-label">已选：</span>
    <div class="filter-body selected-body">
      <span
        v-for="tag in selected"
        :key="tag"
        class="selected-tag"
        :class="{ 'is-filled': props.filledTag }"
      >
        {{ tag }}
        <span class="tag-close" @click="toggle(tag)">
          <svg viewBox="0 0 10 10"><path d="m2 2 6 6M8 2 2 8" /></svg>
        </span>
      </span>
      <span class="clear-btn" @click="clear">
        <ClearOutlined class="clear-icon" />
        清空
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.region-item {
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover,
  &.is-active {
    color: var(--pb-primary);
  }
}

.city-panel {
  display: flex;
  flex-wrap: wrap;
  column-gap: 26px;
  row-gap: 12px;
  min-width: 520px;
  max-width: 720px;
  padding: 14px 18px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(31, 56, 88, 0.12);
}

.city-item {
  color: #333;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover,
  &.is-active {
    color: var(--pb-primary);
  }
}

.selected-row {
  margin-top: 20px;
}

.selected-body {
  column-gap: 14px;
  padding-right: 0;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px;
  color: var(--pb-primary);
  font-size: 13px;
  line-height: 20px;
  background: #fff;
  border: 1px solid #8ab6f5;
  border-radius: 4px;

  &.is-filled {
    background: #e9f2ff;
  }
}

.tag-close {
  display: inline-flex;
  cursor: pointer;

  svg {
    width: 9px;
    height: 9px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
  }

  &:hover {
    color: #ff4d4f;
  }
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pb-primary);
  }
}

.clear-icon {
  font-size: 14px;
}
</style>
