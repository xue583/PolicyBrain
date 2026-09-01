import { LEGAL_REPS } from './helpers'
import type { EnterpriseContact, EnterpriseItem } from './types'

const CONTACT_ROLES = [
  { name: '李四', title: '法人' },
  { name: '张三', title: '总经理' },
  { name: '王五', title: '财务负责人' },
  { name: '赵六', title: '技术负责人' },
]

const buildContacts = (item: EnterpriseItem): EnterpriseContact[] => {
  const legal = LEGAL_REPS[(item.id - 1) % LEGAL_REPS.length] ?? '李某某'
  const phone =
    item.id === 1 ? '13566668888' : `135${String(60000000 + item.id)}`
  return CONTACT_ROLES.map((role, index) => ({
    id: index + 1,
    name: item.id === 1 ? role.name : index === 0 ? legal : role.name,
    title: role.title,
    phone,
    email: `contact${item.id}@example.com`,
  }))
}

export { buildContacts }
