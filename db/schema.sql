CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  days TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  group_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS completions (
  todo_id INTEGER NOT NULL,
  completed_on TEXT NOT NULL,
  PRIMARY KEY (todo_id, completed_on),
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_on);

CREATE TABLE IF NOT EXISTS focus_progress (
  todo_id INTEGER NOT NULL,
  progress_on TEXT NOT NULL,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (todo_id, progress_on),
  FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
);
