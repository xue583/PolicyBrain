/** 政策申报模块 mock 数据（企业 / 企服双角色） */

export type DeclareTag = '可申报' | '待评估' | '待培育'
export type PolicyLevel = '国家级' | '省级' | '市级'
export type ServiceGroup = '可申报' | '待评估' | '待培育'

export interface DeclarePolicy {
  id: number
  name: string
  subtitle: string
  tag?: DeclareTag
  level: PolicyLevel
  serviceGroup: ServiceGroup
}

export interface DeclareCondition {
  status: '符合' | '不符合' | '待核查'
  title: string
  dataText: string
  addressText: string
}

export interface DeclareEnterprise {
  id: number
  name: string
}

/** 政策池：企业视角按 level 分组，企服视角按 serviceGroup 分组 */
export const declarePolicies: DeclarePolicy[] = [
  {
    id: 1,
    name: '高新技术企业申报',
    subtitle: '国家高新技术企业认定申请',
    tag: '可申报',
    level: '国家级',
    serviceGroup: '可申报',
  },
  {
    id: 2,
    name: '国家专精特新小巨人',
    subtitle: '国家高新技术企业认定申请',
    tag: '待评估',
    level: '国家级',
    serviceGroup: '待评估',
  },
  {
    id: 3,
    name: '制造业单项冠军',
    subtitle: '国家高新技术企业认定申请',
    tag: '待培育',
    level: '国家级',
    serviceGroup: '待培育',
  },
  {
    id: 4,
    name: '技术创新示范企业',
    subtitle: '国家高新技术企业认定申请',
    level: '国家级',
    serviceGroup: '待评估',
  },
  {
    id: 5,
    name: '农业产业化龙头企业',
    subtitle: '国家高新技术企业认定申请',
    level: '国家级',
    serviceGroup: '待评估',
  },
  {
    id: 6,
    name: '知识产权优势企业',
    subtitle: '国家高新技术企业认定申请',
    level: '国家级',
    serviceGroup: '待培育',
  },
  {
    id: 7,
    name: '绿色工厂',
    subtitle: '国家高新技术企业认定申请',
    level: '国家级',
    serviceGroup: '待培育',
  },
  {
    id: 8,
    name: '河南省专精特新企业',
    subtitle: '国家高新技术企业认定申请',
    tag: '可申报',
    level: '省级',
    serviceGroup: '可申报',
  },
  {
    id: 9,
    name: '河南省企业技术中心',
    subtitle: '国家高新技术企业认定申请',
    tag: '可申报',
    level: '省级',
    serviceGroup: '可申报',
  },
  {
    id: 10,
    name: '智能制造标杆企业',
    subtitle: '国家高新技术企业认定申请',
    tag: '待培育',
    level: '省级',
    serviceGroup: '待培育',
  },
  {
    id: 11,
    name: '首台套重大技术装备',
    subtitle: '国家高新技术企业认定申请',
    level: '省级',
    serviceGroup: '待培育',
  },
  {
    id: 12,
    name: '新型研发机构',
    subtitle: '国家高新技术企业认定申请',
    level: '省级',
    serviceGroup: '待培育',
  },
  {
    id: 13,
    name: '省长质量奖',
    subtitle: '国家高新技术企业认定申请',
    level: '省级',
    serviceGroup: '待评估',
  },
  {
    id: 14,
    name: '河南省工程技术研究中心',
    subtitle: '国家高新技术企业认定申请',
    level: '省级',
    serviceGroup: '待评估',
  },
  {
    id: 15,
    name: '郑州市工程技术研究中心',
    subtitle: '国家高新技术企业认定申请',
    level: '市级',
    serviceGroup: '待评估',
  },
]

/** 企业视角分组 */
export const levelGroups: Array<{ level: PolicyLevel }> = [
  { level: '国家级' },
  { level: '省级' },
  { level: '市级' },
]

/** 企服视角分组 */
export const serviceGroups: ServiceGroup[] = ['可申报', '待评估', '待培育']

/** 企服视角企业名称（设计稿占位文案） */
export const serviceCompanyName = '郑州市企业名称企业名称'

/** 卡片悬浮展示的申报要求 */
export const declareRequirements = [
  '在郑州市注册，具有独立法人资格的企业、科研院所或高等院校',
  '拥有自主知识产权，在相关技术领域具有较强的研发实力，研发人员占比不低于30%',
  '研发人员不少于15人，其中高级职称或硕士以上学历',
  '拥有固定的研发场所，面积不低于300平方米',
  '研发仪器设备原值不低于200万元',
  '上年度研发投入不低于100万元',
  '具备工程试验验证条件和基础设施，有较强的技术创新能力',
]

/** 企服视角可选企业 */
export const declareEnterprises: DeclareEnterprise[] = [
  { id: 1, name: '唐河县大华机械设备有限公司' },
  { id: 2, name: '郑州市云智信息技术有限公司' },
  { id: 3, name: '河南沃德机电集团有限公司' },
  { id: 4, name: '洛阳轴承先进制造有限公司' },
  { id: 5, name: '新乡市平原过滤器有限公司' },
]

/** 申报年份 */
export const declareYears = ['2026年', '2025年', '2024年']

/** 申报条件与数据对比结果（设计稿顺序：符合/符合/不符合/符合/待核查/符合） */
export const declareConditions: DeclareCondition[] = [
  {
    status: '符合',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
  {
    status: '符合',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
  {
    status: '不符合',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
  {
    status: '符合',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
  {
    status: '待核查',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
  {
    status: '符合',
    title: '在河南省内注册，具有独立法人资格',
    dataText: '实际数据:河南省南阳市唐河县，有限责任公司(自然人投资或控股)',
    addressText:
      '企业注册地址在河南省南阳市唐河县产业集聚区，属于有限责任公司(自然人投资或控股)，具有独立法人资格',
  },
]
