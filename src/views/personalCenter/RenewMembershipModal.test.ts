import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PolicyUserType } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import RenewMembershipModal from './RenewMembershipModal.vue'

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMembershipPlans: vi.fn(async (level: number) => {
      if (level === 0) {
        return [
          {
            code: 'trial',
            name: '体验会员',
            level: 0,
            durationDays: 7,
            price: 0,
            sort: 1,
          },
        ]
      }
      if (level === 1) {
        return [
          {
            code: 'vip_triennial',
            name: 'VIP 三年会员',
            level: 1,
            durationDays: 1095,
            price: 69800,
            originalPrice: 212400,
            sort: 10,
            description: '买二送一',
          },
          {
            code: 'vip_yearly',
            name: 'VIP 一年会员',
            level: 1,
            durationDays: 365,
            price: 36800,
            originalPrice: 70800,
            sort: 20,
            description: '超值特惠',
          },
          {
            code: 'ent_vip_yearly',
            name: 'VIP 企业一年套餐',
            level: 1,
            durationDays: 365,
            price: 168000,
            sort: 30,
            description: '企业套餐',
          },
        ]
      }
      if (level === 2) {
        return [
          {
            code: 'svip_yearly',
            name: 'SVIP 一年会员',
            level: 2,
            durationDays: 365,
            price: 99800,
            sort: 10,
          },
        ]
      }
      return []
    }),
    fetchMembershipBenefits: vi.fn(async () => [
      {
        code: 'search',
        name: '高级搜索',
        level: 1,
        description: '支持组合筛选',
        sort: 1,
      },
    ]),
  }
})

const membership = {
  level: 1,
  planCode: 'vip_yearly',
  startedAt: '2026-10-22T07:22:07',
  expiresAt: '2027-10-22T07:22:07',
  remainingDays: 365,
}

const mountModal = (
  identity: PolicyUserType = PolicyUserType.EnterpriseSpecialist,
) => {
  localStorage.setItem('pb_access_token', 'access')
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = { phone: '19545670526', identity }

  return mount(RenewMembershipModal, {
    props: { open: true, membership },
    global: {
      plugins: [pinia],
      stubs: {
        AModal: {
          template:
            '<div class="renew-modal"><slot name="title" /><slot /></div>',
        },
        MemberPayPanel: {
          name: 'MemberPayPanel',
          props: ['price', 'planCode'],
          emits: ['paid'],
          template:
            '<aside class="pay-stub"><button type="button" class="pay-done" @click="$emit(\'paid\')">完成支付</button>{{ planCode }} {{ price }}</aside>',
        },
      },
    },
  })
}

describe('RenewMembershipModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows the current period and renews the matching personal plan', async () => {
    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.text()).toContain('会员续费')
    expect(wrapper.text()).toContain('有效期 2026-10-22 至 2027-10-22')
    expect(wrapper.text()).toContain('剩余 365 天')
    expect(wrapper.text()).toContain('VIP 一年会员')
    expect(wrapper.text()).toContain('VIP 三年会员')
    expect(wrapper.text()).not.toContain('VIP 企业一年套餐')
    expect(wrapper.text()).not.toContain('体验会员')
    expect(wrapper.get('.plan-card.selected').text()).toContain('VIP 一年会员')
    expect(wrapper.get('.pay-stub').text()).toContain('vip_yearly')
    expect(wrapper.get('.pay-stub').text()).toContain('368')

    const cards = wrapper.findAll('.plan-card')
    await cards[0]!.trigger('click')
    expect(wrapper.get('.pay-stub').text()).toContain('vip_triennial')
    expect(wrapper.get('.pay-stub').text()).toContain('698')

    await wrapper.get('.tier-tab.svip').trigger('click')
    expect(wrapper.text()).toContain('SVIP 一年会员')
    expect(wrapper.get('.pay-stub').text()).toContain('svip_yearly')

    await wrapper.get('.pay-done').trigger('click')
    expect(wrapper.emitted('paid')).toHaveLength(1)
    wrapper.unmount()
  })

  it('includes the trial plan on the service identity board', async () => {
    const wrapper = mountModal(PolicyUserType.EnterpriseService)
    await flushPromises()

    expect(wrapper.text()).toContain('体验会员')
    expect(wrapper.text()).toContain('折合每天')
    expect(wrapper.text()).not.toContain('VIP 企业一年套餐')
    wrapper.unmount()
  })
})
