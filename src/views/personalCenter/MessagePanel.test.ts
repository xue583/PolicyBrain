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
import MessagePanel from './MessagePanel.vue'
import { resetMessageUnread } from '@/composables/useMessageBadge'

vi.mock('@/api/account', async () => {
  const actual =
    await vi.importActual<typeof import('@/api/account')>('@/api/account')
  return {
    ...actual,
    fetchAccountMessages: vi.fn(),
    fetchUnreadMessageCount: vi.fn(),
    markMessageRead: vi.fn(),
    markAllMessagesRead: vi.fn(),
  }
})

const {
  fetchAccountMessages,
  fetchUnreadMessageCount,
  markMessageRead,
  markAllMessagesRead,
} = await import('@/api/account')

const messagePage = {
  items: [
    {
      id: 11,
      title: '申报审核通过',
      summary: '您提交的申报已通过初审',
      isRead: false,
      createTime: '2026-08-14T18:45:00',
      messageType: 3,
    },
  ],
  pageIndex: 1,
  pageSize: 10,
  totalElements: 4,
}

const mountPanel = async () => {
  const wrapper = mount(MessagePanel)
  await flushPromises()
  return wrapper
}

describe('MessagePanel', () => {
  beforeEach(() => {
    localStorage.setItem('pb_access_token', 'access')
    resetMessageUnread()
    vi.clearAllMocks()
    vi.mocked(fetchUnreadMessageCount).mockResolvedValue(2)
    vi.mocked(fetchAccountMessages).mockImplementation(async () => ({
      ...messagePage,
      items: messagePage.items.map((item) => ({ ...item })),
    }))
    vi.mocked(markMessageRead).mockResolvedValue(undefined)
    vi.mocked(markAllMessagesRead).mockResolvedValue(undefined)
  })

  it('loads the message list and unread count', async () => {
    const wrapper = await mountPanel()

    expect(fetchAccountMessages).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 10,
      isRead: undefined,
    })
    expect(wrapper.text()).toContain('申报审核通过')
    expect(wrapper.text()).toContain('您提交的申报已通过初审')
    expect(wrapper.text()).toContain('2026-08-14 18:45')
    expect(wrapper.text()).toContain('全部（4）')
    expect(wrapper.text()).toContain('未读（2）')
    wrapper.unmount()
  })

  it('requests unread messages and marks one as read', async () => {
    const wrapper = await mountPanel()
    const unreadTab = wrapper
      .findAll('button')
      .find((button) => button.text().includes('未读'))
    await unreadTab!.trigger('click')
    await flushPromises()

    expect(fetchAccountMessages).toHaveBeenLastCalledWith({
      pageIndex: 1,
      pageSize: 10,
      isRead: false,
    })

    await wrapper.get('.msg-link').trigger('click')
    await flushPromises()

    expect(markMessageRead).toHaveBeenCalledWith(11)
    expect(document.body.textContent).toContain('结果')
    expect(document.body.textContent).toContain('您提交的申报已通过初审')
    wrapper.unmount()
  })

  it('marks every message read', async () => {
    const wrapper = await mountPanel()
    await wrapper.get('.msg-read-all').trigger('click')
    await flushPromises()

    expect(markAllMessagesRead).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
