<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { glossaryEntries } from '../lib/content'
import type { GlossaryCategory } from '../lib/types'

const { activeLocale } = useLocale()
const activeCategory = ref<GlossaryCategory>('general')
const query = ref('')
const route = useRoute()
const highlightedEntry = ref('')

const categories: Array<{ id: GlossaryCategory; label: string }> = [
  { id: 'general', label: 'General Glossary' },
  { id: 'asma', label: 'Beautiful Names' },
  { id: 'desc', label: 'Quranic Descriptions' }
]

const visibleEntries = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()

  return glossaryEntries.filter((entry) => {
    if (entry.locale !== activeLocale.value) return false
    if (entry.category !== activeCategory.value) return false
    if (!search) return true

    return `${entry.term} ${entry.description}`
      .toLocaleLowerCase()
      .includes(search)
  })
})

async function revealRequestedEntry() {
  const category = String(route.query.category || '')
  const entry = String(route.query.entry || '')

  if (category === 'general' || category === 'asma' || category === 'desc') {
    activeCategory.value = category
  }

  if (!entry) return

  query.value = ''
  highlightedEntry.value = entry
  await nextTick()

  document.getElementById(`glossary-${entry}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })

  window.setTimeout(() => {
    if (highlightedEntry.value === entry) highlightedEntry.value = ''
  }, 3000)
}

watch(() => route.query, revealRequestedEntry, { deep: true })
onMounted(revealRequestedEntry)

  
</script>

<template>
  <section class="glossary-page page-enter">
    <header class="page-heading ornament-heading">
      <div>
        <span class="eyebrow">AQRT Manual</span>
        <h1>Glossary</h1>
        <p class="glossary-source">
  Excerpt of <cite>The Quran: Daily Reading for All Humanity</cite>
  by Es-Seyyid Es-Shaykh Taner Vargonen el Ansari
</p>
      </div>
      <span class="names-counter">{{ visibleEntries.length }}</span>
    </header>

    <nav class="glossary-tabs" aria-label="Glossary categories">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        {{ category.label }}
      </button>
    </nav>

    <label class="glossary-search">
      <span>Search this category</span>
      <input v-model="query" type="search" placeholder="Search terms or definitions" />
    </label>

    <div class="glossary-list">
      <article
        v-for="entry in visibleEntries"
        :id="`glossary-${entry.id}`"
        :key="entry.id"
        :class="{ 'glossary-highlight': highlightedEntry === entry.id }"
      >
        <h2>{{ entry.term }}</h2>
        <p>{{ entry.description }}</p>
      </article>
    </div>
  </section>
</template>
