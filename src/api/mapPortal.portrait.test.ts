import { describe, expect, it } from 'vitest'
import { mapEnterprisePortrait } from './mapPortal'

const now = new Date('2026-10-29T00:00:00')

describe('mapEnterprisePortrait', () => {
  it('从企业详情画像接口映射已有字段，缺失项为未知', () => {
    const portrait = mapEnterprisePortrait(
      {
        enterprise: {
          provinceName: '河南省',
          cityName: '郑州市',
          districtName: '郑州航空港经济综合实验区',
          softrightNum: 27,
          brandNum: 60,
          patentNum: 44,
        },
        industry: {
          socialSecurityNum: 42,
          establishTime: '2016-10-24',
          companyIndustry: '科技推广和应用服务业',
          companyIndustryDetail:
            '{"category":"科学研究和技术服务业","categoryBig":"科技推广和应用服务业"}',
        },
        industryExt: {
          annualTurnover: '5001万元以上',
        },
      },
      now,
    )

    expect(portrait.staffCount).toBe('42人')
    expect(portrait.location).toBe('河南省-郑州市-郑州航空港经济综合实验区')
    expect(portrait.industry).toBe('科学研究和技术服务业')
    expect(portrait.yearsEstablished).toBe('10年')
    expect(portrait.revenue).toBe('5001万元以上')
    expect(portrait.softwareCopyrights).toBe('27项')
    expect(portrait.trademarks).toBe('60项')
    expect(portrait.inventionPatents).toBe('未知')
    expect(portrait.utilityPatents).toBe('未知')
    expect(portrait.siteArea).toBe('未知')
    expect(portrait.assetLiabilityRatio).toBe('未知')
    expect(portrait.rdRatio).toBe('未知')
    expect(portrait.rdEquipmentValue).toBe('未知')
    expect(portrait.standards).toBe('未知')
    expect(portrait.systemLicenses).toBe('未知')
    expect(portrait.infoSoftware).toBe('未知')
  })

  it('人数和成立时间为空时显示未知，数量为 0 仍展示', () => {
    const portrait = mapEnterprisePortrait(
      {
        enterprise: { softrightNum: 0, brandNum: 0 },
        industry: {
          staffNumber: '0',
          socialSecurityNum: 0,
          establishTime: null,
        },
      },
      now,
    )

    expect(portrait.staffCount).toBe('未知')
    expect(portrait.yearsEstablished).toBe('未知')
    expect(portrait.location).toBe('未知')
    expect(portrait.softwareCopyrights).toBe('0项')
    expect(portrait.trademarks).toBe('0项')
  })

  it('画像扩展字段优先于工商缓存', () => {
    const portrait = mapEnterprisePortrait(
      {
        enterprise: { brandNum: 1, softrightNum: 2 },
        portrait: {
          siteArea: '301平方米以上',
          assetLiabilityRatio: '50%以下',
          rdRatio: '4.1%以上',
          inventionPatentNum: 3,
          utilityModelNum: 5,
          rdEquipmentValue: '501-550万元',
          standardConstruction: '未知',
          systemLicense: 'ISO9001',
          informationSoftware: '用友',
          location: '河南省-郑州市',
        },
      },
      now,
    )

    expect(portrait.siteArea).toBe('301平方米以上')
    expect(portrait.assetLiabilityRatio).toBe('50%以下')
    expect(portrait.rdRatio).toBe('4.1%以上')
    expect(portrait.inventionPatents).toBe('3项')
    expect(portrait.utilityPatents).toBe('5项')
    expect(portrait.rdEquipmentValue).toBe('501-550万元')
    expect(portrait.standards).toBe('未知')
    expect(portrait.systemLicenses).toBe('ISO9001')
    expect(portrait.infoSoftware).toBe('用友')
    expect(portrait.location).toBe('河南省-郑州市')
  })
})
