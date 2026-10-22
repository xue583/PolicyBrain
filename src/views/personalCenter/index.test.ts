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
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PersonalCenter from './index.vue'

vi.mock('@/api/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/auth')>('@/api/auth')
  return {
    ...actual,
    fetchCurrentUser: vi.fn(),
    updateCurrentUser: vi.fn(),
  }
})

vi.mock('@/api/membership', () => ({
  fetchMyMembership: vi.fn(),
}))

const { fetchCurrentUser } = await import('@/api/auth')
const { fetchMyMembership } = await import('@/api/membership')

const mountPage = async () => {
  localStorage.setItem('pb_access_token', 'access')
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = {
    phone: '19545670526',
    nickname: '李四',
    identity: 1,
    companyName: '河南省政策宝数字科技有限公司',
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      {
        path: '/personal-center',
        name: 'personal-center',
        component: { template: '<div />' },
      },
      {
        path: '/membership',
        name: 'membership',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push('/personal-center')
  await router.isReady()

  const wrapper = mount(PersonalCenter, {
    global: { plugins: [pinia, router] },
  })
  await flushPromises()
  return wrapper
}

describe('PersonalCenter membership period', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      phone: '19545670526',
      nickname: '李四',
      identity: 1,
    })
  })

  it('loads membership on enter and shows the validity period', async () => {
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 1,
      planCode: 'vip-year',
      startedAt: '2026-10-22T07:22:07',
      expiresAt: '2027-10-22T07:22:07',
      remainingDays: 365,
      lastOrderNo: 'NO1',
    })

    const wrapper = await mountPage()

    expect(fetchMyMembership).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('个人会员：')
    expect(wrapper.text()).toContain('2026-10-22 至 2027-10-22')
    wrapper.unmount()
  })

  it('keeps the open-membership action when there is no period', async () => {
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 0,
      planCode: '',
      startedAt: null,
      expiresAt: null,
      remainingDays: 0,
      lastOrderNo: null,
    })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('开通会员')
    expect(wrapper.text()).not.toContain('至')
    wrapper.unmount()
  })

  it('opens the nickname modal from the edit button', async () => {
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 0,
      planCode: '',
      startedAt: null,
      expiresAt: null,
      remainingDays: 0,
      lastOrderNo: null,
    })

    const wrapper = await mountPage()
    const modal = wrapper.findComponent({ name: 'NicknameModal' })
    expect(modal.props('open')).toBe(false)
    await wrapper.get('[aria-label="编辑用户名"]').trigger('click')
    expect(modal.props('open')).toBe(true)
    wrapper.unmount()
  })
})
