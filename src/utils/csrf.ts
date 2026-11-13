import axios from 'axios'
import { ApiError } from '@/utils/apiError'

export const CSRF_COOKIE_NAME = '__Host-pb_csrf_token'
export const CSRF_HEADER_NAME = 'X-CSRF-Token'

let pendingToken: Promise<string> | null = null

/** 读取双提交 CSRF Cookie；认证 Cookie 为 HttpOnly，不参与此逻辑。 */
export const readCsrfToken = (): string => {
  if (typeof document === 'undefined') return ''
  const prefix = `${CSRF_COOKIE_NAME}=`
  const item = document.cookie
    .split('; ')
    .find((part) => part.startsWith(prefix))
  return item ? decodeURIComponent(item.slice(prefix.length)) : ''
}

/** 确保写请求具有双提交 CSRF 令牌，并发请求共享一次签发。 */
export const ensureCsrfToken = (): Promise<string> => {
  const current = readCsrfToken()
  if (current) return Promise.resolve(current)
  if (pendingToken) return pendingToken

  pendingToken = (async () => {
    try {
      const { data } = await axios.get('/auth/csrfTokens', {
        withCredentials: true,
      })
      const body = data?.data ?? data
      const token =
        readCsrfToken() || (typeof body?.token === 'string' ? body.token : '')
      if (!token) throw new Error('missing csrf token')
      return token
    } catch {
      throw new ApiError('CSRF令牌获取失败', 500)
    } finally {
      pendingToken = null
    }
  })()
  return pendingToken
}

/** 登录态清理时取消共享状态，不删除由后端管理的 Cookie。 */
export const resetCsrfToken = () => {
  pendingToken = null
}
