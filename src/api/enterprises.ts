import { request } from '@/utils/request'
import {
  asPage,
  compactParams,
  type PageData,
  type PageQuery,
  type RegionIdQuery,
} from '@/api/paging'
import {
  mapContact,
  mapEnterpriseCard,
  mapEnterpriseDetail,
  mapPatent,
  mapPolicyRecord,
  mapProducts,
  mapQualification,
  mapSoftware,
  mapTrademark,
  mapWork,
  type EnterpriseExtras,
} from '@/api/mapPortal'

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

export const fetchEnterpriseRaw = (id: number) => {
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

export const fetchEnterpriseDetail = async (id: number) => {
  const raw = await fetchEnterpriseRaw(id)
  const [
    supports,
    patents,
    trademarks,
    software,
    works,
    qualifications,
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
    safePage(`/enterprises/${id}/contacts`, { pageIndex: 1, pageSize: 100 }),
    request({
      url: `/enterprises/${id}/products`,
      method: 'get',
      hideError: true,
    }).catch(() => ({})),
  ])
  const extras: EnterpriseExtras = {
    policyRecords: supports.items.map(mapPolicyRecord),
    policyCount: supports.totalElements,
    patents: patents.items.map(mapPatent),
    trademarks: trademarks.items.map(mapTrademark),
    softwareCopyrights: software.items.map(mapSoftware),
    workCopyrights: works.items.map(mapWork),
    qualifications: qualifications.items.map(mapQualification),
    contacts: contacts.items.map(mapContact),
    products: mapProducts(products),
  }
  return mapEnterpriseDetail(raw, extras)
}
