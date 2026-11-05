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
import { ApiError } from '@/utils/apiError'
import { useAuthStore } from '@/stores/auth'
import InvoiceApplyModal from './InvoiceApplyModal.vue'
import InvoicePanel from './InvoicePanel.vue'

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMembershipOrders: vi.fn(),
  }
})

vi.mock('@/api/invoices', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/invoices')>('@/api/invoices')
  return {
    ...actual,
    fetchInvoiceApplications: vi.fn(),
    fetchInvoiceApplication: vi.fn(),
    createInvoiceApplication: vi.fn(),
    cancelInvoiceApplication: vi.fn(),
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
const {
  fetchInvoiceApplications,
  fetchInvoiceApplication,
  createInvoiceApplication,
  cancelInvoiceApplication,
} = await import('@/api/invoices')
const { message } = await import('ant-design-vue')

const emptyInvoicePage = {
  items: [],
  pageIndex: 1,
  pageSize: 10,
  totalElements: 0,
}

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
  wrapper.getComponent({ name: 'ATabs' }).vm.$emit('change', 'consum')
  await flushPromises()
}

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

const fillApplyForm = async (
  wrapper: ReturnType<typeof mount<typeof InvoicePanel>>,
) => {
  const select = wrapper
    .getComponent(InvoiceApplyModal)
    .getComponent({ name: 'ASelect' })
  select.vm.$emit('update:value', 1)
  await flushPromises()
  await typeInto('请输入开户行', '中国工商银行')
  await typeInto('请输入账号', '12345678999974')
  await typeInto('请输入地址', '郑州市金水区')
  await typeInto('请输入邮箱', 'finance@example.com')
}

const clickButton = async (label: string) => {
  const button = [...document.querySelectorAll('button')].find(
    (item) => item.textContent?.replace(/\s/g, '') === label,
  )
  if (!button) throw new Error(`missing ${label}`)
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await flushPromises()
}

const pendingInvoice = {
  id: 3,
  applyNo: 'FP20261105001',
  orderNo: 'NO1',
  applyDate: '2026-11-04T00:00:00',
  invoiceType: 1,
  companyName: '河南省政策宝数字科技有限公司',
  taxNumber: '91410100MA4567890X',
  bankName: '中国工商银行',
  bankAccount: '12345678999974',
  address: '郑州市金水区',
  email: 'finance@example.com',
  amount: 1234,
  status: 1,
  invoiceFileUrl: 'https://example.com/invoice.pdf',
  createTime: '2026-11-04T08:00:00',
}

describe('InvoicePanel orders', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(fetchInvoiceApplications).mockResolvedValue(emptyInvoicePage)
    vi.mocked(fetchInvoiceApplication).mockResolvedValue(pendingInvoice)
    vi.mocked(createInvoiceApplication).mockResolvedValue({
      ...pendingInvoice,
      id: 9,
    })
    vi.mocked(cancelInvoiceApplication).mockResolvedValue({
      ...pendingInvoice,
      status: 4,
    })
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
    expect(fetchInvoiceApplications).toHaveBeenCalledWith({
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

  it('submits the paid order amount in fen with the order number', async () => {
    const wrapper = await mountPanel()
    await showOrders(wrapper)
    await wrapper.get('.apply-link').trigger('click')
    await flushPromises()
    await fillApplyForm(wrapper)
    await clickButton('提交')

    expect(createInvoiceApplication).toHaveBeenCalledWith({
      invoiceType: 1,
      companyName: '河南省政策宝数字科技有限公司',
      taxNumber: '91410100MA4567890X',
      email: 'finance@example.com',
      amount: 1234,
      orderNo: 'NO1',
      applyDate: `${dayjs().format('YYYY-MM-DD')}T00:00:00`,
      bankName: '中国工商银行',
      bankAccount: '12345678999974',
      address: '郑州市金水区',
    })
    expect(message.success).toHaveBeenCalledWith('开票申请已提交')
    expect(wrapper.text()).toContain('发票记录')
    wrapper.unmount()
  })

  it('keeps the form open and shows the api error when submit fails', async () => {
    vi.mocked(createInvoiceApplication).mockRejectedValue(
      new ApiError('同订单已有未作废的开票申请', 400),
    )
    const wrapper = await mountPanel()
    await showOrders(wrapper)
    await wrapper.get('.apply-link').trigger('click')
    await flushPromises()
    await fillApplyForm(wrapper)
    await clickButton('提交')

    expect(document.body.textContent).toContain('同订单已有未作废的开票申请')
    expect(message.success).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('hides invoicing for unpaid orders and marks orders that already have an application', async () => {
    vi.mocked(fetchMembershipOrders).mockResolvedValue({
      items: [
        {
          id: 8,
          orderNo: 'NO1',
          planName: 'VIP 一年会员',
          quantity: 1,
          amount: 1234,
          status: 1,
          paidAt,
        },
        {
          id: 9,
          orderNo: 'NO2',
          planName: 'SVIP 一年会员',
          quantity: 1,
          amount: 2000,
          status: 2,
          paidAt,
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 2,
    })
    vi.mocked(fetchInvoiceApplications).mockResolvedValue({
      items: [{ ...pendingInvoice, orderNo: 'NO2' }],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 1,
    })

    const wrapper = await mountPanel()
    await showOrders(wrapper)

    const links = wrapper.findAll('.apply-link').map((item) => item.text())
    expect(links).toEqual(['已申请'])
    expect(wrapper.text()).not.toContain('去开票')
    wrapper.unmount()
  })

  it('lists invoice applications and cancels a pending one', async () => {
    vi.mocked(fetchInvoiceApplications).mockResolvedValue({
      items: [pendingInvoice],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 1,
    })
    const wrapper = await mountPanel()

    expect(wrapper.text()).toContain('河南省政策宝数字科技有限公司')
    expect(wrapper.text()).toContain('待开票')
    expect(wrapper.text()).toContain('普票')
    expect(wrapper.text()).toContain('¥12.34')
    expect(wrapper.text()).toContain('finance@example.com')
    expect(wrapper.text()).toContain('2026-11-04')
    expect(wrapper.text()).not.toContain('郑州政策宝企业管理咨询有限公司')

    await wrapper.get('.invoice-card').trigger('click')
    await flushPromises()

    expect(fetchInvoiceApplication).toHaveBeenCalledWith(3)
    expect(document.body.textContent).toContain('发票详情')
    expect(document.body.textContent).toContain('FP20261105001')
    expect(document.body.textContent).toContain('查看发票')
    expect(document.body.textContent).toContain('撤销申请')

    await clickButton('撤销申请')
    wrapper.getComponent({ name: 'APopconfirm' }).vm.$emit('confirm')
    await flushPromises()

    expect(cancelInvoiceApplication).toHaveBeenCalledWith(3)
    expect(message.success).toHaveBeenCalledWith('已撤销开票申请')
    wrapper.unmount()
  })
})
