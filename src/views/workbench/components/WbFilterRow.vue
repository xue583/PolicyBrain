<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'WbFilterRow' })

const props = withDefaults(
  defineProps<{
    label: string
    /** 是否显示右侧“展开/收起”按钮 */
    collapsible?: boolean
    /** 收起态按钮文案（各页为“展开”或“更多”） */
    expandText?: string
    collapseText?: string
    /** 筛选项横向间距（成果转化 34 / 产业数据 28） */
    gap?: number
    /** 是否为折叠按钮保留右侧占位（产业数据企服视角无需保留） */
    reserveFoldSpace?: boolean
  }>(),
  {
    collapsible: false,
    expandText: '展开',
    collapseText: '收起',
    gap: 28,
    reserveFoldSpace: true,
  },
)

const expanded = defineModel<boolean>('expanded', { default: true })

const toggleExpanded = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="filter-row">
    <span class="filter-label">{{ props.label }}</span>
    <div
      class="filter-body"
      :class="{ 'no-fold': !props.reserveFoldSpace }"
      :style="props.gap !== 28 ? { columnGap: `${props.gap}px` } : undefined"
    >
      <slot />
      <span v-if="props.collapsible" class="fold-btn" @click="toggleExpanded">
        {{ expanded ? props.collapseText : props.expandText }}
        <UpOutlined v-if="expanded" class="fold-icon" />
        <DownOutlined v-else class="fold-icon" />
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filter-row {
  display: flex;
  margin-top: 18px;
  font-size: 14px;
  line-height: 22px;
}

.filter-label {
  flex-shrink: 0;
  width: 84px;
  color: #1f1f1f;
  font-weight: 600;
}

.filter-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  column-gap: 28px;
  row-gap: 14px;
  min-width: 0;
  padding-right: 70px;

  &.no-fold {
    padding-right: 0;
  }
}

.fold-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  top: 0;
  right: 0;
  color: var(--pb-primary);
  cursor: pointer;
}

.fold-icon {
  font-size: 11px;
}
</style>
