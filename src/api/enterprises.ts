import { request } from '@/utils/request'
import {
  asPage,
  compactParams,
  type PageData,
  type PageQuery,
  type RegionIdQuery,
} from '@/api/paging'
import { asRecord, pickString } from '@/api/record'
import {
  mapCertPerson,
  mapCertReview,
  mapContact,
  mapEnterpriseCard,
  mapEnterpriseDetail,
  mapPatent,
  mapShareholder,
  mapPolicyRecord,
  mapProducts,
  mapQualification,
  mapSoftware,
  mapTrademark,
  mapWork,
  type EnterpriseExtras,
} from '@/api/mapPortal'
import { softFail } from '@/utils/softFail'

export type EnterpriseQuery = PageQuery &
  RegionIdQuery & {
    keyword?: string
    industries?: string[]
  }

export const fetchEnterprisePage = async (query: EnterpriseQuery) => {
  const keyword = query.keyword?.trim()
  const data = await request({
    url: keyword ? '/search/enterprises' : '/enterprises',
    method: 'get',
    params: compactParams({
      keyword,
      ...(keyword ? { q: keyword } : {}),
      provinceId: query.provinceId,
      cityId: query.cityId,
      districtId: query.districtId,
      industries: query.industries,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }),
    hideError: true,
  })
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapEnterpriseCard) }
}

/** 绑定企业下拉项。搜索结果带 creditCode，选中后回填到表单。 */
export type EnterpriseBindOption = {
  id: string
  name: string
  creditCode: string
}

export const mapEnterpriseBindOption = (
  raw: unknown,
): EnterpriseBindOption | null => {
  const record = asRecord(raw)
  const nested = asRecord(record.enterprise)
  const source = { ...record, ...nested }
  const id = pickString(source, ['id', 'enterpriseId']).trim()
  const name = pickString(source, ['name', 'enterpriseName']).trim()
  const creditCode = pickString(source, [
    'creditCode',
    'unifiedSocialCreditCode',
  ])
    .replace(/\s+/g, '')
    .toUpperCase()
  if (!/^[1-9]\d*$/.test(id) || !name) return null
  return { id, name, creditCode }
}

/** GET /search/enterprises，供绑定弹窗按名称检索 */
export const searchEnterpriseBindOptions = async (keyword: string) => {
  const text = keyword.trim()
  const data = await request({
    url: '/search/enterprises',
    method: 'get',
    params: compactParams({
      keyword: text,
      q: text,
      pageIndex: 1,
      pageSize: 20,
    }),
    hideError: true,
  })
  return asPage<unknown>(data)
    .items.map(mapEnterpriseBindOption)
    .filter((item): item is EnterpriseBindOption => item != null)
}

/** GET /enterprises/{id} 企业详情画像。隐藏或不存在时 404。 */
export const fetchEnterpriseRaw = (id: string) => {
  return request({
    url: `/enterprises/${id}`,
    method: 'get',
    hideError: true,
  })
}

const emptyPage = (): PageData<unknown> => ({
  items: [],
  pageIndex: 1,
  pageSize: 0,
  totalElements: 0,
})

const safePage = async (url: string, params: Record<string, unknown>) => {
  try {
    const data = await request({
      url,
      method: 'get',
      params: compactParams(params),
      hideError: true,
    })
    return asPage<unknown>(data)
  } catch {
    return emptyPage()
  }
}

export const fetchEnterpriseDetail = async (id: string) => {
  const raw = await fetchEnterpriseRaw(id)
  const [
    supports,
    patents,
    trademarks,
    software,
    works,
    qualifications,
    certPersons,
    certReviews,
    shareholders,
    contacts,
    products,
  ] = await Promise.all([
    safePage(`/enterprises/${id}/policy-supports`, {
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/ip-assets`, {
      type: 'patent',
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/ip-assets`, {
      type: 'trademark',
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/ip-assets`, {
      type: 'software',
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/ip-assets`, {
      type: 'work',
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/qualifications`, {
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/cert-persons`, {
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/cert-reviews`, {
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/shareholders`, {
      pageIndex: 1,
      pageSize: 100,
    }),
    safePage(`/enterprises/${id}/contacts`, { pageIndex: 1, pageSize: 100 }),
    request({
      url: `/enterprises/${id}/products`,
      method: 'get',
      hideError: true,
    }).catch(softFail({}, '企业产品信息')),
  ])
  const extras: EnterpriseExtras = {
    policyRecords: supports.items.map(mapPolicyRecord),
    policyCount: supports.totalElements,
    patents: patents.items.map(mapPatent),
    trademarks: trademarks.items.map(mapTrademark),
    softwareCopyrights: software.items.map(mapSoftware),
    workCopyrights: works.items.map(mapWork),
    qualifications: qualifications.items.map(mapQualification),
    qualificationPersonnel: certPersons.items.map(mapCertPerson),
    qualificationReviews: certReviews.items.map(mapCertReview),
    shareholders: shareholders.items.map(mapShareholder),
    contacts: contacts.items.map(mapContact),
    products: mapProducts(products),
  }
  return mapEnterpriseDetail(raw, extras)
}
