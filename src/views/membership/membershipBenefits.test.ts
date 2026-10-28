import { describe, expect, it } from 'vitest'
import { MembershipLevel } from '@/api/membership'
import {
  asMembershipBenefits,
  benefitsForEnterpriseTab,
  benefitsForPersonalTab,
  toBenefitCards,
} from './membershipBenefits'

describe('membership benefit mapping', () => {
  it('sorts, dedupes and drops a description that repeats the name', () => {
    const cards = toBenefitCards([
      {
        code: 'match',
        name: '政策匹配',
        level: MembershipLevel.Vip,
        description: '按企业画像匹配可申报政策',
        sort: 2,
      },
      {
        code: 'match',
        name: '重复项',
        level: MembershipLevel.Vip,
        description: '忽略',
        sort: 8,
      },
      {
        code: 'search',
        name: '高级搜索',
        level: MembershipLevel.Vip,
        description: '高级搜索',
        sort: 1,
      },
      {
        code: 'ai',
        name: 'AI材料',
        level: MembershipLevel.Svip,
        description: '辅助生成申报材料',
        sort: 3,
      },
    ])

    expect(cards.map((item) => item.id)).toEqual(['search', 'match', 'ai'])
    expect(cards[0]).toMatchObject({ name: '高级搜索', description: '' })
    expect(cards[1]?.description).toBe('按企业画像匹配可申报政策')
  })

  it('accepts an array or items envelope', () => {
    expect(asMembershipBenefits([{ name: '高级搜索', level: 1 }])).toHaveLength(
      1,
    )
    expect(
      asMembershipBenefits({ items: [{ name: '高级搜索' }, null] }),
    ).toHaveLength(1)
    expect(asMembershipBenefits(undefined)).toEqual([])
  })

  it('groups levels onto the personal and enterprise tabs', () => {
    const cards = toBenefitCards([
      { code: 'free', name: '基础浏览', level: MembershipLevel.None, sort: 1 },
      { code: 'vip', name: '政策匹配', level: MembershipLevel.Vip, sort: 1 },
      { code: 'svip', name: 'AI材料', level: MembershipLevel.Svip, sort: 1 },
    ])

    expect(benefitsForPersonalTab(cards, 'vip').map((item) => item.id)).toEqual(
      ['vip', 'free'],
    )
    expect(
      benefitsForPersonalTab(cards, 'svip').map((item) => item.id),
    ).toEqual(['svip'])
    expect(
      benefitsForEnterpriseTab(cards, 'org').map((item) => item.id),
    ).toEqual(['free'])
    expect(
      benefitsForEnterpriseTab(cards, 'vip').map((item) => item.id),
    ).toEqual(['vip'])
  })
})
