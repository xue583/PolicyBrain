import { describe, expect, it } from 'vitest'
import { enterpriseBenefitIcon, personalBenefitIcon } from './benefitIcons'

describe('benefit icons', () => {
  it('picks the same personal icon from either board copy', () => {
    expect(personalBenefitIcon('vip', '数据导出', 0)).toBe(
      personalBenefitIcon('svip', '批量导出次数', 3),
    )
    expect(personalBenefitIcon('vip', '政策匹配', 1)).toBe(
      personalBenefitIcon('svip', '智能匹配', 0),
    )
  })

  it('uses the svip artwork for enterprise benefits on the svip tab', () => {
    expect(enterpriseBenefitIcon('svip', '智能申报', 0)).not.toBe(
      enterpriseBenefitIcon('vip', '智能申报', 0),
    )
    expect(enterpriseBenefitIcon('org', '更优惠', 0)).toBe(
      enterpriseBenefitIcon('vip', '更优惠', 2),
    )
  })
})
