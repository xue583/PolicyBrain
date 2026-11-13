const INVITE_KEY = 'pb_invite_code'
const INVITE_REGISTER_KEY = 'pb_invite_register'
const USER_KEY = 'pb_user'
const LEGACY_TOKEN_KEYS = [
  'pb_access_token',
  'pb_refresh_token',
  'pb_token_expires',
  'pb_refresh_expires',
]

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
  lastLoginTime?: string
  [key: string]: unknown
}

type Listener = () => void
const authListeners = new Set<Listener>()
const needLoginListeners = new Set<Listener>()
/** 路由守卫可能早于 Header 订阅登录弹窗。 */
let pendingNeedLogin = false

const emitAuthChange = () => {
  authListeners.forEach((fn) => fn())
}

export const onAuthChange = (fn: Listener) => {
  authListeners.add(fn)
  return () => authListeners.delete(fn)
}

export const onNeedLogin = (fn: Listener) => {
  needLoginListeners.add(fn)
  if (pendingNeedLogin) {
    pendingNeedLogin = false
    fn()
  }
  return () => needLoginListeners.delete(fn)
}

export const triggerNeedLogin = () => {
  if (needLoginListeners.size === 0) {
    pendingNeedLogin = true
    return
  }
  pendingNeedLogin = false
  needLoginListeners.forEach((fn) => fn())
}

/** 邀请链接 `/?invite=` 暂存，登录/注册创建会话时随 PolicyLoginDto.inviteCode 上传。 */
export const rememberInviteCode = (code: string) => {
  if (typeof window === 'undefined') return
  const value = code.trim()
  if (!value) return
  window.sessionStorage.setItem(INVITE_KEY, value)
}

export const getInviteCode = (): string => {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(INVITE_KEY) || ''
}

export const clearInviteCode = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(INVITE_KEY)
  window.sessionStorage.removeItem(INVITE_REGISTER_KEY)
}

/** 从邀请链接进入且未登录时，下一次打开登录弹窗切到注册。 */
export const markInviteRegister = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(INVITE_REGISTER_KEY, '1')
}

export const consumeInviteRegister = () => {
  if (typeof window === 'undefined') return false
  const pending = window.sessionStorage.getItem(INVITE_REGISTER_KEY) === '1'
  if (pending) window.sessionStorage.removeItem(INVITE_REGISTER_KEY)
  return pending
}

/** 清理旧版本遗留的 Web Storage 令牌，避免升级后继续暴露。 */
const removeLegacyTokens = () => {
  if (typeof window === 'undefined') return
  for (const storage of [window.localStorage, window.sessionStorage]) {
    LEGACY_TOKEN_KEYS.forEach((key) => storage.removeItem(key))
  }
}

removeLegacyTokens()

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** 非敏感用户资料仅用于登录态提示，真正的认证凭据只存在 HttpOnly Cookie。 */
export const hasSession = (): boolean => getStoredUser() != null

export const setStoredUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return
  if (!user) window.localStorage.removeItem(USER_KEY)
  else window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  emitAuthChange()
}

export const clearSession = () => {
  if (typeof window !== 'undefined') window.localStorage.removeItem(USER_KEY)
  removeLegacyTokens()
  emitAuthChange()
}
