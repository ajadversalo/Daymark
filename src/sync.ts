import { computed, ref } from 'vue'

export const syncState = ref<'idle' | 'syncing' | 'synced' | 'error'>('idle')
export const lastSyncedAt = ref<Date | null>(null)
export const syncRequest = ref(0)

export const syncMessage = computed(() => {
  if (syncState.value === 'syncing') return 'Syncing…'
  if (syncState.value === 'error') return 'Sync failed — try again'
  if (syncState.value === 'synced' && lastSyncedAt.value) return `Synced ${lastSyncedAt.value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  return 'Sync'
})

export function requestSync() { syncRequest.value++ }
