export type InvestProjectType =
  | 'all'
  | 'filing-public'
  | 'approval-pre'
  | 'approval-announce'
  | 'review-pre'
  | 'review-announce'
  | 'energy'

export type InvestResult = 'passed' | 'rejected'

export interface InvestRegion {
  key: string
  label: string
  count: number
}

export interface InvestTypeTab {
  key: InvestProjectType
  label: string
}

export interface InvestProject {
  id: number
  code: string
  name: string
  approvalUnit: string
  result: InvestResult
  approvalDate: string
  recordUnit: string
  region: string
  type: Exclude<InvestProjectType, 'all'>
}

export const investRegions: InvestRegion[] = [
  { key: 'national', label: '全国', count: 378 },
  { key: 'henan', label: '河南', count: 1890 },
  { key: 'guangdong', label: '广东', count: 10688 },
  { key: 'beijing', label: '北京', count: 6191 },
  { key: 'zhejiang', label: '浙江', count: 4340 },
  { key: 'jiangsu', label: '江苏', count: 4124 },
]

export const investTypeTabs: InvestTypeTab[] = [
  { key: 'all', label: '全部' },
  { key: 'filing-public', label: '备案项目公开' },
  { key: 'approval-pre', label: '核准前公示' },
  { key: 'approval-announce', label: '核准项目公告' },
  { key: 'review-pre', label: '审批前公示' },
  { key: 'review-announce', label: '审批项目公告' },
  { key: 'energy', label: '项目节能审查公示' },
]

const areaCode: Record<string, string> = {
  henan: '410105',
  guangdong: '441424',
  beijing: '110101',
  zhejiang: '330106',
  jiangsu: '320102',
}

const seeds: Array<Omit<InvestProject, 'id' | 'code'> & { seq: number }> = [
  {
    seq: 1,
    region: 'henan',
    type: 'filing-public',
    name: '河南中原新材料有限公司年产20万吨高性能复合材料项目',
    approvalUnit: '郑州市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-08-03',
    recordUnit: '河南中原新材料有限公司',
  },
  {
    seq: 2,
    region: 'henan',
    type: 'approval-announce',
    name: '郑州航空港区智能装备制造基地建设项目',
    approvalUnit: '河南省发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-08-02',
    recordUnit: '郑州航空港智能装备有限公司',
  },
  {
    seq: 3,
    region: 'henan',
    type: 'review-announce',
    name: '洛阳钼业选矿节能技术改造项目',
    approvalUnit: '洛阳市发展和改革委员会',
    result: 'rejected',
    approvalDate: '2026-07-16',
    recordUnit: '洛阳钼业集团股份有限公司',
  },
  {
    seq: 4,
    region: 'henan',
    type: 'energy',
    name: '许昌新能源电池材料循环经济产业园项目',
    approvalUnit: '许昌市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-15',
    recordUnit: '许昌绿色能源科技有限公司',
  },
  {
    seq: 5,
    region: 'henan',
    type: 'filing-public',
    name: '开封汴西新区冷链物流仓储中心项目',
    approvalUnit: '开封市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-08',
    recordUnit: '开封通达冷链物流有限公司',
  },
  {
    seq: 6,
    region: 'henan',
    type: 'review-pre',
    name: '南阳光电显示模组生产线扩建项目',
    approvalUnit: '南阳市发展和改革委员会',
    result: 'rejected',
    approvalDate: '2026-07-07',
    recordUnit: '南阳光电科技有限公司',
  },
  {
    seq: 7,
    region: 'henan',
    type: 'approval-pre',
    name: '新乡生物医药产业园一期工程',
    approvalUnit: '新乡市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-03',
    recordUnit: '新乡生物医药发展有限公司',
  },
  {
    seq: 8,
    region: 'henan',
    type: 'filing-public',
    name: '安阳钢铁超低排放升级改造项目',
    approvalUnit: '安阳市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-06-28',
    recordUnit: '安阳钢铁股份有限公司',
  },
  {
    seq: 9,
    region: 'henan',
    type: 'review-announce',
    name: '焦作碳基新材料研发生产基地项目',
    approvalUnit: '焦作市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-06-21',
    recordUnit: '焦作碳谷新材料有限公司',
  },
  {
    seq: 10,
    region: 'guangdong',
    type: 'filing-public',
    name: '广东某精密电子有限公司高端封装测试生产线项目',
    approvalUnit: '东莞市发展和改革局',
    result: 'passed',
    approvalDate: '2026-08-03',
    recordUnit: '广东某精密电子有限公司',
  },
  {
    seq: 11,
    region: 'guangdong',
    type: 'approval-announce',
    name: '深圳前海跨境电商智慧仓配一体化项目',
    approvalUnit: '深圳市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-08-02',
    recordUnit: '深圳前海通达供应链有限公司',
  },
  {
    seq: 12,
    region: 'guangdong',
    type: 'energy',
    name: '佛山陶瓷产业节能窑炉改造项目',
    approvalUnit: '佛山市发展和改革局',
    result: 'rejected',
    approvalDate: '2026-07-16',
    recordUnit: '佛山南庄陶瓷集团有限公司',
  },
  {
    seq: 13,
    region: 'guangdong',
    type: 'review-announce',
    name: '珠海海洋工程装备制造基地项目',
    approvalUnit: '珠海市发展和改革局',
    result: 'passed',
    approvalDate: '2026-07-15',
    recordUnit: '珠海海工装备有限公司',
  },
  {
    seq: 14,
    region: 'guangdong',
    type: 'filing-public',
    name: '惠州锂电隔膜材料扩产项目',
    approvalUnit: '惠州市发展和改革局',
    result: 'passed',
    approvalDate: '2026-07-08',
    recordUnit: '惠州新能源材料有限公司',
  },
  {
    seq: 15,
    region: 'beijing',
    type: 'review-pre',
    name: '北京亦庄集成电路先进封装中试线项目',
    approvalUnit: '北京市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-22',
    recordUnit: '北京亦庄微电子科技有限公司',
  },
  {
    seq: 16,
    region: 'beijing',
    type: 'approval-announce',
    name: '中关村人工智能算力中心二期项目',
    approvalUnit: '海淀区发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-11',
    recordUnit: '北京智算科技有限公司',
  },
  {
    seq: 17,
    region: 'beijing',
    type: 'energy',
    name: '北京城市副中心绿色数据中心节能审查项目',
    approvalUnit: '通州区发展和改革委员会',
    result: 'rejected',
    approvalDate: '2026-06-30',
    recordUnit: '北京绿云数据有限公司',
  },
  {
    seq: 18,
    region: 'zhejiang',
    type: 'filing-public',
    name: '杭州未来科技城工业软件研发总部项目',
    approvalUnit: '杭州市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-08-01',
    recordUnit: '杭州云智软件有限公司',
  },
  {
    seq: 19,
    region: 'zhejiang',
    type: 'approval-pre',
    name: '宁波前湾新区新能源汽车零部件项目',
    approvalUnit: '宁波市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-18',
    recordUnit: '宁波湾区汽配有限公司',
  },
  {
    seq: 20,
    region: 'zhejiang',
    type: 'review-announce',
    name: '嘉兴光伏组件智能制造工厂项目',
    approvalUnit: '嘉兴市发展和改革委员会',
    result: 'rejected',
    approvalDate: '2026-07-05',
    recordUnit: '嘉兴光能科技有限公司',
  },
  {
    seq: 21,
    region: 'jiangsu',
    type: 'filing-public',
    name: '苏州工业园区生物医药中试及产业化项目',
    approvalUnit: '苏州市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-29',
    recordUnit: '苏州生物医药产业园发展有限公司',
  },
  {
    seq: 22,
    region: 'jiangsu',
    type: 'approval-announce',
    name: '南京江北新区新型显示材料项目',
    approvalUnit: '南京市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-07-14',
    recordUnit: '南京新显材料科技有限公司',
  },
  {
    seq: 23,
    region: 'jiangsu',
    type: 'energy',
    name: '无锡集成电路洁净厂房节能审查项目',
    approvalUnit: '无锡市发展和改革委员会',
    result: 'passed',
    approvalDate: '2026-06-26',
    recordUnit: '无锡微纳半导体有限公司',
  },
  {
    seq: 24,
    region: 'jiangsu',
    type: 'review-pre',
    name: '常州动力电池回收利用示范项目',
    approvalUnit: '常州市发展和改革委员会',
    result: 'rejected',
    approvalDate: '2026-06-19',
    recordUnit: '常州循环科技有限公司',
  },
]

export const mockInvestProjects: InvestProject[] = seeds.map((item, index) => ({
  id: index + 1,
  code: `2608-${areaCode[item.region]}-04-01-${String(100000000000 + item.seq).slice(-12)}`,
  name: item.name,
  approvalUnit: item.approvalUnit,
  result: item.result,
  approvalDate: item.approvalDate,
  recordUnit: item.recordUnit,
  region: item.region,
  type: item.type,
}))

export const investEnterpriseTotal = 5130511
