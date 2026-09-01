import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { triggerNeedLogin } from '@/utils/auth'

export type UseFollowableReturn = {
  followed: Ref<boolean>
  toggleFollow: () => void
  syncFollowed: () => void
}

const loadFollowedIds = (storageKey: string): number[] => {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function useFollowable(
  storageKey: string,
  id: MaybeRefOrGetter<number>,
): UseFollowableReturn {
  const auth = useAuthStore()
  const { isLoggedIn } = storeToRefs(auth)
  const followed = ref(false)

  const syncFollowed = () => {
    followed.value = loadFollowedIds(storageKey).includes(toValue(id))
  }

  const toggleFollow = () => {
    if (!isLoggedIn.value) {
      triggerNeedLogin()
      return
    }
    const currentId = toValue(id)
    const ids = loadFollowedIds(storageKey)
    const next = followed.value
      ? ids.filter((item) => item !== currentId)
      : [...ids, currentId]
    localStorage.setItem(storageKey, JSON.stringify(next))
    followed.value = !followed.value
    message.success(followed.value ? '关注成功' : '已取消关注')
  }

  watch(() => toValue(id), syncFollowed, { immediate: true, flush: 'sync' })

  return { followed, toggleFollow, syncFollowed }
}
