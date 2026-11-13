import axios from 'axios'
import { ApiError } from '@/utils/apiError'
import { CSRF_HEADER_NAME, ensureCsrfToken } from '@/utils/csrf'

/** 后端响应中的数据信封：encrypted 为真值时 data 是 Base64 密文。 */
export type ApiPayload = {
  encrypted?: boolean | number | string
  data?: unknown
}

export type SessionKeyExchange = {
  keyId: string
  keyEnvelope: string
}

type SessionKey = {
  keyId: string
  key: CryptoKey
  /** 交换信封仍携带 IV；业务密文改为每消息 IV 前缀，解密不再使用此字段。 */
  iv: Uint8Array
}

let currentKey: SessionKey | null = null
let publicKeyPromise: Promise<string | null> | null = null
let exchangePromise: Promise<string> | null = null
let resetVersion = 0

const isEncryptedPayload = (payload: unknown): payload is { data: string } => {
  if (!payload || typeof payload !== 'object') return false
  const body = payload as ApiPayload
  return !!body.encrypted && typeof body.data === 'string'
}

/** 标识加密开启但未获得密文的响应，请求层据此重新协商，而非静默接受降级。 */
export const isUnexpectedPlainPayload = (payload: unknown): boolean => {
  if (!payload || typeof payload !== 'object') return false
  const body = payload as ApiPayload
  return body.encrypted === false && body.data != null
}

const bytesFromBase64 = (value: string): Uint8Array => {
  const binary = atob(value)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const randomBytes = (size: number): Uint8Array => {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytes
}

/** 获取后端 SPKI 公钥；null 明确表示后端未启用响应加密。 */
const getPublicKey = (): Promise<string | null> => {
  if (!publicKeyPromise) {
    publicKeyPromise = (async () => {
      try {
        const { data } = await axios.get('/auth/keyExchanges/publicKey', {
          withCredentials: true,
        })
        const body = data?.data ?? data
        if (body?.enabled === false) return null
        if (body?.enabled === true && typeof body.publicKey === 'string') {
          return body.publicKey
        }
        throw new Error('invalid key exchange configuration')
      } catch {
        publicKeyPromise = null
        throw new ApiError('会话加密公钥获取失败', 500)
      }
    })()
  }
  return publicKeyPromise
}

/** 生成 32 字节 AES Key、16 字节 IV，并用 RSA-OAEP-SHA256 封装 48 字节秘密。 */
const createSessionKey = async (): Promise<
  (SessionKeyExchange & { session: SessionKey }) | null
> => {
  const publicKey = await getPublicKey()
  if (publicKey == null) return null
  if (!crypto.subtle) throw new ApiError('当前环境不支持会话加密', 500)

  try {
    const rsaKey = await crypto.subtle.importKey(
      'spki',
      bytesFromBase64(publicKey) as BufferSource,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    )
    const keyBytes = randomBytes(32)
    const iv = randomBytes(16)
    const plain = new Uint8Array(48)
    plain.set(keyBytes)
    plain.set(iv, 32)

    const envelope = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      rsaKey,
      plain,
    )
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      { name: 'AES-CBC' },
      false,
      ['decrypt'],
    )
    const keyId = bytesToBase64(randomBytes(16))
    return {
      keyId,
      keyEnvelope: bytesToBase64(new Uint8Array(envelope)),
      session: { keyId, key, iv },
    }
  } catch {
    throw new ApiError('会话密钥生成失败', 500)
  }
}

/** 登录前生成并激活新密钥；后端未启用加密时显式返回 null。 */
export const prepareSessionKey =
  async (): Promise<SessionKeyExchange | null> => {
    const candidate = await createSessionKey()
    if (!candidate) {
      currentKey = null
      return null
    }

    currentKey = candidate.session
    return { keyId: candidate.keyId, keyEnvelope: candidate.keyEnvelope }
  }

export const getSessionKeyId = (): string => currentKey?.keyId ?? ''
export const hasSessionKey = (): boolean => currentKey != null

/** 为已有 Cookie/Bearer 会话建立密钥映射，页面刷新后可再次调用。 */
export const ensureSessionKey = (): Promise<string> => {
  if (currentKey) return Promise.resolve(currentKey.keyId)
  if (exchangePromise) return exchangePromise

  const version = resetVersion
  exchangePromise = (async () => {
    const candidate = await createSessionKey()
    if (!candidate) return ''
    const csrfToken = await ensureCsrfToken()
    try {
      await axios.post(
        '/auth/keyExchanges',
        { keyId: candidate.keyId, keyEnvelope: candidate.keyEnvelope },
        {
          withCredentials: true,
          headers: { [CSRF_HEADER_NAME]: csrfToken },
        },
      )
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? (error.response?.status ?? 500)
        : 500
      throw new ApiError(
        status === 401 ? '登录已失效' : '会话密钥交换失败',
        status,
      )
    }

    if (version !== resetVersion) throw new ApiError('登录态已变更', 401)
    currentKey = candidate.session
    return candidate.keyId
  })().finally(() => {
    exchangePromise = null
  })
  return exchangePromise
}

let renewPromise: Promise<string> | null = null

/** 后端内存密钥失效时生成新密钥并重新交换，不复用旧 IV。
 *  在途的旧交换 Promise 必须先落定（它成功后会写入 currentKey），随后清空 currentKey
 *  再重新交换——清空放在等待之前会被旧交换的赋值覆盖，renew 退化成复用旧 keyId 的 no-op。 */
export const renewSessionKey = (): Promise<string> => {
  if (renewPromise) return renewPromise
  renewPromise = (async () => {
    if (exchangePromise) {
      try {
        await exchangePromise
      } catch {
        // 旧交换失败不影响本次重试换新
      }
      exchangePromise = null
    }
    currentKey = null
    return ensureSessionKey()
  })()
  return renewPromise.finally(() => {
    renewPromise = null
  })
}

/** 退出或认证失效时清除当前页密钥及缓存公钥。 */
export const resetSessionKey = () => {
  resetVersion += 1
  currentKey = null
  publicKeyPromise = null
}

/** AES-CBC / PKCS#7 解密 Base64(IV‖cipher) 密文，返回解析后的业务数据。 */
export const decryptData = async <T = unknown>(
  cipherText: string,
): Promise<T> => {
  if (!currentKey) throw new ApiError('会话密钥未建立', 409)
  try {
    const packed = bytesFromBase64(cipherText)
    if (packed.byteLength <= 16) throw new Error('cipher too short')
    const iv = packed.subarray(0, 16)
    const cipher = packed.subarray(16)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv as BufferSource },
      currentKey.key,
      cipher as BufferSource,
    )
    return JSON.parse(new TextDecoder().decode(plain)) as T
  } catch {
    throw new ApiError('数据解密失败', 500)
  }
}

/** 明文原样返回，密文仅使用当前随机会话密钥解密。 */
export const parseData = async <T = unknown>(payload: unknown): Promise<T> => {
  if (!isEncryptedPayload(payload)) return payload as T
  return decryptData<T>(payload.data)
}
