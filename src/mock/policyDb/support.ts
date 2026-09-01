import { policyGrades } from './filters'
import type { PolicyDbItem, PolicyDbSupportMeasure } from './types'

const henanSupportSeeds: Omit<PolicyDbSupportMeasure, 'id'>[] = [
  {
    grade: '河南省',
    condition: '先进制造业企业',
    amount: '减按15%的税率征收企业所得税',
    document: '《支持中小企业发展若干财税政策》(豫财企〔2024〕12号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition:
      '自2018年1月1日起，高新技术企业或科技型中小企业新购置的设备、器具',
    amount: '单位价值不超过500万元的，允许一次性计入当期成本费用在税前扣除',
    document: '《支持中小企业发展若干财税政策》(豫财企〔2024〕12号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '国家需要重点扶持的高新技术企业',
    amount: '减按15%的税率征收企业所得税',
    document: '《支持中小企业发展若干财税政策》(豫财企〔2024〕12号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '首次认定的科技型中小企业',
    amount: '给予一次性10万元',
    document: '《支持中小企业发展若干财税政策》(豫财企〔2024〕12号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '省级工程研究中心、重点实验室',
    amount: '发放每年20万元科研设备仪器使用券',
    document: '《河南省科技创新平台建设若干措施》(豫科〔2025〕8号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '专精特新中小企业',
    amount: '给予一次性30万元奖励',
    document: '《支持中小企业发展若干财税政策》(豫财企〔2024〕12号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '制造业高质量发展重点项目',
    amount: '按实际完成投资额的一定比例给予补助',
    document: '《河南省制造业高质量发展行动方案》(豫政〔2025〕6号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '在本省转化的重大科技成果',
    amount: '最高给予200万元后补助',
    document: '《河南省科技成果转化引导基金管理暂行办法》',
    documentUrl: 'https://www.henan.gov.cn/',
  },
  {
    grade: '河南省',
    condition: '新认定的省级创新平台',
    amount: '按建设投入给予最高100万元补助',
    document: '《河南省科技创新平台建设若干措施》(豫科〔2025〕8号)',
    documentUrl: 'https://www.henan.gov.cn/',
  },
]

const nationalSupportSeeds: Omit<PolicyDbSupportMeasure, 'id'>[] = [
  {
    grade: '国家级',
    condition: '国家需要重点扶持的高新技术企业',
    amount: '减按15%的税率征收企业所得税',
    document: '《中华人民共和国企业所得税法》',
    documentUrl: 'https://www.gov.cn/',
  },
  {
    grade: '国家级',
    condition: '企业开展研发活动中实际发生的研发费用',
    amount:
      '未形成无形资产计入当期损益的，再按照实际发生额的100%在税前加计扣除',
    document: '《关于进一步完善研发费用税前加计扣除政策的公告》',
    documentUrl: 'https://www.gov.cn/',
  },
  {
    grade: '国家级',
    condition: '科技型中小企业',
    amount: '研发费用加计扣除比例按现行政策执行',
    document: '《科技型中小企业评价办法》',
    documentUrl: 'https://www.gov.cn/',
  },
  {
    grade: '国家级',
    condition: '国家工程研究中心',
    amount: '通过中央预算内投资等方式给予支持',
    document: '《国家工程研究中心管理办法》',
    documentUrl: 'https://www.gov.cn/',
  },
]

const districtSupportSeeds: Omit<PolicyDbSupportMeasure, 'id'>[] = [
  {
    grade: '金水区',
    condition: '区内新认定科技创新平台',
    amount: '给予配套奖补，最高50万元',
    document: '《金水区支持科技创新若干政策》',
    documentUrl: 'https://www.zhengzhou.gov.cn/',
  },
  {
    grade: '郑东新区',
    condition: '区内高新技术企业、研发平台',
    amount: '发放创新券，用于检验检测和研发服务',
    document: '《郑东新区科技创新券实施办法》',
    documentUrl: 'https://www.zhengzhou.gov.cn/',
  },
  {
    grade: '高新技术开发区',
    condition: '区内企业年度研发投入增量部分',
    amount: '给予研发投入后补助',
    document: '《郑州高新区研发投入后补助办法》',
    documentUrl: 'https://www.zhengzhou.gov.cn/',
  },
]

const gradeOrder = (grade: string) => {
  const index = policyGrades.indexOf(grade)
  return index === -1 ? policyGrades.length : index
}

const buildSupportMeasures = (item: PolicyDbItem): PolicyDbSupportMeasure[] => {
  const citySeeds: Omit<PolicyDbSupportMeasure, 'id'>[] = [
    {
      grade: '郑州市',
      condition: `新认定的${item.name}`,
      amount: item.support || '以当年申报通知及主管部门解释为准',
      document: `《${item.name}管理办法》`,
      documentUrl: 'https://fgw.zhengzhou.gov.cn/',
    },
    {
      grade: '郑州市',
      condition: '首次通过高新技术企业认定的企业',
      amount: '给予一次性资金奖励',
      document: '《郑州市高新技术企业认定奖励办法》',
      documentUrl: 'https://www.zhengzhou.gov.cn/',
    },
    {
      grade: '郑州市',
      condition: '市级工程研究中心绩效评价合格',
      amount: '优先推荐申报省级平台并给予运行补助',
      document: `《${item.name}管理办法》`,
      documentUrl: 'https://fgw.zhengzhou.gov.cn/',
    },
    {
      grade: '郑州市',
      condition: '承担市级科技计划项目的企事业单位',
      amount: '按规定给予项目资助',
      document: '《郑州市科技计划项目管理办法》',
      documentUrl: 'https://www.zhengzhou.gov.cn/',
    },
  ]

  const seeds = [
    ...nationalSupportSeeds,
    ...henanSupportSeeds,
    ...citySeeds,
    ...districtSupportSeeds,
  ].sort((a, b) => gradeOrder(a.grade) - gradeOrder(b.grade))

  return seeds.map((seed, index) => ({
    ...seed,
    id: item.id * 100 + index + 1,
  }))
}

export { buildSupportMeasures }
