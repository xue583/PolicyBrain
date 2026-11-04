import { describe, expect, it } from 'vitest'
import { MembershipOrderStatus } from '@/api/membership'
import {
  isIntentExpired,
  isMembershipActivated,
  readMembershipPaymentOutcome,
  readAlipayCheckout,
  resolvePaymentQrSrc,
} from './membershipPayment'

describe('membership payment status', () => {
  it('treats paidAt or paid status as success', () => {
    expect(
      readMembershipPaymentOutcome({ status: MembershipOrderStatus.Pending }),
    ).toBe('pending')
    expect(
      readMembershipPaymentOutcome({
        status: MembershipOrderStatus.Paid,
        paidAt: '2026-10-29T01:00:00Z',
      }),
    ).toBe('paid')
    expect(
      readMembershipPaymentOutcome({
        status: MembershipOrderStatus.Pending,
        order: {
          status: MembershipOrderStatus.Paid,
          paidAt: '2026-10-29T01:00:00Z',
        },
      }),
    ).toBe('paid')
  })

  it('stops on closed and expired orders that are not paid', () => {
    expect(
      readMembershipPaymentOutcome({ status: MembershipOrderStatus.Closed }),
    ).toBe('closed')
    expect(
      readMembershipPaymentOutcome({ status: MembershipOrderStatus.Expired }),
    ).toBe('expired')
  })

  it('recognizes an immediately activated free membership', () => {
    expect(isMembershipActivated(null)).toBe(false)
    expect(isMembershipActivated({ level: 0 })).toBe(false)
    expect(isMembershipActivated({ level: 1, planCode: 'vip_yearly' })).toBe(
      true,
    )
  })

  it('knows when a payment intent has expired', () => {
    expect(
      isIntentExpired(
        '2020-01-01T00:00:00Z',
        Date.parse('2026-10-29T00:00:00Z'),
      ),
    ).toBe(true)
    expect(
      isIntentExpired(
        '2099-01-01T00:00:00Z',
        Date.parse('2026-10-29T00:00:00Z'),
      ),
    ).toBe(false)
    expect(isIntentExpired(null)).toBe(false)
  })

  it('turns wechat native content into a qr image', async () => {
    expect(await resolvePaymentQrSrc('  ')).toBe('')
    expect(await resolvePaymentQrSrc('https://cdn.example/pay.png')).toBe(
      'https://cdn.example/pay.png',
    )
    const src = await resolvePaymentQrSrc('weixin://wxpay/bizpayurl?pr=abc')
    expect(src.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('keeps the alipay cashier inside a page modal', () => {
    expect(readAlipayCheckout('  <form></form>  ')).toEqual({
      kind: 'html',
      html: '<form></form>',
    })
    expect(readAlipayCheckout('https://pay.example/alipay')).toEqual({
      kind: 'url',
      url: 'https://pay.example/alipay',
    })
    expect(readAlipayCheckout('  ')).toBeNull()
    expect(readAlipayCheckout(null)).toBeNull()
  })
})
