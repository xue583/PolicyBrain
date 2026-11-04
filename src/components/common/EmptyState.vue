<script setup lang="ts">
defineOptions({ name: 'EmptyState' })

withDefaults(
  defineProps<{
    image: string
    text?: string
    imageWidth?: number
  }>(),
  { text: '暂无数据', imageWidth: 150 },
)
</script>

<template>
  <a-empty class="pb-empty">
    <template #image>
      <img :src="image" alt="" :style="{ width: `${imageWidth}px` }" />
    </template>
    <template #description>
      <p class="pb-empty-text">{{ text }}</p>
    </template>
  </a-empty>
</template>

<style scoped lang="scss">
.pb-empty.ant-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--empty-gap, 20px);
  margin: 0;
  padding: var(--empty-padding, 40px 0 48px);
  background: white;
  border-radius: 20px;

  :deep(.ant-empty-image) {
    height: auto;
    margin: 0;

    img {
      height: auto;
      object-fit: contain;
      user-select: none;
    }
  }

  :deep(.ant-empty-description) {
    margin: 0;
  }
}

.pb-empty-text {
  margin: 0;
  font-size: var(--empty-text-size, 18px);
  font-weight: var(--empty-text-weight, 600);
  color: var(--empty-text-color, var(--pb-primary));
}
</style>
