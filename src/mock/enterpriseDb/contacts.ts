import { LEGAL_REPS } from './helpers'
import type { EnterpriseContact, EnterpriseItem } from './types'

const CONTACT_ROLES = [
  { name: '李四', title: '法人' },
  { name: '张三', title: '总经理' },
  { name: '王五', title: '财务负责人' },
  { name: '赵六', title: '技术负责人' },
]

const buildContacts = (item: EnterpriseItem): EnterpriseContact[] => {
  const seedId = Number(item.id)
  const legal = LEGAL_REPS[(seedId - 1) % LEGAL_REPS.length] ?? '李某某'
  const phone = seedId === 1 ? '13566668888' : `135${String(60000000 + seedId)}`
  return CONTACT_ROLES.map((role, index) => ({
    id: String(index + 1),
    name: seedId === 1 ? role.name : index === 0 ? legal : role.name,
    title: role.title,
    phone,
    email: `contact${seedId}@example.com`,
  }))
}

export { buildContacts }
