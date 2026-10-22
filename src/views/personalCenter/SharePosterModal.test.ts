import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SharePosterModal from './SharePosterModal.vue'

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/api/account', () => ({
  fetchShareLink: vi.fn(),
}))

const { fetchShareLink } = await import('@/api/account')
const { message } = await import('ant-design-vue')

const inviteUrl = 'http://localhost:8001/?invite=AB12'

const mountModal = (open = true) =>
  mount(SharePosterModal, {
    attachTo: document.body,
    props: { open },
    global: {
      stubs: {
        Teleport: { template: '<div><slot /></div>' },
      },
    },
  })

describe('SharePosterModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchShareLink).mockResolvedValue({ inviteUrl })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the invite poster copy', async () => {
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.text()).toContain('最新福利来袭')
    expect(wrapper.text()).toContain('邀请好友领会员！')
    expect(wrapper.text()).toContain('一个月VIP时长')
    expect(wrapper.text()).toContain('立即领取会员')
    expect(wrapper.text()).toContain('保存海报')
    expect(wrapper.get('.share-poster-bg').attributes('src')).toBeTruthy()
    wrapper.unmount()
  })

  it('shows the share link and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const wrapper = mountModal()
    await flushPromises()
    expect(fetchShareLink).toHaveBeenCalled()
    expect(wrapper.get('.share-poster-cta').attributes('href')).toBe(inviteUrl)
    expect(wrapper.get('.share-poster-url').attributes('href')).toBe(inviteUrl)
    expect(wrapper.get('.share-poster-url').text()).toBe(inviteUrl)
    await wrapper.get('.share-poster-copy').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(inviteUrl)
    expect(message.success).toHaveBeenCalledWith('邀请链接已复制')
    wrapper.unmount()
  })

  it('does not turn an unsafe invite value into a link', async () => {
    vi.mocked(fetchShareLink).mockResolvedValue({
      inviteUrl: 'javascript:alert(1)',
    })
    const wrapper = mountModal()
    await flushPromises()
    expect(wrapper.find('.share-poster-cta').exists()).toBe(false)
    expect(
      wrapper.get('.share-poster-save').attributes('disabled'),
    ).toBeDefined()
    expect(wrapper.text()).toContain('邀请链接无效')
    wrapper.unmount()
  })

  it('saves a poster page whose button opens the invite link', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(new Uint8Array([137, 80, 78, 71]), {
            status: 200,
            headers: { 'Content-Type': 'image/png' },
          }),
      ),
    )
    const blobs: Blob[] = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      blobs.push(blob as Blob)
      return 'blob:poster'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const wrapper = mountModal()
    await flushPromises()
    await wrapper.get('.share-poster-save').trigger('click')
    await flushPromises()

    expect(blobs).toHaveLength(1)
    expect(blobs[0].type).toContain('text/html')
    const html = await blobs[0].text()
    expect(html).toContain(`href="${inviteUrl}"`)
    expect(html).toContain('立即领取会员')
    expect(html).toContain('data:image/png;base64,')
    expect(html.match(/href="/g)).toHaveLength(2)
    expect(message.success).toHaveBeenCalledWith(
      '海报已保存，用浏览器打开后点击按钮即可访问链接',
    )
    wrapper.unmount()
  })

  it('closes from the close button', async () => {
    const wrapper = mountModal()
    await wrapper.get('.share-poster-close').trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})
