import { describe, expect, it, vi, afterEach } from 'vitest'
import CryptoJS from 'crypto-js'
import { ApiError } from '@/utils/apiError'

vi.mock('ant-design-vue', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    error: vi.fn(),
  },
}))

const {
  shouldSkipApiPrefix,
  shouldSkipRefresh,
  unwrapEnvelope,
  resolveResponseData,
} = await import('./request')

const KEY_BASE64 = CryptoJS.enc.Utf8.parse(
  '0123456789abcdef0123456789abcdef',
).toString(CryptoJS.enc.Base64)
const IV_BASE64 = CryptoJS.enc.Utf8.parse('0123456789abcdef').toString(
  CryptoJS.enc.Base64,
)

const encrypt = (value: unknown) =>
  CryptoJS.AES.encrypt(
    JSON.stringify(value),
    CryptoJS.enc.Base64.parse(KEY_BASE64),
    {
      iv: CryptoJS.enc.Base64.parse(IV_BASE64),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString()

const stubSecrets = () => {
  vi.stubEnv('VITE_CRYPTO_KEY', KEY_BASE64)
  vi.stubEnv('VITE_CRYPTO_IV', IV_BASE64)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

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
    expect(shouldSkipRefresh({ url: '/auth/smsCodes' })).toBe(true)
    expect(shouldSkipRefresh({ url: '/policies' })).toBe(false)
  })
})

describe('shouldSkipApiPrefix', () => {
  it('skips /api for /auth and /account routes', () => {
    expect(shouldSkipApiPrefix('/auth/smsCodes')).toBe(true)
    expect(shouldSkipApiPrefix('/auth/sessions')).toBe(true)
    expect(shouldSkipApiPrefix('/auth/tokenRefreshes')).toBe(true)
    expect(shouldSkipApiPrefix('/account/users/me')).toBe(true)
    expect(shouldSkipApiPrefix('/users/me')).toBe(false)
    expect(shouldSkipApiPrefix('/authenticate')).toBe(false)
  })
})

describe('resolveResponseData', () => {
  it('passes plain envelope data through', () => {
    expect(
      resolveResponseData({ status: 200, message: 'ok', data: { id: 1 } }, 200),
    ).toEqual({ id: 1 })
  })

  it('decrypts envelope-embedded encrypted payload', () => {
    stubSecrets()
    const cipher = encrypt({ id: 7, list: [1, 2] })
    expect(
      resolveResponseData(
        { status: 200, message: 'ok', data: { encrypted: true, data: cipher } },
        200,
      ),
    ).toEqual({ id: 7, list: [1, 2] })
  })

  it('decrypts a top-level encrypted payload without a status envelope', () => {
    stubSecrets()
    const cipher = encrypt({ id: 8 })
    expect(resolveResponseData({ encrypted: true, data: cipher }, 200)).toEqual(
      { id: 8 },
    )
  })

  it('decrypts when the envelope carries encrypted at the top level', () => {
    stubSecrets()
    const cipher = encrypt({ id: 9 })
    expect(
      resolveResponseData({ status: 200, encrypted: true, data: cipher }, 200),
    ).toEqual({ id: 9 })
  })

  it('propagates envelope errors', () => {
    try {
      resolveResponseData({ status: 401, message: '未登录', path: '/me' }, 401)
      expect.unreachable('应当抛出 ApiError')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(401)
    }
  })
})
