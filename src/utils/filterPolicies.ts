import type { PolicyItem } from '@/mock/policyNews'

export type PolicyNewsFilters = {
  status: 'normal' | 'expired'
  keyword: string
  region: string
  industries: string[]
  levels: string[]
  infoTypes: string[]
}

export const filterPolicyNews = (
  list: PolicyItem[],
  filters: PolicyNewsFilters,
): PolicyItem[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (item.status !== filters.status) return false
    if (
      keyword &&
      !item.title.includes(keyword) &&
      !item.description.includes(keyword)
    ) {
      return false
    }
    if (filters.region && item.region !== filters.region) return false
    if (
      filters.industries.length &&
      !filters.industries.includes(item.industry)
    ) {
      return false
    }
    if (filters.levels.length && !filters.levels.includes(item.level))
      return false
    if (
      filters.infoTypes.length &&
      !filters.infoTypes.includes(item.infoType)
    ) {
      return false
    }
    return true
  })
}
