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

const mountPanel = (props?: { price?: number; planCode?: string }) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(MemberPayPanel, {
    props: {
      price: props?.price ?? 368,
      planCode: props?.planCode ?? 'vip_yearly',
      qrFrame: 'frame.png',
    },
    global: { plugins: [pinia] },
  })
}

const checkoutWindow = () => {
  const popup = {
    closed: false,
    close: vi.fn(),
    location: { href: '' },
    document: {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
    },
  }
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
  return popup
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

  it('creates an intent, opens alipay, and polls until the order is paid', async () => {
    vi.useFakeTimers()
    const popup = checkoutWindow()
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.token = 'access'
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
      props: { price: 368, planCode: 'vip_yearly', qrFrame: 'frame.png' },
      global: { plugins: [pinia] },
    })

    await wrapper.get('.pay-go').trigger('click')
    await flushPromises()

    expect(createMembershipOrder).toHaveBeenCalledWith('vip_yearly')
    expect(createMembershipPayment).toHaveBeenCalledWith(
      'M20261029001',
      'alipay',
    )
    expect(popup.document.write).toHaveBeenCalledWith(
      '<form id="alipay"></form>',
    )
    expect(wrapper.text()).toContain('请在支付宝完成支付')

    await vi.advanceTimersByTimeAsync(2000)
    await flushPromises()

    expect(fetchMembershipOrder).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.pay-go').text()).toBe('支付成功')
    expect(message.success).toHaveBeenCalledWith('支付成功')
    vi.useRealTimers()
  })

  it('opens a free plan without leaving the page', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().token = 'access'
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
      props: { price: 0, planCode: 'vip_yearly', qrFrame: 'frame.png' },
      global: { plugins: [pinia] },
    })

    expect(wrapper.get('.pay-go').text()).toBe('立即开通')
    await wrapper.get('.pay-go').trigger('click')
    await flushPromises()

    expect(open).not.toHaveBeenCalled()
    expect(createMembershipPayment).toHaveBeenCalledWith('FREE1', 'free')
    expect(wrapper.get('.pay-go').text()).toBe('支付成功')
    expect(message.success).toHaveBeenCalledWith('开通成功')
  })
})
