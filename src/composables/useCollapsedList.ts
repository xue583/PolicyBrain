import {
  computed,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

/** 筛选项“更多/收起”：collapsedCount 条以内收起展示 */
export function useCollapsedList<T>(
  source: MaybeRefOrGetter<T[]>,
  collapsedCount: number,
  options: { initialExpanded?: boolean } = {},
): { showMore: Ref<boolean>; visibleList: ComputedRef<T[]> } {
  const showMore = ref(options.initialExpanded ?? false)

  const visibleList = computed(() => {
    const list = toValue(source)
    return showMore.value ? list : list.slice(0, collapsedCount)
  })

  return { showMore, visibleList }
}
