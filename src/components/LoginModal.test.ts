import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/utils/request'
import LoginModal from './LoginModal.vue'

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

const {
  createSession,
  fetchCurrentUser,
  sendSmsCode,
  updateCurrentUser,
  verifySmsCode,
} = await import('@/api/auth')
const { message } = await import('ant-design-vue')

const mountModal = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(LoginModal, {
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
  return wrapper
}

const fillPhoneAndCode = async (
  wrapper: ReturnType<typeof mount>,
  phone = '13900000000',
  code = '1234',
) => {
  await wrapper.get('input[type="tel"]').setValue(phone)
  await wrapper.get('input[maxlength="6"]').setValue(code)
}

describe('LoginModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(sendSmsCode).mockResolvedValue({})
    vi.mocked(createSession).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      phone: '13900000000',
    })
    vi.mocked(updateCurrentUser).mockResolvedValue({
      phone: '13900000000',
      companyName: '河南省政策宝数字科技有限公司',
    })
  })

  it('creates a login session with a 4-6 digit sms code', async () => {
    const wrapper = mountModal()
    await fillPhoneAndCode(wrapper, '13900000000', '123456')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '123456',
      purpose: 2,
    })
    expect(verifySmsCode).not.toHaveBeenCalled()
    expect(message.success).toHaveBeenCalledWith('登录成功')
    wrapper.unmount()
  })

  it('creates the register session on step one, then only updates profile', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('.login-tab')[1]!.trigger('click')
    await fillPhoneAndCode(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(createSession).toHaveBeenCalledTimes(1)
    expect(createSession).toHaveBeenCalledWith({
      phone: '13900000000',
      code: '1234',
      purpose: 1,
    })
    expect(verifySmsCode).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('您主要如何使用平台')

    await wrapper.get('.identity-card').trigger('click')
    await wrapper.get('.btn-primary').trigger('click')
    const inputs = wrapper.findAll('.form-input')
    await inputs[0]!.setValue('河南省政策宝数字科技有限公司')
    await inputs[1]!.setValue('91410000MA9ABCDE12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(createSession).toHaveBeenCalledTimes(1)
    expect(updateCurrentUser).toHaveBeenCalledWith({
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
      unifiedSocialCreditCode: '91410000MA9ABCDE12',
      jobTitle: undefined,
      nickname: undefined,
      invitationCode: undefined,
    })
    expect(message.success).toHaveBeenCalledWith('注册成功')
    wrapper.unmount()
  })

  it('keeps the modal open when profile update fails after register', async () => {
    vi.mocked(updateCurrentUser).mockRejectedValue(
      new ApiError('公司名称无效', 400),
    )
    const wrapper = mountModal()
    await wrapper.findAll('.login-tab')[1]!.trigger('click')
    await fillPhoneAndCode(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
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

  it('clears the sms code and countdown when switching tabs', async () => {
    const wrapper = mountModal()
    await fillPhoneAndCode(wrapper)
    await wrapper.get('.code-btn').trigger('click')
    await flushPromises()
    expect(wrapper.get('.code-btn').text()).toContain('s')

    await wrapper.findAll('.login-tab')[1]!.trigger('click')
    expect(wrapper.get('input[maxlength="6"]').element).toMatchObject({
      value: '',
    })
    expect(wrapper.get('.code-btn').text()).toBe('获取验证码')
    wrapper.unmount()
  })

  it('closes on escape', async () => {
    const wrapper = mountModal()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })
})
