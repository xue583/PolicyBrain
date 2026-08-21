import type {
  EnterpriseItem,
  EnterpriseQualPersonnel,
  EnterpriseQualReview,
  EnterpriseQualification,
} from '@/mock/enterpriseDb'
import type {
  PolicyDbItem,
  PolicyDbPublicity,
  PolicyDbSupportMeasure,
  PolicyDbUpdate,
  PolicyDbUpdateStatus,
} from '@/mock/policyDb'
import type { PolicyItem } from '@/mock/policyNews'

export type PolicyNewsFilters = {
  status?: 'normal' | 'expired'
  keyword: string
  region: string
  industries: string[]
  levels: string[]
  infoTypes: string[]
}

export type PolicyDbFilters = {
  keyword: string
  grade: string
  department: string
  industryTag: string
  infoTypes: string[]
  levels: string[]
}

export const filterPolicyNews = (
  list: PolicyItem[],
  filters: PolicyNewsFilters,
): PolicyItem[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (filters.status && item.status !== filters.status) return false
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

export const filterPolicyDb = (
  list: PolicyDbItem[],
  filters: PolicyDbFilters,
): PolicyDbItem[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (
      keyword &&
      !item.name.includes(keyword) &&
      !item.department.includes(keyword) &&
      !item.support.includes(keyword)
    ) {
      return false
    }
    if (filters.grade && item.grade !== filters.grade) return false
    if (filters.department && item.department !== filters.department)
      return false
    if (filters.industryTag && item.industryTag !== filters.industryTag)
      return false
    if (
      filters.infoTypes.length &&
      !filters.infoTypes.includes(item.infoType)
    ) {
      return false
    }
    if (filters.levels.length && !filters.levels.includes(item.level))
      return false
    return true
  })
}

export type PolicyDbUpdateFilters = {
  grade: string
  years: number[]
  statuses: PolicyDbUpdateStatus[]
  keyword: string
}

export const filterPolicyDbUpdates = (
  list: PolicyDbUpdate[],
  filters: PolicyDbUpdateFilters,
): PolicyDbUpdate[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (filters.grade && item.grade !== filters.grade) return false
    if (filters.years.length && !filters.years.includes(item.year)) return false
    if (filters.statuses.length) {
      const status: PolicyDbUpdateStatus = item.expired ? 'expired' : 'active'
      if (!filters.statuses.includes(status)) return false
    }
    if (keyword && !item.title.includes(keyword)) return false
    return true
  })
}

export type PolicyDbPublicityFilters = {
  category: string
  district: string
  years: number[]
  obtainedPolicy: string
  keyword: string
}

export const filterPolicyDbPublicity = (
  list: PolicyDbPublicity[],
  filters: PolicyDbPublicityFilters,
): PolicyDbPublicity[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (filters.category && item.category !== filters.category) return false
    if (
      filters.district &&
      filters.district !== '郑州市' &&
      item.district !== filters.district
    ) {
      return false
    }
    if (filters.years.length && !filters.years.includes(item.year)) return false
    if (
      filters.obtainedPolicy &&
      item.obtainedPolicy !== filters.obtainedPolicy
    ) {
      return false
    }
    if (keyword && !item.name.includes(keyword)) return false
    return true
  })
}

export const filterPolicyDbSupport = (
  list: PolicyDbSupportMeasure[],
  grade: string,
): PolicyDbSupportMeasure[] => {
  if (!grade) return list
  return list.filter((item) => item.grade === grade)
}

export type PolicyDbSupportRow = PolicyDbSupportMeasure & { gradeSpan: number }

export type EnterpriseFilters = {
  keyword: string
  province: string
  industries: string[]
}

export const filterEnterprises = (
  list: EnterpriseItem[],
  filters: EnterpriseFilters,
): EnterpriseItem[] => {
  const keyword = filters.keyword.trim()

  return list.filter((item) => {
    if (
      keyword &&
      !item.name.includes(keyword) &&
      !item.address.includes(keyword)
    ) {
      return false
    }
    if (filters.province && item.province !== filters.province) return false
    if (
      filters.industries.length &&
      !filters.industries.includes(item.industry)
    ) {
      return false
    }
    return true
  })
}

export type QualTabFilters = {
  year: number | null
  keyword: string
}

const matchQualFilters = (
  year: number,
  fields: string[],
  filters: QualTabFilters,
) => {
  if (filters.year != null && year !== filters.year) return false
  const keyword = filters.keyword.trim()
  if (!keyword) return true
  return fields.some((field) => field.includes(keyword))
}

export const filterEnterpriseQualifications = (
  list: EnterpriseQualification[],
  filters: QualTabFilters,
): EnterpriseQualification[] =>
  list.filter((item) =>
    matchQualFilters(
      item.year,
      [item.category, item.name, item.certNo],
      filters,
    ),
  )

export const filterEnterpriseQualPersonnel = (
  list: EnterpriseQualPersonnel[],
  filters: QualTabFilters,
): EnterpriseQualPersonnel[] =>
  list.filter((item) =>
    matchQualFilters(
      item.year,
      [item.name, item.certNo, item.status, item.issuer],
      filters,
    ),
  )

export const filterEnterpriseQualReviews = (
  list: EnterpriseQualReview[],
  filters: QualTabFilters,
): EnterpriseQualReview[] =>
  list.filter((item) =>
    matchQualFilters(
      item.year,
      [item.matter, item.decision, item.reason],
      filters,
    ),
  )

export const attachGradeRowSpan = (
  rows: PolicyDbSupportMeasure[],
): PolicyDbSupportRow[] => {
  const result: PolicyDbSupportRow[] = rows.map((row) => ({
    ...row,
    gradeSpan: 0,
  }))
  let index = 0
  while (index < result.length) {
    let count = 1
    while (
      index + count < result.length &&
      result[index + count]?.grade === result[index]?.grade
    ) {
      count += 1
    }
    const first = result[index]
    if (first) first.gradeSpan = count
    index += count
  }
  return result
}
