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

const onChange = (key: string | number) => {
  emit('update:activeKey', String(key) as K)
}
</script>

<template>
  <a-tabs
    class="panel-tabs"
    :class="`is-${variant}`"
    :active-key="activeKey"
    :tab-bar-gutter="0"
    @change="onChange"
  >
    <a-tab-pane v-for="tab in tabs" :key="tab.key">
      <template #tab>
        <span class="panel-tab" :class="{ active: tab.key === activeKey }">
          {{ tab.label }}
        </span>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>

<style scoped lang="scss">
.panel-tabs.ant-tabs {
  :deep(.ant-tabs-nav) {
    margin: 0;

    &::before {
      display: none;
    }
  }

  :deep(.ant-tabs-nav-wrap) {
    overflow: visible;
  }

  :deep(.ant-tabs-nav-list) {
    gap: var(--panel-tab-gap);
  }

  :deep(.ant-tabs-nav-operations) {
    display: none;
  }

  :deep(.ant-tabs-tab) {
    margin: 0;
    padding: 0;
    background: transparent;
  }

  :deep(.ant-tabs-tab-btn) {
    text-shadow: none;
  }

  :deep(.ant-tabs-ink-bar),
  :deep(.ant-tabs-content-holder) {
    display: none;
  }
}

.panel-tabs.is-underline {
  --panel-tab-gap: 40px;
  border-bottom: 1px solid var(--pb-line);

  .panel-tab {
    position: relative;
    display: inline-block;
    padding: 0 2px 14px;
    font-size: 16px;
    font-family: inherit;
    color: var(--pb-text);

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

.panel-tabs.is-filled {
  --panel-tab-gap: 36px;
  padding: 12px 24px;
  background: #ecf3ff;
  border-radius: 8px;

  .panel-tab {
    display: inline-block;
    padding: 0;
    font-size: 15px;
    font-family: inherit;
    color: #8c8c8c;

    &.active {
      color: var(--pb-title);
      font-weight: 600;
    }
  }
}
</style>
