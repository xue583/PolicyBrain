import { request, type RequestConfig } from '@/utils/request'
import type { AuthUser, SessionTokens } from '@/utils/auth'

export type SendSmsPayload = {
  phone: string
}

export type VerifyCodePayload = {
  phone: string
  code: string
}

export type RefreshTokenPayload = {
  token: string
}

/** PATCH /api/users/me — PolicyUserType */
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

/** POST /api/smsCodes */
export const sendSmsCode = (
  data: SendSmsPayload,
  config?: RequestConfig,
): Promise<unknown> => {
  return request({
    url: '/smsCodes',
    method: 'post',
    data,
    ...config,
  })
}

/** POST /api/smsCodeVerifications */
export const verifySmsCode = (
  data: VerifyCodePayload,
  config?: RequestConfig,
): Promise<unknown> => {
  return request({
    url: '/smsCodeVerifications',
    method: 'post',
    data,
    ...config,
  })
}

/** POST /api/sessions — 创建会话（登录） */
export const createSession = (
  data: VerifyCodePayload,
  config?: RequestConfig,
): Promise<SessionTokens> => {
  return request({
    url: '/sessions',
    method: 'post',
    data,
    ...config,
  })
}

/** DELETE /api/sessions/current */
export const logoutSession = (config?: RequestConfig): Promise<unknown> => {
  return request({
    url: '/sessions/current',
    method: 'delete',
    ...config,
  })
}

/** POST /api/tokenRefreshes */
export const refreshToken = (
  data: RefreshTokenPayload,
  config?: RequestConfig,
): Promise<SessionTokens> => {
  return request({
    url: '/tokenRefreshes',
    method: 'post',
    data,
    ...config,
  })
}

/** GET /api/users/me */
export const fetchCurrentUser = (config?: RequestConfig): Promise<AuthUser> => {
  return request({
    url: '/users/me',
    method: 'get',
    ...config,
  })
}

/** PATCH /api/users/me */
export const updateCurrentUser = (
  data: UpdateProfilePayload,
  config?: RequestConfig,
): Promise<AuthUser> => {
  return request({
    url: '/users/me',
    method: 'patch',
    data,
    ...config,
  })
}
