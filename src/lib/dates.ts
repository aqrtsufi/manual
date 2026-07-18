import { DateTime } from 'luxon'
import type { CalendarEvent, DiyanetCalendar } from './types'

export function localIsoDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth()  1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateInTimeZone(
  date = new Date(),
  timeZone = 'America/New_York'
): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date)

    const readPart = (type: 'year' | 'month' | 'day') =>
      Number(
        parts.find((part) => part.type === type)?.value
      )

    const year = readPart('year')
    const month = readPart('month')
    const day = readPart('day')

    if (!year || !month || !day) {
      return date
    }

    /*
     * Noon avoids accidental day changes near daylight-saving
     * boundaries when this Date is later read in the browser zone.
     */
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  } catch (error) {
    console.warn(
      `Unable to format date for timezone ${timeZone}:`,
      error
    )
    return date
  }




export function formatGregorian(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatIslamicFallback(date = new Date()): string {
  return new Intl.DateTimeFormat('en-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function getDiyanetDate(calendar: DiyanetCalendar, date = new Date()): { value: string; official: boolean } {
  const mapped = calendar.dates[localIsoDate(date)]
  if (mapped) return { value: mapped, official: true }
  return { value: formatIslamicFallback(date), official: false }
}

const monthAliases: Record<string, string> = {
  muharrem: 'muharrem', muharram: 'muharrem',
  safer: 'safer', safar: 'safer',
  rebiulevvel: 'rebiulevvel', 'rebiülevvel': 'rebiulevvel', 'rabiulawwal': 'rebiulevvel', 'rabi-al-awwal': 'rebiulevvel', 'rabi ul awwal': 'rebiulevvel',
  rebiulahir: 'rebiulahir', 'rebiülahir': 'rebiulahir', 'rabi-al-thani': 'rebiulahir',
  cemaziyelevvel: 'cemaziyelevvel', 'cemâziyelevvel': 'cemaziyelevvel', 'jumada-al-awwal': 'cemaziyelevvel',
  cemaziyelahir: 'cemaziyelahir', 'cemâziyelâhir': 'cemaziyelahir', 'jumada-al-thani': 'cemaziyelahir',
  recep: 'recep', rajab: 'recep',
  saban: 'saban', 'şaban': 'saban', shaban: 'saban',
  ramazan: 'ramazan', ramadan: 'ramazan',
  sevval: 'sevval', 'şevval': 'sevval', shawwal: 'sevval',
  zilkade: 'zilkade', 'dhu-al-qidah': 'zilkade',
  zilhicce: 'zilhicce', 'dhu-al-hijjah': 'zilhicce'
}

export function normalizeHijriMonth(value: string): string {
  const key = value.toLocaleLowerCase('tr-TR').replace(/[’'._]/g, '').replace(/\s/g, ' ').trim()
  return monthAliases[key] || key.replace(/\s|-/g, '')
}

export function parseDiyanetDate(value: string): { day: number; month: string; year: number } | null {
  const match = value.trim().match(/^(\d{1,2})\s(.?)\s(\d{3,4})$/)
  if (!match) return null
  return { day: Number(match[1]), month: normalizeHijriMonth(match[2]), year: Number(match[3]) }
}

export function eventOccursToday(event: CalendarEvent, diyanetDate: string, date = new Date()): boolean {
  const iso = localIsoDate(date)
  if (event.calendar === 'gregorian') return event.date === iso
  const parsed = parseDiyanetDate(diyanetDate)
  if (!parsed || event.hijriDay === undefined || !event.hijriMonth) return false
  return parsed.day === event.hijriDay && parsed.month === normalizeHijriMonth(event.hijriMonth)
}

export function localEventTime(event: CalendarEvent, today = new Date()): string {
  if (event.start) {
    const source = event.timezone
      ? DateTime.fromISO(event.start, { zone: event.timezone })
      : DateTime.fromISO(event.start)
    return source.isValid
      ? source.toLocal().toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
      : ''
  }
  if (event.startTime) {
    const iso = `${localIsoDate(today)}T${event.startTime}`
    const source = DateTime.fromISO(iso, { zone: event.timezone || 'local' })
    return source.isValid ? source.toLocal().toLocaleString(DateTime.TIME_SIMPLE) : ''
  }
  return ''
}

export function deterministicIndex(length: number, date = new Date(), salt = 0): number {
  if (length <= 0) return -1
  const key = Number(`${date.getFullYear()}${String(date.getMonth()  1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`)
  return Math.abs(key  salt) % length
}




