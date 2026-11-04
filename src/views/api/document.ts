import type { ApiField } from '@/views/api/catalog'

export interface DocToken {
  kind: 'plain' | 'key' | 'str' | 'num' | 'bool'
  text: string
}

export interface DocExampleLine {
  tokens: DocToken[]
  desc?: string
}

const token = (kind: DocToken['kind'], text: string): DocToken => ({
  kind,
  text,
})

const valueToken = (value: unknown): DocToken => {
  if (typeof value === 'string') return token('str', JSON.stringify(value))
  if (typeof value === 'number') return token('num', String(value))
  if (typeof value === 'boolean') return token('bool', String(value))
  if (value === null) return token('plain', 'null')
  return token('plain', String(value))
}

const indexFields = (
  fields: ApiField[],
  prefix: string,
  descriptions: Map<string, string>,
) => {
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name
    if (field.description) descriptions.set(path, field.description)
    if (!field.children?.length) continue
    const childPrefix = field.dataType.startsWith('array') ? `${path}[]` : path
    indexFields(field.children, childPrefix, descriptions)
  }
}

const writeValue = (
  lines: DocExampleLine[],
  value: unknown,
  path: string,
  indent: number,
  comma: boolean,
  descriptions: Map<string, string>,
  key?: string,
) => {
  const pad = ' '.repeat(indent)
  const keyTokens = key
    ? [
        token('plain', pad),
        token('key', JSON.stringify(key)),
        token('plain', ': '),
      ]
    : [token('plain', pad)]
  const desc = key ? descriptions.get(path) : undefined
  const tail = comma ? ',' : ''

  if (Array.isArray(value)) {
    if (!value.length) {
      lines.push({ tokens: [...keyTokens, token('plain', `[]${tail}`)], desc })
      return
    }
    lines.push({ tokens: [...keyTokens, token('plain', '[')], desc })
    value.forEach((item, index) => {
      writeValue(
        lines,
        item,
        `${path}[]`,
        indent + 2,
        index < value.length - 1,
        descriptions,
      )
    })
    lines.push({ tokens: [token('plain', `${pad}]${tail}`)] })
    return
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (!entries.length) {
      lines.push({ tokens: [...keyTokens, token('plain', `{}` + tail)], desc })
      return
    }
    lines.push({ tokens: [...keyTokens, token('plain', '{')], desc })
    entries.forEach(([childKey, childValue], index) => {
      writeValue(
        lines,
        childValue,
        path ? `${path}.${childKey}` : childKey,
        indent + 2,
        index < entries.length - 1,
        descriptions,
        childKey,
      )
    })
    lines.push({ tokens: [token('plain', `${pad}}${tail}`)] })
    return
  }

  lines.push({
    tokens: [
      ...keyTokens,
      valueToken(value),
      ...(comma ? [token('plain', ',')] : []),
    ],
    desc,
  })
}

export const buildExampleLines = (
  source: string,
  params: ApiField[],
): DocExampleLine[] => {
  if (!source.trim()) return []
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    return source.split('\n').map((text) => ({
      tokens: [token('plain', text)],
    }))
  }
  const descriptions = new Map<string, string>()
  indexFields(params, '', descriptions)
  const lines: DocExampleLine[] = []
  writeValue(lines, value, '', 0, false, descriptions)
  return lines
}

export const voidResponseParams: ApiField[] = [
  { name: 'code', description: '响应码，非0 即为异常', dataType: 'string' },
  { name: 'msg', description: '响应消息', dataType: 'string' },
  { name: 'data', description: '响应数据', dataType: 'object' },
  { name: 'traceId', description: 'traceId', dataType: 'string' },
  {
    name: 'success',
    description: '是否成功（与 code=0 一致）',
    dataType: 'boolean',
  },
]

export const voidExample = `{
  "code": "0",
  "msg": "提交成功",
  "data": {},
  "traceId": "",
  "success": true
}`
