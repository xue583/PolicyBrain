import { request, type RequestConfig } from '@/utils/request'
import type { AuthUser, SessionTokens } from '@/utils/auth'

/** POST /auth/smsCodes — PolicySmsPurpose：1 注册，2 登录 */
export const PolicySmsPurpose = {
  Register: 1,
  Login: 2,
} as const

export type PolicySmsPurpose =
  (typeof PolicySmsPurpose)[keyof typeof PolicySmsPurpose]

export type SendSmsPayload = {
  phone: string
  purpose: PolicySmsPurpose
}

/** POST /auth/smsCodeVerifications、/auth/sessions — purpose：1 注册，2 登录 */
export type VerifyCodePayload = {
  phone: string
  code: string
  purpose: PolicySmsPurpose
}

export type CreateSessionPayload = VerifyCodePayload

export type RefreshTokenPayload = {
  token: string
}

/** PATCH /account/users/me/profile — PolicyUserType */
export const PolicyUserType = {
  EnterpriseSpecialist: 1,
  EnterpriseService: 2,
} as const

export type PolicyUserType =
  (typeof PolicyUserType)[keyof typeof PolicyUserType]

export type UpdateProfilePayload = {
  identity?: PolicyUserType
  companyName?: string
  unifiedSocialCreditCode?: string
  jobTitle?: string
  nickname?: string
  inviter?: string
  invitationCode?: string
  avatar?: string
}

const withSilentError = (config?: RequestConfig): RequestConfig => ({
  hideError: true,
  ...config,
})

/** POST /auth/smsCodes */
export const sendSmsCode = (
  data: SendSmsPayload,
  config?: RequestConfig,
): Promise<unknown> => {
  return request({
    url: '/auth/smsCodes',
    method: 'post',
    data,
    ...withSilentError(config),
  })
}

/** POST /auth/smsCodeVerifications */
export const verifySmsCode = (
  data: VerifyCodePayload,
  config?: RequestConfig,
): Promise<unknown> => {
  return request({
    url: '/auth/smsCodeVerifications',
    method: 'post',
    data,
    ...withSilentError(config),
  })
}

/** POST /auth/sessions — 创建会话（登录/注册），需带 purpose */
export const createSession = (
  data: CreateSessionPayload,
  config?: RequestConfig,
): Promise<SessionTokens> => {
  return request({
    url: '/auth/sessions',
    method: 'post',
    data,
    ...withSilentError(config),
  })
}

/** DELETE /auth/sessions/current */
export const logoutSession = (config?: RequestConfig): Promise<unknown> => {
  return request({
    url: '/auth/sessions/current',
    method: 'delete',
    ...withSilentError(config),
  })
}

/** POST /auth/tokenRefreshes */
export const refreshToken = (
  data: RefreshTokenPayload,
  config?: RequestConfig,
): Promise<SessionTokens> => {
  return request({
    url: '/auth/tokenRefreshes',
    method: 'post',
    data,
    ...withSilentError(config),
  })
}

/** GET /account/users/me */
export const fetchCurrentUser = (config?: RequestConfig): Promise<AuthUser> => {
  return request({
    url: '/account/users/me',
    method: 'get',
    ...withSilentError(config),
  })
}

/** PATCH /account/users/me/profile */
export const updateCurrentUser = (
  data: UpdateProfilePayload,
  config?: RequestConfig,
): Promise<AuthUser> => {
  return request({
    url: '/account/users/me/profile',
    method: 'patch',
    data,
    ...withSilentError(config),
  })
}
