import { request, type RequestConfig } from '@/utils/request'
import { prepareSessionKey } from '@/utils/crypto'

/** POST /auth/smsCodes - SendPolicyCodeDto，登录/注册共用同一验证码 */
export type SendSmsPayload = {
  phone: string
}

/** POST /auth/smsCodeVerifications - VerifyPolicyCodeDto */
export type VerifyCodePayload = {
  phone: string
  code: string
}

/** POST /auth/sessions - PolicyLoginDto，登录与注册合并。 */
export type CreateSessionPayload = {
  phone: string
  code: string
  inviteCode?: string
}

/** PATCH /account/users/me/profile - PolicyUserType */
export const PolicyUserType = {
  EnterpriseSpecialist: 1,
  EnterpriseService: 2,
} as const

export type PolicyUserType =
  (typeof PolicyUserType)[keyof typeof PolicyUserType]

/**
 * PATCH /account/users/me/profile 入参。inviter、invitationCode 只在返回里出现。
 * 新头像不走这里，改调 POST /account/users/me/avatar。
 */
export type UpdateProfilePayload = {
  identity?: PolicyUserType
  companyName?: string
  unifiedSocialCreditCode?: string
  jobTitle?: string
  nickname?: string
  avatar?: string
}

/** POST /account/users/me/avatar 返回。url 为约 30 分钟有效的预签名下载链接 */
export type UserAvatarUpload = {
  url?: string | null
}

/** 上传接口 200 的业务字段只有 url，兼容解包前的 data.url 和纯字符串 */
export const readAvatarUploadUrl = (payload: unknown): string => {
  if (typeof payload === 'string') return payload.trim()
  if (!payload || typeof payload !== 'object') return ''
  const body = payload as Record<string, unknown>
  if (typeof body.url === 'string') return body.url.trim()
  const nested = body.data
  if (typeof nested === 'string') return nested.trim()
  if (nested && typeof nested === 'object') {
    const url = (nested as Record<string, unknown>).url
    if (typeof url === 'string') return url.trim()
  }
  return ''
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

/** 创建会话前完成随机会话密钥信封；认证令牌仅由后端写入 HttpOnly Cookie。 */
export const createSession = async (
  data: CreateSessionPayload,
  config?: RequestConfig,
): Promise<unknown> => {
  const exchange = await prepareSessionKey()
  return request({
    url: '/auth/sessions',
    method: 'post',
    data: { ...data, ...exchange },
    skipAuthRefresh: true,
    skipSessionKeyRenew: true,
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

/** POST /account/users/me/avatar - 上传头像。入参为 multipart 字段 file */
export const uploadCurrentUserAvatar = (
  file: Blob,
  config?: RequestConfig,
): Promise<UserAvatarUpload> => {
  const body = new FormData()
  const payload =
    file instanceof File
      ? file
      : new File([file], 'avatar.png', { type: file.type || 'image/png' })
  body.append('file', payload, payload.name || 'avatar.png')
  return request({
    url: '/account/users/me/avatar',
    method: 'post',
    data: body,
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
