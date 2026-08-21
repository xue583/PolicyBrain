import { policyLevels, type PolicyInfoType } from './filters'

export type PolicyDbLevel = 'national' | 'provincial' | 'municipal' | 'district'
export type PolicyDbStatus = 'idle' | 'expired'
export const policyDbLevels = policyLevels

export const policyGrades = [
  '国家级',
  '河南省',
  '郑州市',
  '金水区',
  '郑东新区',
  '经济技术开发区',
  '高新技术开发区',
  '航空港区',
  '中牟县',
  '新郑市',
  '荥阳市',
  '新密市',
  '登封市',
  '中原区',
  '二七区',
  '管城回族区',
  '惠济区',
  '上街区',
]

export const policyDepartments = [
  '人民政府',
  '发展和改革委员会',
  '科学技术局',
  '工业和信息化局',
  '财政局',
  '人力资源和社会保障局',
  '自然资源和规划局',
  '生态环境局',
  '住房和城乡建设局',
  '交通运输局',
  '水利局',
  '农业农村局',
  '商务局',
  '文化广电和旅游局',
  '卫生健康委员会',
  '应急管理局',
  '市场监督管理局',
  '统计局',
  '体育局',
  '地方金融监督管理局',
  '数据局',
  '知识产权局',
]

export const policyIndustryTags = [
  '科技企业',
  '企业',
  '高等院校',
  '科研院所',
  '医疗卫生机构',
  '社会组织',
  '新型研发机构',
  '创新联合体',
  '众创空间',
  '孵化器',
  '加速器',
  '大学科技园',
  '高新区',
  '经开区',
  '产业集聚区',
  '专业园区',
  '特色小镇',
  '服务业',
  '制造业',
  '农业',
]

export interface PolicyDbItem {
  id: number
  name: string
  support: string
  city: string
  department: string
  views: number
  status: PolicyDbStatus
  level: PolicyDbLevel
  grade: string
  industryTag: string
  infoType: PolicyInfoType
}

export type PolicyDbUpdateStatus = 'active' | 'expired'

export interface PolicyDbTag {
  text: string
  color: string
}

export interface PolicyDbUpdate {
  id: number
  title: string
  grade: string
  department: string
  date: string
  endDate: string
  year: number
  daysRemaining: number
  expired: boolean
  phone: string
  newsId: number
}

export type PolicyDbPublicityCategory =
  'approved' | 'subsidy' | 'proposed' | 'evaluation' | 'acceptance' | 'revoked'

export interface PolicyDbPublicity {
  id: number
  name: string
  district: string
  region: string
  industry: string
  amount: number | null
  year: number
  category: PolicyDbPublicityCategory
  obtainedPolicy: string
}

export interface PolicyDbSupportMeasure {
  id: number
  grade: string
  condition: string
  amount: string
  document: string
  documentUrl: string
}

export interface PolicyDbApplyFile {
  name: string
  url: string
}

export interface PolicyDbApplyInfo {
  fields: string
  conditions: string[]
  regulationNote: string
  regulationClauses: string[]
  files: PolicyDbApplyFile[]
}

export interface PolicyDbDetail extends PolicyDbItem {
  date: string
  tags: PolicyDbTag[]
  applyInfo: PolicyDbApplyInfo
  supportMeasures: PolicyDbSupportMeasure[]
  updates: PolicyDbUpdate[]
  publicity: PolicyDbPublicity[]
}

export const policyDbYears = [2026, 2025, 2024, 2023, 2022]

export const policyDbUpdateStatuses: {
  label: string
  value: PolicyDbUpdateStatus
}[] = [
  { label: '未过期', value: 'active' },
  { label: '已过期', value: 'expired' },
]

export const publicityCategories: {
  label: string
  value: PolicyDbPublicityCategory
}[] = [
  { label: '获批公示', value: 'approved' },
  { label: '补贴公示', value: 'subsidy' },
  { label: '拟认定/拟入库/拟推荐', value: 'proposed' },
  { label: '考核评价公示', value: 'evaluation' },
  { label: '受理/备案/推荐公示', value: 'acceptance' },
  { label: '撤销公示', value: 'revoked' },
]

export const publicityAddresses = [
  '郑州市',
  '金水区',
  '郑东新区',
  '经济技术开发区',
  '高新技术开发区',
  '航空港区',
  '中牟县',
  '新郑市',
  '荥阳市',
  '新密市',
  '登封市',
  '中原区',
  '二七区',
  '管城回族区',
  '惠济区',
  '上街区',
]

export const publicityObtainedPolicies = [
  '高新技术企业（拟认定）',
  '科技型中小企业',
  '专精特新中小企业',
  '工程研究中心',
  '重点实验室',
  '制造业单项冠军',
  '创新型中小企业',
  '瞪羚企业',
]

export const mockPolicyDb: PolicyDbItem[] = [
  {
    id: 1,
    name: '郑州市工程研究中心',
    support: '对认定的工程研究中心给予最高200万元建设补助。',
    city: '郑州市',
    department: '科学技术局',
    views: 300,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '企业',
    infoType: 'new',
  },
  {
    id: 2,
    name: '郑州市科技型企业',
    support: '对新认定科技型企业给予一次性奖励，并配套研发费用后补助。',
    city: '郑州市',
    department: '科学技术局',
    views: 196,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 3,
    name: '郑州市重点实验室',
    support: '',
    city: '郑州市',
    department: '科学技术局',
    views: 29,
    status: 'expired',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科研院所',
    infoType: 'publicizing',
  },
  {
    id: 4,
    name: '郑州市创新创业团队',
    support: '',
    city: '郑州市',
    department: '科学技术局',
    views: 0,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '企业',
    infoType: 'new',
  },
  {
    id: 5,
    name: '郑州市制造业高质量发展专项',
    support: '支持智能工厂、工业互联网平台及关键环节数字化改造。',
    city: '郑州市',
    department: '工业和信息化局',
    views: 248,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '制造业',
    infoType: 'applying',
  },
  {
    id: 6,
    name: '郑州市高新技术企业认定奖励',
    support: '对新认定高新技术企业给予一次性资金奖励。',
    city: '郑州市',
    department: '科学技术局',
    views: 412,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 7,
    name: '郑州市专精特新中小企业培育',
    support: '对获评国家级、省级专精特新企业分别给予奖励。',
    city: '郑州市',
    department: '工业和信息化局',
    views: 167,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '企业',
    infoType: 'applying',
  },
  {
    id: 8,
    name: '河南省科技型中小企业技术创新基金',
    support: '支持科技型中小企业开展技术创新与成果转化。',
    city: '郑州市',
    department: '科学技术局',
    views: 88,
    status: 'idle',
    level: 'provincial',
    grade: '河南省',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 9,
    name: '郑州市软件和信息技术服务业专项',
    support: '',
    city: '郑州市',
    department: '发展和改革委员会',
    views: 54,
    status: 'expired',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '服务业',
    infoType: 'publicizing',
  },
  {
    id: 10,
    name: '郑东新区科技创新券',
    support: '面向区内企业发放创新券，用于检验检测、研发服务等支出。',
    city: '郑州市',
    department: '科学技术局',
    views: 73,
    status: 'idle',
    level: 'district',
    grade: '郑东新区',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 11,
    name: '国家科技型中小企业技术创新基金',
    support: '对符合条件的科技型中小企业给予无偿资助或贷款贴息。',
    city: '郑州市',
    department: '科学技术局',
    views: 521,
    status: 'idle',
    level: 'national',
    grade: '国家级',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 12,
    name: '郑州市数字经济核心产业扶持',
    support: '支持数字产业化与产业数字化重点项目建设。',
    city: '郑州市',
    department: '发展和改革委员会',
    views: 134,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '服务业',
    infoType: 'new',
  },
  {
    id: 13,
    name: '郑州市人工智能创新发展若干措施',
    support: '支持人工智能核心技术攻关、场景应用与产业生态培育。',
    city: '郑州市',
    department: '科学技术局',
    views: 276,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科技企业',
    infoType: 'new',
  },
  {
    id: 14,
    name: '河南省制造业数字化转型专项',
    support: '',
    city: '郑州市',
    department: '工业和信息化局',
    views: 41,
    status: 'expired',
    level: 'provincial',
    grade: '河南省',
    industryTag: '制造业',
    infoType: 'publicizing',
  },
  {
    id: 15,
    name: '高新技术开发区研发投入后补助',
    support: '对区内企业年度研发投入增量部分给予后补助。',
    city: '郑州市',
    department: '科学技术局',
    views: 19,
    status: 'idle',
    level: 'district',
    grade: '高新技术开发区',
    industryTag: '科技企业',
    infoType: 'applying',
  },
  {
    id: 16,
    name: '郑州市科技成果转化引导基金',
    support: '通过股权投资方式支持科技成果在本地转化落地。',
    city: '郑州市',
    department: '财政局',
    views: 92,
    status: 'idle',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '科技企业',
    infoType: 'new',
  },
  {
    id: 17,
    name: '国家级专精特新“小巨人”企业奖励',
    support: '对首次获评企业给予一次性奖励，并优先推荐重大项目。',
    city: '郑州市',
    department: '工业和信息化局',
    views: 308,
    status: 'idle',
    level: 'national',
    grade: '国家级',
    industryTag: '企业',
    infoType: 'applying',
  },
  {
    id: 18,
    name: '郑州市人才创新创业团队资助',
    support: '',
    city: '郑州市',
    department: '人力资源和社会保障局',
    views: 12,
    status: 'expired',
    level: 'municipal',
    grade: '郑州市',
    industryTag: '高等院校',
    infoType: 'publicizing',
  },
]

const industryToTag = (item: PolicyDbItem): string => {
  if (
    ['科技企业', '企业', '孵化器', '众创空间', '加速器', '服务业'].includes(
      item.industryTag,
    )
  ) {
    return '信息技术'
  }
  if (item.industryTag === '制造业') return '制造业'
  if (
    ['高等院校', '科研院所', '新型研发机构', '创新联合体'].includes(
      item.industryTag,
    )
  ) {
    return '教育科研'
  }
  return item.industryTag
}

const buildTags = (item: PolicyDbItem): PolicyDbTag[] => {
  const tags: PolicyDbTag[] = [
    { text: `${item.city} - ${item.department}`, color: 'blue' },
    { text: industryToTag(item), color: 'cyan' },
  ]
  if (
    item.name.includes('研究') ||
    item.name.includes('实验室') ||
    ['高等院校', '科研院所', '新型研发机构'].includes(item.industryTag)
  ) {
    tags.push({ text: '教育科研', color: 'orange' })
  } else if (item.name.includes('专精特新') || item.name.includes('制造')) {
    tags.push({ text: '财政扶持', color: 'purple' })
  } else {
    tags.push({ text: '产业培育', color: 'green' })
  }
  return tags
}

const dateFor = (id: number): string => {
  if (id === 1) return '2026-07-28'
  const month = String(((id - 1) % 8) + 1).padStart(2, '0')
  const day = String((id % 27) + 1).padStart(2, '0')
  return `2026-${month}-${day}`
}

const DEFAULT_FIELDS =
  '新一代信息技术、高端装备、新能源及智能网联汽车、生物医药、新材料、低空经济等战略性新兴产业，人工智能、氢能与新型储能、生物制造、量子科技、新一代信息网络、前沿新材料等未来产业。'

const buildApplyInfo = (item: PolicyDbItem): PolicyDbApplyInfo => {
  const methodName = `《${item.name}管理办法》`
  const docNo =
    item.id === 1 ? '郑发改高技〔2016〕559号' : `郑科〔2024〕${100 + item.id}号`

  return {
    fields:
      item.industryTag === '制造业'
        ? '智能工厂、工业互联网、高端装备、新材料、绿色制造、数字化转型等重点方向。'
        : DEFAULT_FIELDS,
    conditions: [
      '依托优势企业、科研单位、高校共同建设，需明确牵头单位和共建单位，申报单位需在我市注册成立并具有独立法人资格。',
      `符合${methodName}有关规定，研究方向符合我市产业发展规划和总体布局，发展思路清晰，任务和目标符合产业和技术发展趋势，建立规范的管理体制和运行机制，具备按期建设、正常运行和持续创新的各项支撑条件，且相同行业细分领域和方向上无已认定或命名的同类平台。建设期一般不超过2年。`,
    ],
    regulationNote: `注释：${methodName}规定：`,
    regulationClauses: [
      '在该领域中具有坚实的工程技术开发与成果转化工作基础、突出的科研特色和业绩；',
      '具有一批有待工程化开发、具有自主知识产权和良好市场前景的重大科技成果；',
      '具有科研成果工程化所需要的部分装备和基础设施，并能够为工程中心的建设、运行提供必要的配套保障，必须有资金、资产、技术、人才等实质性投入；',
      '在该领域中具有国内先进水平的研究开发和技术集成能力及相应的人才队伍，管理团队和技术带头人具有较强市场意识和科技成果转化的管理能力，在该领域有一支结构合理、工程化研究开发与转化素质较高的技术创新团队。',
    ],
    files: [
      {
        name: `${methodName}(${docNo})`,
        url: 'https://fgw.zhengzhou.gov.cn/',
      },
    ],
  }
}

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

type UpdateTemplate = {
  title: (name: string) => string
  grade: string
  department: string
  date: string
  endDate: string
  daysRemaining: number
  expired: boolean
  phone: string
}

const updateTemplates: UpdateTemplate[] = [
  {
    title: (name) => `中央引导地方科技发展专项（${name}配套）`,
    grade: '河南省',
    department: '科学技术厅',
    date: '2026-06-20',
    endDate: '2026-10-15',
    daysRemaining: 56,
    expired: false,
    phone: '0371-65901111',
  },
  {
    title: (name) => `关于组织申报${name}的通知`,
    grade: '郑州市',
    department: '科学技术局',
    date: '2026-07-28',
    endDate: '2026-08-30',
    daysRemaining: 10,
    expired: false,
    phone: '0371-67180000',
  },
  {
    title: (name) => `${name}管理办法`,
    grade: '国家级',
    department: '国家发展改革委',
    date: '2024-03-12',
    endDate: '2025-12-31',
    daysRemaining: 0,
    expired: true,
    phone: '010-68500000',
  },
  {
    title: (name) => `河南省${name}建设实施方案`,
    grade: '河南省',
    department: '发展和改革委员会',
    date: '2026-05-08',
    endDate: '2026-09-30',
    daysRemaining: 41,
    expired: false,
    phone: '0371-65902222',
  },
  {
    title: (name) => `金水区${name}配套奖补通知`,
    grade: '金水区',
    department: '科学技术局',
    date: '2026-07-01',
    endDate: '2026-08-25',
    daysRemaining: 5,
    expired: false,
    phone: '0371-66680001',
  },
  {
    title: (name) => `郑东新区科技创新平台培育办法（${name}）`,
    grade: '郑东新区',
    department: '管委会',
    date: '2025-04-10',
    endDate: '2025-12-31',
    daysRemaining: 0,
    expired: true,
    phone: '0371-89990001',
  },
  {
    title: (name) => `高新技术开发区${name}认定细则`,
    grade: '高新技术开发区',
    department: '科学技术局',
    date: '2026-08-01',
    endDate: '2026-11-30',
    daysRemaining: 102,
    expired: false,
    phone: '0371-67980001',
  },
  {
    title: (name) => `关于开展${name}绩效评价的通知`,
    grade: '郑州市',
    department: '发展和改革委员会',
    date: '2026-08-10',
    endDate: '2026-09-10',
    daysRemaining: 21,
    expired: false,
    phone: '0371-67181111',
  },
  {
    title: (name) => `经济技术开发区${name}申报通知`,
    grade: '经济技术开发区',
    department: '经济发展局',
    date: '2024-09-01',
    endDate: '2025-03-01',
    daysRemaining: 0,
    expired: true,
    phone: '0371-66780001',
  },
]

const NAME_PREFIX = ['河南', '郑州', '中原', '郑东', '航空港']
const NAME_MID = [
  '中科',
  '智联',
  '华创',
  '明德',
  '协同',
  '数智',
  '千里',
  '高新',
  '中奥',
  '远见',
]
const NAME_SUF = [
  '细胞基因工程',
  '信息技术',
  '新材料',
  '智能装备',
  '生物医药',
  '新能源',
  '光电技术',
  '氢能科技',
]
const PUBLICITY_INDUSTRIES = [
  '研发平台',
  '研发平台',
  '研发平台',
  '信息技术',
  '制造业',
]
const PUBLICITY_AMOUNTS = [20, 10, 50, 15, null, 30, null, 8]
const PUBLICITY_DISTRICTS = publicityAddresses.filter(
  (item) => item !== '郑州市',
)

const categoryCounts: [PolicyDbPublicityCategory, number][] = [
  ['approved', 208],
  ['subsidy', 32],
  ['proposed', 24],
  ['evaluation', 16],
  ['acceptance', 12],
  ['revoked', 8],
]

const regionOf = (district: string): string => {
  if (district === '航空港区') return '河南省 郑州市 郑州航空港经济综合实验区'
  return `河南省 郑州市 ${district}`
}

const companyName = (seed: number): string => {
  const prefix = NAME_PREFIX[seed % NAME_PREFIX.length]
  const mid = NAME_MID[seed % NAME_MID.length]
  const suf = NAME_SUF[seed % NAME_SUF.length]
  const cycle = NAME_PREFIX.length * NAME_MID.length
  if (seed < cycle) return `${prefix}${mid}${suf}有限公司`
  return `${prefix}${mid}${suf}${seed}有限公司`
}

const buildPublicity = (item: PolicyDbItem): PolicyDbPublicity[] => {
  const result: PolicyDbPublicity[] = []
  let seq = 0
  for (const [category, count] of categoryCounts) {
    for (let i = 0; i < count; i += 1) {
      seq += 1
      const isHero = item.id === 1 && category === 'approved' && i === 0
      const district = isHero
        ? '航空港区'
        : (PUBLICITY_DISTRICTS[(seq + item.id) % PUBLICITY_DISTRICTS.length] ??
          '金水区')
      result.push({
        id: item.id * 1000 + seq,
        name: isHero
          ? '河南中科千里细胞基因工程有限公司'
          : companyName(seq + item.id * 17),
        district,
        region: regionOf(district),
        industry:
          PUBLICITY_INDUSTRIES[seq % PUBLICITY_INDUSTRIES.length] ?? '研发平台',
        amount: isHero
          ? 20
          : (PUBLICITY_AMOUNTS[seq % PUBLICITY_AMOUNTS.length] ?? null),
        year:
          policyDbYears[seq % 3 === 0 ? seq % policyDbYears.length : 0] ?? 2026,
        category,
        obtainedPolicy:
          publicityObtainedPolicies[seq % publicityObtainedPolicies.length] ??
          '工程研究中心',
      })
    }
  }
  return result
}

const buildUpdates = (item: PolicyDbItem): PolicyDbUpdate[] =>
  updateTemplates.map((tpl, index) => ({
    id: item.id * 100 + index + 1,
    title:
      item.id === 1 && index === 0
        ? '中央引导地方科技发展专项（河南省补贴）'
        : tpl.title(item.name),
    grade: tpl.grade,
    department: tpl.department,
    date: tpl.date,
    endDate: tpl.endDate,
    year: Number(tpl.date.slice(0, 4)),
    daysRemaining: tpl.daysRemaining,
    expired: tpl.expired,
    phone: tpl.phone,
    newsId: (index % 9) + 1,
  }))

export const getPolicyDbById = (id: number): PolicyDbItem | undefined => {
  return mockPolicyDb.find((item) => item.id === id)
}

export const getPolicyDbDetail = (id: number): PolicyDbDetail | undefined => {
  const item = getPolicyDbById(id)
  if (!item) return undefined
  return {
    ...item,
    date: dateFor(item.id),
    tags: buildTags(item),
    applyInfo: buildApplyInfo(item),
    supportMeasures: buildSupportMeasures(item),
    updates: buildUpdates(item),
    publicity: buildPublicity(item),
  }
}
