import { request, type RequestConfig } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'

const silent = (config?: RequestConfig): RequestConfig => ({
  hideError: true,
  ...config,
})

/**
 * 会员等级，对应 Swagger MembershipLevel。
 * 0 表示无在效会员；在售计划按 0 / 1 / 2 分次查询。
 */
export const MembershipLevel = {
  None: 0,
  Vip: 1,
  Svip: 2,
} as const

export type MembershipLevel =
  (typeof MembershipLevel)[keyof typeof MembershipLevel]

/** GET /account/memberships/plans 单项。金额单位为分。 */
export type MembershipPlan = {
  code?: string | null
  name?: string | null
  level?: number
  durationType?: number
  durationDays?: number
  /** 标准售价，单位分；0 表示免费开通 */
  price?: number
  /** 划线价，单位分；0 表示不展示 */
  originalPrice?: number
  sort?: number
  description?: string | null
  /** 适用身份，PolicyUserType：1 企业专员 / 2 企服人员 */
  applicableIdentity?: number
  /** 每用户可购买次数，0 表示不限 */
  purchaseLimit?: number
  /** 当前生效实付价，单位分 */
  currentPrice?: number
}

/** GET /account/memberships/benefits 单项 */
export type MembershipBenefit = {
  /** 权益编码，同一等级内唯一 */
  code?: string | null
  name?: string | null
  level?: number
  /** 权益说明，可为空 */
  description?: string | null
  /** 排序，越小越靠前 */
  sort?: number
}

/** GET /account/memberships/benefits?level=0|1|2 */
export const fetchMembershipBenefits = (level?: MembershipLevel | number) => {
  return request<MembershipBenefit[]>({
    url: '/account/memberships/benefits',
    method: 'get',
    params: compactParams({ level }),
    ...silent(),
  })
}

/** GET /account/memberships/plans?level=0|1|2 */
export const fetchMembershipPlans = (level?: MembershipLevel | number) => {
  return request<MembershipPlan[]>({
    url: '/account/memberships/plans',
    method: 'get',
    params: compactParams({ level }),
    ...silent(),
  })
}

/** GET /account/memberships/me */
export type AccountMembership = {
  level?: number
  planCode?: string | null
  startedAt?: string | null
  expiresAt?: string | null
  remainingDays?: number
  lastOrderNo?: string | null
  /** 为 true 时是企业会员管理者，可用 managedBatches 批量分配名额 */
  isBatchManager?: boolean
  /** 当前用户管理的会员批次，结构与批次详情一致 */
  managedBatches?: MembershipBatch[] | null
}

export const fetchMyMembership = () => {
  return request<AccountMembership>({
    url: '/account/memberships/me',
    method: 'get',
    ...silent(),
  })
}

export type MembershipPayChannel = 'free' | 'wechatpay' | 'alipay'

/**
 * 会员开通订单状态。Swagger 只给出 1 / 2 / 3 / 4。
 * 1 待支付，2 已支付，3 已关闭，4 已失效。
 */
export const MembershipOrderStatus = {
  Pending: 1,
  Paid: 2,
  Closed: 3,
  Expired: 4,
} as const

export type MembershipOrderStatus =
  (typeof MembershipOrderStatus)[keyof typeof MembershipOrderStatus]

/** POST /account/memberships/orders 支付意向 */
export type MembershipIntent = {
  orderNo?: string | null
  planCode?: string | null
  planName?: string | null
  level?: number
  durationType?: number
  durationDays?: number
  /** 购买数量（名额数） */
  quantity?: number
  /** 实付金额，单位分；单价 × 数量 */
  amount?: number
  status?: number
  /** 意向失效时间，超时后需重新下单 */
  expiresAt?: string | null
  createTime?: string | null
}

/** 已提升的正式会员订单 */
export type MembershipOrder = {
  id?: number
  orderNo?: string | null
  planCode?: string | null
  planName?: string | null
  level?: number
  durationType?: number
  durationDays?: number
  /** 购买数量（名额数） */
  quantity?: number
  /** 实付金额，单位分 */
  amount?: number
  status?: number
  channel?: string | null
  channelTradeNo?: string | null
  startedAt?: string | null
  expiresAt?: string | null
  paidAt?: string | null
  createTime?: string | null
  identity?: number
}

/** GET /account/memberships/orders/by-no/{orderNo} */
export type MembershipPaymentStatus = {
  orderNo?: string | null
  status?: number
  planCode?: string | null
  planName?: string | null
  level?: number
  amount?: number
  paidAt?: string | null
  createTime?: string | null
  /** 意向已提升为正式订单时返回 */
  order?: MembershipOrder | null
}

/** POST /account/memberships/orders/{orderNo}/payments */
export type MembershipPaymentTicket = {
  channel?: string | null
  /** 微信 Native 二维码内容；支付宝电脑网站支付为空 */
  qrCodeContent?: string | null
  /** 支付宝电脑网站支付的自动提交表单 HTML */
  redirectHtml?: string | null
  membership?: AccountMembership | null
}

const orderPath = (orderNo: string) => encodeURIComponent(orderNo)

/**
 * 企业套餐编码以 ent_ 开头。
 * 个人套餐与企业套餐同等级售卖，只能靠编码区分。
 */
export const isEnterprisePlanCode = (code?: string | null) =>
  /^ent_/i.test((code ?? '').trim())

/**
 * 创建支付意向。返回的 orderNo 用于发起支付和轮询。
 * 企业套餐传入购买人数；其他会员 quantity 固定为 1。
 */
export const createMembershipOrder = (planCode: string, quantity = 1) => {
  const count = Number(quantity)
  const seats = Number.isInteger(count) && count >= 1 ? count : 1
  return request<MembershipIntent>({
    url: '/account/memberships/orders',
    method: 'post',
    data: { planCode, quantity: seats },
  })
}

/** 对支付意向发起支付。channel 为 wechatpay、alipay 或 free。 */
export const createMembershipPayment = (
  orderNo: string,
  channel?: MembershipPayChannel,
) => {
  return request<MembershipPaymentTicket>({
    url: `/account/memberships/orders/${orderPath(orderNo)}/payments`,
    method: 'post',
    data: compactParams({ channel }),
  })
}

/** 按意向单号轮询支付状态。 */
export const fetchMembershipOrder = (orderNo: string) => {
  return request<MembershipPaymentStatus>({
    url: `/account/memberships/orders/by-no/${orderPath(orderNo)}`,
    method: 'get',
    ...silent(),
  })
}

/** GET /account/memberships/orders 分页查询当前用户的会员订单 */
export const fetchMembershipOrders = async (query: PageQuery = {}) => {
  const pageIndex = query.pageIndex ?? 1
  const pageSize = query.pageSize ?? 10
  const data = await request({
    url: '/account/memberships/orders',
    method: 'get',
    params: compactParams({ pageIndex, pageSize }),
    ...silent(),
  })
  const page = asPage<MembershipOrder>(data)
  return {
    items: page.items,
    pageIndex: page.pageIndex || pageIndex,
    pageSize: page.pageSize || pageSize,
    totalElements: page.totalElements,
  }
}

/**
 * 名额状态。1 待分配，2 已分配。
 * 待分配时 holderPhone 为空，判断时以手机号为准。
 */
export const MembershipSlotStatus = {
  Pending: 1,
  Allocated: 2,
} as const

export type MembershipSlotStatus =
  (typeof MembershipSlotStatus)[keyof typeof MembershipSlotStatus]

/** GET /account/memberships/batches/{orderNo} 的名额行 */
export type MembershipSlot = {
  id?: number | string
  orderNo?: string | null
  level?: number
  durationType?: number
  durationDays?: number
  status?: number
  /** 持有者手机号，待分配为空 */
  holderPhone?: string | null
  allocatedAt?: string | null
}

/** GET /account/memberships/batches/{orderNo} */
export type MembershipBatch = {
  order?: MembershipOrder | null
  slots?: MembershipSlot[] | null
  totalCount?: number
  allocatedCount?: number
  unallocatedCount?: number
}

/** 批次详情：订单 + 名额列表 + 汇总。orderNo 取当前会员最近一笔生效订单。 */
export const fetchMembershipBatch = (orderNo: string) => {
  return request<MembershipBatch>({
    url: `/account/memberships/batches/${orderPath(orderNo)}`,
    method: 'get',
    ...silent(),
  })
}

/** 把一个空名额分配给已注册手机号，被分配者时长叠加。 */
export const allocateMembershipSlot = (
  slotId: number | string,
  phone: string,
) => {
  return request<MembershipSlot>({
    url: `/account/memberships/slots/${encodeURIComponent(String(slotId))}/allocation`,
    method: 'post',
    data: { phone },
  })
}
