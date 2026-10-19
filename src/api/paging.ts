export type PageData<T> = {
  items: T[]
  pageIndex: number
  pageSize: number
  totalElements: number
}

export type PageQuery = {
  pageIndex?: number
  pageSize?: number
}

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** 列表 data 兼容 totalElements/pageIndex 与投资库的 total/page */
export const asPage = <T>(data: unknown): PageData<T> => {
  const body = asRecord(data)
  const items = Array.isArray(body.items) ? (body.items as T[]) : []
  const total = Number(body.totalElements ?? body.total ?? items.length)
  const pageSize = Number(body.pageSize ?? items.length)
  const pageIndex = Number(body.pageIndex ?? body.page ?? 1)
  return {
    items,
    pageIndex: Number.isFinite(pageIndex) ? pageIndex : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : items.length,
    totalElements: Number.isFinite(total) ? total : items.length,
  }
}

export const compactParams = (input: Record<string, unknown>) => {
  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      if (!value.length) continue
      params[key] = value.join(',')
      continue
    }
    if (typeof value === 'string' || typeof value === 'number') {
      params[key] = value
    }
  }
  return params
}
