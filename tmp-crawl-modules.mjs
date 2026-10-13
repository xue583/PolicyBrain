const start = [
  '/src/main.ts',
  '/src/App.vue',
  '/src/views/home/index.vue',
  '/src/components/AppHeader.vue',
  '/src/components/SubPageLayout.vue',
  '/src/router/index.ts',
]
const seen = new Set()
const queue = [...start]
const hits = []
while (queue.length && seen.size < 250) {
  const url = queue.shift()
  if (!url || seen.has(url)) continue
  seen.add(url)
  const res = await fetch('http://localhost:8001' + url)
  const text = await res.text()
  if (text.toLowerCase().includes('layout')) {
    const lines = text
      .split('\n')
      .filter((line) => /layout/i.test(line))
      .slice(0, 6)
    hits.push({ url, status: res.status, lines })
  }
  const imports = [
    ...text.matchAll(/from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]/g),
  ].map((match) => match[1] || match[2])
  for (const imp of imports) {
    if (imp.startsWith('/src/')) {
      const clean = imp.split('?')[0]
      if (!seen.has(clean)) queue.push(clean)
    }
  }
}
console.log('scanned', seen.size)
for (const hit of hits) {
  console.log('HIT', hit.status, hit.url)
  for (const line of hit.lines) console.log(' ', line.slice(0, 240))
}
