import { request } from '@/utils/request'
import {
  asPage,
  compactParams,
  type PageData,
  type PageQuery,
} from '@/api/paging'

export type UserContextPayload = {
  provinceId?: number | null
  cityId?: number | null
  districtId?: number | null
}

/** GET /account/service-contacts 当前客服联系方式 */
export type ServiceContact = {
  id?: string
  phone?: string | null
  wechatAccount?: string | null
  wechatQrKey?: string | null
  wechatQrUrl?: string | null
  workHours?: string | null
  isEnabled?: boolean
  remark?: string | null
}

export const fetchServiceContacts = () => {
  return request<ServiceContact>({
    url: '/account/service-contacts',
    method: 'get',
    hideError: true,
    skipAuthRefresh: true,
  })
}

export const fetchUserContext = () => {
  return request({
    url: '/account/users/me/context',
    method: 'get',
    hideError: true,
  })
}

export const updateUserContext = (data: UserContextPayload) => {
  return request({
    url: '/account/users/me/context',
    method: 'put',
    data,
    hideError: true,
  })
}

/** GET /account/shares/link 返回的邀请链接 */
export type ShareLink = {
  inviteUrl?: string
}

export const fetchShareLink = () => {
  return request<ShareLink>({
    url: '/account/shares/link',
    method: 'get',
    hideError: true,
  })
}

/** GET /account/shares 单条邀请记录。status 为奖励状态，rewardDays 为 0 表示已达赠送上限 */
export type AccountShare = {
  inviteePhone?: string | null
  createTime?: string | null
  status?: number
  rewardDays?: number
}

/** GET /account/messages 用户消息。messageType：1 待办、2 抄送、3 结果 */
export type UserNotification = {
  id: string
  title?: string | null
  summary?: string | null
  isRead?: boolean
  createTime?: string | null
  readTime?: string | null
  messageType?: number | null
  sourceBusinessType?: string | null
  sourceBusinessId?: string | null
  processNumber?: string | null
}

export type AccountMessageQuery = PageQuery & {
  /** 不传为全部；false 只看未读 */
  isRead?: boolean
  messageType?: number
}

/**
 * 未读数接口在 Swagger 里没有响应体。
 * 解包后可能是数字，也可能是带 unreadCount / count / totalCount 的对象。
 */
export const parseUnreadCount = (data: unknown): number => {
  if (typeof data === 'number' && Number.isFinite(data))
    return Math.max(0, data)
  if (typeof data === 'string' && data.trim() !== '') {
    const count = Number(data)
    if (Number.isFinite(count)) return Math.max(0, count)
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 0

  const body = data as Record<string, unknown>
  for (const key of [
    'unreadCount',
    'count',
    'total',
    'totalCount',
    'totalElements',
  ]) {
    if (body[key] !== undefined) return parseUnreadCount(body[key])
  }
  if (typeof body.data === 'number' || typeof body.data === 'string') {
    return parseUnreadCount(body.data)
  }
  return 0
}

/**
 * 消息列表文档写成数组，其它分页接口则是 items + totalElements / totalCount。
 * 两种都认；数组没有总条数时，用已加载条数作为当前总数。
 */
export const normalizeMessagePage = (
  data: unknown,
  pageIndex = 1,
  pageSize = 10,
): PageData<UserNotification> => {
  if (Array.isArray(data)) {
    const items = data as UserNotification[]
    return {
      items,
      pageIndex,
      pageSize,
      totalElements: (pageIndex - 1) * pageSize + items.length,
    }
  }
  const page = asPage<UserNotification>(data)
  return {
    items: page.items,
    pageIndex: page.pageIndex || pageIndex,
    pageSize: page.pageSize || pageSize,
    totalElements: page.totalElements,
  }
}

/** GET /account/messages 消息列表（分页，按创建时间倒序） */
export const fetchAccountMessages = async (query: AccountMessageQuery = {}) => {
  const pageIndex = query.pageIndex ?? 1
  const pageSize = query.pageSize ?? 10
  const data = await request({
    url: '/account/messages',
    method: 'get',
    params: {
      ...compactParams({
        pageIndex,
        pageSize,
        messageType: query.messageType,
      }),
      ...(query.isRead === undefined ? {} : { isRead: query.isRead }),
    },
    hideError: true,
  })
  return normalizeMessagePage(data, pageIndex, pageSize)
}

/** POST /account/messages/{id}/read 标记单条已读 */
export const markMessageRead = (id: string) => {
  return request({
    url: `/account/messages/${id}/read`,
    method: 'post',
    hideError: true,
  })
}

/** POST /account/messages/read-all 标记全部已读 */
export const markAllMessagesRead = () => {
  return request({
    url: '/account/messages/read-all',
    method: 'post',
    hideError: true,
  })
}

/** GET /account/messages/unread-count 未读消息数（顶栏角标） */
export const fetchUnreadMessageCount = async () => {
  const data = await request({
    url: '/account/messages/unread-count',
    method: 'get',
    hideError: true,
  })
  return parseUnreadCount(data)
}

export const fetchAccountShares = async (query: PageQuery = {}) => {
  const data = await request({
    url: '/account/shares',
    method: 'get',
    params: compactParams({
      pageIndex: query.pageIndex ?? 1,
      pageSize: query.pageSize ?? 10,
    }),
    hideError: true,
  })
  return asPage<AccountShare>(data)
}

/** POST /account/shares/export 按页范围导出邀请记录。data 为文件地址 */
export type ShareExportQuery = {
  startPage: number
  endPage: number
  pageSize: number
}

export const exportAccountShares = async (query: ShareExportQuery) => {
  const data = await request<unknown>({
    url: '/account/shares/export',
    method: 'post',
    data: query,
    hideError: true,
  })
  return typeof data === 'string' ? data.trim() : ''
}

/** 关注对象：1 企业 / 2 政策 */
export const FOLLOW_ENTERPRISE = 1 as const
export const FOLLOW_POLICY = 2 as const
export type FollowTargetType = typeof FOLLOW_ENTERPRISE | typeof FOLLOW_POLICY

/** GET /account/follows 列表行。企业、政策的摘要字段按 targetType 取舍 */
export type AccountFollow = {
  followId?: string
  targetType?: FollowTargetType
  targetId?: string
  name?: string | null
  followTime?: string | null
  provinceName?: string | null
  cityName?: string | null
  legalPerson?: string | null
  /** 0 国家 / 1 省 / 2 市 / 3 区县，仅政策关注有值 */
  policyLevel?: number | null
  issuingAuthority?: string | null
}

export type AccountFollowQuery = PageQuery & {
  targetType?: FollowTargetType
}

/** GET /account/follows 分页查询我的关注 */
export const fetchAccountFollows = async (query: AccountFollowQuery = {}) => {
  const pageIndex = query.pageIndex ?? 1
  const pageSize = query.pageSize ?? 10
  const data = await request({
    url: '/account/follows',
    method: 'get',
    params: compactParams({
      targetType: query.targetType,
      pageIndex,
      pageSize,
    }),
    hideError: true,
  })
  return asPage<AccountFollow>(data)
}

/** POST /account/follows 关注企业或政策。重复关注时后端返回原记录 */
export const followTarget = (
  targetType: FollowTargetType,
  targetId: string,
) => {
  return request({
    url: '/account/follows',
    method: 'post',
    data: { targetType, targetId },
    hideError: true,
  })
}

/** DELETE /account/follows 取消关注。未关注时后端视为已取消 */
export const unfollowTarget = (
  targetType: FollowTargetType,
  targetId: string,
) => {
  return request({
    url: '/account/follows',
    method: 'delete',
    params: { TargetType: targetType, TargetId: targetId },
    hideError: true,
  })
}

/** GET /account/users/me/enterprises 已绑定企业 */
export type PolicyUserEnterprise = {
  enterpriseId: string
  name?: string | null
  creditCode?: string | null
  provinceName?: string | null
  cityName?: string | null
  legalPerson?: string | null
  isCurrent?: boolean
  bindTime?: string | null
}

/** 绑定列表。maxBindings 为 0 表示不限（企服人员），企业专员上限为 1 */
export type PolicyUserEnterpriseList = {
  items: PolicyUserEnterprise[]
  identity?: number | null
  currentEnterpriseId?: string | null
  canBindMore?: boolean
  maxBindings?: number
}

/** POST /account/users/me/enterprises。信用代码与企业 Id 二选一，同时传时以企业 Id 为准 */
export type BindPolicyEnterprisePayload = {
  creditCode?: string
  enterpriseId?: string
}

const asEnterpriseRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

const readEnterpriseId = (value: unknown): string | null => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null
  }
  if (typeof value !== 'string') return null
  const id = value.trim()
  return /^[1-9]\d*$/.test(id) ? id : null
}

const readEnterpriseText = (value: unknown) => {
  if (typeof value === 'string') return value
  return null
}

const mapUserEnterprise = (raw: unknown): PolicyUserEnterprise | null => {
  const body = asEnterpriseRecord(raw)
  const enterpriseId = readEnterpriseId(
    body.enterpriseId ?? body.EnterpriseId ?? body.id,
  )
  if (enterpriseId == null) return null
  return {
    enterpriseId,
    name: readEnterpriseText(body.name ?? body.Name),
    creditCode: readEnterpriseText(body.creditCode ?? body.CreditCode),
    provinceName: readEnterpriseText(body.provinceName ?? body.ProvinceName),
    cityName: readEnterpriseText(body.cityName ?? body.CityName),
    legalPerson: readEnterpriseText(body.legalPerson ?? body.LegalPerson),
    isCurrent: Boolean(body.isCurrent ?? body.IsCurrent),
    bindTime: readEnterpriseText(body.bindTime ?? body.BindTime),
  }
}

/** 列表文档是对象；解绑等接口同样返回该结构。兼容直接给数组的情况。 */
export const normalizeUserEnterpriseList = (
  data: unknown,
): PolicyUserEnterpriseList => {
  if (Array.isArray(data)) {
    return {
      items: data
        .map(mapUserEnterprise)
        .filter((item): item is PolicyUserEnterprise => item != null),
    }
  }
  const body = asEnterpriseRecord(data)
  const rawItems = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.Items)
      ? body.Items
      : []
  const maxRaw = body.maxBindings ?? body.MaxBindings
  const maxBindings = typeof maxRaw === 'number' ? maxRaw : Number(maxRaw)
  const identityRaw = body.identity ?? body.Identity
  const identity = identityRaw == null ? Number.NaN : Number(identityRaw)
  const canBindMore = body.canBindMore ?? body.CanBindMore
  return {
    items: rawItems
      .map(mapUserEnterprise)
      .filter((item): item is PolicyUserEnterprise => item != null),
    identity: Number.isFinite(identity) ? identity : null,
    currentEnterpriseId: readEnterpriseId(
      body.currentEnterpriseId ?? body.CurrentEnterpriseId,
    ),
    canBindMore: typeof canBindMore === 'boolean' ? canBindMore : undefined,
    maxBindings: Number.isFinite(maxBindings) ? maxBindings : undefined,
  }
}

export const readBoundEnterpriseId = (data: unknown) => {
  const body = asEnterpriseRecord(data)
  return readEnterpriseId(body.enterpriseId ?? body.EnterpriseId ?? body.id)
}

/**
 * 统一社会信用代码与企业 Id 二选一。
 * 两边都有时只提交企业 Id，与接口「同时传入时以企业 Id 为准」一致。
 */
export const buildBindEnterprisePayload = (input: {
  creditCode?: string | null
  enterpriseId?: string | null
}): BindPolicyEnterprisePayload | null => {
  const enterpriseId = readEnterpriseId(input.enterpriseId)
  if (enterpriseId != null) return { enterpriseId }
  const creditCode = (input.creditCode || '').replace(/\s+/g, '').toUpperCase()
  if (!creditCode) return null
  return { creditCode }
}

/** GET /account/users/me/enterprises 查询我绑定的企业与是否还能继续绑定 */
export const fetchMyEnterprises = async () => {
  const data = await request({
    url: '/account/users/me/enterprises',
    method: 'get',
    hideError: true,
  })
  return normalizeUserEnterpriseList(data)
}

/** POST /account/users/me/enterprises 绑定企业。重复绑定同一企业视为成功 */
export const bindMyEnterprise = (data: BindPolicyEnterprisePayload) => {
  return request({
    url: '/account/users/me/enterprises',
    method: 'post',
    data,
    hideError: true,
  })
}

/** DELETE /account/users/me/enterprises/{enterpriseId} 解绑。未绑定时视为已解绑 */
export const unbindMyEnterprise = async (enterpriseId: string) => {
  const data = await request({
    url: `/account/users/me/enterprises/${enterpriseId}`,
    method: 'delete',
    hideError: true,
  })
  return normalizeUserEnterpriseList(data)
}

/** PUT /account/users/me/enterprises/current 切换当前企业，须为已绑定企业 */
export const setCurrentEnterprise = async (enterpriseId: string) => {
  const data = await request({
    url: '/account/users/me/enterprises/current',
    method: 'put',
    data: { enterpriseId },
    hideError: true,
  })
  return normalizeUserEnterpriseList(data)
}
