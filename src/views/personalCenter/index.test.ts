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
import { resetMyEnterprises } from '@/composables/useMyEnterprises'
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

vi.mock('@/api/account', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/account')>('@/api/account')
  return {
    ...actual,
    fetchMyEnterprises: vi.fn(async () => ({
      items: [],
      canBindMore: true,
      maxBindings: 1,
      identity: 1,
      currentEnterpriseId: null,
    })),
    unbindMyEnterprise: vi.fn(),
  }
})

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMyMembership: vi.fn(),
    fetchMembershipPlans: vi.fn(async () => []),
    fetchMembershipBenefits: vi.fn(async () => []),
    allocateMembershipSlot: vi.fn(),
  }
})

const { fetchCurrentUser } = await import('@/api/auth')
const { fetchMyEnterprises } = await import('@/api/account')
const { fetchMyMembership, allocateMembershipSlot } =
  await import('@/api/membership')

const mountPage = async (stubs?: Record<string, unknown>, identity = 1) => {
  localStorage.setItem('pb_user', '{}')
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = {
    phone: '19545670526',
    nickname: '李四',
    identity,
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
    // vitest stubs 形状多样，放宽给 mount 的 Stubs 类型
    global: { plugins: [pinia, router], stubs: stubs as never },
  })
  await flushPromises()
  return wrapper
}

describe('PersonalCenter membership period', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMyEnterprises()
    vi.clearAllMocks()
    vi.mocked(fetchMyEnterprises).mockResolvedValue({
      items: [],
      canBindMore: true,
      maxBindings: 1,
      identity: 1,
      currentEnterpriseId: null,
    })
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
    expect(wrapper.text()).not.toContain('企业会员')
    expect(wrapper.text()).toContain('2026-10-22 至 2027-10-22')
    expect(wrapper.get('.member-row .vip-btn').text()).toContain('续费')
    expect(wrapper.get('.member-row').text()).not.toContain('开通会员')

    const modal = wrapper.findComponent({ name: 'RenewMembershipModal' })
    expect(modal.props('open')).toBe(false)
    await wrapper.get('.member-row .vip-btn').trigger('click')
    expect(modal.props('open')).toBe(true)
    expect(modal.props('membership')).toMatchObject({ planCode: 'vip-year' })
    modal.vm.$emit('paid')
    await flushPromises()
    expect(fetchMyMembership).toHaveBeenCalledTimes(2)
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

    expect(wrapper.get('.member-row .vip-btn').text()).toContain('开通会员')
    expect(wrapper.get('.member-row').text()).not.toContain('续费')
    expect(wrapper.text()).not.toContain('至')
    wrapper.unmount()
  })

  it('loads enterprise seats and allocates an empty slot by phone', async () => {
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 1,
      planCode: 'ent_vip_year',
      startedAt: '2026-11-11T09:41:00',
      expiresAt: '2027-11-11T15:30:15',
      remainingDays: 365,
      lastOrderNo: 'ENT-1',
      isBatchManager: true,
      managedBatches: [
        {
          order: {
            orderNo: 'ENT-1',
            planCode: 'ent_vip_year',
            expiresAt: '2027-11-11T09:41:00',
            status: 2,
            quantity: 2,
          },
          slots: [
            {
              id: '11',
              holderPhone: '19545670526',
              status: 2,
              allocatedAt: '2026-08-16T09:41:00',
            },
            { id: '12', holderPhone: '', status: 1 },
          ],
          totalCount: 2,
          allocatedCount: 1,
          unallocatedCount: 1,
        },
      ],
    })
    vi.mocked(allocateMembershipSlot).mockResolvedValue({
      id: '12',
      holderPhone: '19067678686',
      status: 2,
    })

    const wrapper = await mountPage({
      AModal: {
        props: ['open'],
        template: '<div v-if="open"><slot /></div>',
      },
    })

    expect(wrapper.text()).toContain('企业会员')
    expect(wrapper.text()).toContain('到期时间：2027-11-11 15:30:15')
    expect(wrapper.text()).toContain('主账号')
    expect(wrapper.text()).not.toContain('个人会员')

    await wrapper.get('.seat-bind').trigger('click')
    const input = wrapper.get('input[placeholder="请输入手机号"]')
    await input.setValue('19067678686')
    await wrapper.get('.bind-submit').trigger('click')
    await flushPromises()

    expect(allocateMembershipSlot).toHaveBeenCalledWith('12', '19067678686')
    expect(fetchMyMembership).toHaveBeenCalledTimes(2)
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

  it('shows bind for a specialist with no company, and unbind after one is bound', async () => {
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 0,
      planCode: '',
      startedAt: null,
      expiresAt: null,
      remainingDays: 0,
      lastOrderNo: null,
    })

    const openWrapper = await mountPage()
    expect(openWrapper.text()).toContain('绑定企业')
    expect(openWrapper.text()).not.toContain('解绑')
    openWrapper.unmount()

    vi.mocked(fetchMyEnterprises).mockResolvedValue({
      items: [
        {
          enterpriseId: '8',
          name: '郑州源创基因科技有限公司',
          creditCode: '91410100MA9G00018X',
          isCurrent: true,
        },
      ],
      canBindMore: false,
      maxBindings: 1,
      identity: 1,
      currentEnterpriseId: '8',
    })
    const boundWrapper = await mountPage()
    expect(boundWrapper.text()).toContain('郑州源创基因科技有限公司')
    expect(boundWrapper.text()).toContain('解绑')
    expect(boundWrapper.text()).not.toContain('企业信息')
    expect(boundWrapper.find('.identity-btn').exists()).toBe(false)
    boundWrapper.unmount()
  })

  it('lists each bound company for service staff and keeps a separate unbind action', async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      phone: '19545670526',
      nickname: '李四',
      identity: 2,
    })
    vi.mocked(fetchMyMembership).mockResolvedValue({
      level: 0,
      planCode: '',
      startedAt: null,
      expiresAt: null,
      remainingDays: 0,
      lastOrderNo: null,
    })
    vi.mocked(fetchMyEnterprises).mockResolvedValue({
      items: [
        {
          enterpriseId: '8',
          name: '郑州源创基因科技有限公司',
          creditCode: '91410100MA9G00018X',
          provinceName: '河南省',
          cityName: '郑州市',
          legalPerson: '郭峰',
          bindTime: '2026-11-05T10:00:00',
          isCurrent: true,
        },
        {
          enterpriseId: '9',
          name: '唐河县大华机械设备有限公司',
          creditCode: '91411328698705730A',
          provinceName: '河南省',
          cityName: '南阳市',
          legalPerson: '李明',
          bindTime: '2026-11-01T08:00:00',
          isCurrent: false,
        },
      ],
      canBindMore: true,
      maxBindings: 0,
      identity: 2,
      currentEnterpriseId: '8',
    })

    const wrapper = await mountPage(undefined, 2)

    expect(wrapper.text()).toContain('企业信息')
    expect(wrapper.text()).toContain('郑州源创基因科技有限公司')
    expect(wrapper.text()).toContain('唐河县大华机械设备有限公司')
    expect(wrapper.text()).toContain('91410100MA9G00018X')
    expect(wrapper.text()).toContain('河南省/郑州市')
    expect(wrapper.text()).toContain('郭峰')
    expect(wrapper.findAll('.enterprise-table .unbind-link')).toHaveLength(2)
    expect(wrapper.find('.bound-row').exists()).toBe(false)
    wrapper.unmount()
  })
})
