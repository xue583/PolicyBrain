import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'
import { toErrorMessage } from '@/utils/apiError'
import {
  FOLLOW_ENTERPRISE,
  FOLLOW_POLICY,
  fetchAccountFollows,
  followTarget,
  unfollowTarget,
  type FollowTargetType,
} from '@/api/account'

export { FOLLOW_ENTERPRISE, FOLLOW_POLICY }
export type { FollowTargetType }

export type UseFollowableReturn = {
  followed: Ref<boolean>
  toggleFollow: () => Promise<void>
  syncFollowed: () => Promise<void>
}

const PAGE_SIZE = 200
const MAX_PAGES = 20

type Bucket = {
  ids: Ref<string[] | null>
  promise: Promise<void> | null
  revision: number
}

const createBucket = (): Bucket => ({
  ids: ref(null),
  promise: null,
  revision: 0,
})

const buckets: Record<FollowTargetType, Bucket> = {
  [FOLLOW_ENTERPRISE]: createBucket(),
  [FOLLOW_POLICY]: createBucket(),
}

let authBound = false

/** 退出登录或测试隔离时丢掉已缓存的关注 id */
export const resetFollowCache = () => {
  for (const bucket of Object.values(buckets)) {
    bucket.revision += 1
    bucket.ids.value = null
    bucket.promise = null
  }
}

export const rememberFollow = (type: FollowTargetType, id: string) => {
  const current = buckets[type].ids.value
  if (!current || current.includes(id)) return
  buckets[type].ids.value = [...current, id]
}

export const forgetFollow = (type: FollowTargetType, id: string) => {
  const current = buckets[type].ids.value
  if (!current || !current.includes(id)) return
  buckets[type].ids.value = current.filter((item) => item !== id)
}

const includesId = (type: FollowTargetType, id: string) =>
  (buckets[type].ids.value ?? []).includes(id)

const loadFollowIds = (type: FollowTargetType): Promise<void> => {
  const bucket = buckets[type]
  if (bucket.ids.value) return Promise.resolve()
  if (bucket.promise) return bucket.promise

  const seen = bucket.revision
  const task = (async () => {
    const ids: string[] = []
    let pageIndex = 1
    let total = Number.POSITIVE_INFINITY
    while ((pageIndex - 1) * PAGE_SIZE < total && pageIndex <= MAX_PAGES) {
      const page = await fetchAccountFollows({
        targetType: type,
        pageIndex,
        pageSize: PAGE_SIZE,
      })
      total = page.totalElements
      for (const item of page.items) {
        const id = item.targetId?.trim()
        if (id && /^\d+$/.test(id)) ids.push(id)
      }
      if (!page.items.length) break
      pageIndex += 1
    }
    if (bucket.revision !== seen || !useAuthStore().isLoggedIn) return
    bucket.ids.value = ids
  })()

  bucket.promise = task.finally(() => {
    if (bucket.promise === task) bucket.promise = null
  })
  return bucket.promise
}

const bindAuthReset = () => {
  if (authBound) return
  authBound = true
  const auth = useAuthStore()
  watch(
    () => auth.isLoggedIn,
    (logged, prev) => {
      if (!logged && prev) resetFollowCache()
    },
  )
}

const pendingKeys = ref<string[]>([])

const toggleTarget = async (type: FollowTargetType, id: string) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    triggerNeedLogin()
    return
  }
  if (!id) return
  const key = `${type}:${id}`
  if (pendingKeys.value.includes(key)) return
  pendingKeys.value = [...pendingKeys.value, key]
  try {
    await loadFollowIds(type)
    const wasFollowed = includesId(type, id)
    if (wasFollowed) {
      await unfollowTarget(type, id)
      forgetFollow(type, id)
      message.success('已取消关注')
      return
    }
    await followTarget(type, id)
    rememberFollow(type, id)
    message.success('关注成功')
  } catch (err) {
    message.error(
      toErrorMessage(err, includesId(type, id) ? '取消关注失败' : '关注失败'),
    )
  } finally {
    pendingKeys.value = pendingKeys.value.filter((item) => item !== key)
  }
}

/** 同一类关注对象的批量判断，列表页共用一次查询 */
export function useFollowSet(targetType: FollowTargetType) {
  bindAuthReset()
  const auth = useAuthStore()
  const { isLoggedIn } = storeToRefs(auth)

  const refresh = async () => {
    if (!isLoggedIn.value) return
    try {
      await loadFollowIds(targetType)
    } catch {
      // 列表先按未关注展示，点击时再给出失败提示
    }
  }

  watch(isLoggedIn, () => void refresh(), { immediate: true })

  const isFollowed = (id: string) => includesId(targetType, id)
  const toggleFollow = (id: string) => toggleTarget(targetType, id)

  return { isFollowed, toggleFollow, refresh }
}

export function useFollowable(
  targetType: FollowTargetType,
  id: MaybeRefOrGetter<string>,
): UseFollowableReturn {
  bindAuthReset()
  const auth = useAuthStore()
  const { isLoggedIn } = storeToRefs(auth)
  const followed = ref(false)

  const syncFollowed = () => {
    if (!isLoggedIn.value) {
      followed.value = false
      return
    }
    followed.value = includesId(targetType, toValue(id))
  }

  const refresh = async () => {
    if (!isLoggedIn.value) {
      followed.value = false
      return
    }
    try {
      await loadFollowIds(targetType)
    } catch {
      followed.value = false
      return
    }
    syncFollowed()
  }

  watch(
    () => [toValue(id), isLoggedIn.value] as const,
    () => {
      syncFollowed()
      void refresh()
    },
    { immediate: true, flush: 'sync' },
  )
  watch(() => buckets[targetType].ids.value, syncFollowed, { flush: 'sync' })

  const toggleFollow = () => toggleTarget(targetType, toValue(id))

  return { followed, toggleFollow, syncFollowed: refresh }
}
