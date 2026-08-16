<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, isoDate, type Todo } from '../types'

type WeekDay = { date: Date; todos: Todo[] }
const weekOffset = ref(0)
const days = ref<WeekDay[]>([])
const loading = ref(true)
const error = ref('')
const editingTodo = ref<Todo | null>(null)
const editingTitle = ref('')
const editingGroup = ref('')
const editSaving = ref(false)
const editError = ref('')
const updateError = ref('')

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
function beginEdit(todo: Todo) {
  editingTodo.value = todo; editingTitle.value = todo.title; editingGroup.value = todo.group_name || ''; editError.value = ''
}
function cancelEdit() {
  editingTodo.value = null; editingTitle.value = ''; editingGroup.value = ''; editError.value = ''
}
async function saveEdit() {
  if (!editingTodo.value || !editingTitle.value.trim()) return
  editSaving.value = true; editError.value = ''
  try {
    await api('PATCH', { id: editingTodo.value.id, title: editingTitle.value.trim(), group_name: editingGroup.value.trim() || null })
    cancelEdit(); await loadWeek()
  } catch (cause) { editError.value = cause instanceof Error ? cause.message : 'Could not update the item' }
  finally { editSaving.value = false }
}
async function toggleComplete(todo: Todo, date: Date) {
  const previous = Boolean(todo.completed)
  todo.completed = !previous
  try {
    await api('PATCH', { id: todo.id, date: isoDate(date), completed: Boolean(todo.completed) })
    updateError.value = ''
  } catch (cause) {
    todo.completed = previous
    updateError.value = cause instanceof Error ? cause.message : 'Could not update the item'
  }
}
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
    <p v-if="updateError" class="save-error" role="alert">Progress isn’t saving: {{ updateError }}</p>
    <section v-if="!loading && !error" class="week-grid" aria-label="Weekly tasks">
      <article v-for="day in days" :key="isoDate(day.date)" class="card week-day" :class="{ today: isoDate(day.date) === isoDate() }">
        <header><div><span>{{ day.date.toLocaleDateString(undefined, { weekday: 'short' }) }}</span><strong>{{ day.date.getDate() }}</strong></div><span>{{ dayProgress(day.todos) }}%</span></header>
        <div class="week-day-progress"><span :style="{ width: dayProgress(day.todos) + '%' }"></span></div>
        <p v-if="!day.todos.length" class="week-empty">Clear day</p>
        <ul v-else><li v-for="todo in day.todos" :key="todo.id" :class="{ complete: todo.completed }"><button class="week-check" :aria-label="`${todo.completed ? 'Mark incomplete' : 'Mark done'}: ${todo.title}`" :aria-pressed="Boolean(todo.completed)" @click="toggleComplete(todo, day.date)">{{ todo.completed ? '✓' : '' }}</button><button class="week-item" :aria-label="`Edit ${todo.title}`" @click="beginEdit(todo)"><span><strong>{{ todo.title }}</strong><small v-if="todo.group_name">{{ todo.group_name }}</small></span></button></li></ul>
      </article>
    </section>
    <Teleport to="body">
      <div v-if="editingTodo" class="modal-backdrop" role="presentation" @click="cancelEdit">
        <form class="card form-card week-edit-modal" role="dialog" aria-modal="true" aria-labelledby="week-edit-title" @submit.prevent="saveEdit" @click.stop>
          <button type="button" class="modal-close" aria-label="Close edit form" @click="cancelEdit">×</button>
          <p class="eyebrow">Edit item</p><h2 id="week-edit-title">Update your rhythm</h2>
          <label class="field">Title<input v-model="editingTitle" maxlength="100" autofocus></label>
          <label class="field">Group <span class="optional">Optional</span><input v-model="editingGroup" maxlength="60" placeholder="e.g. Morning routine"></label>
          <p v-if="editError" class="inline-error" role="alert">{{ editError }}</p>
          <div class="week-edit-actions"><button type="button" class="edit-cancel" :disabled="editSaving" @click="cancelEdit">Cancel</button><button type="submit" class="edit-save" :disabled="editSaving || !editingTitle.trim()">{{ editSaving ? 'Saving…' : 'Save' }}</button></div>
        </form>
      </div>
    </Teleport>
  </div>
</template>
