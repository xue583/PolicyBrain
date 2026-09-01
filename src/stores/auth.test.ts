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
}))

const { createSession, fetchCurrentUser, logoutSession } =
  await import('@/api/auth')

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
    await auth.loginBySms('13900000000', '123456')

    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.nickname).toBe('李四')
    expect(localStorage.getItem('pb_access_token')).toBe('access')
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
})
