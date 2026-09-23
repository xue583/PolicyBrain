import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearToken,
  getRefreshToken,
  getStoredUser,
  getToken,
  onNeedLogin,
  pickTokens,
  saveSessionTokens,
  setStoredUser,
  setToken,
  triggerNeedLogin,
} from './auth'

describe('pickTokens', () => {
  it('returns empty for non-objects', () => {
    expect(pickTokens(null)).toEqual({})
    expect(pickTokens('token')).toEqual({})
  })

  it('reads nested data and alias fields', () => {
    expect(
      pickTokens({
        data: {
          access_token: 'a',
          refresh_token: 'r',
          accessTokenExpires: 'e',
          refresh_expires: 're',
        },
      }),
    ).toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      expires: 'e',
      refreshTokenExpires: 're',
    })
  })
})

describe('auth storage', () => {
  beforeEach(() => {
    localStorage.clear()
    clearToken()
  })

  it('stores and clears session tokens', () => {
    setToken('access')
    expect(getToken()).toBe('access')

    saveSessionTokens({
      accessToken: 'a2',
      refreshToken: 'r2',
      expires: 'e2',
      refreshTokenExpires: 're2',
    })
    expect(getToken()).toBe('a2')
    expect(getRefreshToken()).toBe('r2')

    clearToken()
    expect(getToken()).toBe('')
    expect(getRefreshToken()).toBe('')
  })

  it('round-trips stored user and ignores bad json', () => {
    setStoredUser({ nickname: '张三', phone: '13800000000' })
    expect(getStoredUser()?.nickname).toBe('张三')

    setStoredUser(null)
    expect(getStoredUser()).toBeNull()

    localStorage.setItem('pb_user', '{not-json')
    expect(getStoredUser()).toBeNull()
  })
})

describe('need login', () => {
  it('replays the request if the modal has not subscribed yet', () => {
    const seen: number[] = []
    triggerNeedLogin()
    const off = onNeedLogin(() => seen.push(1))
    expect(seen).toEqual([1])

    triggerNeedLogin()
    expect(seen).toEqual([1, 1])
    off()
  })
})
