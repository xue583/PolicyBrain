import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from './auth'

vi.mock('@/api/auth', () => ({
  createSession: vi.fn(),
  fetchCurrentUser: vi.fn(),
  logoutSession: vi.fn(),
  sendSmsCode: vi.fn(),
  updateCurrentUser: vi.fn(),
  verifySmsCode: vi.fn(),
  PolicySmsPurpose: { Register: 1, Login: 2 },
}))

const {
  createSession,
  fetchCurrentUser,
  logoutSession,
  sendSmsCode,
  PolicySmsPurpose,
} = await import('@/api/auth')

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('applies session tokens and loads the current user on sms login', async () => {
    vi.mocked(createSession).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      nickname: '李四',
      phone: '13900000000',
    })

    const auth = useAuthStore()
    await auth.loginBySms('13900000000', '123456', PolicySmsPurpose.Login)

    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '123456',
      purpose: 2,
    })
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.nickname).toBe('李四')
    expect(localStorage.getItem('pb_access_token')).toBe('access')
  })

  it('creates a register session with purpose 1', async () => {
    vi.mocked(createSession).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    vi.mocked(fetchCurrentUser).mockResolvedValue({ phone: '13900000000' })

    const auth = useAuthStore()
    await auth.loginBySms('13900000000', '123456', PolicySmsPurpose.Register)

    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '123456',
      purpose: 1,
    })
  })

  it('clears local session even if logout api fails', async () => {
    localStorage.setItem('pb_access_token', 'access')
    const auth = useAuthStore()
    auth.token = 'access'
    vi.mocked(logoutSession).mockRejectedValue(new Error('network'))

    await auth.logout()

    expect(auth.isLoggedIn).toBe(false)
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('pb_access_token')).toBeNull()
  })

  it('loads the current user profile into the store', async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 1,
      phone: '19545670526',
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
    })

    const auth = useAuthStore()
    await auth.loadCurrentUser()

    expect(auth.user?.phone).toBe('19545670526')
    expect(auth.user?.companyName).toBe('河南省政策宝数字科技有限公司')
    expect(localStorage.getItem('pb_user')).toContain('19545670526')
  })

  it('keeps cached profile when hydrate fails for a non-auth reason', async () => {
    localStorage.setItem('pb_access_token', 'access')
    localStorage.setItem(
      'pb_user',
      JSON.stringify({ phone: '19545670526', identity: 1 }),
    )
    vi.mocked(fetchCurrentUser).mockRejectedValue(new Error('network'))

    const auth = useAuthStore()
    await auth.hydrateUser()

    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.phone).toBe('19545670526')
  })

  it('sends sms with the given purpose', async () => {
    vi.mocked(sendSmsCode).mockResolvedValue({})

    const auth = useAuthStore()
    await auth.requestSmsCode('13900000000', PolicySmsPurpose.Login)
    await auth.requestSmsCode('13900000000', PolicySmsPurpose.Register)

    expect(sendSmsCode).toHaveBeenNthCalledWith(1, {
      phone: '13900000000',
      purpose: 2,
    })
    expect(sendSmsCode).toHaveBeenNthCalledWith(2, {
      phone: '13900000000',
      purpose: 1,
    })
  })
})
