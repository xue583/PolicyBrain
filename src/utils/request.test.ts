import { describe, expect, it, vi } from 'vitest'

vi.mock('ant-design-vue', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    error: vi.fn(),
  },
}))

const { ApiError, shouldSkipRefresh, unwrapEnvelope } =
  await import('./request')

describe('unwrapEnvelope', () => {
  it('returns payload when it is not an envelope', () => {
    expect(unwrapEnvelope({ name: 'ok' }, 200)).toEqual({ name: 'ok' })
  })

  it('unwraps successful envelope data', () => {
    expect(
      unwrapEnvelope({ status: 200, data: { id: 1 }, message: 'ok' }, 200),
    ).toEqual({ id: 1 })
  })

  it('throws ApiError when envelope status is 4xx', () => {
    expect(() =>
      unwrapEnvelope({ status: 401, message: '未登录', path: '/me' }, 401),
    ).toThrow(ApiError)
    try {
      unwrapEnvelope({ status: 400, msg: '参数错误' }, 400)
    } catch (e) {
      expect(e).toMatchObject({ status: 400, message: '参数错误' })
    }
  })
})

describe('shouldSkipRefresh', () => {
  it('skips when the flag is set or the url is an auth endpoint', () => {
    expect(shouldSkipRefresh({ skipAuthRefresh: true })).toBe(true)
    expect(shouldSkipRefresh({ url: '/tokenRefreshes' })).toBe(true)
    expect(shouldSkipRefresh({ url: '/policies' })).toBe(false)
  })
})
