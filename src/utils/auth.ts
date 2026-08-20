/**
 * Token 持久化。
 * 生产环境应由后端通过 Set-Cookie（HttpOnly + Secure + SameSite）下发会话，
 * 前端只保留用户展示信息。开发阶段可通过 VITE_AUTH_STORAGE 切换存储介质。
 */
const TOKEN_KEY = 'pb_access_token'
const REFRESH_KEY = 'pb_refresh_token'
const EXPIRES_KEY = 'pb_token_expires'
const REFRESH_EXPIRES_KEY = 'pb_refresh_expires'
const USER_KEY = 'pb_user'

export type AuthUser = {
  id?: string | number
  phone?: string
  identity?: string | number
  companyName?: string
  unifiedSocialCreditCode?: string
  jobTitle?: string
  nickname?: string
  inviter?: string
  invitationCode?: string
  avatar?: string
  [key: string]: unknown
}

export type SessionTokens = {
  accessToken?: string
  refreshToken?: string
  expires?: string
  refreshTokenExpires?: string
}

type Listener = () => void
const authListeners = new Set<Listener>()
const needLoginListeners = new Set<Listener>()

const resolveStorage = (): Storage => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    } as Storage
  }
  return import.meta.env.VITE_AUTH_STORAGE === 'sessionStorage'
    ? window.sessionStorage
    : window.localStorage
}

const storage = resolveStorage()

const emitAuthChange = () => {
  authListeners.forEach((fn) => fn())
}

export const onAuthChange = (fn: Listener) => {
  authListeners.add(fn)
  return () => authListeners.delete(fn)
}

export const onNeedLogin = (fn: Listener) => {
  needLoginListeners.add(fn)
  return () => needLoginListeners.delete(fn)
}

export const triggerNeedLogin = () => {
  needLoginListeners.forEach((fn) => fn())
}

export const getToken = (): string => {
  return storage.getItem(TOKEN_KEY) || ''
}

export const setToken = (token: string) => {
  storage.setItem(TOKEN_KEY, token)
  emitAuthChange()
}

export const getRefreshToken = (): string => {
  return storage.getItem(REFRESH_KEY) || ''
}

export const setRefreshToken = (token: string) => {
  storage.setItem(REFRESH_KEY, token)
  emitAuthChange()
}

export const getTokenExpires = (): string => {
  return storage.getItem(EXPIRES_KEY) || ''
}

export const getRefreshTokenExpires = (): string => {
  return storage.getItem(REFRESH_EXPIRES_KEY) || ''
}

export const clearToken = () => {
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(REFRESH_KEY)
  storage.removeItem(EXPIRES_KEY)
  storage.removeItem(REFRESH_EXPIRES_KEY)
  storage.removeItem(USER_KEY)
  emitAuthChange()
}

export const getStoredUser = (): AuthUser | null => {
  const raw = storage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const setStoredUser = (user: AuthUser | null) => {
  if (!user) {
    storage.removeItem(USER_KEY)
  } else {
    storage.setItem(USER_KEY, JSON.stringify(user))
  }
  emitAuthChange()
}

export const saveSessionTokens = (tokens: SessionTokens) => {
  if (tokens.accessToken) {
    storage.setItem(TOKEN_KEY, tokens.accessToken)
  }
  if (tokens.refreshToken) {
    storage.setItem(REFRESH_KEY, tokens.refreshToken)
  }
  if (tokens.expires) {
    storage.setItem(EXPIRES_KEY, tokens.expires)
  }
  if (tokens.refreshTokenExpires) {
    storage.setItem(REFRESH_EXPIRES_KEY, tokens.refreshTokenExpires)
  }
  emitAuthChange()
}

export const pickTokens = (payload: unknown): SessionTokens => {
  if (!payload || typeof payload !== 'object') return {}
  const data = payload as Record<string, unknown>
  const nested =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : data

  const accessToken =
    (nested.accessToken as string) ||
    (nested.access_token as string) ||
    (nested.token as string) ||
    (nested.jwt as string) ||
    undefined

  const refreshToken =
    (nested.refreshToken as string) ||
    (nested.refresh_token as string) ||
    undefined

  const expires =
    (nested.expires as string) ||
    (nested.accessTokenExpires as string) ||
    undefined

  const refreshTokenExpires =
    (nested.refreshTokenExpires as string) ||
    (nested.refresh_expires as string) ||
    undefined

  return { accessToken, refreshToken, expires, refreshTokenExpires }
}
