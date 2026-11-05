import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PolicyUserType } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import BindEnterpriseModal from './BindEnterpriseModal.vue'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/api/account', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/account')>('@/api/account')
  return {
    ...actual,
    bindMyEnterprise: vi.fn(),
  }
})

vi.mock('@/api/enterprises', () => ({
  searchEnterpriseBindOptions: vi.fn(async () => []),
}))

const { bindMyEnterprise } = await import('@/api/account')
const { message } = await import('ant-design-vue')

const mountModal = (identity?: number) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  if (identity) {
    useAuthStore().user = { phone: '19545670526', identity }
  }
  return mount(BindEnterpriseModal, {
    props: { open: true },
    global: {
      plugins: [pinia],
      stubs: {
        AModal: {
          props: ['open'],
          template: '<div v-if="open"><slot name="title" /><slot /></div>',
        },
        AInput: {
          props: ['value'],
          emits: ['update:value', 'pressEnter'],
          template:
            '<input aria-label="统一社会信用代码" :value="value" @input="$emit(\'update:value\', $event.target.value)" />',
        },
        ASelect: {
          props: ['value', 'options'],
          emits: ['change'],
          template:
            "<button type=\"button\" class=\"pick-enterprise\" @click=\"$emit('change', { value: '367740240010885', label: '郑州西亚斯学院' }, { value: '367740240010885', label: '郑州西亚斯学院', creditCode: '52410000415806671e' })\">选择企业</button>",
        },
        AButton: {
          template:
            '<button type="button" @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  })
}

describe('BindEnterpriseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('binds with the credit code', async () => {
    vi.mocked(bindMyEnterprise).mockResolvedValue({
      enterpriseId: 18,
      name: '郑州源创基因科技有限公司',
    })

    const wrapper = mountModal()
    await wrapper
      .get('input[aria-label="统一社会信用代码"]')
      .setValue('91410100ma9g00018x')
    const bindButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '绑定')
    await bindButton!.trigger('click')
    await flushPromises()

    expect(bindMyEnterprise).toHaveBeenCalledWith({
      creditCode: '91410100MA9G00018X',
    })
    expect(message.success).toHaveBeenCalledWith('绑定成功')
    expect(wrapper.emitted('bound')?.[0]).toEqual([18])
    wrapper.unmount()
  })

  it('fills the credit code from the selected enterprise', async () => {
    vi.mocked(bindMyEnterprise).mockResolvedValue({
      enterpriseId: 367740240010885,
      name: '郑州西亚斯学院',
      creditCode: '52410000415806671E',
    })

    const wrapper = mountModal(PolicyUserType.EnterpriseSpecialist)
    await wrapper.get('.pick-enterprise').trigger('click')
    expect(
      (
        wrapper.get('input[aria-label="统一社会信用代码"]')
          .element as HTMLInputElement
      ).value,
    ).toBe('52410000415806671E')

    const bindButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '绑定')
    await bindButton!.trigger('click')
    await flushPromises()

    expect(bindMyEnterprise).toHaveBeenCalledWith({
      creditCode: '52410000415806671E',
    })
    wrapper.unmount()
  })

  it('submits the enterprise id for service staff', async () => {
    vi.mocked(bindMyEnterprise).mockResolvedValue({
      enterpriseId: 367740240010885,
      name: '郑州西亚斯学院',
    })

    const wrapper = mountModal(PolicyUserType.EnterpriseService)
    await wrapper.get('.pick-enterprise').trigger('click')
    const bindButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '绑定')
    await bindButton!.trigger('click')
    await flushPromises()

    expect(bindMyEnterprise).toHaveBeenCalledWith({
      enterpriseId: 367740240010885,
    })
    wrapper.unmount()
  })

  it('asks for one of the two fields', async () => {
    const wrapper = mountModal()
    const bindButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '绑定')
    await bindButton!.trigger('click')
    expect(bindMyEnterprise).not.toHaveBeenCalled()
    expect(message.warning).toHaveBeenCalledWith(
      '请填写统一社会信用代码或选择企业',
    )
    wrapper.unmount()
  })
})
