import { MembershipLevel, type MembershipPlan } from '@/api/membership'

export { MembershipLevel }

/** 在售计划需要分别按这三个等级查询 */
export const MEMBERSHIP_PLAN_LEVELS = [
  MembershipLevel.None,
  MembershipLevel.Vip,
  MembershipLevel.Svip,
] as const

export type MembershipPlanCard = {
  id: string
  level: number
  name: string
  /** 实付价，单位元 */
  price: number
  /** 划线价，单位元；不展示时为空 */
  original?: number
  /** 折合每天的金额，不含文案 */
  daily: string
  tag?: string
  desc?: string
  featured: boolean
  durationDays: number
  /** 套餐时长文案，如 1年、6个月 */
  periodLabel: string
  /** 相对划线价已减金额，单位元 */
  saved?: string
  applicableIdentity?: number
}

const num = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const fenToYuan = (fen: number) => Math.round(fen) / 100

export const formatYuanAmount = (yuan: number) => {
  if (!Number.isFinite(yuan)) return '0'
  return yuan
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

const periodLabel = (days: number, name: string) => {
  if (days >= 365 && days % 365 === 0) return `${days / 365}年`
  if (days >= 30 && days % 30 === 0) return `${days / 30}个月`
  if (days > 0) return `${days}天`
  return name
}

export const asMembershipPlans = (raw: unknown): MembershipPlan[] => {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === 'object' &&
        Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : []
  return list.filter(
    (item): item is MembershipPlan => Boolean(item) && typeof item === 'object',
  )
}

const toCard = (plan: MembershipPlan, index: number): MembershipPlanCard => {
  const level = num(plan.level)
  const payFen = plan.currentPrice ?? plan.price ?? 0
  const listFen =
    plan.originalPrice && plan.originalPrice > 0
      ? plan.originalPrice
      : plan.price && plan.price > payFen
        ? plan.price
        : 0
  const price = fenToYuan(num(payFen))
  const original = listFen > payFen ? fenToYuan(num(listFen)) : undefined
  const durationDays = Math.max(0, num(plan.durationDays))
  const description = (plan.description ?? '').trim()
  const name = (plan.name ?? '').trim() || '会员套餐'
  const code = (plan.code ?? '').trim()
  let tag: string | undefined
  let desc: string | undefined
  if (description && description.length <= 12) tag = description
  else if (description) desc = description
  if (!tag && num(plan.purchaseLimit) === 1) tag = '仅可买一次'

  return {
    id:
      code ||
      `${level}-${plan.durationType ?? 0}-${plan.sort ?? index}-${name}`,
    level,
    name,
    price,
    original,
    daily: durationDays > 0 ? formatYuanAmount(price / durationDays) : '',
    tag,
    desc,
    featured: false,
    durationDays,
    periodLabel: periodLabel(durationDays, name),
    saved:
      original != null && original > price
        ? formatYuanAmount(original - price)
        : undefined,
    applicableIdentity:
      plan.applicableIdentity == null
        ? undefined
        : num(plan.applicableIdentity),
  }
}

/** 按 sort 升序去重，每个等级的第一档作为默认选中 */
export const toPlanCards = (plans: MembershipPlan[]): MembershipPlanCard[] => {
  const sorted = plans
    .map((plan, index) => ({ plan, index }))
    .sort((a, b) => num(a.plan.sort) - num(b.plan.sort) || a.index - b.index)
  const seen = new Set<string>()
  const featuredLevels = new Set<number>()
  const cards: MembershipPlanCard[] = []
  sorted.forEach(({ plan, index }) => {
    const card = toCard(plan, index)
    if (seen.has(card.id)) return
    seen.add(card.id)
    if (!featuredLevels.has(card.level)) {
      card.featured = true
      featuredLevels.add(card.level)
    }
    cards.push(card)
  })
  return cards
}

/** 适用身份匹配当前用户；接口未标记身份的套餐两边都展示。筛空时退回全部，避免页面空白。 */
export const plansForIdentity = (
  plans: MembershipPlanCard[],
  identity?: number | null,
) => {
  if (identity == null || Number.isNaN(Number(identity))) return plans
  const id = Number(identity)
  const matched = plans.filter(
    (plan) => plan.applicableIdentity == null || plan.applicableIdentity === id,
  )
  return matched.length ? matched : plans
}

export const plansByLevel = (plans: MembershipPlanCard[], level: number) =>
  plans.filter((plan) => plan.level === level)

/** 个人板只有 VIP / SVIP。level 0 没有独立页签，跟在 VIP 后面展示。 */
export const personalPlansForTab = (
  plans: MembershipPlanCard[],
  tab: 'vip' | 'svip',
) => {
  if (tab === 'svip') return plansByLevel(plans, MembershipLevel.Svip)
  return [
    ...plansByLevel(plans, MembershipLevel.Vip),
    ...plansByLevel(plans, MembershipLevel.None),
  ]
}
