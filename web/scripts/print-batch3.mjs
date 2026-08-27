import fs from 'node:fs/promises'

const results = JSON.parse(await fs.readFile('scripts/deep-scan-results.json', 'utf8'))
const en = JSON.parse(await fs.readFile('src/i18n/locales/en.json', 'utf8'))
const enKeys = new Set(Object.keys(en.translation))

const nonUiPatterns = [
  /^(GET|POST|PUT|DELETE|Bearer|Authorization)$/,
  /^(http|\/api|\/v1)/,
  /^x$/,
]

const realIssues = results.filter(r => {
  if (nonUiPatterns.some(p => p.test(r.text))) return false
  return true
})

const grouped = {}
for (const item of realIssues) {
  grouped[item.file] = grouped[item.file] || []
  grouped[item.file].push(item)
}

const fileNames = Object.keys(grouped)
console.log(`Total files with issues: ${fileNames.length}`)
for (let i = 60; i < fileNames.length; i++) {
  const file = fileNames[i]
  console.log(`\n### [${i + 1}] ${file}`)
  for (const it of grouped[file]) {
    console.log(`  - Line ${it.line} [${it.type}]: "${it.text}" (in en.json: ${enKeys.has(it.text)})`)
  }
}
