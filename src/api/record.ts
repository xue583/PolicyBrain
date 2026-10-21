export const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export const pick = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export const pickString = (
  record: Record<string, unknown>,
  keys: string[],
  fallback = '',
) => {
  const value = pick(record, keys)
  return value === undefined ? fallback : String(value)
}

export const pickNumber = (
  record: Record<string, unknown>,
  keys: string[],
  fallback = 0,
) => {
  const value = pick(record, keys)
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export const formatDate = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '-'
  const text = String(value)
  if (text.startsWith('1900') || text.startsWith('0001')) return '-'
  const matched = text.match(/\d{4}-\d{2}-\d{2}/)
  return matched ? matched[0] : text
}

export const daysUntil = (value: unknown) => {
  const text = formatDate(value)
  if (text === '-') return 0
  const end = new Date(`${text}T00:00:00`)
  if (Number.isNaN(end.getTime())) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - today.getTime()) / 86400000)
}
