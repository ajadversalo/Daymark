<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <header>
      <RouterLink to="/" class="brand" aria-label="Daymark home"><span class="brand-mark">✓</span> daymark</RouterLink>
      <nav aria-label="Main navigation">
        <RouterLink to="/">Today</RouterLink><RouterLink to="/settings" class="settings-link" aria-label="Settings" title="Settings"><span aria-hidden="true">⚙︎</span></RouterLink>
      </nav>
    </header>
    <main><RouterView /></main>
    <footer><span>daymark</span><span>Small steps, every day.</span></footer>
  </div>
</template>
