<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  buildManualChapter,
  manualChapterDefinitions,
  manualSectionRoute
} from '../lib/manualChapters'

const route = useRoute()

const chapter = computed(() =>
  buildManualChapter(String(route.params.chapterId ?? ''))
)

const chapterIndex = computed(() => {
  if (!chapter.value) return -1

  return manualChapterDefinitions.findIndex(
    (entry) => entry.id === chapter.value?.id
  )
})

const previousChapter = computed(() =>
  chapterIndex.value > 0
    ? manualChapterDefinitions[chapterIndex.value - 1]
    : undefined
)

const nextChapter = computed(() =>
  chapterIndex.value >= 0
    ? manualChapterDefinitions[chapterIndex.value + 1]
    : undefined
)

function sectionElementId(sectionId: string) {
  return `manual-section-${sectionId}`
}

async function scrollToRequestedSection() {
  await nextTick()

  const sectionId = String(route.params.sectionId ?? '')

  if (!sectionId) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }

  document
    .getElementById(sectionElementId(sectionId))
    ?.scrollIntoView({
      block: 'start',
      behavior: 'smooth'
    })
}

onMounted(() => {
  void scrollToRequestedSection()
})

watch(
  () => [route.params.chapterId, route.params.sectionId],
  () => {
    void scrollToRequestedSection()
  }
)
</script>

<template>
  <section v-if="chapter" class="manual-logical-reader page-enter">
    <aside class="manual-logical-toc">
      <RouterLink class="manual-back-to-contents" to="/manual">
        ← Manual contents
      </RouterLink>

      <strong>{{ chapter.title }}</strong>

      <RouterLink
        v-for="section in chapter.blocks"
        :key="section.id"
        :to="manualSectionRoute(chapter.id, section.id)"
      >
        {{ section.title }}
      </RouterLink>
    </aside>

    <main class="manual-logical-sheet">
      <header class="manual-logical-reader-header">
        <span class="eyebrow">
          Source pages {{ chapter.pages[0] }}–{{ chapter.pages[1] }}
        </span>
        <h1>{{ chapter.title }}</h1>
      </header>

      <section
        v-for="section in chapter.blocks"
        :id="sectionElementId(section.id)"
        :key="section.id"
        class="manual-logical-section"
      >
        <header>
          <span>
            Pages {{ section.sourcePages[0] }}–{{ section.sourcePages[1] }}
          </span>
          <h2>{{ section.title }}</h2>
        </header>

        <!--
          When the GLS popup system is active, replace this div with:
          <GlossaryText :text="section.body" />
        -->
        <div class="manual-logical-text">{{ section.body }}</div>
      </section>

      <nav class="manual-logical-pager" aria-label="Chapter navigation">
        <RouterLink
          v-if="previousChapter"
          :to="
            previousChapter.route ||
            manualSectionRoute(previousChapter.id)
          "
        >
          <span>Previous chapter</span>
          <strong>{{ previousChapter.title }}</strong>
        </RouterLink>

        <span v-else />

        <RouterLink
          v-if="nextChapter"
          :to="
            nextChapter.route ||
            manualSectionRoute(nextChapter.id)
          "
        >
          <span>Next chapter</span>
          <strong>{{ nextChapter.title }}</strong>
        </RouterLink>
      </nav>
    </main>
  </section>

  <section v-else class="manual-missing-chapter page-enter">
    <span class="eyebrow">AQRT Manual</span>
    <h1>Chapter not found</h1>
    <RouterLink class="gold-action" to="/manual">
      Return to Manual
    </RouterLink>
  </section>
</template>
