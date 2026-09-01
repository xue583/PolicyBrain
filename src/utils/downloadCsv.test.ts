import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadCsv } from './downloadCsv'

describe('downloadCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('downloads a utf-8 csv with escaped quotes', () => {
    const click = vi.fn()
    const revoke = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: revoke,
    } as unknown as typeof URL)
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      return { click, href: '', download: '' } as unknown as HTMLAnchorElement
    })

    downloadCsv('名单.csv', [['名称'], ['含"引号"的企业']])

    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:mock')
  })
})
