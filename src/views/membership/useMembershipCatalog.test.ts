import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMembershipPlans: vi.fn(async () => []),
    fetchMembershipBenefits: vi.fn(async () => []),
  }
})

const { fetchMembershipPlans } = await import('@/api/membership')
const { resetMembershipCatalog, useMembershipCatalog } =
  await import('./useMembershipCatalog')

describe('useMembershipCatalog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetMembershipCatalog()
    vi.clearAllMocks()
  })

  it('reuses the catalog for the same signed-in session', async () => {
    const auth = useAuthStore()
    auth.token = 'access'
    const first = useMembershipCatalog()
    const second = useMembershipCatalog()

    await first.loadCatalog()
    await second.loadCatalog()

    expect(fetchMembershipPlans).toHaveBeenCalledTimes(3)
  })

  it('does not request plans for a guest', async () => {
    await useMembershipCatalog().loadCatalog()
    expect(fetchMembershipPlans).not.toHaveBeenCalled()
  })
})
