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
  EnterprisePortrait,
  EnterpriseProduct,
  EnterpriseQualPersonnel,
  EnterpriseQualReview,
  EnterpriseQualification,
  EnterpriseShareholder,
  EnterpriseSoftwareCopyright,
  EnterpriseStatus,
  EnterpriseTrademark,
  EnterpriseWorkCopyright,
} from '@/mock/enterpriseDb/types'
import {
  investResultLabels,
  type InvestProject,
  type InvestRegion,
  type InvestResult,
} from '@/mock/investDb'
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
    ...record,
    id: pickString(record, ['id']),
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
      return { ...record, name, url }
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
    ...item,
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
    ...record,
    id: pickString(record, ['id']),
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
    ...record,
    fields: pickString(record, ['supportField']),
    applyHtml: condition,
    conditions: [],
    regulationNote: '',
    regulationClauses: [],
    files: files.map((file) => {
      const item = asRecord(file)
      return {
        ...item,
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
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
    ...record,
    id: pickString(record, ['id']),
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
    newsId: pickString(record, ['newsId', 'id']),
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
    ...record,
    id: pickString(record, ['id']),
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
    ...record,
    id: pickString(record, ['id']),
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

/** 注册资本保留接口原文；纯数字补单位，空值显示 -。 */
export const displayRegisteredCapital = (value: string) => {
  const text = value.trim()
  if (!text || text === '-' || text === 'null') return '-'
  if (/[万亿元]/.test(text)) return text
  return `${text}万元`
}

const isBlankValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '')

/** 后者覆盖前者，但空值不能盖掉已有内容。 */
const mergeDefined = (...records: Record<string, unknown>[]) => {
  const result: Record<string, unknown> = {}
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (isBlankValue(value) && !isBlankValue(result[key])) continue
      result[key] = value
    }
  }
  return result
}

const displayDate = (value: unknown) => {
  const text = formatDate(value)
  if (text === '-' || text.startsWith('1970-01-01')) return '-'
  return text
}

const ratioText = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '-'
  const text = String(value).trim()
  if (!text || text === 'null') return '-'
  if (text.includes('%')) return text
  const num = Number(text)
  if (!Number.isFinite(num)) return text
  const display = Number.isInteger(num)
    ? String(num)
    : String(Number(num.toFixed(4)))
  return `${display}%`
}

const yearOf = (dateText: string) => {
  if (dateText === '-') return 0
  const year = Number(dateText.slice(0, 4))
  return Number.isFinite(year) ? year : 0
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

const PORTRAIT_UNKNOWN = '未知'

const portraitText = (record: Record<string, unknown>, keys: string[]) => {
  const text = pickString(record, keys).trim()
  if (!text || text === '-' || text === 'null') return ''
  return text
}

const portraitOrUnknown = (text: string) => text || PORTRAIT_UNKNOWN

/** 数量缓存：0 也要展示；已带单位的原文保持不动。 */
const portraitCount = (record: Record<string, unknown>, keys: string[]) => {
  const value = pick(record, keys)
  if (value === undefined || value === null || value === '')
    return PORTRAIT_UNKNOWN
  const text = String(value).trim()
  if (!text) return PORTRAIT_UNKNOWN
  if (/[项件个]/.test(text)) return text
  const num = Number(text)
  return Number.isFinite(num) ? `${num}项` : text
}

const portraitAge = (value: unknown, now: Date) => {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return ''
  if (num >= 1900 && num <= 2100) {
    const years = now.getFullYear() - num
    return years >= 0 ? `${years}年` : ''
  }
  if (num < 200) return `${Math.floor(num)}年`
  return ''
}

const portraitYears = (record: Record<string, unknown>, now: Date) => {
  const explicit = portraitText(record, ['yearsEstablished', 'foundingYears'])
  if (explicit)
    return explicit.includes('年') ? explicit : portraitAge(explicit, now)
  const fromYear = portraitAge(pick(record, ['establishYear']), now)
  if (fromYear) return fromYear
  const dateText = formatDate(pick(record, ['establishTime']))
  if (dateText === '-') return PORTRAIT_UNKNOWN
  const date = new Date(`${dateText}T00:00:00`)
  if (Number.isNaN(date.getTime())) return PORTRAIT_UNKNOWN
  let years = now.getFullYear() - date.getFullYear()
  const month = now.getMonth() - date.getMonth()
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) years -= 1
  return years >= 0 ? `${years}年` : PORTRAIT_UNKNOWN
}

const portraitStaff = (record: Record<string, unknown>) => {
  const social = pick(record, ['socialSecurityNum'])
  const socialNum = Number(social)
  if (Number.isFinite(socialNum) && socialNum > 0) return `${socialNum}人`
  const staff = portraitText(record, ['staffNumber', 'employeeCount'])
  if (!staff || staff === '0') return PORTRAIT_UNKNOWN
  return staff.includes('人') ? staff : `${staff}人`
}

const portraitLocation = (record: Record<string, unknown>) => {
  const ready = portraitText(record, ['location', 'regionPath'])
  if (ready) return ready
  const parts = ['provinceName', 'cityName', 'districtName']
    .map((key) => portraitText(record, [key]))
    .filter(Boolean)
  return parts.length ? parts.join('-') : PORTRAIT_UNKNOWN
}

/** GET /enterprises/{id} → 企业画像。接口没有的项显示「未知」。 */
export const mapEnterprisePortrait = (
  raw: unknown,
  now = new Date(),
): EnterprisePortrait => {
  const root = asRecord(raw)
  const enterprise = asRecord(root.enterprise)
  const industry = asRecord(root.industry)
  const industryExt = asRecord(root.industryExt)
  const extra = asRecord(root.portrait ?? root.enterprisePortrait)
  const flat = { ...industryExt, ...industry, ...enterprise, ...extra }
  const industryName =
    industryLevelsOf(pick(flat, ['companyIndustryDetail']))[0] ||
    portraitText(flat, ['companyIndustry', 'industry'])
  return {
    ...root,
    ...flat,
    staffCount: portraitStaff(flat),
    siteArea: portraitOrUnknown(
      portraitText(flat, ['siteArea', 'floorArea', 'venueArea']),
    ),
    location: portraitLocation(flat),
    industry: industryName || PORTRAIT_UNKNOWN,
    yearsEstablished: portraitYears(flat, now),
    revenue: portraitOrUnknown(
      portraitText(flat, ['annualTurnover', 'operatingRevenue', 'revenue']),
    ),
    assetLiabilityRatio: portraitOrUnknown(
      portraitText(flat, ['assetLiabilityRatio', 'debtAssetRatio']),
    ),
    rdRatio: portraitOrUnknown(
      portraitText(flat, ['rdRatio', 'researchExpenseRatio']),
    ),
    inventionPatents: portraitCount(flat, [
      'inventionPatentNum',
      'inventionPatentCount',
    ]),
    utilityPatents: portraitCount(flat, [
      'utilityPatentNum',
      'utilityModelNum',
    ]),
    softwareCopyrights: portraitCount(flat, [
      'softrightNum',
      'softwareCopyrightNum',
    ]),
    trademarks: portraitCount(flat, ['brandNum', 'trademarkNum']),
    rdEquipmentValue: portraitOrUnknown(
      portraitText(flat, ['rdEquipmentValue', 'rdEquipmentOriginalValue']),
    ),
    standards: portraitOrUnknown(
      portraitText(flat, ['standardConstruction', 'standards']),
    ),
    systemLicenses: portraitOrUnknown(
      portraitText(flat, ['systemLicense', 'systemPermits']),
    ),
    infoSoftware: portraitOrUnknown(
      portraitText(flat, ['informationSoftware', 'infoSoftware']),
    ),
  }
}

export type EnterpriseExtras = {
  policyRecords?: EnterprisePolicyRecord[]
  patents?: EnterprisePatent[]
  trademarks?: EnterpriseTrademark[]
  softwareCopyrights?: EnterpriseSoftwareCopyright[]
  workCopyrights?: EnterpriseWorkCopyright[]
  qualifications?: EnterpriseQualification[]
  qualificationPersonnel?: EnterpriseQualPersonnel[]
  qualificationReviews?: EnterpriseQualReview[]
  shareholders?: EnterpriseShareholder[]
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
  const flat = mergeDefined(industryExt, industry, enterprise)
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
  const contactPhone = (extras.contacts ?? [])
    .map((item) => item.phone.trim())
    .find(Boolean)
  const contactEmail = (extras.contacts ?? [])
    .map((item) => item.email.trim())
    .find(Boolean)
  return {
    ...root,
    ...flat,
    ...card,
    policyCount: extras.policyCount ?? card.policyCount,
    shortName: shortNameOf(card.name),
    district: pickString(flat, ['districtName'], '-'),
    staffCount: pickNumber(flat, ['socialSecurityNum', 'staffNumber']),
    honorTags: [],
    publicityAmount: 0,
    legalRep: pickString(flat, ['legalPerson'], '-'),
    registeredCapital: displayRegisteredCapital(
      pickString(flat, ['registeredCapital']),
    ),
    creditCode: pickString(flat, ['creditCode'], '-'),
    enterpriseType: pickString(flat, ['companyType'], '-'),
    phone: contactPhone || pickString(flat, ['phone'], '-'),
    email: contactEmail || pickString(flat, ['email'], '-'),
    foundedDate: formatDate(pick(flat, ['establishTime'])),
    staffScale: pickString(flat, ['staffNumber'], '-') || '-',
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
      approvalDate: displayDate(pick(industry, ['approveDate'])),
      insuredCount: pickNumber(industry, ['socialSecurityNum']),
      formerName: former || '-',
      registeredAddress: pickString(
        industry,
        ['registerAddress'],
        card.address,
      ),
      addressChangeDate: displayDate(pick(industry, ['addressLastChangeDate'])),
    },
    policyRecords: extras.policyRecords ?? [],
    patents: extras.patents ?? [],
    trademarks: extras.trademarks ?? [],
    softwareCopyrights: extras.softwareCopyrights ?? [],
    workCopyrights: extras.workCopyrights ?? [],
    qualifications: extras.qualifications ?? [],
    qualificationPersonnel: extras.qualificationPersonnel ?? [],
    qualificationReviews: extras.qualificationReviews ?? [],
    shareholders: extras.shareholders ?? [],
    contacts: extras.contacts ?? [],
    products: extras.products ?? [],
    industryChains: chains,
    productBasis: pickString(industryExt, ['products']),
    productCredibility: '',
    portrait: mapEnterprisePortrait(raw),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    policyId: pickString(record, ['policyId', 'standardPolicyId']),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
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
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    category: pickString(record, ['certType', 'category'], '-'),
    name: pickString(record, ['certName', 'name']),
    certNo: pickString(record, ['certNo', 'certificateNo'], '-'),
    issueDate: issue,
    validUntil: formatDate(pick(record, ['validUntil', 'expireDate'])),
    year: pickNumber(record, ['year'], Number(issue.slice(0, 4)) || 0),
  }
}

export const mapShareholder = (
  raw: unknown,
  index: number,
): EnterpriseShareholder => {
  const record = asRecord(raw)
  return {
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    name: pickString(record, ['name', 'shareholderName'], '-'),
    shareholderType: pickString(record, ['shareholderType', 'type'], '-'),
    shareholdingRatio: ratioText(
      pick(record, ['shareholdingRatio', 'shareRatio']),
    ),
    subscribedCapital: pickString(record, ['subscribedCapital'], '-'),
    paidInCapital: pickString(record, ['paidInCapital'], '-'),
    shouldProportion: pickString(record, ['shouldProportion'], '-'),
  }
}

export const mapCertPerson = (
  raw: unknown,
  index: number,
): EnterpriseQualPersonnel => {
  const record = asRecord(raw)
  const issueDate = formatDate(pick(record, ['issueDate', 'date']))
  return {
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    name: pickString(record, ['personName', 'name'], '-'),
    personType: pickString(record, ['personType', 'type'], '-'),
    certNo: pickString(record, ['certNo', 'certificateNo'], '-'),
    issueDate,
    expireDate: formatDate(pick(record, ['expireDate', 'validUntil'])),
    status: pickString(record, ['status'], '-'),
    issuer: pickString(record, ['issuer', 'issueOrg'], '-'),
    year: yearOf(issueDate),
  }
}

export const mapCertReview = (
  raw: unknown,
  index: number,
): EnterpriseQualReview => {
  const record = asRecord(raw)
  const announceDate = formatDate(
    pick(record, ['reviewTime', 'announceDate', 'date']),
  )
  return {
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    matter: pickString(record, ['content', 'matter', 'reviewContent'], '-'),
    decision: pickString(record, ['result', 'decision'], '-'),
    reason: pickString(record, ['reason'], '-'),
    announceDate,
    year: yearOf(announceDate),
  }
}

const CONTACT_EMAIL_TYPE = 3

export const mapContact = (raw: unknown, index: number): EnterpriseContact => {
  const record = asRecord(raw)
  const detail = pickString(record, [
    'contactDetail',
    'detail',
    'phone',
    'mobile',
  ])
  const contactType = Number(pick(record, ['contactType']))
  const emailLike = contactType === CONTACT_EMAIL_TYPE || detail.includes('@')
  return {
    ...record,
    id: pickString(record, ['id'], String(index + 1)),
    name: pickString(record, ['contactPerson', 'person', 'name'], '-'),
    title: pickString(record, ['contactPosition', 'position', 'title'], '-'),
    phone: emailLike ? '' : detail,
    email: emailLike ? detail : pickString(record, ['email']),
  }
}

export const mapProducts = (raw: unknown): EnterpriseProduct[] => {
  const record = asRecord(raw)
  const items = Array.isArray(record.items) ? record.items : []
  return items.map((item, index) => {
    const product = asRecord(item)
    return {
      ...product,
      id: index + 1,
      name: pickString(product, ['name']),
      icon: 'default' as const,
    }
  })
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
  const rawResult = pick(record, ['result', 'approvalResult'])
  const resultNumber = Number(rawResult)
  const resultText = String(rawResult ?? '')
  const result: InvestResult =
    Number.isInteger(resultNumber) && resultNumber >= 0 && resultNumber <= 4
      ? (resultNumber as InvestResult)
      : /不通过|驳回|未通过|rejected/i.test(resultText)
        ? 2
        : /不予受理/.test(resultText)
          ? 3
          : /撤销|撤回/.test(resultText)
            ? 4
            : /通过|passed/i.test(resultText)
              ? 1
              : 0
  const resultLabel =
    pickString(record, ['resultLabel', 'resultRaw', 'resultText']) ||
    investResultLabels[result]
  const rawUrl = pickString(record, ['url'])
  return {
    ...record,
    id: pickString(
      record,
      ['id'],
      String(hashCode(code || pickString(record, ['name']))),
    ),
    code: code || '-',
    name: pickString(record, ['name', 'projectName']),
    approvalUnit: pickString(record, ['approveType', 'approvalUnit'], '-'),
    result,
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
  const nested = asRecord(record.policy ?? record.policyCard ?? record.card)
  const flat = { ...nested, ...record }
  const levelValue = pick(flat, ['policyLevel'])
  const amount = pick(flat, [
    'maxAmount',
    'amount',
    'subsidyAmount',
    'maxSubsidy',
  ])
  const amountNumber = Number(amount)
  const note = pickString(flat, [
    'incubatorNote',
    'reexamineDesc',
    'listMeaning',
    'matchNote',
  ])
  const authority = asRecord(flat.issuingAuthority)
  const scoreRaw = pick(flat, ['score', 'fraction', 'matchScore'])
  const scoreNum = Number(scoreRaw)
  const score =
    scoreRaw === undefined || scoreRaw === null || scoreRaw === ''
      ? null
      : Number.isFinite(scoreNum)
        ? scoreNum
        : null
  return {
    ...flat,
    id: pickString(flat, ['policyId', 'id']),
    name: pickString(flat, [
      'policyCardName',
      'name',
      'title',
      'depotName',
      'policyName',
    ]),
    badge: matchBadge(flat),
    grade:
      pickString(flat, ['grade', 'depotLevel', 'listLevel']) ||
      (levelValue !== undefined ? levelLabel(mapPolicyLevel(levelValue)) : ''),
    score,
    department:
      pickString(authority, ['displayName', 'name']) ||
      pickString(flat, ['department', 'depotDepartment', 'authorityName'], '-'),
    status: matchStatus(
      pick(flat, ['status', 'statusType', 'newsStatus', 'dynamicState']),
    ),
    maxAmount:
      amount === undefined || !Number.isFinite(amountNumber)
        ? undefined
        : amountNumber,
    amountLines: matchAmountLines(flat),
    highlight: record.highlight === true || record.isHighlight === true,
    incubatorNote: note || undefined,
  }
}

export type MatchedEnterprise = {
  id: string
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
    pickString(enterprise, ['id', 'enterpriseId']) ||
    pickString(record, ['enterpriseId', 'entId', 'id'])
  return {
    ...flat,
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
      pick(flat, [
        'establishTime',
        'foundedDate',
        'establishDate',
        'establishYear',
      ]),
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
  id: string
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
    ...record,
    id: pickString(record, ['id']),
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
      const record = asRecord(item)
      const name = pickString(record, ['name', 'label'])
      const id = pickString(record, ['id'])
      return name && id ? { label: name, value: id } : null
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
