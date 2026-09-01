import { buildApplyInfo, buildTags, dateFor } from './applyInfo'
import { getPolicyDbById } from './list'
import { buildPublicity } from './publicity'
import { buildSupportMeasures } from './support'
import type { PolicyDbDetail } from './types'
import { buildUpdates } from './updates'

export const getPolicyDbDetail = (id: number): PolicyDbDetail | undefined => {
  const item = getPolicyDbById(id)
  if (!item) return undefined
  return {
    ...item,
    date: dateFor(item.id),
    tags: buildTags(item),
    applyInfo: buildApplyInfo(item),
    supportMeasures: buildSupportMeasures(item),
    updates: buildUpdates(item),
    publicity: buildPublicity(item),
  }
}
