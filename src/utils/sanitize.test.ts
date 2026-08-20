import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('strips script tags from untrusted html', () => {
    const dirty =
      '<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)">'
    const clean = sanitizeHtml(dirty)
    expect(clean).toContain('<p>ok</p>')
    expect(clean.toLowerCase()).not.toContain('script')
    expect(clean.toLowerCase()).not.toContain('onerror')
  })
})
