<script setup lang="ts">
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
  <h2 class="section-title">
    <span class="section-bar" />
    <span class="section-label">
      {{ title }}
      <template v-if="count !== undefined">
        <em>{{ count }}</em> {{ unit }}
      </template>
    </span>
  </h2>
</template>

<style scoped lang="scss">
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: #262626;
}

.section-bar {
  flex-shrink: 0;
  width: 4px;
  height: 16px;
  background: var(--pb-primary);
  border-radius: 2px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  em {
    font-style: normal;
    color: var(--pb-primary);
  }
}
</style>
