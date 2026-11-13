import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearInviteCode,
  clearSession,
  getInviteCode,
  getStoredUser,
  hasSession,
  onNeedLogin,
  rememberInviteCode,
  setStoredUser,
  triggerNeedLogin,
} from './auth'

describe('invite code', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('remembers a trimmed invite code from the invite link', () => {
    rememberInviteCode('  AB12  ')
    expect(getInviteCode()).toBe('AB12')
    clearInviteCode()
    expect(getInviteCode()).toBe('')
  })
})

describe('cookie session hints', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('uses only the non-sensitive profile as the local session hint', () => {
    expect(hasSession()).toBe(false)
    setStoredUser({ nickname: '张三', phone: '13800000000' })
    expect(hasSession()).toBe(true)
    expect(getStoredUser()?.nickname).toBe('张三')

    clearSession()
    expect(hasSession()).toBe(false)
    expect(getStoredUser()).toBeNull()
  })

  it('ignores malformed stored profile json', () => {
    localStorage.setItem('pb_user', '{not-json')
    expect(getStoredUser()).toBeNull()
    expect(hasSession()).toBe(false)
  })

  it('removes legacy access and refresh tokens from both storage areas', () => {
    const keys = [
      'pb_access_token',
      'pb_refresh_token',
      'pb_token_expires',
      'pb_refresh_expires',
    ]
    for (const storage of [localStorage, sessionStorage]) {
      keys.forEach((key) => storage.setItem(key, 'legacy-secret'))
    }

    clearSession()

    for (const storage of [localStorage, sessionStorage]) {
      keys.forEach((key) => expect(storage.getItem(key)).toBeNull())
    }
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
