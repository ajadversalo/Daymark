# Daymark

A Vue 3 recurring-todo PWA backed by Turso. The dashboard shows only items scheduled for today and allows completion; todos are created and deleted in Settings.

## Setup

1. Copy `.env.example` to `.env` and add your Turso database URL and auth token.
2. Run `npm install`.
3. Run `npm run dev`.

Tables and the completion-date index are created automatically on the first API request. Turso credentials are read server-side and never included in the browser bundle. The `api/todos.ts` function is ready for Vercel-style serverless deployment; add both Turso values as server environment variables on your host.
