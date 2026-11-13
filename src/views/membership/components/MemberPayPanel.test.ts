import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { message } from 'ant-design-vue'
import { onNeedLogin } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'
import MemberPayPanel from './MemberPayPanel.vue'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('../membershipPayment', async () => {
  const actual = await vi.importActual<typeof import('../membershipPayment')>(
    '../membershipPayment',
  )
  return {
    ...actual,
    resolvePaymentQrSrc: vi.fn(async (content?: string | null) => {
      const value = content?.trim() ?? ''
      return value ? `data:image/png;base64,${value}` : ''
    }),
  }
})

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    createMembershipOrder: vi.fn(),
    createMembershipPayment: vi.fn(),
    fetchMembershipOrder: vi.fn(),
  }
})

const { createMembershipOrder, createMembershipPayment, fetchMembershipOrder } =
  await import('@/api/membership')

const mountPanel = (props?: { price?: string; planCode?: string }) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(MemberPayPanel, {
    props: {
      price: props?.price ?? '368',
      planCode: props?.planCode ?? 'vip_yearly',
      qrFrame: 'frame.png',
    },
    global: { plugins: [pinia] },
  })
}

describe('MemberPayPanel alipay checkout', () => {
  beforeEach(() => {
    vi.mocked(createMembershipOrder).mockReset()
    vi.mocked(createMembershipPayment).mockReset()
    vi.mocked(fetchMembershipOrder).mockReset()
    vi.mocked(message.success).mockReset()
    vi.mocked(message.warning).mockReset()
    vi.mocked(message.error).mockReset()
    vi.restoreAllMocks()
  })

  it('replaces the alipay qr code with a pay button and keeps wechat as a code', async () => {
    const wrapper = mountPanel()

    expect(wrapper.get('.pay-go').text()).toBe('去支付')
    expect(wrapper.find('svg.qr-code').exists()).toBe(false)

    await wrapper.get('.is-wechatpay').trigger('click')
    expect(wrapper.find('.pay-go').exists()).toBe(false)
    expect(wrapper.find('svg.qr-code').exists()).toBe(true)
  })

  it('asks the user to log in before creating an order', async () => {
    const needLogin = vi.fn()
    const stop = onNeedLogin(needLogin)
    const wrapper = mountPanel()

    await wrapper.get('.pay-go').trigger('click')

    expect(needLogin).toHaveBeenCalled()
    expect(createMembershipOrder).not.toHaveBeenCalled()
    expect(message.warning).toHaveBeenCalledWith('请先登录后再支付')
    stop()
  })

  it('creates an intent, opens alipay in a modal, and shows success on the page', async () => {
    vi.useFakeTimers()
    const open = vi.spyOn(window, 'open')
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.user = {}
    vi.mocked(createMembershipOrder).mockResolvedValue({
      orderNo: 'M20261029001',
      status: 1,
      expiresAt: '2099-01-01T00:00:00Z',
    })
    vi.mocked(createMembershipPayment).mockResolvedValue({
      channel: 'alipay',
      redirectHtml: '<form id="alipay"></form>',
    })
    vi.mocked(fetchMembershipOrder)
      .mockResolvedValueOnce({ orderNo: 'M20261029001', status: 1 })
      .mockResolvedValueOnce({
        orderNo: 'M20261029001',
        status: 2,
        paidAt: '2026-10-29T01:00:00Z',
      })

    const wrapper = mount(MemberPayPanel, {
      props: { price: '368', planCode: 'vip_yearly', qrFrame: 'frame.png' },
      global: {
        plugins: [pinia],
        stubs: {
          AModal: {
            template:
              '<div class="cashier-stub"><slot name="title" /><slot /></div>',
          },
        },
      },
    })

    await wrapper.get('.pay-go').trigger('click')
    await flushPromises()

    expect(open).not.toHaveBeenCalled()
    expect(createMembershipOrder).toHaveBeenCalledWith('vip_yearly', 1)
    expect(createMembershipPayment).toHaveBeenCalledWith(
      'M20261029001',
      'alipay',
    )
    expect(wrapper.get('iframe.alipay-frame').attributes('srcdoc')).toBe(
      '<form id="alipay"></form>',
    )
    expect(wrapper.text()).toContain('请在弹窗中完成支付')

    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    expect(fetchMembershipOrder).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.pay-done-title').text()).toBe('支付成功')
    expect(wrapper.get('.pay-result').text()).toContain('会员即将生效')
    expect(wrapper.find('iframe.alipay-frame').exists()).toBe(false)
    expect(message.success).toHaveBeenCalledWith('支付成功')
    expect(wrapper.emitted('paid')).toHaveLength(1)
    vi.useRealTimers()
  })

  it('opens a free plan without leaving the page', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().user = {}
    const open = vi.spyOn(window, 'open')
    vi.mocked(createMembershipOrder).mockResolvedValue({
      orderNo: 'FREE1',
      status: 2,
    })
    vi.mocked(createMembershipPayment).mockResolvedValue({
      channel: 'free',
      membership: { level: 1, planCode: 'vip_yearly' },
    })

    const wrapper = mount(MemberPayPanel, {
      props: { price: '0', planCode: 'vip_yearly', qrFrame: 'frame.png' },
      global: { plugins: [pinia] },
    })

    expect(wrapper.get('.pay-go').text()).toBe('立即开通')
    await wrapper.get('.pay-go').trigger('click')
    await flushPromises()

    expect(open).not.toHaveBeenCalled()
    expect(createMembershipPayment).toHaveBeenCalledWith('FREE1', 'free')
    expect(wrapper.get('.pay-done-title').text()).toBe('支付成功')
    expect(wrapper.find('.pay-result').exists()).toBe(false)
    expect(message.success).toHaveBeenCalledWith('开通成功')
    expect(wrapper.emitted('paid')).toHaveLength(1)
  })

  it('pays with wechatpay and shows the returned qr code', async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().user = {}
    vi.mocked(createMembershipOrder).mockResolvedValue({
      orderNo: 'M20261030001',
      status: 1,
      expiresAt: '2099-01-01T00:00:00Z',
    })
    vi.mocked(createMembershipPayment).mockResolvedValue({
      channel: 'wechatpay',
      qrCodeContent: 'weixin://wxpay/bizpayurl?pr=abc',
    })
    vi.mocked(fetchMembershipOrder)
      .mockResolvedValueOnce({ orderNo: 'M20261030001', status: 1 })
      .mockResolvedValueOnce({
        orderNo: 'M20261030001',
        status: 2,
        paidAt: '2026-10-30T01:00:00Z',
      })

    const wrapper = mount(MemberPayPanel, {
      props: { price: '368', planCode: 'vip_yearly', qrFrame: 'frame.png' },
      global: { plugins: [pinia] },
    })

    await wrapper.get('.is-wechatpay').trigger('click')
    await flushPromises()

    expect(createMembershipOrder).toHaveBeenCalledWith('vip_yearly', 1)
    expect(createMembershipPayment).toHaveBeenCalledWith(
      'M20261030001',
      'wechatpay',
    )
    const qr = wrapper.get('img.qr-code')
    expect(qr.attributes('alt')).toBe('微信支付二维码')
    expect(qr.attributes('src')).toBe(
      'data:image/png;base64,weixin://wxpay/bizpayurl?pr=abc',
    )
    expect(wrapper.text()).toContain('请使用微信扫码支付')

    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    expect(fetchMembershipOrder).toHaveBeenCalledWith('M20261030001')
    expect(wrapper.text()).toContain('支付成功')
    expect(message.success).toHaveBeenCalledWith('支付成功')
    expect(wrapper.emitted('paid')).toHaveLength(1)
    vi.useRealTimers()
  })

  it('writes the seat count into an enterprise order', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().user = {}
    vi.mocked(createMembershipOrder).mockResolvedValue({
      orderNo: 'ENT1',
      status: 1,
      quantity: 5,
      expiresAt: '2099-01-01T00:00:00Z',
    })
    vi.mocked(createMembershipPayment).mockResolvedValue({
      channel: 'alipay',
      redirectHtml: '<form id="alipay"></form>',
    })

    const wrapper = mount(MemberPayPanel, {
      props: {
        price: '8400',
        planCode: 'ent_vip_3y',
        quantity: 5,
        qrFrame: 'frame.png',
      },
      global: {
        plugins: [pinia],
        stubs: {
          AModal: { template: '<div class="cashier-stub"><slot /></div>' },
        },
      },
    })

    await wrapper.get('.pay-go').trigger('click')
    await flushPromises()

    expect(createMembershipOrder).toHaveBeenCalledWith('ent_vip_3y', 5)
    wrapper.unmount()
  })
})
