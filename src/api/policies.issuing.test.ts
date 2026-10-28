import { describe, expect, it } from 'vitest'
import {
  mapIssuingAuthorityOptions,
  parseJsonPreservingLongIds,
} from './policies'

describe('parseJsonPreservingLongIds', () => {
  it('keeps snowflake ids as strings', () => {
    const parsed = parseJsonPreservingLongIds(
      '{"status":200,"data":{"items":[{"id":1879640193390086146,"name":"科学技术厅","level":1}]}}',
    ) as { data: { items: { id: string; level: number }[] } }

    expect(parsed.data.items[0]?.id).toBe('1879640193390086146')
    expect(parsed.data.items[0]?.level).toBe(1)
  })
})

describe('mapIssuingAuthorityOptions', () => {
  it('reads data.items and prefers displayName', () => {
    expect(
      mapIssuingAuthorityOptions({
        items: [
          { id: '12', name: '科学技术厅', displayName: '省科技厅' },
          { id: '', name: '空' },
        ],
      }),
    ).toEqual([{ id: '12', name: '省科技厅' }])
  })
})
