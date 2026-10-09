<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'

defineOptions({ name: 'WbPagination' })

const props = withDefaults(
  defineProps<{
    current: number
    total: number
    pageSize?: number
  }>(),
  { pageSize: 10 },
)

const emit = defineEmits<{ 'update:current': [page: number] }>()

/** 文案对齐原手写分页：“共X条 … 前往 X 页” */
const locale = {
  ...zhCN,
  Pagination: { ...zhCN.Pagination, jump_to: '前往' },
}

const showTotal = (total: number) => `共${total}条`

const onChange = (page: number) => {
  emit('update:current', page)
}
</script>

<template>
  <a-config-provider :locale="locale">
    <a-pagination
      class="wb-pager"
      :current="props.current"
      :total="props.total"
      :page-size="props.pageSize"
      :show-size-changer="false"
      show-quick-jumper
      :show-total="showTotal"
      @change="onChange"
    />
  </a-config-provider>
</template>

<style scoped lang="scss">
.wb-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  color: #333;
  font-size: 14px;

  :deep(.ant-pagination-total-text) {
    color: #333;
  }

  :deep(.ant-pagination-item) {
    min-width: 26px;
    height: 26px;
    font-size: 14px;
    line-height: 24px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;

    a {
      color: #333;
    }

    &:hover {
      border-color: transparent;

      a {
        color: var(--pb-primary);
      }
    }

    &.ant-pagination-item-active {
      background: var(--pb-primary);
      border-color: var(--pb-primary);

      a,
      a:hover {
        color: #fff;
      }
    }
  }

  :deep(.ant-pagination-prev .ant-pagination-item-link),
  :deep(.ant-pagination-next .ant-pagination-item-link) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 26px;
    color: #999;
    font-size: 12px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
  }

  :deep(.ant-pagination-prev .ant-pagination-item-link:hover),
  :deep(.ant-pagination-next .ant-pagination-item-link:hover) {
    color: var(--pb-primary);
  }

  :deep(.ant-pagination-disabled .ant-pagination-item-link) {
    color: #d9d9d9;
  }

  :deep(.ant-pagination-jump-prev),
  :deep(.ant-pagination-jump-next) {
    color: #d9d9d9;
  }

  :deep(.ant-pagination-options-quick-jumper) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
    color: #333;
  }

  :deep(.ant-pagination-options-quick-jumper-input) {
    width: 40px;
    height: 26px;
    color: #333;
    font-size: 13px;
    text-align: center;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &:focus {
      border-color: var(--pb-primary);
      box-shadow: none;
    }
  }
}
</style>
