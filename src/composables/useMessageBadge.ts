import { ref } from 'vue'
import { fetchUnreadMessageCount } from '@/api/account'
import { getToken } from '@/utils/auth'

/** 顶栏与消息面板共用，避免已读后角标还停在旧数字 */
const unreadCount = ref(0)
let seq = 0

export const resetMessageUnread = () => {
  seq += 1
  unreadCount.value = 0
}

export const refreshMessageUnread = async () => {
  if (!getToken()) {
    resetMessageUnread()
    return
  }
  const id = ++seq
  try {
    const count = await fetchUnreadMessageCount()
    if (id !== seq) return
    unreadCount.value = count
  } catch {
    // 失败时保留上一次的数字，避免角标闪没
  }
}

export const useMessageBadge = () => ({
  unreadCount,
  refreshMessageUnread,
  resetMessageUnread,
})
