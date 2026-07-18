<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../composables/useLocale'
import { weeklyEntries } from '../lib/content'

const { activeLocale } = useLocale()

const entries = computed(() => weeklyEntries.filter((entry) =>
  entry.locale === activeLocale.value && entry.published
))
</script>

<template>
  <section class="weekly-archive page-enter">
    <header class="page-heading ornament-heading">
      <div>
        <span class="eyebrow">AQRT Manual</span>
        <h1>Weekly Archive</h1>
      </div>
    </header>

    <div class="weekly-archive-grid">
      <article v-for="entry in entries" :key="entry.week" class="weekly-archive-card">
        <span>{{ entry.week }}</span>
        <h2>{{ entry.title }}</h2>
        <nav>
          <RouterLink :to="`/weekly/${entry.week}/reading`">Reading</RouterLink>
          <RouterLink :to="`/weekly/${entry.week}/contemplation`">Contemplation</RouterLink>
          <RouterLink :to="`/weekly/${entry.week}/assignment`">Assignment</RouterLink>
        </nav>
      </article>
    </div>
  </section>
</template>
