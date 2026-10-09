<script setup lang="ts">
defineOptions({ name: 'PcFilterRow' })

defineProps<{
  label: string
}>()
</script>

<template>
  <div class="pc-filter-row">
    <span class="pc-filter-label">{{ label }}</span>
    <slot />
    <div v-if="$slots.actions" class="pc-filter-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pc-filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.pc-filter-label {
  width: 76px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--pb-text);
}

.pc-filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
</style>
