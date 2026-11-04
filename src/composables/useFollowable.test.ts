import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { FOLLOW_ENTERPRISE, FOLLOW_POLICY } from '@/api/account'

vi.mock('ant-design-vue', () => ({
  message: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}))

vi.mock('@/utils/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/auth')>('@/utils/auth')
  return {
    ...actual,
    triggerNeedLogin: vi.fn(),
  }
})

vi.mock('@/api/account', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/account')>('@/api/account')
  return {
    ...actual,
    fetchAccountFollows: vi.fn(),
    followTarget: vi.fn(),
    unfollowTarget: vi.fn(),
  }
})

const { message } = await import('ant-design-vue')
const { triggerNeedLogin } = await import('@/utils/auth')
const { fetchAccountFollows, followTarget, unfollowTarget } =
  await import('@/api/account')
const { resetFollowCache, useFollowable } = await import('./useFollowable')

const emptyPage = {
  items: [],
  pageIndex: 1,
  pageSize: 200,
  totalElements: 0,
}

describe('useFollowable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetFollowCache()
    vi.clearAllMocks()
    vi.mocked(fetchAccountFollows).mockResolvedValue(emptyPage)
    vi.mocked(followTarget).mockResolvedValue(undefined)
    vi.mocked(unfollowTarget).mockResolvedValue(undefined)
  })

  it('asks for login when the user is anonymous', async () => {
    const { toggleFollow, followed } = useFollowable(FOLLOW_POLICY, 1)
    await toggleFollow()
    expect(triggerNeedLogin).toHaveBeenCalledOnce()
    expect(followed.value).toBe(false)
    expect(followTarget).not.toHaveBeenCalled()
    expect(unfollowTarget).not.toHaveBeenCalled()
  })

  it('follows and unfollows through the account API', async () => {
    const auth = useAuthStore()
    auth.token = 'token'

    const id = ref(8)
    const { followed, toggleFollow, syncFollowed } = useFollowable(
      FOLLOW_POLICY,
      id,
    )
    await syncFollowed()
    expect(followed.value).toBe(false)
    expect(fetchAccountFollows).toHaveBeenCalledWith({
      targetType: FOLLOW_POLICY,
      pageIndex: 1,
      pageSize: 200,
    })

    await toggleFollow()
    expect(followTarget).toHaveBeenCalledWith(FOLLOW_POLICY, 8)
    expect(followed.value).toBe(true)
    expect(message.success).toHaveBeenCalledWith('关注成功')

    await toggleFollow()
    expect(unfollowTarget).toHaveBeenCalledWith(FOLLOW_POLICY, 8)
    expect(followed.value).toBe(false)
    expect(message.success).toHaveBeenCalledWith('已取消关注')
  })

  it('re-syncs when the target id changes', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    vi.mocked(fetchAccountFollows).mockResolvedValue({
      items: [{ targetId: 2, followId: 9, targetType: FOLLOW_ENTERPRISE }],
      pageIndex: 1,
      pageSize: 200,
      totalElements: 1,
    })

    const id = ref(1)
    const { followed, syncFollowed } = useFollowable(FOLLOW_ENTERPRISE, id)
    await syncFollowed()
    expect(followed.value).toBe(false)
    id.value = 2
    expect(followed.value).toBe(true)
  })

  it('keeps paging until every followed id is loaded', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    vi.mocked(fetchAccountFollows).mockImplementation(async (query) => {
      if (query?.pageIndex === 2) {
        return {
          items: [
            { targetId: 999, followId: 3, targetType: FOLLOW_ENTERPRISE },
          ],
          pageIndex: 2,
          pageSize: 200,
          totalElements: 201,
        }
      }
      return {
        items: Array.from({ length: 200 }, (_, index) => ({
          targetId: index + 1,
          followId: index + 1,
          targetType: FOLLOW_ENTERPRISE,
        })),
        pageIndex: 1,
        pageSize: 200,
        totalElements: 201,
      }
    })

    const { followed, syncFollowed } = useFollowable(FOLLOW_ENTERPRISE, 999)
    await syncFollowed()
    expect(followed.value).toBe(true)
    expect(fetchAccountFollows).toHaveBeenCalledTimes(2)
  })
})
