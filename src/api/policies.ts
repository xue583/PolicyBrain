import { request } from '@/utils/request'
import {
  asPage,
  compactParams,
  type PageQuery,
  type RegionIdQuery,
} from '@/api/paging'
import {
  mapPolicyApplyInfo,
  mapPolicyCard,
  mapPolicyUpdate,
  mapPublicity,
  mapSupportMeasure,
} from '@/api/mapPortal'

export type PolicyQuery = PageQuery & {
  keyword?: string
  levels?: string[]
  grade?: string
  department?: string
  industryTag?: string
  infoTypes?: string[]
}

export const fetchPolicyPage = async (query: PolicyQuery) => {
  const keyword = query.keyword?.trim()
  const data = await request({
    url: keyword ? '/search/policies' : '/policies',
    method: 'get',
    params: compactParams({
      q: keyword,
      keyword,
      levels: query.levels,
      grade: query.grade,
      department: query.department,
      industryTag: query.industryTag,
      infoTypes: query.infoTypes,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }),
    hideError: true,
  })
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapPolicyCard) }
}

export const fetchPolicyDetail = async (id: number) => {
  const data = await request({
    url: `/policies/${id}`,
    method: 'get',
    hideError: true,
  })
  return mapPolicyCard(data)
}

export const fetchPolicyApplyInfo = async (id: number) => {
  const data = await request({
    url: `/policies/${id}/apply-info`,
    method: 'get',
    hideError: true,
  })
  return mapPolicyApplyInfo(data)
}

const fetchSubPage = async (
  url: string,
  query: PageQuery & RegionIdQuery = {},
) => {
  const data = await request({
    url,
    method: 'get',
    params: compactParams({
      provinceId: query.provinceId,
      cityId: query.cityId,
      districtId: query.districtId,
      pageIndex: query.pageIndex ?? 1,
      pageSize: query.pageSize ?? 100,
    }),
    hideError: true,
  })
  return asPage<unknown>(data)
}

export const fetchPolicySupports = async (
  id: number,
  region: RegionIdQuery = {},
) => {
  const page = await fetchSubPage(`/policies/${id}/support-measures`, {
    ...region,
    pageIndex: 1,
    pageSize: 100,
  })
  return page.items.map(mapSupportMeasure)
}

export const fetchPolicyPublicities = async (id: number) => {
  const page = await fetchSubPage(`/policies/${id}/publicities`)
  return page.items.map(mapPublicity)
}

export const fetchPolicyUpdates = async (id: number) => {
  const page = await fetchSubPage(`/policies/${id}/updates`)
  return page.items.map(mapPolicyUpdate)
}
