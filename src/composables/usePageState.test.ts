import { describe, expect, it } from 'vitest'
import { usePageState } from './usePageState'

describe('usePageState', () => {
  it('resolves data and clears flags', async () => {
    const { loading, error, run } = usePageState()
    const result = await run(async () => 7)
    expect(result).toBe(7)
    expect(loading.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('captures a thrown Error message', async () => {
    const { loading, error, run } = usePageState()
    const result = await run(async () => {
      throw new Error('网络异常')
    })
    expect(result).toBeUndefined()
    expect(loading.value).toBe(false)
    expect(error.value).toBe('网络异常')
  })
})
