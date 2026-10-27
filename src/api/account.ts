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
  id?: number
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
  id: number
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
export const markMessageRead = (id: number | string) => {
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
