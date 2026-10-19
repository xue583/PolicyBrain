import { onMounted, ref, watch, type Ref, type WatchSource } from 'vue'
import type { PageData } from '@/api/paging'
import { toErrorMessage } from '@/utils/apiError'

export function useServerPage<T>(
  load: (pageIndex: number, pageSize: number) => Promise<PageData<T>>,
  query: WatchSource<string>,
  pageSize = 10,
) {
  const currentPage = ref(1)
  const total = ref(0)
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref('')
  let seq = 0

  const reload = async () => {
    const id = ++seq
    loading.value = true
    error.value = ''
    try {
      const page = await load(currentPage.value, pageSize)
      if (id !== seq) return
      items.value = page.items
      total.value = page.totalElements
    } catch (err) {
      if (id !== seq) return
      items.value = []
      total.value = 0
      error.value = toErrorMessage(err)
    } finally {
      if (id === seq) loading.value = false
    }
  }

  watch(query, () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    void reload()
  })

  watch(currentPage, () => {
    void reload()
  })

  onMounted(() => {
    void reload()
  })

  return { currentPage, pageSize, total, items, loading, error, reload }
}
