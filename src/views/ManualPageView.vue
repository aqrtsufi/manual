<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { manualPages, tocByLocale } from '../lib/content'
import GlossaryText from '../components/GlossaryText.vue'


const route = useRoute()
const router = useRouter()
const { activeLocale } = useLocale()
const pageNumber = computed(() => Number(route.params.page))
const page = computed(() => manualPages.find((item) => item.locale === activeLocale.value && item.page === pageNumber.value))
const toc = computed(() => tocByLocale.get(activeLocale.value) || [])
const maxPage = computed(() => manualPages.filter((item) => item.locale === activeLocale.value).length)

function routeFor(entry: { id: string; page: number }): string {
  return entry.id === 'allahs-99-beautiful-names' ? '/names' : `/manual/page/${entry.page}`
}

function go(delta: number) {
  const target = pageNumber.value + delta
  if (target >= 1 && target <= maxPage.value) void router.push(`/manual/page/${target}`)
}

function openPdf() {
  window.open(`${window.location.origin}${window.location.pathname}#/print?pages=${pageNumber.value}`, '_blank', 'noopener')
}
</script>

<template>
  <section v-if="page" class="manual-reader page-enter">
    <aside class="reader-toc">
      <RouterLink to="/manual" class="reader-toc-title">Contents</RouterLink>
      <RouterLink
        v-for="entry in toc"
        :key="entry.id"
        :to="routeFor(entry)"
        :class="{ active: entry.page === pageNumber }"
      >{{ entry.title }}</RouterLink>
    </aside>

    <article class="reader-sheet">
      <header class="reader-header">
        <div>
          <span class="eyebrow">{{ page.page }}</span>
          <h1>{{ page.title }}</h1>
        </div>
        <div class="heading-actions">
          <RouterLink v-if="pageNumber >= 60 && pageNumber <= 74" class="outline-action" to="/names">99 Names</RouterLink>
          <button class="gold-action" type="button" @click="openPdf">PDF</button>
        </div>
      </header>

      <div class="manual-text">
        <GlossaryText :text="page.text" />
      </div>

      <nav class="reader-pager" aria-label="Manual pages">
        <button type="button" :disabled="pageNumber <= 1" @click="go(-1)">←</button>
        <span>{{ pageNumber }} / {{ maxPage }}</span>
        <button type="button" :disabled="pageNumber >= maxPage" @click="go(1)">→</button>
      </nav>
    </article>
  </section>
</template>
