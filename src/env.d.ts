/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLI_PORT?: string
  readonly VITE_SERVER_PORT?: string
  readonly VITE_BASE_API?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_REQUEST_TIMEOUT?: string
  readonly VITE_DEV_HOST?: string
  readonly VITE_AUTH_STORAGE?: 'localStorage' | 'sessionStorage'
  /** 后端数据解密密钥（Base64，AES-256-CBC），由后端提供 */
  readonly VITE_CRYPTO_KEY?: string
  /** 后端数据解密初始向量（Base64，16 字节），由后端提供 */
  readonly VITE_CRYPTO_IV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
