export interface DocToken {
  kind: 'plain' | 'key' | 'str' | 'num' | 'bool'
  text: string
}

export interface DocExampleLine {
  tokens: DocToken[]
  desc?: string
}

export interface ApiField {
  name: string
  description: string
  requestType?: string
  required?: boolean
  dataType: string
  schema?: string
  children?: ApiField[]
  example?: DocExampleLine[]
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
}

const token = (kind: DocToken['kind'], text: string): DocToken => ({
  kind,
  text,
})

const spaces = (count: number) => token('plain', ' '.repeat(count))

const field = (
  indent: number,
  name: string,
  value: DocToken,
  desc: string,
  options?: { comma?: boolean; gap?: string },
): DocExampleLine => ({
  tokens: [
    spaces(indent),
    token('key', `"${name}"`),
    token('plain', options?.gap ?? ':'),
    value,
    ...(options?.comma === false ? [] : [token('plain', ',')]),
  ],
  desc,
})

const responseExample: DocExampleLine[] = [
  { tokens: [token('plain', '{')] },
  field(2, 'code', token('str', '"0"'), '响应码，非0即为异常'),
  field(2, 'msg', token('str', '"提交成功"'), '响应消息'),
  {
    tokens: [spaces(2), token('key', '"data"'), token('plain', ':[')],
    desc: '响应数据',
  },
  { tokens: [spaces(4), token('plain', '{')] },
  field(6, 'id', token('num', '0'), '主键'),
  field(6, 'enterpriseId', token('num', '0'), '单位ID'),
  field(6, 'companyName', token('str', '" "'), '单位名称'),
  field(6, 'entryName', token('str', '" "'), '项目名称'),
  field(6, 'topicName', token('str', '" "'), '课题名称'),
  field(6, 'nameHref', token('str', '" "'), '链接'),
  field(6, 'year', token('str', '" "'), '年份'),
  field(6, 'level', token('num', '0'), '等级(18、19、20、21)', { gap: ': ' }),
  field(6, 'province', token('num', '0'), '省级', { gap: ': ' }),
  field(6, 'city', token('num', '0'), '市级'),
  field(6, 'area', token('num', '0'), '区级'),
  field(6, 'provinceStr', token('str', '" "'), '单位省份'),
  field(6, 'cityStr', token('str', '" "'), '单位市'),
  field(6, 'districtStr', token('str', '" "'), '单位区', { comma: false }),
  { tokens: [spaces(4), token('plain', '}')] },
  { tokens: [spaces(2), token('plain', '],')] },
  {
    tokens: [spaces(2), token('key', '"traceId"'), token('plain', ':')],
    desc: 'traceId',
  },
  field(2, 'success', token('bool', 'true'), '是否成功(与code=0一致)', {
    gap: ': ',
  }),
  field(2, 'count', token('num', '0'), '总记录数量', { comma: false }),
  { tokens: [token('plain', '}')] },
]

const voidSchema = 'ResponseVoid'

export const researchDoc: ApiDocument = {
  title: '郑州市工程研究中心',
  method: 'GET',
  path: '/v1/project/getResearchProject',
  requestContentType: 'application/x-www-form-urlencoded',
  responseContentType: '["*/*"]',
  params: [
    {
      name: 'request',
      description: '',
      requestType: 'query',
      required: true,
      dataType: 'ResearchQueryRequest',
      schema: 'ResearchQueryRequest',
      children: [
        {
          name: 'pageNum',
          description: '页码，不传默认1,示例值(1)',
          required: false,
          dataType: 'integer(int32)',
        },
        {
          name: 'pageSize',
          description: '条数，不传默认10，最大10,示例值(10)',
          required: false,
          dataType: 'integer(int32)',
        },
        {
          name: 'provinceStr',
          description: '注册地址省',
          required: false,
          dataType: 'string',
        },
        {
          name: 'cityStr',
          description: '注册地址市',
          required: false,
          dataType: 'string',
        },
        {
          name: 'districtStr',
          description: '注册地址区',
          required: false,
          dataType: 'string',
        },
        {
          name: 'level',
          description: '项目等级(18、19、20、21)',
          required: false,
          dataType: 'integer(int32)',
        },
        {
          name: 'levelId',
          description: '项目等级ID',
          required: false,
          dataType: 'integer(int32)',
        },
        {
          name: 'topicName',
          description: '关键字(课题名称)',
          required: false,
          dataType: 'string',
        },
        {
          name: 'searchModel',
          description: '检索匹配方式:phrase精准匹配，否则模糊匹配',
          required: false,
          dataType: 'string',
        },
      ],
    },
  ],
  statuses: [
    { code: 200, text: 'OK', schema: 'PageResponseListResearchResponse' },
    { code: 400, text: 'Bad Request', schema: voidSchema },
    { code: 401, text: 'Unauthorized', schema: voidSchema },
    { code: 403, text: 'Forbidden', schema: voidSchema },
    { code: 404, text: 'Not Found', schema: voidSchema },
    { code: 405, text: 'Method Not Allowed', schema: voidSchema },
    { code: 409, text: 'Conflict', schema: voidSchema },
    { code: 415, text: 'Unsupported Media Type', schema: voidSchema },
    { code: 429, text: 'Too Many Requests', schema: voidSchema },
    { code: 500, text: 'Internal Server Error', schema: voidSchema },
    { code: 502, text: 'Bad Gateway', schema: voidSchema },
  ],
  responseParams: [
    {
      name: 'code',
      description: '响应码，非0即为异常',
      dataType: 'string',
    },
    {
      name: 'msg',
      description: '响应消息',
      dataType: 'string',
    },
    {
      name: 'data',
      description: '响应数据',
      dataType: 'array',
      schema: 'ResearchResponse',
      example: responseExample,
      children: [
        { name: 'id', description: '主键', dataType: 'integer' },
        { name: 'enterpriseId', description: '单位ID', dataType: 'integer' },
        { name: 'companyName', description: '单位名称', dataType: 'string' },
        { name: 'entryName', description: '项目名称', dataType: 'string' },
        { name: 'topicName', description: '课题名称', dataType: 'string' },
        { name: 'nameHref', description: '链接', dataType: 'string' },
        { name: 'year', description: '年份', dataType: 'string' },
        {
          name: 'level',
          description: '等级(18、19、20、21)',
          dataType: 'integer',
        },
        { name: 'province', description: '省级', dataType: 'integer' },
        { name: 'city', description: '市级', dataType: 'integer' },
        { name: 'area', description: '区级', dataType: 'integer' },
        { name: 'provinceStr', description: '单位省份', dataType: 'string' },
        { name: 'cityStr', description: '单位市', dataType: 'string' },
        { name: 'districtStr', description: '单位区', dataType: 'string' },
      ],
    },
    {
      name: 'traceId',
      description: 'traceId',
      dataType: 'string',
    },
    {
      name: 'success',
      description: '是否成功(与code=0一致)',
      dataType: 'boolean',
    },
    {
      name: 'count',
      description: '总记录数量',
      dataType: 'integer(int64)',
      schema: 'integer(int64)',
    },
  ],
}
