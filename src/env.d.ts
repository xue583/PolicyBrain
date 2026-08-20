/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLI_PORT?: string
  readonly VITE_SERVER_PORT?: string
  readonly VITE_BASE_API?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_REQUEST_TIMEOUT?: string
  readonly VITE_DEV_HOST?: string
  readonly VITE_AUTH_STORAGE?: 'localStorage' | 'sessionStorage'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
