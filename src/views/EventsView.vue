<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { diyanetCalendar, events } from '../lib/content'
import { upcomingEventOccurrences } from '../lib/events'

const now = ref(new Date())
const timer = window.setInterval(() => {
  now.value = new Date()
}, 60_000)

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const occurrences = computed(() =>
  upcomingEventOccurrences(events, diyanetCalendar, now.value)
)

const diyanetEvents = computed(() =>
  occurrences.value.filter(
    (entry) => entry.event.calendar === 'diyanet'
  )
)

const gregorianEvents = computed(() =>
  occurrences.value.filter(
    (entry) => entry.event.calendar === 'gregorian'
  )
)
</script>

<template>
  <section class="events-page page-enter">
    <header class="page-heading ornament-heading">
      <div>
        <span class="eyebrow">Activities</span>
        <h1>Upcoming Events</h1>
      </div>

      <RouterLink class="outline-action" to="/activities">
        ← Activities
      </RouterLink>
    </header>

    <div class="event-calendar-columns">
      <section class="event-calendar-column">
        <header>
          <span class="eyebrow">Hijri calendar</span>
          <h2>Events</h2>
          <small>Calendar reference: Istanbul</small>
        </header>

        <article
          v-for="occurrence in diyanetEvents"
          :key="occurrence.event.id"
          class="event-list-card"
        >
          <h3>{{ occurrence.event.title }}</h3>
          <p>{{ occurrence.displayDate }}</p>
          <p v-if="!occurrence.dateKnown" class="event-date-note">
            The matching Gregorian date is not yet present in the
            checked-in Diyanet calendar data.
          </p>
          <small v-if="occurrence.displayTime">
            {{ occurrence.displayTime }} · {{ occurrence.timezoneLabel }}
          </small>
          <a
            v-if="occurrence.event.url"
            :href="occurrence.event.url"
            target="_blank"
            rel="noreferrer"
          >
            Open event link ↗
          </a>
        </article>

        <p v-if="!diyanetEvents.length" class="empty-list-message">
          No enabled upcoming Diyanet events are available.
        </p>
      </section>

      <section class="event-calendar-column">
        <header>
        <h2>Events</h2>
          <span class="eyebrow">Gregorian calendar</span>
          <small>Default timezone: New York</small>
        </header>

        <article
          v-for="occurrence in gregorianEvents"
          :key="occurrence.event.id"
          class="event-list-card"
        >
          <h3>{{ occurrence.event.title }}</h3>
          <p>{{ occurrence.displayDate }}</p>
          <small v-if="occurrence.displayTime">
            {{ occurrence.displayTime }} · {{ occurrence.timezoneLabel }}
          </small>
          <a
            v-if="occurrence.event.url"
            :href="occurrence.event.url"
            target="_blank"
            rel="noreferrer"
          >
            Open event link ↗
          </a>
        </article>

        <p v-if="!gregorianEvents.length" class="empty-list-message">
          No enabled upcoming Gregorian events are available.
        </p>
      </section>
    </div>
  </section>
</template>
