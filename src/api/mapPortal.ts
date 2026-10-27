import type { HomeNewsItem } from '@/mock/home'
import type { PolicyInfoType, PolicyLevel } from '@/mock/filters'
import type { PolicyItem, PolicyTag } from '@/mock/policyNews'
import type {
  PolicyDbApplyInfo,
  PolicyDbItem,
  PolicyDbPublicity,
  PolicyDbPublicityCategory,
  PolicyDbStatus,
  PolicyDbSupportMeasure,
  PolicyDbUpdate,
} from '@/mock/policyDb/types'
import type {
  EnterpriseContact,
  EnterpriseDetail,
  EnterpriseIndustryChain,
  EnterpriseItem,
  EnterprisePatent,
  EnterprisePolicyRecord,
  EnterpriseProduct,
  EnterpriseQualification,
  EnterpriseSoftwareCopyright,
  EnterpriseStatus,
  EnterpriseTrademark,
  EnterpriseWorkCopyright,
} from '@/mock/enterpriseDb/types'
import type { InvestProject, InvestRegion } from '@/mock/investDb'
import type {
  MatchPolicy,
  MatchPolicyBadge,
  MatchPolicyStatus,
} from '@/mock/enterpriseDb/matchPolicies'
import {
  asRecord,
  daysUntil,
  formatDate,
  pick,
  pickNumber,
  pickString,
} from '@/api/record'

const LEVELS: PolicyLevel[] = [
  'national',
  'provincial',
  'municipal',
  'district',
]

const LEVEL_LABEL: Record<PolicyLevel, string> = {
  national: '国家级',
  provincial: '省级',
  municipal: '市级',
  district: '区级',
}

export const mapPolicyLevel = (value: unknown): PolicyLevel => {
  if (typeof value === 'number' && value >= 0 && value <= 3) {
    return LEVELS[value] ?? 'municipal'
  }
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
  if (text === '0' || text === 'national' || text.includes('国家')) {
    return 'national'
  }
  if (text === '1' || text === 'provincial' || text.includes('省')) {
    return 'provincial'
  }
  if (text === '3' || text === 'district' || /区|县/.test(text)) {
    return 'district'
  }
  if (text === '2' || text === 'municipal' || text.includes('市')) {
    return 'municipal'
  }
  return 'municipal'
}

export const levelLabel = (level: PolicyLevel) => LEVEL_LABEL[level]

const mapInfoType = (value: unknown): PolicyInfoType => {
  const text = String(value ?? '')
  if (text.includes('公示') || text === 'publicizing') return 'publicizing'
  if (text.includes('新发') || text === 'new') return 'new'
  return 'applying'
}

const isExpired = (record: Record<string, unknown>) => {
  if (record.expired === true) return true
  const status = pickString(record, ['newsStatus', 'dynamicState', 'status'])
  if (/过期|expired|closed|截止/.test(status)) return true
  const deadline = pick(record, ['deadlineAt', 'endDate'])
  if (deadline && daysUntil(deadline) < 0) return true
  return false
}

const newsTags = (record: Record<string, unknown>): PolicyTag[] => {
  const tags: PolicyTag[] = []
  const infoType = pickString(record, ['infoType'])
  if (infoType) tags.push({ text: infoType, color: 'blue' })
  const level = pick(record, ['policyLevel'])
  if (level !== undefined) {
    tags.push({ text: levelLabel(mapPolicyLevel(level)), color: 'gold' })
  }
  return tags
}

export const mapNewsItem = (raw: unknown): PolicyItem => {
  const record = asRecord(raw)
  const published = formatDate(
    pick(record, ['publishedAt', 'publishTime', 'date']),
  )
  const deadline = formatDate(pick(record, ['deadlineAt', 'endDate']))
  const remaining = pick(record, ['daysRemaining'])
  const days =
    remaining === undefined
      ? daysUntil(pick(record, ['deadlineAt']))
      : Number(remaining)
  return {
    id: pickNumber(record, ['id']),
    title: pickString(record, ['title', 'name']),
    status: isExpired(record) || days < 0 ? 'expired' : 'normal',
    tags: newsTags(record),
    description: pickString(record, ['summary', 'description']),
    date: published,
    endDate: deadline,
    department: pickString(record, ['issuingAuthority', 'department'], '-'),
    daysRemaining: Number.isFinite(days) ? days : 0,
    region: pickString(record, ['region', 'regionPath']),
    industry: pickString(record, ['industry']),
    level: mapPolicyLevel(pick(record, ['policyLevel', 'level'])),
    infoType: mapInfoType(pick(record, ['infoType'])),
    content: pickString(record, ['bodyHtml', 'bodyContent', 'content']),
    attachments: mapAttachments(record.attachments),
    originalUrl: pickString(record, ['canonicalUrl', 'originalUrl']),
  }
}

const mapAttachments = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      const record = asRecord(item)
      const name = pickString(
        record,
        ['name', 'fileName', 'title'],
        `附件${index + 1}`,
      )
      const url = pickString(record, ['url', 'fileUrl'])
      return { name, url }
    })
    .filter((item) => item.name)
}

export const mapHomeNewsItem = (raw: unknown): HomeNewsItem => {
  const item = mapNewsItem(raw)
  const tones = ['blue', 'green', 'orange', 'gold'] as const
  let status: HomeNewsItem['status'] = 'applying'
  let statusText = '申报中'
  if (item.status === 'expired' || item.daysRemaining < 0) {
    status = 'closed'
    statusText = '已截止'
  } else if (item.daysRemaining > 0) {
    status = 'remaining'
    statusText = `剩余${item.daysRemaining}天`
  }
  const rawStatus = pickString(asRecord(raw), ['newsStatus'])
  if (rawStatus && status === 'applying') statusText = rawStatus
  return {
    id: item.id,
    title: item.title,
    tags: item.tags.map((tag, index) => ({
      text: tag.text,
      tone: tones[index % tones.length] ?? 'blue',
    })),
    time: item.date,
    department: item.department,
    status,
    statusText,
  }
}

const policyStatus = (record: Record<string, unknown>): PolicyDbStatus => {
  return isExpired(record) ? 'expired' : 'idle'
}

export const mapPolicyCard = (raw: unknown): PolicyDbItem => {
  const record = asRecord(raw)
  const level = mapPolicyLevel(pick(record, ['policyLevel', 'level']))
  const tags = record.industryTags
  const industryTag = Array.isArray(tags)
    ? tags.map(String).filter(Boolean).join('、')
    : pickString(record, ['industryTag', 'industryTags'])
  return {
    id: pickNumber(record, ['id']),
    name: pickString(record, ['name', 'title']),
    support: pickString(record, ['supportField', 'supportIntensity']),
    city: pickString(record, ['regionPath', 'city'], '-'),
    department: pickString(record, ['department', 'issuingAuthority'], '-'),
    views: pickNumber(record, ['views', 'viewCount']),
    status: policyStatus(record),
    level,
    grade: pickString(record, ['grade']) || levelLabel(level),
    industryTag,
    infoType: mapInfoType(pick(record, ['infoType'])),
  }
}

export const mapPolicyApplyInfo = (raw: unknown): PolicyDbApplyInfo => {
  const record = asRecord(raw)
  // WebApi 申报条件/支持领域为 Admin 原文照录（多为 HTML）；整段消毒渲染，禁止按分号拆条露标签
  const condition = pickString(record, ['applyCondition'])
  const files = Array.isArray(record.basisFiles) ? record.basisFiles : []
  return {
    fields: pickString(record, ['supportField']),
    applyHtml: condition,
    conditions: [],
    regulationNote: '',
    regulationClauses: [],
    files: files.map((file) => {
      const item = asRecord(file)
      return {
        name: pickString(item, ['title', 'name'], '依据文件'),
        url: pickString(item, ['url', 'documentUrl'], '#'),
      }
    }),
  }
}

export const mapSupportMeasure = (
  raw: unknown,
  index: number,
): PolicyDbSupportMeasure => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    grade: pickString(record, ['grade', 'policyLevel'], '-'),
    condition: pickString(record, ['condition']),
    amount: pickString(record, ['amount']),
    document: pickString(record, ['document', 'title']),
    documentUrl: pickString(record, ['documentUrl', 'url']),
  }
}

export const mapPolicyUpdate = (raw: unknown): PolicyDbUpdate => {
  const record = asRecord(raw)
  const date = formatDate(pick(record, ['publishedAt', 'date']))
  const year = Number(date.slice(0, 4))
  return {
    id: pickNumber(record, ['id']),
    title: pickString(record, ['title', 'name']),
    grade:
      pickString(record, ['grade']) ||
      levelLabel(mapPolicyLevel(pick(record, ['policyLevel']))),
    department: pickString(record, ['issuingAuthority', 'department'], '-'),
    date,
    endDate: formatDate(pick(record, ['deadlineAt', 'endDate'])),
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    daysRemaining: pickNumber(
      record,
      ['daysRemaining'],
      daysUntil(pick(record, ['deadlineAt'])),
    ),
    expired: isExpired(record),
    phone: pickString(record, ['phone']),
    newsId: pickNumber(record, ['newsId', 'id']),
  }
}

const PUBLICITY_CATEGORIES: PolicyDbPublicityCategory[] = [
  'approved',
  'subsidy',
  'proposed',
  'evaluation',
  'acceptance',
  'revoked',
]

const mapPublicityCategory = (value: unknown): PolicyDbPublicityCategory => {
  const text = String(value ?? '')
  if (PUBLICITY_CATEGORIES.includes(text as PolicyDbPublicityCategory)) {
    return text as PolicyDbPublicityCategory
  }
  if (/撤销/.test(text)) return 'revoked'
  if (/拟/.test(text)) return 'proposed'
  if (/评价|考核/.test(text)) return 'evaluation'
  if (/验收|受理|备案/.test(text)) return 'acceptance'
  if (/补贴/.test(text)) return 'subsidy'
  return 'approved'
}

export const mapPublicity = (raw: unknown): PolicyDbPublicity => {
  const record = asRecord(raw)
  const amount = pick(record, ['amount'])
  const yearText = formatDate(pick(record, ['year', 'publishedAt', 'date']))
  return {
    id: pickNumber(record, ['id']),
    name: pickString(record, ['name', 'enterpriseName', 'title']),
    district: pickString(record, ['district', 'districtName'], '-'),
    region: pickString(record, ['region', 'regionPath'], '-'),
    industry: pickString(record, ['industry', 'industryName'], '-'),
    amount: amount === undefined ? null : pickNumber(record, ['amount']),
    year: Number(String(yearText).slice(0, 4)) || new Date().getFullYear(),
    category: mapPublicityCategory(pick(record, ['category', 'publicityType'])),
    obtainedPolicy: pickString(record, [
      'obtainedPolicy',
      'standardPolicyName',
      'policyName',
    ]),
  }
}

const mapEnterpriseStatus = (value: unknown): EnterpriseStatus => {
  const text = String(value ?? '')
  if (/吊销|revoked/i.test(text)) return 'revoked'
  if (/注销|cancelled|canceled/i.test(text)) return 'cancelled'
  return 'active'
}

const stringList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const mapEnterpriseCard = (raw: unknown): EnterpriseItem => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id']),
    name: pickString(record, ['name']),
    status: mapEnterpriseStatus(pick(record, ['businessStatus', 'status'])),
    province: pickString(record, ['provinceName', 'province'], '-'),
    city: pickString(record, ['cityName', 'city'], '-'),
    policyCount: pickNumber(record, ['policyCount']),
    tags: stringList(pick(record, ['tags', 'industryTags'])),
    address: pickString(record, ['address'], '-'),
    businessIndustry: pickString(
      record,
      ['businessIndustry', 'companyIndustry'],
      '-',
    ),
    industry: pickString(record, ['industry', 'companyIndustry'], '-'),
  }
}

const capitalNumber = (value: string) => {
  const matched = value.match(/[\d.]+/)
  return matched ? matched[0] : value || '-'
}

const shortNameOf = (name: string) => {
  const core = name
    .replace(/^(北京|天津|上海|重庆|河南|河北|山东|江苏|浙江|广东)/, '')
    .replace(/(有限责任公司|股份有限公司|有限公司|公司)$/, '')
  return (core || name).slice(0, 2)
}

const INDUSTRY_DETAIL_KEYS = [
  'category',
  'categoryBig',
  'categoryMiddle',
  'categorySmall',
] as const

const decodeUnicodeEscapes = (value: string) =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  )

const splitIndustryPath = (value: string) =>
  value
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)

const parseIndustryDetail = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  const text = value.trim()
  if (!text) return ''
  try {
    return JSON.parse(text)
  } catch {
    const decoded = decodeUnicodeEscapes(text)
    try {
      return JSON.parse(decoded)
    } catch {
      return decoded
    }
  }
}

/** 门类 → 大类 → 中类 → 小类，跳过空级别 */
const industryLevelsOf = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') return []
  let parsed = parseIndustryDetail(value)
  if (typeof parsed === 'string') {
    const decoded = decodeUnicodeEscapes(parsed).trim()
    if (!decoded) return []
    if (decoded.startsWith('{') || decoded.startsWith('[')) {
      parsed = parseIndustryDetail(decoded)
    } else {
      return splitIndustryPath(decoded)
    }
  }
  if (typeof parsed === 'string') return splitIndustryPath(parsed)
  const record = asRecord(parsed)
  if (!INDUSTRY_DETAIL_KEYS.some((key) => key in record)) return []
  return INDUSTRY_DETAIL_KEYS.map((key) =>
    decodeUnicodeEscapes(String(record[key] ?? '')).trim(),
  ).filter(Boolean)
}

export type EnterpriseExtras = {
  policyRecords?: EnterprisePolicyRecord[]
  patents?: EnterprisePatent[]
  trademarks?: EnterpriseTrademark[]
  softwareCopyrights?: EnterpriseSoftwareCopyright[]
  workCopyrights?: EnterpriseWorkCopyright[]
  qualifications?: EnterpriseQualification[]
  contacts?: EnterpriseContact[]
  products?: EnterpriseProduct[]
  policyCount?: number
}

export const mapEnterpriseDetail = (
  raw: unknown,
  extras: EnterpriseExtras = {},
): EnterpriseDetail => {
  const root = asRecord(raw)
  const enterprise = asRecord(root.enterprise)
  const industry = asRecord(root.industry)
  const industryExt = asRecord(root.industryExt)
  const flat = { ...industryExt, ...industry, ...enterprise }
  const card = mapEnterpriseCard({ ...flat, id: flat.id })
  const former = Array.isArray(root.formerNames)
    ? root.formerNames
        .map((item) =>
          typeof item === 'string'
            ? item
            : pickString(asRecord(item), ['name']),
        )
        .filter(Boolean)
        .join('、')
    : ''
  const industryLevels = industryLevelsOf(pick(flat, ['companyIndustryDetail']))
  const industryLabel = industryLevels.join(' / ')
  const chains: EnterpriseIndustryChain[] = industryLevels.length
    ? [{ id: 1, levels: industryLevels }]
    : []
  return {
    ...card,
    policyCount: extras.policyCount ?? card.policyCount,
    shortName: shortNameOf(card.name),
    district: pickString(flat, ['districtName'], '-'),
    staffCount: pickNumber(flat, ['socialSecurityNum', 'staffNumber']),
    honorTags: [],
    publicityAmount: 0,
    legalRep: pickString(flat, ['legalPerson'], '-'),
    registeredCapital: capitalNumber(pickString(flat, ['registeredCapital'])),
    creditCode: pickString(flat, ['creditCode'], '-'),
    enterpriseType: pickString(flat, ['companyType'], '-'),
    phone: pickString(flat, ['phone'], '-'),
    email: pickString(flat, ['email'], '-'),
    foundedDate: formatDate(pick(flat, ['establishTime'])),
    staffScale: pickString(flat, ['staffNumber'], '-'),
    website: pickString(industryExt, ['website']),
    businessScope: pickString(industryExt, ['businessScope']),
    status: mapEnterpriseStatus(pick(industry, ['businessStatus'])),
    businessIndustry:
      industryLabel || pickString(industry, ['companyIndustry'], '-'),
    industry: pickString(industry, ['companyIndustry'], '-'),
    address: pickString(flat, ['address', 'registerAddress'], '-'),
    businessInfo: {
      registrationNumber: pickString(industry, ['licenseNumber'], '-'),
      organizationCode: pickString(industry, ['orgCode'], '-'),
      registrationAuthority: pickString(industry, ['registerAuthority'], '-'),
      businessTerm: pickString(industry, ['businessPeriod'], '-'),
      approvalDate: formatDate(pick(industry, ['approveDate'])),
      insuredCount: pickNumber(industry, ['socialSecurityNum']),
      formerName: former || '-',
      registeredAddress: pickString(
        industry,
        ['registerAddress'],
        card.address,
      ),
      addressChangeDate: '-',
    },
    policyRecords: extras.policyRecords ?? [],
    patents: extras.patents ?? [],
    trademarks: extras.trademarks ?? [],
    softwareCopyrights: extras.softwareCopyrights ?? [],
    workCopyrights: extras.workCopyrights ?? [],
    qualifications: extras.qualifications ?? [],
    qualificationPersonnel: [],
    qualificationReviews: [],
    contacts: extras.contacts ?? [],
    products: extras.products ?? [],
    industryChains: chains,
    productBasis: pickString(industryExt, ['products']),
    productCredibility: '',
  }
}

export const readIpCounts = (raw: unknown) => {
  const enterprise = asRecord(asRecord(raw).enterprise)
  return {
    patent: pickNumber(enterprise, ['patentNum']),
    brand: pickNumber(enterprise, ['brandNum']),
    software: pickNumber(enterprise, ['softrightNum']),
    work: pickNumber(enterprise, ['copyrightWorkNum']),
  }
}

export const mapPolicyRecord = (
  raw: unknown,
  index: number,
): EnterprisePolicyRecord => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    policyId: pickNumber(record, ['policyId', 'standardPolicyId']),
    name: pickString(record, ['standardPolicyName', 'policyName', 'name']),
    grade: pickString(record, ['listLevel', 'grade'], '-'),
    amount: pickString(record, ['amount'], '-'),
    remark: pickString(record, ['remark'], '-'),
    year: pickNumber(record, ['year']),
    department: pickString(record, ['authorityName', 'department'], '-'),
  }
}

export const mapPatent = (raw: unknown, index: number): EnterprisePatent => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    name: pickString(record, ['name', 'title']),
    applyDate: formatDate(pick(record, ['applyDate', 'applicationDate'])),
    applyNo: pickString(record, ['applyNo', 'applicationNo'], '-'),
    publishDate: formatDate(pick(record, ['publishDate', 'publicationDate'])),
    publishNo: pickString(record, ['publishNo', 'publicationNo'], '-'),
    legalStatus: pickString(record, ['legalStatus', 'status'], '-'),
    patentType: pickString(record, ['patentType', 'type'], '-'),
  }
}

export const mapTrademark = (
  raw: unknown,
  index: number,
): EnterpriseTrademark => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    mark: pickString(record, ['mark', 'image'], ''),
    name: pickString(record, ['name', 'title']),
    applyDate: formatDate(pick(record, ['applyDate'])),
    registerNo: pickString(record, ['registerNo', 'regNo'], '-'),
    intlClass: pickString(record, ['intlClass', 'classNo'], '-'),
    status: pickString(record, ['status'], '-'),
  }
}

export const mapSoftware = (
  raw: unknown,
  index: number,
): EnterpriseSoftwareCopyright => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    fullName: pickString(record, ['fullName', 'name']),
    shortName: pickString(record, ['shortName'], '-'),
    approveDate: formatDate(pick(record, ['approveDate', 'registerDate'])),
    registerNo: pickString(record, ['registerNo'], '-'),
    classNo: pickString(record, ['classNo'], '-'),
    version: pickString(record, ['version'], '-'),
    firstPublishDate: formatDate(pick(record, ['firstPublishDate'])),
  }
}

export const mapWork = (
  raw: unknown,
  index: number,
): EnterpriseWorkCopyright => {
  const record = asRecord(raw)
  return {
    id: pickNumber(record, ['id'], index + 1),
    fullName: pickString(record, ['fullName', 'name']),
    registerNo: pickString(record, ['registerNo'], '-'),
    category: pickString(record, ['category', 'type'], '-'),
    completeDate: formatDate(pick(record, ['completeDate'])),
    registerDate: formatDate(pick(record, ['registerDate'])),
    firstPublishDate: formatDate(pick(record, ['firstPublishDate'])),
  }
}

export const mapQualification = (
  raw: unknown,
  index: number,
): EnterpriseQualification => {
  const record = asRecord(raw)
  const issue = formatDate(pick(record, ['issueDate', 'date']))
  return {
    id: pickNumber(record, ['id'], index + 1),
    category: pickString(record, ['certType', 'category'], '-'),
    name: pickString(record, ['certName', 'name']),
    certNo: pickString(record, ['certNo', 'certificateNo'], '-'),
    issueDate: issue,
    validUntil: formatDate(pick(record, ['validUntil', 'expireDate'])),
    year: pickNumber(record, ['year'], Number(issue.slice(0, 4)) || 0),
  }
}

export const mapContact = (raw: unknown, index: number): EnterpriseContact => {
  const record = asRecord(raw)
  const detail = pickString(record, ['detail', 'phone', 'mobile'])
  const emailLike = detail.includes('@')
  return {
    id: pickNumber(record, ['id'], index + 1),
    name: pickString(record, ['person', 'name'], '-'),
    title: pickString(record, ['position', 'title'], '-'),
    phone: emailLike ? '' : detail,
    email: emailLike ? detail : pickString(record, ['email']),
  }
}

export const mapProducts = (raw: unknown): EnterpriseProduct[] => {
  const record = asRecord(raw)
  const items = Array.isArray(record.items) ? record.items : []
  return items.map((item, index) => ({
    id: index + 1,
    name: pickString(asRecord(item), ['name']),
    icon: 'default' as const,
  }))
}

export const mapInvestRegion = (raw: unknown): InvestRegion => {
  const record = asRecord(raw)
  return {
    key: pickString(record, ['id', 'key', 'code']),
    label: pickString(record, ['name', 'label']),
    count: pickNumber(record, ['count']),
  }
}

const hashCode = (text: string) => {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export const mapInvestProject = (raw: unknown, region = ''): InvestProject => {
  const record = asRecord(raw)
  const code = pickString(record, ['code', 'projectCode'])
  const result = pickString(record, ['result', 'approvalResult'])
  const rawUrl = pickString(record, ['url'])
  const failed = /驳回|不通过|未通过|不予受理|rejected/i.test(result)
  const resultLabel = !result
    ? failed
      ? '未办结（驳回）'
      : '办结（通过）'
    : /不通过|未通过|驳回/.test(result)
      ? '未办结（驳回）'
      : /^通过$|passed/i.test(result)
        ? '办结（通过）'
        : result
  return {
    id: pickNumber(
      record,
      ['id'],
      hashCode(code || pickString(record, ['name'])),
    ),
    code: code || '-',
    name: pickString(record, ['name', 'projectName']),
    approvalUnit: pickString(record, ['approveType', 'approvalUnit'], '-'),
    result: failed ? 'rejected' : 'passed',
    resultLabel,
    approvalDate: formatDate(pick(record, ['date', 'approvalDate'])),
    recordUnit: pickString(record, ['company', 'recordUnit'], '-'),
    region: pickString(record, ['region', 'province'], region),
    type: 'filing-public',
    url: /^https?:\/\//i.test(rawUrl) ? rawUrl : '',
  }
}

const matchStatus = (value: unknown): MatchPolicyStatus => {
  if (typeof value === 'number' || value == null || value === '') return 'idle'
  const text = String(value)
  if (/过期|expired/i.test(text)) return 'expired'
  if (/公示|public/i.test(text)) return 'public'
  return 'idle'
}

const matchAmountLines = (record: Record<string, unknown>) => {
  const raw = pick(record, ['amountLines', 'amounts', 'subsidyLines'])
  if (!Array.isArray(raw)) return undefined
  const lines = raw
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      const row = asRecord(item)
      const region = pickString(row, ['region', 'regionName', 'grade', 'name'])
      const amount = pick(row, ['amount', 'maxAmount', 'subsidyAmount'])
      if (region && amount != null && amount !== '') {
        return `${region}：最高${amount}万元`
      }
      return pickString(row, ['text', 'label'])
    })
    .filter(Boolean)
  return lines.length ? lines : undefined
}

const matchBadge = (
  record: Record<string, unknown>,
): MatchPolicyBadge | undefined => {
  const raw = pick(record, ['badge', 'tag'])
  if (raw && typeof raw === 'object') {
    const row = asRecord(raw)
    const text = pickString(row, ['text', 'name', 'label'])
    if (!text) return undefined
    return {
      text,
      tone: pickString(row, ['tone']) === 'green' ? 'green' : 'blue',
    }
  }
  if (typeof raw !== 'string' || !raw.trim()) return undefined
  return {
    text: raw.trim(),
    tone: /常年/.test(raw) ? 'green' : 'blue',
  }
}

/** 企→政匹配列表项。Swagger 的 200 未给出字段，按政策名片与匹配分数字段兼容读取。 */
export const mapMatchPolicy = (raw: unknown): MatchPolicy => {
  const record = asRecord(raw)
  const levelValue = pick(record, ['policyLevel'])
  const amount = pick(record, [
    'maxAmount',
    'amount',
    'subsidyAmount',
    'maxSubsidy',
  ])
  const amountNumber = Number(amount)
  const note = pickString(record, [
    'incubatorNote',
    'reexamineDesc',
    'listMeaning',
    'matchNote',
  ])
  return {
    id: pickNumber(record, ['policyId', 'id']),
    name: pickString(record, [
      'policyCardName',
      'name',
      'title',
      'depotName',
      'policyName',
    ]),
    badge: matchBadge(record),
    grade:
      pickString(record, ['grade', 'depotLevel', 'listLevel']) ||
      (typeof levelValue === 'number'
        ? levelLabel(mapPolicyLevel(levelValue))
        : ''),
    score: pickNumber(record, ['score', 'fraction', 'matchScore']),
    department: pickString(
      record,
      ['department', 'issuingAuthority', 'depotDepartment', 'authorityName'],
      '-',
    ),
    status: matchStatus(
      pick(record, ['status', 'statusType', 'newsStatus', 'dynamicState']),
    ),
    maxAmount:
      amount === undefined || !Number.isFinite(amountNumber)
        ? undefined
        : amountNumber,
    amountLines: matchAmountLines(record),
    highlight: record.highlight === true || record.isHighlight === true,
    incubatorNote: note || undefined,
  }
}

export type MatchedEnterprise = {
  id: number
  name: string
  score: number | null
  totalAmount: string
  legalRep: string
  foundedDate: string
  subsidyText: string
  address: string
  province: string
  city: string
  district: string
  regionLine: string
}

const moneyText = (value: unknown) => {
  if (value === undefined || value === null || value === '') return ''
  const text = String(value).trim()
  if (!text || text === '-' || text === 'null') return ''
  if (/[万亿]/.test(text)) return text
  const num = Number(text.replace(/,/g, ''))
  if (!Number.isFinite(num)) return text
  const display = Number.isInteger(num)
    ? String(num)
    : String(Number(num.toFixed(2)))
  return `${display}万元`
}

const wanText = (value: unknown) => moneyText(value).replace(/万元$/, '万')

/** 政→企匹配列表项。接口字段未在文档中声明，兼容企业名片与匹配分。 */
export const mapMatchedEnterprise = (raw: unknown): MatchedEnterprise => {
  const record = asRecord(raw)
  const enterprise = asRecord(record.enterprise ?? record.ent ?? record.company)
  const industry = asRecord(record.industry)
  const flat = { ...record, ...industry, ...enterprise }
  const scoreRaw = pick(flat, [
    'score',
    'fraction',
    'matchScore',
    'matchingDegree',
  ])
  const scoreNum = Number(scoreRaw)
  const score =
    scoreRaw === undefined || !Number.isFinite(scoreNum) ? null : scoreNum
  const province = pickString(flat, ['provinceName', 'province'])
  const city = pickString(flat, ['cityName', 'city'])
  const district = pickString(flat, ['districtName', 'district'])
  const totalAmount = moneyText(
    pick(flat, ['totalAmount', 'maxAmount', 'amount', 'subsidyAmount']),
  )
  const lines = matchAmountLines(flat)
  const regionLine =
    lines?.[0] ||
    (province && totalAmount ? `${province}：最高${totalAmount}` : '')
  const id =
    pickNumber(enterprise, ['id', 'enterpriseId']) ||
    pickNumber(record, ['enterpriseId', 'entId', 'id'])
  return {
    id,
    name: pickString(flat, ['enterpriseName', 'name', 'companyName']),
    score,
    totalAmount,
    legalRep: pickString(flat, [
      'legalPerson',
      'legalRep',
      'legalRepresentative',
    ]),
    foundedDate: formatDate(
      pick(flat, ['establishTime', 'foundedDate', 'establishDate']),
    ),
    subsidyText: wanText(
      pick(flat, [
        'publicityAmount',
        'publicSubsidy',
        'subsidyAmount',
        'amount',
      ]),
    ),
    address: pickString(flat, ['address', 'registerAddress']),
    province,
    city,
    district,
    regionLine,
  }
}

export const mapMembershipLabel = (raw: unknown) => {
  if (raw == null) return '未开通会员'
  const record = asRecord(raw)
  if (!Object.keys(record).length) return '未开通会员'
  if (
    record.active === false ||
    record.isMember === false ||
    record.valid === false
  ) {
    return '未开通会员'
  }
  return (
    pickString(record, ['planName', 'levelName', 'membershipName', 'name']) ||
    '已开通会员'
  )
}

export type CityOption = { id: number; label: string }

const regionItems = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw
  const items = asRecord(raw).items
  return Array.isArray(items) ? items : []
}

export const mapCityOptions = (raw: unknown): CityOption[] => {
  return regionItems(raw)
    .map((item) => {
      const record = asRecord(item)
      const name = pickString(record, ['extName', 'name'])
      const id = pickNumber(record, ['id'], Number.NaN)
      return { id, label: name }
    })
    .filter((item) => item.label && Number.isFinite(item.id))
}

/**
 * 把 `/meta/regions?level=2` 的省市区树按父级 id 摊平。
 * key 为 `root` 时是省级；其余 key 是父级 id，值是其直接下级。
 */
export const mapRegionTreeIndex = (raw: unknown): Map<string, CityOption[]> => {
  const index = new Map<string, CityOption[]>()
  const walk = (key: string, nodes: unknown[]) => {
    const options: CityOption[] = []
    const nested: { id: number; children: unknown[] }[] = []
    for (const node of nodes) {
      const record = asRecord(node)
      const label = pickString(record, ['extName', 'name'])
      const id = pickNumber(record, ['id'], Number.NaN)
      if (!label || !Number.isFinite(id)) continue
      options.push({ id, label })
      nested.push({
        id,
        children: Array.isArray(record.children) ? record.children : [],
      })
    }
    index.set(key, options)
    for (const item of nested) walk(String(item.id), item.children)
  }
  walk('root', regionItems(raw))
  return index
}

export const mapIndustryNames = (raw: unknown) => {
  const items = Array.isArray(asRecord(raw).items)
    ? (asRecord(raw).items as unknown[])
    : []
  return items
    .map((item) => pickString(asRecord(item), ['name']))
    .filter(Boolean)
}

export type IndustryNode = {
  id: number
  name: string
  children: IndustryNode[]
}

const industryItems = (raw: unknown) => {
  if (Array.isArray(raw)) return raw
  const items = asRecord(raw).items
  return Array.isArray(items) ? items : []
}

const mapIndustryNode = (raw: unknown): IndustryNode | null => {
  const record = asRecord(raw)
  const name = pickString(record, ['name'])
  if (!name) return null
  const children = industryItems(record.children)
    .map(mapIndustryNode)
    .filter((node): node is IndustryNode => Boolean(node))
  return {
    id: pickNumber(record, ['id']),
    name,
    children,
  }
}

/** 产业标签树。level 参数表示展开深度，子级在 children 中。 */
export const mapIndustryTree = (raw: unknown): IndustryNode[] => {
  return industryItems(raw)
    .map(mapIndustryNode)
    .filter((node): node is IndustryNode => Boolean(node))
}

export const mapInfoTypeOptions = (raw: unknown) => {
  const items = asRecord(asRecord(raw).items)
  const list = Array.isArray(items.info_type) ? items.info_type : []
  return list
    .map((item) => {
      const name = pickString(asRecord(item), ['name', 'label'])
      return name ? { label: name, value: name } : null
    })
    .filter((item): item is { label: string; value: string } => Boolean(item))
}

const matchRegionOption = (options: CityOption[], id: number, name: string) => {
  if (Number.isFinite(id)) {
    const byId = options.find((item) => item.id === id)
    if (byId) return byId
  }
  if (!name) return undefined
  return options.find(
    (item) =>
      item.label === name ||
      item.label.replace(/(省|市|自治区|特别行政区)$/u, '') === name,
  )
}

export const resolveContextRegion = (
  raw: unknown,
  cities: CityOption[] = [],
  provinces: CityOption[] = [],
) => {
  const record = asRecord(raw)
  const provinceIdRaw = pickNumber(record, ['provinceId'], Number.NaN)
  const cityIdRaw = pickNumber(record, ['cityId'], Number.NaN)
  const districtIdRaw = pickNumber(record, ['districtId'], Number.NaN)
  const provinceName = pickString(record, ['provinceName', 'province'])
  const cityName = pickString(record, ['cityName'])
  const districtName = pickString(record, ['districtName', 'district'])
  const province = matchRegionOption(provinces, provinceIdRaw, provinceName)
  const city = matchRegionOption(cities, cityIdRaw, cityName)
  return {
    provinceLabel: province?.label || provinceName,
    provinceId:
      province?.id ?? (Number.isFinite(provinceIdRaw) ? provinceIdRaw : null),
    cityLabel: city?.label || cityName,
    cityId: city?.id ?? (Number.isFinite(cityIdRaw) ? cityIdRaw : null),
    districtLabel: districtName,
    districtId: Number.isFinite(districtIdRaw) ? districtIdRaw : null,
  }
}
