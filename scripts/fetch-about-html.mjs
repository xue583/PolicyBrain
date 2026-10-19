import { writeFileSync } from 'node:fs'

const res = await fetch('http://121.37.110.189:10002/api/index/about')
if (!res.ok) throw new Error(`about api ${res.status}`)
const payload = await res.json()
const data = payload.data
const byName = Object.fromEntries(
  data.list.map((item) => [item.name, item.content]),
)

const normalize = (html) =>
  html
    .replace(/https?:\/(?!\/)/g, (token) => token.replace(':/', '://'))
    .replace(/href="\s+/g, 'href="')

const aboutHtml = {
  about: normalize(data.synopsis),
  agreement: normalize(data.xieyi),
  privacy: normalize(data.zhengce),
  member: normalize(data.member),
  complaint: normalize(byName['投诉建议']),
  disclaimer: normalize(byName['免责声明']),
  ip: normalize(byName['知识产权']),
  library: normalize(byName['文库服务协议']),
}

for (const [key, html] of Object.entries(aboutHtml)) {
  if (!html) throw new Error(`missing html: ${key}`)
}

const body = `/* 内容来自政策大脑关于我们页，生成后请勿手改排版 */\nexport const aboutHtml = ${JSON.stringify(aboutHtml, null, 2)} as const\n`
writeFileSync(new URL('../src/views/about/html.ts', import.meta.url), body)
console.log(
  Object.entries(aboutHtml)
    .map(([key, html]) => `${key}:${html.length}`)
    .join('\n'),
)
