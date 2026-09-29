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

/** 详情页 tab（设计稿仅"基本信息"有内容，其余 tab 展示空态） */
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
