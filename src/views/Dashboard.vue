<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { api, isoDate, type Todo } from '../types'

const todos = ref<Todo[]>([]); const loading = ref(true); const error = ref(''); const saveError = ref('')
const today = new Date(); const todayIndex = today.getDay()
const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const todaysTodos = computed(() => todos.value.filter(t => t.days.includes(todayIndex)))
type DisplayItem = { key: string; title: string; todos: Todo[] }
const displayItems = computed<DisplayItem[]>(() => {
  const entries: DisplayItem[] = []; const groups = new Map<string, DisplayItem>()
  for (const todo of todaysTodos.value) {
    const name = todo.group_name?.trim()
    if (!name) { entries.push({ key: `todo-${todo.id}`, title: todo.title, todos: [todo] }); continue }
    const normalized = name.toLocaleLowerCase()
    let group = groups.get(normalized)
    if (!group) { group = { key: `group-${normalized}`, title: name, todos: [] }; groups.set(normalized, group); entries.push(group) }
    group.todos.push(todo)
  }
  return entries
})
const overallProgress = computed(() => {
  if (!todaysTodos.value.length) return 0
  return Math.round(todaysTodos.value.reduce((total, todo) => total + taskPercentage(todo), 0) / todaysTodos.value.length)
})
const progressSeconds = ref<Record<number, number>>({})
const activeTodo = ref<Todo | null>(null)
const secondsLeft = ref(30 * 60)
const timerDuration = ref(30 * 60)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let audioContext: AudioContext | undefined
const timerText = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')}:${String(secondsLeft.value % 60).padStart(2, '0')}`)
const timerProgress = computed(() => ((timerDuration.value - secondsLeft.value) / timerDuration.value) * 100)
function taskPercentage(todo: Todo) {
  if (todo.completed) return 100
  const total = (todo.duration_minutes ?? 30) * 60
  return total ? Math.min(100, Number(((progressSeconds.value[todo.id] || 0) / total * 100).toFixed(1))) : 0
}
function taskTimeLabel(todo: Todo) {
  const total = (todo.duration_minutes ?? 30) * 60
  if (!total) return 'Untimed'
  const elapsed = Math.min(total, progressSeconds.value[todo.id] || 0)
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return `${format(elapsed)} of ${format(total)}`
}
onMounted(async () => { try { const rows = await api<any[]>(); todos.value = rows.map(t => ({ ...t, days: JSON.parse(t.days), elapsed_seconds: Number(t.elapsed_seconds) || 0 })); progressSeconds.value = Object.fromEntries(todos.value.map(todo => [todo.id, todo.elapsed_seconds])) } catch(e) { error.value = e instanceof Error ? e.message : 'Could not load todos' } finally { loading.value = false } })
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => { saveActiveProgress(); stopTimer(); window.removeEventListener('keydown', onKeydown) })
function openTimer(todo: Todo) { saveActiveProgress(); stopTimer(); activeTodo.value = todo; timerDuration.value = (todo.duration_minutes ?? 30) * 60; secondsLeft.value = Math.max(0, timerDuration.value - (progressSeconds.value[todo.id] || 0)) }
async function startTimer() {
  if (running.value || secondsLeft.value === 0) return
  audioContext ||= new AudioContext()
  if (audioContext.state === 'suspended') await audioContext.resume()
  playButtonBeep(660)
  running.value = true
  timer = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
      if (activeTodo.value) {
        activeTodo.value.elapsed_seconds = timerDuration.value - secondsLeft.value
        progressSeconds.value[activeTodo.value.id] = activeTodo.value.elapsed_seconds
      }
      if (activeTodo.value && progressSeconds.value[activeTodo.value.id] % 5 === 0) void persistProgress(activeTodo.value)
    }
    if (secondsLeft.value === 0) { stopTimer(); playCompletionChime(); void completeActiveTodo() }
  }, 1000)
}
function stopTimer() { running.value = false; if (timer) clearInterval(timer); timer = undefined }
function pauseTimer() { if (!running.value) return; playButtonBeep(390); stopTimer(); saveActiveProgress() }
function closeTimer() { stopTimer(); saveActiveProgress(); activeTodo.value = null }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape' && activeTodo.value) closeTimer() }
async function completeActiveTodo() {
  const todo = activeTodo.value
  if (!todo || todo.completed) return
  todo.completed = true
  try { await api('PATCH', { id: todo.id, date: isoDate(), completed: true }) }
  catch { todo.completed = false }
}
function saveActiveProgress() { if (activeTodo.value && timerDuration.value > 0) void persistProgress(activeTodo.value) }
async function persistProgress(todo: Todo) {
  const elapsed = progressSeconds.value[todo.id] || 0
  todo.elapsed_seconds = elapsed
  try { await api('PATCH', { id: todo.id, date: isoDate(), elapsed_seconds: elapsed }); saveError.value = '' }
  catch (cause) { saveError.value = cause instanceof Error ? cause.message : 'Progress could not be saved' }
}
async function toggleUntimed() {
  const todo = activeTodo.value
  if (!todo) return
  audioContext ||= new AudioContext()
  if (audioContext.state === 'suspended') await audioContext.resume()
  const previous = Boolean(todo.completed)
  playButtonBeep(previous ? 390 : 660)
  todo.completed = !previous
  try { await api('PATCH', { id: todo.id, date: isoDate(), completed: Boolean(todo.completed) }) }
  catch { todo.completed = previous }
}
async function toggleGroupedTodo(todo: Todo) {
  const previous = Boolean(todo.completed); todo.completed = !previous
  try { await api('PATCH', { id: todo.id, date: isoDate(), completed: Boolean(todo.completed) }); saveError.value = '' }
  catch (cause) { todo.completed = previous; saveError.value = cause instanceof Error ? cause.message : 'Could not update item' }
}
function playButtonBeep(frequency: number) {
  if (!audioContext) return
  const now = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(.13, now)
  gain.gain.exponentialRampToValueAtTime(.001, now + .1)
  oscillator.connect(gain).connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + .11)
}
function playCompletionChime() {
  if (!audioContext) return
  const now = audioContext.currentTime
  ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext!.createOscillator()
    const gain = audioContext!.createGain()
    const start = now + index * .18
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(.22, start + .025)
    gain.gain.exponentialRampToValueAtTime(.001, start + .65)
    oscillator.connect(gain).connect(audioContext!.destination)
    oscillator.start(start)
    oscillator.stop(start + .68)
  })
}
</script>

<template>
  <div class="dashboard-view">
  <section class="hero dashboard-hero">
    <div>
      <p class="eyebrow">{{ dateLabel }}</p>
      <h1>Today’s tasks</h1>
      <p class="lede">Stay on track with your daily routine.</p>
    </div>
    <div
      class="overall-progress"
      role="img"
      :aria-label="`${overallProgress}% overall progress across ${todaysTodos.length} tasks`"
    >
      <div class="progress-pie" :style="{ '--overall-progress': overallProgress + '%' }">
        <strong>{{ overallProgress }}%</strong>
      </div>
      <span>Overall progress</span>
    </div>
  </section>
  <section class="card focus-card" aria-live="polite">
    <div class="card-head"><div><p class="eyebrow">Today’s focus</p><h2>{{ todaysTodos.length }} {{ todaysTodos.length === 1 ? 'task' : 'tasks' }}</h2></div><span class="list-readonly">Select a task to begin</span></div>
    <p v-if="saveError" class="save-error" role="alert">Progress isn’t saving: {{ saveError }}</p>
    <p v-if="loading" class="state">Gathering your day…</p>
    <div v-else-if="error" class="state error"><strong>We couldn’t reach your list.</strong><br>{{ error }}</div>
    <div v-else-if="!todaysTodos.length" class="state"><span class="sun">☀</span><strong>A clear day.</strong><br>Add a recurring item in Settings when you’re ready.</div>
    <ul v-else class="todo-list">
      <li v-for="item in displayItems" :key="item.key" :class="{ 'focus-complete': item.todos.length === 1 && item.todos[0].completed, 'task-group': Boolean(item.todos[0].group_name) }">
        <details v-if="item.todos[0].group_name" class="group-details">
          <summary><span><strong>{{ item.title }}</strong><small>{{ item.todos.filter(todo => todo.completed).length }} of {{ item.todos.length }} done</small></span><span class="group-chevron" aria-hidden="true">⌄</span></summary>
          <div class="group-items">
            <label v-for="todo in item.todos" :key="todo.id" :class="{ complete: todo.completed }">
              <input type="checkbox" :checked="Boolean(todo.completed)" @change="toggleGroupedTodo(todo)"><span class="check">✓</span><span>{{ todo.title }}</span>
            </label>
          </div>
        </details>
        <button v-else class="task-open" @click="openTimer(item.todos[0])">
          <template v-for="todo in item.todos" :key="todo.id">
          <span class="task-meta"><span>{{ todo.title }}</span><span>{{ taskPercentage(todo) }}%</span></span>
          <span class="task-progress" role="progressbar" :aria-label="`${todo.title} progress`" :aria-valuenow="taskPercentage(todo)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: taskPercentage(todo) + '%' }"></span></span>
          <span class="task-status">{{ todo.completed ? 'Completed ✓' : taskTimeLabel(todo) }}</span>
          </template>
        </button>
      </li>
    </ul>
  </section>
  <p class="dashboard-note">Need to change your routine? <RouterLink to="/settings">Manage it in Settings →</RouterLink></p>

  <Teleport to="body">
    <div v-if="activeTodo" class="modal-backdrop" role="presentation" @click="closeTimer">
      <section class="timer-modal" role="dialog" aria-modal="true" aria-labelledby="timer-title" @click.stop>
        <button class="modal-close" aria-label="Close timer" @click="closeTimer">×</button>
        <p class="eyebrow">Focus session</p>
        <h2 id="timer-title">{{ activeTodo.title }}</h2>
        <div v-if="timerDuration > 0" class="timer-ring" :style="{ '--timer-progress': timerProgress + '%' }">
          <div><strong>{{ timerText }}</strong><span>{{ secondsLeft === 0 ? 'Nice work!' : running ? 'Stay with it' : 'Ready when you are' }}</span></div>
        </div>
        <div v-else class="untimed-state"><span>{{ activeTodo.completed ? '✓' : '∞' }}</span><strong>{{ activeTodo.completed ? 'Completed for today' : 'No timer needed' }}</strong><p>Mark it done whenever you finish.</p></div>
        <div v-if="timerDuration > 0" class="timer-actions">
          <button class="timer-toggle" :class="{ paused: running }" :disabled="secondsLeft === 0" @click="running ? pauseTimer() : startTimer()">
            {{ running ? 'Pause' : secondsLeft < timerDuration ? 'Resume' : 'Start' }}
          </button>
        </div>
        <button v-else class="untimed-toggle" :class="{ undo: activeTodo.completed }" @click="toggleUntimed">{{ activeTodo.completed ? 'Undo' : 'Done' }}</button>
        <p v-if="timerDuration > 0" class="timer-note">♪ A chime will sound when your {{ activeTodo.duration_minutes ?? 30 }} minutes are up</p>
      </section>
    </div>
  </Teleport>
  </div>
</template>
