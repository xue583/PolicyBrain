import { describe, expect, it } from 'vitest'
import { formatLastLogin, identityLabel, maskPhone } from './userDisplay'

describe('identityLabel', () => {
  it('maps policy user types', () => {
    expect(identityLabel(1)).toBe('企业专员')
    expect(identityLabel('2')).toBe('企服人员')
  })

  it('returns empty for unknown or missing identity', () => {
    expect(identityLabel()).toBe('')
    expect(identityLabel(null)).toBe('')
    expect(identityLabel(9)).toBe('')
  })
})

describe('maskPhone', () => {
  it('keeps the first 3 and last 4 digits', () => {
    expect(maskPhone('19545670526')).toBe('195****0526')
  })

  it('returns short or empty values unchanged', () => {
    expect(maskPhone('123')).toBe('123')
    expect(maskPhone('')).toBe('')
    expect(maskPhone()).toBe('')
  })
})

describe('formatLastLogin', () => {
  it('formats datetime to date', () => {
    expect(formatLastLogin('2026-08-16T10:00:00')).toBe('2026-08-16')
  })

  it('returns empty when missing', () => {
    expect(formatLastLogin()).toBe('')
    expect(formatLastLogin('')).toBe('')
  })
})
