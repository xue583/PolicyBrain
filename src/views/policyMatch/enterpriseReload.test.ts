import { describe, expect, it } from 'vitest'
import { shouldLoadEnterprises } from './enterpriseReload'

describe('shouldLoadEnterprises', () => {
  it('lets the page watcher load when a later page is reset outside local mode', () => {
    expect(shouldLoadEnterprises(3, false)).toBe(false)
  })

  it('loads immediately when already on the first page', () => {
    expect(shouldLoadEnterprises(1, false)).toBe(true)
    expect(shouldLoadEnterprises(1, true)).toBe(true)
  })

  it('loads in local mode because the page watcher skips that mode', () => {
    expect(shouldLoadEnterprises(3, true)).toBe(true)
  })
})
