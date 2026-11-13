import { describe, expect, it } from 'vitest'
import {
  compareFen,
  divideFenRounded,
  formatFen,
  multiplyFen,
  normalizeFen,
  subtractFen,
} from './money'

describe('integer fen money', () => {
  it('normalizes integer strings and rejects unsafe numeric input', () => {
    expect(normalizeFen('000100')).toBe('100')
    expect(normalizeFen('12.34')).toBeNull()
    expect(normalizeFen(Number.MAX_SAFE_INTEGER + 1)).toBeNull()
  })

  it('compares and subtracts by integer value instead of lexical order', () => {
    expect(compareFen('100', '99')).toBe(1)
    expect(subtractFen('100', '99')).toBe('1')
  })

  it('formats and multiplies Int64 amounts without losing precision', () => {
    const maxInt64 = '9223372036854775807'
    const total = multiplyFen(maxInt64, 5)

    expect(formatFen(maxInt64, true)).toBe('92233720368547758.07')
    expect(total).toBe('46116860184273879035')
    expect(formatFen(total)).toBe('461168601842738790.35')
  })

  it('rounds a daily amount to fen and trims display-only trailing zeroes', () => {
    expect(divideFenRounded('70800', 365)).toBe('194')
    expect(formatFen('194')).toBe('1.94')
    expect(formatFen('100')).toBe('1')
    expect(formatFen('100', true)).toBe('1.00')
  })

  it('handles negative fen across normalize, compare, subtract, divide and format', () => {
    expect(normalizeFen('-100')).toBe('-100')
    expect(compareFen('-100', '-99')).toBe(-1)
    expect(subtractFen('-100', '1')).toBe('-101')
    // 四舍五入取绝对值语义：-3/2 → 商 -1 余 -1 → 向远离零进位
    expect(divideFenRounded('-3', 2)).toBe('-2')
    expect(formatFen('-101')).toBe('-1.01')
    expect(formatFen('-1000')).toBe('-10')
    expect(formatFen('-1', true)).toBe('-0.01')
  })
})
