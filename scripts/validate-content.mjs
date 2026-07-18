import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { load as loadYaml } from 'js-yaml'

const root = process.cwd()
const errors = []

const pagesDir = path.join(root, 'content/en/manual/pages')
const pages = fs.readdirSync(pagesDir).filter((name) => /^\d{3}\.txt$/.test(name)).sort()
if (pages.length !== 85) errors.push(`Expected 85 English manual page files; found ${pages.length}.`)
for (const page of pages) {
  const text = fs.readFileSync(path.join(pagesDir, page), 'utf8').trim()
  if (!text) errors.push(`Manual page ${page} is empty.`)
}


const namesFile = path.join(root, 'content/en/names/names.yml')
if (!fs.existsSync(namesFile)) {
  errors.push('Missing content/en/names/names.yml.')
} else {
  const parsed = loadYaml(fs.readFileSync(namesFile, 'utf8'))
  const names = Array.isArray(parsed?.names) ? parsed.names : []
  if (names.length !== 99) errors.push(`Expected 99 divine names; found ${names.length}.`)
  const numbers = new Set()
  for (const entry of names) {
    const number = Number(entry?.number)
    if (!Number.isInteger(number) || number < 1 || number > 99) errors.push(`Invalid divine-name number: ${entry?.number}.`)
    if (numbers.has(number)) errors.push(`Duplicate divine-name number: ${number}.`)
    numbers.add(number)
    if (!String(entry?.arabic || '').trim()) errors.push(`Divine name ${number} has no Arabic text.`)
    if (!String(entry?.transliteration || '').trim()) errors.push(`Divine name ${number} has no transliteration.`)
    if (!String(entry?.meaning || '').trim()) errors.push(`Divine name ${number} has no meaning.`)
    if (!String(entry?.abjad || '').trim()) errors.push(`Divine name ${number} has no Abjad value.`)    
  }
}

for (const locale of ['en', 'fr', 'de', 'es']) {
  const quotesDir = path.join(root, `content/${locale}/quotes`)
  if (!fs.existsSync(quotesDir)) continue

  for (const file of fs.readdirSync(quotesDir).filter((name) => name.endsWith('.txt'))) {
    const raw = fs.readFileSync(path.join(quotesDir, file), 'utf8').replace(/\r\n?/g, '\n').trim()
    if (!raw) {
      errors.push(`${locale}/${file}: quote file is empty.`)
      continue
    }

    const lines = raw.split('\n')
    const authorLine = lines.findIndex((line) => line.trim() && !line.trim().startsWith('#'))
    if (authorLine < 0) {
      errors.push(`${locale}/${file}: missing author on the first non-empty line.`)
      continue
    }

    const author = lines[authorLine].trim()
    const body = lines.slice(authorLine + 1).join('\n').trim()
    const quotes = body.split(/\n\s*\n+/).map((value) => value.trim()).filter(Boolean)

    if (!author) errors.push(`${locale}/${file}: author is blank.`)
    if (!quotes.length) errors.push(`${locale}/${file}: no quote blocks found after the author.`)
  }
}


for (const locale of ['en', 'fr', 'de', 'es']) {
  const quranDir = path.join(root, `content/${locale}/quran`)
  if (fs.existsSync(quranDir)) {
    const verseFile = path.join(quranDir, 'verse.yml')
  
    if (!fs.existsSync(verseFile)) {
      errors.push(`${locale}: missing content/${locale}/quran/verse.yml.`)
    } else {
      const data = loadYaml(fs.readFileSync(verseFile, 'utf8'))
      const translator = String(data?.translator || '').trim()
      const verses = Array.isArray(data?.verses) ? data.verses : []
  
      if (!translator) errors.push(`${locale}/verse.yml: translator is missing.`)
      if (!verses.length) errors.push(`${locale}/verse.yml: no Quran verses found.`)
  
      const ids = new Set()
  
      for (const entry of verses) {
        const id = String(entry?.id || '').trim()
        if (!id) errors.push(`${locale}/verse.yml: a Quran entry has no id.`)
        if (ids.has(id)) errors.push(`${locale}/verse.yml: duplicate Quran id ${id}.`)
        ids.add(id)
  
        if (!String(entry?.sura || '').trim()) errors.push(`${locale}/verse.yml: ${id || '(no id)'} has no sura name.`)
        if (!String(entry?.verse || '').trim()) errors.push(`${locale}/verse.yml: ${id || '(no id)'} has no verse number.`)
        if (!String(entry?.text || '').trim()) errors.push(`${locale}/verse.yml: ${id || '(no id)'} has no text.`)
      }
    }
  }


  const videoDir = path.join(root, `content/${locale}/videos`)
  if (!fs.existsSync(videoDir)) continue
  for (const file of fs.readdirSync(videoDir).filter((name) => name.endsWith('.txt'))) {
    const lines = fs.readFileSync(path.join(videoDir, file), 'utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      const value = line.trim()
      if (!value || value.startsWith('#')) return
      const parts = value.split('|')
      if (parts.length < 2) {
        errors.push(`${locale}/${file}:${index + 1}: expected Name | URL.`)
        return
      }
      const url = parts.slice(1).join('|').trim()
      if (!/youtu(?:\.be|be\.com)/i.test(url)) errors.push(`${locale}/${file}:${index + 1}: URL is not a YouTube link.`)
      if (!/[?&](?:start|t)=/i.test(url)) errors.push(`${locale}/${file}:${index + 1}: YouTube link has no start time.`)
      if (!/[?&]end=/i.test(url)) errors.push(`${locale}/${file}:${index + 1}: YouTube link has no end time.`)
    })
  }
}

const weeklyDir = path.join(root, 'content/en/weekly')
if (fs.existsSync(weeklyDir)) {
  for (const file of fs.readdirSync(weeklyDir).filter((name) => name.endsWith('.yml'))) {
    const data = loadYaml(fs.readFileSync(path.join(weeklyDir, file), 'utf8'))
    const expectedWeek = file.replace(/\.yml$/, '')

    if (String(data?.week || '') !== expectedWeek) {
      errors.push(`${file}: week must match the filename (${expectedWeek}).`)
    }

    if (!String(data?.starts || '').trim()) errors.push(`${file}: starts is missing.`)
    if (!String(data?.title || '').trim()) errors.push(`${file}: title is missing.`)

    for (const field of ['reading', 'contemplation', 'assignment']) {
      if (!String(data?.[field] || '').trim()) errors.push(`${file}: ${field} is empty.`)
    }
  }
}



if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exit(1)
}
console.log(`Validated ${pages.length} manual pages, 99 divine names, and editable content files.`)
