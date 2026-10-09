<script setup lang="ts">
import emptySearchImg from '@/assets/workbench/wb-empty-search.png'

defineOptions({ name: 'WbEmptyState' })

withDefaults(
  defineProps<{
    text: string
    image?: string
    imageWidth?: number
  }>(),
  { image: emptySearchImg, imageWidth: 180 },
)
</script>

<template>
  <div class="wb-empty">
    <img
      :src="image"
      alt=""
      class="empty-img"
      :style="{ width: `${imageWidth}px` }"
    />
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
.wb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-img {
  object-fit: contain;
}

.empty-text {
  margin: 14px 0 0;
  color: #999;
  font-size: 14px;
}
</style>
