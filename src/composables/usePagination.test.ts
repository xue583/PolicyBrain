import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { usePagination } from './usePagination'
import { useFilteredList } from './useFilteredList'

describe('usePagination', () => {
  it('slices the source list by page', () => {
    const list = ref([1, 2, 3, 4, 5])
    const { currentPage, pagedList, total, pageSize } = usePagination(list, {
      pageSize: 2,
    })

    expect(pageSize).toBe(2)
    expect(total.value).toBe(5)
    expect(pagedList.value).toEqual([1, 2])

    currentPage.value = 2
    expect(pagedList.value).toEqual([3, 4])

    currentPage.value = 3
    expect(pagedList.value).toEqual([5])
  })

  it('resetPage returns to the first page', () => {
    const list = ref([1, 2, 3, 4])
    const { currentPage, resetPage, pagedList } = usePagination(list, {
      pageSize: 2,
    })
    currentPage.value = 2
    resetPage()
    expect(currentPage.value).toBe(1)
    expect(pagedList.value).toEqual([1, 2])
  })
})

describe('useFilteredList', () => {
  it('exposes the filtered source and paginates it', () => {
    const all = ref([1, 2, 3, 4, 5, 6])
    const odd = () => all.value.filter((n) => n % 2 === 1)
    const { filteredList, pagedList, total, resetPage, currentPage } =
      useFilteredList(odd, { pageSize: 2 })

    expect(filteredList.value).toEqual([1, 3, 5])
    expect(total.value).toBe(3)
    expect(pagedList.value).toEqual([1, 3])

    currentPage.value = 2
    expect(pagedList.value).toEqual([5])
    resetPage()
    expect(pagedList.value).toEqual([1, 3])
  })
})
