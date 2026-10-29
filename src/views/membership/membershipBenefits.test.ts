import { describe, expect, it } from 'vitest'
import { MembershipLevel } from '@/api/membership'
import {
  asMembershipBenefits,
  benefitsForEnterpriseTab,
  benefitsForLevel,
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

  it('keeps benefits that share a code across levels', () => {
    const cards = toBenefitCards([
      {
        code: 'export',
        name: '数据导出',
        level: MembershipLevel.Vip,
        sort: 10,
      },
      {
        code: 'export',
        name: '数据导出',
        level: MembershipLevel.Svip,
        sort: 10,
      },
      {
        code: 'ent_search',
        name: '企业检索',
        level: MembershipLevel.Svip,
        sort: 40,
      },
    ])

    expect(cards.map((item) => item.level)).toEqual([1, 2, 2])
    expect(benefitsForLevel(cards, MembershipLevel.Svip)).toHaveLength(2)
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

  it('always shows the six design benefits, filling gaps from the api', () => {
    const cards = toBenefitCards([
      { code: 'free', name: '基础浏览', level: MembershipLevel.None, sort: 1 },
      {
        code: 'export',
        name: '数据导出',
        level: MembershipLevel.Vip,
        sort: 10,
      },
      {
        code: 'cultivate',
        name: '培育企业',
        level: MembershipLevel.Vip,
        sort: 5,
      },
      {
        code: 'recommend',
        name: '个性化政策推荐',
        level: MembershipLevel.Vip,
        sort: 6,
      },
      { code: 'batch', name: '批量查询', level: MembershipLevel.Vip, sort: 11 },
      {
        code: 'apply',
        name: '智能申报',
        level: MembershipLevel.Vip,
        sort: 12,
        description: '1次/年（可单独购买）',
      },
      {
        code: 'match',
        name: '匹配政策（企业找政策）',
        level: MembershipLevel.Vip,
        sort: 18,
      },
      { code: 'ai', name: 'AI材料', level: MembershipLevel.Svip, sort: 3 },
      {
        code: 'cultivate',
        name: '培育企业',
        level: MembershipLevel.Svip,
        sort: 5,
      },
      {
        code: 'recommend',
        name: '个性化政策推荐',
        level: MembershipLevel.Svip,
        sort: 6,
      },
      {
        code: 'advanced',
        name: '高级搜索',
        level: MembershipLevel.Svip,
        sort: 9,
        description: 'SVIP 专属',
      },
      {
        code: 'batch',
        name: '批量查询',
        level: MembershipLevel.Svip,
        sort: 11,
      },
      {
        code: 'apply',
        name: '智能申报',
        level: MembershipLevel.Svip,
        sort: 12,
        description: '1次/年（可单独购买）',
      },
      {
        code: 'match',
        name: '匹配政策（企业找政策）',
        level: MembershipLevel.Svip,
        sort: 18,
      },
    ])

    const showcase = [
      '高级搜索',
      '智能申报',
      '批量查询',
      '匹配政策（企业找政策）',
      '培育企业',
      '个性化政策推荐',
    ]
    expect(
      benefitsForPersonalTab(cards, 'vip').map((item) => item.name),
    ).toEqual(showcase)
    expect(
      benefitsForEnterpriseTab(cards, 'vip').map((item) => item.name),
    ).toEqual(showcase)
    // 高级搜索只有 level 2 有数据，但仍要在 SVIP 页签占位
    expect(
      benefitsForPersonalTab(cards, 'svip').map((item) => item.name),
    ).toEqual(showcase)
    expect(
      benefitsForEnterpriseTab(cards, 'svip').map((item) => item.name),
    ).toEqual(showcase)
    expect(
      benefitsForPersonalTab(cards, 'svip').find(
        (item) => item.name === '高级搜索',
      )?.description,
    ).toBe('SVIP 专属')
    expect(
      benefitsForPersonalTab(cards, 'vip').find(
        (item) => item.name === '高级搜索',
      )?.description,
    ).toBe('')
  })
})
