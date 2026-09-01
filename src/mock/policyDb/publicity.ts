import {
  policyDbYears,
  publicityAddresses,
  publicityObtainedPolicies,
} from './filters'
import type {
  PolicyDbItem,
  PolicyDbPublicity,
  PolicyDbPublicityCategory,
} from './types'

const NAME_PREFIX = ['河南', '郑州', '中原', '郑东', '航空港']
const NAME_MID = [
  '中科',
  '智联',
  '华创',
  '明德',
  '协同',
  '数智',
  '千里',
  '高新',
  '中奥',
  '远见',
]
const NAME_SUF = [
  '细胞基因工程',
  '信息技术',
  '新材料',
  '智能装备',
  '生物医药',
  '新能源',
  '光电技术',
  '氢能科技',
]
const PUBLICITY_INDUSTRIES = [
  '研发平台',
  '研发平台',
  '研发平台',
  '信息技术',
  '制造业',
]
const PUBLICITY_AMOUNTS = [20, 10, 50, 15, null, 30, null, 8]
const PUBLICITY_DISTRICTS = publicityAddresses.filter(
  (item) => item !== '郑州市',
)

const categoryCounts: [PolicyDbPublicityCategory, number][] = [
  ['approved', 208],
  ['subsidy', 32],
  ['proposed', 24],
  ['evaluation', 16],
  ['acceptance', 12],
  ['revoked', 8],
]

const regionOf = (district: string): string => {
  if (district === '航空港区') return '河南省 郑州市 郑州航空港经济综合实验区'
  return `河南省 郑州市 ${district}`
}

const companyName = (seed: number): string => {
  const prefix = NAME_PREFIX[seed % NAME_PREFIX.length]
  const mid = NAME_MID[seed % NAME_MID.length]
  const suf = NAME_SUF[seed % NAME_SUF.length]
  const cycle = NAME_PREFIX.length * NAME_MID.length
  if (seed < cycle) return `${prefix}${mid}${suf}有限公司`
  return `${prefix}${mid}${suf}${seed}有限公司`
}

const buildPublicity = (item: PolicyDbItem): PolicyDbPublicity[] => {
  const result: PolicyDbPublicity[] = []
  let seq = 0
  for (const [category, count] of categoryCounts) {
    for (let i = 0; i < count; i += 1) {
      seq += 1
      const isHero = item.id === 1 && category === 'approved' && i === 0
      const district = isHero
        ? '航空港区'
        : (PUBLICITY_DISTRICTS[(seq + item.id) % PUBLICITY_DISTRICTS.length] ??
          '金水区')
      result.push({
        id: item.id * 1000 + seq,
        name: isHero
          ? '河南中科千里细胞基因工程有限公司'
          : companyName(seq + item.id * 17),
        district,
        region: regionOf(district),
        industry:
          PUBLICITY_INDUSTRIES[seq % PUBLICITY_INDUSTRIES.length] ?? '研发平台',
        amount: isHero
          ? 20
          : (PUBLICITY_AMOUNTS[seq % PUBLICITY_AMOUNTS.length] ?? null),
        year:
          policyDbYears[seq % 3 === 0 ? seq % policyDbYears.length : 0] ?? 2026,
        category,
        obtainedPolicy:
          publicityObtainedPolicies[seq % publicityObtainedPolicies.length] ??
          '工程研究中心',
      })
    }
  }
  return result
}

export { buildPublicity }
