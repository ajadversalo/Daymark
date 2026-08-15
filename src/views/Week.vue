<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, isoDate, type Todo } from '../types'

type WeekDay = { date: Date; todos: Todo[] }
const weekOffset = ref(0)
const days = ref<WeekDay[]>([])
const loading = ref(true)
const error = ref('')

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + weekOffset.value * 7)
  return start
}
const weekStart = computed(() => startOfWeek(new Date()))
const weekLabel = computed(() => {
  const end = new Date(weekStart.value); end.setDate(end.getDate() + 6)
  const startText = weekStart.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endText = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startText} – ${endText}`
})

function normalize(rows: any[]): Todo[] {
  return rows.map(todo => ({ ...todo, days: Array.isArray(todo.days) ? todo.days : JSON.parse(todo.days), elapsed_seconds: Number(todo.elapsed_seconds) || 0 }))
}
function scheduledFor(todo: Todo, date: Date) {
  return todo.one_time ? isoDate(date) === isoDate() : todo.days.includes(date.getDay())
}
function percentage(todo: Todo) {
  if (todo.completed) return 100
  const duration = (todo.duration_minutes || 0) * 60
  return duration ? Math.min(100, Math.round((todo.elapsed_seconds || 0) / duration * 100)) : 0
}
function dayProgress(todos: Todo[]) {
  return todos.length ? Math.round(todos.reduce((sum, todo) => sum + percentage(todo), 0) / todos.length) : 0
}
async function loadWeek() {
  loading.value = true; error.value = ''
  const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart.value); date.setDate(date.getDate() + index); return date })
  try {
    const results = await Promise.all(dates.map(date => api<any[]>('GET', undefined, isoDate(date))))
    days.value = dates.map((date, index) => ({ date, todos: normalize(results[index]).filter(todo => scheduledFor(todo, date)) }))
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not load this week' }
  finally { loading.value = false }
}
function changeWeek(amount: number) { weekOffset.value += amount; void loadWeek() }
function returnToThisWeek() { weekOffset.value = 0; void loadWeek() }
onMounted(loadWeek)
</script>

<template>
  <div class="week-view">
    <section class="hero week-hero">
      <div><p class="eyebrow">Week view</p><h1>{{ weekLabel }}</h1><p class="lede">Your full routine at a glance.</p></div>
      <div class="week-controls"><button aria-label="Previous week" @click="changeWeek(-1)">‹</button><button v-if="weekOffset" class="this-week" @click="returnToThisWeek">This week</button><button aria-label="Next week" @click="changeWeek(1)">›</button></div>
    </section>
    <section v-if="loading" class="card state">Loading your week…</section>
    <section v-else-if="error" class="card state error"><strong>We couldn’t load your week.</strong><br>{{ error }}</section>
    <section v-else class="week-grid" aria-label="Weekly tasks">
      <article v-for="day in days" :key="isoDate(day.date)" class="card week-day" :class="{ today: isoDate(day.date) === isoDate() }">
        <header><div><span>{{ day.date.toLocaleDateString(undefined, { weekday: 'short' }) }}</span><strong>{{ day.date.getDate() }}</strong></div><span>{{ dayProgress(day.todos) }}%</span></header>
        <div class="week-day-progress"><span :style="{ width: dayProgress(day.todos) + '%' }"></span></div>
        <p v-if="!day.todos.length" class="week-empty">Clear day</p>
        <ul v-else><li v-for="todo in day.todos" :key="todo.id" :class="{ complete: todo.completed }"><span class="week-check">{{ todo.completed ? '✓' : '' }}</span><span><strong>{{ todo.title }}</strong><small v-if="todo.group_name">{{ todo.group_name }}</small></span></li></ul>
      </article>
    </section>
  </div>
</template>
