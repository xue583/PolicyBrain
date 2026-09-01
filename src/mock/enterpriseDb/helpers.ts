import type { EnterpriseHonorTag, EnterpriseItem } from './types'

const LEGAL_REPS = [
  '李某某',
  '王某某',
  '张某某',
  '刘某某',
  '陈某某',
  '赵某某',
  '孙某某',
  '周某某',
  '吴某某',
]

const HERO_SCOPE =
  '一般项目：技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；医学研究和试验发展；工程和技术研究和试验发展；自然科学研究和试验发展；细胞技术研发和应用；第一类医疗器械销售；第二类医疗器械销售；货物进出口；技术进出口。（除依法须经批准的项目外，凭营业执照依法自主开展经营活动）'

const shortNameOf = (name: string) => {
  const stripped = name
    .replace(/^(郑州|河南|北京|深圳|杭州|洛阳|新乡)/, '')
    .replace(/(股份有限公司|研究院有限公司|有限公司)$/, '')
  return stripped.slice(0, 2) || name.slice(0, 2)
}

const districtOf = (item: EnterpriseItem) => {
  if (item.id === 1) return '郑州航空港经济综合实验区'
  if (item.city === '郑州市') return '高新技术产业开发区'
  if (item.city === item.province) return item.city
  return `${item.city}市辖区`.replace('市市', '市')
}

const honorTagsOf = (item: EnterpriseItem): EnterpriseHonorTag[] => {
  if (item.id === 1) {
    return [
      { text: '国家级科技型中小企业', tone: 'blue' },
      { text: '高新技术企业', tone: 'orange' },
    ]
  }
  return item.tags.slice(0, 2).map((text, index) => ({
    text,
    tone: index % 2 ? 'orange' : 'blue',
  }))
}

const ipCountsOf = (item: EnterpriseItem) => {
  if (item.id === 1) {
    return { patent: 44, trademark: 60, software: 27, work: 3 }
  }
  return {
    patent: Math.min(8, Math.max(2, item.policyCount)),
    trademark: Math.min(6, Math.max(1, Math.floor(item.policyCount / 2) || 1)),
    software: Math.min(5, Math.max(1, Math.floor(item.policyCount / 3) || 1)),
    work: item.policyCount >= 6 ? 1 : 0,
  }
}

const padDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export {
  HERO_SCOPE,
  LEGAL_REPS,
  districtOf,
  honorTagsOf,
  ipCountsOf,
  padDate,
  shortNameOf,
}
