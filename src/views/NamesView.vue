<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { dailyCycleIndex, stableDailyIndex } from '../lib/daily'
import { useTimeZone } from '../composables/useTimeZone'
import { useRoute, useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { divineNamesByLocale } from '../lib/content'

const route = useRoute()
const router = useRouter()
const { activeLocale } = useLocale()
const { selectedTimeZone } = useTimeZone()
const now = ref(new Date())
let dailyTimer: number | undefined
const currentIndex = ref(0)
const direction = ref<'forward' | 'backward'>('forward')
const pointerStartX = ref<number | null>(null)
const pointerStartY = ref<number | null>(null)

const names = computed(() => divineNamesByLocale.get(activeLocale.value) || divineNamesByLocale.get('en') || [])
const current = computed(() => names.value[currentIndex.value])
const nameOfDay = computed(() => {
  const index = dailyCycleIndex(
    names.value.length,
    now.value,
    selectedTimeZone.value,
    `name-of-day:${activeLocale.value}`
  )

  return index >= 0 ? names.value[index] : null
})

const nameOfDayMeanings = computed(() => {
  const meaning = nameOfDay.value?.meaning || ''
  const parts = meaning
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length ? parts : meaning ? [meaning] : []
})

const nameOfDayMeaning = computed(() => {
  const name = nameOfDay.value
  const meanings = nameOfDayMeanings.value
  if (!name || !meanings.length) return ''

  const index = stableDailyIndex(
    meanings.length,
    now.value,
    selectedTimeZone.value,
    `name-meaning:${name.number}`
  )

  return index >= 0 ? meanings[index] : meanings[0]
})
  

function clampIndex(value: number) {
  return Math.max(0, Math.min(names.value.length - 1, value))
}

function setIndex(value: number, updateUrl = true) {
  if (!names.value.length) return
  const next = clampIndex(value)
  direction.value = next >= currentIndex.value ? 'forward' : 'backward'
  currentIndex.value = next
  if (updateUrl) void router.replace({ path: '/names', query: { name: String(next + 1) } })
}

function move(delta: number) {
  setIndex(currentIndex.value + delta)
}

function syncFromRoute() {
  const requested = Number(route.query.name)
  setIndex(Number.isFinite(requested) && requested >= 1 ? requested - 1 : 0, false)
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement

  // Do not capture clicks intended for navigation controls.
  if (target.closest('button, input, a')) {
    return
  }

  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPointerUp(event: PointerEvent) {
  if (pointerStartX.value === null || pointerStartY.value === null) return
  const dx = event.clientX - pointerStartX.value
  const dy = event.clientY - pointerStartY.value
  pointerStartX.value = null
  pointerStartY.value = null
  if (Math.abs(dx) < 55 || Math.abs(dx) <= Math.abs(dy)) return
  move(dx < 0 ? 1 : -1)
}


function cancelPointer() {
  pointerStartX.value = null
  pointerStartY.value = null
}

function onRangeInput(event: Event) {
  setIndex(Number((event.target as HTMLInputElement).value) - 1)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Home') {
    event.preventDefault()
    setIndex(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    setIndex(names.value.length - 1)
  }
}

watch(() => route.query.name, syncFromRoute)
watch(activeLocale, () => setIndex(0))
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  dailyTimer = window.setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (dailyTimer !== undefined) window.clearInterval(dailyTimer)
})

syncFromRoute()
</script>

<template>
  <section class="names-page page-enter">
    <header class="page-heading ornament-heading names-heading">
      <div>
        <span class="eyebrow">AQRT Manual</span>
        <h1>Allah’s 99 Beautiful Names</h1>
      </div>
      <span class="names-counter">{{ currentIndex + 1 }} / {{ names.length }}</span>
    </header>

    <div
      v-if="current"
      class="name-stage"
      tabindex="0"
      aria-label="Allah’s 99 Beautiful Names. Swipe or use arrow keys."
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="cancelPointer"
    >
      <button class="name-arrow name-arrow-left" type="button" :disabled="currentIndex === 0" aria-label="Previous name" @click="move(-1)">←</button>

      <Transition :name="direction === 'forward' ? 'name-forward' : 'name-backward'" mode="out-in">
        <article :key="current.number" class="name-card">
          <span class="name-number">{{ String(current.number).padStart(2, '0') }}</span>
          <div class="name-arabic" dir="rtl" lang="ar">{{ current.arabic }}</div>
          <div class="name-rule" aria-hidden="true"></div>
          <h2>{{ current.transliteration }}</h2>
          <p>{{ current.meaning }}</p>
          <div class="name-abjad">
          <strong>{{ current.abjad }}</strong>
          </div>
        </article>
      </Transition>

      <button class="name-arrow name-arrow-right" type="button" :disabled="currentIndex === names.length - 1" aria-label="Next name" @click="move(1)">→</button>
    </div>

    <div class="names-controls">
      <span>1</span>
      <input
        :value="currentIndex + 1"
        type="range"
        min="1"
        :max="names.length"
        aria-label="Choose a name"
        @input="onRangeInput"
      />
      <span>{{ names.length }}</span>
    </div>
  </section>
</template>
