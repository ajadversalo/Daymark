import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { createClient } from '@libsql/client'

function tursoApi(): Plugin {
  return {
    name: 'daymark-turso-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      const client = env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN
        ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN }) : null
      server.middlewares.use('/api/todos', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (!client) { res.statusCode = 503; res.end(JSON.stringify({ error: 'Turso is not configured. Add your values to .env.' })); return }
        try {
          await client.batch([
            `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, days TEXT NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 30, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
            `CREATE TABLE IF NOT EXISTS completions (todo_id INTEGER NOT NULL, completed_on TEXT NOT NULL, PRIMARY KEY(todo_id, completed_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
            `CREATE TABLE IF NOT EXISTS focus_progress (todo_id INTEGER NOT NULL, progress_on TEXT NOT NULL, elapsed_seconds INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(todo_id, progress_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)`,
            `CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_on)`
          ])
          const columns = await client.execute('PRAGMA table_info(todos)')
          if (!columns.rows.some(row => String(row.name) === 'duration_minutes')) await client.execute('ALTER TABLE todos ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30')
          if (!columns.rows.some(row => String(row.name) === 'one_time')) await client.execute('ALTER TABLE todos ADD COLUMN one_time INTEGER NOT NULL DEFAULT 0')
          if (!columns.rows.some(row => String(row.name) === 'completed_once')) await client.execute('ALTER TABLE todos ADD COLUMN completed_once INTEGER NOT NULL DEFAULT 0')
          const body = await new Promise<any>((resolve) => { let raw=''; req.on('data', c => raw += c); req.on('end', () => resolve(raw ? JSON.parse(raw) : {})) })
          if (req.method === 'GET') {
            const date = String(body.date || new URL(req.url || '', 'http://x').searchParams.get('date') || '')
            const result = await client.execute({ sql: `SELECT t.id, t.title, t.days, t.one_time, t.duration_minutes, COALESCE(p.elapsed_seconds, 0) elapsed_seconds, CASE WHEN t.one_time=1 THEN t.completed_once WHEN c.todo_id IS NULL THEN 0 ELSE 1 END completed FROM todos t LEFT JOIN completions c ON c.todo_id=t.id AND c.completed_on=? LEFT JOIN focus_progress p ON p.todo_id=t.id AND p.progress_on=? ORDER BY t.created_at`, args: [date, date] })
            res.end(JSON.stringify(result.rows)); return
          }
          if (req.method === 'POST') {
            const requestedDuration = Number(body.duration_minutes)
            const duration = Number.isFinite(requestedDuration) ? Math.max(0, Math.min(240, requestedDuration)) : 30
            const oneTime = Boolean(body.one_time)
            if (!oneTime && (!Array.isArray(body.days) || !body.days.length)) { res.statusCode = 400; res.end(JSON.stringify({ error: 'A valid schedule is required.' })); return }
            const result = await client.execute({ sql: 'INSERT INTO todos(title, days, one_time, duration_minutes) VALUES (?, ?, ?, ?)', args: [body.title, JSON.stringify(oneTime ? [] : body.days), oneTime ? 1 : 0, duration] })
            res.statusCode = 201; res.end(JSON.stringify({ id: Number(result.lastInsertRowid), ...body, days: oneTime ? [] : body.days, one_time: oneTime, duration_minutes: duration })); return
          }
          if (req.method === 'PATCH') {
            if (body.clear_progress_on !== undefined) {
              const date = String(body.clear_progress_on)
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { res.statusCode = 400; res.end(JSON.stringify({ error: 'A valid date is required.' })); return }
              await client.batch([
                { sql: 'DELETE FROM focus_progress WHERE progress_on=?', args: [date] },
                { sql: 'DELETE FROM completions WHERE completed_on=?', args: [date] },
              ])
              res.end(JSON.stringify({ ok: true })); return
            }
            if (body.title !== undefined) await client.execute({ sql: 'UPDATE todos SET title=? WHERE id=?', args: [String(body.title).trim().slice(0, 100), body.id] })
            if (body.completed !== undefined) await client.execute({ sql: 'UPDATE todos SET completed_once=? WHERE id=? AND one_time=1', args: [body.completed ? 1 : 0, body.id] })
            if (body.elapsed_seconds !== undefined) await client.execute({ sql: 'INSERT INTO focus_progress(todo_id, progress_on, elapsed_seconds) VALUES (?, ?, ?) ON CONFLICT(todo_id, progress_on) DO UPDATE SET elapsed_seconds=excluded.elapsed_seconds', args: [body.id, body.date, Math.max(0, Number(body.elapsed_seconds) || 0)] })
            if (body.completed !== undefined) {
              if (body.completed) await client.execute({ sql: 'INSERT OR IGNORE INTO completions(todo_id, completed_on) VALUES (?, ?)', args: [body.id, body.date] })
              else await client.execute({ sql: 'DELETE FROM completions WHERE todo_id=? AND completed_on=?', args: [body.id, body.date] })
            }
            res.end('{}'); return
          }
          if (req.method === 'DELETE') { await client.batch([{ sql: 'DELETE FROM focus_progress WHERE todo_id=?', args: [body.id] }, { sql: 'DELETE FROM completions WHERE todo_id=?', args: [body.id] }, { sql: 'DELETE FROM todos WHERE id=?', args: [body.id] }]); res.end('{}'); return }
          res.statusCode = 405; res.end('{}')
        } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' })) }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), tursoApi(), VitePWA({ registerType: 'autoUpdate', includeAssets: ['icons/*.svg'], manifest: {
    name: 'Daymark', short_name: 'Daymark', description: 'A quiet daily rhythm for your recurring todos.', theme_color: '#1769aa', background_color: '#eef5ff', display: 'standalone', start_url: '/', icons: [
      { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }, { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
    ]
  } })]
})
