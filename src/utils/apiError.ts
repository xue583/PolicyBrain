import type { AxiosRequestConfig } from 'axios'

/** API 错误类型，供请求层与解密等工具模块共用 */
export const toErrorMessage = (err: unknown, fallback = '加载失败') => {
  if (err instanceof ApiError) return err.message || fallback
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export class ApiError extends Error {
  status: number
  path?: string
  /** 请求阶段抛错时由 request.ts 挂载的原始请求配置，供响应拦截器按 401 语义统一处理 */
  config?: AxiosRequestConfig

  constructor(message: string, status = 500, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}
