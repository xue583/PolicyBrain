import { describe, expect, it } from 'vitest'
import {
  mapCertPerson,
  mapCertReview,
  mapContact,
  mapEnterpriseDetail,
  mapShareholder,
} from './mapPortal'

describe('mapEnterpriseDetail 工商字段', () => {
  it('顶层空值不覆盖行业里的注册资本和企业类型', () => {
    const detail = mapEnterpriseDetail({
      enterprise: {
        id: '1987654321012345678',
        name: '测试事业单位',
        registeredCapital: null,
        companyType: null,
        companyIndustry: null,
      },
      industry: {
        registeredCapital: '138456.65万元人民币',
        companyType: '事业单位',
        companyIndustry: '教育',
        establishTime: null,
        staffNumber: '0',
        addressLastChangeDate: '1970-01-01',
      },
    })

    expect(detail.id).toBe('1987654321012345678')
    expect(detail.registeredCapital).toBe('138456.65万元人民币')
    expect(detail.enterpriseType).toBe('事业单位')
    expect(detail.industry).toBe('教育')
    expect(detail.foundedDate).toBe('-')
    expect(detail.staffScale).toBe('0')
    expect(detail.phone).toBe('-')
    expect(detail.businessInfo.addressChangeDate).toBe('-')
  })

  it('联系人为空时没有电话可展示，有联系人时用联系方式', () => {
    const empty = mapEnterpriseDetail(
      { enterprise: { id: 2, name: '空联系人' } },
      { contacts: [] },
    )
    expect(empty.phone).toBe('-')

    const filled = mapEnterpriseDetail(
      { enterprise: { id: 3, name: '有联系人', phone: null } },
      {
        contacts: [
          mapContact(
            {
              contactPerson: '李四',
              contactPosition: '办公室',
              contactDetail: '13800000000',
              contactType: 1,
            },
            0,
          ),
        ],
      },
    )
    expect(filled.phone).toBe('13800000000')
    expect(filled.contacts[0]?.name).toBe('李四')
    expect(filled.contacts[0]?.title).toBe('办公室')
  })

  it('纯数字注册资本补万元', () => {
    const detail = mapEnterpriseDetail({
      industry: { registeredCapital: '10.00' },
      enterprise: { id: 4, name: '数字资本', registeredCapital: null },
    })
    expect(detail.registeredCapital).toBe('10.00万元')
  })
})

describe('企业子资源映射', () => {
  it('映射股东、资质人员和资质审查', () => {
    expect(
      mapShareholder(
        {
          id: 9,
          name: '王五',
          shareholderType: '自然人',
          shareholdingRatio: 12.5,
          subscribedCapital: '100万元',
          paidInCapital: '50万元',
          shouldProportion: '12.5%',
        },
        0,
      ),
    ).toMatchObject({
      name: '王五',
      shareholderType: '自然人',
      shareholdingRatio: '12.5%',
      subscribedCapital: '100万元',
      paidInCapital: '50万元',
      shouldProportion: '12.5%',
    })

    expect(
      mapCertPerson(
        {
          id: 3,
          personName: '赵六',
          personType: '注册建造师',
          certNo: 'A001',
        },
        0,
      ),
    ).toMatchObject({
      name: '赵六',
      personType: '注册建造师',
      certNo: 'A001',
      issueDate: '-',
      year: 0,
    })

    expect(
      mapCertReview(
        {
          id: 4,
          content: '施工资质审查',
          result: '合格',
          reviewTime: '2024-06-01T00:00:00',
        },
        0,
      ),
    ).toMatchObject({
      matter: '施工资质审查',
      decision: '合格',
      reason: '-',
      announceDate: '2024-06-01',
      year: 2024,
    })
  })
})
