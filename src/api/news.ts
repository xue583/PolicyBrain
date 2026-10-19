import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'
import { mapNewsItem } from '@/api/mapPortal'

export type NewsQuery = PageQuery & {
  keyword?: string
  levels?: string[]
  infoTypes?: string[]
  region?: string
  industries?: string[]
}

export const fetchNewsPage = async (query: NewsQuery) => {
  const keyword = query.keyword?.trim()
  const data = await request({
    url: keyword ? '/search/news' : '/news',
    method: 'get',
    params: compactParams({
      q: keyword,
      keyword,
      levels: query.levels,
      infoTypes: query.infoTypes,
      region: query.region,
      industries: query.industries,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }),
    hideError: true,
  })
  const page = asPage<unknown>(data)
  return { ...page, items: page.items.map(mapNewsItem) }
}

export const fetchNewsDetail = async (id: number) => {
  const data = await request({
    url: `/news/${id}`,
    method: 'get',
    hideError: true,
  })
  return mapNewsItem(data)
}
