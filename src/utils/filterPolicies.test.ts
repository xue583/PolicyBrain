import { describe, expect, it } from 'vitest'
import {
  attachGradeRowSpan,
  filterEnterprises,
  filterEnterpriseQualifications,
  filterEnterpriseQualPersonnel,
  filterEnterpriseQualReviews,
  filterPolicyDb,
  filterPolicyDbPublicity,
  filterPolicyDbSupport,
  filterPolicyDbUpdates,
  filterPolicyNews,
} from './filterPolicies'
import type {
  EnterpriseItem,
  EnterpriseQualPersonnel,
  EnterpriseQualReview,
  EnterpriseQualification,
} from '@/mock/enterpriseDb'
import type {
  PolicyDbItem,
  PolicyDbPublicity,
  PolicyDbSupportMeasure,
  PolicyDbUpdate,
} from '@/mock/policyDb'
import type { PolicyItem } from '@/mock/policyNews'

const item = (overrides: Partial<PolicyItem>): PolicyItem => ({
  id: 1,
  title: '郑州市人工智能政策',
  status: 'normal',
  tags: [],
  description: '支持人工智能产业发展',
  date: '2026-08-01',
  endDate: '2026-09-01',
  department: '科技局',
  daysRemaining: 10,
  region: '河南省',
  industry: '信息技术',
  level: 'municipal',
  infoType: 'new',
  content: '',
  attachments: [],
  originalUrl: '',
  ...overrides,
})

describe('filterPolicyNews', () => {
  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      title: '北京市制造业政策',
      description: '支持先进制造业发展',
      region: '北京市',
      industry: '制造业',
      level: 'provincial',
      infoType: 'applying',
      status: 'expired',
    }),
  ]

  it('filters by keyword without splitting by status', () => {
    const result = filterPolicyNews(list, {
      keyword: '人工智能',
      region: '',
      industries: [],
      levels: [],
      infoTypes: [],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('returns both normal and expired items when status is omitted', () => {
    const result = filterPolicyNews(list, {
      keyword: '',
      region: '',
      industries: [],
      levels: [],
      infoTypes: [],
    })
    expect(result.map((i) => i.id)).toEqual([1, 2])
  })

  it('applies region, industry, level and info type', () => {
    const result = filterPolicyNews(list, {
      keyword: '',
      region: '北京市',
      industries: ['制造业'],
      levels: ['provincial'],
      infoTypes: ['applying'],
    })
    expect(result.map((i) => i.id)).toEqual([2])
  })
})

describe('filterPolicyDb', () => {
  const item = (overrides: Partial<PolicyDbItem>): PolicyDbItem => ({
    id: 1,
    name: '郑州市科技型企业',
    support: '一次性奖励',
    city: '郑州市',
    department: '科学技术局',
    views: 100,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科技企业',
    infoType: 'applying',
    ...overrides,
  })

  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      name: '国家创新基金',
      department: '工业和信息化局',
      level: 'national',
      grade: '国家级',
      industryTag: '制造业',
      infoType: 'new',
    }),
  ]

  it('filters by keyword, grade, department and industry tag', () => {
    const result = filterPolicyDb(list, {
      keyword: '科技',
      grade: '郑州市',
      department: '科学技术局',
      industryTag: '科技企业',
      infoTypes: [],
      levels: [],
    })
    expect(result.map((i) => i.id)).toEqual([1])
  })

  it('applies info type and policy level together', () => {
    const result = filterPolicyDb(list, {
      keyword: '',
      grade: '',
      department: '',
      industryTag: '',
      infoTypes: ['new'],
      levels: ['national'],
    })
    expect(result.map((i) => i.id)).toEqual([2])
  })
})

describe('filterPolicyDbUpdates', () => {
  const item = (overrides: Partial<PolicyDbUpdate>): PolicyDbUpdate => ({
    id: 1,
    title: '关于组织申报郑州市工程研究中心的通知',
    grade: '郑州市',
    department: '科学技术局',
    date: '2026-07-28',
    endDate: '2026-08-30',
    year: 2026,
    daysRemaining: 10,
    expired: false,
    phone: '0371-67180000',
    newsId: 1,
    ...overrides,
  })

  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      title: '中央引导地方科技发展专项（河南省补贴）',
      grade: '河南省',
      department: '科学技术厅',
      year: 2025,
      expired: true,
      daysRemaining: 0,
    }),
  ]

  const emptyFilters = {
    grade: '',
    years: [] as number[],
    statuses: [] as ('active' | 'expired')[],
    keyword: '',
  }

  it('filters by grade, year, status and title keyword together', () => {
    const result = filterPolicyDbUpdates(list, {
      grade: '河南省',
      years: [2025],
      statuses: ['expired'],
      keyword: '中央引导',
    })
    expect(result.map((i) => i.id)).toEqual([2])
  })

  it('returns all items when filters are empty', () => {
    expect(filterPolicyDbUpdates(list, emptyFilters).map((i) => i.id)).toEqual([
      1, 2,
    ])
  })

  it('keeps unexpired items when only active status is selected', () => {
    const result = filterPolicyDbUpdates(list, {
      ...emptyFilters,
      statuses: ['active'],
    })
    expect(result.map((i) => i.id)).toEqual([1])
  })
})

describe('filterPolicyDbPublicity', () => {
  const item = (overrides: Partial<PolicyDbPublicity>): PolicyDbPublicity => ({
    id: 1,
    name: '河南中科千里细胞基因工程有限公司',
    district: '航空港区',
    region: '河南省 郑州市 郑州航空港经济综合实验区',
    industry: '研发平台',
    amount: 20,
    year: 2026,
    category: 'approved',
    obtainedPolicy: '工程研究中心',
    ...overrides,
  })

  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      name: '郑州高新材料研究院有限公司',
      district: '金水区',
      region: '河南省 郑州市 金水区',
      year: 2025,
      category: 'subsidy',
      obtainedPolicy: '高新技术企业（拟认定）',
      amount: null,
    }),
  ]

  const emptyFilters = {
    category: '',
    district: '',
    years: [] as number[],
    obtainedPolicy: '',
    keyword: '',
  }

  it('filters by category, district, year, obtained policy and name', () => {
    const result = filterPolicyDbPublicity(list, {
      category: 'subsidy',
      district: '金水区',
      years: [2025],
      obtainedPolicy: '高新技术企业（拟认定）',
      keyword: '高新材料',
    })
    expect(result.map((i) => i.id)).toEqual([2])
  })

  it('treats 郑州市 as city-level and does not narrow districts', () => {
    const result = filterPolicyDbPublicity(list, {
      ...emptyFilters,
      district: '郑州市',
    })
    expect(result.map((i) => i.id)).toEqual([1, 2])
  })
})

describe('filterPolicyDbSupport', () => {
  const item = (
    overrides: Partial<PolicyDbSupportMeasure>,
  ): PolicyDbSupportMeasure => ({
    id: 1,
    grade: '河南省',
    condition: '先进制造业企业',
    amount: '减按15%的税率征收企业所得税',
    document: '《支持中小企业发展若干财税政策》',
    documentUrl: 'https://www.henan.gov.cn/',
    ...overrides,
  })

  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      grade: '郑州市',
      condition: '新认定工程研究中心',
      amount: '最高200万元建设补助',
    }),
    item({
      id: 3,
      grade: '河南省',
      condition: '科技型中小企业',
      amount: '给予一次性10万元',
    }),
  ]

  it('returns all items when grade is empty', () => {
    expect(filterPolicyDbSupport(list, '').map((i) => i.id)).toEqual([1, 2, 3])
  })

  it('keeps items of the selected grade', () => {
    expect(filterPolicyDbSupport(list, '河南省').map((i) => i.id)).toEqual([
      1, 3,
    ])
  })
})

describe('attachGradeRowSpan', () => {
  it('merges consecutive rows of the same grade', () => {
    const rows = attachGradeRowSpan([
      {
        id: 1,
        grade: '河南省',
        condition: 'a',
        amount: '1',
        document: 'd',
        documentUrl: '#',
      },
      {
        id: 2,
        grade: '河南省',
        condition: 'b',
        amount: '2',
        document: 'd',
        documentUrl: '#',
      },
      {
        id: 3,
        grade: '郑州市',
        condition: 'c',
        amount: '3',
        document: 'd',
        documentUrl: '#',
      },
    ])
    expect(rows.map((row) => row.gradeSpan)).toEqual([2, 0, 1])
  })
})

describe('filterEnterprises', () => {
  const item = (overrides: Partial<EnterpriseItem>): EnterpriseItem => ({
    id: 1,
    name: '郑州源创基因科技有限公司',
    status: 'active',
    province: '河南省',
    city: '郑州市',
    policyCount: 70,
    tags: ['软件开发与信息技术服务'],
    address: '郑州航空港经济综合实验区华夏大道',
    businessIndustry: '研究和试验发展',
    industry: '信息传输、软件和信息技术服务业',
    ...overrides,
  })

  const list = [
    item({ id: 1 }),
    item({
      id: 2,
      name: '北京智算科技有限公司',
      province: '北京市',
      city: '北京市',
      address: '北京市海淀区中关村东路1号',
      industry: '制造业',
    }),
  ]

  const emptyFilters = {
    keyword: '',
    province: '',
    industries: [] as string[],
  }

  it('filters by name keyword, province and industry together', () => {
    const result = filterEnterprises(list, {
      keyword: '智算',
      province: '北京市',
      industries: ['制造业'],
    })
    expect(result.map((row) => row.id)).toEqual([2])
  })

  it('matches address when name does not contain the keyword', () => {
    const result = filterEnterprises(list, {
      ...emptyFilters,
      keyword: '航空港',
    })
    expect(result.map((row) => row.id)).toEqual([1])
  })

  it('returns all items when filters are empty', () => {
    expect(filterEnterprises(list, emptyFilters).map((row) => row.id)).toEqual([
      1, 2,
    ])
  })
})

describe('filterEnterpriseQualifications', () => {
  const cert = (
    overrides: Partial<EnterpriseQualification>,
  ): EnterpriseQualification => ({
    id: 1,
    category: '管理体系认证/质量管理体系认证 (ISO9001)',
    name: '证书名称文案',
    certNo: '05324Q32813R0S',
    issueDate: '2024-10-15',
    validUntil: '2024-10-15',
    year: 2024,
    ...overrides,
  })

  const list = [
    cert({ id: 1 }),
    cert({
      id: 2,
      category: '食药资质/国产医疗器械产品（备案）',
      certNo: '豫港械备20240546',
      year: 2023,
    }),
  ]

  it('filters by year and keyword across category and cert number', () => {
    const result = filterEnterpriseQualifications(list, {
      year: 2024,
      keyword: 'ISO9001',
    })
    expect(result.map((row) => row.id)).toEqual([1])
  })

  it('returns all items when year and keyword are empty', () => {
    expect(
      filterEnterpriseQualifications(list, { year: null, keyword: '  ' }).map(
        (row) => row.id,
      ),
    ).toEqual([1, 2])
  })
})

describe('filterEnterpriseQualPersonnel', () => {
  const person = (
    overrides: Partial<EnterpriseQualPersonnel>,
  ): EnterpriseQualPersonnel => ({
    id: 1,
    name: '张三丰',
    certNo: '豫港械备20240546',
    issueDate: '2024-10-15',
    expireDate: '2024-10-15',
    status: '证书有效',
    issuer: '郑州市科学文化局',
    year: 2024,
    ...overrides,
  })

  const list = [person({ id: 1 }), person({ id: 2, name: '赵燕', year: 2025 })]

  it('filters personnel by name keyword', () => {
    const result = filterEnterpriseQualPersonnel(list, {
      year: null,
      keyword: '赵燕',
    })
    expect(result.map((row) => row.id)).toEqual([2])
  })
})

describe('filterEnterpriseQualReviews', () => {
  const review = (
    overrides: Partial<EnterpriseQualReview>,
  ): EnterpriseQualReview => ({
    id: 1,
    matter: '质量管理体系认证申请',
    decision: '准予许可',
    reason: '申请材料齐全，符合法定条件',
    announceDate: '2024-10-15',
    year: 2024,
    ...overrides,
  })

  it('returns empty when year does not match', () => {
    const result = filterEnterpriseQualReviews([review({ id: 1 })], {
      year: 2026,
      keyword: '',
    })
    expect(result).toEqual([])
  })
})
