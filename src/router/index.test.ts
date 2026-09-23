import { beforeEach, describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { applyAuthGuard } from './index'
import { clearToken, onNeedLogin, setToken } from '@/utils/auth'

const authRoute = {
  name: 'personal-center',
  meta: { title: '个人中心', requiresAuth: true },
  matched: [{ meta: { requiresAuth: true } }],
} as RouteLocationNormalized

describe('applyAuthGuard', () => {
  beforeEach(() => {
    localStorage.clear()
    clearToken()
  })

  it('opens login and sends guests home', () => {
    const seen: number[] = []
    const off = onNeedLogin(() => seen.push(1))

    expect(applyAuthGuard(authRoute)).toEqual({ name: 'home' })
    expect(seen).toEqual([1])
    expect(document.title).toContain('个人中心')
    off()
  })

  it('allows the route when a session exists', () => {
    setToken('access')
    expect(applyAuthGuard(authRoute)).toBe(true)
  })
})
