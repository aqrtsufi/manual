import { ref } from 'vue'

const STORAGE_KEY = 'aqrt-selected-time-zone'
const DEFAULT_TIME_ZONE = 'America/New_York'

function initialTimeZone(): string {
  if (typeof window === 'undefined') return DEFAULT_TIME_ZONE
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_TIME_ZONE
}

const selectedTimeZone = ref(initialTimeZone())

export function useTimeZone() {
  function setTimeZone(value: string) {
    const next = value.trim() || DEFAULT_TIME_ZONE
    selectedTimeZone.value = next
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  function useLocalTimeZone() {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }

  function useNewYorkTimeZone() {
    setTimeZone(DEFAULT_TIME_ZONE)
  }

  return {
    selectedTimeZone,
    setTimeZone,
    useLocalTimeZone,
    useNewYorkTimeZone
  }
}
