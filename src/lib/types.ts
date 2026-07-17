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

export interface QuranVerse {
  id: string
  text: string
  reference: string
  featured?: boolean
}

export interface VideoEntry {
  id: string
  name: string
  url: string
  locale: LocaleCode
}

export type WeeklyKind = 'summary' | 'assignment' | 'contemplation'

export interface WeeklyEntry {
  locale: LocaleCode
  week: string
  kind: WeeklyKind
  raw: string
  html: string
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
