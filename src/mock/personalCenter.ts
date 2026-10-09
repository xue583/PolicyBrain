/** 个人中心面板共享的视觉还原用 Mock 数据，接入后端后替换 */

export type PolicyChange = {
  id: number
  policyName: string
  changeType: string
  before: string
  after: string
  changedAt: string
}

export const companyNames = [
  '河南中科干细胞基因工程有限公司',
  '郑州紫江包装有限公司',
  '众智学府信息技术有限公司',
]

export const policyNames = [
  '关于组织开展2026年度高新技术企业认定工作的通知',
  '郑州市推进制造业数字化转型专项资金申报指南',
  '关于印发河南省专精特新中小企业培育实施方案的通知',
  '郑州市人工智能创新发展若干措施申报工作安排',
  '关于公开征集2026年重点领域科技攻关需求的通知',
]

export const changeTypes = ['申报条件', '支持力度', '申报时间', '依据文件']

export const changePairs = [
  ['企业成立满 1 年', '企业成立满 2 年'],
  ['最高补贴 50 万元', '最高补贴 80 万元'],
  ['申报截止 2026/9/30', '申报截止 2026/10/31'],
  ['需提供市级资质', '需提供省级资质'],
] as const

export const mockChangedAt = '2026/8/24 09:15:07'

export function buildPolicyChanges(count = 15): PolicyChange[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    policyName: policyNames[i % policyNames.length]!,
    changeType: changeTypes[i % changeTypes.length]!,
    before: changePairs[i % changePairs.length]![0],
    after: changePairs[i % changePairs.length]![1],
    changedAt: mockChangedAt,
  }))
}
