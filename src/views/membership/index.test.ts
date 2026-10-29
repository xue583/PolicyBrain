import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
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

vi.mock('@/api/membership', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/membership')>('@/api/membership')
  return {
    ...actual,
    fetchMyMembership: vi.fn(),
    fetchMembershipBenefits: vi.fn(async (level: number) => {
      if (level === 0) return []
      if (level === 1) {
        return [
          { code: 'cultivate', name: '培育企业', level: 1, sort: 5 },
          { code: 'recommend', name: '个性化政策推荐', level: 1, sort: 6 },
          { code: 'export', name: '数据导出', level: 1, sort: 10 },
          { code: 'batch', name: '批量查询', level: 1, sort: 11 },
          {
            code: 'apply',
            name: '智能申报',
            level: 1,
            description: '1次/年（可单独购买）',
            sort: 12,
          },
          {
            code: 'match',
            name: '匹配政策（企业找政策）',
            level: 1,
            description: '基于企业真实数据做政策匹配',
            sort: 18,
          },
        ]
      }
      if (level === 2) {
        return [
          {
            code: 'ai',
            name: 'AI材料',
            level: 2,
            description: '辅助生成申报材料',
            sort: 3,
          },
          { code: 'cultivate', name: '培育企业', level: 2, sort: 5 },
          {
            code: 'recommend',
            name: '个性化政策推荐',
            level: 2,
            sort: 6,
          },
          {
            code: 'advanced',
            name: '高级搜索',
            level: 2,
            description: 'SVIP 专属',
            sort: 9,
          },
          { code: 'batch', name: '批量查询', level: 2, sort: 11 },
          {
            code: 'apply',
            name: '智能申报',
            level: 2,
            description: '1次/年（可单独购买）',
            sort: 12,
          },
          {
            code: 'match',
            name: '匹配政策（企业找政策）',
            level: 2,
            description: '基于企业真实数据做政策匹配',
            sort: 18,
          },
        ]
      }
      return []
    }),
    fetchMembershipPlans: vi.fn(async (level: number) => {
      // 与线上一致：企业套餐和个人套餐同等级售卖，只能按 ent_ 编码前缀区分
      if (level === 0) return []
      if (level === 1) {
        return [
          {
            code: 'vip_triennial',
            name: 'VIP 三年会员',
            level: 1,
            durationType: 3,
            durationDays: 1095,
            price: 69800,
            originalPrice: 212400,
            sort: 10,
            description: '买二送一',
            applicableIdentity: 1,
            purchaseLimit: 0,
            currentPrice: 69800,
          },
          {
            code: 'vip_yearly',
            name: 'VIP 一年会员',
            level: 1,
            durationType: 3,
            durationDays: 365,
            price: 36800,
            originalPrice: 70800,
            sort: 20,
            description: '超值特惠',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 36800,
          },
          {
            code: 'vip_monthly',
            name: 'VIP 月度会员',
            level: 1,
            durationType: 1,
            durationDays: 30,
            price: 4900,
            originalPrice: 0,
            sort: 50,
            description: '适合先试用',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 4900,
          },
          {
            code: 'svc_month',
            name: '服务月卡',
            level: 1,
            durationType: 1,
            durationDays: 30,
            price: 51800,
            originalPrice: 0,
            sort: 55,
            description: '企服专享',
            applicableIdentity: 2,
            purchaseLimit: 0,
            currentPrice: 51800,
          },
          {
            code: 'ent_vip_triennial',
            name: 'VIP 企业三年套餐',
            level: 1,
            durationType: 3,
            durationDays: 1095,
            price: 168000,
            originalPrice: 210000,
            sort: 110,
            description: '买二送一。企业套餐，按人计价。',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 168000,
          },
          {
            code: 'ent_vip_yearly',
            name: 'VIP 企业一年套餐',
            level: 1,
            durationType: 3,
            durationDays: 365,
            price: 68800,
            originalPrice: 79800,
            sort: 130,
            description: '企业套餐，按人计价',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 68800,
          },
        ]
      }
      if (level === 2) {
        return [
          {
            code: 'svip_annual',
            name: 'SVIP 一年会员',
            level: 2,
            durationType: 3,
            durationDays: 365,
            price: 189800,
            originalPrice: 0,
            sort: 80,
            description: '深度服务',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 189800,
          },
          {
            code: 'ent_svip_annual',
            name: 'SVIP 企业一年套餐',
            level: 2,
            durationType: 3,
            durationDays: 365,
            price: 108800,
            originalPrice: 130800,
            sort: 160,
            description: '企业套餐，按人计价',
            applicableIdentity: null,
            purchaseLimit: 0,
            currentPrice: 108800,
          },
        ]
      }
      return []
    }),
  }
})

const { fetchMembershipBenefits, fetchMembershipPlans } =
  await import('@/api/membership')

/** VIP / SVIP 页签固定展示的权益行，高级搜索接口只在 level 2 返回也要占位 */
const BENEFIT_SHOWCASE = [
  '高级搜索',
  '智能申报',
  '批量查询',
  '匹配政策（企业找政策）',
  '培育企业',
  '个性化政策推荐',
]

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
    vi.mocked(fetchMembershipPlans).mockClear()
    vi.mocked(fetchMembershipBenefits).mockClear()
  })

  it('keeps enterprise plans under the org tab and off the VIP / SVIP tabs', async () => {
    const specialist = mountPage(1)
    await flushPromises()

    // 企业专员看企业板：VIP 页签只有个人套餐，权益只保留白名单几项
    expect(specialist.text()).toContain('企业套餐')
    expect(specialist.text()).toContain('VIP 三年会员')
    expect(specialist.text()).toContain('698')
    expect(specialist.text()).toContain('VIP 一年会员')
    expect(specialist.text()).toContain('368')
    expect(specialist.text()).toContain('VIP 月度会员')
    expect(specialist.text()).not.toContain('VIP 企业三年套餐')
    expect(specialist.text()).not.toContain('VIP 企业一年套餐')
    expect(specialist.text()).not.toContain('服务月卡')
    expect(
      specialist
        .findAll('.benefits .benefit-list li span')
        .map((w) => w.text()),
    ).toEqual(BENEFIT_SHOWCASE)
    expect(specialist.text()).toContain('智能申报：1次/年（可单独购买）')
    expect(specialist.text()).toContain(
      '匹配政策（企业找政策）：基于企业真实数据做政策匹配',
    )
    // 个人套餐卡片不展示「已减」
    expect(specialist.findAll('.plan-saved')).toHaveLength(0)

    expect(fetchMembershipPlans).toHaveBeenCalledWith(0)
    expect(fetchMembershipPlans).toHaveBeenCalledWith(1)
    expect(fetchMembershipPlans).toHaveBeenCalledWith(2)
    expect(fetchMembershipBenefits).toHaveBeenCalledWith(0)
    expect(fetchMembershipBenefits).toHaveBeenCalledWith(1)
    expect(fetchMembershipBenefits).toHaveBeenCalledWith(2)

    // SVIP 页签同样只有个人套餐，权益行与 VIP 一致（高级搜索接口只在 level 2 返回）
    await specialist.get('button.tier-tab.svip').trigger('click')
    expect(specialist.text()).toContain('SVIP 一年会员')
    expect(
      specialist
        .findAll('.benefits .benefit-list li span')
        .map((w) => w.text()),
    ).toEqual(BENEFIT_SHOWCASE)
    expect(specialist.text()).not.toContain('SVIP 企业一年套餐')
    expect(specialist.findAll('.plan-saved')).toHaveLength(0)

    // 企业套餐页签按 VIP / SVIP 分子档，默认落在 SVIP 子档
    await specialist.get('button.tier-tab.org').trigger('click')
    expect(specialist.get('.org-switch').text()).toContain('VIP企业套餐')
    expect(specialist.get('.org-switch').text()).toContain('SVIP企业套餐')
    expect(specialist.text()).toContain('SVIP 企业一年套餐')
    expect(specialist.text()).toContain('1088')
    expect(specialist.text()).toContain('¥1088/人')
    expect(specialist.text()).not.toContain('VIP 企业三年套餐')
    // 企业页签权益是写死的商务权益，不走接口
    expect(
      specialist.findAll('.org-perks li strong').map((w) => w.text()),
    ).toEqual(['更优惠', '更便捷', '更灵活', '可定制'])
    expect(specialist.text()).toContain('批量购买优惠，最高可享8折')
    expect(specialist.text()).toContain(
      '采购流程便捷，发票合同统一申请查看步骤',
    )
    expect(specialist.text()).not.toContain('AI材料')
    expect(specialist.findAll('.plan-saved').map((w) => w.text())).toEqual([
      '已减220/人',
    ])

    // 切到 VIP 子档后只展示企业 VIP 套餐
    const orgSubButtons = specialist.findAll('.org-switch button')
    await orgSubButtons[0].trigger('click')
    expect(specialist.text()).toContain('VIP 企业三年套餐')
    expect(specialist.text()).toContain('1680')
    expect(specialist.text()).toContain('VIP 企业一年套餐')
    expect(specialist.text()).toContain('688')
    expect(specialist.text()).not.toContain('SVIP 企业一年套餐')
    expect(
      specialist.findAll('.org-perks li strong').map((w) => w.text()),
    ).toEqual(['更优惠', '更便捷', '更灵活', '可定制'])
    expect(specialist.text()).toContain('开通新套餐:VIP企业套餐3年')
    expect(specialist.findAll('.plan-saved').map((w) => w.text())).toEqual([
      '已减420/人',
      '已减110/人',
    ])
    // 企业套餐卡片按设计稿：三年套餐带「买二送一」角标，不展示划线价
    const orgCards = specialist.findAll('.plan-card')
    expect(orgCards[0].find('.plan-tag').text()).toBe('买二送一')
    expect(orgCards[1].find('.plan-tag').exists()).toBe(false)
    expect(specialist.findAll('.plan-card del')).toHaveLength(0)
    specialist.unmount()
  })

  it('shows only personal plans to enterprise service users', async () => {
    const service = mountPage(2)
    await flushPromises()

    expect(service.text()).toContain('数据查询、导出与批量处理')
    expect(service.text()).toContain('深度数据+AI申报材料')
    expect(service.text()).toContain('服务月卡')
    expect(service.text()).toContain('518')
    expect(service.text()).toContain('VIP 一年会员')
    expect(service.text()).not.toContain('VIP 三年会员')
    expect(service.text()).not.toContain('VIP 企业三年套餐')
    expect(service.text()).not.toContain('企业套餐')
    expect(
      service.findAll('.benefits .benefit-list li span').map((w) => w.text()),
    ).toEqual(BENEFIT_SHOWCASE)

    await service.get('button.tier-tab.svip').trigger('click')
    expect(service.text()).toContain('SVIP 一年会员')
    expect(
      service.findAll('.svip-benefits ul li strong').map((w) => w.text()),
    ).toEqual(BENEFIT_SHOWCASE)
    expect(service.text()).not.toContain('SVIP 企业一年套餐')
    service.unmount()
  })

  it('asks guests to log in before loading plans', async () => {
    const wrapper = mountPage()
    await flushPromises()
    expect(wrapper.text()).toContain('登录后查看在售套餐')
    // 未登录没有接口数据，权益行用兜底名称占位，仍然展示
    expect(
      wrapper.findAll('.benefits .benefit-list li span').map((w) => w.text()),
    ).toEqual([
      '高级搜索',
      '智能申报',
      '批量查询',
      '匹配政策',
      '培育企业',
      '个性化政策推荐',
    ])
    expect(fetchMembershipPlans).not.toHaveBeenCalled()
    expect(fetchMembershipBenefits).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
