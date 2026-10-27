import { describe, expect, it } from 'vitest'
import { normalizeMessagePage, parseUnreadCount } from '@/api/account'

describe('message notification contract', () => {
  it('reads unread count from a number or a count field', () => {
    expect(parseUnreadCount(3)).toBe(3)
    expect(parseUnreadCount('4')).toBe(4)
    expect(parseUnreadCount({ unreadCount: 5 })).toBe(5)
    expect(parseUnreadCount({ count: 2 })).toBe(2)
    expect(parseUnreadCount({ totalCount: 8 })).toBe(8)
    expect(parseUnreadCount({ data: 6 })).toBe(6)
    expect(parseUnreadCount(null)).toBe(0)
    expect(parseUnreadCount({ status: 200 })).toBe(0)
  })

  it('accepts both a page object and a bare message array', () => {
    expect(
      normalizeMessagePage(
        {
          items: [{ id: 1, title: '审核结果', isRead: false }],
          pageIndex: 2,
          pageSize: 10,
          totalElements: 12,
        },
        2,
        10,
      ),
    ).toMatchObject({
      pageIndex: 2,
      totalElements: 12,
      items: [{ id: 1, title: '审核结果' }],
    })

    expect(
      normalizeMessagePage(
        {
          items: [{ id: 2, title: '抄送' }],
          totalCount: 7,
        },
        1,
        10,
      ).totalElements,
    ).toBe(7)

    expect(
      normalizeMessagePage(
        [{ id: 3, title: '待办', summary: '请处理' }],
        1,
        10,
      ),
    ).toMatchObject({
      pageIndex: 1,
      pageSize: 10,
      totalElements: 1,
    })
  })
})
