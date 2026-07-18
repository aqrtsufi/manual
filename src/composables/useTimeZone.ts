import { computed } from 'vue'
+import { useOrbitClock } from './useOrbitClock'

const DEFAULT_TIME_ZONE = 'America/New_York'

+const LEGACY_STORAGE_KEY = 'aqrt-selected-time-zone'

export function useTimeZone() {
  +  const {
+    activeTimezone,
+    localTimezone,
+    setTimezoneMode,
+    setOtherTimezone
+  } = useOrbitClock()
+
+  const selectedTimeZone = computed(
+    () => activeTimezone.value
+  )
+
+  function rememberLegacyValue(value: string) {
+    if (typeof window !== 'undefined') {
+      window.localStorage.setItem(
+        LEGACY_STORAGE_KEY,
+        value
+      )
+    }
+  }
+
  function setTimeZone(value: string) {
    const next = value.trim() || DEFAULT_TIME_ZONE
    +
+    if (next === DEFAULT_TIME_ZONE) {
+      setTimezoneMode('new-york')
+    } else if (next === localTimezone) {
+      setTimezoneMode('local')
+    } else {
+      setOtherTimezone(next)
+      setTimezoneMode('other')
+    }
+
+    rememberLegacyValue(next)
  }

  function useLocalTimeZone() {
    +    setTimeZone(localTimezone)

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
