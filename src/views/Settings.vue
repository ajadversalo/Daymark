<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, dayNames, type Todo } from '../types'
const todos = ref<Todo[]>([]); const title = ref(''); const duration = ref(30); const days = ref<number[]>([1,2,3,4,5]); const error = ref(''); const saving = ref(false)
const editingId = ref<number | null>(null); const editingTitle = ref(''); const editSaving = ref(false)
const showAdd = ref(false)
async function load() { try { const rows = await api<any[]>(); todos.value = rows.map(t => ({ ...t, days: JSON.parse(t.days) })) } catch(e) { error.value = e instanceof Error ? e.message : 'Could not load todos' } }
onMounted(load)
function dayToggle(day: number) { days.value = days.value.includes(day) ? days.value.filter(d => d !== day) : [...days.value, day].sort() }
async function add() { if (!title.value.trim() || !days.value.length || duration.value < 0) return; saving.value = true; error.value=''; try { const item = await api<Todo>('POST', { title: title.value.trim(), days: days.value, duration_minutes: duration.value }); todos.value.push({ ...item, completed: false }); title.value=''; duration.value=30; days.value=[1,2,3,4,5]; showAdd.value=false } catch(e) { error.value = e instanceof Error ? e.message : 'Could not save todo' } finally { saving.value=false } }
async function remove(todo: Todo) { await api('DELETE', { id: todo.id }); todos.value = todos.value.filter(t => t.id !== todo.id) }
function beginEdit(todo: Todo) { editingId.value = todo.id; editingTitle.value = todo.title }
function cancelEdit() { editingId.value = null; editingTitle.value = '' }
async function saveEdit(todo: Todo) {
  const nextTitle = editingTitle.value.trim()
  if (!nextTitle) return
  editSaving.value = true; error.value = ''
  try { await api('PATCH', { id: todo.id, title: nextTitle }); todo.title = nextTitle; cancelEdit() }
  catch(e) { error.value = e instanceof Error ? e.message : 'Could not update the item' }
  finally { editSaving.value = false }
}
</script>

<template>
  <section class="hero compact settings-hero"><div><p class="eyebrow">Your routine</p><h1>Settings</h1><p class="lede">Shape the habits that appear throughout your week.</p></div><button class="add-trigger" aria-label="Add a new item" title="Add item" @click="showAdd = true">+</button></section>
  <div class="settings-grid">
    <section class="card routine-card"><div><p class="eyebrow">Current items</p><h2>Your weekly rhythm</h2></div>
      <p v-if="!todos.length" class="state">No items yet. Add your first one.</p>
      <ul v-else class="routine-list"><li v-for="todo in todos" :key="todo.id">
        <form v-if="editingId === todo.id" class="inline-edit" @submit.prevent="saveEdit(todo)">
          <input v-model="editingTitle" maxlength="100" :aria-label="`Edit ${todo.title}`" autofocus>
          <div><button type="submit" class="edit-save" :disabled="editSaving || !editingTitle.trim()">{{ editSaving ? 'Saving…' : 'Save' }}</button><button type="button" class="edit-cancel" @click="cancelEdit">Cancel</button></div>
        </form>
        <template v-else><div><strong>{{ todo.title }}</strong><p>{{ todo.days.map(d => dayNames[d]).join(' · ') }} · {{ (todo.duration_minutes ?? 30) === 0 ? 'Untimed' : `${todo.duration_minutes ?? 30} min` }}</p></div><div class="item-actions"><button class="edit" @click="beginEdit(todo)">Edit</button><button class="delete" @click="remove(todo)" :aria-label="`Delete ${todo.title}`">×</button></div></template>
      </li></ul>
    </section>
  </div>
  <Teleport to="body">
    <div v-if="showAdd" class="modal-backdrop" role="presentation" @click="showAdd = false">
      <form class="card form-card add-modal" role="dialog" aria-modal="true" aria-labelledby="add-title" @submit.prevent="add" @click.stop>
        <button type="button" class="modal-close" aria-label="Close add item form" @click="showAdd = false">×</button>
        <p class="eyebrow">New item</p><h2 id="add-title">Add to your rhythm</h2>
        <label class="field">What do you want to do?<input v-model="title" maxlength="100" placeholder="e.g. Take a morning walk" autofocus></label>
        <label class="field duration-field">Focus time (minutes)<input v-model.number="duration" type="number" min="0" max="240" step="1" inputmode="numeric"><span class="field-help">Use 0 for an untimed task.</span></label>
        <fieldset><legend>Repeat on</legend><div class="day-picker"><button v-for="(day, i) in dayNames" :key="day" type="button" :class="{ active: days.includes(i) }" :aria-pressed="days.includes(i)" @click="dayToggle(i)">{{ day.slice(0,1) }}</button></div></fieldset>
        <p v-if="error" class="inline-error">{{ error }}</p>
        <button class="primary" :disabled="saving || !title.trim() || !days.length || duration < 0">{{ saving ? 'Adding…' : 'Add item' }} <span>＋</span></button>
      </form>
    </div>
  </Teleport>
</template>
