import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'

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
