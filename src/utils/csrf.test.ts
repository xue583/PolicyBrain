import axios, { type AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CSRF_COOKIE_NAME,
  ensureCsrfToken,
  readCsrfToken,
  resetCsrfToken,
} from './csrf'

const clearCookie = () => {
  document.cookie = `${CSRF_COOKIE_NAME}=; Max-Age=0; path=/`
}

describe('CSRF double-submit token', () => {
  beforeEach(() => {
    resetCsrfToken()
    clearCookie()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetCsrfToken()
    clearCookie()
    vi.restoreAllMocks()
  })

  it('reads the non-HttpOnly cookie without exposing auth tokens', () => {
    vi.spyOn(document, 'cookie', 'get').mockReturnValue(
      `${CSRF_COOKIE_NAME}=abc123`,
    )
    expect(readCsrfToken()).toBe('abc123')
  })

  it('reuses an existing cookie without an HTTP request', async () => {
    vi.spyOn(document, 'cookie', 'get').mockReturnValue(
      `${CSRF_COOKIE_NAME}=existing`,
    )
    const get = vi.spyOn(axios, 'get')
    await expect(ensureCsrfToken()).resolves.toBe('existing')
    expect(get).not.toHaveBeenCalled()
  })

  it('shares one credentialled issuance request across concurrent callers', async () => {
    let release!: (value: AxiosResponse) => void
    const pending = new Promise<AxiosResponse>((resolve) => {
      release = resolve
    })
    const get = vi.spyOn(axios, 'get').mockReturnValue(pending)

    const first = ensureCsrfToken()
    const second = ensureCsrfToken()
    expect(second).toBe(first)
    release({ data: { data: { token: 'server-token' } } } as AxiosResponse)

    await expect(first).resolves.toBe('server-token')
    expect(get).toHaveBeenCalledOnce()
    expect(get).toHaveBeenCalledWith('/auth/csrfTokens', {
      withCredentials: true,
    })
  })

  it('rejects with ApiError on issuance failure and allows a retry', async () => {
    const get = vi
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(new Error('network down'))

    await expect(ensureCsrfToken()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'CSRF令牌获取失败',
    })

    // 失败后 pendingToken 已清空：下一次调用重新发起签发并成功
    get.mockResolvedValueOnce({
      data: { data: { token: 'retry-token' } },
    } as AxiosResponse)
    await expect(ensureCsrfToken()).resolves.toBe('retry-token')
    expect(get).toHaveBeenCalledTimes(2)
  })
})
