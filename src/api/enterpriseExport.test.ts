import { describe, expect, it } from 'vitest'
import {
  buildExportJobRequest,
  mapBatchQueryPage,
  mapEnterpriseExportJob,
  mapExportDownloadUrl,
  mapExportEnterprise,
  toAdvancedQuery,
  toPolicyQuery,
  type ExportFilterInput,
} from './enterpriseExport'

const filters = (
  patch: Partial<ExportFilterInput> = {},
): ExportFilterInput => ({
  keyword: '',
  policies: [],
  year: null,
  industry: '',
  ip: '',
  capital: '',
  age: '',
  economy: '',
  ...patch,
})

describe('mapExportEnterprise', () => {
  it('读取高级筛选行，地址缺失时用省市区拼接', () => {
    expect(
      mapExportEnterprise({
        id: 12,
        name: '河南示例科技有限公司',
        provinceName: '河南省',
        cityName: '郑州市',
        companyIndustry: '软件和信息技术服务业',
        policySupportCount: 3,
      }),
    ).toEqual({
      id: 12,
      name: '河南示例科技有限公司',
      address: '河南省郑州市',
      industry: '软件和信息技术服务业',
      policyCount: 3,
    })
  })

  it('读取批量查询行的 index 与 policyCount', () => {
    expect(
      mapExportEnterprise({
        index: 4,
        name: '示例企业',
        address: '工业园区',
        industry: '金属制品业',
        policyCount: 8,
      }),
    ).toMatchObject({ id: 4, policyCount: 8, industry: '金属制品业' })
  })
})

describe('mapBatchQueryPage', () => {
  it('保留查询令牌和未匹配名称', () => {
    const page = mapBatchQueryPage({
      token: 'abc',
      items: [{ index: 1, name: '甲公司', policyCount: 1 }],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 1,
      unmatchedNames: ['不存在的公司'],
    })
    expect(page.token).toBe('abc')
    expect(page.totalElements).toBe(1)
    expect(page.items[0]?.name).toBe('甲公司')
    expect(page.unmatchedNames).toEqual(['不存在的公司'])
  })
})

describe('mapEnterpriseExportJob', () => {
  it('读取任务状态和下载链接', () => {
    expect(
      mapEnterpriseExportJob({
        jobId: 'job-1',
        queryType: 1,
        status: 2,
        statusText: '已完成',
        progress: 100,
        totalCount: 3,
        exportedCount: 3,
        fileName: '企业高级筛选.csv',
        downloadUrl: 'https://files.example/a.csv',
      }),
    ).toMatchObject({
      jobId: 'job-1',
      status: 2,
      downloadUrl: 'https://files.example/a.csv',
      progress: 100,
    })
  })
})

describe('mapExportDownloadUrl', () => {
  it('批量导出读 url，任务导出读 downloadUrl', () => {
    expect(mapExportDownloadUrl({ url: 'https://files.example/b.xlsx' })).toBe(
      'https://files.example/b.xlsx',
    )
    expect(
      mapExportDownloadUrl({ downloadUrl: 'https://files.example/c.csv' }),
    ).toBe('https://files.example/c.csv')
  })
})

describe('toAdvancedQuery', () => {
  it('把注册资本、成立年限和知产下限转成接口字段', () => {
    expect(
      toAdvancedQuery(
        filters({
          keyword: ' 科技 ',
          provinceId: 41,
          industry: '软件和信息技术服务业',
          ip: '软件著作权',
          capital: '1000万-5000万',
          age: '5-10年',
          economy: '有限责任公司',
        }),
      ),
    ).toEqual({
      keyword: '科技',
      provinceId: 41,
      industries: '软件和信息技术服务业',
      companyTypes: '有限责任公司',
      softrightNumMin: 1,
      moneyStartWan: 1000,
      moneyEndWan: 5000,
      yearStart: 5,
      yearEnd: 10,
    })
  })

  it('发明专利、实用新型和外观设计都按专利数量下限', () => {
    expect(toAdvancedQuery(filters({ ip: '实用新型' }))).toEqual({
      patentNumMin: 1,
    })
  })

  it('无知识产权没有对应筛选字段', () => {
    expect(toAdvancedQuery(filters({ ip: '无知识产权' }))).toEqual({})
  })
})

describe('toPolicyQuery', () => {
  it('关键词优先作为政策名称，并带上认定年度', () => {
    expect(
      toPolicyQuery(
        filters({
          keyword: '高新',
          policies: ['高新技术企业'],
          year: 2024,
        }),
      ),
    ).toEqual({
      policyName: '高新',
      yearStart: 2024,
      yearEnd: 2024,
    })
  })

  it('没有政策名称时不能查询', () => {
    expect(toPolicyQuery(filters({ year: 2026 }))).toBeNull()
  })
})

describe('buildExportJobRequest', () => {
  it('基本筛选和按政策分别使用 queryType 1 和 2', () => {
    expect(
      buildExportJobRequest('basic', filters({ keyword: '科技' })),
    ).toEqual({
      queryType: 1,
      advanced: { keyword: '科技' },
    })
    expect(
      buildExportJobRequest('policy', filters({ policies: ['高新技术企业'] })),
    ).toEqual({
      queryType: 2,
      policy: { policyName: '高新技术企业' },
    })
    expect(buildExportJobRequest('policy', filters())).toBeNull()
  })
})
