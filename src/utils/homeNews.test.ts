import { describe, expect, it } from 'vitest'
import type { PolicyItem } from '@/mock/policyNews'
import { orderNewsForCity } from './homeNews'

const cities = ['郑州市', '洛阳市', '许昌市', '平顶山市']

const item = (
  partial: Pick<PolicyItem, 'id' | 'title'> & Partial<PolicyItem>,
): PolicyItem => ({
  status: 'normal',
  tags: [],
  description: '',
  date: '',
  endDate: '',
  department: '财政厅',
  daysRemaining: 1,
  region: '',
  industry: '',
  level: 'provincial',
  infoType: 'applying',
  content: '',
  attachments: [],
  originalUrl: '',
  ...partial,
})

describe('orderNewsForCity', () => {
  const items = [
    item({ id: 1, title: '河南省科学技术奖授奖建议项目公示' }),
    item({ id: 2, title: '许昌市工信局惠企政策' }),
    item({ id: 3, title: '关于公开遴选许昌市中小企业数字化服务商的通知' }),
    item({
      id: 4,
      title: '洛阳市先进制造业专项资金申报指南',
      region: '洛阳市',
    }),
  ]

  it('drops news that names another city and keeps province-wide news', () => {
    const result = orderNewsForCity(items, '郑州市', cities)
    expect(result.map((entry) => entry.id)).toEqual([1])
  })

  it('puts news that names the selected city ahead of province-wide news', () => {
    const result = orderNewsForCity(items, '许昌市', cities)
    expect(result.map((entry) => entry.id)).toEqual([2, 3, 1])
  })

  it('keeps an item when its region field matches the selected city', () => {
    const result = orderNewsForCity(items, '洛阳市', cities)
    expect(result.map((entry) => entry.id)).toEqual([4, 1])
  })

  it('puts the selected district ahead of the city and province-wide news', () => {
    const result = orderNewsForCity(
      [
        item({ id: 1, title: '河南省科学技术奖授奖建议项目公示' }),
        item({ id: 2, title: '郑州市数字化转型专项资金申报指南' }),
        item({ id: 3, title: '金水区科技计划项目申报通知' }),
        item({ id: 4, title: '许昌市工信局惠企政策' }),
      ],
      '郑州市',
      cities,
      '金水区',
    )
    expect(result.map((entry) => entry.id)).toEqual([3, 2, 1])
  })
})
