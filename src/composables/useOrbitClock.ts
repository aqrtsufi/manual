import { computed, ref } from 'vue'
import {
  quranicOpeningsById,
  type QuranicOpeningId
} from '../data/quranicOpenings'

export type OrbitMode = 'none' | 'preset1' | 'preset2' | 'custom'
export type OrbitTimezoneMode = 'new-york' | 'local' | 'other'
export type OrbitRotationMode =
  | 'static'
  | 'clockwise'
  | 'counterclockwise'

export type EditableOrbitSequence =
  | 'preset1'
  | 'preset2'
  | 'custom'

export interface OrbitClockSettings {
  mode: OrbitMode
  timezoneMode: OrbitTimezoneMode
  otherTimezone: string
  rotationMode: OrbitRotationMode
  rotationSeconds: number
  preset1: QuranicOpeningId[]
  preset2: QuranicOpeningId[]
  custom: QuranicOpeningId[]
}

const STORAGE_KEY = 'aqrt-orbit-clock-v1'
const LEGACY_TIMEZONE_KEY = 'aqrt-selected-time-zone'
const NEW_YORK_TIMEZONE = 'America/New_York'
const MIN_ROTATION_SECONDS = 10
const MAX_ROTATION_SECONDS = 180

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
 * Users can also edit them later from Clock settings.
 */

const localTimezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const defaults: OrbitClockSettings = {
  mode: 'preset1',
  timezoneMode: 'new-york',
  otherTimezone: NEW_YORK_TIMEZONE,
  rotationMode: 'clockwise',
  rotationSeconds: 55,
  preset1: emptySequence(),
  preset2: emptySequence(),
  custom: emptySequence()
}

function sanitizeRotationSeconds(value: unknown): number {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return defaults.rotationSeconds
  }

  return Math.min(
    MAX_ROTATION_SECONDS,
    Math.max(MIN_ROTATION_SECONDS, Math.round(numeric))
  )
}

function legacyTimezoneSettings(): Pick<
  OrbitClockSettings,
  'timezoneMode' | 'otherTimezone'
> {
  if (typeof window === 'undefined') {
    return {
      timezoneMode: defaults.timezoneMode,
      otherTimezone: defaults.otherTimezone
    }
  }

  const legacy =
    window.localStorage.getItem(LEGACY_TIMEZONE_KEY)?.trim() || ''

  if (!legacy || legacy === NEW_YORK_TIMEZONE) {
    return {
      timezoneMode: 'new-york',
      otherTimezone: NEW_YORK_TIMEZONE
    }
  }

  if (legacy === localTimezone) {
    return {
      timezoneMode: 'local',
      otherTimezone: legacy
    }
  }

  return {
    timezoneMode: 'other',
    otherTimezone: legacy
  }
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
    const legacyTimezone = legacyTimezoneSettings()

  if (typeof window === 'undefined') {
    return {
      ...structuredClone(defaults),
      ...legacyTimezone
    }
  }

  try {
        const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return {
        ...structuredClone(defaults),
        ...legacyTimezone
      }
    }

    const parsed = JSON.parse(raw) as Partial<OrbitClockSettings>

        const mode: OrbitMode =
      parsed.mode === 'none' ||
      parsed.mode === 'preset2' ||
      parsed.mode === 'custom'
        ? parsed.mode
        : 'preset1'

    const timezoneMode: OrbitTimezoneMode =
      parsed.timezoneMode === 'local' ||
      parsed.timezoneMode === 'other'
        ? parsed.timezoneMode
        : 'new-york'

    const rotationMode: OrbitRotationMode =
      parsed.rotationMode === 'static' ||
      parsed.rotationMode === 'counterclockwise'
        ? parsed.rotationMode
        : 'clockwise'

    return {
      mode,
      timezoneMode,
      otherTimezone:
        typeof parsed.otherTimezone === 'string' &&
        parsed.otherTimezone.trim()
          ? parsed.otherTimezone.trim()
          : NEW_YORK_TIMEZONE,
      rotationMode,
      rotationSeconds: sanitizeRotationSeconds(
        parsed.rotationSeconds
        ),
      preset1: sanitizeSequence(parsed.preset1),
      preset2: sanitizeSequence(parsed.preset2),
      custom: sanitizeSequence(parsed.custom)
    }
  } catch (error) {
    console.warn('Unable to read AQRT orbit-clock settings:', error)
    return {
      ...structuredClone(defaults),
      ...legacyTimezone
    }
  }
}

const settings = ref<OrbitClockSettings>(loadSettings())

function saveSettings() {
    if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings.value)
  )
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
    settings.value.otherTimezone =
    timezone.trim() || NEW_YORK_TIMEZONE
  saveSettings()
}

function setRotationMode(mode: OrbitRotationMode) {
  settings.value.rotationMode = mode
  saveSettings()
}

function setRotationSeconds(seconds: number) {
  settings.value.rotationSeconds =
    sanitizeRotationSeconds(seconds)
  saveSettings()
}

function setSequencePosition(
    sequenceName: EditableOrbitSequence,
  position: number,
  id: QuranicOpeningId
) {
  if (position < 0 || position > 11 || !quranicOpeningsById.has(id)) {
    return
  }

  settings.value[sequenceName][position] = id
    settings.value[sequenceName] = [
    ...settings.value[sequenceName]
  ]
  saveSettings()
}

function resetSequence(sequenceName: EditableOrbitSequence) {



  
  settings.value[sequenceName] = emptySequence()
  saveSettings()
}

const activeSequence = computed<QuranicOpeningId[]>(() => {
    if (settings.value.mode === 'none') {
    return emptySequence()
  }

  return settings.value[settings.value.mode]
})

const activeTimezone = computed(() => {
  switch (settings.value.timezoneMode) {
    case 'local':
      return localTimezone
    case 'other':
            return (
        settings.value.otherTimezone || NEW_YORK_TIMEZONE
      )
    default:
      return NEW_YORK_TIMEZONE
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
        setRotationMode,
    setRotationSeconds,
    setSequencePosition,
    resetSequence
  }
}
