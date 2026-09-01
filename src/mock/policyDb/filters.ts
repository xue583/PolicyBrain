import { policyLevels } from '../filters'
import type { PolicyDbPublicityCategory, PolicyDbUpdateStatus } from './types'

export const policyDbLevels = policyLevels

export const policyGrades = [
  '国家级',
  '河南省',
  '郑州市',
  '金水区',
  '郑东新区',
  '经济技术开发区',
  '高新技术开发区',
  '航空港区',
  '中牟县',
  '新郑市',
  '荥阳市',
  '新密市',
  '登封市',
  '中原区',
  '二七区',
  '管城回族区',
  '惠济区',
  '上街区',
]

export const policyDepartments = [
  '人民政府',
  '发展和改革委员会',
  '科学技术局',
  '工业和信息化局',
  '财政局',
  '人力资源和社会保障局',
  '自然资源和规划局',
  '生态环境局',
  '住房和城乡建设局',
  '交通运输局',
  '水利局',
  '农业农村局',
  '商务局',
  '文化广电和旅游局',
  '卫生健康委员会',
  '应急管理局',
  '市场监督管理局',
  '统计局',
  '体育局',
  '地方金融监督管理局',
  '数据局',
  '知识产权局',
]

export const policyIndustryTags = [
  '科技企业',
  '企业',
  '高等院校',
  '科研院所',
  '医疗卫生机构',
  '社会组织',
  '新型研发机构',
  '创新联合体',
  '众创空间',
  '孵化器',
  '加速器',
  '大学科技园',
  '高新区',
  '经开区',
  '产业集聚区',
  '专业园区',
  '特色小镇',
  '服务业',
  '制造业',
  '农业',
]

export const policyDbYears = [2026, 2025, 2024, 2023, 2022]

export const policyDbUpdateStatuses: {
  label: string
  value: PolicyDbUpdateStatus
}[] = [
  { label: '未过期', value: 'active' },
  { label: '已过期', value: 'expired' },
]

export const publicityCategories: {
  label: string
  value: PolicyDbPublicityCategory
}[] = [
  { label: '获批公示', value: 'approved' },
  { label: '补贴公示', value: 'subsidy' },
  { label: '拟认定/拟入库/拟推荐', value: 'proposed' },
  { label: '考核评价公示', value: 'evaluation' },
  { label: '受理/备案/推荐公示', value: 'acceptance' },
  { label: '撤销公示', value: 'revoked' },
]

export const publicityAddresses = [
  '郑州市',
  '金水区',
  '郑东新区',
  '经济技术开发区',
  '高新技术开发区',
  '航空港区',
  '中牟县',
  '新郑市',
  '荥阳市',
  '新密市',
  '登封市',
  '中原区',
  '二七区',
  '管城回族区',
  '惠济区',
  '上街区',
]

export const publicityObtainedPolicies = [
  '高新技术企业（拟认定）',
  '科技型中小企业',
  '专精特新中小企业',
  '工程研究中心',
  '重点实验室',
  '制造业单项冠军',
  '创新型中小企业',
  '瞪羚企业',
]
