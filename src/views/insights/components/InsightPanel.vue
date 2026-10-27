<script setup lang="ts">
defineOptions({ name: 'InsightPanel' })

defineProps<{
  title: string
  wrapExtra?: boolean
}>()
</script>

<template>
  <a-card
    :bordered="false"
    class="insight-panel"
    :class="{ 'is-wrap': wrapExtra }"
  >
    <div class="panel-head">
      <div class="panel-title">
        <span class="panel-mark" />
        <h3>{{ title }}</h3>
      </div>
      <slot name="extra" />
    </div>
    <slot />
  </a-card>
</template>

<style scoped lang="scss">
.insight-panel {
  height: 100%;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 28px rgba(70, 130, 200, 0.08);

  :deep(.ant-card-body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px 12px 8px;
  }

  :deep(.ant-segmented) {
    background: #eef4fb;
    border-radius: 999px;
    padding: 2px;
  }

  :deep(.ant-segmented-group) {
    border-radius: 999px;
  }

  :deep(.ant-segmented-item),
  :deep(.ant-segmented-thumb) {
    border-radius: 999px;
  }

  :deep(.ant-segmented-thumb) {
    background: #1677ff;
  }

  :deep(.ant-segmented-item-label) {
    min-height: 26px;
    padding: 0 8px;
    font-size: 12px;
    line-height: 26px;
    color: #667085;
  }

  :deep(.ant-segmented-item-selected) {
    background: #1677ff !important;
  }

  :deep(.ant-segmented-item-selected),
  :deep(.ant-segmented-item-selected .ant-segmented-item-label) {
    color: #fff !important;
  }

  &.is-wrap :deep(.ant-segmented-group) {
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 680px;
    row-gap: 4px;
  }
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  h3 {
    margin: 0;
    color: #1d2939;
    font-size: 15px;
    font-weight: 600;
    line-height: 24px;
    white-space: nowrap;
  }
}

.panel-mark {
  width: 4px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(180deg, #69b1ff 0%, #1677ff 100%);
}
</style>
