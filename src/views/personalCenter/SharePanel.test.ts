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
import SharePanel from './SharePanel.vue'

vi.mock('@/api/account', () => ({
  fetchAccountShares: vi.fn(),
  fetchShareLink: vi.fn(),
}))

const { fetchAccountShares } = await import('@/api/account')

const mountPanel = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = { phone: '13812345678', identity: 2 }

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

  const wrapper = mount(SharePanel, {
    global: {
      plugins: [pinia, router],
    },
  })
  await flushPromises()
  return wrapper
}

describe('SharePanel invite list', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(fetchAccountShares).mockResolvedValue({
      items: [
        {
          inviteePhone: '159****6547',
          createTime: '2026-10-22T07:11:26.615Z',
          status: 1,
          rewardDays: 30,
        },
        {
          inviteePhone: '189****6597',
          createTime: '2026-08-24T01:15:07.000Z',
          status: 2,
          rewardDays: 0,
        },
      ],
      pageIndex: 1,
      pageSize: 10,
      totalElements: 2,
    })
  })

  it('loads shares and shows the current user as inviter', async () => {
    const wrapper = await mountPanel()
    await flushPromises()

    expect(fetchAccountShares).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 10,
    })
    const text = wrapper.text()
    expect(text).toContain('159****6547')
    expect(text).toContain('189****6597')
    expect(text).toContain('138****5678')
    expect(text).toContain('企服人员')
    expect(text).toContain('赠送一个月')
    expect(text).toContain('超额无赠送')
    wrapper.unmount()
  })
})
