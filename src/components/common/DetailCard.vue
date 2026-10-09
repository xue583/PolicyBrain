<script setup lang="ts">
defineOptions({ name: 'DetailCard' })

withDefaults(
  defineProps<{
    variant?: 'header' | 'content'
    /** 内容区贴边：去掉卡片 body 的 padding 与 margin */
    flush?: boolean
  }>(),
  { variant: 'content', flush: false },
)
</script>

<template>
  <a-card
    class="detail-card"
    :class="[
      variant === 'header' ? 'header-card' : 'content-card',
      { 'is-flush': flush },
    ]"
    :bordered="false"
  >
    <slot />
  </a-card>
</template>

<style scoped lang="scss">
.detail-card {
  border-radius: 16px;
  box-shadow: var(--pb-shadow-card);

  :deep(.ant-card-body) {
    padding: 28px 36px;
    margin-top: 22px;
  }

  &.header-card {
    margin-bottom: 16px;
    /* 渐变背景由使用方通过 --detail-header-bg 注入 */
    background: var(--detail-header-bg, none);
  }

  &.content-card {
    overflow: hidden;
  }

  &.is-flush :deep(.ant-card-body) {
    padding: 0;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .detail-card {
    :deep(.ant-card-body) {
      padding: 20px 16px;
    }
  }
}
</style>
