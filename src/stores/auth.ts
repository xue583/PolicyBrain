import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearToken,
  getStoredUser,
  getToken,
  onAuthChange,
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
  updateCurrentUser,
  verifySmsCode,
  type PolicySmsPurpose,
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

  const requestSmsCode = async (phone: string, purpose: PolicySmsPurpose) => {
    return sendSmsCode({ phone, purpose })
  }

  const loginBySms = async (
    phone: string,
    code: string,
    purpose: PolicySmsPurpose,
  ) => {
    const result = await createSession({ phone, code, purpose })
    applySession(result)
    try {
      await loadCurrentUser()
    } catch {
      // 登录成功但拉用户失败时，仍保留会话
    }
    return result
  }

  const verifyRegisterCode = async (
    phone: string,
    code: string,
    purpose: PolicySmsPurpose,
  ) => {
    return verifySmsCode({ phone, code, purpose })
  }

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const me = await updateCurrentUser(payload)
    if (me && typeof me === 'object') {
      user.value = me as AuthUser
      setStoredUser(user.value)
    }
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
    loadCurrentUser,
    logout,
    hydrateUser,
  }
})
