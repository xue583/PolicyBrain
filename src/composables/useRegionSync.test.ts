import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRegionStore } from '@/stores/region'
import { useRegionSync } from './useRegionSync'

vi.mock('ant-design-vue', () => ({
  message: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/api/account', () => ({
  fetchUserContext: vi.fn(),
  updateUserContext: vi.fn(),
}))

vi.mock('@/api/meta', () => ({
  loadRegionOptions: vi.fn(),
}))

const { fetchUserContext, updateUserContext } = await import('@/api/account')

const Host = defineComponent({
  setup() {
    useRegionSync()
    return () => null
  },
})

const mountSync = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
  })
  await router.push('/')
  await router.isReady()

  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.token = 'access'

  const wrapper = mount(Host, {
    global: { plugins: [pinia, router] },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('useRegionSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchUserContext).mockResolvedValue(null)
    vi.mocked(updateUserContext).mockResolvedValue({})
  })

  it('writes the account context when only a province is selected', async () => {
    const { wrapper } = await mountSync()
    const region = useRegionStore()

    region.setProvince('河南省', 41)
    await nextTick()

    expect(updateUserContext).toHaveBeenCalledWith({
      provinceId: 41,
      cityId: null,
      districtId: null,
    })
    wrapper.unmount()
  })

  it('keeps the insights page when region query is written before it finishes loading', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    window.history.replaceState(null, '', '/insights')
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        {
          path: '/insights',
          name: 'insights',
          component: () => gate.then(() => ({ template: '<div />' })),
        },
      ],
    })
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(Host, {
      global: { plugins: [pinia, router] },
    })
    useRegionStore().setCity('河南省', 41, '安阳市', 4105)
    await nextTick()
    release()
    await router.isReady()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/insights')
    expect(router.currentRoute.value.query).toMatchObject({
      provinceId: '41',
      cityId: '4105',
    })
    wrapper.unmount()
    window.history.replaceState(null, '', '/')
  })
})
