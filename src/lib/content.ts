import { load as loadYaml } from 'js-yaml'
import diyanetJson from '../../content/calendar/diyanet-calendar.json'
import { renderMarkdown } from './markdown'
import type {
  ActivityEntry,
  CalendarEvent,
  DiyanetCalendar,
  DivineName,
  DivineNamesCollection,
  GlossaryEntry,
  LocaleCode,
  ManualPage,
  ManualTocEntry,
  QuoteEntry,
  QuranVerseFile,
  QuranVerse,
  VideoEntry,
  WeeklyEntry,
  WeeklyKind
} from './types'

const manualPageModules = import.meta.glob('../../content/*/manual/pages/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const tocModules = import.meta.glob('../../content/*/manual/toc.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const quoteModules = import.meta.glob('../../content/*/quotes/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const nameModules = import.meta.glob('../../content/*/names/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const glossaryModules = import.meta.glob('../../content/*/glossary/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const quranModules = import.meta.glob('../../content/*/quran/verse.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const videoModules = import.meta.glob('../../content/*/videos/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const weeklyModules = import.meta.glob('../../content/*/weekly/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const activityModules = import.meta.glob('../../content/*/activities/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

const eventModules = import.meta.glob('../../content/events/*.yml', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

function localeFromPath(path: string): LocaleCode {
  const match = path.match(/content\/(en|fr|de|es)\//)
  return (match?.[1] || 'en') as LocaleCode
}

function parseYamlArray<T>(raw: string): T[] {
  const text = raw
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
    .trim()

  if (!text || text === '---' || text === '...') {
    return []
  }

  try {
    const value = loadYaml(text)
    return Array.isArray(value) ? value as T[] : []
  } catch (error) {
    console.error('Invalid YAML content:', error)
    return []
  }
}

export const tocByLocale = new Map<LocaleCode, ManualTocEntry[]>()
for (const [path, raw] of Object.entries(tocModules)) {
  tocByLocale.set(localeFromPath(path), parseYamlArray<ManualTocEntry>(raw))
}

function sectionTitleForPage(locale: LocaleCode, page: number): string {
  const entries = tocByLocale.get(locale) || []
  const distinctStarts = [...new Set(entries.map((entry) => entry.page))].sort((a, b) => a - b)
  const start = [...distinctStarts].reverse().find((value) => value <= page)
  if (start === undefined) return 'AQRT Manual'
  return entries.filter((entry) => entry.page === start).map((entry) => entry.title).join(' / ')
}

export const manualPages: ManualPage[] = Object.entries(manualPageModules)
  .map(([path, text]) => {
    const pageMatch = path.match(/(\d{3})\.txt$/)
    const locale = localeFromPath(path)
    const page = Number(pageMatch?.[1] || 0)
    return { locale, page, text, title: sectionTitleForPage(locale, page) }
  })
  .filter((page) => page.page > 0)
  .sort((a, b) => a.locale.localeCompare(b.locale) || a.page - b.page)

function quoteSourceFile(path: string): string {
  return path.split('/').pop()?.replace(/\.txt$/i, '') || 'quotes'
}

function parseQuoteFile(path: string, raw: string): QuoteEntry[] {
  const locale = localeFromPath(path)
  const normalized = raw.replace(/\r\n?/g, '\n').trim()
  if (!normalized) return []

  const lines = normalized.split('\n')
  const authorLine = lines.findIndex((line) => {
    const value = line.trim()
    return Boolean(value) && !value.startsWith('#')
  })

  if (authorLine < 0) return []

  const author = lines[authorLine].trim()
  const sourceFile = quoteSourceFile(path)
  const body = lines.slice(authorLine + 1).join('\n').trim()
  if (!body) return []

  return body
    .split(/\n\s*\n+/)
    .map((block) => block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
      .trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `${locale}-${sourceFile}-${index + 1}`,
      locale,
      author,
      text,
      sourceFile
    }))
}

export const quotesByLocale = new Map<LocaleCode, QuoteEntry[]>()

for (const [path, raw] of Object.entries(quoteModules)) {
  const locale = localeFromPath(path)
  const list = quotesByLocale.get(locale) || []
  list.push(...parseQuoteFile(path, raw))
  quotesByLocale.set(locale, list)
}

for (const list of quotesByLocale.values()) {
  list.sort((a, b) => a.id.localeCompare(b.id))
}


export const divineNamesByLocale = new Map<LocaleCode, DivineName[]>()
export const divineNamesSourceByLocale = new Map<LocaleCode, Pick<DivineNamesCollection, 'source' | 'sourceUrl'>>()
for (const [path, raw] of Object.entries(nameModules)) {
  const locale = localeFromPath(path)
  const parsed = loadYaml(raw) as Partial<DivineNamesCollection> | undefined
  const names = Array.isArray(parsed?.names) ? parsed.names : []
  divineNamesByLocale.set(locale, names)
  divineNamesSourceByLocale.set(locale, {
    source: String(parsed?.source || ''),
    sourceUrl: String(parsed?.sourceUrl || '')
  })
}

export const glossaryEntries: GlossaryEntry[] = []

for (const [path, raw] of Object.entries(glossaryModules)) {
  const locale = localeFromPath(path)
  const entries = parseYamlArray<Omit<GlossaryEntry, 'locale'>>(raw)

  glossaryEntries.push(
    ...entries.map((entry) => ({
      ...entry,
      locale
    }))
  )
}

glossaryEntries.sort((a, b) =>
  a.category.localeCompare(b.category) ||
  a.sort.localeCompare(b.sort)
)

export const quranByLocale = new Map<LocaleCode, QuranVerse[]>()
export const quranTranslatorByLocale = new Map<LocaleCode, string>()

for (const [path, raw] of Object.entries(quranModules)) {
  const locale = localeFromPath(path)
  const parsed = loadYaml(raw) as Partial<QuranVerseFile> | undefined
  const verses = Array.isArray(parsed?.verses)
    ? parsed.verses.filter((entry) => entry.featured !== false)
    : []

  quranByLocale.set(locale, verses)
  quranTranslatorByLocale.set(locale, String(parsed?.translator || '').trim())
}


export const videos: VideoEntry[] = []
for (const [path, raw] of Object.entries(videoModules)) {
  const locale = localeFromPath(path)
  raw.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const separator = trimmed.indexOf('|')
    if (separator < 0) return
    const name = trimmed.slice(0, separator).trim()
    const url = trimmed.slice(separator + 1).trim()
    if (!name || !url) return
    videos.push({ id: `${locale}-${path}-${index}`, name, url, locale })
  })
}

export const weeklyEntries: WeeklyEntry[] = []
for (const [path, raw] of Object.entries(weeklyModules)) {
  const match = path.match(/content\/(en|fr|de|es)\/weekly\/(\d{4}-W\d{2})-(summary|assignment|contemplation)\.md$/)
  if (!match) continue
  weeklyEntries.push({
    locale: match[1] as LocaleCode,
    week: match[2],
    kind: match[3] as WeeklyKind,
    raw,
    html: renderMarkdown(raw)
  })
}
weeklyEntries.sort((a, b) => b.week.localeCompare(a.week))

export const activities: ActivityEntry[] = []
for (const raw of Object.values(activityModules)) {
  activities.push(...parseYamlArray<ActivityEntry>(raw))
}
activities.sort((a, b) => b.week.localeCompare(a.week) || a.title.localeCompare(b.title))

export const events: CalendarEvent[] = []
for (const raw of Object.values(eventModules)) {
  events.push(...parseYamlArray<CalendarEvent>(raw))
}

export const diyanetCalendar = diyanetJson as DiyanetCalendar

export function availableLocales(): LocaleCode[] {
  const result: LocaleCode[] = []
  for (const locale of ['en', 'fr', 'de', 'es'] as LocaleCode[]) {
    if (manualPages.some((page) => page.locale === locale) ||
        (quotesByLocale.get(locale)?.length || 0) > 0 ||
        (quranByLocale.get(locale)?.length || 0) > 0 ||
        weeklyEntries.some((entry) => entry.locale === locale)) {
      result.push(locale)
    }
  }
  return result
}
