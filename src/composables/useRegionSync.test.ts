import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
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
})
