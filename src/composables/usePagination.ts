import {
  computed,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export type UsePaginationOptions = {
  pageSize?: number
}

export type UsePaginationReturn<T> = {
  currentPage: Ref<number>
  pageSize: number
  total: ComputedRef<number>
  pagedList: ComputedRef<T[]>
  resetPage: () => void
}

export function usePagination<T>(
  source: MaybeRefOrGetter<T[]>,
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const pageSize = options.pageSize ?? 10
  const currentPage = ref(1)

  const total = computed(() => toValue(source).length)

  const pagedList = computed(() => {
    const list = toValue(source)
    const start = (currentPage.value - 1) * pageSize
    return list.slice(start, start + pageSize)
  })

  const resetPage = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    total,
    pagedList,
    resetPage,
  }
}
