export type LocaleCode = 'en' | 'fr' | 'de' | 'es'

export interface ManualTocEntry {
  id: string
  title: string
  page: number
  displayPage: string
}

export interface ManualPage {
  locale: LocaleCode
  page: number
  text: string
  title: string
}


export interface DivineName {
  number: number
  arabic: string
  transliteration: string
  meaning: string
  abjad: string
}

export interface DivineNamesCollection {
  source: string
  sourceUrl: string
  names: DivineName[]
}

export type GlossaryCategory = 'asma' | 'desc' | 'general'

export interface GlossaryEntry {
  id: string
  locale: LocaleCode
  category: GlossaryCategory
  sort: string
  term: string
  description: string
}

export interface QuoteEntry {
  id: string
  locale: LocaleCode
  author: string
  text: string
  sourceFile: string
}

export interface QuranVerse {
  id: string
  text: string
  sura: string
  verse: string
  featured?: boolean
}

export interface QuranVerseFile {
  translator: string
  verses: QuranVerse[]
}


export interface VideoEntry {
  id: string
  name: string
  url: string
  locale: LocaleCode
}

export type WeeklyKind = 'reading' | 'contemplation' | 'assignment'

export interface WeeklySection {
  raw: string
  html: string
}

export interface WeeklyEntry {
  locale: LocaleCode
  week: string
  starts: string
  title: string
  published: boolean
  sections: Record<WeeklyKind, WeeklySection>
}

export interface WeeklyFile {
  week: string
  starts: string
  title: string
  published?: boolean
  reading: string
  contemplation: string
  assignment: string
}


export interface ActivityEntry {
  week: string
  title: string
  url: string
}

export interface CalendarEvent {
  id: string
  title: string
  calendar: 'gregorian' | 'diyanet'
  date?: string
  start?: string
  startTime?: string
  timezone?: string
  hijriDay?: number
  hijriMonth?: string
  url?: string
}

export interface DiyanetCalendar {
  source: string
  sourceUrl: string
  updatedAt: string
  dates: Record<string, string>
}

export interface SearchDocument {
  id: string
  title: string
  body: string
  type: string
  route: string
  meta?: string
}

export interface TeacherContent {
  id: string
  title: string
  slug: string
  body: string
  category: string | null
  sort_order: number
  published_at: string | null
}
