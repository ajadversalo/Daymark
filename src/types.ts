export type Todo = { id: number; title: string; days: number[]; duration_minutes: number; elapsed_seconds: number; completed: number | boolean }
export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const isoDate = () => new Date().toLocaleDateString('en-CA')

export async function api<T>(method = 'GET', body?: unknown): Promise<T> {
  const url = method === 'GET' ? `/api/todos?date=${isoDate()}` : '/api/todos'
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
