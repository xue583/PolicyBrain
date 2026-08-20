import { describe, expect, it } from 'vitest'
import { filterPolicyNews } from './filterPolicies'
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
      region: '北京市',
      industry: '制造业',
      level: 'provincial',
      infoType: 'applying',
      status: 'expired',
    }),
  ]

  it('filters by tab status and keyword', () => {
    const result = filterPolicyNews(list, {
      status: 'normal',
      keyword: '人工智能',
      region: '',
      industries: [],
      levels: [],
      infoTypes: [],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('applies region, industry, level and info type', () => {
    const result = filterPolicyNews(list, {
      status: 'expired',
      keyword: '',
      region: '北京市',
      industries: ['制造业'],
      levels: ['provincial'],
      infoTypes: ['applying'],
    })
    expect(result.map((i) => i.id)).toEqual([2])
  })
})
