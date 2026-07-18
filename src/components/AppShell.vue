<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useSearchPanel } from '../composables/useSearchPanel'
import type { LocaleCode } from '../lib/types'
import FooterVersion from './FooterVersion.vue'
import GlobalSearch from './GlobalSearch.vue'

const { activeLocale, locales, setLocale } = useLocale()
const { openSearch } = useSearchPanel()
const allLocales: LocaleCode[] = ['en', 'fr', 'de', 'es']
const logoUrl = `${import.meta.env.BASE_URL}aqrt-emblem.png`

const navigation = [
  { to: '/', label: 'Home', mark: '◈' },
  { to: '/manual', label: 'Manual', mark: '§' },
  { to: '/names', label: '99 Names', mark: '٩٩' },
  { to: '/glossary', label: 'Glossary', mark: 'Aa' },
  { to: '/clock-settings', label: 'Clock settings', mark: '◴' },
  { to: '/videos', label: 'Videos', mark: '▶' },
  { to: '/weekly', label: 'Weekly', mark: 'Ⅶ' },
  { to: '/activities', label: 'Activities', mark: '↗' },
  { to: '/teacher', label: "Teacher's Corner", mark: '⌑' },
  { to: '/links', label: 'Links', mark: '∞' },
  { to: '/contact', label: 'Contact', mark: '✦' }
]

const bottomNavigation = navigation.filter((item) => ['/', '/manual', '/videos', '/weekly', '/activities'].includes(item.to))
const mobileMoreNavigation = navigation.filter((item) => !bottomNavigation.includes(item))
</script>

<template>
  <div class="app-frame">
    <aside class="side-rail">
      <RouterLink class="brand-seal" to="/" aria-label="AQRT Manual">
        <img :src="logoUrl" alt="" class="brand-emblem" />
        <span>AQRT Manual</span>
      </RouterLink>

      <nav class="rail-nav" aria-label="Main navigation">
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" class="rail-link">
          <span class="rail-mark" aria-hidden="true">{{ item.mark }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button class="rail-search" type="button" @click="openSearch">
        <span aria-hidden="true">⌕</span>
        <span>Search</span>
      </button>
    </aside>

    <div class="app-column">
      <header class="top-ribbon">
        <RouterLink to="/" class="mobile-brand">
          <img :src="logoUrl" alt="" />
          <span>AQRT Manual</span>
        </RouterLink>
        <div class="ribbon-actions">
          <div class="language-switch" aria-label="Language">
            <button
              v-for="locale in allLocales"
              :key="locale"
              type="button"
              :disabled="!locales.includes(locale)"
              :class="{ active: activeLocale === locale }"
              @click="setLocale(locale)"
            >{{ locale.toUpperCase() }}</button>
          </div>
          <button class="round-button" type="button" aria-label="Search" @click="openSearch">⌕</button>
          <details class="mobile-more dropdown dropdown-end">
            <summary class="round-button" aria-label="More">⋯</summary>
            <ul class="dropdown-content menu mobile-more-menu">
              <li v-for="item in mobileMoreNavigation" :key="item.to">
                <RouterLink :to="item.to">{{ item.label }}</RouterLink>
              </li>
            </ul>
          </details>
        </div>
      </header>

      <main class="page-stage">
        <RouterView />
      </main>

      <FooterVersion />
    </div>

    <nav class="bottom-dock" aria-label="Mobile navigation">
      <RouterLink v-for="item in bottomNavigation" :key="item.to" :to="item.to">
        <span aria-hidden="true">{{ item.mark }}</span>
        <small>{{ item.label }}</small>
      </RouterLink>
    </nav>

    <GlobalSearch />
  </div>
</template>
