import { beforeEach, describe, expect, it, vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

import { flushPromises, mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import InvoicePanel from './InvoicePanel.vue'

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMembershipOrders: vi.fn(),
  }
})

vi.mock('ant-design-vue', async () => {
  const actual =
    await vi.importActual<typeof import('ant-design-vue')>('ant-design-vue')
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  }
})

const { fetchMembershipOrders } = await import('@/api/membership')
const { message } = await import('ant-design-vue')

const paidAt = '2026-11-03T07:53:34.490Z'

const mountPanel = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = {
    phone: '19545670526',
    companyName: '河南省政策宝数字科技有限公司',
    unifiedSocialCreditCode: '91410100MA4567890X',
  }

  const wrapper = mount(InvoicePanel, {
    global: { plugins: [pinia] },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

const showOrders = async (
  wrapper: ReturnType<typeof mount<typeof InvoicePanel>>,
) => {
  const tab = wrapper
    .findAll('button')
    .find((button) => button.text() === '消费记录')
  await tab!.trigger('click')
  await flushPromises()
}

describe('InvoicePanel orders', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(fetchMembershipOrders).mockResolvedValue({
      items: [
        {
          id: 8,
          orderNo: 'NO1',
          planName: 'VIP 一年会员',
          quantity: 2,
          amount: 1234,
          status: 2,
          paidAt,
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 1,
    })
  })

  it('loads membership orders and opens the invoice form with a locked amount', async () => {
    const wrapper = await mountPanel()

    expect(fetchMembershipOrders).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 10,
    })

    await showOrders(wrapper)

    expect(wrapper.text()).toContain('VIP 一年会员')
    expect(wrapper.text()).toContain('已支付')
    expect(wrapper.text()).toContain('¥12.34')
    expect(wrapper.text()).toContain(dayjs(paidAt).format('YYYY-MM-DD HH:mm'))

    await wrapper.get('.apply-link').trigger('click')
    await flushPromises()

    expect(document.body.textContent).toContain('申请开票')
    expect(document.body.textContent).toContain('申请日期')
    expect(document.body.textContent).toContain('发票类型')
    expect(document.body.textContent).toContain('单位名称')
    expect(document.body.textContent).toContain('单位税号')
    expect(document.body.textContent).toContain('开户行')
    expect(document.body.textContent).toContain('账号')
    expect(document.body.textContent).toContain('地址')
    expect(document.body.textContent).toContain('邮箱')
    expect(document.body.textContent).toContain('发票金额')
    expect(document.body.textContent).toContain('操作')

    const amount = document.querySelector<HTMLInputElement>(
      '.amount-input input',
    )
    expect(amount?.disabled).toBe(true)
    expect(amount?.value).toBe('12.34')

    const company = document.querySelector<HTMLInputElement>(
      'input[placeholder="请输入单位名称"]',
    )
    expect(company?.value).toBe('河南省政策宝数字科技有限公司')

    wrapper.unmount()
  })

  it('does not warn while typing bank name and account', async () => {
    const warnings: unknown[][] = []
    const spy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
      warnings.push(args)
    })
    const wrapper = await mountPanel()
    await showOrders(wrapper)
    await wrapper.get('.apply-link').trigger('click')
    await flushPromises()

    const typeInto = async (placeholder: string, text: string) => {
      const input = document.querySelector<HTMLInputElement>(
        `input[placeholder="${placeholder}"]`,
      )
      if (!input) throw new Error(`missing ${placeholder}`)
      input.value = text
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await flushPromises()
    }

    await typeInto('请输入开户行', '中国工商银行')
    await typeInto('请输入账号', '12345678999974')

    const text = warnings
      .flat()
      .filter((item): item is string => typeof item === 'string')
      .join('\n')
    expect(text).not.toContain('Invalid prop')
    expect(text).not.toContain('onUpdate:value')
    spy.mockRestore()
    wrapper.unmount()
  })

  it('keeps the form open when required fields are missing', async () => {
    const wrapper = await mountPanel()
    await showOrders(wrapper)
    await wrapper.get('.apply-link').trigger('click')
    await flushPromises()

    const submit = [...document.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === '提交',
    )
    submit?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()

    expect(document.body.textContent).toContain('请选择发票类型')
    expect(message.success).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
