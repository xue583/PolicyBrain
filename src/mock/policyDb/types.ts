import type { PolicyInfoType } from '../filters'

export type PolicyDbLevel = 'national' | 'provincial' | 'municipal' | 'district'
export type PolicyDbStatus = 'idle' | 'expired'

export interface PolicyDbItem {
  id: number
  name: string
  support: string
  city: string
  department: string
  views: number
  status: PolicyDbStatus
  level: PolicyDbLevel
  grade: string
  industryTag: string
  infoType: PolicyInfoType
}

export type PolicyDbUpdateStatus = 'active' | 'expired'

export interface PolicyDbTag {
  text: string
  color: string
}

export interface PolicyDbUpdate {
  id: number
  title: string
  grade: string
  department: string
  date: string
  endDate: string
  year: number
  daysRemaining: number
  expired: boolean
  phone: string
  newsId: number
}

export type PolicyDbPublicityCategory =
  'approved' | 'subsidy' | 'proposed' | 'evaluation' | 'acceptance' | 'revoked'

export interface PolicyDbPublicity {
  id: number
  name: string
  district: string
  region: string
  industry: string
  amount: number | null
  year: number
  category: PolicyDbPublicityCategory
  obtainedPolicy: string
}

export interface PolicyDbSupportMeasure {
  id: number
  grade: string
  condition: string
  amount: string
  document: string
  documentUrl: string
}

export interface PolicyDbApplyFile {
  name: string
  url: string
}

export interface PolicyDbApplyInfo {
  /** 支持领域；可能为 Admin 富文本 HTML */
  fields: string
  /**
   * 申报条件富文本；有值时优先于 conditions 列表渲染（WebApi 原文照录 HTML）。
   */
  applyHtml: string
  /** 申报条件纯文本条目（mock / 无 HTML 时） */
  conditions: string[]
  regulationNote: string
  regulationClauses: string[]
  files: PolicyDbApplyFile[]
}

export interface PolicyDbDetail extends PolicyDbItem {
  date: string
  tags: PolicyDbTag[]
  applyInfo: PolicyDbApplyInfo
  supportMeasures: PolicyDbSupportMeasure[]
  updates: PolicyDbUpdate[]
  publicity: PolicyDbPublicity[]
}
