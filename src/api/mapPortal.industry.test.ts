import { describe, expect, it } from 'vitest'
import { mapEnterpriseDetail } from './mapPortal'

const escapedDetail =
  '{"categoryMiddle":"\\u4fe1\\u606f\\u6280\\u672f\\u54a8\\u8be2\\u670d\\u52a1","categoryBig":"\\u8f6f\\u4ef6\\u548c\\u4fe1\\u606f\\u6280\\u672f\\u670d\\u52a1\\u4e1a","category":"\\u4fe1\\u606f\\u4f20\\u8f93\\u3001\\u8f6f\\u4ef6\\u548c\\u4fe1\\u606f\\u6280\\u672f\\u670d\\u52a1\\u4e1a","categorySmall":""}'

describe('mapEnterpriseDetail companyIndustryDetail', () => {
  it('把 Unicode 转义的行业分类还原为门类到小类路径', () => {
    const detail = mapEnterpriseDetail({
      enterprise: { id: 1, name: '测试公司' },
      industry: {
        companyIndustry: '软件和信息技术服务业',
        companyIndustryDetail: escapedDetail,
      },
    })

    expect(detail.businessIndustry).toBe(
      '信息传输、软件和信息技术服务业 / 软件和信息技术服务业 / 信息技术咨询服务',
    )
    expect(detail.industryChains).toEqual([
      {
        id: 1,
        levels: [
          '信息传输、软件和信息技术服务业',
          '软件和信息技术服务业',
          '信息技术咨询服务',
        ],
      },
    ])
  })

  it('没有分类明细时回退到工商行业名称', () => {
    const detail = mapEnterpriseDetail({
      enterprise: { id: 2, name: '另一家公司' },
      industry: { companyIndustry: '研究和试验发展' },
    })

    expect(detail.businessIndustry).toBe('研究和试验发展')
    expect(detail.industryChains).toEqual([])
  })
})
