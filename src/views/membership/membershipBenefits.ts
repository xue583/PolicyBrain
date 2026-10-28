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

/** 按 sort 升序去重。说明与名称相同时不再重复展示说明。 */
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
    if (seen.has(id)) return
    seen.add(id)
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

/** 个人板 VIP 页签同时展示 level 0，与套餐分组一致。 */
export const benefitsForPersonalTab = (
  benefits: MembershipBenefitCard[],
  tab: 'vip' | 'svip',
) => {
  if (tab === 'svip') return benefitsForLevel(benefits, MembershipLevel.Svip)
  return [
    ...benefitsForLevel(benefits, MembershipLevel.Vip),
    ...benefitsForLevel(benefits, MembershipLevel.None),
  ]
}

export const benefitsForEnterpriseTab = (
  benefits: MembershipBenefitCard[],
  tab: 'vip' | 'svip' | 'org',
) => {
  if (tab === 'svip') return benefitsForLevel(benefits, MembershipLevel.Svip)
  if (tab === 'org') return benefitsForLevel(benefits, MembershipLevel.None)
  return benefitsForLevel(benefits, MembershipLevel.Vip)
}
