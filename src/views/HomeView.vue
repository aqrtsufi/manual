<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useLocale } from '../composables/useLocale'
import {
  diyanetCalendar,
  events,
  quranByLocale,
  quranTranslatorByLocale,
  quotesByLocale
} from '../lib/content'
import { eventOccursToday, formatGregorian, getDiyanetDate, localEventTime } from '../lib/dates'
import { dailyCycleIndex } from '../lib/daily'
import { useTimeZone } from '../composables/useTimeZone'
import OrbitClock from '../components/OrbitClock.vue'

  
const { activeLocale } = useLocale()
const { selectedTimeZone } = useTimeZone()
const now = ref(new Date())
const timer = window.setInterval(() => { now.value = new Date() }, 60_000)
onBeforeUnmount(() => window.clearInterval(timer))

const quote = computed(() => {
  const list = quotesByLocale.get(activeLocale.value) || []
  const index = dailyCycleIndex(
    list.length,
    now.value,
    selectedTimeZone.value,
    `quote:${activeLocale.value}`
  )

  return index >= 0 ? list[index] : null
})

const verse = computed(() => {
  const list = quranByLocale.get(activeLocale.value) || []
  const index = dailyCycleIndex(
    list.length,
    now.value,
    selectedTimeZone.value,
    `quran:${activeLocale.value}`
  )

  return index >= 0 ? list[index] : null
})

const quranTranslator = computed(() =>
  quranTranslatorByLocale.get(activeLocale.value) ||
  quranTranslatorByLocale.get('en') ||
  ''
)


const gregorian = computed(() => formatGregorian(now.value))
const diyanet = computed(() => getDiyanetDate(diyanetCalendar, now.value))
const todayEvents = computed(() => events
  .filter((entry) => eventOccursToday(entry, diyanet.value.value, now.value))
  .map((entry) => ({ ...entry, localTime: localEventTime(entry, now.value) })))
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
</script>

<template>
  <div class="home-page">
    <OrbitClock />

    <section v-if="quote" class="illuminated-panel quote-panel">
      <span class="panel-number">01</span>
      <blockquote>{{ quote.text }}</blockquote>
      <cite class="quote-author">{{ quote.author }}</cite>
    </section>

    <section v-if="verse" class="illuminated-panel verse-panel">
      <span class="panel-number">02</span>
      <blockquote>{{ verse.text }}</blockquote>
      <cite class="verse-source">
        <strong>{{ verse.sura }}:{{ verse.verse }}</strong>
        <span v-if="quranTranslator">Translated by {{ quranTranslator }}</span>
      </cite>
    </section>

    <section v-if="todayEvents.length" class="event-band">
      <header>
        <span>Events</span>
        <small>{{ localZone }}</small>
      </header>
      <a
        v-for="event in todayEvents"
        :key="event.id"
        class="event-entry"
        :href="event.url || undefined"
        :target="event.url ? '_blank' : undefined"
        :rel="event.url ? 'noreferrer' : undefined"
      >
        <strong>{{ event.title }}</strong>
        <span v-if="event.localTime">{{ event.localTime }}</span>
      </a>
    </section>
  </div>
</template>
