<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'

defineOptions({ name: 'PagedTable', inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    total: number
    pageSize?: number
    /** 自动追加“序号”列并注入序号单元格（columns 里已含 index 列时跳过） */
    withIndex?: boolean
    indexWidth?: number
    showPagination?: boolean
    showTotal?: (t: number) => string
    quickJumper?: boolean
  }>(),
  {
    pageSize: 10,
    withIndex: true,
    indexWidth: 72,
    showPagination: true,
    showTotal: (t: number) => `共 ${t} 条`,
    quickJumper: false,
  },
)

const current = defineModel<number>('current', { required: true })

const attrs = useAttrs()
const slots = useSlots()

const tableAttrs = computed(() => {
  const {
    class: _class,
    style: _style,
    'onUpdate:current': _onUpdateCurrent,
    ...rest
  } = attrs
  return rest
})

const tableColumns = computed(() => {
  const cols =
    (attrs.columns as Array<Record<string, unknown>> | undefined) ?? []
  if (!props.withIndex) return cols
  if (cols.some((col) => col.key === 'index')) return cols
  return [
    { title: '序号', key: 'index', width: props.indexWidth, align: 'center' },
    ...cols,
  ]
})

const passthroughSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name !== 'bodyCell'),
)
</script>

<template>
  <div class="paged-table">
    <a-table
      class="db-table"
      bordered
      size="middle"
      :pagination="false"
      v-bind="tableAttrs"
      :columns="tableColumns"
    >
      <template #bodyCell="slotProps">
        <slot name="bodyCell" v-bind="slotProps ?? {}" />
        <template
          v-if="
            withIndex &&
            (slotProps as { column?: { key?: string } } | undefined)?.column
              ?.key === 'index'
          "
        >
          {{
            (current - 1) * pageSize +
            ((slotProps as { index?: number } | undefined)?.index ?? 0) +
            1
          }}
        </template>
      </template>
      <template
        v-for="name in passthroughSlotNames"
        :key="name"
        #[name]="slotProps"
      >
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </a-table>

    <div v-if="showPagination" class="pagination-wrap">
      <a-pagination
        v-model:current="current"
        :total="total"
        :page-size="pageSize"
        :show-quick-jumper="quickJumper"
        :show-total="showTotal"
      />
    </div>
  </div>
</template>
