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
  <div class="pb-empty">
    <img :src="image" alt="" :style="{ width: `${imageWidth}px` }" />
    <p class="pb-empty-text">{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
.pb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--empty-gap, 20px);
  padding: var(--empty-padding, 40px 0 48px);

  img {
    height: auto;
    object-fit: contain;
    user-select: none;
  }
}

.pb-empty-text {
  margin: 0;
  font-size: var(--empty-text-size, 18px);
  font-weight: var(--empty-text-weight, 600);
  color: var(--empty-text-color, var(--pb-primary));
}
</style>
