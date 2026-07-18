import { computed, ref } from 'vue'
import {
  quranicOpeningsById,
  type QuranicOpeningId
} from '../data/quranicOpenings'

export type OrbitMode = 'preset1' | 'preset2' | 'custom'
export type OrbitTimezoneMode = 'new-york' | 'local' | 'other'

export interface OrbitClockSettings {
  mode: OrbitMode
  timezoneMode: OrbitTimezoneMode
  otherTimezone: string
  preset1: QuranicOpeningId[]
  preset2: QuranicOpeningId[]
  custom: QuranicOpeningId[]
}

const STORAGE_KEY = 'aqrt-orbit-clock-v1'

const emptySequence = (): QuranicOpeningId[] =>
  Array.from({ length: 12 }, () => 'none' as const)

/*
 * Position order:
 * index 0  = 12 o'clock
 * index 1  = 1 o'clock
 * index 2  = 2 o'clock
 * ...
 * index 11 = 11 o'clock
 *
 * Leave these as "none" until the two preferred sets are chosen.
 * Users can also edit them later from Clock settings.
 */
const defaults: OrbitClockSettings = {
  mode: 'preset1',
  timezoneMode: 'new-york',
  otherTimezone: 'America/New_York',
  preset1: emptySequence(),
  preset2: emptySequence(),
  custom: emptySequence()
}

function sanitizeSequence(value: unknown): QuranicOpeningId[] {
  if (!Array.isArray(value)) {
    return emptySequence()
  }

  return Array.from({ length: 12 }, (_, index) => {
    const id = String(value[index] ?? 'none') as QuranicOpeningId
    return quranicOpeningsById.has(id) ? id : 'none'
  })
}

function loadSettings(): OrbitClockSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return structuredClone(defaults)
    }

    const parsed = JSON.parse(raw) as Partial<OrbitClockSettings>

    return {
      mode:
        parsed.mode === 'preset2' || parsed.mode === 'custom'
          ? parsed.mode
          : 'preset1',
      timezoneMode:
        parsed.timezoneMode === 'local' || parsed.timezoneMode === 'other'
          ? parsed.timezoneMode
          : 'new-york',
      otherTimezone:
        typeof parsed.otherTimezone === 'string' && parsed.otherTimezone
          ? parsed.otherTimezone
          : 'America/New_York',
      preset1: sanitizeSequence(parsed.preset1),
      preset2: sanitizeSequence(parsed.preset2),
      custom: sanitizeSequence(parsed.custom)
    }
  } catch (error) {
    console.warn('Unable to read AQRT orbit-clock settings:', error)
    return structuredClone(defaults)
  }
}

const settings = ref<OrbitClockSettings>(loadSettings())

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
}

function setMode(mode: OrbitMode) {
  settings.value.mode = mode
  saveSettings()
}

function setTimezoneMode(mode: OrbitTimezoneMode) {
  settings.value.timezoneMode = mode
  saveSettings()
}

function setOtherTimezone(timezone: string) {
  settings.value.otherTimezone = timezone
  saveSettings()
}

function setSequencePosition(
  sequenceName: 'preset1' | 'preset2' | 'custom',
  position: number,
  id: QuranicOpeningId
) {
  if (position < 0 || position > 11 || !quranicOpeningsById.has(id)) {
    return
  }

  settings.value[sequenceName][position] = id
  settings.value[sequenceName] = [...settings.value[sequenceName]]
  saveSettings()
}

function resetSequence(sequenceName: 'preset1' | 'preset2' | 'custom') {
  settings.value[sequenceName] = emptySequence()
  saveSettings()
}

const activeSequence = computed<QuranicOpeningId[]>(() => {
  return settings.value[settings.value.mode]
})

const localTimezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const activeTimezone = computed(() => {
  switch (settings.value.timezoneMode) {
    case 'local':
      return localTimezone
    case 'other':
      return settings.value.otherTimezone || 'America/New_York'
    default:
      return 'America/New_York'
  }
})

const timezoneLabel = computed(() => {
  switch (settings.value.timezoneMode) {
    case 'local':
      return `Local time · ${localTimezone}`
    case 'other':
      return settings.value.otherTimezone
    default:
      return 'New York'
  }
})

export function useOrbitClock() {
  return {
    settings,
    activeSequence,
    activeTimezone,
    timezoneLabel,
    localTimezone,
    setMode,
    setTimezoneMode,
    setOtherTimezone,
    setSequencePosition,
    resetSequence
  }
}
