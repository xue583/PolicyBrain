import { MembershipLevel, type MembershipBenefit } from '@/api/membership'

export type MembershipBenefitCard = {
  id: string
  level: number
  name: string
  description: string
}

const num = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const asMembershipBenefits = (raw: unknown): MembershipBenefit[] => {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : []
  return list.filter(
    (item): item is MembershipBenefit =>
      Boolean(item) && typeof item === 'object',
  )
}

/**
 * 按 sort 升序去重。编码只保证同一等级内唯一（见 Swagger），
 * 跨等级不能按编码去重，否则 SVIP 会丢掉与 VIP 重名的权益。
 * 说明与名称相同时不再重复展示说明。
 */
export const toBenefitCards = (
  benefits: MembershipBenefit[],
): MembershipBenefitCard[] => {
  const sorted = benefits
    .map((benefit, index) => ({ benefit, index }))
    .sort(
      (a, b) => num(a.benefit.sort) - num(b.benefit.sort) || a.index - b.index,
    )
  const seen = new Set<string>()
  const cards: MembershipBenefitCard[] = []
  sorted.forEach(({ benefit }) => {
    const level = num(benefit.level)
    const name = (benefit.name ?? '').trim()
    if (!name) return
    const code = (benefit.code ?? '').trim()
    const id = code || `${level}-${name}`
    const dedupeKey = `${level}-${id}`
    if (seen.has(dedupeKey)) return
    seen.add(dedupeKey)
    const description = (benefit.description ?? '').trim()
    cards.push({
      id,
      level,
      name,
      description: description && description !== name ? description : '',
    })
  })
  return cards
}

export const benefitsForLevel = (
  benefits: MembershipBenefitCard[],
  level: number,
) => benefits.filter((item) => item.level === level)

/**
 * VIP / SVIP 页签固定展示的几项权益，按设计稿顺序。
 * 接口只在部分等级返回（如高级搜索仅 level 2），缺失项用关键词兜底，
 * 保证两个页签展示一致。
 */
const TAB_BENEFIT_KEYWORDS = [
  '高级搜索',
  '智能申报',
  '批量查询',
  '匹配政策',
  '培育企业',
  '个性化政策推荐',
]

const pickTabBenefits = (benefits: MembershipBenefitCard[], level: number) =>
  TAB_BENEFIT_KEYWORDS.map((keyword) => {
    const matched = benefits.find((item) => item.name.includes(keyword))
    return (
      matched ?? {
        id: `tab-${level}-${keyword}`,
        level,
        name: keyword,
        description: '',
      }
    )
  })

/** 个人板 VIP 页签同时展示 level 0，与套餐分组一致。 */
export const benefitsForPersonalTab = (
  benefits: MembershipBenefitCard[],
  tab: 'vip' | 'svip',
) => {
  const levelPicked =
    tab === 'svip'
      ? benefitsForLevel(benefits, MembershipLevel.Svip)
      : [
          ...benefitsForLevel(benefits, MembershipLevel.Vip),
          ...benefitsForLevel(benefits, MembershipLevel.None),
        ]
  return pickTabBenefits(
    levelPicked,
    tab === 'svip' ? MembershipLevel.Svip : MembershipLevel.Vip,
  )
}

/** 企业板 VIP / SVIP 页签权益；企业套餐页签展示写死的商务权益，不走接口。 */
export const benefitsForEnterpriseTab = (
  benefits: MembershipBenefitCard[],
  tab: 'vip' | 'svip',
) => {
  const level = tab === 'svip' ? MembershipLevel.Svip : MembershipLevel.Vip
  return pickTabBenefits(benefitsForLevel(benefits, level), level)
}
