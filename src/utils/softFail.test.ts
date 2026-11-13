import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { message } = vi.hoisted(() => ({
  message: { warning: vi.fn(), error: vi.fn(), success: vi.fn() },
}))

vi.mock('ant-design-vue', () => ({ message }))

const { softFail } = await import('./softFail')

describe('softFail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['空数组回退', [] as unknown[]],
    ['undefined 回退', undefined],
    ['null 回退', null],
  ])('%s：返回回退值并提示', (_name, fallback) => {
    const handler = softFail(fallback, '顶栏地区选项')
    const error = new Error('boom')

    expect(handler(error)).toBe(fallback)
    expect(message.warning).toHaveBeenCalledWith(
      '顶栏地区选项加载失败，相关内容暂不可用',
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[softFail:顶栏地区选项] 可选数据加载失败',
      error,
    )
  })
})
