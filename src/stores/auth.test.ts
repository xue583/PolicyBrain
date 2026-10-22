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

const {
  createSession,
  fetchCurrentUser,
  logoutSession,
  sendSmsCode,
  updateCurrentUser,
  verifySmsCode,
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
    await auth.loginBySms('13900000000', '1234')

    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '1234',
    })
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.nickname).toBe('李四')
    expect(localStorage.getItem('pb_access_token')).toBe('access')
  })

  it('creates a register session on the same endpoint and forwards invite code', async () => {
    vi.mocked(createSession).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    vi.mocked(fetchCurrentUser).mockResolvedValue({ phone: '13900000000' })

    const auth = useAuthStore()
    await auth.loginBySms('13900000000', '1234', 'INVITE01')

    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '1234',
      inviteCode: 'INVITE01',
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

  it('stores the profile returned by identity update', async () => {
    vi.mocked(updateCurrentUser).mockResolvedValue({
      id: 8,
      phone: '13900000000',
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
      unifiedSocialCreditCode: '91410000MA9ABCDE12',
      jobTitle: '经理',
      nickname: '李四',
      inviter: '张三',
      invitationCode: 'ABC123',
      avatar: '',
      lastLoginTime: '2026-10-22T07:32:19.174Z',
    })

    const auth = useAuthStore()
    await auth.updateProfile({
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
      unifiedSocialCreditCode: '91410000MA9ABCDE12',
      jobTitle: '经理',
      nickname: '李四',
    })

    expect(auth.user?.invitationCode).toBe('ABC123')
    expect(auth.user?.inviter).toBe('张三')
    expect(auth.user?.lastLoginTime).toBe('2026-10-22T07:32:19.174Z')
    expect(localStorage.getItem('pb_user')).toContain('ABC123')
  })

  it('verifies sms with phone and code only', async () => {
    vi.mocked(verifySmsCode).mockResolvedValue({})

    const auth = useAuthStore()
    await auth.verifyRegisterCode('13900000000', '1234')

    expect(verifySmsCode).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '1234',
    })
  })

  it('sends sms with phone only', async () => {
    vi.mocked(sendSmsCode).mockResolvedValue({})

    const auth = useAuthStore()
    await auth.requestSmsCode('13900000000')

    expect(sendSmsCode).toHaveBeenCalledWith({
      phone: '13900000000',
    })
  })
})
