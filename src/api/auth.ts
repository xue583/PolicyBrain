import { request, type RequestConfig } from '@/utils/request'
import type { SessionTokens } from '@/utils/auth'

/** POST /auth/smsCodes - SendPolicyCodeDto，登录/注册共用同一验证码 */
export type SendSmsPayload = {
  phone: string
}

/** POST /auth/smsCodeVerifications - VerifyPolicyCodeDto */
export type VerifyCodePayload = {
  phone: string
  code: string
}

/**
 * POST /auth/sessions - PolicyLoginDto。
 * 登录与注册已合并：手机号未注册时，验证码通过即自动注册并登录。
 * keyId / keyEnvelope 为可选会话密钥信封；不传则走静态密钥。
 */
export type CreateSessionPayload = {
  phone: string
  code: string
  keyId?: string
  keyEnvelope?: string
  inviteCode?: string
}

export type RefreshTokenPayload = {
  token: string
}

/** PATCH /account/users/me/profile - PolicyUserType */
export const PolicyUserType = {
  EnterpriseSpecialist: 1,
  EnterpriseService: 2,
} as const

export type PolicyUserType =
  (typeof PolicyUserType)[keyof typeof PolicyUserType]

/** PATCH /account/users/me/profile 入参。inviter、invitationCode 只在返回里出现 */
export type UpdateProfilePayload = {
  identity?: PolicyUserType
  companyName?: string
  unifiedSocialCreditCode?: string
  jobTitle?: string
  nickname?: string
  avatar?: string
}

/** PATCH /account/users/me/profile 与 GET /account/users/me 返回的用户资料 */
export type UserProfile = {
  id?: number
  phone?: string
  identity?: PolicyUserType
  companyName?: string
  unifiedSocialCreditCode?: string
  jobTitle?: string
  nickname?: string
  inviter?: string
  invitationCode?: string
  avatar?: string
  lastLoginTime?: string
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

/**
 * POST /auth/sessions - 创建会话（登录/注册同一接口）。
 * Swagger 的 200 未声明响应体；线上为 { status, message, data, encrypted }，
 * data 由请求层解包解密后读取访问令牌。
 */
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
export const fetchCurrentUser = (
  config?: RequestConfig,
): Promise<UserProfile> => {
  return request({
    url: '/account/users/me',
    method: 'get',
    ...withSilentError(config),
  })
}

/** PATCH /account/users/me/profile - 更新个人资料、身份认证 */
export const updateCurrentUser = (
  data: UpdateProfilePayload,
  config?: RequestConfig,
): Promise<UserProfile> => {
  return request({
    url: '/account/users/me/profile',
    method: 'patch',
    data,
    ...withSilentError(config),
  })
}
