/** 数据洞察驾驶舱的演示数据，数值对齐设计稿。 */

export type InsightMetric = 'policy' | 'fund' | 'apply'
export type TrendRange = '7d' | '30d' | '12m'

export type TrendPoint = {
  label: string
  publish: number
  apply: number
}

export type RankRow = {
  name: string
  value: number
  growth: number
}

export type RankItem = RankRow & { percent: number }

export type IndustryCard = {
  key: string
  name: string
  count: number
  growth: number
  spark: number[]
  color: string
}

export const metricOptions: { label: string; value: InsightMetric }[] = [
  { label: '政策数量', value: 'policy' },
  { label: '资金规模', value: 'fund' },
  { label: '申报数量', value: 'apply' },
]

export const metricUnit: Record<InsightMetric, string> = {
  policy: '条',
  fund: '亿元',
  apply: '项',
}

export const trendRangeOptions: { label: string; value: TrendRange }[] = [
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
  { label: '近12个月', value: '12m' },
]

export const insightKpis = [
  {
    key: 'policy',
    label: '政策总量',
    value: 1268952,
    precision: 0,
    unit: '条',
    growth: 12.5,
    color: '#3b82f6',
    spark: [620, 680, 640, 760, 820, 790, 910, 980, 1040, 1180],
  },
  {
    key: 'enterprise',
    label: '覆盖企业',
    value: 842631,
    precision: 0,
    unit: '家',
    growth: 18.6,
    color: '#38bdf8',
    spark: [410, 460, 440, 520, 580, 610, 690, 760, 820, 910],
  },
  {
    key: 'apply',
    label: '累计申报数量',
    value: 386502,
    precision: 0,
    unit: '项',
    growth: 24.3,
    color: '#34d399',
    spark: [180, 220, 210, 280, 340, 390, 460, 540, 620, 760],
  },
  {
    key: 'fund',
    label: '资金支持规模',
    value: 12860.5,
    precision: 1,
    unit: '亿元',
    growth: 17.6,
    color: '#6366f1',
    spark: [320, 360, 340, 410, 480, 460, 540, 610, 690, 780],
  },
  {
    key: 'user',
    label: '注册用户',
    value: 235689,
    precision: 0,
    unit: '人',
    growth: 11.2,
    color: '#60a5fa',
    spark: [260, 280, 300, 290, 340, 360, 390, 420, 450, 480],
  },
] as const

const trendByRange: Record<TrendRange, TrendPoint[]> = {
  '7d': [
    { label: '10.17', publish: 8600, apply: 5200 },
    { label: '10.18', publish: 9100, apply: 5600 },
    { label: '10.19', publish: 8800, apply: 5400 },
    { label: '10.20', publish: 9800, apply: 6100 },
    { label: '10.21', publish: 10400, apply: 6800 },
    { label: '10.22', publish: 10900, apply: 7400 },
    { label: '10.23', publish: 11600, apply: 8100 },
  ],
  '30d': [
    { label: '09.24', publish: 4200, apply: 2600 },
    { label: '09.28', publish: 3800, apply: 2400 },
    { label: '10.02', publish: 5100, apply: 3100 },
    { label: '10.06', publish: 6400, apply: 3600 },
    { label: '10.10', publish: 7200, apply: 4200 },
    { label: '10.14', publish: 8600, apply: 5100 },
    { label: '10.18', publish: 9800, apply: 6400 },
    { label: '10.22', publish: 11200, apply: 7800 },
  ],
  '12m': [
    { label: '11月', publish: 62000, apply: 28000 },
    { label: '12月', publish: 58000, apply: 31000 },
    { label: '1月', publish: 71000, apply: 36000 },
    { label: '2月', publish: 54000, apply: 24000 },
    { label: '3月', publish: 86000, apply: 42000 },
    { label: '4月', publish: 92000, apply: 48000 },
    { label: '5月', publish: 88000, apply: 51000 },
    { label: '6月', publish: 97000, apply: 56000 },
    { label: '7月', publish: 104000, apply: 62000 },
    { label: '8月', publish: 99000, apply: 64000 },
    { label: '9月', publish: 112000, apply: 71000 },
    { label: '10月', publish: 126000, apply: 82000 },
  ],
}

export const getTrend = (range: TrendRange) => trendByRange[range]

export const policyTypes = [
  { name: '资金支持', percent: 32.6, color: '#3b82f6' },
  { name: '税收优惠', percent: 18.4, color: '#22d3ee' },
  { name: '人才政策', percent: 12.8, color: '#fb923c' },
  { name: '项目申报', percent: 11.3, color: '#34d399' },
  { name: '产业扶持', percent: 9.6, color: '#a78bfa' },
  { name: '创新研发', percent: 7.8, color: '#f472b6' },
  { name: '其他', percent: 7.5, color: '#94a3b8' },
]

export const policyTotalLabel = '1,268,952'

type RegionNode = {
  key: string
  name: string
  coord: [number, number]
  labelPosition: 'top' | 'left' | 'right' | 'bottom'
}

export const regionNodes: RegionNode[] = [
  { key: 'nw', name: '西北', coord: [86.2, 41.6], labelPosition: 'left' },
  { key: 'n', name: '华北', coord: [114.6, 39.6], labelPosition: 'top' },
  { key: 'ne', name: '东北', coord: [125.2, 44.2], labelPosition: 'top' },
  { key: 'e', name: '华东', coord: [119.4, 30.4], labelPosition: 'right' },
  { key: 'c', name: '华中', coord: [112.4, 30.6], labelPosition: 'left' },
  { key: 's', name: '华南', coord: [113.0, 23.2], labelPosition: 'bottom' },
  { key: 'sw', name: '西南', coord: [101.2, 26.4], labelPosition: 'left' },
]

const regionShare: Record<InsightMetric, Record<string, number>> = {
  policy: { nw: 7.5, n: 14.2, ne: 4.9, e: 33.9, c: 11.3, s: 18.6, sw: 9.6 },
  fund: { nw: 6.8, n: 12.4, ne: 5.6, e: 36.2, c: 10.1, s: 17.4, sw: 11.5 },
  apply: { nw: 8.2, n: 13.6, ne: 6.1, e: 31.4, c: 12.8, s: 16.9, sw: 11.0 },
}

export const getRegionShare = (metric: InsightMetric, key: string) =>
  regionShare[metric][key] ?? 0

/** 以华东为枢纽的飞线，用来做地图上的流动效果 */
export const regionLinks: [string, string][] = [
  ['nw', 'e'],
  ['n', 'e'],
  ['ne', 'e'],
  ['c', 'e'],
  ['s', 'e'],
  ['sw', 'e'],
  ['nw', 'sw'],
  ['n', 'ne'],
]

const rankSource: Record<InsightMetric, RankRow[]> = {
  policy: [
    { name: '广东省', value: 186243, growth: 26.8 },
    { name: '江苏省', value: 152876, growth: 18.4 },
    { name: '浙江省', value: 128369, growth: 16.2 },
    { name: '山东省', value: 96524, growth: 12.6 },
    { name: '四川省', value: 72481, growth: 11.3 },
    { name: '河南省', value: 68325, growth: 9.8 },
    { name: '湖北省', value: 62843, growth: 8.1 },
    { name: '福建省', value: 58621, growth: 7.6 },
    { name: '湖南省', value: 53986, growth: 6.3 },
    { name: '安徽省', value: 49362, growth: 5.9 },
  ],
  fund: [
    { name: '广东省', value: 2468.6, growth: 22.4 },
    { name: '江苏省', value: 1986.2, growth: 19.1 },
    { name: '浙江省', value: 1642.8, growth: 15.6 },
    { name: '山东省', value: 1218.4, growth: 13.2 },
    { name: '上海市', value: 986.5, growth: 11.8 },
    { name: '四川省', value: 874.2, growth: 10.4 },
    { name: '河南省', value: 812.6, growth: 9.6 },
    { name: '湖北省', value: 746.3, growth: 8.7 },
    { name: '北京市', value: 698.1, growth: 8.1 },
    { name: '安徽省', value: 612.4, growth: 6.4 },
  ],
  apply: [
    { name: '广东省', value: 62480, growth: 28.2 },
    { name: '浙江省', value: 48620, growth: 21.6 },
    { name: '江苏省', value: 45210, growth: 17.9 },
    { name: '山东省', value: 31860, growth: 14.2 },
    { name: '河南省', value: 27440, growth: 12.8 },
    { name: '四川省', value: 24110, growth: 11.5 },
    { name: '福建省', value: 20680, growth: 9.4 },
    { name: '湖北省', value: 18920, growth: 8.6 },
    { name: '安徽省', value: 16450, growth: 7.2 },
    { name: '湖南省', value: 15280, growth: 6.1 },
  ],
}

export const getRank = (metric: InsightMetric): RankItem[] => {
  const rows = rankSource[metric]
  const max = Math.max(...rows.map((row) => row.value))
  return rows.map((row) => ({
    ...row,
    percent: Math.round((row.value / max) * 1000) / 10,
  }))
}

export const formatMetricValue = (metric: InsightMetric, value: number) => {
  if (metric === 'fund') {
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
  }
  return Math.round(value).toLocaleString('zh-CN')
}

const spark = (seed: number) =>
  Array.from({ length: 10 }, (_, index) =>
    Math.round(seed * (0.55 + index * 0.05) + Math.sin(index + seed) * 18),
  )

export const industries: IndustryCard[] = [
  {
    key: 'manufacture',
    name: '先进制造业',
    count: 298562,
    growth: 26.8,
    spark: spark(80),
    color: '#3b82f6',
  },
  {
    key: 'electronics',
    name: '电子信息',
    count: 236851,
    growth: 18.4,
    spark: spark(68),
    color: '#22d3ee',
  },
  {
    key: 'bio',
    name: '生物医药',
    count: 182369,
    growth: 16.2,
    spark: spark(54),
    color: '#34d399',
  },
  {
    key: 'energy',
    name: '新能源',
    count: 126524,
    growth: 12.6,
    spark: spark(42),
    color: '#fb923c',
  },
  {
    key: 'material',
    name: '新材料',
    count: 98362,
    growth: 11.3,
    spark: spark(36),
    color: '#a78bfa',
  },
  {
    key: 'agri',
    name: '现代农业',
    count: 72681,
    growth: 9.8,
    spark: spark(28),
    color: '#f472b6',
  },
]

export const moreIndustries: IndustryCard[] = [
  {
    key: 'ai',
    name: '人工智能',
    count: 86420,
    growth: 31.4,
    spark: spark(48),
    color: '#3b82f6',
  },
  {
    key: 'equipment',
    name: '高端装备',
    count: 74218,
    growth: 14.6,
    spark: spark(40),
    color: '#22d3ee',
  },
  {
    key: 'green',
    name: '节能环保',
    count: 61840,
    growth: 10.2,
    spark: spark(32),
    color: '#34d399',
  },
  {
    key: 'digital',
    name: '数字经济',
    count: 95360,
    growth: 22.7,
    spark: spark(52),
    color: '#6366f1',
  },
  {
    key: 'health',
    name: '大健康',
    count: 48720,
    growth: 8.9,
    spark: spark(26),
    color: '#fb923c',
  },
  {
    key: 'culture',
    name: '文化旅游',
    count: 36510,
    growth: 6.4,
    spark: spark(22),
    color: '#a78bfa',
  },
]

const breakdown = (
  name: string,
  base: number,
  color: string,
): IndustryCard[] => [
  {
    key: `${name}-core`,
    name: `${name} · 核心`,
    count: Math.round(base * 0.34),
    growth: 24.6,
    spark: spark(base / 4000),
    color,
  },
  {
    key: `${name}-apply`,
    name: `${name} · 应用`,
    count: Math.round(base * 0.27),
    growth: 18.2,
    spark: spark(base / 4600),
    color: '#22d3ee',
  },
  {
    key: `${name}-park`,
    name: `${name} · 园区`,
    count: Math.round(base * 0.16),
    growth: 12.4,
    spark: spark(base / 5200),
    color: '#34d399',
  },
  {
    key: `${name}-talent`,
    name: `${name} · 人才`,
    count: Math.round(base * 0.11),
    growth: 15.8,
    spark: spark(base / 5800),
    color: '#fb923c',
  },
  {
    key: `${name}-fund`,
    name: `${name} · 资金`,
    count: Math.round(base * 0.08),
    growth: 9.6,
    spark: spark(base / 6400),
    color: '#a78bfa',
  },
  {
    key: `${name}-other`,
    name: `${name} · 其他`,
    count: Math.round(base * 0.04),
    growth: 6.1,
    spark: spark(base / 7200),
    color: '#94a3b8',
  },
]

export const industryTabs = [
  { label: '全部', value: 'all' },
  ...industries.map((item) => ({ label: item.name, value: item.key })),
  { label: '更多', value: 'more' },
]

export const getIndustryCards = (tab: string): IndustryCard[] => {
  if (tab === 'more') return moreIndustries
  const current = industries.find((item) => item.key === tab)
  if (!current) return industries
  return breakdown(current.name, current.count, current.color)
}

/** 趋势图上方的汇总数字，近 30 天对齐设计稿 */
export const trendHeadline: Record<
  TrendRange,
  {
    publish: number
    publishGrowth: number
    apply: number
    applyGrowth: number
  }
> = {
  '7d': { publish: 1864, publishGrowth: 8.6, apply: 9240, applyGrowth: 11.4 },
  '30d': {
    publish: 2468,
    publishGrowth: 12.5,
    apply: 386502,
    applyGrowth: 24.3,
  },
  '12m': {
    publish: 126480,
    publishGrowth: 16.8,
    apply: 986240,
    applyGrowth: 21.2,
  },
}

export const mapOverview = [
  { key: 'province', value: '31', unit: '个', label: '省级单位' },
  { key: 'city', value: '337', unit: '个', label: '地市级单位' },
  { key: 'served', value: '12,862', unit: '家', label: '服务企业' },
] as const

export const applyStatuses = [
  {
    key: 'reviewing',
    label: '审核中',
    percent: 99.2,
    count: 2682,
    color: '#3b82f6',
  },
  {
    key: 'passed',
    label: '审核通过',
    percent: 98.6,
    count: 368421,
    color: '#34d399',
  },
  {
    key: 'returned',
    label: '审核退回',
    percent: 1.2,
    count: 4681,
    color: '#fb923c',
  },
  {
    key: 'supplement',
    label: '补充材料',
    percent: 0.6,
    count: 2093,
    color: '#f472b6',
  },
] as const

export const keyIndustries = [
  { name: '高新技术企业', policy: 298562, fund: 1862.4 },
  { name: '先进制造业', policy: 236851, fund: 1540.2 },
  { name: '新能源', policy: 182369, fund: 1288.6 },
  { name: '电子信息', policy: 126524, fund: 986.3 },
  { name: '生物医药', policy: 98362, fund: 742.8 },
  { name: '现代农业', policy: 72681, fund: 486.5 },
  { name: '现代服务业', policy: 53604, fund: 368.2 },
] as const

export type FundPoint = {
  label: string
  amount: number
  growth: number
}

const fundTrendByRange: Record<TrendRange, FundPoint[]> = {
  '7d': [
    { label: '10.17', amount: 186, growth: 12.4 },
    { label: '10.18', amount: 210, growth: 14.1 },
    { label: '10.19', amount: 198, growth: 11.6 },
    { label: '10.20', amount: 246, growth: 18.2 },
    { label: '10.21', amount: 268, growth: 21.4 },
    { label: '10.22', amount: 252, growth: 19.8 },
    { label: '10.23', amount: 286, growth: 24.6 },
  ],
  '30d': [
    { label: '09.24', amount: 420, growth: 14.2 },
    { label: '09.28', amount: 386, growth: 11.8 },
    { label: '10.02', amount: 512, growth: 16.4 },
    { label: '10.06', amount: 640, growth: 22.1 },
    { label: '10.10', amount: 718, growth: 20.6 },
    { label: '10.14', amount: 806, growth: 26.4 },
    { label: '10.18', amount: 924, growth: 31.2 },
    { label: '10.22', amount: 1012, growth: 28.6 },
  ],
  '12m': [
    { label: '1月', amount: 420, growth: 16 },
    { label: '2月', amount: 360, growth: 12 },
    { label: '3月', amount: 510, growth: 18 },
    { label: '4月', amount: 640, growth: 22 },
    { label: '5月', amount: 700, growth: 19 },
    { label: '6月', amount: 760, growth: 24 },
    { label: '7月', amount: 820, growth: 28 },
    { label: '8月', amount: 880, growth: 26 },
    { label: '9月', amount: 960, growth: 32 },
    { label: '10月', amount: 1040, growth: 36 },
    { label: '11月', amount: 980, growth: 34 },
    { label: '12月', amount: 1120, growth: 30 },
  ],
}

export const getFundTrend = (range: TrendRange) => fundTrendByRange[range]

export const feedTabs = [
  '全部',
  '资金支持',
  '税收优惠',
  '人才政策',
  '项目申报',
] as const

export type PolicyFeedItem = {
  id: string
  category: string
  title: string
  time: string
  color: string
}

export const policyFeed: PolicyFeedItem[] = [
  {
    id: 'hnte',
    category: '资金支持',
    title: '2024年国家高新技术企业认定申报通知',
    time: '10-24 15:21',
    color: '#3b82f6',
  },
  {
    id: 'henan-digital',
    category: '项目申报',
    title: '河南省制造业数字化转型专项资金申报指南',
    time: '10-24 14:32',
    color: '#14b8a6',
  },
  {
    id: 'rd-deduction',
    category: '税收优惠',
    title: '关于进一步加大研发费用加计扣除政策支持力度的通知',
    time: '10-24 14:18',
    color: '#fb923c',
  },
  {
    id: 'beijing-talent',
    category: '人才政策',
    title: '北京市高层次人才引进支持申报指南',
    time: '10-24 13:42',
    color: '#a78bfa',
  },
  {
    id: 'shenzhen-sme',
    category: '产业扶持',
    title: '深圳市专精特新中小企业扶持项目申报指南',
    time: '10-24 11:03',
    color: '#f472b6',
  },
  {
    id: 'fund-device',
    category: '资金支持',
    title: '重大技术装备保险补偿资金申报指引',
    time: '10-23 17:06',
    color: '#3b82f6',
  },
  {
    id: 'tax-small',
    category: '税收优惠',
    title: '小型微利企业所得税优惠政策延续公告',
    time: '10-23 15:40',
    color: '#fb923c',
  },
  {
    id: 'talent-henan',
    category: '人才政策',
    title: '中原英才计划创新领军人才项目开始申报',
    time: '10-23 11:18',
    color: '#a78bfa',
  },
  {
    id: 'apply-green',
    category: '项目申报',
    title: '绿色工厂梯度培育项目开始征集',
    time: '10-22 16:27',
    color: '#14b8a6',
  },
]
