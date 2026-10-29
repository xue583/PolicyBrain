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
  // 售价取 price（标准售价，单位分）；接口未返回该字段时才回退 currentPrice
  const payFen = plan.price ?? plan.currentPrice ?? 0
  // 划线价取 originalPrice，为 0 表示不展示
  const listFen =
    plan.originalPrice && plan.originalPrice > 0 ? plan.originalPrice : 0
  const price = fenToYuan(num(payFen))
  const original = listFen > payFen ? fenToYuan(num(listFen)) : undefined
  const durationDays = Math.max(0, num(plan.durationDays))
  const description = (plan.description ?? '').trim()
  const name = (plan.name ?? '').trim() || '会员套餐'
  const code = (plan.code ?? '').trim()
  // 企业套餐角标取描述首句（如「买二送一」），个人卡片维持按长度取整句的规则
  const orgMarked =
    ORG_CODE.test(code) || ORG_MARK.test(`${name} ${description}`)
  const lead = description.match(/^[^。！？!?]+/)?.[0]?.trim() ?? ''
  let tag: string | undefined
  let desc: string | undefined
  if (orgMarked) {
    // 企业套餐角标只取描述里的促销首句，不把整句描述塞进角标
    if (lead.length > 0 && lead.length <= 6) tag = lead
    if (description) desc = description
  } else {
    if (description && description.length <= 12) tag = description
    else if (description) desc = description
    if (!tag && num(plan.purchaseLimit) === 1) tag = '仅可买一次'
  }

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
  identity?: number | string | null,
) => {
  if (identity == null || identity === '' || Number.isNaN(Number(identity))) {
    return plans
  }
  const id = Number(identity)
  const matched = plans.filter(
    (plan) => plan.applicableIdentity == null || plan.applicableIdentity === id,
  )
  return matched.length ? matched : plans
}

export const plansByLevel = (plans: MembershipPlanCard[], level: number) =>
  plans.filter((plan) => plan.level === level)

const ORG_CODE = /^ent_/i
const ORG_MARK = /企业/

/**
 * 企业套餐与个人套餐同等级售卖（企业 VIP 在 level 1、企业 SVIP 在 level 2），
 * applicableIdentity 两边都可能是同一个值，只能按 ent_ 编码前缀识别，
 * 名称或描述里的「企业」字样兜底。
 */
export const isOrgPlan = (plan: MembershipPlanCard) =>
  ORG_CODE.test(plan.id) ||
  ORG_MARK.test(`${plan.name} ${plan.tag ?? ''} ${plan.desc ?? ''}`)

export const orgPlans = (plans: MembershipPlanCard[]) => plans.filter(isOrgPlan)

export const personalPlans = (plans: MembershipPlanCard[]) =>
  plans.filter((plan) => !isOrgPlan(plan))

/** 企业套餐子档：优先按会员等级分，等级缺失时回退名称 */
export const orgPlanTier = (plan: MembershipPlanCard): 'vip' | 'svip' => {
  if (plan.level === MembershipLevel.Vip) return 'vip'
  if (plan.level === MembershipLevel.Svip) return 'svip'
  return /svip/i.test(`${plan.id} ${plan.name}`) ? 'svip' : 'vip'
}

/** 个人板只有 VIP / SVIP。level 0 没有独立页签，跟在 VIP 后面展示；企业套餐只归企业页签。 */
export const personalPlansForTab = (
  plans: MembershipPlanCard[],
  tab: 'vip' | 'svip',
) => {
  const personal = personalPlans(plans)
  if (tab === 'svip') return plansByLevel(personal, MembershipLevel.Svip)
  return [
    ...plansByLevel(personal, MembershipLevel.Vip),
    ...plansByLevel(personal, MembershipLevel.None),
  ]
}
