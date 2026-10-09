<script setup lang="ts">
defineOptions({ name: 'PaginationBar' })

withDefaults(
  defineProps<{
    total: number
    pageSize?: number
    align?: 'left' | 'center' | 'right'
    quickJumper?: boolean
    /** 总条数跟随分页器渲染（a-pagination show-total），否则独立前缀展示 */
    totalInline?: boolean
  }>(),
  {
    pageSize: 10,
    align: 'center',
    quickJumper: false,
    totalInline: false,
  },
)

const current = defineModel<number>('current', { required: true })

const showTotal = (t: number) => `共 ${t} 条`
</script>

<template>
  <div class="pb-pagination" :class="`is-${align}`">
    <span v-if="!totalInline" class="pb-pagination-total">共{{ total }}条</span>
    <a-pagination
      v-model:current="current"
      :total="total"
      :page-size="pageSize"
      :show-size-changer="false"
      :show-quick-jumper="quickJumper"
      :show-total="totalInline ? showTotal : undefined"
    />
  </div>
</template>

<style scoped lang="scss">
.pb-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: var(--pagination-space, 24px 0 8px);

  &.is-left {
    justify-content: flex-start;
  }

  &.is-center {
    justify-content: center;
  }

  &.is-right {
    justify-content: flex-end;
  }
}

.pb-pagination-total {
  font-size: 14px;
  font-weight: 600;
  color: var(--pb-text);
}
</style>
