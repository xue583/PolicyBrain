import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { SITE } from '@/constants/site'

vi.mock('@/api/account', () => ({
  fetchServiceContacts: vi.fn(),
}))

const { fetchServiceContacts } = await import('@/api/account')
const { resetServiceContactCache, useServiceContact } =
  await import('./useServiceContact')

const Probe = defineComponent({
  setup() {
    return useServiceContact()
  },
  template:
    '<p class="phone">{{ phone }}</p><p class="wechat">{{ wechat }}</p><p class="hours">{{ workHours }}</p><p class="qr">{{ qrUrl }}</p>',
})

describe('useServiceContact', () => {
  beforeEach(() => {
    resetServiceContactCache()
    vi.mocked(fetchServiceContacts).mockReset()
  })

  it('shows service contact fields from the api', async () => {
    vi.mocked(fetchServiceContacts).mockResolvedValue({
      phone: '18800091116',
      wechatAccount: 'policy-brain',
      wechatQrUrl: 'https://cdn.example.com/qr.png',
      workHours: '每天 9:00-21:00',
    })

    const wrapper = mount(Probe)
    await flushPromises()

    expect(fetchServiceContacts).toHaveBeenCalledOnce()
    expect(wrapper.get('.phone').text()).toBe('18800091116')
    expect(wrapper.get('.wechat').text()).toBe('policy-brain')
    expect(wrapper.get('.hours').text()).toBe('每天 9:00-21:00')
    expect(wrapper.get('.qr').text()).toBe('https://cdn.example.com/qr.png')
    wrapper.unmount()
  })

  it('falls back to site constants when the api fields are empty', async () => {
    vi.mocked(fetchServiceContacts).mockResolvedValue({
      phone: null,
      wechatAccount: '  ',
      wechatQrUrl: null,
      workHours: '',
    })

    const wrapper = mount(Probe)
    await flushPromises()

    expect(wrapper.get('.phone').text()).toBe(SITE.phone)
    expect(wrapper.get('.wechat').text()).toBe(SITE.wechat)
    expect(wrapper.get('.hours').text()).toBe(SITE.workHours)
    expect(wrapper.get('.qr').text()).toBe('')
    wrapper.unmount()
  })

  it('reuses one request across mounts', async () => {
    vi.mocked(fetchServiceContacts).mockResolvedValue({
      phone: '18800091116',
    })

    const first = mount(Probe)
    const second = mount(Probe)
    await flushPromises()

    expect(fetchServiceContacts).toHaveBeenCalledOnce()
    expect(second.get('.phone').text()).toBe('18800091116')
    first.unmount()
    second.unmount()
  })
})
