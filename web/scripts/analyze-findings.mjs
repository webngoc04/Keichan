import fs from 'node:fs/promises'
import path from 'node:path'

const results = JSON.parse(await fs.readFile('scripts/deep-scan-results.json', 'utf8'))
const en = JSON.parse(await fs.readFile('src/i18n/locales/en.json', 'utf8'))
const enKeys = new Set(Object.keys(en.translation))

// Group by file
const byFile = new Map()
for (const item of results) {
  if (!byFile.has(item.file)) byFile.set(item.file, [])
  byFile.get(item.file).push(item)
}

console.log(`Found ${byFile.size} files with potential issues:`)
for (const [file, items] of byFile.entries()) {
  console.log(`\n--- ${file} (${items.length} items) ---`)
  for (const it of items) {
    const inEn = enKeys.has(it.text) ? ' [key exists in en.json]' : ' [KEY NOT IN en.json]'
    console.log(`  L${it.line} [${it.type}] "${it.text}"${inEn}`)
  }
}
