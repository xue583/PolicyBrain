import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'
import { mapMatchPolicy, mapMatchedEnterprise } from '@/api/mapPortal'

/**
 * 企→政有效匹配。Swagger GET /match/ent-to-policy（需登录）。
 * 查询参数：enterpriseId（必填）、PageIndex、PageSize。
 * 排序 SortField / OrderByType 与回传用的 TotalElements / TotalPages 不传。
 * 200 响应体未在文档中声明，分页信封与政策库列表一致：items、pageIndex、pageSize、totalElements。
 */
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
      pageSize: query.pageSize ?? 10,
    }),
    hideError: true,
  })
  if (Array.isArray(data)) {
    const items = data.map(mapMatchPolicy)
    return {
      items,
      pageIndex: 1,
      pageSize: items.length,
      totalElements: items.length,
    }
  }
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapMatchPolicy) }
}

/** 政→企有效匹配。Swagger GET /match/policy-to-ent。 */
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
  if (Array.isArray(data)) {
    const items = data.map(mapMatchedEnterprise)
    return {
      items,
      pageIndex: 1,
      pageSize: items.length,
      totalElements: items.length,
    }
  }
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapMatchedEnterprise) }
}
