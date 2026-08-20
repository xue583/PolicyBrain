/**
 * HTTP 请求工具模块
 * 基于 Axios 封装的统一请求处理工具，提供完整的请求/响应拦截、错误处理和令牌管理功能
 *
 * 功能特性：
 * - 统一的 API 请求配置和管理
 * - 自动的 JWT 令牌认证和刷新
 * - 智能的加载状态管理
 * - 完善的错误处理和用户提示
 * - 请求/响应拦截器
 * - 网络异常处理
 *
 * 核心机制：
 * - 令牌过期自动刷新
 * - 并发请求的加载状态合并
 * - 失败请求的重试队列
 * - Blob 类型响应的特殊处理
 *
 * 使用场景：
 * - 所有 API 接口调用
 * - 文件上传下载
 * - 认证状态管理
 * - 错误信息展示
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { message } from 'ant-design-vue'
import {
  clearToken,
  getRefreshToken,
  getToken,
  pickTokens,
  saveSessionTokens,
  triggerNeedLogin,
} from '@/utils/auth'

export class ApiError extends Error {
  status: number
  path?: string

  constructor(message: string, status = 500, path?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

export type RequestConfig = AxiosRequestConfig & {
  /** 显示全局 loading（并发请求合并计数） */
  loading?: boolean
  /** 静默错误，不弹出 message */
  hideError?: boolean
  /** 跳过 401 自动刷新（登录/刷新自身请求） */
  skipAuthRefresh?: boolean
  /** 内部：已重试过一次 */
  _retry?: boolean
}

type ApiEnvelope = {
  status?: number
  code?: number
  message?: string
  msg?: string
  data?: unknown
  path?: string
  timestamp?: string
}

type RetriableConfig = InternalAxiosRequestConfig & RequestConfig

const timeout = Number(import.meta.env.VITE_REQUEST_TIMEOUT || 60000)
const baseURL = import.meta.env.VITE_BASE_API || '/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** 并发 loading 计数 */
let loadingCount = 0
let hideLoadingFn: (() => void) | null = null

const startLoading = () => {
  if (loadingCount === 0) {
    hideLoadingFn = message.loading('加载中...', 0)
  }
  loadingCount += 1
}

const stopLoading = () => {
  if (loadingCount <= 0) return
  loadingCount -= 1
  if (loadingCount === 0 && hideLoadingFn) {
    hideLoadingFn()
    hideLoadingFn = null
  }
}

/** 单个刷新 Promise，避免多个 401 并发重复刷新 */
let refreshPromise: Promise<string> | null = null

const AUTH_SKIP_RE =
  /\/(tokenRefreshes|sessions|smsCodes|smsCodeVerifications)(\/|$|\?)/i

const shouldSkipRefresh = (config?: RetriableConfig) => {
  if (config?.skipAuthRefresh) return true
  const url = config?.url || ''
  return AUTH_SKIP_RE.test(url)
}

const unwrapEnvelope = (payload: unknown, httpStatus: number): unknown => {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in (payload as object)
  ) {
    const body = payload as ApiEnvelope
    const status = Number(body.status ?? httpStatus)
    if (status >= 400) {
      throw new ApiError(
        body.message || body.msg || '请求失败',
        status,
        body.path,
      )
    }
    return 'data' in body ? body.data : payload
  }
  return payload
}

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new ApiError('登录已失效，请重新登录', 401)
  }

  // 使用裸 axios，避免走业务拦截器造成死循环
  // Swagger: PolicyRefreshTokenDto { token }
  const { data } = await axios.post(
    `${baseURL}/tokenRefreshes`,
    { token: refreshToken },
    {
      timeout,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    },
  )

  const payload = unwrapEnvelope(data, 200)
  const tokens = pickTokens(payload)
  if (!tokens.accessToken) {
    throw new ApiError('刷新令牌失败', 401)
  }

  saveSessionTokens(tokens)
  return tokens.accessToken
}

const getSharedRefresh = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

const forceLogout = () => {
  clearToken()
  triggerNeedLogin()
}

const handleUnauthorized = async (
  config: RetriableConfig,
  fallback: ApiError,
) => {
  if (!getRefreshToken()) {
    forceLogout()
    throw fallback
  }

  try {
    const accessToken = await getSharedRefresh()
    config._retry = true
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${accessToken}`
    return service.request(config)
  } catch {
    forceLogout()
    throw new ApiError('登录已失效，请重新登录', 401)
  }
}

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cfg = config as RetriableConfig
  if (cfg.loading) startLoading()

  const token = getToken()
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const cfg = response.config as RetriableConfig
    if (cfg.loading) stopLoading()

    // Blob / 文件流直接返回
    if (cfg.responseType === 'blob' || response.data instanceof Blob) {
      return response.data as never
    }

    try {
      return unwrapEnvelope(response.data, response.status) as never
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.status === 401 && !shouldSkipRefresh(cfg) && !cfg._retry) {
        return handleUnauthorized(cfg, apiErr)
      }
      if (apiErr.status === 401 && !shouldSkipRefresh(cfg)) forceLogout()
      if (!cfg.hideError) {
        message.error(apiErr.message || '请求失败')
      }
      throw apiErr
    }
  },
  async (error) => {
    const cfg = (error.config || {}) as RetriableConfig
    if (cfg.loading) stopLoading()

    const status = error.response?.status ?? 0
    const data = error.response?.data as ApiEnvelope | undefined
    const apiErr = new ApiError(
      data?.message || data?.msg || error.message || '网络异常',
      status || 500,
      data?.path,
    )

    if (status === 401 && !shouldSkipRefresh(cfg) && !cfg._retry) {
      return handleUnauthorized(cfg, apiErr)
    }

    if (status === 401 && !shouldSkipRefresh(cfg)) forceLogout()

    if (!cfg.hideError && !axios.isCancel(error)) {
      message.error(apiErr.message)
    }
    throw apiErr
  },
)

export const request = <T = unknown>(config: RequestConfig) => {
  return service.request<any, T>(config)
}

export const get = <T = unknown>(url: string, config?: RequestConfig) => {
  return request<T>({ ...config, url, method: 'GET' })
}

export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
) => {
  return request<T>({ ...config, url, method: 'POST', data })
}

export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
) => {
  return request<T>({ ...config, url, method: 'PATCH', data })
}

export const del = <T = unknown>(url: string, config?: RequestConfig) => {
  return request<T>({ ...config, url, method: 'DELETE' })
}

export default service
