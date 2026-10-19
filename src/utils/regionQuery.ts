import type { LocationQuery } from 'vue-router'

export type RegionIds = {
  provinceId: number | null
  cityId: number | null
  districtId: number | null
}

/** 路由上承载省市区信息的 query 字段 */
export const REGION_QUERY_KEYS = ['provinceId', 'cityId', 'districtId'] as const

export const parseRegionId = (value: unknown): number | null => {
  if (value == null) return null
  const text = String(value).trim()
  if (!text) return null
  const id = Number(text)
  return Number.isFinite(id) ? id : null
}

export const parseRegionIds = (query: LocationQuery): RegionIds => ({
  provinceId: parseRegionId(query.provinceId),
  cityId: parseRegionId(query.cityId),
  districtId: parseRegionId(query.districtId),
})

export const hasRegionIds = (ids: RegionIds) =>
  ids.provinceId != null || ids.cityId != null || ids.districtId != null

export const sameRegionIds = (a: RegionIds, b: RegionIds) =>
  a.provinceId === b.provinceId &&
  a.cityId === b.cityId &&
  a.districtId === b.districtId

export const regionIdsKey = (ids: RegionIds) =>
  `${ids.provinceId ?? ''}:${ids.cityId ?? ''}:${ids.districtId ?? ''}`

/** 把省市区 id 合并进路由 query：空值移除对应字段，其余参数原样保留 */
export const withRegionIds = (
  query: LocationQuery,
  ids: RegionIds,
): LocationQuery => {
  const next: LocationQuery = { ...query }
  const apply = (key: keyof RegionIds, value: number | null) => {
    if (value == null) delete next[key]
    else next[key] = String(value)
  }
  apply('provinceId', ids.provinceId)
  apply('cityId', ids.cityId)
  apply('districtId', ids.districtId)
  return next
}

/** 路由 query 上的省市区是否已与目标一致 */
export const regionQueryMatches = (query: LocationQuery, ids: RegionIds) =>
  parseRegionId(query.provinceId) === ids.provinceId &&
  parseRegionId(query.cityId) === ids.cityId &&
  parseRegionId(query.districtId) === ids.districtId
