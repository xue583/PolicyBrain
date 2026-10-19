import { describe, expect, it } from 'vitest'
import {
  hasRegionIds,
  parseRegionId,
  parseRegionIds,
  regionIdsKey,
  regionQueryMatches,
  sameRegionIds,
  withRegionIds,
} from './regionQuery'

describe('parseRegionId', () => {
  it('reads numeric ids and rejects blanks', () => {
    expect(parseRegionId('41')).toBe(41)
    expect(parseRegionId(41)).toBe(41)
    expect(parseRegionId('')).toBeNull()
    expect(parseRegionId(null)).toBeNull()
    expect(parseRegionId(undefined)).toBeNull()
    expect(parseRegionId('abc')).toBeNull()
  })
})

describe('parseRegionIds', () => {
  it('reads the three region keys from a query', () => {
    expect(
      parseRegionIds({
        provinceId: '41',
        cityId: '4101',
        districtId: '410102',
      }),
    ).toEqual({ provinceId: 41, cityId: 4101, districtId: 410102 })
  })

  it('returns nulls when the query carries no region', () => {
    expect(parseRegionIds({ q: 'policy' })).toEqual({
      provinceId: null,
      cityId: null,
      districtId: null,
    })
  })
})

describe('withRegionIds', () => {
  it('keeps unrelated query params', () => {
    expect(
      withRegionIds(
        { q: 'policy', page: '2' },
        {
          provinceId: 41,
          cityId: null,
          districtId: null,
        },
      ),
    ).toEqual({ q: 'policy', page: '2', provinceId: '41' })
  })

  it('drops region keys that are empty', () => {
    expect(
      withRegionIds(
        { provinceId: '41', cityId: '4101' },
        {
          provinceId: null,
          cityId: null,
          districtId: null,
        },
      ),
    ).toEqual({})
  })

  it('replaces stale values', () => {
    expect(
      withRegionIds(
        { provinceId: '41', cityId: '4101' },
        {
          provinceId: 41,
          cityId: 4102,
          districtId: null,
        },
      ),
    ).toEqual({ provinceId: '41', cityId: '4102' })
  })
})

describe('region query comparisons', () => {
  const ids = { provinceId: 41, cityId: 4101, districtId: null }

  it('matches only when all three levels agree', () => {
    expect(regionQueryMatches({ provinceId: '41', cityId: '4101' }, ids)).toBe(
      true,
    )
    expect(regionQueryMatches({ provinceId: '41' }, ids)).toBe(false)
    expect(
      regionQueryMatches(
        { provinceId: '41', cityId: '4101', districtId: '9' },
        ids,
      ),
    ).toBe(false)
  })

  it('compares id sets and detects empty selections', () => {
    expect(sameRegionIds(ids, { ...ids })).toBe(true)
    expect(sameRegionIds(ids, { ...ids, cityId: 4102 })).toBe(false)
    expect(hasRegionIds(ids)).toBe(true)
    expect(
      hasRegionIds({ provinceId: null, cityId: null, districtId: null }),
    ).toBe(false)
    expect(regionIdsKey(ids)).toBe('41:4101:')
  })
})
