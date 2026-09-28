/**
 * 后端数据解密工具模块
 * 后端对敏感数据采用 AES-CBC（128/192/256 位，PKCS#7 填充）加密，密文以 Base64 字符串下发，
 * 密钥（VITE_CRYPTO_KEY）与初始向量（VITE_CRYPTO_IV）由后端提供，通过环境变量注入。
 *
 * 响应数据分为两种形态：
 * - 明文：直接返回业务数据
 * - 密文：`{ encrypted: true, data: '<Base64 密文>' }`，解密后为 JSON 字符串，需再 parse
 *
 * 使用场景：
 * - 请求层响应拦截器统一解密（见 utils/request.ts）
 * - 需要单独解密的业务数据
 */
import CryptoJS from 'crypto-js'
import { ApiError } from '@/utils/apiError'

/** 后端响应中的数据信封：encrypted 为真值时 data 是 Base64 密文 */
export type ApiPayload = {
  encrypted?: boolean | number | string
  data?: unknown
}

/** 与后端约定对齐采用 truthy 判断：encrypted 为 1、"true" 等真值均视为加密 */
const isEncryptedPayload = (payload: unknown): payload is { data: string } => {
  if (!payload || typeof payload !== 'object') return false
  const body = payload as ApiPayload
  return !!body.encrypted && typeof body.data === 'string'
}

/** AES 密钥合法字节数（128/192/256 位），CBC 初始向量固定 16 字节 */
const VALID_KEY_SIZES = [16, 24, 32]

/** 从环境变量读取 Base64 密钥与初始向量，任一未配置时返回 null */
const readSecrets = () => {
  const keyBase64 = import.meta.env.VITE_CRYPTO_KEY
  const ivBase64 = import.meta.env.VITE_CRYPTO_IV
  if (!keyBase64 || !ivBase64) return null
  const key = CryptoJS.enc.Base64.parse(keyBase64)
  const iv = CryptoJS.enc.Base64.parse(ivBase64)
  if (!VALID_KEY_SIZES.includes(key.sigBytes) || iv.sigBytes !== 16) {
    throw new ApiError('数据解密密钥配置无效', 500)
  }
  return { key, iv }
}

/** AES-CBC / PKCS#7 解密 Base64 密文，返回解析后的业务数据 */
export const decryptData = <T = unknown>(cipherText: string): T => {
  const secrets = readSecrets()
  if (!secrets) {
    throw new ApiError('数据解密密钥未配置', 500)
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secrets.key, {
      iv: secrets.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T
  } catch {
    throw new ApiError('数据解密失败', 500)
  }
}

/** 响应数据解密入口：未加密数据原样返回，加密数据自动解密 */
export const parseData = <T = unknown>(payload: unknown): T => {
  if (!isEncryptedPayload(payload)) return payload as T
  return decryptData<T>(payload.data)
}
