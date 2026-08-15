<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { requestSync, syncMessage, syncState } from './sync'

const savedTheme = localStorage.getItem('daymark-theme')
const dark = ref(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
function applyTheme() {
  document.documentElement.dataset.theme = dark.value ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark.value ? '#071c2e' : '#1769aa')
}
function toggleTheme() { dark.value = !dark.value; localStorage.setItem('daymark-theme', dark.value ? 'dark' : 'light'); applyTheme() }
applyTheme()
</script>

<template>
  <div class="shell">
    <header>
      <RouterLink to="/" class="brand" aria-label="Daymark home"><span class="brand-mark">✓</span> daymark</RouterLink>
      <button class="sync-button header-sync" :class="`sync-${syncState}`" :disabled="syncState === 'syncing'" :aria-label="syncMessage" :title="syncMessage" @click="requestSync"><span class="sync-icon" aria-hidden="true">↻</span></button>
      <nav aria-label="Main navigation">
        <RouterLink to="/">Today</RouterLink><button class="theme-toggle" :aria-label="`Switch to ${dark ? 'light' : 'dark'} mode`" :title="`${dark ? 'Light' : 'Dark'} mode`" @click="toggleTheme"><span aria-hidden="true">{{ dark ? '☀' : '☾' }}</span></button>
      </nav>
    </header>
    <main><RouterView /></main>
    <footer><RouterLink to="/settings" class="settings-link" aria-label="Settings" title="Settings"><span aria-hidden="true">⚙︎</span></RouterLink><span>Small steps, every day.</span><RouterLink to="/week" class="week-link" aria-label="Week view" title="Week view"><span aria-hidden="true">▦</span></RouterLink></footer>
  </div>
</template>
