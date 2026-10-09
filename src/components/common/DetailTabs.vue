<script setup lang="ts">
defineOptions({ name: 'DetailTabs' })
</script>

<!-- 等宽顶部高亮页签；activeKey 等属性透传给 a-tabs，响应式内边距由各详情页按自身断点覆盖 -->
<template>
  <a-tabs class="detail-tabs" :tab-bar-gutter="0">
    <slot />
  </a-tabs>
</template>

<style scoped lang="scss">
.detail-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;

    &::before {
      border-bottom: none;
    }
  }

  :deep(.ant-tabs-nav-wrap) {
    overflow: hidden;
  }

  :deep(.ant-tabs-nav-list) {
    width: 100%;
    display: flex;
  }

  :deep(.ant-tabs-nav-operations) {
    display: none;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    justify-content: center;
    margin: 0;
    padding: 16px 8px;
    font-size: 16px;
    color: #262626;
    background: #fff;
    position: relative;

    + .ant-tabs-tab {
      border-left: 1px solid #e8e8e8;
    }

    .ant-tabs-tab-btn {
      color: inherit;
    }

    &:hover {
      color: var(--pb-primary);
    }

    &.ant-tabs-tab-active {
      color: var(--pb-primary);
      font-weight: 600;
      background: linear-gradient(
        180deg,
        rgba(174, 205, 255, 0.57) 0%,
        rgba(174, 205, 255, 0) 100%
      );

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--pb-primary);
      }
    }
  }

  :deep(.ant-tabs-ink-bar) {
    display: none;
  }

  :deep(.ant-tabs-content-holder) {
    padding: 20px 36px 28px;
  }
}
</style>
