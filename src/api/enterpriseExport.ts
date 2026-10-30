import { request } from '@/utils/request'
import {
  asPage,
  compactParams,
  type PageData,
  type PageQuery,
} from '@/api/paging'
import { asRecord, pickNumber, pickString } from '@/api/record'

/** 导出列表行。高级筛选与按政策返回企业字段，批量查询返回 index/name/address/industry/policyCount。 */
export type ExportEnterpriseRow = {
  id: number
  name: string
  address: string
  industry: string
  policyCount: number
}

export type EnterpriseAdvancedQuery = {
  keyword?: string
  provinceId?: number
  cityId?: number
  districtId?: number
  industries?: string
  companyTypes?: string
  patentNumMin?: number
  softrightNumMin?: number
  brandNumMin?: number
  copyrightWorkNumMin?: number
  moneyStartWan?: number
  moneyEndWan?: number
  yearStart?: number
  yearEnd?: number
}

export type EnterprisePolicyQuery = {
  policyId?: number
  policyName?: string
  yearStart?: number
  yearEnd?: number
  provinceId?: number
  cityId?: number
  districtId?: number
}

/** 1 = 高级筛选，2 = 按已获政策。 */
export type EnterpriseExportJobRequest = {
  queryType: 1 | 2
  advanced?: EnterpriseAdvancedQuery
  policy?: EnterprisePolicyQuery
}

export type EnterpriseExportJob = {
  jobId: string
  queryType: number
  /** 0 排队，1 导出中，2 已完成，3 失败 */
  status: number
  statusText: string
  progress: number
  totalCount: number
  exportedCount: number
  fileName: string
  downloadUrl: string
  message: string
}

export type BatchQueryPage = PageData<ExportEnterpriseRow> & {
  token: string
  unmatchedNames: string[]
}

export type ExportFilterInput = {
  keyword: string
  policies: string[]
  year: number | null
  provinceId?: number | null
  industry: string
  ip: string
  capital: string
  age: string
  economy: string
}

const IP_LIMITS: Record<string, 'patentNumMin' | 'softrightNumMin'> = {
  发明专利: 'patentNumMin',
  实用新型: 'patentNumMin',
  外观设计: 'patentNumMin',
  软件著作权: 'softrightNumMin',
}

const CAPITAL_RANGES: Record<string, { start?: number; end?: number }> = {
  '100万以下': { end: 100 },
  '100-500万': { start: 100, end: 500 },
  '500-1000万': { start: 500, end: 1000 },
  '1000万-5000万': { start: 1000, end: 5000 },
  '5000万以上': { start: 5000 },
}

const AGE_RANGES: Record<string, { start?: number; end?: number }> = {
  '1年以内': { end: 1 },
  '1-3年': { start: 1, end: 3 },
  '3-5年': { start: 3, end: 5 },
  '5-10年': { start: 5, end: 10 },
  '10年以上': { start: 10 },
}

const pageParams = (page?: PageQuery) =>
  compactParams({
    pageIndex: page?.pageIndex ?? 1,
    pageSize: page?.pageSize ?? 10,
  })

const regionText = (record: Record<string, unknown>) =>
  ['provinceName', 'cityName', 'districtName']
    .map((key) => pickString(record, [key]))
    .filter((item) => item && item !== '-')
    .join('')

export const mapExportEnterprise = (
  raw: unknown,
  index = 0,
): ExportEnterpriseRow => {
  const record = asRecord(raw)
  const address = pickString(record, ['address'])
  return {
    id: pickNumber(record, ['id', 'index'], index + 1),
    name: pickString(record, ['name']),
    address: address || regionText(record) || '-',
    industry: pickString(record, ['industry', 'companyIndustry'], '-') || '-',
    policyCount: pickNumber(record, ['policyCount', 'policySupportCount']),
  }
}

export const mapExportEnterprisePage = (
  raw: unknown,
): PageData<ExportEnterpriseRow> => {
  const page = asPage<unknown>(raw)
  return {
    ...page,
    items: page.items.map((item, index) => mapExportEnterprise(item, index)),
  }
}

export const mapBatchQueryPage = (raw: unknown): BatchQueryPage => {
  const record = asRecord(raw)
  const unmatched = record.unmatchedNames
  return {
    ...mapExportEnterprisePage(raw),
    token: pickString(record, ['token']),
    unmatchedNames: Array.isArray(unmatched)
      ? unmatched.map((item) => String(item)).filter(Boolean)
      : [],
  }
}

export const mapEnterpriseExportJob = (raw: unknown): EnterpriseExportJob => {
  const record = asRecord(raw)
  return {
    jobId: pickString(record, ['jobId']),
    queryType: pickNumber(record, ['queryType']),
    status: pickNumber(record, ['status']),
    statusText: pickString(record, ['statusText']),
    progress: pickNumber(record, ['progress']),
    totalCount: pickNumber(record, ['totalCount']),
    exportedCount: pickNumber(record, ['exportedCount']),
    fileName: pickString(record, ['fileName']),
    downloadUrl: pickString(record, ['downloadUrl', 'url']),
    message: pickString(record, ['message']),
  }
}

export const mapExportDownloadUrl = (raw: unknown) =>
  pickString(asRecord(raw), ['url', 'downloadUrl'])

/** 页面筛选项 → POST /export/enterprises/search。知识产权「无」没有对应下限字段，不传。 */
export const toAdvancedQuery = (
  filters: ExportFilterInput,
): EnterpriseAdvancedQuery => {
  const query: EnterpriseAdvancedQuery = {}
  const keyword = filters.keyword.trim()
  if (keyword) query.keyword = keyword
  if (filters.provinceId) query.provinceId = filters.provinceId
  if (filters.industry) query.industries = filters.industry
  if (filters.economy) query.companyTypes = filters.economy
  const ipKey = IP_LIMITS[filters.ip]
  if (ipKey) query[ipKey] = 1
  const capital = CAPITAL_RANGES[filters.capital]
  if (capital?.start != null) query.moneyStartWan = capital.start
  if (capital?.end != null) query.moneyEndWan = capital.end
  const age = AGE_RANGES[filters.age]
  if (age?.start != null) query.yearStart = age.start
  if (age?.end != null) query.yearEnd = age.end
  return query
}

/** 政策名称至少要有关键词或一个热门政策。多年份多选时名称用逗号拼成一次模糊查询。 */
export const toPolicyQuery = (
  filters: ExportFilterInput,
): EnterprisePolicyQuery | null => {
  const policyName =
    filters.keyword.trim() || filters.policies.filter(Boolean).join(',')
  if (!policyName) return null
  const query: EnterprisePolicyQuery = { policyName }
  if (filters.year) {
    query.yearStart = filters.year
    query.yearEnd = filters.year
  }
  return query
}

export const buildExportJobRequest = (
  tab: 'basic' | 'policy',
  filters: ExportFilterInput,
): EnterpriseExportJobRequest | null => {
  if (tab === 'policy') {
    const policy = toPolicyQuery(filters)
    if (!policy) return null
    return { queryType: 2, policy }
  }
  return { queryType: 1, advanced: toAdvancedQuery(filters) }
}

/** POST /export/enterprises/search */
export const searchExportEnterprises = async (
  query: EnterpriseAdvancedQuery,
  page?: PageQuery,
) => {
  const data = await request({
    url: '/export/enterprises/search',
    method: 'post',
    params: pageParams(page),
    data: query,
    hideError: true,
  })
  return mapExportEnterprisePage(data)
}

/** POST /export/enterprises/search-by-policy */
export const searchEnterprisesByPolicy = async (
  query: EnterprisePolicyQuery,
  page?: PageQuery,
) => {
  const data = await request({
    url: '/export/enterprises/search-by-policy',
    method: 'post',
    params: pageParams(page),
    data: query,
    hideError: true,
  })
  return mapExportEnterprisePage(data)
}

/** POST /export/enterprises/batch-query，模板字段名为 file。 */
export const submitEnterpriseBatchQuery = async (
  file: File,
  page?: PageQuery,
) => {
  const body = new FormData()
  body.append('file', file, file.name)
  const data = await request({
    url: '/export/enterprises/batch-query',
    method: 'post',
    params: pageParams(page),
    data: body,
    hideError: true,
  })
  return mapBatchQueryPage(data)
}

/** GET /export/enterprises/batch-query/{token} */
export const fetchEnterpriseBatchPage = async (
  token: string,
  page?: PageQuery,
) => {
  const data = await request({
    url: `/export/enterprises/batch-query/${encodeURIComponent(token)}`,
    method: 'get',
    params: pageParams(page),
    hideError: true,
  })
  return mapBatchQueryPage(data)
}

/** POST /export/enterprises/batch-query/{token}/export，返回预签名下载链接。 */
export const exportEnterpriseBatch = async (token: string) => {
  const data = await request({
    url: `/export/enterprises/batch-query/${encodeURIComponent(token)}/export`,
    method: 'post',
    data: {},
    hideError: true,
  })
  return mapExportDownloadUrl(data)
}

/** POST /export/enterprises/jobs */
export const createEnterpriseExportJob = async (
  body: EnterpriseExportJobRequest,
) => {
  const data = await request({
    url: '/export/enterprises/jobs',
    method: 'post',
    data: body,
    hideError: true,
  })
  return mapEnterpriseExportJob(data)
}

/** GET /export/enterprises/jobs/{jobId} */
export const fetchEnterpriseExportJob = async (jobId: string) => {
  const data = await request({
    url: `/export/enterprises/jobs/${encodeURIComponent(jobId)}`,
    method: 'get',
    hideError: true,
  })
  return mapEnterpriseExportJob(data)
}

/** GET /export/enterprises/jobs。status：0 排队，1 导出中，2 已完成，3 失败。 */
export const fetchEnterpriseExportJobs = async (
  page?: PageQuery,
  status?: number,
) => {
  const data = await request({
    url: '/export/enterprises/jobs',
    method: 'get',
    params: compactParams({
      ...pageParams(page),
      status,
    }),
    hideError: true,
  })
  const pageData = asPage<unknown>(data)
  return {
    ...pageData,
    items: pageData.items.map(mapEnterpriseExportJob),
  }
}
