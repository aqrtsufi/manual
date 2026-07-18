<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { manualSections } from '../lib/content'
import GlossaryText from '../components/GlossaryText.vue'

const route = useRoute()
const sectionId = computed(() => String(route.params.section || ''))
const section = computed(() => manualSections.find((item) => item.id === sectionId.value))

const index = computed(() => section.value
  ? manualSections.findIndex((item) => item.id === section.value?.id)
  : -1
)

const previous = computed(() => index.value > 0 ? manualSections[index.value - 1] : null)
const next = computed(() => index.value >= 0 && index.value < manualSections.length - 1
  ? manualSections[index.value + 1]
  : null
)
</script>

<template>
  <section v-if="section" class="manual-reader page-enter">
    <article class="reader-sheet logical-reader-sheet">
      <header class="reader-header">
        <div>
          <span class="eyebrow">{{ section.chapterTitle }}</span>
          <h1>{{ section.title }}</h1>
          <small>Original pages {{ section.sourcePages.join('–') }}</small>
        </div>
        <RouterLink
          class="outline-action"
          :to="`/manual/page/${section.sourcePages[0]}`"
        >Original page view</RouterLink>
      </header>

      <div class="manual-text">
        <GlossaryText :text="section.text" />
      </div>

      <nav class="reader-pager" aria-label="Manual sections">
        <RouterLink v-if="previous" :to="`/manual/read/${previous.id}`">←</RouterLink>
        <span>{{ section.title }}</span>
        <RouterLink v-if="next" :to="`/manual/read/${next.id}`">→</RouterLink>
      </nav>
    </article>
  </section>
</template>
