import dayjs from 'dayjs'
import { PolicyUserType } from '@/api/auth'

export const IDENTITY_LABEL: Record<number, string> = {
  [PolicyUserType.EnterpriseSpecialist]: '企业专员',
  [PolicyUserType.EnterpriseService]: '企服人员',
}

export const identityLabel = (identity?: string | number | null) => {
  if (identity == null || identity === '') return ''
  return IDENTITY_LABEL[Number(identity)] || ''
}

/** 11 位手机号展示为 195****0526 */
export const maskPhone = (phone?: string | null) => {
  const value = (phone || '').trim()
  if (value.length < 7) return value
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

export const formatLastLogin = (value?: string | null) => {
  if (!value) return ''
  const d = dayjs(value)
  return d.isValid() ? d.format('YYYY-MM-DD') : value
}
