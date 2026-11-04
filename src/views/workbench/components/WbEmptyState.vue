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
  <a-empty class="wb-empty">
    <template #image>
      <img
        :src="image"
        alt=""
        class="empty-img"
        :style="{ width: `${imageWidth}px` }"
      />
    </template>
    <template #description>
      <p class="empty-text">{{ text }}</p>
    </template>
  </a-empty>
</template>

<style scoped lang="scss">
.wb-empty.ant-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;

  :deep(.ant-empty-image) {
    height: auto;
    margin: 0;

    img {
      height: auto;
    }
  }

  :deep(.ant-empty-description) {
    margin: 0;
  }
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
