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

export type VerifyCodePayload = {
  phone: string
  code: string
}

export type CreateSessionPayload = VerifyCodePayload & {
  purpose: PolicySmsPurpose
}

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

/** POST /auth/smsCodes */
export const sendSmsCode = (
  data: SendSmsPayload,
  config?: RequestConfig,
): Promise<unknown> => {
  return request({
    url: '/auth/smsCodes',
    method: 'post',
    data,
    ...config,
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
    ...config,
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
    ...config,
  })
}

/** DELETE /auth/sessions/current */
export const logoutSession = (config?: RequestConfig): Promise<unknown> => {
  return request({
    url: '/auth/sessions/current',
    method: 'delete',
    ...config,
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
    ...config,
  })
}

/** GET /account/users/me */
export const fetchCurrentUser = (config?: RequestConfig): Promise<AuthUser> => {
  return request({
    url: '/account/users/me',
    method: 'get',
    ...config,
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
    ...config,
  })
}
