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
