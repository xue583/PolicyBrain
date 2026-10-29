import { describe, expect, it, vi } from 'vitest'
import { MembershipOrderStatus } from '@/api/membership'
import {
  isIntentExpired,
  isMembershipActivated,
  readMembershipPaymentOutcome,
  submitAlipayCheckout,
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

  it('writes the alipay form into the checkout window', () => {
    const popup = {
      closed: false,
      location: { href: '' },
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
    }
    expect(
      submitAlipayCheckout(popup as unknown as Window, '<form></form>'),
    ).toBe(true)
    expect(popup.document.write).toHaveBeenCalledWith('<form></form>')

    expect(
      submitAlipayCheckout(
        popup as unknown as Window,
        'https://pay.example/alipay',
      ),
    ).toBe(true)
    expect(popup.location.href).toBe('https://pay.example/alipay')
    expect(submitAlipayCheckout(null, '<form></form>')).toBe(false)
  })
})
