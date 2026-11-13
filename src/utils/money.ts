/** 将接口整数分金额规范化为十进制字符串；拒绝小数、非安全整数和其他格式。 */
export const normalizeFen = (value: unknown): string | null => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? String(value) : null
  }
  if (typeof value !== 'string') return null

  const text = value.trim()
  return /^-?\d+$/.test(text) ? BigInt(text).toString() : null
}

/** 比较两个已规范化的整数分金额。 */
export const compareFen = (left: string, right: string) => {
  const a = BigInt(left)
  const b = BigInt(right)
  return a === b ? 0 : a > b ? 1 : -1
}

/** 计算两个已规范化整数分金额的差值。 */
export const subtractFen = (left: string, right: string) =>
  (BigInt(left) - BigInt(right)).toString()

/** 按购买数量计算整数分总金额，返回值仍可安全序列化为 JSON 字符串。 */
export const multiplyFen = (value: string, quantity: number) =>
  (BigInt(value) * BigInt(quantity)).toString()

/** 将整数分金额除以正整数天数，并四舍五入到分；负数按绝对值四舍五入后恢复符号（半数远离零）。 */
export const divideFenRounded = (value: string, divisor: number) => {
  const amount = BigInt(value)
  const days = BigInt(divisor)
  const negative = amount < 0n
  const abs = negative ? -amount : amount
  const quotient = abs / days
  const remainder = abs % days
  const rounded = quotient + (remainder * 2n >= days ? 1n : 0n)
  return (negative ? -rounded : rounded).toString()
}

/** 将整数分格式化为元；默认去除末尾零，fixed 为 true 时保留两位小数。 */
export const formatFen = (value: string, fixed = false) => {
  const amount = BigInt(value)
  const negative = amount < 0n
  const digits = (negative ? -amount : amount).toString().padStart(3, '0')
  const integer = digits.slice(0, -2)
  const fraction = digits.slice(-2)
  const suffix = fixed ? `.${fraction}` : `.${fraction}`.replace(/\.?0+$/, '')

  return `${negative ? '-' : ''}${integer}${suffix}`
}
