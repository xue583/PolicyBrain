import axios, { type AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/utils/apiError'

vi.mock('@/utils/csrf', () => ({
  CSRF_HEADER_NAME: 'X-CSRF-Token',
  ensureCsrfToken: vi.fn(),
}))

const {
  decryptData,
  ensureSessionKey,
  getSessionKeyId,
  hasSessionKey,
  parseData,
  prepareSessionKey,
  renewSessionKey,
  resetSessionKey,
} = await import('./crypto')
const { ensureCsrfToken } = await import('@/utils/csrf')

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
  expect(bytes).toHaveLength(48)
  return { keyBytes: bytes.slice(0, 32), iv: bytes.slice(32) }
}

const encrypt = async (
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
  // 与后端一致：每消息随机 IV，密文 = Base64(IV‖cipher)；信封 IV 仅作交换材料
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

const mockPublicKey = async () => {
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
  return pair.privateKey
}

describe('random session encryption', () => {
  beforeEach(() => {
    resetSessionKey()
    vi.clearAllMocks()
    vi.mocked(ensureCsrfToken).mockResolvedValue('csrf-token')
  })

  afterEach(() => {
    resetSessionKey()
    vi.restoreAllMocks()
  })

  it('wraps a random 48-byte AES secret with RSA-OAEP and decrypts AES-CBC data', async () => {
    const privateKey = await mockPublicKey()
    const exchange = await prepareSessionKey()
    expect(exchange).not.toBeNull()

    const cipher = await encrypt(privateKey, exchange!.keyEnvelope, {
      id: 7,
      name: '政策 Brain',
      list: [1, 2, 3],
    })
    await expect(parseData({ encrypted: true, data: cipher })).resolves.toEqual(
      {
        id: 7,
        name: '政策 Brain',
        list: [1, 2, 3],
      },
    )
    await expect(decryptData(cipher)).resolves.toEqual({
      id: 7,
      name: '政策 Brain',
      list: [1, 2, 3],
    })
  })

  it('establishes the session mapping with CSRF and reuses the current key id', async () => {
    const privateKey = await mockPublicKey()
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { status: 200, data: null },
    } as AxiosResponse)

    const keyId = await ensureSessionKey()
    expect(keyId).toBe(getSessionKeyId())
    expect(hasSessionKey()).toBe(true)
    expect(post).toHaveBeenCalledOnce()

    const [url, body, config] = post.mock.calls[0]!
    expect(url).toBe('/auth/keyExchanges')
    expect(config).toMatchObject({
      withCredentials: true,
      headers: { 'X-CSRF-Token': 'csrf-token' },
    })
    const exchange = body as { keyId: string; keyEnvelope: string }
    expect(exchange.keyId).toBe(keyId)
    await openEnvelope(privateKey, exchange.keyEnvelope)

    await expect(ensureSessionKey()).resolves.toBe(keyId)
    expect(post).toHaveBeenCalledOnce()
  })

  it('renew waits for the in-flight exchange and issues a fresh key id', async () => {
    await mockPublicKey()
    let resolveExchange!: (v: AxiosResponse) => void
    const pending = new Promise<AxiosResponse>((resolve) => {
      resolveExchange = resolve
    })
    vi.spyOn(axios, 'post').mockReturnValue(pending)

    // 旧交换在途
    const first = ensureSessionKey()
    // renew 不应复用在途旧交换的 keyId，而是等其落定后重新交换
    const renewed = renewSessionKey()
    resolveExchange({ data: { status: 200, data: null } } as AxiosResponse)
    const staleKeyId = await first
    expect(staleKeyId).not.toBe('')

    // renewed 完成后的 keyId 必须与旧 keyId 不同（新密钥、新交换）
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: { status: 200, data: null },
    } as AxiosResponse)
    const newKeyId = await renewed
    expect(newKeyId).not.toBe(staleKeyId)
    expect(getSessionKeyId()).toBe(newKeyId)
  })

  it('does not generate or upload a key when backend encryption is disabled', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      data: { data: { enabled: false, publicKey: null } },
    } as AxiosResponse)
    const post = vi.spyOn(axios, 'post')

    await expect(prepareSessionKey()).resolves.toBeNull()
    await expect(ensureSessionKey()).resolves.toBe('')
    expect(hasSessionKey()).toBe(false)
    expect(post).not.toHaveBeenCalled()
  })

  it('passes plain payloads through and rejects invalid ciphertext explicitly', async () => {
    expect(await parseData({ id: 1 })).toEqual({ id: 1 })
    expect(await parseData({ encrypted: false, data: { id: 1 } })).toEqual({
      encrypted: false,
      data: { id: 1 },
    })

    await mockPublicKey()
    await prepareSessionKey()
    await expect(
      parseData({ encrypted: true, data: 'not-base64!' }),
    ).rejects.toBeInstanceOf(ApiError)
  })
})
