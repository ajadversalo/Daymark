var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { createClient } from '@libsql/client';
function tursoApi() {
    return {
        name: 'daymark-turso-api',
        configureServer: function (server) {
            var _this = this;
            var env = loadEnv(server.config.mode, process.cwd(), '');
            var client = env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN
                ? createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN }) : null;
            server.middlewares.use('/api/todos', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var body, result, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            res.setHeader('Content-Type', 'application/json');
                            if (!client) {
                                res.statusCode = 503;
                                res.end(JSON.stringify({ error: 'Turso is not configured. Add your values to .env.' }));
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 15, , 16]);
                            return [4 /*yield*/, client.batch([
                                    "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, days TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
                                    "CREATE TABLE IF NOT EXISTS completions (todo_id INTEGER NOT NULL, completed_on TEXT NOT NULL, PRIMARY KEY(todo_id, completed_on), FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE)",
                                    "CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_on)"
                                ])];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, new Promise(function (resolve) { var raw = ''; req.on('data', function (c) { return raw += c; }); req.on('end', function () { return resolve(raw ? JSON.parse(raw) : {}); }); })];
                        case 3:
                            body = _a.sent();
                            if (!(req.method === 'GET')) return [3 /*break*/, 5];
                            return [4 /*yield*/, client.execute({ sql: "SELECT t.id, t.title, t.days, CASE WHEN c.todo_id IS NULL THEN 0 ELSE 1 END completed FROM todos t LEFT JOIN completions c ON c.todo_id=t.id AND c.completed_on=? ORDER BY t.created_at", args: [String(body.date || new URL(req.url || '', 'http://x').searchParams.get('date') || '')] })];
                        case 4:
                            result = _a.sent();
                            res.end(JSON.stringify(result.rows));
                            return [2 /*return*/];
                        case 5:
                            if (!(req.method === 'POST')) return [3 /*break*/, 7];
                            return [4 /*yield*/, client.execute({ sql: 'INSERT INTO todos(title, days) VALUES (?, ?)', args: [body.title, JSON.stringify(body.days)] })];
                        case 6:
                            result = _a.sent();
                            res.statusCode = 201;
                            res.end(JSON.stringify(__assign({ id: Number(result.lastInsertRowid) }, body)));
                            return [2 /*return*/];
                        case 7:
                            if (!(req.method === 'PATCH')) return [3 /*break*/, 12];
                            if (!body.completed) return [3 /*break*/, 9];
                            return [4 /*yield*/, client.execute({ sql: 'INSERT OR IGNORE INTO completions(todo_id, completed_on) VALUES (?, ?)', args: [body.id, body.date] })];
                        case 8:
                            _a.sent();
                            return [3 /*break*/, 11];
                        case 9: return [4 /*yield*/, client.execute({ sql: 'DELETE FROM completions WHERE todo_id=? AND completed_on=?', args: [body.id, body.date] })];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11:
                            res.end('{}');
                            return [2 /*return*/];
                        case 12:
                            if (!(req.method === 'DELETE')) return [3 /*break*/, 14];
                            return [4 /*yield*/, client.execute({ sql: 'DELETE FROM todos WHERE id=?', args: [body.id] })];
                        case 13:
                            _a.sent();
                            res.end('{}');
                            return [2 /*return*/];
                        case 14:
                            res.statusCode = 405;
                            res.end('{}');
                            return [3 /*break*/, 16];
                        case 15:
                            error_1 = _a.sent();
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: error_1 instanceof Error ? error_1.message : 'Unexpected error' }));
                            return [3 /*break*/, 16];
                        case 16: return [2 /*return*/];
                    }
                });
            }); });
        }
    };
}
export default defineConfig({
    plugins: [vue(), tursoApi(), VitePWA({ registerType: 'autoUpdate', includeAssets: ['icons/*.svg'], manifest: {
                name: 'Daymark', short_name: 'Daymark', description: 'A quiet daily rhythm for your recurring todos.', theme_color: '#f5f1e8', background_color: '#f5f1e8', display: 'standalone', start_url: '/', icons: [
                    { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }, { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
                ]
            } })]
});
