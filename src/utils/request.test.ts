import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/utils/apiError'

vi.mock('ant-design-vue', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    error: vi.fn(),
  },
}))

vi.mock('@/utils/csrf', () => ({
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  ensureCsrfToken: vi.fn(),
  resetCsrfToken: vi.fn(),
}))

const {
  default: service,
  preserveMultipartContentType,
  shouldSkipApiPrefix,
  shouldSkipRefresh,
  unwrapEnvelope,
  resolveResponseData,
  request,
} = await import('./request')
const { getSessionKeyId, prepareSessionKey, resetSessionKey } =
  await import('./crypto')
const { ensureCsrfToken } = await import('@/utils/csrf')
const { getStoredUser, onNeedLogin, setStoredUser } = await import('./auth')

const originalAdapter = service.defaults.adapter

const toBase64 = (bytes: Uint8Array | ArrayBuffer) => {
  const view = ArrayBuffer.isView(bytes)
    ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    : new Uint8Array(bytes)
  return btoa(Array.from(view, (byte) => String.fromCharCode(byte)).join(''))
}

const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

const openEnvelope = async (privateKey: CryptoKey, keyEnvelope: string) => {
  const plain = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    fromBase64(keyEnvelope) as BufferSource,
  )
  const bytes = new Uint8Array(plain)
  return { keyBytes: bytes.slice(0, 32), iv: bytes.slice(32) }
}

const encryptWithEnvelope = async (
  privateKey: CryptoKey,
  keyEnvelope: string,
  value: unknown,
) => {
  const { keyBytes, iv } = await openEnvelope(privateKey, keyEnvelope)
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  )
  const messageIv = crypto.getRandomValues(new Uint8Array(16))
  void iv
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: messageIv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  )
  const packed = new Uint8Array(16 + cipher.byteLength)
  packed.set(messageIv, 0)
  packed.set(new Uint8Array(cipher), 16)
  return toBase64(packed)
}

const establishSession = async () => {
  const pair = (await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  )) as CryptoKeyPair
  const publicKey = toBase64(
    await crypto.subtle.exportKey('spki', pair.publicKey),
  )
  const get = vi.spyOn(axios, 'get').mockResolvedValue({
    data: { data: { enabled: true, publicKey } },
  } as AxiosResponse)
  const exchange = await prepareSessionKey()
  get.mockRestore()
  if (!exchange) throw new Error('session key was not generated')
  return { privateKey: pair.privateKey, exchange }
}

const response = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Unauthorized',
  headers: {},
  config,
})

const unauthorized = (config: InternalAxiosRequestConfig) => {
  const error = new AxiosError('unauthorized')
  error.config = config
  error.response = response(config, { status: 401, message: '未登录' }, 401)
  return error
}

describe('request helpers', () => {
  it('unwraps successful envelopes and preserves non-envelope data', () => {
    expect(unwrapEnvelope({ name: 'ok' }, 200)).toEqual({ name: 'ok' })
    expect(
      unwrapEnvelope({ status: 200, data: { id: 1 }, message: 'ok' }, 200),
    ).toEqual({ id: 1 })
  })

  it('throws ApiError for envelope errors', () => {
    expect(() =>
      unwrapEnvelope({ status: 401, message: '未登录', path: '/me' }, 401),
    ).toThrow(ApiError)
  })

  it('preserves multipart content type for the browser boundary', () => {
    const headers: Record<string, unknown> = {
      'Content-Type': 'application/json',
    }
    preserveMultipartContentType(headers)
    expect(headers['Content-Type']).toBe(false)
  })

  it('recognizes refresh skips and root API routes', () => {
    expect(shouldSkipRefresh({ skipAuthRefresh: true })).toBe(true)
    expect(shouldSkipRefresh({ url: '/tokenRefreshes' })).toBe(true)
    expect(shouldSkipRefresh({ url: '/auth/smsCodes' })).toBe(true)
    expect(shouldSkipRefresh({ url: '/policies' })).toBe(false)
    expect(shouldSkipApiPrefix('/auth/sessions')).toBe(true)
    expect(shouldSkipApiPrefix('/account/users/me')).toBe(true)
    expect(shouldSkipApiPrefix('/users/me')).toBe(false)
  })
})

describe('resolveResponseData', () => {
  beforeEach(() => {
    resetSessionKey()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetSessionKey()
    vi.restoreAllMocks()
  })

  it('passes plain envelope data through asynchronously', async () => {
    await expect(
      resolveResponseData({ status: 200, message: 'ok', data: { id: 1 } }, 200),
    ).resolves.toEqual({ id: 1 })
  })

  it('decrypts envelope-embedded and top-level encrypted payloads', async () => {
    const { privateKey, exchange } = await establishSession()
    const embeddedCipher = await encryptWithEnvelope(
      privateKey,
      exchange.keyEnvelope,
      { id: 7, list: [1, 2] },
    )
    await expect(
      resolveResponseData(
        {
          status: 200,
          message: 'ok',
          data: { encrypted: true, data: embeddedCipher },
        },
        200,
      ),
    ).resolves.toEqual({ id: 7, list: [1, 2] })

    const topCipher = await encryptWithEnvelope(
      privateKey,
      exchange.keyEnvelope,
      { id: 8 },
    )
    await expect(
      resolveResponseData({ encrypted: true, data: topCipher }, 200),
    ).resolves.toEqual({ id: 8 })
  })

  it('propagates envelope errors', async () => {
    await expect(
      resolveResponseData({ status: 401, message: '未登录', path: '/me' }, 401),
    ).rejects.toMatchObject({ status: 401, message: '未登录' })
  })
})

describe('cookie session requests', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    resetSessionKey()
    vi.clearAllMocks()
    vi.mocked(ensureCsrfToken).mockResolvedValue('csrf-token')
  })

  afterEach(() => {
    service.defaults.adapter = originalAdapter
    localStorage.clear()
    sessionStorage.clear()
    resetSessionKey()
    vi.restoreAllMocks()
  })

  it('uses credentials, CSRF and the session key header without Authorization or stored tokens', async () => {
    const { exchange } = await establishSession()
    setStoredUser({ id: 1 })
    let sent: InternalAxiosRequestConfig | null = null
    service.defaults.adapter = async (config) => {
      sent = config
      return response(config, { status: 200, data: { ok: true } })
    }

    await expect(
      request({ url: '/account/users/me/profile', method: 'patch', data: {} }),
    ).resolves.toEqual({ ok: true })

    expect(service.defaults.withCredentials).toBe(true)
    expect(sent!.withCredentials).toBe(true)
    expect(sent!.headers.get('X-Session-Key-Id')).toBe(exchange.keyId)
    expect(sent!.headers.get('X-CSRF-Token')).toBe('csrf-token')
    expect(sent!.headers.get('Authorization')).toBeUndefined()
    expect(localStorage.getItem('pb_access_token')).toBeNull()
    expect(localStorage.getItem('pb_refresh_token')).toBeNull()
  })

  it('rejects plaintext after a failed renegotiate retry', async () => {
    await establishSession()
    setStoredUser({ id: 1 })
    vi.spyOn(axios, 'post').mockResolvedValue(
      response({} as InternalAxiosRequestConfig, { status: 200 }),
    )
    let attempts = 0
    service.defaults.adapter = async (config) => {
      attempts += 1
      return response(config, {
        status: 200,
        encrypted: false,
        data: { stale: true },
      })
    }

    await expect(
      request({ url: '/account/users/me', method: 'get', hideError: true }),
    ).rejects.toMatchObject({
      message: '会话加密已降级，请重新登录',
      status: 409,
    })
    expect(attempts).toBe(2)
  })

  it('renegotiates and retries once when an established key receives plaintext', async () => {
    const { privateKey } = await establishSession()
    setStoredUser({ id: 1 })
    let exchangeBody: { keyId: string; keyEnvelope: string } | null = null
    const post = vi
      .spyOn(axios, 'post')
      .mockImplementation(async (url, body) => {
        expect(url).toBe('/auth/keyExchanges')
        exchangeBody = body as { keyId: string; keyEnvelope: string }
        return response({} as InternalAxiosRequestConfig, { status: 200 })
      })
    let attempts = 0
    service.defaults.adapter = async (config) => {
      attempts += 1
      if (attempts === 1) {
        return response(config, {
          status: 200,
          encrypted: false,
          data: { stale: true },
        })
      }
      const cipher = await encryptWithEnvelope(
        privateKey,
        exchangeBody!.keyEnvelope,
        { id: 2 },
      )
      return response(config, { status: 200, encrypted: true, data: cipher })
    }

    await expect(
      request({ url: '/account/users/me', method: 'get', hideError: true }),
    ).resolves.toEqual({ id: 2 })
    expect(attempts).toBe(2)
    expect(post).toHaveBeenCalledOnce()
    expect(getSessionKeyId()).toBe(exchangeBody!.keyId)
  })

  it('refreshes with an empty body, rebinds the key and retries using cookies', async () => {
    const { exchange } = await establishSession()
    setStoredUser({ id: 1 })
    const oldKeyId = exchange.keyId
    const post = vi.spyOn(axios, 'post').mockImplementation(async (url) => {
      if (url === '/auth/tokenRefreshes') {
        return response({} as InternalAxiosRequestConfig, {
          status: 200,
          encrypted: false,
          data: {
            accessToken: 'must-not-be-stored',
            refreshToken: 'also-not-stored',
          },
        })
      }
      if (url === '/auth/keyExchanges') {
        return response({} as InternalAxiosRequestConfig, { status: 200 })
      }
      throw new Error(`unexpected POST ${url}`)
    })
    let attempts = 0
    let retryKeyId = ''
    service.defaults.adapter = async (config) => {
      attempts += 1
      if (attempts === 1) throw unauthorized(config)
      retryKeyId = String(config.headers.get('X-Session-Key-Id') || '')
      return response(config, { status: 200, data: { ok: true } })
    }

    await expect(
      request({ url: '/account/users/me', method: 'get', hideError: true }),
    ).resolves.toEqual({ ok: true })

    expect(attempts).toBe(2)
    expect(post).toHaveBeenCalledTimes(2)
    expect(post).toHaveBeenNthCalledWith(
      1,
      '/auth/tokenRefreshes',
      undefined,
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({ 'X-CSRF-Token': 'csrf-token' }),
      }),
    )
    expect(post.mock.calls[1]![0]).toBe('/auth/keyExchanges')
    expect(retryKeyId).not.toBe(oldKeyId)
    expect(getStoredUser()).toEqual({ id: 1 })
    expect(localStorage.getItem('pb_access_token')).toBeNull()
    expect(sessionStorage.getItem('pb_refresh_token')).toBeNull()
  })

  it('can clear an expired session without opening the login prompt', async () => {
    await establishSession()
    setStoredUser({ id: 1 })
    vi.spyOn(axios, 'post').mockRejectedValue(
      unauthorized({} as InternalAxiosRequestConfig),
    )
    service.defaults.adapter = async (config) => {
      throw unauthorized(config)
    }
    const prompt = vi.fn()
    const off = onNeedLogin(prompt)

    await expect(
      request({
        url: '/account/users/me',
        method: 'get',
        hideError: true,
        suppressAuthPrompt: true,
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(prompt).not.toHaveBeenCalled()
    expect(getStoredUser()).toBeNull()
    off()
  })

  it('keeps the original 401 when session-key exchange fails before the request', async () => {
    setStoredUser({ id: 1 })
    // 密钥交换阶段抛 ApiError(401)（如会话过期），必须保留原始状态码并触发统一登出，
    // 不得被响应拦截器重包装成 500 导致登录态僵死。
    const pair = (await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    )) as CryptoKeyPair
    const publicKey = toBase64(
      await crypto.subtle.exportKey('spki', pair.publicKey),
    )
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { data: { enabled: true, publicKey } },
    } as AxiosResponse)
    vi.spyOn(axios, 'post').mockRejectedValue(
      unauthorized({} as InternalAxiosRequestConfig),
    )
    let reachedAdapter = false
    service.defaults.adapter = async () => {
      reachedAdapter = true
      return response({} as InternalAxiosRequestConfig, { status: 200 })
    }
    const prompt = vi.fn()
    const off = onNeedLogin(prompt)

    await expect(
      request({ url: '/account/users/me', method: 'get' }),
    ).rejects.toMatchObject({ status: 401 })

    expect(reachedAdapter).toBe(false)
    expect(prompt).toHaveBeenCalled()
    expect(getStoredUser()).toBeNull()
    off()
  })
})
