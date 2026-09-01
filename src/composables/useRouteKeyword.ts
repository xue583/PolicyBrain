import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Read search keyword from the current route query. */
export function useRouteKeyword(queryKey = 'q') {
  const route = useRoute()
  return computed(() => String(route.query[queryKey] ?? ''))
}

export type UseSyncedSearchQueryOptions = {
  queryKey?: string
  /** When this value changes and the query is empty, clear the input. */
  clearWhen?: MaybeRefOrGetter<unknown>
}

export type UseSyncedSearchQueryReturn = {
  keyword: Ref<string>
  applyKeyword: () => void
}

/** Two-way sync between an input and `route.query`. */
export function useSyncedSearchQuery(
  options: UseSyncedSearchQueryOptions = {},
): UseSyncedSearchQueryReturn {
  const queryKey = options.queryKey ?? 'q'
  const route = useRoute()
  const router = useRouter()
  const keyword = ref(String(route.query[queryKey] ?? ''))

  const replaceQuery = (q: string) => {
    const current = String(route.query[queryKey] ?? '')
    if (q === current) return
    const nextQuery = { ...route.query }
    if (q) nextQuery[queryKey] = q
    else delete nextQuery[queryKey]
    void router.replace({ query: nextQuery })
  }

  watch(
    () => route.query[queryKey],
    (q) => {
      const next = String(q ?? '')
      if (keyword.value !== next) keyword.value = next
    },
  )

  if (options.clearWhen !== undefined) {
    watch(
      () => toValue(options.clearWhen),
      () => {
        if (!route.query[queryKey]) keyword.value = ''
      },
    )
  }

  const applyKeyword = () => {
    replaceQuery(keyword.value.trim())
  }

  return { keyword, applyKeyword }
}
