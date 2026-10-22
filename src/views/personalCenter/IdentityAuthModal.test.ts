import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/utils/request'
import IdentityAuthModal from './IdentityAuthModal.vue'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => vi.fn()),
  },
}))

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

const { updateCurrentUser } = await import('@/api/auth')
const { message } = await import('ant-design-vue')

const mountModal = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(IdentityAuthModal, {
    attachTo: document.body,
    props: { open: true },
    global: {
      plugins: [pinia],
      stubs: {
        Teleport: { template: '<div><slot /></div>' },
        ASteps: { template: '<div class="reg-steps"><slot /></div>' },
        AStep: { template: '<div><slot name="icon" /></div>' },
      },
    },
  })
}

describe('IdentityAuthModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(updateCurrentUser).mockResolvedValue({
      phone: '13900000000',
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
    })
  })

  it('requires an identity before the profile form', async () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('您主要如何使用平台')
    await wrapper.get('.btn-primary').trigger('click')
    expect(wrapper.text()).toContain('请选择使用身份')
    expect(wrapper.find('.form-input').exists()).toBe(false)
    wrapper.unmount()
  })

  it('submits the identity profile form', async () => {
    const wrapper = mountModal()
    await wrapper.get('.identity-card').trigger('click')
    await wrapper.get('.btn-primary').trigger('click')
    const inputs = wrapper.findAll('.form-input')
    await inputs[0]!.setValue('河南省政策宝数字科技有限公司')
    await inputs[1]!.setValue('91410000MA9ABCDE12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(updateCurrentUser).toHaveBeenCalledWith({
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
      unifiedSocialCreditCode: '91410000MA9ABCDE12',
      jobTitle: undefined,
      nickname: undefined,
    })
    expect(message.success).toHaveBeenCalledWith('认证资料已提交')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('keeps the modal open when profile update fails', async () => {
    vi.mocked(updateCurrentUser).mockRejectedValue(
      new ApiError('公司名称无效', 400),
    )
    const wrapper = mountModal()
    await wrapper.get('.identity-card').trigger('click')
    await wrapper.get('.btn-primary').trigger('click')
    const inputs = wrapper.findAll('.form-input')
    await inputs[0]!.setValue('河南省政策宝数字科技有限公司')
    await inputs[1]!.setValue('91410000MA9ABCDE12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(message.success).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('公司名称无效')
    expect(wrapper.find('.login-overlay').exists()).toBe(true)
    wrapper.unmount()
  })
})
