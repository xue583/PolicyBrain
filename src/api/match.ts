import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'
import { mapMatchPolicy } from '@/api/mapPortal'

export const fetchEntToPolicy = async (
  enterpriseId: number,
  query: PageQuery = {},
) => {
  const data = await request({
    url: '/match/ent-to-policy',
    method: 'get',
    params: compactParams({
      enterpriseId,
      pageIndex: query.pageIndex ?? 1,
      pageSize: query.pageSize ?? 200,
    }),
    hideError: true,
  })
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapMatchPolicy) }
}

export const fetchPolicyToEnt = async (
  policyId: number,
  query: PageQuery = {},
) => {
  const data = await request({
    url: '/match/policy-to-ent',
    method: 'get',
    params: compactParams({
      policyId,
      pageIndex: query.pageIndex ?? 1,
      pageSize: query.pageSize ?? 20,
    }),
    hideError: true,
  })
  const page = asPage<unknown>(data)
  return page
}
