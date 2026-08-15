import express from 'express'
import { createClient } from '@libsql/client'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const app = express()
const port = Number(process.env.PORT) || 3000
const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')

app.use(express.json())

let client
let initialization
function database() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) throw new Error('Turso environment variables are missing.')
  client ||= createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  initialization ||= initialize(client)
  return { client, ready: initialization }
}

async function initialize(db) {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, days TEXT NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 30, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS completions (todo_id INTEGER NOT NULL, completed_on TEXT NOT NULL, PRIMARY KEY(todo_id, completed_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS focus_progress (todo_id INTEGER NOT NULL, progress_on TEXT NOT NULL, elapsed_seconds INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(todo_id, progress_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
    `CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_on)`,
  ])
  const columns = await db.execute('PRAGMA table_info(todos)')
  if (!columns.rows.some(row => String(row.name) === 'duration_minutes')) await db.execute('ALTER TABLE todos ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30')
  if (!columns.rows.some(row => String(row.name) === 'group_name')) await db.execute('ALTER TABLE todos ADD COLUMN group_name TEXT')
}

app.all('/api/todos', async (request, response) => {
  try {
    const { client: db, ready } = database()
    await ready
    const body = request.body || {}
    if (request.method === 'GET') {
      const date = String(request.query.date || '')
      const result = await db.execute({ sql: `SELECT t.id, t.title, t.days, t.duration_minutes, t.group_name, COALESCE(p.elapsed_seconds, 0) elapsed_seconds, CASE WHEN c.todo_id IS NULL THEN 0 ELSE 1 END completed FROM todos t LEFT JOIN completions c ON c.todo_id=t.id AND c.completed_on=? LEFT JOIN focus_progress p ON p.todo_id=t.id AND p.progress_on=? ORDER BY t.created_at`, args: [date, date] })
      return response.json(result.rows)
    }
    if (request.method === 'POST') {
      const title = String(body.title || '').trim().slice(0, 100)
      if (!title || !Array.isArray(body.days)) return response.status(400).json({ error: 'A title and schedule are required.' })
      const requested = Number(body.duration_minutes)
      const duration = Number.isFinite(requested) ? Math.max(0, Math.min(240, requested)) : 30
      const groupName = String(body.group_name || '').trim().slice(0, 60) || null
      const result = await db.execute({ sql: 'INSERT INTO todos(title, days, duration_minutes, group_name) VALUES (?, ?, ?, ?)', args: [title, JSON.stringify(body.days), duration, groupName] })
      return response.status(201).json({ id: Number(result.lastInsertRowid), title, days: body.days, duration_minutes: duration, group_name: groupName, elapsed_seconds: 0 })
    }
    if (request.method === 'PATCH') {
      if (body.title !== undefined) await db.execute({ sql: 'UPDATE todos SET title=? WHERE id=?', args: [String(body.title).trim().slice(0, 100), body.id] })
      if (body.group_name !== undefined) await db.execute({ sql: 'UPDATE todos SET group_name=? WHERE id=?', args: [String(body.group_name || '').trim().slice(0, 60) || null, body.id] })
      if (body.elapsed_seconds !== undefined) await db.execute({ sql: 'INSERT INTO focus_progress(todo_id, progress_on, elapsed_seconds) VALUES (?, ?, ?) ON CONFLICT(todo_id, progress_on) DO UPDATE SET elapsed_seconds=excluded.elapsed_seconds', args: [body.id, body.date, Math.max(0, Number(body.elapsed_seconds) || 0)] })
      if (body.completed !== undefined) await db.execute(body.completed
        ? { sql: 'INSERT OR IGNORE INTO completions(todo_id, completed_on) VALUES (?, ?)', args: [body.id, body.date] }
        : { sql: 'DELETE FROM completions WHERE todo_id=? AND completed_on=?', args: [body.id, body.date] })
      return response.json({ ok: true })
    }
    if (request.method === 'DELETE') {
      await db.batch([
        { sql: 'DELETE FROM focus_progress WHERE todo_id=?', args: [body.id] },
        { sql: 'DELETE FROM completions WHERE todo_id=?', args: [body.id] },
        { sql: 'DELETE FROM todos WHERE id=?', args: [body.id] },
      ])
      return response.json({ ok: true })
    }
    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' })
  }
})

app.use(express.static(dist))
app.get('*', (_request, response) => response.sendFile(join(dist, 'index.html')))
app.listen(port, '0.0.0.0', () => console.log(`Daymark listening on port ${port}`))
