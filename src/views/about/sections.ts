import { aboutHtml } from './html'

export type AboutSection = {
  key: keyof typeof aboutHtml
  label: string
  html: string
}

export const aboutSections: AboutSection[] = [
  { key: 'about', label: '关于我们', html: aboutHtml.about },
  { key: 'agreement', label: '用户协议', html: aboutHtml.agreement },
  { key: 'privacy', label: '隐私权政策', html: aboutHtml.privacy },
  { key: 'member', label: '会员服务协议', html: aboutHtml.member },
  { key: 'complaint', label: '投诉建议', html: aboutHtml.complaint },
  { key: 'disclaimer', label: '免责声明', html: aboutHtml.disclaimer },
  { key: 'ip', label: '知识产权', html: aboutHtml.ip },
  { key: 'library', label: '文库服务协议', html: aboutHtml.library },
]

export const aboutPath = (key: string) =>
  key === 'about' ? '/about' : `/about/${key}`

export const findAboutSection = (key?: string) =>
  aboutSections.find((item) => item.key === key) ?? aboutSections[0]!
