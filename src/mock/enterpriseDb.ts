export type EnterpriseStatus = 'active' | 'revoked' | 'cancelled'

export interface EnterpriseItem {
  id: number
  name: string
  status: EnterpriseStatus
  province: string
  city: string
  policyCount: number
  tags: string[]
  address: string
  businessIndustry: string
  industry: string
}

export const enterpriseTotal = 5_130_511

export const enterpriseStatusText: Record<EnterpriseStatus, string> = {
  active: '存续',
  revoked: '吊销',
  cancelled: '注销',
}

export const enterpriseProvinces = [
  '北京市',
  '天津市',
  '河北省',
  '山西省',
  '内蒙古自治区',
  '辽宁省',
  '吉林省',
  '黑龙江省',
  '上海市',
  '江苏省',
  '浙江省',
  '安徽省',
  '福建省',
  '江西省',
  '山东省',
  '河南省',
  '湖北省',
  '湖南省',
  '广东省',
  '广西壮族自治区',
  '海南省',
  '重庆市',
  '四川省',
  '贵州省',
  '云南省',
  '西藏自治区',
  '陕西省',
  '甘肃省',
  '青海省',
  '宁夏回族自治区',
  '新疆维吾尔自治区',
  '台湾省',
  '香港特别行政区',
  '澳门特别行政区',
]

export const enterpriseIndustries = [
  '采矿业',
  '房地产业',
  '建筑业',
  '电力、热力、燃气及水生产和供应业',
  '交通运输、仓储和邮政业',
  '教育',
  '金融业',
  '居民服务、修理和其他服务业',
  '科学研究和技术服务业',
  '农、林、牧、渔业',
  '批发和零售业',
  '水利、环境和公共设施管理业',
  '卫生和社会工作',
  '文化、体育和娱乐业',
  '信息传输、软件和信息技术服务业',
  '制造业',
  '住宿和餐饮业',
  '租赁和商务服务业',
  '综合',
]

const seeds: Array<Omit<EnterpriseItem, 'id'>> = [
  {
    name: '郑州源创基因科技有限公司',
    status: 'active',
    province: '河南省',
    city: '郑州市',
    policyCount: 64,
    tags: ['药品制剂', '包装材料与制品', '软件开发与信息技术服务'],
    address: '郑州航空港经济综合实验区华夏大道与扬州港路交叉口创业中心C座4层',
    businessIndustry: '研究和试验发展',
    industry: '信息传输、软件和信息技术服务业',
  },
  {
    name: '郑州芯联电子科技有限公司',
    status: 'active',
    province: '河南省',
    city: '郑州市',
    policyCount: 8,
    tags: ['集成电路', '电子元器件'],
    address: '郑州市高新技术产业开发区长椿路11号',
    businessIndustry: '计算机、通信和其他电子设备制造业',
    industry: '制造业',
  },
  {
    name: '郑州云智软件科技有限公司',
    status: 'active',
    province: '河南省',
    city: '郑州市',
    policyCount: 9,
    tags: ['工业软件', '云计算'],
    address: '郑州市金水区杨金路牛顿国际A座',
    businessIndustry: '软件和信息技术服务业',
    industry: '信息传输、软件和信息技术服务业',
  },
  {
    name: '河南瑞渊卡电子有限公司',
    status: 'active',
    province: '河南省',
    city: '许昌市',
    policyCount: 6,
    tags: ['智能终端', '电子信息'],
    address: '许昌市魏都区新兴路产业园8号',
    businessIndustry: '计算机、通信和其他电子设备制造业',
    industry: '制造业',
  },
  {
    name: '洛阳先进材料研究院有限公司',
    status: 'active',
    province: '河南省',
    city: '洛阳市',
    policyCount: 6,
    tags: ['新材料', '科研服务'],
    address: '洛阳市洛龙区开元大道与关林路交叉口',
    businessIndustry: '研究和试验发展',
    industry: '科学研究和技术服务业',
  },
  {
    name: '新乡生物医药有限公司',
    status: 'active',
    province: '河南省',
    city: '新乡市',
    policyCount: 4,
    tags: ['生物医药', '药品制剂'],
    address: '新乡市平原示范区生命科学园',
    businessIndustry: '医药制造业',
    industry: '制造业',
  },
  {
    name: '北京智算科技有限公司',
    status: 'active',
    province: '北京市',
    city: '北京市',
    policyCount: 12,
    tags: ['人工智能', '算力服务'],
    address: '北京市海淀区中关村东路1号',
    businessIndustry: '软件和信息技术服务业',
    industry: '信息传输、软件和信息技术服务业',
  },
  {
    name: '深圳前海通达供应链有限公司',
    status: 'active',
    province: '广东省',
    city: '深圳市',
    policyCount: 3,
    tags: ['现代物流', '跨境电商'],
    address: '深圳市前海深港合作区梦海大道5033号',
    businessIndustry: '多式联运和运输代理业',
    industry: '交通运输、仓储和邮政业',
  },
  {
    name: '杭州云智软件有限公司',
    status: 'active',
    province: '浙江省',
    city: '杭州市',
    policyCount: 5,
    tags: ['工业软件', '数字化转型'],
    address: '杭州市余杭区文一西路1818号',
    businessIndustry: '软件和信息技术服务业',
    industry: '信息传输、软件和信息技术服务业',
  },
]

export const mockEnterprises: EnterpriseItem[] = seeds.map((item, index) => ({
  id: index + 1,
  ...item,
}))

export type HonorTone = 'blue' | 'orange'

export interface EnterpriseHonorTag {
  text: string
  tone: HonorTone
}

export interface EnterprisePolicyRecord {
  id: number
  policyId: number
  name: string
  grade: string
  amount: string
  remark: string
  year: number
  department: string
}

export interface EnterprisePatent {
  id: number
  name: string
  applyDate: string
  applyNo: string
  publishDate: string
  publishNo: string
  legalStatus: string
  patentType: string
}

export interface EnterpriseTrademark {
  id: number
  mark: string
  name: string
  applyDate: string
  registerNo: string
  intlClass: string
  status: string
}

export interface EnterpriseSoftwareCopyright {
  id: number
  fullName: string
  shortName: string
  approveDate: string
  registerNo: string
  classNo: string
  version: string
  firstPublishDate: string
}

export interface EnterpriseWorkCopyright {
  id: number
  fullName: string
  registerNo: string
  category: string
  completeDate: string
  registerDate: string
  firstPublishDate: string
}

export interface EnterpriseQualification {
  id: number
  category: string
  name: string
  certNo: string
  issueDate: string
  validUntil: string
  year: number
}

export interface EnterpriseQualPersonnel {
  id: number
  name: string
  certNo: string
  issueDate: string
  expireDate: string
  status: string
  issuer: string
  year: number
}

export interface EnterpriseQualReview {
  id: number
  matter: string
  decision: string
  reason: string
  announceDate: string
  year: number
}

export const enterpriseQualYears = [2026, 2025, 2024, 2023, 2022, 2021]

export interface EnterpriseContact {
  id: number
  name: string
  title: string
  phone: string
  email: string
}

export type ProductIconKind =
  | 'pharma'
  | 'packaging'
  | 'software'
  | 'electronics'
  | 'material'
  | 'logistics'
  | 'ai'
  | 'research'
  | 'default'

export type ProductCredibility = '高' | '中' | '低'

export interface EnterpriseProduct {
  id: number
  name: string
  icon: ProductIconKind
}

export interface EnterpriseIndustryChain {
  id: number
  levels: string[]
}

export interface EnterpriseBusinessInfo {
  registrationNumber: string
  organizationCode: string
  registrationAuthority: string
  businessTerm: string
  approvalDate: string
  insuredCount: number
  formerName: string
  registeredAddress: string
  addressChangeDate: string
}

export interface EnterpriseDetail extends EnterpriseItem {
  shortName: string
  district: string
  staffCount: number
  honorTags: EnterpriseHonorTag[]
  publicityAmount: number
  legalRep: string
  registeredCapital: string
  creditCode: string
  enterpriseType: string
  phone: string
  email: string
  foundedDate: string
  staffScale: string
  website: string
  businessScope: string
  businessInfo: EnterpriseBusinessInfo
  policyRecords: EnterprisePolicyRecord[]
  patents: EnterprisePatent[]
  trademarks: EnterpriseTrademark[]
  softwareCopyrights: EnterpriseSoftwareCopyright[]
  workCopyrights: EnterpriseWorkCopyright[]
  qualifications: EnterpriseQualification[]
  qualificationPersonnel: EnterpriseQualPersonnel[]
  qualificationReviews: EnterpriseQualReview[]
  contacts: EnterpriseContact[]
  products: EnterpriseProduct[]
  industryChains: EnterpriseIndustryChain[]
  productBasis: string
  productCredibility: ProductCredibility
}

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

const POLICY_RECORD_SEEDS: Array<Omit<EnterprisePolicyRecord, 'id' | 'year'>> =
  [
    {
      policyId: 10,
      name: '中央引导地方科技发展专项（河南省补贴）',
      grade: '河南省',
      amount: '15',
      remark: '2024年度中央引导地方科技发展资金拟支持项目公示',
      department: '科学技术厅',
    },
    {
      policyId: 10,
      name: '中央引导地方科技发展专项资金',
      grade: '河南省',
      amount: '60',
      remark: '中央引导地方科技发展专项资金支持项目',
      department: '科学技术厅',
    },
    {
      policyId: 10,
      name: '中央引导地方科技发展专项资金',
      grade: '河南省',
      amount: '10',
      remark: '中央引导地方科技发展专项资金支持项目',
      department: '科学技术厅',
    },
    {
      policyId: 10,
      name: '中央引导地方科技发展专项资金',
      grade: '河南省',
      amount: '—',
      remark: '中央引导地方科技发展专项资金支持项目',
      department: '科学技术厅',
    },
    {
      policyId: 1,
      name: '郑州市工程研究中心',
      grade: '郑州市',
      amount: '10',
      remark: '郑州市工程研究中心认定及建设补助',
      department: '科学技术局',
    },
    {
      policyId: 1,
      name: '郑州市工程研究中心',
      grade: '郑州市',
      amount: '—',
      remark: '郑州市工程研究中心认定及建设补助',
      department: '科学技术局',
    },
    {
      policyId: 2,
      name: '郑州市科技型企业',
      grade: '郑州市',
      amount: '15',
      remark: '郑州市科技型企业认定奖励',
      department: '科学技术局',
    },
    {
      policyId: 6,
      name: '郑州市高新技术企业认定奖励',
      grade: '郑州市',
      amount: '20',
      remark: '高新技术企业认定后补助',
      department: '科学技术局',
    },
    {
      policyId: 7,
      name: '郑州市专精特新中小企业培育',
      grade: '郑州市',
      amount: '30',
      remark: '专精特新中小企业培育专项',
      department: '工业和信息化局',
    },
  ]

const PATENT_NAME_SEEDS = [
  '一种干细胞诱导分化方法及其应用',
  '一种核酸检测试剂盒及检测方法',
  '一种基因编辑载体及其构建方法',
  '一种细胞培养装置',
  '一种蛋白质纯化工艺',
  '一种生物样本保存容器',
  '一种高通量基因测序方法',
  '一种细胞分选芯片',
  '一种重组蛋白表达系统',
  '一种免疫组化检测试剂',
  '一种微流控反应装置',
  '一种核酸提取试剂盒',
]

const PATENT_TYPES = ['发明专利', '实用新型', '外观设计'] as const
const PATENT_STATUSES = [
  '专利权维持',
  '实质审查的生效',
  '专利权终止',
  '驳回失效',
]

const TRADEMARK_SEEDS = [
  { mark: '源创', name: '源创基因', intlClass: '第5类' },
  { mark: 'YUANCHUANG', name: 'YUANCHUANG', intlClass: '第42类' },
  { mark: '源创基因', name: '源创基因', intlClass: '第44类' },
  { mark: 'YCGene', name: 'YCGene', intlClass: '第10类' },
  { mark: '源创生物', name: '源创生物', intlClass: '第5类' },
  { mark: 'CELLORIGIN', name: 'CELLORIGIN', intlClass: '第42类' },
]

const TRADEMARK_STATUSES = [
  '注册公告',
  '等待实质审查',
  '商标注册申请完成',
  '等待驳回通知发文',
]

const SOFTWARE_SEEDS = [
  { fullName: '源创基因实验室信息管理系统', shortName: 'LIMS系统' },
  { fullName: '源创基因数据分析软件', shortName: '基因分析软件' },
  { fullName: '源创细胞培养过程监控系统', shortName: '培养监控系统' },
  { fullName: '源创生物样本库管理系统', shortName: '样本库系统' },
  { fullName: '源创基因检测报告生成系统', shortName: '报告生成系统' },
  { fullName: '源创高通量测序数据质控软件', shortName: '测序质控软件' },
]

const WORK_SEEDS = [
  { fullName: '商标', category: '美术' },
  { fullName: '细胞分裂图', category: '美术' },
  { fullName: '原图', category: '美术' },
]

const QUAL_CERT_SEEDS = [
  {
    category: '食药资质/国产医疗器械产品（备案）',
    name: '证书名称文案',
    certNo: '豫港械备20240546',
  },
  {
    category: '管理体系认证/质量管理体系认证 (ISO9001)',
    name: '证书名称文案',
    certNo: '05324Q32813R0S',
  },
  {
    category: '化妆品资质/国产非特殊用途化妆品备案信息',
    name: '证书名称文案',
    certNo: '豫G妆网备字2024001287',
  },
]

const QUAL_PERSON_NAMES = ['张三丰', '赵燕', '昭子裙'] as const

const QUAL_PLACEHOLDER_DATE = '2024-10-15'

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

const buildPolicyRecords = (item: EnterpriseItem): EnterprisePolicyRecord[] => {
  const count = item.policyCount
  return Array.from({ length: count }, (_, index) => {
    const seed =
      POLICY_RECORD_SEEDS[index % POLICY_RECORD_SEEDS.length] ??
      POLICY_RECORD_SEEDS[0]!
    return {
      ...seed,
      id: item.id * 1000 + index + 1,
      year: 2026 - (index % 3 === 0 ? 0 : index % 2),
    }
  })
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

const buildPatents = (
  item: EnterpriseItem,
  count: number,
): EnterprisePatent[] =>
  Array.from({ length: count }, (_, index) => {
    const year = 2024 - (index % 4)
    const seq = String(100000 + item.id * 137 + index).slice(-6)
    const seed =
      PATENT_NAME_SEEDS[index % PATENT_NAME_SEEDS.length] ??
      PATENT_NAME_SEEDS[0]!
    return {
      id: item.id * 10000 + index + 1,
      name: index < PATENT_NAME_SEEDS.length ? seed : `${seed}（${index + 1}）`,
      applyDate: padDate(year, (index % 12) + 1, (index % 27) + 1),
      applyNo: `CN${year}${seq}.${(index % 9) + 1}`,
      publishDate: padDate(year + (index % 2), ((index + 6) % 12) + 1, 15),
      publishNo: `CN${118 + (index % 10)}${seq}${index % 3 === 1 ? 'U' : 'A'}`,
      legalStatus:
        PATENT_STATUSES[index % PATENT_STATUSES.length] ?? '专利权维持',
      patentType: PATENT_TYPES[index % PATENT_TYPES.length] ?? '发明专利',
    }
  })

const buildTrademarks = (
  item: EnterpriseItem,
  count: number,
): EnterpriseTrademark[] =>
  Array.from({ length: count }, (_, index) => {
    const seed =
      TRADEMARK_SEEDS[index % TRADEMARK_SEEDS.length] ?? TRADEMARK_SEEDS[0]!
    const year = 2023 - (index % 5)
    return {
      id: item.id * 20000 + index + 1,
      mark: seed.mark,
      name: seed.name,
      applyDate: padDate(year, (index % 12) + 1, ((index * 3) % 27) + 1),
      registerNo: String(40_000_000 + item.id * 1000 + index),
      intlClass: seed.intlClass,
      status:
        TRADEMARK_STATUSES[index % TRADEMARK_STATUSES.length] ?? '注册公告',
    }
  })

const buildSoftwareCopyrights = (
  item: EnterpriseItem,
  count: number,
): EnterpriseSoftwareCopyright[] =>
  Array.from({ length: count }, (_, index) => {
    const seed =
      SOFTWARE_SEEDS[index % SOFTWARE_SEEDS.length] ?? SOFTWARE_SEEDS[0]!
    const year = 2024 - (index % 3)
    const seq = String(1000000 + item.id * 80 + index).slice(-7)
    return {
      id: item.id * 30000 + index + 1,
      fullName:
        index < SOFTWARE_SEEDS.length
          ? seed.fullName
          : `${seed.fullName}V${index + 1}`,
      shortName: seed.shortName,
      approveDate: padDate(year, ((index + 2) % 12) + 1, 18),
      registerNo: `${year}SR${seq}`,
      classNo: `${30000 + (index % 9) * 100}-0000`,
      version: `V${1 + (index % 3)}.${index % 2}`,
      firstPublishDate:
        index % 7 === 0 ? '未发表' : padDate(year - 1, (index % 12) + 1, 10),
    }
  })

const buildWorkCopyrights = (
  item: EnterpriseItem,
  count: number,
): EnterpriseWorkCopyright[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = WORK_SEEDS[index % WORK_SEEDS.length] ?? WORK_SEEDS[0]!
    const year = 2022 + (index % 3)
    return {
      id: item.id * 40000 + index + 1,
      fullName: seed.fullName,
      registerNo: `国作登字-202${year % 10}-F-${String(10000000 + item.id * 10 + index).slice(-8)}`,
      category: seed.category,
      completeDate: padDate(year, (index % 12) + 1, 8),
      registerDate: padDate(year, ((index + 3) % 12) + 1, 20),
      firstPublishDate: padDate(year, ((index + 1) % 12) + 1, 12),
    }
  })

const buildQualifications = (
  item: EnterpriseItem,
): EnterpriseQualification[] => {
  const count = item.id === 1 ? 31 : Math.min(8, item.tags.length + 3)
  return Array.from({ length: count }, (_, index) => {
    const seed =
      QUAL_CERT_SEEDS[index % QUAL_CERT_SEEDS.length] ?? QUAL_CERT_SEEDS[0]!
    return {
      id: item.id * 100 + index + 1,
      category: seed.category,
      name: seed.name,
      certNo: seed.certNo,
      issueDate: QUAL_PLACEHOLDER_DATE,
      validUntil: QUAL_PLACEHOLDER_DATE,
      year: 2024,
    }
  })
}

const buildQualPersonnel = (
  item: EnterpriseItem,
): EnterpriseQualPersonnel[] => {
  const count = item.id === 1 ? 208 : Math.min(6, Math.max(2, item.policyCount))
  return Array.from({ length: count }, (_, index) => {
    const seed =
      QUAL_CERT_SEEDS[index % QUAL_CERT_SEEDS.length] ?? QUAL_CERT_SEEDS[0]!
    return {
      id: item.id * 500 + index + 1,
      name: QUAL_PERSON_NAMES[index % QUAL_PERSON_NAMES.length] ?? '张三丰',
      certNo: seed.certNo,
      issueDate: QUAL_PLACEHOLDER_DATE,
      expireDate: QUAL_PLACEHOLDER_DATE,
      status: '证书有效',
      issuer: '郑州市科学文化局',
      year: 2024,
    }
  })
}

const buildQualReviews = (item: EnterpriseItem): EnterpriseQualReview[] => {
  if (item.id === 1) return []
  return [
    {
      id: item.id * 600 + 1,
      matter: '质量管理体系认证申请',
      decision: '准予许可',
      reason: '申请材料齐全，符合法定条件',
      announceDate: QUAL_PLACEHOLDER_DATE,
      year: 2024,
    },
  ]
}

const CONTACT_ROLES = [
  { name: '李四', title: '法人' },
  { name: '张三', title: '总经理' },
  { name: '王五', title: '财务负责人' },
  { name: '赵六', title: '技术负责人' },
]

const buildContacts = (item: EnterpriseItem): EnterpriseContact[] => {
  const legal = LEGAL_REPS[(item.id - 1) % LEGAL_REPS.length] ?? '李某某'
  const phone =
    item.id === 1 ? '13566668888' : `135${String(60000000 + item.id)}`
  return CONTACT_ROLES.map((role, index) => ({
    id: index + 1,
    name: item.id === 1 ? role.name : index === 0 ? legal : role.name,
    title: role.title,
    phone,
    email: `contact${item.id}@example.com`,
  }))
}

const PRODUCT_CATALOG: Record<
  string,
  { icon: ProductIconKind; chain: [string, string, string] }
> = {
  药品制剂: { icon: 'pharma', chain: ['医药健康', '化学制药', '化学制剂'] },
  包装材料与制品: {
    icon: 'packaging',
    chain: ['轻工制造', '造纸包装', '包装印刷'],
  },
  软件开发与信息技术服务: {
    icon: 'software',
    chain: ['信息技术', '软件服务', '应用软件'],
  },
  集成电路: { icon: 'electronics', chain: ['电子信息', '半导体', '集成电路'] },
  电子元器件: {
    icon: 'electronics',
    chain: ['电子信息', '电子器件', '元器件'],
  },
  工业软件: { icon: 'software', chain: ['信息技术', '软件服务', '工业软件'] },
  云计算: { icon: 'software', chain: ['信息技术', '云计算', '云服务'] },
  智能终端: {
    icon: 'electronics',
    chain: ['电子信息', '智能硬件', '智能终端'],
  },
  电子信息: {
    icon: 'electronics',
    chain: ['电子信息', '电子制造', '电子设备'],
  },
  新材料: { icon: 'material', chain: ['先进制造', '新材料', '功能材料'] },
  科研服务: {
    icon: 'research',
    chain: ['科学研究', '专业技术服务', '研发服务'],
  },
  生物医药: { icon: 'pharma', chain: ['医药健康', '生物制药', '生物制品'] },
  人工智能: { icon: 'ai', chain: ['信息技术', '人工智能', '智能算法'] },
  算力服务: { icon: 'ai', chain: ['信息技术', '云计算', '算力服务'] },
  现代物流: { icon: 'logistics', chain: ['交通运输', '物流仓储', '现代物流'] },
  跨境电商: { icon: 'logistics', chain: ['商贸流通', '电子商务', '跨境电商'] },
  数字化转型: {
    icon: 'software',
    chain: ['信息技术', '软件服务', '数字化服务'],
  },
}

const buildProductIndustry = (item: EnterpriseItem) => {
  const products: EnterpriseProduct[] = item.tags.map((name, index) => ({
    id: index + 1,
    name,
    icon: PRODUCT_CATALOG[name]?.icon ?? 'default',
  }))
  const industryChains: EnterpriseIndustryChain[] = item.tags.map(
    (name, index) => ({
      id: index + 1,
      levels: PRODUCT_CATALOG[name]?.chain ?? [
        item.industry,
        item.businessIndustry,
        name,
      ],
    }),
  )
  return {
    products,
    industryChains,
    productBasis: '专利 · 软著',
    productCredibility: '高' as ProductCredibility,
  }
}

export const getEnterpriseById = (id: number): EnterpriseItem | undefined =>
  mockEnterprises.find((item) => item.id === id)

export const getEnterpriseDetail = (
  id: number,
): EnterpriseDetail | undefined => {
  const item = getEnterpriseById(id)
  if (!item) return undefined

  const legalRep = LEGAL_REPS[(item.id - 1) % LEGAL_REPS.length] ?? '李某某'
  const phone =
    item.id === 1
      ? '0371-86543210'
      : `0371-86${String(item.id).padStart(6, '0')}`
  const district = districtOf(item)
  const staffCount = item.id === 1 ? 42 : 20 + item.policyCount * 3
  const ipCounts = ipCountsOf(item)

  return {
    ...item,
    shortName: shortNameOf(item.name),
    district,
    staffCount,
    honorTags: honorTagsOf(item),
    publicityAmount:
      item.id === 1 ? 367.04 : Number((item.policyCount * 4.8).toFixed(2)),
    legalRep,
    registeredCapital:
      item.id === 1 ? '1050.00' : `${(item.policyCount * 80).toFixed(2)}`,
    creditCode: `91410100MA9G${String(item.id).padStart(4, '0')}1X`,
    enterpriseType: '有限责任公司',
    phone,
    email:
      item.id === 1 ? '345299876@163.com' : `contact${item.id}@example.com`,
    foundedDate:
      item.id === 1
        ? '2016-10-24'
        : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
    staffScale: item.id === 1 ? '0' : String(staffCount),
    website:
      item.id === 1
        ? 'revogene.cn, www.revogene.com'
        : `https://www.enterprise-${item.id}.com`,
    businessScope:
      item.id === 1
        ? HERO_SCOPE
        : `${item.businessIndustry}；技术开发、技术服务、技术咨询。（除依法须经批准的项目外，凭营业执照依法自主开展经营活动）`,
    businessInfo: {
      registrationNumber:
        item.id === 1
          ? '410195000027899'
          : `410195${String(item.id).padStart(9, '0')}`,
      organizationCode: `MA3X74Y${String(item.id).padStart(2, '0')}`,
      registrationAuthority: `${district}市场监督管理局`,
      businessTerm: `${item.id === 1 ? '2016-10-24' : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`}至无固定期限`,
      approvalDate:
        item.id === 1
          ? '2016-10-24'
          : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
      insuredCount: staffCount,
      formerName: '—',
      registeredAddress:
        item.id === 1
          ? '河南省郑州市航空港区黄海路与生物科技二街交叉口东北角郑州临空生物医药园11号楼'
          : item.address,
      addressChangeDate:
        item.id === 1
          ? '2019-04-16'
          : `201${(item.id % 8) + 1}-0${(item.id % 8) + 1}-18`,
    },
    policyRecords: buildPolicyRecords(item),
    patents: buildPatents(item, ipCounts.patent),
    trademarks: buildTrademarks(item, ipCounts.trademark),
    softwareCopyrights: buildSoftwareCopyrights(item, ipCounts.software),
    workCopyrights: buildWorkCopyrights(item, ipCounts.work),
    qualifications: buildQualifications(item),
    qualificationPersonnel: buildQualPersonnel(item),
    qualificationReviews: buildQualReviews(item),
    contacts: buildContacts(item),
    ...buildProductIndustry(item),
  }
}
