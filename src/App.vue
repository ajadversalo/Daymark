<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

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
      <nav aria-label="Main navigation">
        <RouterLink to="/">Today</RouterLink><RouterLink to="/settings" class="settings-link" aria-label="Settings" title="Settings"><span aria-hidden="true">⚙︎</span></RouterLink><button class="theme-toggle" :aria-label="`Switch to ${dark ? 'light' : 'dark'} mode`" :title="`${dark ? 'Light' : 'Dark'} mode`" @click="toggleTheme"><span aria-hidden="true">{{ dark ? '☀' : '☾' }}</span></button>
      </nav>
    </header>
    <main><RouterView /></main>
    <footer><span>Small steps, every day.</span></footer>
  </div>
</template>
