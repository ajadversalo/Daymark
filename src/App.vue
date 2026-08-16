<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { requestSync, syncMessage, syncState } from './sync'

const savedTheme = localStorage.getItem('daymark-theme')
const dark = ref(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
function applyTheme() {
  document.documentElement.dataset.theme = dark.value ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark.value ? '#24282e' : '#f3f3f4')
}
function toggleTheme() { dark.value = !dark.value; localStorage.setItem('daymark-theme', dark.value ? 'dark' : 'light'); applyTheme() }
applyTheme()
</script>

<template>
  <div class="shell">
    <header>
      <RouterLink to="/" class="brand" aria-label="Daymark home"><span class="brand-mark">✓</span> daymark</RouterLink>
      <nav aria-label="Main navigation">
        <button class="theme-toggle" :aria-label="`Switch to ${dark ? 'light' : 'dark'} mode`" :title="`${dark ? 'Light' : 'Dark'} mode`" @click="toggleTheme"><span aria-hidden="true">{{ dark ? '☀' : '☾' }}</span></button>
        <button class="sync-button header-sync" :class="`sync-${syncState}`" :disabled="syncState === 'syncing'" :aria-label="syncMessage" :title="syncMessage" @click="requestSync"><span class="sync-icon" aria-hidden="true">↻</span></button>
      </nav>
    </header>
    <main><RouterView /></main>
    <footer><RouterLink to="/settings" class="settings-link" aria-label="Settings" title="Settings"><span aria-hidden="true">⚙︎</span></RouterLink><div class="calendar-links"><RouterLink to="/" class="week-link" aria-label="Today" title="Today"><span class="view-icon today-view-icon" aria-hidden="true"></span></RouterLink><RouterLink to="/week" class="week-link" aria-label="Week view" title="Week view"><span class="view-icon week-view-icon" aria-hidden="true"></span></RouterLink><RouterLink to="/month" class="week-link" aria-label="Month view" title="Month view"><span class="view-icon month-view-icon" aria-hidden="true"></span></RouterLink></div></footer>
  </div>
</template>
