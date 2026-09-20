export interface HomeNewsTag {
  text: string
  tone: 'blue' | 'green' | 'orange' | 'gold' | 'purple' | 'cyan'
}

export interface HomeNewsItem {
  id: number
  title: string
  tags: HomeNewsTag[]
  time: string
  department: string
  status: 'applying' | 'remaining' | 'closed'
  statusText: string
}

export const featureCards = [
  {
    key: 'match-policy',
    routeName: 'policy-db',
    title: '企业匹配政策',
    desc: '输入企业名称，快速获得可申报政策清单、条件差距与行动建议。',
    icon: 'policy',
  },
  {
    key: 'match-enterprise',
    routeName: 'enterprise-db',
    title: '政策匹配企业',
    desc: '输入政策关键词，智能匹配符合条件的企业，精准推送政策信息。',
    icon: 'enterprise',
  },
  {
    key: 'ai-ask',
    routeName: 'api',
    title: 'AI问政',
    desc: '基于大模型的政策问答助手，为您解读政策要点、申报流程和注意事项。',
    icon: 'robot',
  },
  {
    key: 'workbench',
    routeName: 'personal-center',
    title: '工作台',
    desc: '管理关注政策、申报进度、企业资质，一站式处理日常政策工作。',
    icon: 'workbench',
  },
]

export const hotKeywords = [
  '高新技术企业',
  '数字化转型',
  '人工智能',
  '专精特新',
]

export const industryTags = [
  '能源矿产',
  '基础化工',
  '钢铁有色',
  '建筑材料',
  '建筑装饰',
  '电力设备',
  '机械设备',
  '国防军工',
  '汽车',
  '家电',
  '纺织服装',
  '轻工制造',
  '医药生物',
  '公用事业',
  '交通运输',
  '房地产',
  '商贸零售',
  '社会服务',
  '银行',
  '非银金融',
]

export const homeNewsList: HomeNewsItem[] = [
  {
    id: 1,
    title: '关于组织开展2026年度高新技术企业认定工作的通知',
    tags: [
      { text: '河南省省级', tone: 'blue' },
      { text: '申报通知', tone: 'green' },
      { text: '荣誉资质', tone: 'orange' },
      { text: '科技创新', tone: 'gold' },
    ],
    time: '10:24',
    department: '河南省财政金融部',
    status: 'applying',
    statusText: '正在申报',
  },
  {
    id: 2,
    title: '郑州市推进制造业数字化转型专项资金申报指南',
    tags: [
      { text: '河南省郑州市', tone: 'blue' },
      { text: '申报通知', tone: 'green' },
      { text: '数字化转型', tone: 'cyan' },
    ],
    time: '09:18',
    department: '郑州市工业和信息化局',
    status: 'remaining',
    statusText: '仅剩29天',
  },
  {
    id: 3,
    title: '关于印发河南省专精特新中小企业培育实施方案的通知',
    tags: [
      { text: '河南省省级', tone: 'blue' },
      { text: '培育计划', tone: 'purple' },
      { text: '专精特新', tone: 'orange' },
    ],
    time: '昨日',
    department: '河南省工业和信息化厅',
    status: 'applying',
    statusText: '正在申报',
  },
  {
    id: 4,
    title: '郑州市人工智能创新发展若干措施申报工作安排',
    tags: [
      { text: '河南省郑州市', tone: 'blue' },
      { text: '新发文', tone: 'cyan' },
      { text: '人工智能', tone: 'blue' },
    ],
    time: '08-12',
    department: '郑州市科学技术局',
    status: 'remaining',
    statusText: '仅剩15天',
  },
  {
    id: 5,
    title: '关于公开征集2026年重点领域科技攻关需求的通知',
    tags: [
      { text: '河南省郑州市', tone: 'blue' },
      { text: '需求征集', tone: 'green' },
      { text: '科技攻关', tone: 'orange' },
    ],
    time: '08-10',
    department: '郑州市科学技术局',
    status: 'closed',
    statusText: '已截止',
  },
  {
    id: 6,
    title: '河南省科技型中小企业技术创新基金申报通知',
    tags: [
      { text: '河南省省级', tone: 'blue' },
      { text: '申报通知', tone: 'green' },
      { text: '创新基金', tone: 'gold' },
    ],
    time: '08-08',
    department: '河南省科学技术厅',
    status: 'applying',
    statusText: '正在申报',
  },
]

export const homeFollowList: HomeNewsItem[] = [
  {
    id: 101,
    title: '您关注的「高新技术企业认定」有新的申报通知',
    tags: [
      { text: '关注动态', tone: 'blue' },
      { text: '高新技术', tone: 'green' },
    ],
    time: '今天',
    department: '郑州市科学技术局',
    status: 'applying',
    statusText: '正在申报',
  },
  {
    id: 102,
    title: '关注政策「专精特新培育」即将截止，请尽快完成材料准备',
    tags: [
      { text: '关注动态', tone: 'orange' },
      { text: '专精特新', tone: 'purple' },
    ],
    time: '昨天',
    department: '郑州市工业和信息化局',
    status: 'remaining',
    statusText: '仅剩7天',
  },
]
