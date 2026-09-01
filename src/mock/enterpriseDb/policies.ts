import type { EnterpriseItem, EnterprisePolicyRecord } from './types'

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

export const buildPolicyRecords = (
  item: EnterpriseItem,
): EnterprisePolicyRecord[] => {
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
