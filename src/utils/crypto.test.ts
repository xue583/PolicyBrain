import { describe, expect, it, vi, afterEach } from 'vitest'
import CryptoJS from 'crypto-js'
import { ApiError } from '@/utils/apiError'

const { decryptData, parseData, maskSecret, unmaskSecret } =
  await import('./crypto')

/** AES-256 需要 32 字节密钥，CBC 初始向量 16 字节 */
const KEY_BASE64 = CryptoJS.enc.Utf8.parse(
  '0123456789abcdef0123456789abcdef',
).toString(CryptoJS.enc.Base64)
const IV_BASE64 = CryptoJS.enc.Utf8.parse('0123456789abcdef').toString(
  CryptoJS.enc.Base64,
)

const encrypt = (value: unknown, keyB64 = KEY_BASE64, ivB64 = IV_BASE64) =>
  CryptoJS.AES.encrypt(
    JSON.stringify(value),
    CryptoJS.enc.Base64.parse(keyB64),
    {
      iv: CryptoJS.enc.Base64.parse(ivB64),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString()

const stubSecrets = () => {
  vi.stubEnv('VITE_CRYPTO_KEY', maskSecret(KEY_BASE64))
  vi.stubEnv('VITE_CRYPTO_IV', maskSecret(IV_BASE64))
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('decryptData', () => {
  it('decrypts ciphertext into the original object', () => {
    stubSecrets()
    const cipher = encrypt({ id: 7, name: '政策 Brain', list: [1, 2, 3] })
    expect(decryptData(cipher)).toEqual({
      id: 7,
      name: '政策 Brain',
      list: [1, 2, 3],
    })
  })

  it('throws ApiError when key or iv is not configured', () => {
    vi.stubEnv('VITE_CRYPTO_KEY', '')
    vi.stubEnv('VITE_CRYPTO_IV', '')
    expect(() => decryptData(encrypt({ id: 1 }))).toThrow(ApiError)
  })

  it('throws ApiError when the ciphertext cannot be decrypted', () => {
    stubSecrets()
    // 用另一把密钥加密，配置密钥解出的不是合法 JSON
    const otherKey = CryptoJS.enc.Utf8.parse(
      'ffffffffffffffffffffffffffffffff',
    ).toString(CryptoJS.enc.Base64)
    const cipher = encrypt({ id: 1 }, otherKey)

    try {
      decryptData(cipher)
      expect.unreachable('应当抛出 ApiError')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).message).toBe('数据解密失败')
    }
  })
  it('treats truthy encrypted values (1, "true") as encrypted', () => {
    stubSecrets()
    const cipher = encrypt({ id: 3 })
    expect(parseData({ encrypted: 1, data: cipher })).toEqual({ id: 3 })
    expect(parseData({ encrypted: 'true', data: cipher })).toEqual({ id: 3 })
  })

  it('supports a 16-byte (AES-128) key', () => {
    const keyB64 = CryptoJS.enc.Utf8.parse('0123456789abcdef').toString(
      CryptoJS.enc.Base64,
    )
    vi.stubEnv('VITE_CRYPTO_KEY', maskSecret(keyB64))
    vi.stubEnv('VITE_CRYPTO_IV', maskSecret(IV_BASE64))
    const cipher = encrypt({ id: 9 }, keyB64)
    expect(parseData({ encrypted: true, data: cipher })).toEqual({ id: 9 })
  })

  it('throws ApiError when the configured key size is invalid', () => {
    // 20 字节不是 AES 合法密钥长度（16/24/32）
    const badKey = CryptoJS.enc.Utf8.parse('12345678901234567890').toString(
      CryptoJS.enc.Base64,
    )
    vi.stubEnv('VITE_CRYPTO_KEY', maskSecret(badKey))
    vi.stubEnv('VITE_CRYPTO_IV', maskSecret(IV_BASE64))
    expect(() => decryptData(encrypt({ id: 1 }))).toThrow(ApiError)
  })

  it('throws ApiError when the configured iv is not 16 bytes', () => {
    const badIv = CryptoJS.enc.Utf8.parse('123456789012345').toString(
      CryptoJS.enc.Base64,
    )
    vi.stubEnv('VITE_CRYPTO_KEY', maskSecret(KEY_BASE64))
    vi.stubEnv('VITE_CRYPTO_IV', maskSecret(badIv))
    try {
      decryptData(encrypt({ id: 1 }))
      expect.unreachable('应当抛出 ApiError')
    } catch (err) {
      expect((err as ApiError).message).toBe('数据解密密钥配置无效')
    }
  })
})

describe('parseData', () => {
  it('returns plain payload as-is', () => {
    expect(parseData({ id: 1, name: 'ok' })).toEqual({ id: 1, name: 'ok' })
  })

  it('returns payload as-is when encrypted is false', () => {
    expect(parseData({ encrypted: false, data: { id: 1 } })).toEqual({
      encrypted: false,
      data: { id: 1 },
    })
  })

  it('treats non-string data as plain payload', () => {
    expect(parseData({ encrypted: true, data: { id: 1 } })).toEqual({
      encrypted: true,
      data: { id: 1 },
    })
  })

  it('decrypts encrypted payload with the configured key and iv', () => {
    stubSecrets()
    const cipher = encrypt({ id: 7, list: [1, 2, 3] })
    expect(parseData({ encrypted: true, data: cipher })).toEqual({
      id: 7,
      list: [1, 2, 3],
    })
  })
})

describe('maskSecret', () => {
  it('matches the generator script output (fixed vector)', () => {
    // 固定向量由 scripts/mask-crypto-secret.mjs 生成，
    // 用于锁定运行时实现与生成脚本算法一致
    expect(maskSecret('MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=')).toBe(
      'ehnUuyPeWcJ5N/L2IfNOmm5vw640zkmLejfc8iDwUcB4Gf2qN8lGmG0KyP8=',
    )
  })

  it('round-trips: unmasking a masked secret restores the plain secret', () => {
    expect(unmaskSecret(maskSecret(KEY_BASE64))).toBe(KEY_BASE64)
    expect(unmaskSecret(maskSecret(IV_BASE64))).toBe(IV_BASE64)
  })
})
