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
import { ApiError } from '@/utils/apiError'
import { parseData } from '@/utils/crypto'
import {
  clearToken,
  getRefreshToken,
  getToken,
  pickTokens,
  saveSessionTokens,
  triggerNeedLogin,
} from '@/utils/auth'

export { ApiError }

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
const baseURL = import.meta.env.VITE_BASE_API || '/auth'

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

/** 文档路由在根路径，不要再拼 VITE_BASE_API=/api */
const SKIP_API_PREFIX_RE =
  /^\/(auth|account|health|system|meta|invest|policies|news|enterprises|search|match|kb|home|issuingAuthority|export)(\/|$|\?)/i

export const shouldSkipApiPrefix = (url?: string) => {
  return SKIP_API_PREFIX_RE.test(url || '')
}

/**
 * FormData 不能带 application/json，也不能在发出前被补成
 * application/x-www-form-urlencoded。设为 false 后请求头会被省略，
 * 浏览器才会带上 multipart boundary。
 */
export const preserveMultipartContentType = (headers: unknown) => {
  if (!headers || typeof headers !== 'object') return
  const h = headers as {
    set?: (name: string, value: unknown) => void
  } & Record<string, unknown>
  if (typeof h.set === 'function') {
    h.set('Content-Type', false)
    return
  }
  h['Content-Type'] = false
}

export const shouldSkipRefresh = (config?: {
  skipAuthRefresh?: boolean
  url?: string
}) => {
  if (config?.skipAuthRefresh) return true
  const url = config?.url || ''
  return AUTH_SKIP_RE.test(url)
}

export const readApiMessage = (data: unknown, fallback: string) => {
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (!data || typeof data !== 'object') return fallback
  const body = data as Record<string, unknown>
  const message = [body.message, body.msg, body.title].find(
    (item) => typeof item === 'string' && item.trim(),
  )
  const detail =
    typeof body.data === 'string' && body.data.trim() ? body.data.trim() : ''
  if (typeof message === 'string' && detail && detail !== message.trim()) {
    return `${message.trim()}：${detail}`
  }
  if (typeof message === 'string') return message.trim()
  return detail || fallback
}

export const unwrapEnvelope = (
  payload: unknown,
  httpStatus: number,
): unknown => {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in (payload as object) &&
    typeof (payload as Record<string, unknown>).status === 'number'
  ) {
    const body = payload as ApiEnvelope
    const status = body.status ?? httpStatus
    if (status >= 400) {
      throw new ApiError(readApiMessage(body, '请求失败'), status, body.path)
    }
    return 'data' in body ? body.data : payload
  }
  return payload
}

/**
 * 响应数据解包 + 解密，兼容后端两种加密信封形态：
 * - 顶层加密体：`{ encrypted: true, data: '<密文>' }`（可无 status 字段）
 * - 信封内嵌加密体：`{ status, message, data: { encrypted: true, data: '<密文>' } }`
 * 未加密数据全程原样透传。
 */
export const resolveResponseData = (raw: unknown, httpStatus: number) => {
  const top = parseData(raw)
  const unwrapped = unwrapEnvelope(top, httpStatus)
  return parseData(unwrapped)
}

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new ApiError('登录已失效，请重新登录', 401)
  }

  // 使用裸 axios，避免走业务拦截器造成死循环
  // Swagger: POST /auth/tokenRefreshes  PolicyRefreshTokenDto { token }
  const { data } = await axios.post(
    '/auth/tokenRefreshes',
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
  } catch (err) {
    forceLogout()
    if (err instanceof ApiError) throw err
    throw new ApiError('登录已失效，请重新登录', 401)
  }
}

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cfg = config as RetriableConfig
  if (cfg.loading) startLoading()

  if (shouldSkipApiPrefix(cfg.url)) {
    cfg.baseURL = ''
  }

  const token = getToken()
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }

  if (typeof FormData !== 'undefined' && cfg.data instanceof FormData) {
    preserveMultipartContentType(cfg.headers)
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
      return resolveResponseData(response.data, response.status) as never
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.status === 401 && !shouldSkipRefresh(cfg) && !cfg._retry) {
        return handleUnauthorized(cfg, apiErr)
      }
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
      readApiMessage(data, error.message || '网络异常'),
      status || 500,
      data?.path,
    )

    if (status === 401 && !shouldSkipRefresh(cfg) && !cfg._retry) {
      return handleUnauthorized(cfg, apiErr)
    }

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

export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig,
) => {
  return request<T>({ ...config, url, method: 'PUT', data })
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
