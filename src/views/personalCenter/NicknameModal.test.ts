import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import NicknameModal from './NicknameModal.vue'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/api/auth', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/auth')>('@/api/auth')
  return {
    ...actual,
    updateCurrentUser: vi.fn(),
  }
})

const { updateCurrentUser } = await import('@/api/auth')
const { message } = await import('ant-design-vue')

const mountModal = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user = {
    phone: '19545670526',
    nickname: '李四',
    identity: 1,
    companyName: '河南省政策宝数字科技有限公司',
  }
  return mount(NicknameModal, {
    props: { open: true },
    global: {
      plugins: [pinia],
      stubs: {
        AModal: {
          template:
            '<div class="nickname-modal"><slot name="title" /><slot /></div>',
        },
        AInput: {
          props: ['value'],
          emits: ['update:value', 'pressEnter'],
          template:
            '<input aria-label="用户名" :value="value" @input="$emit(\'update:value\', $event.target.value)" @keydown.enter="$emit(\'pressEnter\')" />',
        },
        AButton: {
          template:
            '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })
}

describe('NicknameModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('updates only the nickname', async () => {
    vi.mocked(updateCurrentUser).mockResolvedValue({
      phone: '19545670526',
      nickname: '王五',
      identity: 1,
      companyName: '河南省政策宝数字科技有限公司',
    })

    const wrapper = mountModal()
    await flushPromises()
    const input = wrapper.get('input[aria-label="用户名"]')
    expect((input.element as HTMLInputElement).value).toBe('李四')
    await input.setValue('王五')
    await wrapper.get('button:last-child').trigger('click')
    await flushPromises()

    expect(updateCurrentUser).toHaveBeenCalledWith({ nickname: '王五' })
    expect(message.success).toHaveBeenCalledWith('用户名已更新')
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('keeps the modal open when the update fails', async () => {
    vi.mocked(updateCurrentUser).mockRejectedValue(
      new ApiError('用户名不可用', 400),
    )

    const wrapper = mountModal()
    await flushPromises()
    await wrapper.get('input[aria-label="用户名"]').setValue('王五')
    await wrapper.get('button:last-child').trigger('click')
    await flushPromises()

    expect(message.error).toHaveBeenCalledWith('用户名不可用')
    expect(message.success).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:open')).toBeUndefined()
    wrapper.unmount()
  })
})
