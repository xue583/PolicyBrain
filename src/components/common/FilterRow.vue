<script setup lang="ts">
import { DownOutlined } from '@ant-design/icons-vue'

defineOptions({ name: 'FilterRow' })

const props = withDefaults(
  defineProps<{
    label: string
    /** 显示“更多/收起”切换，展开态由父级通过 v-model:expanded 持有 */
    collapsible?: boolean
    expanded?: boolean
  }>(),
  { collapsible: false, expanded: false },
)

const emit = defineEmits<{ 'update:expanded': [value: boolean] }>()

const toggleExpanded = () => {
  emit('update:expanded', !props.expanded)
}
</script>

<template>
  <div class="filter-row">
    <span class="filter-label">{{ label }}</span>
    <div class="filter-options">
      <slot />
    </div>
    <a v-if="collapsible" class="more-link" @click="toggleExpanded">
      {{ expanded ? '收起' : '更多' }}
      <DownOutlined :class="{ rotated: expanded }" />
    </a>
  </div>
</template>
