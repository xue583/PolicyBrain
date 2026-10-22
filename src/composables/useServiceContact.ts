import { computed, onMounted, ref } from 'vue'
import { fetchServiceContacts, type ServiceContact } from '@/api/account'
import { SITE } from '@/constants/site'

const contact = ref<ServiceContact | null>(null)
let pending: Promise<void> | null = null
let settled = false

const filled = (value: string | null | undefined, fallback: string) => {
  const text = value?.trim()
  return text || fallback
}

/** 首页、页脚、个人中心共用一次请求；失败后允许下次进入再试 */
export const loadServiceContact = () => {
  if (settled) return pending ?? Promise.resolve()
  if (pending) return pending
  pending = fetchServiceContacts()
    .then((data) => {
      contact.value = data ?? null
      settled = true
    })
    .catch(() => {
      settled = false
    })
    .finally(() => {
      pending = null
    })
  return pending
}

export const resetServiceContactCache = () => {
  contact.value = null
  pending = null
  settled = false
}

export const useServiceContact = () => {
  onMounted(() => {
    void loadServiceContact()
  })

  return {
    phone: computed(() => filled(contact.value?.phone, SITE.phone)),
    wechat: computed(() => filled(contact.value?.wechatAccount, SITE.wechat)),
    workHours: computed(() => filled(contact.value?.workHours, SITE.workHours)),
    qrUrl: computed(() => contact.value?.wechatQrUrl?.trim() || ''),
  }
}
