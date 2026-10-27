import { request } from '@/utils/request'
import { asRecord, pickNumber, pickString } from '@/api/record'

export type HotKeyword = {
  keyword: string
  hitCount: number
}

export type HotKeywordGroups = {
  policies: HotKeyword[]
  enterprises: HotKeyword[]
}

export type HotKeywordBizType = 'policy' | 'enterprise' | 'all'

const mapKeyword = (raw: unknown): HotKeyword | null => {
  const record = asRecord(raw)
  const keyword = pickString(record, ['keyword', 'Keyword']).trim()
  if (!keyword) return null
  return {
    keyword,
    hitCount: pickNumber(record, ['hitCount', 'HitCount']),
  }
}

const mapList = (value: unknown): HotKeyword[] =>
  (Array.isArray(value) ? value : [])
    .map(mapKeyword)
    .filter((item): item is HotKeyword => item !== null)

/** 首页热门检索词。bizType=all 时同时返回政策组与企业组。 */
export const fetchHotKeywords = async (
  bizType: HotKeywordBizType = 'all',
  limit = 10,
): Promise<HotKeywordGroups> => {
  const data = await request({
    url: '/home/hot-keywords',
    method: 'get',
    params: { bizType, limit },
    hideError: true,
  })
  const body = asRecord(data)
  return {
    policies: mapList(body.policies ?? body.Policies),
    enterprises: mapList(body.enterprises ?? body.Enterprises),
  }
}
