<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import {
  quranicOpeningsById,
  type QuranicOpeningId
} from '../data/quranicOpenings'
import { useOrbitClock } from '../composables/useOrbitClock'
import {
  formatClockTime,
  formatTimeZoneLabel
} from '../lib/timezones'

const props = defineProps<{
  gregorianDay: string
  gregorianDate: string
  islamicDate: string
  eventTitle?: string
}>()

const {
  settings,
  activeSequence,
  activeTimezone
} = useOrbitClock()

const now = ref(new Date())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer !== undefined) {
    window.clearInterval(timer)
  }
})

function readPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((item) => item.type === type)?.value || ''
}

const zonedParts = computed(() => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: activeTimezone.value,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).formatToParts(now.value)

  return {
    hour12: Number(readPart(parts, 'hour')) || 12,
    minute: Number(readPart(parts, 'minute')) || 0,
    second: Number(readPart(parts, 'second')) || 0
  }
})

const hourPosition = computed(() =>
  zonedParts.value.hour12 % 12
)

const minutePosition = computed(() =>
  Math.floor(zonedParts.value.minute / 5)
)

const hourOpening = computed(() =>
  quranicOpeningsById.get(
    activeSequence.value[hourPosition.value] ?? 'none'
  )
)

const minuteOpening = computed(() =>
  quranicOpeningsById.get(
    activeSequence.value[minutePosition.value] ?? 'none'
  )
)

const combinationDisplay = computed(() => {
  const hourLabel =
    hourOpening.value?.id === 'none'
      ? ''
      : hourOpening.value?.label || ''
  const minuteLabel =
    minuteOpening.value?.id === 'none'
      ? ''
      : minuteOpening.value?.label || ''

  if (!hourLabel && !minuteLabel) return ''
  if (hourLabel && hourLabel === minuteLabel) return hourLabel

  return `${hourLabel || '—'}\n${minuteLabel || '—'}`
})

const effectiveCenterDisplay = computed(() => {
  if (
    settings.value.centerDisplay === 'letters' &&
    settings.value.mode === 'none'
  ) {
    return '24h' as const
  }

  return settings.value.centerDisplay
})

const centerDisplay = computed(() => {
  if (effectiveCenterDisplay.value === 'letters') {
    return combinationDisplay.value
  }

  return formatClockTime(
    now.value,
    activeTimezone.value,
    effectiveCenterDisplay.value
  )
})

const centerDisplayStyle = computed(() => {
  const length = centerDisplay.value.length
  let size = 2.25

  if (length > 18) size = 1.75
  if (length > 28) size = 1.42
  if (length > 38) size = 1.12

  return {
    '--orbit-center-font-size': `${size}rem`
  }
})

const isSingleCombination = computed(() =>
  effectiveCenterDisplay.value === 'letters' &&
  Boolean(hourOpening.value?.label) &&
  hourOpening.value?.label === minuteOpening.value?.label
)

const minuteAngle = computed(() => {
  const { minute, second } = zonedParts.value
  return minute * 6 + second * 0.1
})

const hourAngle = computed(() => {
  const { hour12, minute } = zonedParts.value
  return (hour12 % 12) * 30 + minute * 0.5
})

const orbitRingStyle = computed(() => ({
  '--orbit-duration': `${settings.value.rotationSeconds}s`
}))

const secondaryTimes = computed(() =>
  settings.value.secondaryTimezones.map((entry) => ({
    ...entry,
    displayLabel:
      entry.label || formatTimeZoneLabel(entry.timezone),
    displayTime: formatClockTime(
      now.value,
      entry.timezone,
      settings.value.secondaryTimeFormat
    )
  }))
)

function positionStyle(index: number) {
  const angleDegrees = index * 30 - 90
  const angleRadians = angleDegrees * Math.PI / 180
  const radius = 42

  return {
    left: `${50 + radius * Math.cos(angleRadians)}%`,
    top: `${50 + radius * Math.sin(angleRadians)}%`
  }
}

function orbitLabel(openingId: string): string {
  const opening = quranicOpeningsById.get(
    openingId as QuranicOpeningId
  )
  if (!opening || opening.id === 'none') return ''

  return settings.value.orbitLabelMode === 'arabic'
    ? opening.arabic
    : opening.label
}
</script>

<template>
  <section class="date-orbit orbit-clock" aria-label="AQRT orbit clock">
    <header class="orbit-date-stack">
      <strong>{{ props.gregorianDay }}</strong>
      <span>{{ props.gregorianDate }}</span>
      <span>{{ props.islamicDate }}</span>
    </header>

    <div class="orbit-dial">
      <div
        class="orbit-rings"
        :class="`orbit-${settings.rotationMode}`"
        :style="orbitRingStyle"
        aria-hidden="true"
      />

      <div
        v-if="settings.mode !== 'none'"
        class="orbit-combinations"
        :class="{
          'orbit-labels-transliteration':
            settings.orbitLabelMode === 'transliteration'
        }"
        aria-hidden="true"
      >
        <span
          v-for="(openingId, index) in activeSequence"
          :key="`${index}-${openingId}`"
          class="orbit-combination-position"
          :style="positionStyle(index)"
          :lang="settings.orbitLabelMode === 'arabic' ? 'ar' : 'en'"
          :dir="settings.orbitLabelMode === 'arabic' ? 'rtl' : 'ltr'"
        >
          {{ orbitLabel(openingId) }}
        </span>
      </div>

      <div class="orbit-clock-hands" aria-hidden="true">
        <span
          class="orbit-hand orbit-hour-hand"
          :style="{ transform: `rotate(${hourAngle}deg)` }"
        />
        <span
          class="orbit-hand orbit-minute-hand"
          :style="{ transform: `rotate(${minuteAngle}deg)` }"
        />
        <span class="orbit-hand-pin" />
      </div>

      <div class="date-core orbit-clock-core">
        <p
          v-if="props.eventTitle"
          class="orbit-event-title"
        >
          {{ props.eventTitle }}
        </p>

        <p
          class="orbit-main-display"
          :class="{
            'orbit-single-combination': isSingleCombination
          }"
          :style="centerDisplayStyle"
        >
          {{ centerDisplay }}
        </p>
      </div>
    </div>

    <div
      v-if="secondaryTimes.length"
      class="orbit-secondary-times"
      aria-label="Additional timezones"
    >
      <div
        v-for="entry in secondaryTimes"
        :key="`${entry.timezone}-${entry.displayLabel}`"
        class="orbit-secondary-time"
      >
        <span>{{ entry.displayLabel }}</span>
        <time>{{ entry.displayTime }}</time>
      </div>
    </div>
  </section>
</template>
