import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearToken,
  getStoredUser,
  getToken,
  onAuthChange,
  clearInviteCode,
  pickTokens,
  saveSessionTokens,
  setStoredUser,
  type AuthUser,
} from '@/utils/auth'
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
  const token = ref(getToken())
  const user = ref<AuthUser | null>(getStoredUser())

  const isLoggedIn = computed(() => Boolean(token.value))

  onAuthChange(() => {
    token.value = getToken()
    user.value = getStoredUser()
  })

  const applySession = (payload: unknown) => {
    const tokens = pickTokens(payload)
    if (tokens.accessToken || tokens.refreshToken) {
      saveSessionTokens(tokens)
    }
    if (tokens.accessToken) {
      token.value = tokens.accessToken
    }

    if (payload && typeof payload === 'object') {
      const data = payload as Record<string, unknown>
      const userLike =
        (data.user as AuthUser | undefined) ||
        (data.profile as AuthUser | undefined) ||
        null
      if (userLike) {
        user.value = userLike
        setStoredUser(userLike)
      }
    }
  }

  const loadCurrentUser = async () => {
    const me = await fetchCurrentUser()
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
    applySession(result)
    clearInviteCode()
    try {
      await loadCurrentUser()
    } catch {
      // 登录成功但拉用户失败时，仍保留会话
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
      if (token.value) {
        await logoutSession()
      }
    } catch {
      // 忽略登出接口失败，本地仍清理
    } finally {
      clearToken()
      token.value = ''
      user.value = null
    }
  }

  const hydrateUser = async () => {
    if (!token.value) return null
    try {
      return await loadCurrentUser()
    } catch {
      // 401 已由请求层清理会话；网络等其它失败时保留本地缓存资料
      return user.value
    }
  }

  return {
    token,
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
