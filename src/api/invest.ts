import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'
import { mapInvestProject, mapInvestRegion } from '@/api/mapPortal'
import { asRecord } from '@/api/record'

export type InvestCategory = { name: string; count: number }

export type InvestProjectQuery = PageQuery & {
  /** 投资库地区编码，如 beijing、henan；不传为全国 */
  province?: string
  category?: string
  search?: string
  /** 仅用于列表缺地区时的展示回退，不传给接口 */
  regionLabel?: string
}

export const fetchInvestRegions = async () => {
  const data = await request({
    url: '/invest/regions',
    method: 'get',
    hideError: true,
  })
  const regions = asRecord(data).regions
  return Array.isArray(regions) ? regions.map(mapInvestRegion) : []
}

export const fetchInvestProjects = async (query: InvestProjectQuery) => {
  const data = await request({
    url: '/invest/projects',
    method: 'get',
    params: compactParams({
      province: query.province,
      category: query.category,
      search: query.search,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }),
    hideError: true,
  })
  const record = asRecord(data)
  const page = asPage<unknown>(data)
  const categories = Array.isArray(record.categories)
    ? record.categories.map((item) => {
        const row = asRecord(item)
        return {
          name: String(row.name ?? ''),
          count: Number(row.count ?? 0),
        }
      })
    : []
  const nationalCount = Number(asRecord(record.regionTotals).national ?? 0)
  return {
    page: {
      ...page,
      items: page.items.map((item) =>
        mapInvestProject(item, query.regionLabel),
      ),
    },
    categories: categories.filter((item) => item.name),
    nationalCount: Number.isFinite(nationalCount) ? nationalCount : 0,
  }
}
