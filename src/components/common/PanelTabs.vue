<script setup lang="ts" generic="K extends string">
defineOptions({ name: 'PanelTabs' })

withDefaults(
  defineProps<{
    tabs: { key: K; label: string }[]
    activeKey: K
    variant?: 'underline' | 'filled'
  }>(),
  { variant: 'underline' },
)

const emit = defineEmits<{ 'update:activeKey': [key: K] }>()
</script>

<template>
  <div class="panel-tabs" :class="`is-${variant}`">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="panel-tab"
      :class="{ active: tab.key === activeKey }"
      @click="emit('update:activeKey', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.panel-tabs {
  display: flex;
  align-items: center;

  &.is-underline {
    gap: 40px;
    border-bottom: 1px solid var(--pb-line);

    .panel-tab {
      position: relative;
      padding: 0 2px 14px;
      border: none;
      background: none;
      font-size: 16px;
      font-family: inherit;
      color: var(--pb-text);
      cursor: pointer;

      &.active {
        color: var(--pb-primary);
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 3px;
          border-radius: 2px;
          background: var(--pb-primary);
        }
      }
    }
  }

  &.is-filled {
    gap: 36px;
    padding: 12px 24px;
    background: #ecf3ff;
    border-radius: 8px;

    .panel-tab {
      padding: 0;
      border: none;
      background: none;
      font-size: 15px;
      font-family: inherit;
      color: #8c8c8c;
      cursor: pointer;

      &.active {
        color: var(--pb-title);
        font-weight: 600;
      }
    }
  }
}
</style>
