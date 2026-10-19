import type { EnterpriseDetail } from './types'

export type MatchPolicyStatus = 'expired' | 'idle' | 'public'

export interface MatchPolicyBadge {
  text: string
  tone: 'blue' | 'green'
}

export interface MatchPolicy {
  id: number
  name: string
  badge?: MatchPolicyBadge
  grade: string
  score: number
  department: string
  status: MatchPolicyStatus
  maxAmount?: number
  amountLines?: string[]
  highlight?: boolean
  incubatorNote?: string
}

export const matchPolicyStatusText: Record<MatchPolicyStatus, string> = {
  expired: '疑似过期',
  idle: '暂无动态',
  public: '公示中',
}

const SHOWCASE: Array<Omit<MatchPolicy, 'id'>> = [
  {
    name: '河南省创新示范专项',
    grade: '河南省',
    score: 100,
    department: '科学技术厅、财政厅',
    status: 'expired',
  },
  {
    name: '河南省创新示范专项',
    grade: '河南省',
    score: 100,
    department: '科学技术厅、财政厅',
    status: 'idle',
  },
  {
    name: '河南省创新示范专项',
    grade: '河南省',
    score: 100,
    department: '科学技术厅、财政厅',
    status: 'idle',
    maxAmount: 1000,
    amountLines: ['郑州市：最高1000万元'],
  },
  {
    name: '河南省专精特新中小企业',
    badge: { text: '2026年新型', tone: 'blue' },
    grade: '河南省',
    score: 100,
    department: '科学技术厅、财政厅',
    status: 'expired',
    maxAmount: 500,
    amountLines: ['郑州市：最高500万元'],
  },
  {
    name: '研发费用加计扣除',
    badge: { text: '常年申报', tone: 'green' },
    grade: '河南省',
    score: 100,
    department: '科学技术厅、财政厅',
    status: 'idle',
  },
  {
    name: '研发费用加计扣除',
    badge: { text: '常年申报', tone: 'green' },
    grade: '河南省',
    score: 100,
    department: '人力资源和社会保障厅、财政厅',
    status: 'public',
  },
  {
    name: '工业和信息化部重点实验室',
    grade: '河南省',
    score: 80,
    department: '科学技术厅、财政厅',
    status: 'idle',
    highlight: true,
    incubatorNote:
      '场地面积（平方米）：3001以上　研发设备原值（万元）：2001以上',
    maxAmount: 1300,
    amountLines: [
      '河南省：最高500万元',
      '郑州市：最高500万元',
      '郑州航空港经济综合实验区：最高300万元',
    ],
  },
  {
    name: '专精特新“小巨人”企业',
    grade: '河南省',
    score: 80,
    department: '科学技术厅、财政厅',
    status: 'idle',
    highlight: true,
    incubatorNote: '场地面积（平方米）：501以上',
    maxAmount: 530,
    amountLines: [
      '河南省：最高500万元',
      '郑州市：最高500万元',
      '郑州航空港经济综合实验区：最高300万元',
    ],
  },
]

const FILLERS: Array<Omit<MatchPolicy, 'id'>> = [
  {
    name: '河南省科技型中小企业',
    grade: '河南省',
    score: 96,
    department: '科学技术厅',
    status: 'idle',
  },
  {
    name: '郑州市高新技术企业认定奖励',
    grade: '郑州市',
    score: 92,
    department: '科学技术局',
    status: 'public',
    maxAmount: 20,
    amountLines: ['郑州市：最高20万元'],
  },
  {
    name: '河南省首台（套）重大技术装备',
    grade: '河南省',
    score: 85,
    department: '工业和信息化厅',
    status: 'idle',
    maxAmount: 300,
    amountLines: ['河南省：最高300万元'],
  },
  {
    name: '郑州市企业研发费用补助',
    grade: '郑州市',
    score: 100,
    department: '科学技术局、财政局',
    status: 'expired',
  },
  {
    name: '河南省制造业高质量发展专项',
    grade: '河南省',
    score: 78,
    department: '工业和信息化厅、财政厅',
    status: 'idle',
    maxAmount: 200,
    amountLines: ['河南省：最高200万元', '郑州市：最高100万元'],
  },
  {
    name: '郑州市知识产权专项资金',
    grade: '郑州市',
    score: 88,
    department: '市场监督管理局',
    status: 'public',
    maxAmount: 30,
    amountLines: ['郑州市：最高30万元'],
  },
  {
    name: '河南省博士后科研资助',
    grade: '河南省',
    score: 70,
    department: '人力资源和社会保障厅',
    status: 'idle',
  },
  {
    name: '郑州航空港经济综合实验区产业发展资金',
    grade: '郑州市',
    score: 90,
    department: '郑州航空港经济综合实验区管委会',
    status: 'idle',
    maxAmount: 150,
    amountLines: ['郑州航空港经济综合实验区：最高150万元'],
  },
  {
    name: '河南省绿色工厂',
    badge: { text: '常年申报', tone: 'green' },
    grade: '河南省',
    score: 82,
    department: '工业和信息化厅',
    status: 'expired',
  },
  {
    name: '郑州市创新创业团队资助',
    grade: '郑州市',
    score: 75,
    department: '科学技术局',
    status: 'idle',
    maxAmount: 100,
    amountLines: ['郑州市：最高100万元'],
  },
  {
    name: '河南省中小企业数字化转型',
    badge: { text: '2026年新型', tone: 'blue' },
    grade: '河南省',
    score: 86,
    department: '工业和信息化厅、财政厅',
    status: 'public',
    maxAmount: 80,
    amountLines: ['河南省：最高80万元'],
  },
  {
    name: '郑州市人才安居补贴',
    grade: '郑州市',
    score: 66,
    department: '人力资源和社会保障局',
    status: 'idle',
  },
]

const MATCH_TOTAL = 60

const localize = (text: string, enterprise: EnterpriseDetail) =>
  text
    .replaceAll('郑州航空港经济综合实验区', enterprise.district)
    .replaceAll('河南省', enterprise.province)
    .replaceAll('郑州市', enterprise.city)

const localizePolicy = (
  item: Omit<MatchPolicy, 'id'>,
  enterprise: EnterpriseDetail,
  id: number,
): MatchPolicy => ({
  ...item,
  id,
  name: localize(item.name, enterprise),
  grade: localize(item.grade, enterprise),
  department: localize(item.department, enterprise),
  amountLines: item.amountLines?.map((line) => localize(line, enterprise)),
  incubatorNote: item.incubatorNote
    ? localize(item.incubatorNote, enterprise)
    : undefined,
})

export const buildMatchPolicies = (
  enterprise: EnterpriseDetail,
): MatchPolicy[] => {
  const source = [...SHOWCASE]
  let cursor = 0
  while (source.length < MATCH_TOTAL) {
    source.push(FILLERS[cursor % FILLERS.length]!)
    cursor += 1
  }
  return source.map((item, index) =>
    localizePolicy(item, enterprise, enterprise.id * 1000 + index + 1),
  )
}
