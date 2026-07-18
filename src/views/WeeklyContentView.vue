<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { weeklyEntries } from '../lib/content'
import type { WeeklyKind } from '../lib/types'

const route = useRoute()
const { activeLocale } = useLocale()

const kind = computed(() => route.params.kind as WeeklyKind)
const requestedWeek = computed(() => String(route.params.week || ''))

const kindTitle: Record<WeeklyKind, string> = {
  reading: 'Reading',
  contemplation: 'Contemplation',
  assignment: 'Assignment'
}

const entry = computed(() => {
  const published = weeklyEntries.filter((item) =>
    item.locale === activeLocale.value && item.published
  )

  if (requestedWeek.value) {
    return published.find((item) => item.week === requestedWeek.value)
  }

  return published[0]
})

const section = computed(() => entry.value?.sections[kind.value])
const title = computed(() => kindTitle[kind.value] || 'Weekly')
</script>

<template>
  <section class="weekly-content page-enter">
    <header class="page-heading ornament-heading">
      <div>
        <span v-if="entry" class="eyebrow">{{ entry.title }}</span>
        <h1>{{ title }}</h1>
      </div>
      <RouterLink class="outline-action" to="/weekly/archive">Archive</RouterLink>
    </header>

    <article v-if="section" class="markdown-sheet" v-html="section.html"></article>
    <p v-else>No published entry is available for this section.</p>
  </section>
</template>
