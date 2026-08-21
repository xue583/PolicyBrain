<script setup lang="ts">
import emptyImage from '../../assets/export/empty.png'

defineOptions({ name: 'ExportEmptyState' })

defineProps<{
  title: string
  description: string
  note?: string
}>()

const imageStyle = { height: '208px' }
</script>

<template>
  <div class="empty-state">
    <a-empty :image="emptyImage" :image-style="imageStyle">
      <template #description>
        <span class="empty-title">{{ title }}</span>
        <span class="empty-desc">{{ description }}</span>
        <span v-if="note" class="empty-desc">{{ note }}</span>
      </template>
    </a-empty>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  padding: 40px 16px;

  :deep(.ant-empty-image) {
    margin-bottom: 12px;
  }

  :deep(.ant-empty-description) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
}

.empty-title {
  margin: 5px;
  font-size: 24px;
  font-weight: 600;
  line-height: 26px;
  color: var(--pb-primary);
}

.empty-desc {
  font-size: 14px;
  line-height: 20px;
  color: #999;
}
</style>
