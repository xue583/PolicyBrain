import type {
  EnterpriseItem,
  EnterpriseQualPersonnel,
  EnterpriseQualReview,
  EnterpriseQualification,
} from './types'

export const enterpriseQualYears = [2026, 2025, 2024, 2023, 2022, 2021]

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

export { buildQualPersonnel, buildQualReviews, buildQualifications }
