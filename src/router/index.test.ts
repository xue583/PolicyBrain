import { beforeEach, describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { applyAuthGuard, router } from './index'
import { clearToken, onNeedLogin, setToken } from '@/utils/auth'

const authRoute = {
  name: 'personal-center',
  meta: { title: '个人中心', requiresAuth: true },
  matched: [{ meta: { requiresAuth: true } }],
} as unknown as RouteLocationNormalized

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

  it('sends guests away from the workspace and data export', () => {
    for (const name of ['workspace', 'export'] as const) {
      const to = router.resolve({ name })
      expect(to.meta.requiresAuth).toBe(true)
      expect(applyAuthGuard(to as unknown as RouteLocationNormalized)).toEqual({
        name: 'home',
      })
    }
  })

  it('keeps the membership page open for guests', () => {
    const to = router.resolve({ name: 'membership' })
    expect(to.meta.requiresAuth).toBeUndefined()
    expect(applyAuthGuard(to as unknown as RouteLocationNormalized)).toBe(true)
  })
})
