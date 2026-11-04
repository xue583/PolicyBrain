import rawCatalog from '@/mock/apiCatalog.json'

export interface ApiField {
  name: string
  description?: string
  requestType?: string
  required?: boolean
  dataType: string
  schema?: string
  children?: ApiField[]
}

export interface ApiStatus {
  code: number
  text: string
  schema: string
}

export interface ApiDocument {
  title: string
  method: string
  path: string
  requestContentType: string
  responseContentType: string
  params: ApiField[]
  statuses: ApiStatus[]
  responseParams: ApiField[]
  example: string
}

export interface ApiItem {
  id: number
  name: string
  description: string
  code: string
  returnData: string
  isOpen: boolean
  doc: ApiDocument
}

export interface ApiCategory {
  name: string
  count: number
  items: ApiItem[]
}

const normalizeField = (field: ApiField): ApiField => ({
  ...field,
  description: field.description ?? '',
  children: field.children?.map(normalizeField),
})

export const apiCategories: ApiCategory[] = (
  rawCatalog as unknown as ApiCategory[]
).map((category) => ({
  ...category,
  items: category.items.map((item) => ({
    ...item,
    description: item.description ?? '',
    code: item.code ?? '',
    doc: {
      ...item.doc,
      params: (item.doc.params ?? []).map(normalizeField),
      statuses: (item.doc.statuses ?? []).map((status) => ({
        ...status,
        schema: status.schema ?? '',
      })),
      responseParams: (item.doc.responseParams ?? []).map(normalizeField),
      example: item.doc.example ?? '',
    },
  })),
}))

export const totalApiCount = apiCategories.reduce(
  (sum, category) => sum + category.items.length,
  0,
)

export const findApiItem = (id: number) => {
  for (const category of apiCategories) {
    const found = category.items.find((item) => item.id === id)
    if (found) return found
  }
  return undefined
}
