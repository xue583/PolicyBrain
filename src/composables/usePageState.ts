import { ref } from 'vue'

export function usePageState() {
  const loading = ref(false)
  const error = ref('')

  async function run<T>(task: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    error.value = ''
    try {
      return await task()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
      return undefined
    } finally {
      loading.value = false
    }
  }

  return { loading, error, run }
}
