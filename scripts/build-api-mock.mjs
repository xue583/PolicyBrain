import fs from 'node:fs'
import path from 'node:path'

const source = process.argv[2]
const target = process.argv[3]
if (!source || !target) {
  console.error('usage: node scripts/build-api-mock.mjs <markdown> <json>')
  process.exit(1)
}

const lines = fs.readFileSync(source, 'utf8').split(/\r?\n/)

const decode = (value) =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const splitRow = (line) => {
  const parts = line.split('|')
  if (parts[0]?.trim() === '') parts.shift()
  if (parts.at(-1)?.trim() === '') parts.pop()
  return parts.map((cell) => cell.trim())
}

const isSeparator = (cells) =>
  cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell))

const parseFieldName = (raw) => {
  const depth = Math.floor((raw.match(/&emsp;/g) || []).length / 2)
  const name = decode(raw.replace(/&emsp;/g, ''))
  return { depth, name }
}

const compact = (value) => {
  if (Array.isArray(value)) {
    const next = value.map(compact).filter((item) => item !== undefined)
    return next.length ? next : undefined
  }
  if (value && typeof value === 'object') {
    const next = {}
    for (const [key, item] of Object.entries(value)) {
      const cleaned = compact(item)
      if (cleaned !== undefined && cleaned !== '') next[key] = cleaned
    }
    return Object.keys(next).length ? next : undefined
  }
  if (value === undefined || value === null || value === '') return undefined
  return value
}

const buildTree = (rows, mapRow) => {
  const roots = []
  const stack = [{ depth: -1, children: roots }]
  for (const row of rows) {
    if (!row.length || isSeparator(row) || row[0] === '参数名称') continue
    const { depth, name } = parseFieldName(row[0] || '')
    if (!name) continue
    const node = { ...mapRow(row, name), children: [] }
    while (stack.at(-1).depth >= depth) stack.pop()
    stack.at(-1).children.push(node)
    stack.push({ depth, children: node.children })
  }
  const prune = (nodes) => {
    for (const node of nodes) {
      if (node.children.length) prune(node.children)
      else delete node.children
    }
  }
  prune(roots)
  return roots
}

const parseRequest = (rows) =>
  buildTree(rows, (row, name) => ({
    name,
    description: decode(row[1] || ''),
    requestType: row[2] || undefined,
    required:
      row[3] === 'true' ? true : row[3] === 'false' ? false : undefined,
    dataType: row[4] || '',
    schema: row[5] || undefined,
  }))

const parseResponse = (rows) =>
  buildTree(rows, (row, name) => ({
    name,
    description: decode(row[1] || ''),
    dataType: row[2] || '',
    schema: row[3] || undefined,
  }))

const parseStatuses = (rows) =>
  rows
    .filter(
      (row) =>
        row.length >= 3 && !isSeparator(row) && row[0] !== '状态码' && row[0],
    )
    .map((row) => ({
      code: Number(row[0]),
      text: row[1] || '',
      schema: row[2] || '',
    }))
    .filter((item) => Number.isFinite(item.code))

const summarizeReturn = (params) => {
  const data = params.find((item) => item.name === 'data')
  const labels = (data?.children ?? [])
    .map((item) => item.description || item.name)
    .filter(Boolean)
  if (!labels.length) return data?.description || '响应数据'
  const head = labels.slice(0, 6)
  return head.join('、') + (labels.length > 6 ? '等' : '')
}

const categories = []
let category = null
let api = null
let mode = null
let table = []
let exampleStatus = null
let exampleLines = []
let inFence = false
const warnings = []

const commitTable = () => {
  if (!api || !table.length) {
    table = []
    return
  }
  if (mode === 'request') api.requestRows = table
  else if (mode === 'status') api.statusRows = table
  else if (mode === 'response' && exampleStatus != null) {
    api.responseByStatus[exampleStatus] = table
  }
  table = []
}

const startApi = (title) => {
  commitTable()
  api = {
    title,
    description: '',
    method: '',
    path: '',
    requestContentType: '',
    responseContentType: '',
    requestRows: [],
    statusRows: [],
    responseByStatus: {},
    examples: {},
  }
  category?.items.push(api)
  mode = null
  exampleStatus = null
}

for (const line of lines) {
  if (inFence) {
    if (line.startsWith('```')) {
      if (api && exampleStatus != null) {
        api.examples[exampleStatus] = exampleLines.join('\n')
      }
      exampleLines = []
      inFence = false
      mode = null
    } else {
      exampleLines.push(line)
    }
    continue
  }

  if (line.startsWith('# ') && !line.startsWith('## ')) {
    commitTable()
    const name = line.slice(2).trim()
    if (name !== '政策大脑开放平台 API') {
      category = { name, items: [] }
      categories.push(category)
    }
    api = null
    mode = null
    continue
  }

  if (line.startsWith('## ')) {
    startApi(line.slice(3).trim())
    continue
  }

  if (!api) continue

  const meta = line.match(/^\*\*(.+?)\*\*[:：]\s*(.*)$/)
  if (meta) {
    commitTable()
    const key = meta[1]
    const value = meta[2].replace(/^`|`$/g, '').trim()
    if (key === '接口地址') api.path = value
    else if (key === '请求方式') api.method = value
    else if (key === '请求数据类型') api.requestContentType = value
    else if (key === '响应数据类型') api.responseContentType = value
    else if (key === '接口描述') api.description = decode(value)
    else if (key === '请求参数') mode = 'request'
    else if (key === '响应状态') mode = 'status'
    else if (key.startsWith('响应状态码-')) {
      exampleStatus = Number(key.slice('响应状态码-'.length))
      mode = null
    } else if (key === '响应参数') mode = 'response'
    else if (key === '响应示例') mode = 'example'
    continue
  }

  if (mode === 'example' && line.startsWith('```')) {
    inFence = true
    continue
  }

  if (
    (mode === 'request' || mode === 'status' || mode === 'response') &&
    line.startsWith('|')
  ) {
    table.push(splitRow(line))
  }
}

commitTable()

let nextId = 1
const oddSchemas = new Set()
const payload = categories.map((item) => ({
  name: item.name,
  count: item.items.length,
  items: item.items.map((entry) => {
    const matched = entry.title.match(/^(\d+)-(.+)$/)
    const code = matched?.[1] ?? ''
    const name = matched?.[2] ?? entry.title
    const params = parseRequest(entry.requestRows)
    const statuses = parseStatuses(entry.statusRows)
    const responseParams = parseResponse(entry.responseByStatus[200] || [])
    const example = entry.examples[200] || ''
    if (!entry.path) warnings.push(`missing path: ${entry.title}`)
    if (!example && responseParams.length) {
      warnings.push(`missing 200 example: ${entry.title}`)
    }
    if (!responseParams.length && !entry.title.includes('导出')) {
      warnings.push(`missing 200 params: ${entry.title}`)
    }
    for (const status of statuses) {
      if (status.code !== 200 && status.schema && status.schema !== 'ResponseVoid') {
        oddSchemas.add(`${entry.title} ${status.code} ${status.schema}`)
      }
    }
    let parsed = true
    if (example) {
      try {
        JSON.parse(example)
      } catch (error) {
        parsed = false
        warnings.push(`bad json ${entry.title}: ${error.message}`)
      }
    }
    return {
      id: nextId++,
      name,
      code,
      description: entry.description,
      returnData: responseParams.length
        ? summarizeReturn(responseParams)
        : '文件下载',
      isOpen: true,
      doc: {
        title: entry.title,
        method: entry.method || 'GET',
        path: entry.path,
        requestContentType: entry.requestContentType,
        responseContentType: entry.responseContentType,
        params,
        statuses,
        responseParams,
        example,
        exampleParsed: parsed,
      },
    }
  }),
}))

for (const categoryItem of payload) {
  for (const apiItem of categoryItem.items) {
    delete apiItem.doc.exampleParsed
  }
}

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, `${JSON.stringify(compact(payload), null, 2)}\n`)

const total = payload.reduce((sum, item) => sum + item.items.length, 0)
console.log(
  payload
    .map((item) => `${item.name}: ${item.items.length}`)
    .join('\n'),
)
console.log(`total: ${total}`)
console.log(`bytes: ${fs.statSync(target).size}`)
if (oddSchemas.size) {
  console.log('odd schemas:')
  for (const item of oddSchemas) console.log(`  ${item}`)
}
if (warnings.length) {
  console.log('warnings:')
  for (const item of warnings) console.log(`  ${item}`)
}
