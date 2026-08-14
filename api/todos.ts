import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function initialize() {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, days TEXT NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 30, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS completions (todo_id INTEGER NOT NULL, completed_on TEXT NOT NULL, PRIMARY KEY(todo_id, completed_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS focus_progress (todo_id INTEGER NOT NULL, progress_on TEXT NOT NULL, elapsed_seconds INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(todo_id, progress_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
    `CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_on)`,
  ])
  const columns = await client.execute('PRAGMA table_info(todos)')
  if (!columns.rows.some(row => String(row.name) === 'duration_minutes')) await client.execute('ALTER TABLE todos ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30')
}

export default async function handler(request: Request) {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return Response.json({ error: 'Turso environment variables are missing.' }, { status: 503 })
  }
  try {
    await initialize()
    const url = new URL(request.url)
    const body = request.method === 'GET' ? {} : await request.json() as Record<string, any>
    if (request.method === 'GET') {
      const date = url.searchParams.get('date') || ''
      const result = await client.execute({ sql: `SELECT t.id, t.title, t.days, t.duration_minutes, COALESCE(p.elapsed_seconds, 0) elapsed_seconds, CASE WHEN c.todo_id IS NULL THEN 0 ELSE 1 END completed FROM todos t LEFT JOIN completions c ON c.todo_id=t.id AND c.completed_on=? LEFT JOIN focus_progress p ON p.todo_id=t.id AND p.progress_on=? ORDER BY t.created_at`, args: [date, date] })
      return Response.json(result.rows)
    }
    if (request.method === 'POST') {
      const requestedDuration = Number(body.duration_minutes)
      const duration = Number.isFinite(requestedDuration) ? Math.max(0, Math.min(240, requestedDuration)) : 30
      const result = await client.execute({ sql: 'INSERT INTO todos(title, days, duration_minutes) VALUES (?, ?, ?)', args: [String(body.title), JSON.stringify(body.days), duration] })
      return Response.json({ id: Number(result.lastInsertRowid), title: body.title, days: body.days, duration_minutes: duration }, { status: 201 })
    }
    if (request.method === 'PATCH') {
      if (body.title !== undefined) await client.execute({ sql: 'UPDATE todos SET title=? WHERE id=?', args: [String(body.title).trim().slice(0, 100), body.id] })
      if (body.elapsed_seconds !== undefined) await client.execute({ sql: 'INSERT INTO focus_progress(todo_id, progress_on, elapsed_seconds) VALUES (?, ?, ?) ON CONFLICT(todo_id, progress_on) DO UPDATE SET elapsed_seconds=excluded.elapsed_seconds', args: [body.id, body.date, Math.max(0, Number(body.elapsed_seconds) || 0)] })
      if (body.completed !== undefined) await client.execute(body.completed
        ? { sql: 'INSERT OR IGNORE INTO completions(todo_id, completed_on) VALUES (?, ?)', args: [body.id, body.date] }
        : { sql: 'DELETE FROM completions WHERE todo_id=? AND completed_on=?', args: [body.id, body.date] })
      return Response.json({ ok: true })
    }
    if (request.method === 'DELETE') {
      await client.batch([
        { sql: 'DELETE FROM focus_progress WHERE todo_id=?', args: [body.id] },
        { sql: 'DELETE FROM completions WHERE todo_id=?', args: [body.id] },
        { sql: 'DELETE FROM todos WHERE id=?', args: [body.id] },
      ])
      return Response.json({ ok: true })
    }
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 })
  }
}
