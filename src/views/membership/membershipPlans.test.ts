import { describe, expect, it } from 'vitest'
import { MembershipLevel } from '@/api/membership'
import {
  asMembershipPlans,
  personalPlansForTab,
  plansByLevel,
  plansForIdentity,
  toPlanCards,
} from './membershipPlans'

const plan = (overrides: Record<string, unknown> = {}) => ({
  code: 'vip_year',
  name: '年度会员',
  level: MembershipLevel.Vip,
  durationType: 3,
  durationDays: 365,
  price: 70800,
  originalPrice: 0,
  sort: 2,
  description: '超值特惠',
  applicableIdentity: 1,
  purchaseLimit: 0,
  currentPrice: 36800,
  ...overrides,
})

describe('membership plan mapping', () => {
  it('reads swagger fields and converts fen into yuan', () => {
    const [card] = toPlanCards([
      plan({
        description: '适合刚接手第一批客户，先把服务流程跑通',
        purchaseLimit: 1,
        originalPrice: 0,
        price: 99800,
        currentPrice: 99800,
        durationDays: 365,
      }),
    ])

    expect(card).toMatchObject({
      id: 'vip_year',
      level: 1,
      name: '年度会员',
      price: 998,
      original: undefined,
      daily: '2.73',
      tag: '仅可买一次',
      desc: '适合刚接手第一批客户，先把服务流程跑通',
      periodLabel: '1年',
      featured: true,
      durationDays: 365,
    })
  })

  it('uses currentPrice and shows the strike price when it is higher', () => {
    const [card] = toPlanCards([plan()])
    expect(card?.price).toBe(368)
    expect(card?.original).toBe(708)
    expect(card?.saved).toBe('340')
    expect(card?.tag).toBe('超值特惠')
    expect(card?.daily).toBe('1.01')
  })

  it('sorts by sort, dedupes code, and features the first plan of each level', () => {
    const cards = toPlanCards([
      plan({
        code: 'vip_month',
        name: '月度',
        sort: 3,
        currentPrice: 4900,
        price: 4900,
        durationDays: 30,
      }),
      plan({ code: 'vip_year', sort: 1 }),
      plan({ code: 'vip_year', name: '重复', sort: 0 }),
      plan({
        code: 'svip_year',
        name: '一年SVIP',
        level: MembershipLevel.Svip,
        sort: 1,
        currentPrice: 189800,
        price: 189800,
        durationDays: 365,
      }),
    ])

    expect(cards.map((item) => item.id)).toEqual([
      'vip_year',
      'svip_year',
      'vip_month',
    ])
    expect(
      cards.filter((item) => item.featured).map((item) => item.id),
    ).toEqual(['vip_year', 'svip_year'])
    expect(cards.find((item) => item.id === 'vip_month')?.periodLabel).toBe(
      '1个月',
    )
  })

  it('accepts a raw array or an items envelope', () => {
    expect(asMembershipPlans([plan()]).length).toBe(1)
    expect(asMembershipPlans({ items: [plan(), null] }).length).toBe(1)
    expect(asMembershipPlans(null)).toEqual([])
  })

  it('keeps plans for the current identity and still shows unmarked plans', () => {
    const cards = toPlanCards([
      plan({ code: 'a', applicableIdentity: 1 }),
      plan({ code: 'b', applicableIdentity: 2, level: 2 }),
      plan({ code: 'c', applicableIdentity: undefined }),
    ])

    expect(plansForIdentity(cards, 2).map((item) => item.id)).toEqual([
      'b',
      'c',
    ])
    expect(plansForIdentity(cards, null).map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('groups sellable levels onto the personal and enterprise tabs', () => {
    const cards = toPlanCards([
      plan({ code: 'free', level: MembershipLevel.None, name: '体验' }),
      plan({ code: 'vip', level: MembershipLevel.Vip }),
      plan({ code: 'svip', level: MembershipLevel.Svip }),
    ])

    expect(personalPlansForTab(cards, 'vip').map((item) => item.id)).toEqual([
      'vip',
      'free',
    ])
    expect(personalPlansForTab(cards, 'svip').map((item) => item.id)).toEqual([
      'svip',
    ])
    expect(
      plansByLevel(cards, MembershipLevel.None).map((item) => item.id),
    ).toEqual(['free'])
  })
})
