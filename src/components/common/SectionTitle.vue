<script setup lang="ts">
import titleStyleBg from '@/assets/home/title-style.png'

defineOptions({ name: 'SectionTitle' })

withDefaults(
  defineProps<{
    title: string
    count?: number
    unit?: string
  }>(),
  { count: undefined, unit: '条' },
)
</script>

<template>
  <h2
    class="section-title"
    :style="{ '--section-title-bg': `url(${titleStyleBg})` }"
  >
    {{ title }}
    <template v-if="count !== undefined">
      <em>{{ count }}</em> {{ unit }}
    </template>
  </h2>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 16px;
  padding-left: 20px;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: #262626;
  background: var(--section-title-bg) no-repeat left center;
  background-size: 94px 26px;

  em {
    font-style: normal;
    color: var(--pb-primary);
  }
}
</style>
