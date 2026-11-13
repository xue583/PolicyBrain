export type PolicyLevel = 'national' | 'provincial' | 'municipal' | 'district'
/** 后端 PolicyLevelEnum：0 国家、1 省、2 市、3 区县。 */
export type PolicyLevelCode = 0 | 1 | 2 | 3
export type PolicyInfoType = 'applying' | 'publicizing' | 'new'

export const regions = [
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
]

export const industries = [
  '信息技术',
  '高新技术',
  '制造业',
  '采矿业',
  '电力、热力、燃气及水生产和供应业',
  '房地产业',
  '建筑业',
  '交通运输、仓储和邮政业',
  '教育',
  '金融业',
  '居民服务、修理和其他服务业',
]

export const policyLevels: { label: string; value: PolicyLevelCode }[] = [
  { label: '国家级', value: 0 },
  { label: '省级', value: 1 },
  { label: '市级', value: 2 },
  { label: '区级', value: 3 },
]

export const infoTypes: { label: string; value: PolicyInfoType }[] = [
  { label: '申报中', value: 'applying' },
  { label: '公示中', value: 'publicizing' },
  { label: '新发文', value: 'new' },
]
