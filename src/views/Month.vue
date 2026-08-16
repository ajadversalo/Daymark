<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, isoDate, type Todo } from '../types'

type DayStatus = 'none' | 'partial' | 'complete'
type MonthDay = { date: Date; inMonth: boolean; status: DayStatus }
const monthOffset = ref(0)
const days = ref<MonthDay[]>([])
const loading = ref(true)
const error = ref('')
const visibleMonth = computed(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + monthOffset.value, 1) })
const monthLabel = computed(() => visibleMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))

function calendarDates() {
  const first = visibleMonth.value
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay())
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date })
}
function normalize(rows: any[]): Todo[] {
  return rows.map(todo => ({ ...todo, days: Array.isArray(todo.days) ? todo.days : JSON.parse(todo.days), elapsed_seconds: Number(todo.elapsed_seconds) || 0 }))
}
function scheduledFor(todo: Todo, date: Date) { return todo.one_time ? isoDate(date) === isoDate() : todo.days.includes(date.getDay()) }
function taskProgress(todo: Todo) {
  if (todo.completed) return 100
  const duration = (todo.duration_minutes || 0) * 60
  return duration ? Math.min(100, (todo.elapsed_seconds || 0) / duration * 100) : 0
}
function statusFor(todos: Todo[]): DayStatus {
  if (!todos.length || todos.every(todo => taskProgress(todo) === 0)) return 'none'
  return todos.every(todo => taskProgress(todo) === 100) ? 'complete' : 'partial'
}
function statusLabel(day: MonthDay) { return `${day.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}: ${day.status}` }
async function loadMonth() {
  loading.value = true; error.value = ''
  const dates = calendarDates()
  try {
    const results = await Promise.all(dates.map(date => api<any[]>('GET', undefined, isoDate(date))))
    days.value = dates.map((date, index) => ({ date, inMonth: date.getMonth() === visibleMonth.value.getMonth(), status: statusFor(normalize(results[index]).filter(todo => scheduledFor(todo, date))) }))
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not load this month' }
  finally { loading.value = false }
}
function changeMonth(amount: number) { monthOffset.value += amount; void loadMonth() }
function returnToThisMonth() { monthOffset.value = 0; void loadMonth() }
onMounted(loadMonth)
</script>

<template>
  <div class="month-view">
    <section class="hero month-hero">
      <div><p class="eyebrow">Month view</p><h1>{{ monthLabel }}</h1><p class="lede">Your daily momentum at a glance.</p></div>
      <div class="month-controls"><button aria-label="Previous month" @click="changeMonth(-1)">&lsaquo;</button><button v-if="monthOffset" class="this-month" @click="returnToThisMonth">This month</button><button aria-label="Next month" @click="changeMonth(1)">&rsaquo;</button></div>
    </section>
    <section v-if="loading" class="card state">Loading your month&hellip;</section>
    <section v-else-if="error" class="card state error"><strong>We couldn't load your month.</strong><br>{{ error }}</section>
    <section v-else class="month-calendar card" aria-label="Monthly progress">
      <div v-for="name in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="name" class="month-weekday">{{ name }}</div>
      <div v-for="day in days" :key="isoDate(day.date)" class="month-day" :class="[{ muted: !day.inMonth, today: isoDate(day.date) === isoDate() }, `status-${day.status}`]" :aria-label="statusLabel(day)">
        <span class="month-date">{{ day.date.getDate() }}</span><span class="status-icon" aria-hidden="true"><svg v-if="day.status === 'none'" class="sad-face-icon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="M15 23c0 5 3 8 7 8s7-3 7-8M35 23c0 5 3 8 7 8s7-3 7-8M18 47c8-8 20-8 28 0"/></svg><svg v-else-if="day.status === 'partial'" class="partial-check-icon" viewBox="0 0 64 64"><defs><linearGradient :id="`partial-gradient-${isoDate(day.date)}`" x1="10" y1="7" x2="54" y2="57" gradientUnits="userSpaceOnUse"><stop stop-color="#ef3323"/><stop offset="1" stop-color="#f6bd32"/></linearGradient></defs><g :stroke="`url(#partial-gradient-${isoDate(day.date)})`"><path d="M22 8A26 26 0 1 1 8 43M8 29c.3-4 1.5-7.7 3.4-11"/><path d="m20 33 9 9 18-20"/></g></svg><svg v-else class="trophy-icon" viewBox="0 0 72 72"><path class="trophy-handles" d="M18 15H8v14c0 10 6 16 16 16M54 15h10v14c0 10-6 16-16 16"/><path class="trophy-cup" d="M20 8h32v25c0 13-7 21-16 23-9-2-16-10-16-23Z"/><path class="trophy-stem" d="M31 54v6l-4 7h18l-4-7v-6"/><path class="trophy-base" d="M23 66h26v5H23z"/><path class="trophy-star" d="m36 18 4 6 7 2-5 5v8l-6-3-6 3v-8l-5-5 7-2Z"/></svg></span>
      </div>
    </section>
    <div class="month-legend" aria-label="Status legend"><span><i class="status-icon" aria-hidden="true"><svg class="sad-face-icon" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="M15 23c0 5 3 8 7 8s7-3 7-8M35 23c0 5 3 8 7 8s7-3 7-8M18 47c8-8 20-8 28 0"/></svg></i>None</span><span><i class="status-icon" aria-hidden="true"><svg class="partial-check-icon" viewBox="0 0 64 64"><defs><linearGradient id="partial-gradient-legend" x1="10" y1="7" x2="54" y2="57" gradientUnits="userSpaceOnUse"><stop stop-color="#ef3323"/><stop offset="1" stop-color="#f6bd32"/></linearGradient></defs><g stroke="url(#partial-gradient-legend)"><path d="M22 8A26 26 0 1 1 8 43M8 29c.3-4 1.5-7.7 3.4-11"/><path d="m20 33 9 9 18-20"/></g></svg></i>Partial</span><span><i class="status-icon" aria-hidden="true"><svg class="trophy-icon" viewBox="0 0 72 72"><path class="trophy-handles" d="M18 15H8v14c0 10 6 16 16 16M54 15h10v14c0 10-6 16-16 16"/><path class="trophy-cup" d="M20 8h32v25c0 13-7 21-16 23-9-2-16-10-16-23Z"/><path class="trophy-stem" d="M31 54v6l-4 7h18l-4-7v-6"/><path class="trophy-base" d="M23 66h26v5H23z"/><path class="trophy-star" d="m36 18 4 6 7 2-5 5v8l-6-3-6 3v-8l-5-5 7-2Z"/></svg></i>Complete</span></div>
  </div>
</template>
