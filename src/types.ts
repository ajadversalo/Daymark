export type Todo = { id: number; title: string; days: number[]; duration_minutes: number; elapsed_seconds: number; completed: number | boolean }
export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export function isoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function api<T>(method = 'GET', body?: unknown): Promise<T> {
  const url = method === 'GET' ? `/api/todos?date=${isoDate()}` : '/api/todos'
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
