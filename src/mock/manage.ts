/**
 * 企业管理页 mock —— 字段与文案均按设计稿截图硬编码。
 * 注意：卡头公司名（郑州源创基因科技有限公司）与表单企业名（唐河县大华机械设备有限公司）
 * 在两张设计稿中即为不一致，按图原样还原，不要"修正"。
 */

/** 卡头公司信息（企业/企服两张设计稿一致） */
export const manageHero = {
  name: '郑州源创基因科技有限公司',
  meta: '通用设备制造业/河南省/南阳市/唐河县--存续',
}

/** 详情页 tab。基本信息按设计稿；其余 tab 复用企业库对应面板或工作台表格。 */
export const manageTabs = [
  '基本信息',
  '知识产权',
  '品牌/产品',
  '人员管理',
  '资质证书',
  '政策管理',
  '财务数据',
  '资产管理',
  '研发管理',
  '联系方式',
  '资料备份',
] as const

/** 企服侧栏副标题（设计稿硬编码 1/10） */
export const manageFollowSummary = '管理您关注的企业数据 1/10'

/** 基本信息 + 法定代表人/联系人/企业概况（数字与文案按图硬编码） */
export const manageProfile = {
  creditCode: '91411328698705730A',
  status: '存续',
  industry: '通用设备制造业',
  foundedDate: '2009-11-27',
  regAddress: '唐河县产业集群区',
  name: '唐河县大华机械设备有限公司',
  companyType: '有限责任公司(自然人投资或控股)',
  registeredCapital: '500万人民币',
  region: '河南省/南阳市/唐河县',
  legalRep: {
    name: '郭峰',
    phone: '13782139779',
    tel: '——',
    fax: '——',
    email: '——',
  },
  contact: {
    name: '——',
    phone: '——',
    tel: '——',
    fax: '——',
    email: '——',
  },
  overview: {
    /** 企业是否上市：设计稿选中"否" */
    listed: false,
    listedInfo: '—/—/—',
    /** 是否属于国家高新区内企业：设计稿选中"是" */
    inHighTechZone: true,
    zoneInfo: '生物与新医药/农业生物技术/现代农业装备与信息',
  },
}

export interface ManageMetric {
  label: string
  value: string
  unit?: string
}

/** 表格行。字段按各 tab 列使用，缺省字段留空。 */
export interface ManageRow {
  id: number
  name?: string
  status?: string
  [key: string]: string | number | undefined
}

export const manageStaffMetrics: ManageMetric[] = [
  { label: '在职人员', value: '15', unit: '人' },
  { label: '研发人员', value: '7', unit: '人' },
  { label: '科技人员', value: '8', unit: '人' },
  { label: '本科及以上', value: '14', unit: '人' },
]

export const manageStaff: ManageRow[] = [
  {
    id: 1,
    name: '郭峰',
    dept: '管理层',
    title: '法定代表人',
    education: '本科',
    phone: '13782139779',
    status: '在职',
  },
  {
    id: 2,
    name: '李四',
    dept: '综合管理部',
    title: '总经理',
    education: '硕士',
    phone: '13566668888',
    status: '在职',
  },
  {
    id: 3,
    name: '张三',
    dept: '综合管理部',
    title: '副总经理',
    education: '本科',
    phone: '13566668001',
    status: '在职',
  },
  {
    id: 4,
    name: '王五',
    dept: '财务部',
    title: '财务负责人',
    education: '本科',
    phone: '13566668002',
    status: '在职',
  },
  {
    id: 5,
    name: '赵六',
    dept: '研发中心',
    title: '技术负责人',
    education: '博士',
    phone: '13566668003',
    status: '在职',
  },
  {
    id: 6,
    name: '张三丰',
    dept: '研发中心',
    title: '高级工程师',
    education: '硕士',
    phone: '13566668004',
    status: '在职',
  },
  {
    id: 7,
    name: '昭子裙',
    dept: '研发中心',
    title: '研发工程师',
    education: '硕士',
    phone: '13566668005',
    status: '在职',
  },
  {
    id: 8,
    name: '吴凯',
    dept: '研发中心',
    title: '研发工程师',
    education: '硕士',
    phone: '13566668006',
    status: '在职',
  },
  {
    id: 9,
    name: '马超',
    dept: '研发中心',
    title: '生物信息工程师',
    education: '硕士',
    phone: '13566668007',
    status: '在职',
  },
  {
    id: 10,
    name: '郑晓',
    dept: '研发中心',
    title: '实验员',
    education: '本科',
    phone: '13566668008',
    status: '在职',
  },
  {
    id: 11,
    name: '何静',
    dept: '研发中心',
    title: '实验员',
    education: '本科',
    phone: '13566668009',
    status: '在职',
  },
  {
    id: 12,
    name: '赵燕',
    dept: '质量部',
    title: '质量负责人',
    education: '本科',
    phone: '13566668010',
    status: '在职',
  },
  {
    id: 13,
    name: '周敏',
    dept: '市场部',
    title: '市场经理',
    education: '本科',
    phone: '13566668011',
    status: '在职',
  },
  {
    id: 14,
    name: '陈浩',
    dept: '生产部',
    title: '生产主管',
    education: '大专',
    phone: '13566668012',
    status: '在职',
  },
  {
    id: 15,
    name: '孙莉',
    dept: '行政部',
    title: '行政专员',
    education: '本科',
    phone: '13566668013',
    status: '在职',
  },
  {
    id: 16,
    name: '刘洋',
    dept: '研发中心',
    title: '实验员',
    education: '本科',
    phone: '13566668014',
    status: '离职',
  },
]

export const manageFinanceMetrics: ManageMetric[] = [
  { label: '2025年营业收入', value: '2,460.00', unit: '万元' },
  { label: '2025年净利润', value: '312.00', unit: '万元' },
  { label: '2025年研发费用', value: '398.00', unit: '万元' },
  { label: '2025年纳税额', value: '136.00', unit: '万元' },
]

export const manageFinance: ManageRow[] = [
  {
    id: 1,
    year: '2023',
    revenue: '1,860.00',
    profit: '210.00',
    assets: '3,200.00',
    liability: '980.00',
    rdExpense: '286.00',
    tax: '96.00',
  },
  {
    id: 2,
    year: '2024',
    revenue: '2,140.00',
    profit: '268.00',
    assets: '3,680.00',
    liability: '1,020.00',
    rdExpense: '342.00',
    tax: '118.00',
  },
  {
    id: 3,
    year: '2025',
    revenue: '2,460.00',
    profit: '312.00',
    assets: '4,120.00',
    liability: '1,160.00',
    rdExpense: '398.00',
    tax: '136.00',
  },
]

export const manageAssetMetrics: ManageMetric[] = [
  { label: '资产总数', value: '8', unit: '项' },
  { label: '原值合计', value: '524.50', unit: '万元' },
  { label: '在用', value: '7', unit: '项' },
  { label: '闲置', value: '1', unit: '项' },
]

export const manageAssets: ManageRow[] = [
  {
    id: 1,
    name: '高通量基因测序仪',
    category: '研发设备',
    originalValue: '286.00',
    netValue: '198.40',
    purchasedAt: '2022-06-18',
    status: '在用',
    location: '基因实验室',
  },
  {
    id: 2,
    name: '生物安全柜',
    category: '研发设备',
    originalValue: '18.60',
    netValue: '11.20',
    purchasedAt: '2021-03-12',
    status: '在用',
    location: '细胞间',
  },
  {
    id: 3,
    name: '二氧化碳细胞培养箱',
    category: '研发设备',
    originalValue: '12.40',
    netValue: '7.60',
    purchasedAt: '2021-03-12',
    status: '在用',
    location: '细胞间',
  },
  {
    id: 4,
    name: '超低温冰箱',
    category: '研发设备',
    originalValue: '6.80',
    netValue: '3.40',
    purchasedAt: '2020-11-02',
    status: '在用',
    location: '样本库',
  },
  {
    id: 5,
    name: '服务器及存储阵列',
    category: '电子设备',
    originalValue: '46.00',
    netValue: '28.50',
    purchasedAt: '2023-08-20',
    status: '在用',
    location: '机房',
  },
  {
    id: 6,
    name: '实验室装修改造',
    category: '房屋构筑物',
    originalValue: '128.00',
    netValue: '96.00',
    purchasedAt: '2019-05-06',
    status: '在用',
    location: '临空生物医药园11号楼',
  },
  {
    id: 7,
    name: '办公车辆',
    category: '运输工具',
    originalValue: '22.50',
    netValue: '12.80',
    purchasedAt: '2022-01-15',
    status: '在用',
    location: '园区停车场',
  },
  {
    id: 8,
    name: '备用离心机',
    category: '研发设备',
    originalValue: '4.20',
    netValue: '1.10',
    purchasedAt: '2018-09-09',
    status: '闲置',
    location: '设备库',
  },
]

export const manageRdMetrics: ManageMetric[] = [
  { label: '在研项目', value: '4', unit: '项' },
  { label: '已结题', value: '2', unit: '项' },
  { label: '研发投入', value: '590.00', unit: '万元' },
  { label: '研发人员', value: '7', unit: '人' },
]

export const manageRdProjects: ManageRow[] = [
  {
    id: 1,
    name: '干细胞诱导分化关键技术研究',
    projectType: '自主研发',
    period: '2024-03 至 2026-12',
    owner: '赵六',
    budget: '180.00',
    status: '进行中',
  },
  {
    id: 2,
    name: '高通量基因测序数据质控方法',
    projectType: '自主研发',
    period: '2023-06 至 2025-12',
    owner: '马超',
    budget: '96.00',
    status: '已结题',
  },
  {
    id: 3,
    name: '核酸检测试剂盒开发',
    projectType: '合作研发',
    period: '2024-01 至 2026-06',
    owner: '张三丰',
    budget: '120.00',
    status: '进行中',
  },
  {
    id: 4,
    name: '生物样本库管理系统',
    projectType: '自主研发',
    period: '2022-04 至 2024-10',
    owner: '昭子裙',
    budget: '64.00',
    status: '已结题',
  },
  {
    id: 5,
    name: '重组蛋白表达工艺优化',
    projectType: '自主研发',
    period: '2025-02 至 2027-01',
    owner: '吴凯',
    budget: '88.00',
    status: '进行中',
  },
  {
    id: 6,
    name: '免疫组化检测试剂研究',
    projectType: '自主研发',
    period: '2025-06 至 2026-12',
    owner: '何静',
    budget: '42.00',
    status: '进行中',
  },
]

export const manageBackupMetrics: ManageMetric[] = [
  { label: '备份文件', value: '6', unit: '份' },
  { label: '最近备份', value: '2026-07-01' },
  { label: '占用空间', value: '36.7', unit: 'MB' },
]

export const manageBackups: ManageRow[] = [
  {
    id: 1,
    name: '营业执照副本.pdf',
    type: '证照',
    size: '1.2MB',
    updatedAt: '2026-03-18',
  },
  {
    id: 2,
    name: '2025年度审计报告.pdf',
    type: '财务',
    size: '3.6MB',
    updatedAt: '2026-04-02',
  },
  {
    id: 3,
    name: '知识产权清单.xlsx',
    type: '知识产权',
    size: '860KB',
    updatedAt: '2026-05-16',
  },
  {
    id: 4,
    name: '资质证书扫描件.zip',
    type: '资质',
    size: '28.4MB',
    updatedAt: '2026-02-11',
  },
  {
    id: 5,
    name: '研发项目立项材料.docx',
    type: '研发',
    size: '2.1MB',
    updatedAt: '2026-06-08',
  },
  {
    id: 6,
    name: '人员花名册.xlsx',
    type: '人员',
    size: '540KB',
    updatedAt: '2026-07-01',
  },
]
