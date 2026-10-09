<script setup lang="ts">
defineOptions({ name: 'ResultCountBar' })

withDefaults(
  defineProps<{
    prefix?: string
    total: number | string
    unit?: string
    /** 左侧主色竖条装饰 */
    decorated?: boolean
  }>(),
  { prefix: '共找到', unit: '', decorated: false },
)
</script>

<template>
  <span class="result-count-bar" :class="{ decorated }">
    {{ prefix }} <em>{{ total }}</em> {{ unit }} <slot />
  </span>
</template>

<style scoped lang="scss">
.result-count-bar {
  font-size: var(--rc-font-size, 15px);
  color: var(--rc-color, #595959);

  em {
    margin: 0 var(--rc-em-margin, 2px);
    font-style: normal;
    font-weight: 600;
    color: var(--pb-primary);
  }

  &.decorated {
    padding-left: 12px;
    border-left: 3px solid var(--pb-primary);
  }
}
</style>
