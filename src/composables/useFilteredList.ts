import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  usePagination,
  type UsePaginationOptions,
  type UsePaginationReturn,
} from './usePagination'

export type UseFilteredListReturn<T> = UsePaginationReturn<T> & {
  filteredList: ComputedRef<T[]>
}

/** Paginate an already-filtered list. Call `resetPage` when filter criteria change. */
export function useFilteredList<T>(
  source: MaybeRefOrGetter<T[]>,
  options: UsePaginationOptions = {},
): UseFilteredListReturn<T> {
  const filteredList = computed(() => toValue(source))
  return {
    filteredList,
    ...usePagination(filteredList, options),
  }
}
