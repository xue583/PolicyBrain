import { request, type RequestConfig } from '@/utils/request'
import { compactParams, type PageQuery } from '@/api/paging'

const silent = (config?: RequestConfig): RequestConfig => ({
  hideError: true,
  ...config,
})

export const fetchMembershipPlans = (level?: string | number) => {
  return request({
    url: '/account/memberships/plans',
    method: 'get',
    params: compactParams({ level }),
    ...silent(),
  })
}

export const fetchMyMembership = () => {
  return request({
    url: '/account/memberships/me',
    method: 'get',
    ...silent(),
  })
}

export const createMembershipOrder = (planCode: string) => {
  return request({
    url: '/account/memberships/orders',
    method: 'post',
    data: { planCode },
  })
}

export const createMembershipPayment = (
  orderNo: string,
  channel?: 'free' | 'wechatpay' | 'alipay',
) => {
  return request({
    url: `/account/memberships/orders/${orderNo}/payments`,
    method: 'post',
    data: compactParams({ channel }),
  })
}

export const fetchMembershipOrder = (orderNo: string) => {
  return request({
    url: `/account/memberships/orders/by-no/${orderNo}`,
    method: 'get',
    ...silent(),
  })
}

export const fetchMembershipOrders = (query: PageQuery = {}) => {
  return request({
    url: '/account/memberships/orders',
    method: 'get',
    params: compactParams({
      pageIndex: query.pageIndex ?? 1,
      pageSize: query.pageSize ?? 10,
    }),
    ...silent(),
  })
}
