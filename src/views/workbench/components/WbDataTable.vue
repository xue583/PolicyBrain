<script setup lang="ts">
defineOptions({ name: 'WbDataTable' })

withDefaults(
  defineProps<{
    /** 横向滚动时的表格最小宽度 */
    minWidth?: number
  }>(),
  { minWidth: 980 },
)
</script>

<template>
  <a-table
    class="wb-table"
    bordered
    :pagination="false"
    :scroll="{ x: minWidth }"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </a-table>
</template>

<style scoped lang="scss">
.wb-table {
  margin-top: 20px;

  :deep(.ant-table) {
    font-size: 14px;
  }

  // 表头：蓝底蓝字，与设计稿一致（.wb-table 即 .ant-table-wrapper 根元素，
  // 选择器不能带 .ant-table-wrapper 前缀，否则匹配不到）
  :deep(.ant-table-thead > tr > th) {
    color: #3f74b8;
    font-weight: 600;
    background: #e9f1fb;
    border-bottom: 1px solid #eef0f4;
    border-right: 1px solid #eef0f4;
    padding: 12px 14px;
    white-space: nowrap;
  }

  :deep(.ant-table-thead > tr > th:last-child) {
    border-right: none;
  }

  :deep(.ant-table-tbody > tr.ant-table-row > td) {
    color: #333;
    border-bottom: 1px solid #eef0f4;
    border-right: 1px solid #eef0f4;
    padding: 12px 14px;
    white-space: nowrap;
  }

  :deep(.ant-table-tbody > tr.ant-table-row > td:last-child) {
    border-right: none;
  }

  // 原表格无行悬浮高亮
  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #fff;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:last-child > td) {
    border-bottom: none;
  }

  :deep(.ant-table-placeholder .ant-table-cell) {
    padding: 40px 14px;
    color: #999;
    text-align: center;
    background: #fff;
  }
}
</style>
