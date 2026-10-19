import type { PolicyItem } from '@/mock/policyNews'

const placeCore = (name: string) => name.replace(/(市|地区|盟|州|区|县)$/u, '')

const itemText = (item: PolicyItem) =>
  `${item.region} ${item.title} ${item.department}`

/** 顶部地区切换后筛首页资讯：其他城市的条目去掉，当前区县、城市依次排在前面。 */
export const orderNewsForCity = (
  items: PolicyItem[],
  city: string,
  cityNames: string[],
  district = '',
): PolicyItem[] => {
  const selected = placeCore(city)
  if (!selected) return items
  const districtName = placeCore(district)

  const others = cityNames
    .map(placeCore)
    .filter((name) => name && name !== selected && name !== districtName)
    .sort((left, right) => right.length - left.length)

  const mentions = (item: PolicyItem, name: string) =>
    Boolean(name) && itemText(item).includes(name)

  const belongsToOtherCity = (item: PolicyItem) => {
    if (item.region && item.region.includes(selected)) return false
    return others.some((name) => mentions(item, name))
  }

  const rank = (item: PolicyItem) => {
    if (districtName && mentions(item, districtName)) return 0
    if (mentions(item, selected)) return 1
    return 2
  }

  return items
    .filter((item) => !belongsToOtherCity(item))
    .map((item, index) => ({ item, index, rank: rank(item) }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map((entry) => entry.item)
}
