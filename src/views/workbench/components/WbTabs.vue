<script setup lang="ts" generic="K extends string">
defineOptions({ name: 'WbTabs' })

defineProps<{
  tabs: Array<{ key: K; label: string }>
}>()

const activeKey = defineModel<K>('activeKey', { required: true })
</script>

<template>
  <a-tabs v-model:activeKey="activeKey" class="wb-tabs">
    <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
    <template #rightExtra>
      <slot name="extra" />
    </template>
  </a-tabs>
</template>

<style scoped lang="scss">
.wb-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 4px;

    &::before {
      border-bottom-color: #f0f0f0;
    }
  }

  :deep(.ant-tabs-tab) {
    padding: 16px 2px 13px;

    .ant-tabs-tab-btn {
      color: #1f1f1f;
      font-size: 16px;
      font-weight: 600;

      &:hover {
        color: var(--pb-primary);
      }
    }
  }

  :deep(.ant-tabs-tab + .ant-tabs-tab) {
    margin: 0 0 0 36px;
  }

  :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: var(--pb-primary);
    text-shadow: none;
  }

  :deep(.ant-tabs-ink-bar) {
    height: 3px;
    background: var(--pb-primary);
    border-radius: 2px;
  }
}
</style>
