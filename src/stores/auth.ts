import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearSession,
  getStoredUser,
  hasSession,
  onAuthChange,
  clearInviteCode,
  setStoredUser,
  type AuthUser,
} from '@/utils/auth'
import { ApiError } from '@/utils/apiError'
import { ensureSessionKey, resetSessionKey } from '@/utils/crypto'
import { resetCsrfToken } from '@/utils/csrf'
import type { RequestConfig } from '@/utils/request'
import {
  createSession,
  fetchCurrentUser,
  logoutSession,
  sendSmsCode,
  readAvatarUploadUrl,
  updateCurrentUser,
  uploadCurrentUserAvatar,
  verifySmsCode,
  type UpdateProfilePayload,
} from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(getStoredUser())
  const isLoggedIn = computed(() => user.value != null)

  onAuthChange(() => {
    user.value = getStoredUser()
  })

  const loadCurrentUser = async (config?: RequestConfig) => {
    const me = await fetchCurrentUser(config)
    if (me && typeof me === 'object') {
      user.value = me as AuthUser
      setStoredUser(user.value)
    }
    return user.value
  }

  const requestSmsCode = async (phone: string) => {
    return sendSmsCode({ phone })
  }

  const loginBySms = async (
    phone: string,
    code: string,
    inviteCode?: string,
  ) => {
    const result = await createSession({
      phone,
      code,
      ...(inviteCode ? { inviteCode } : {}),
    })

    // Cookie 已由后端写入；空资料仅作为本地登录态提示，随后由当前用户接口补全。
    user.value = {}
    setStoredUser(user.value)
    clearInviteCode()
    try {
      await loadCurrentUser()
    } catch {
      // 登录成功但拉用户失败时，仍保留 HttpOnly Cookie 会话
    }
    return result
  }

  const verifyRegisterCode = async (phone: string, code: string) => {
    return verifySmsCode({ phone, code })
  }

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const me = await updateCurrentUser(payload)
    if (me && typeof me === 'object') {
      user.value = me as AuthUser
      setStoredUser(user.value)
    }
    return user.value
  }

  const isDisplayableAvatar = (value?: string | null) =>
    /^(https?:|data:|blob:)/i.test(value?.trim() || '')

  /** POST /account/users/me/avatar。页面展示接口返回的 url。 */
  const uploadAvatar = async (file: Blob) => {
    const uploaded = await uploadCurrentUserAvatar(file)
    const signedUrl = readAvatarUploadUrl(uploaded)
    if (signedUrl) {
      user.value = { ...(user.value || {}), avatar: signedUrl }
    }
    try {
      const profile = await loadCurrentUser()
      if (signedUrl && profile && !isDisplayableAvatar(profile.avatar)) {
        user.value = { ...profile, avatar: signedUrl }
      }
    } catch {
      // 图片已经上传成功，刷新资料失败时仍展示本次返回的 url
    }
    if (user.value) setStoredUser(user.value)
    return user.value
  }

  const logout = async () => {
    try {
      await logoutSession()
    } catch {
      // 忽略登出接口失败，本地仍清理；后端在令牌过期时也会清除 Cookie
    } finally {
      clearSession()
      resetSessionKey()
      resetCsrfToken()
      user.value = null
    }
  }

  /** 页面加载时通过 Cookie 恢复会话；匿名后台探测不弹登录框。 */
  const hydrateUser = async () => {
    // 无任何本地登录痕迹时跳过探测，避免匿名访客每次加载空跑认证请求。
    // Cookie 存在而 pb_user 缺失的窗口（手动清 storage）由用户重新登录覆盖。
    if (!hasSession()) return null

    try {
      await ensureSessionKey()
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401))
        return user.value
    }

    try {
      return await loadCurrentUser({ suppressAuthPrompt: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearSession()
      return user.value
    }
  }

  return {
    user,
    isLoggedIn,
    requestSmsCode,
    loginBySms,
    verifyRegisterCode,
    updateProfile,
    uploadAvatar,
    loadCurrentUser,
    logout,
    hydrateUser,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
