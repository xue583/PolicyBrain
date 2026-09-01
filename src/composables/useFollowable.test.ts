import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

vi.mock('ant-design-vue', () => ({
  message: { success: vi.fn(), info: vi.fn() },
}))

vi.mock('@/utils/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/auth')>('@/utils/auth')
  return {
    ...actual,
    triggerNeedLogin: vi.fn(),
  }
})

const { message } = await import('ant-design-vue')
const { triggerNeedLogin } = await import('@/utils/auth')
const { useFollowable } = await import('./useFollowable')

const STORAGE_KEY = 'pb_test_follow'

describe('useFollowable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('asks for login when the user is anonymous', () => {
    const { toggleFollow, followed } = useFollowable(STORAGE_KEY, 1)
    toggleFollow()
    expect(triggerNeedLogin).toHaveBeenCalledOnce()
    expect(followed.value).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('persists follow and unfollow for a logged-in user', () => {
    const auth = useAuthStore()
    auth.token = 'token'

    const id = ref(8)
    const { followed, toggleFollow } = useFollowable(STORAGE_KEY, id)

    expect(followed.value).toBe(false)
    toggleFollow()
    expect(followed.value).toBe(true)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([8])
    expect(message.success).toHaveBeenCalledWith('关注成功')

    toggleFollow()
    expect(followed.value).toBe(false)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([])
    expect(message.success).toHaveBeenCalledWith('已取消关注')
  })

  it('re-syncs when the target id changes', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([2]))
    const id = ref(1)
    const { followed } = useFollowable(STORAGE_KEY, id)
    expect(followed.value).toBe(false)
    id.value = 2
    expect(followed.value).toBe(true)
  })
})
