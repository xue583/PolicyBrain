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

/** 把支付宝收银台表单写进预先打开的窗口，避免异步请求之后被拦截弹窗。 */
export const submitAlipayCheckout = (popup: Window | null, html: string) => {
  if (!popup || popup.closed) return false
  const body = html.trim()
  if (!body) return false
  if (/^https?:\/\//i.test(body)) {
    popup.location.href = body
    return true
  }
  popup.document.open()
  popup.document.write(body)
  popup.document.close()
  return true
}
