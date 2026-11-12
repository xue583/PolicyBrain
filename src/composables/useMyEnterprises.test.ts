import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('ant-design-vue', () => ({
  Modal: {
    confirm: (options: { onOk?: () => Promise<void> }) => {
      void options.onOk?.()
    },
  },
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/api/account', () => ({
  fetchMyEnterprises: vi.fn(),
  unbindMyEnterprise: vi.fn(),
}))

const { fetchMyEnterprises, unbindMyEnterprise } = await import('@/api/account')
const { resetMyEnterprises, useMyEnterprises } =
  await import('./useMyEnterprises')

const bound = {
  items: [{ enterpriseId: 7, name: '甲公司' }],
  canBindMore: false,
  maxBindings: 1,
}

describe('useMyEnterprises', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetMyEnterprises()
    vi.clearAllMocks()
  })

  it('shares one list between personal center and the workbench', async () => {
    vi.mocked(fetchMyEnterprises).mockResolvedValue(bound)
    const personal = useMyEnterprises()
    const workbench = useMyEnterprises()

    await personal.load()

    expect(fetchMyEnterprises).toHaveBeenCalledTimes(1)
    expect(workbench.items.value).toEqual(bound.items)
  })

  it('joins a load that is already in flight', async () => {
    let resolveList: (value: typeof bound) => void = () => undefined
    vi.mocked(fetchMyEnterprises).mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      }),
    )
    const personal = useMyEnterprises()
    const workbench = useMyEnterprises()

    const first = personal.load()
    const second = workbench.load()
    resolveList(bound)
    await Promise.all([first, second])

    expect(fetchMyEnterprises).toHaveBeenCalledTimes(1)
    expect(workbench.items.value).toEqual(bound.items)
  })

  it('updates both callers after unbind', async () => {
    vi.mocked(fetchMyEnterprises).mockResolvedValue(bound)
    vi.mocked(unbindMyEnterprise).mockResolvedValue({ items: [] })
    const personal = useMyEnterprises()
    const workbench = useMyEnterprises()
    await personal.load()

    personal.unbind(bound.items[0])
    await flushPromises()

    expect(unbindMyEnterprise).toHaveBeenCalledWith(7)
    expect(workbench.items.value).toEqual([])
    expect(personal.items.value).toEqual([])
  })
})
