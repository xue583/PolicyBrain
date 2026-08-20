import type { PolicyInfoType, PolicyLevel } from './filters'

export type { PolicyInfoType, PolicyLevel }
export { regions, industries, policyLevels, infoTypes } from './filters'

export interface PolicyTag {
  text: string
  color: string
}

export interface PolicyAttachment {
  name: string
  url: string
}

export interface PolicyItem {
  id: number
  title: string
  status: 'normal' | 'expired'
  tags: PolicyTag[]
  description: string
  date: string
  endDate: string
  department: string
  daysRemaining: number
  region: string
  industry: string
  level: PolicyLevel
  infoType: PolicyInfoType
  content: string
  attachments: PolicyAttachment[]
  originalUrl: string
}

const defaultAttachments: PolicyAttachment[] = [
  {
    name: '1. 《郑州市科技计划项目管理办法（征求意见稿）》.wps',
    url: '#',
  },
  {
    name: '2. 《郑州市科技协同创新项目实施细则》（征求意见稿）.docx',
    url: '#',
  },
]

const buildContent = (title: string, department: string): string => {
  return [
    `<p>郑东新区管委会各有关单位、区直各部门，各有关单位：</p>`,
    `<p>为深入贯彻落实创新驱动发展战略，做好相关申报组织工作，现将《${title}》有关事项通知如下：</p>`,
    `<p><strong>一、申报要求</strong></p>`,
    `<p>（一）申报单位应为在本市依法注册、具有独立法人资格的企事业单位、高校院所或其他组织，具备完成项目所需的研发基础与组织实施能力。</p>`,
    `<p>（二）申报项目应符合当年度指南方向，研究内容清晰、目标可考核，不得与已获财政支持项目重复申报。</p>`,
    `<p>（三）申报材料应真实、完整、规范，按要求通过指定系统提交，逾期不予受理。</p>`,
    `<p><strong>二、推荐渠道</strong></p>`,
    `<p>（一）区属企事业单位、高校院所由所属主管部门或园区管委会审核推荐。</p>`,
    `<p>（二）其他符合条件的单位按属地原则，向所在区县科技管理部门提出申请。</p>`,
    `<p><strong>三、申报程序</strong></p>`,
    `<p>（一）网上填报：登录指定申报系统填写信息并上传材料。</p>`,
    `<p>（二）形式审查：推荐单位对申报材料完整性、合规性进行审查。</p>`,
    `<p>（三）专家评审：组织专家对通过形式审查的项目进行评审论证。</p>`,
    `<p>（四）结果公示：评审结果按规定程序公示，公示无异议后按程序办理。</p>`,
    `<p><strong>四、其他事项</strong></p>`,
    `<p>请各单位高度重视，认真组织申报。具体事项可咨询${department}，联系电话：0371-12345678。</p>`,
    `<p>特此通知。</p>`,
  ].join('')
}

export const navItems = [
  { key: 'home', label: '首页' },
  { key: 'news', label: '政策资讯' },
  { key: 'policy-db', label: '政策数据库' },
  { key: 'enterprise-db', label: '企业数据库' },
  { key: 'invest-db', label: '投资项目库' },
  { key: 'export', label: '数据导出' },
  { key: 'api', label: 'API接口' },
]

const heroByPage: Record<
  string,
  {
    slogan: string
    description: string
    searchPlaceholder: string
    hideSearch?: boolean
  }
> = {
  news: {
    slogan: '政策脉动，一手掌握',
    description:
      '支持省、市、区县三级筛选，支持20000页内跳转，深分页最多追赶100页',
    searchPlaceholder: '搜索政策关键词或项目名称',
  },
  'policy-db': {
    slogan: '三级政策，一库全收，决策快人一步。',
    description:
      '支持省、市、区县三级筛选，支持20000页内跳转，分页最多追赶100页',
    searchPlaceholder: '搜索政策标题',
  },
  'invest-db': {
    slogan: '汇集数据，实时动态',
    description:
      '专注于项目维度的数据整合，汇聚了区域内的招商项目信息、开工项目数、项目总投资及落地数量等关键数据',
    searchPlaceholder: '搜索项目名称、代码或单位',
    hideSearch: true,
  },
  export: {
    slogan: '数据资产，一键下载',
    description:
      '提供高级搜索、批量查询功能，精准筛选企业数据，支持多格式一键导出，便于研究分析与报告撰写。',
    searchPlaceholder: '',
    hideSearch: true,
  },
}

const defaultHero = {
  slogan: '政策脉动，一手掌握',
  description:
    '支持省、市、区县三级筛选，支持20000页内跳转，深分页最多追赶100页',
  searchPlaceholder: '搜索政策关键词或项目名称',
  hideSearch: false,
}

export const getSubPageHero = (pageKey: string) => {
  const label = navItems.find((item) => item.key === pageKey)?.label ?? ''
  return {
    title: label,
    ...(heroByPage[pageKey] ?? defaultHero),
  }
}

export const cities = ['郑州市', '洛阳市', '开封市', '新乡市', '许昌市']

const policySeeds: Omit<
  PolicyItem,
  'content' | 'attachments' | 'originalUrl'
>[] = [
  {
    id: 1,
    title: '关于印发郑州市推进人工智能创新发展若干措施的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '信息技术', color: 'green' },
      { text: '教育科研', color: 'orange' },
    ],
    description:
      '为深入贯彻落实党中央、国务院关于加快发展新一代人工智能的决策部署，抢抓人工智能发展重大战略机遇，推动人工智能与经济社会深度融合，培育壮大新质生产力，结合我市实际，制定本措施。重点支持人工智能核心技术攻关、场景应用示范、产业生态培育等方面。',
    date: '2026-07-28',
    endDate: '2026-08-16',
    department: '郑州市科学技术局',
    daysRemaining: 0,
    region: '河南省',
    industry: '信息技术',
    level: 'municipal',
    infoType: 'new',
  },
  {
    id: 2,
    title: '郑州市关于支持高新技术企业高质量发展的若干政策',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '高新技术', color: 'green' },
      { text: '财政扶持', color: 'purple' },
    ],
    description:
      '为进一步优化营商环境，激发企业创新活力，对我市新认定的高新技术企业给予一次性奖励，对复审通过的高新技术企业给予持续支持。同时配套研发费用加计扣除辅导、知识产权托管等服务措施。',
    date: '2026-06-15',
    endDate: '2026-07-10',
    department: '郑州市工业和信息化局',
    daysRemaining: 0,
    region: '河南省',
    industry: '高新技术',
    level: 'municipal',
    infoType: 'applying',
  },
  {
    id: 3,
    title: '关于开展2026年度市级科技计划项目申报工作的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '科技计划', color: 'cyan' },
      { text: '项目申报', color: 'orange' },
    ],
    description:
      '现启动2026年度市级科技计划项目申报工作，申报方向包括重大科技专项、重点研发计划、科技成果转化等。请各申报单位认真组织，按时通过线上系统提交材料，逾期不予受理。',
    date: '2026-05-20',
    endDate: '2026-06-20',
    department: '郑州市科学技术局',
    daysRemaining: 0,
    region: '河南省',
    industry: '高新技术',
    level: 'municipal',
    infoType: 'applying',
  },
  {
    id: 4,
    title: '郑州市促进软件和信息技术服务业发展专项资金管理办法',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '软件服务', color: 'green' },
      { text: '专项资金', color: 'gold' },
    ],
    description:
      '为规范专项资金使用管理，提高资金使用效益，支持软件和信息技术服务业做大做强，本办法明确了支持范围、申报条件、评审程序及监督管理要求，适用于在本市依法注册的相关企业。',
    date: '2026-04-08',
    endDate: '2026-05-08',
    department: '郑州市发展和改革委员会',
    daysRemaining: 0,
    region: '河南省',
    industry: '信息技术',
    level: 'municipal',
    infoType: 'publicizing',
  },
  {
    id: 5,
    title: '关于印发郑州市数字经济核心产业统计监测实施办法的通知',
    status: 'expired',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '数字经济', color: 'geekblue' },
      { text: '统计监测', color: 'lime' },
    ],
    description:
      '为准确反映我市数字经济发展状况，建立健全数字经济核心产业统计监测体系，现将《郑州市数字经济核心产业统计监测实施办法》印发给你们，请认真贯彻执行。',
    date: '2026-03-22',
    endDate: '2026-04-22',
    department: '郑州市统计局',
    daysRemaining: 0,
    region: '河南省',
    industry: '信息技术',
    level: 'municipal',
    infoType: 'new',
  },
  {
    id: 6,
    title: '郑州市加快推进制造业数字化转型行动方案（2026—2028年）',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '制造业', color: 'volcano' },
      { text: '数字化转型', color: 'green' },
    ],
    description:
      '行动方案围绕智能工厂建设、工业互联网平台培育、关键环节数字化改造等重点任务，提出三年行动目标和具体举措，鼓励企业申报数字化转型示范项目并享受相应政策支持。',
    date: '2026-08-01',
    endDate: '2026-09-15',
    department: '郑州市工业和信息化局',
    daysRemaining: 45,
    region: '河南省',
    industry: '制造业',
    level: 'municipal',
    infoType: 'new',
  },
  {
    id: 7,
    title: '关于组织申报河南省科技型中小企业技术创新基金的通知',
    status: 'normal',
    tags: [
      { text: '河南省', color: 'blue' },
      { text: '科技型中小企业', color: 'green' },
      { text: '创新基金', color: 'orange' },
    ],
    description:
      '为支持科技型中小企业开展技术创新活动，现组织申报河南省科技型中小企业技术创新基金。符合条件的企业可通过市级科技管理部门推荐申报，具体要求详见申报指南。',
    date: '2026-08-05',
    endDate: '2026-09-02',
    department: '河南省科学技术厅',
    daysRemaining: 28,
    region: '河南省',
    industry: '高新技术',
    level: 'provincial',
    infoType: 'applying',
  },
  {
    id: 8,
    title: '郑州市关于进一步支持专精特新中小企业发展的若干措施',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '专精特新', color: 'purple' },
      { text: '中小企业', color: 'cyan' },
    ],
    description:
      '从梯度培育、融资支持、人才引进、市场开拓等方面提出系列措施，对新认定的国家级、省级专精特新“小巨人”企业分别给予奖励，并优先推荐参与重大项目和政府采购。',
    date: '2026-08-10',
    endDate: '2026-10-09',
    department: '郑州市工业和信息化局',
    daysRemaining: 60,
    region: '河南省',
    industry: '制造业',
    level: 'municipal',
    infoType: 'applying',
  },
  {
    id: 9,
    title: '关于公开征集2026年郑州市重点领域科技攻关需求的通知',
    status: 'normal',
    tags: [
      { text: '河南省郑州市', color: 'blue' },
      { text: '科技攻关', color: 'orange' },
      { text: '需求征集', color: 'green' },
    ],
    description:
      '面向全市企事业单位、高校院所公开征集人工智能、先进材料、生物医药、现代农业等重点领域科技攻关需求，征集结果将作为编制市级科技计划指南的重要依据。',
    date: '2026-08-12',
    endDate: '2026-08-27',
    department: '郑州市科学技术局',
    daysRemaining: 15,
    region: '河南省',
    industry: '高新技术',
    level: 'municipal',
    infoType: 'new',
  },
]

export const mockPolicies: PolicyItem[] = policySeeds.map((item) => ({
  ...item,
  content: buildContent(item.title, item.department),
  attachments: defaultAttachments,
  originalUrl: 'https://www.zhengzhou.gov.cn/',
}))

export const getPolicyById = (id: number): PolicyItem | undefined => {
  return mockPolicies.find((item) => item.id === id)
}
