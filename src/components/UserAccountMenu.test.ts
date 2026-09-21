import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserAccountMenu from './UserAccountMenu.vue'

vi.mock('@/api/auth', () => ({
  createSession: vi.fn(),
  fetchCurrentUser: vi.fn(),
  logoutSession: vi.fn(),
  sendSmsCode: vi.fn(),
  updateCurrentUser: vi.fn(),
  verifySmsCode: vi.fn(),
  PolicySmsPurpose: { Register: 1, Login: 2 },
  PolicyUserType: { EnterpriseSpecialist: 1, EnterpriseService: 2 },
}))

const { logoutSession } = await import('@/api/auth')

const mountMenu = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      {
        path: '/personal-center',
        name: 'personal-center',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push('/')
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.token = 'access'
  auth.user = {
    phone: '19545670526',
    identity: 1,
    companyName: '河南省政策宝数字科技有限公司',
  }

  const wrapper = mount(UserAccountMenu, {
    attachTo: document.body,
    global: {
      plugins: [pinia, router],
    },
  })

  return { wrapper, router, auth }
}

describe('UserAccountMenu', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows masked phone, identity and company on hover overlay', async () => {
    const { wrapper } = await mountMenu()
    await flushPromises()

    expect(wrapper.get('.user-avatar').exists()).toBe(true)
    expect(wrapper.text()).toContain('195****0526')
    expect(wrapper.text()).toContain('企业专员')
    expect(wrapper.text()).toContain('河南省政策宝数字科技有限公司')
    expect(wrapper.text()).toContain('个人中心')
    expect(wrapper.text()).toContain('退出登录')
    wrapper.unmount()
  })

  it('opens personal center from the first menu item', async () => {
    const { wrapper, router } = await mountMenu()
    await wrapper.get('[role="menuitem"]').trigger('click')
    expect(router.currentRoute.value.name).toBe('personal-center')
    wrapper.unmount()
  })

  it('logs out from the footer action', async () => {
    vi.mocked(logoutSession).mockResolvedValue({})
    const { wrapper, auth } = await mountMenu()
    const items = wrapper.findAll('[role="menuitem"]')
    await items[items.length - 1]!.trigger('click')
    await flushPromises()
    expect(auth.isLoggedIn).toBe(false)
    wrapper.unmount()
  })
})
