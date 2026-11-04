import QRCode from 'qrcode'
import {
  MembershipOrderStatus,
  type AccountMembership,
  type MembershipPaymentStatus,
} from '@/api/membership'

export type MembershipPaymentOutcome = 'pending' | 'paid' | 'closed' | 'expired'

const statusCode = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const hasText = (value?: string | null) => Boolean(value && value.trim())

/** 免费渠道即时开通时，支付结果会直接带上会员状态。 */
export const isMembershipActivated = (
  membership?: AccountMembership | null,
) => {
  if (!membership) return false
  return (
    hasText(membership.planCode) ||
    Number(membership.level) > 0 ||
    hasText(membership.lastOrderNo)
  )
}

/**
 * 轮询结果：已支付看 paidAt 或状态 2；
 * 未支付时 3 为关闭、4 为失效，其余继续轮询。
 */
export const readMembershipPaymentOutcome = (
  status?: MembershipPaymentStatus | null,
): MembershipPaymentOutcome => {
  if (!status) return 'pending'
  const code = statusCode(status.status)
  const orderCode = statusCode(status.order?.status)
  const paid =
    hasText(status.paidAt) ||
    hasText(status.order?.paidAt) ||
    code === MembershipOrderStatus.Paid ||
    orderCode === MembershipOrderStatus.Paid
  if (paid) return 'paid'
  if (
    code === MembershipOrderStatus.Closed ||
    orderCode === MembershipOrderStatus.Closed
  ) {
    return 'closed'
  }
  if (
    code === MembershipOrderStatus.Expired ||
    orderCode === MembershipOrderStatus.Expired
  ) {
    return 'expired'
  }
  return 'pending'
}

export const isIntentExpired = (
  expiresAt?: string | null,
  now = Date.now(),
) => {
  if (!expiresAt) return false
  const deadline = Date.parse(expiresAt)
  return Number.isFinite(deadline) && deadline <= now
}

const readyImageSrc = /^(data:image\/|https?:\/\/|blob:)/i

/** 微信 Native 返回的是待编码内容；已经是图片地址时直接展示。 */
export const resolvePaymentQrSrc = async (content?: string | null) => {
  const value = content?.trim() ?? ''
  if (!value) return ''
  if (readyImageSrc.test(value)) return value
  return QRCode.toDataURL(value, {
    margin: 1,
    width: 240,
    errorCorrectionLevel: 'M',
  })
}

export type AlipayCheckout =
  { kind: 'html'; html: string } | { kind: 'url'; url: string }

/** 支付宝收银台是自动提交表单或跳转地址，放进页面内弹窗展示。 */
export const readAlipayCheckout = (
  html?: string | null,
): AlipayCheckout | null => {
  const body = html?.trim() ?? ''
  if (!body) return null
  if (/^https?:\/\//i.test(body)) return { kind: 'url', url: body }
  return { kind: 'html', html: body }
}
