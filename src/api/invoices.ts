import { request } from '@/utils/request'
import { asPage, compactParams, type PageQuery } from '@/api/paging'

/**
 * 发票类型。Swagger 只给出 1 / 2，与表单选项顺序一致：
 * 1 增值税普通发票，2 增值税专用发票。
 */
export const InvoiceType = {
  Ordinary: 1,
  Special: 2,
} as const

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType]

/**
 * 申请单状态。对应状态机 Pending→Issued→Sent，以及 Pending|Issued→Cancelled。
 * 1 待开票，2 已开票，3 已发送，4 已取消（用户撤销或管理端作废）。
 */
export const InvoiceApplicationStatus = {
  Pending: 1,
  Issued: 2,
  Sent: 3,
  Cancelled: 4,
} as const

export type InvoiceApplicationStatus =
  (typeof InvoiceApplicationStatus)[keyof typeof InvoiceApplicationStatus]

/** 发票金额由分转为元，保留两位小数。 */
export const formatInvoiceAmount = (amount?: number | null) => {
  const fen = Number(amount)
  if (!Number.isFinite(fen)) return '0.00'
  return (Math.round(fen) / 100).toFixed(2)
}

export const invoiceTypeLabel = (type?: number | null) => {
  if (type === InvoiceType.Ordinary) return '普票'
  if (type === InvoiceType.Special) return '专票'
  return '—'
}

export const invoiceStatusLabel = (status?: number | null) => {
  switch (status) {
    case InvoiceApplicationStatus.Pending:
      return '待开票'
    case InvoiceApplicationStatus.Issued:
      return '已开票'
    case InvoiceApplicationStatus.Sent:
      return '已发送'
    case InvoiceApplicationStatus.Cancelled:
      return '已取消'
    default:
      return '—'
  }
}

/** GET /account/invoices/applications 单条申请 */
export type InvoiceApplication = {
  id?: number
  applyNo?: string | null
  orderNo?: string | null
  applyDate?: string | null
  invoiceType?: number
  companyName?: string | null
  taxNumber?: string | null
  bankName?: string | null
  bankAccount?: string | null
  address?: string | null
  email?: string | null
  /** 发票金额，单位分 */
  amount?: number
  status?: number
  invoiceNo?: string | null
  invoiceFileUrl?: string | null
  issuedAt?: string | null
  /** 发送渠道。Swagger 只给出 1 / 2，展示时以 sendTarget 为准 */
  sendChannel?: number | null
  sendTarget?: string | null
  sentAt?: string | null
  remark?: string | null
  createTime?: string | null
}

/** POST /account/invoices/applications */
export type CreateInvoiceApplicationPayload = {
  invoiceType: number
  companyName: string
  taxNumber: string
  email: string
  /** 发票金额，单位分，不得超过订单实付 */
  amount: number
  orderNo?: string
  /** 申请日期，不得晚于当天 */
  applyDate?: string
  bankName?: string
  bankAccount?: string
  address?: string
}

/** GET /account/invoices/applications 我的开票记录 */
export const fetchInvoiceApplications = async (query: PageQuery = {}) => {
  const pageIndex = query.pageIndex ?? 1
  const pageSize = query.pageSize ?? 10
  const data = await request({
    url: '/account/invoices/applications',
    method: 'get',
    params: compactParams({ pageIndex, pageSize }),
    hideError: true,
  })
  const page = asPage<InvoiceApplication>(data)
  return {
    items: page.items,
    pageIndex: page.pageIndex || pageIndex,
    pageSize: page.pageSize || pageSize,
    totalElements: page.totalElements,
  }
}

/** GET /account/invoices/applications/{id} */
export const fetchInvoiceApplication = (id: number | string) => {
  return request<InvoiceApplication>({
    url: `/account/invoices/applications/${id}`,
    method: 'get',
    hideError: true,
  })
}

/** POST /account/invoices/applications 提交开票申请 */
export const createInvoiceApplication = (
  data: CreateInvoiceApplicationPayload,
) => {
  return request<InvoiceApplication>({
    url: '/account/invoices/applications',
    method: 'post',
    data,
    hideError: true,
  })
}

/** POST /account/invoices/applications/{id}/cancel 撤销待开票申请 */
export const cancelInvoiceApplication = (id: number | string) => {
  return request<InvoiceApplication>({
    url: `/account/invoices/applications/${id}/cancel`,
    method: 'post',
    hideError: true,
  })
}
