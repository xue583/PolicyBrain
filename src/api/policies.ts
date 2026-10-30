import { request } from '@/utils/request'
import { asRecord, pick, pickString } from '@/api/record'
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

export type PolicyQuery = PageQuery &
  RegionIdQuery & {
    keyword?: string
    levels?: string[]
    grade?: string
    department?: string
    /** 发布单位 Id，对应 /policies 的 IssuingAuthorityId */
    issuingAuthorityId?: string
    industryTag?: string
    infoTypes?: string[]
  }

export type IssuingAuthorityOption = {
  id: string
  name: string
}

export type IssuingAuthorityQuery = RegionIdQuery & {
  keyword?: string
  /** 0 国家 / 1 省 / 2 市 / 3 区县 */
  level?: number | null
}

/**
 * 雪花 Id 超过 Number.MAX_SAFE_INTEGER，默认 JSON.parse 会丢精度。
 * 先把 16 位及以上的 JSON 数字收成字符串，再解析。
 */
export const parseJsonPreservingLongIds = (raw: unknown) => {
  if (typeof raw !== 'string') return raw
  const text = raw.trim()
  if (!text) return raw
  return JSON.parse(text.replace(/(?<=[:\])\s*(\d{16,})(?=\s*[,}\]])/g, '"$1"'))
}

const mapIssuingAuthorityOption = (
  raw: unknown,
): IssuingAuthorityOption | null => {
  const record = asRecord(raw)
  const name = pickString(record, ['displayName', 'name', 'shortName1']).trim()
  const idValue = pick(record, ['id'])
  const id = idValue === undefined || idValue === null ? '' : String(idValue)
  if (!name || !id) return null
  return { id, name }
}

/** data.items → 发布单位选项。名称优先显示名。 */
export const mapIssuingAuthorityOptions = (
  data: unknown,
): IssuingAuthorityOption[] => {
  return asPage<unknown>(data)
    .items.map(mapIssuingAuthorityOption)
    .filter((item): item is IssuingAuthorityOption => Boolean(item))
}

/** 发布单位下拉。匿名接口，Body：keyword / level / 省市区均可空。 */
export const fetchIssuingAuthorityOptions = async (
  query: IssuingAuthorityQuery,
) => {
  const data = await request({
    url: '/issuingAuthority/nameOptions',
    method: 'put',
    data: compactParams({
      keyword: query.keyword?.trim(),
      level: query.level,
      provinceId: query.provinceId,
      cityId: query.cityId,
      districtId: query.districtId,
    }),
    transformResponse: [parseJsonPreservingLongIds],
    hideError: true,
  })
  return mapIssuingAuthorityOptions(data)
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
      issuingAuthorityId: query.issuingAuthorityId,
      industryTag: query.industryTag,
      infoTypes: query.infoTypes,
      provinceId: query.provinceId,
      cityId: query.cityId,
      districtId: query.districtId,
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
