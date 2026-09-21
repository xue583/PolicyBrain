import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import MembershipPage from './index.vue'

vi.mock('@/api/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/auth')>('@/api/auth')
  return {
    ...actual,
    fetchCurrentUser: vi.fn(),
    logoutSession: vi.fn(),
  }
})

const mountPage = (identity?: number) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  if (identity != null) {
    auth.token = 'access'
    auth.user = { identity }
  }

  return mount(MembershipPage, {
    global: { plugins: [pinia] },
  })
}

describe('MembershipPage identity boards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps the current VIP/SVIP board when identity is 1', () => {
    const wrapper = mountPage(1)
    expect(wrapper.find('.board.is-vip').exists()).toBe(true)
    expect(wrapper.text()).toContain('数据查询、导出与批量处理')
    expect(wrapper.text()).toContain('深度数据+AI申报材料')
    expect(wrapper.text()).not.toContain('企业套餐')
    wrapper.unmount()
  })

  it('renders the enterprise membership board when identity is 2', () => {
    const wrapper = mountPage(2)
    expect(wrapper.text()).toContain('企业套餐')
    expect(wrapper.text()).toContain('畅享50项权益，适合个人日常使用')
    expect(wrapper.text()).toContain('尊享50+项权益')
    expect(wrapper.text()).not.toContain('数据查询、导出与批量处理')
    wrapper.unmount()
  })
})
