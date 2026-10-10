import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import IconFont from './IconFont.vue'

const STYLE_HREF = 'https://at.alicdn.com/t/c/font_5222789_ybgcryd314.css'

describe('IconFont', () => {
  it('renders the iconfont class and loads the stylesheet once', () => {
    const wrapper = mount(IconFont, {
      props: { name: 'dianzan', size: 20, color: '#f00' },
    })
    const icon = wrapper.get('i')

    expect(icon.classes()).toEqual(
      expect.arrayContaining(['iconfont', 'pb-icon', 'icon-dianzan']),
    )
    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.attributes('style')).toContain('font-size: 20px')
    expect(icon.attributes('style')).toContain('color: rgb(255, 0, 0)')

    const links = document.querySelectorAll('#pb-iconfont-stylesheet')
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('href')).toBe(STYLE_HREF)

    mount(IconFont, { props: { name: 'shuhongqi' } })
    expect(document.querySelectorAll('#pb-iconfont-stylesheet')).toHaveLength(1)
  })

  it('keeps an icon- prefix and accepts a string size', () => {
    const wrapper = mount(IconFont, {
      props: { name: 'icon-huangqi', size: '1.5em' },
    })
    const icon = wrapper.get('i')

    expect(icon.classes().filter((name) => name.startsWith('icon-'))).toEqual([
      'icon-huangqi',
    ])
    expect(icon.attributes('style')).toContain('font-size: 1.5em')
  })
})
