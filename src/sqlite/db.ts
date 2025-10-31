import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import localforage from 'localforage';
// Vite will resolve this to a URL string for the wasm asset
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const STORE_KEY = 'um_sqlite_db_v1';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

async function loadSQL() {
  if (SQL) return SQL;
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
  return SQL;
}

export async function getDB() {
  if (db) return db;
  await loadSQL();
  const raw = await localforage.getItem<ArrayBuffer>(STORE_KEY);
  db = raw && SQL ? new SQL.Database(new Uint8Array(raw)) : new (SQL as SqlJsStatic).Database();
  // Ensure schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      gender TEXT,
      password TEXT
    );
  `);
  // One-time migration from legacy localStorage if present
  let count = db.exec('SELECT COUNT(1) FROM users')[0]?.values?.[0]?.[0] as number | undefined;
  if (!count) {
    try {
      const legacy = localStorage.getItem('users');
      if (legacy) {
        const arr = JSON.parse(legacy) as Array<{ id?: number; name: string; email: string; gender?: string; password?: string }>;
        const insert = db.prepare('INSERT INTO users (name, email, gender, password) VALUES (?, ?, ?, ?)');
        for (const u of arr) {
          insert.run([u.name, u.email, u.gender ?? null, u.password ?? null]);
        }
        insert.free();
        await persist();
      }
    } catch {
      // ignore
    }
  }
  // If still empty after migration, seed a demo user for first-run access
  count = db.exec('SELECT COUNT(1) FROM users')[0]?.values?.[0]?.[0] as number | undefined;
  if (!count) {
    const seed = db.prepare('INSERT INTO users (name, email, gender, password) VALUES (?, ?, ?, ?)');
    seed.run(['Demo User', 'demo@user.test', 'male', 'demo123']);
    seed.free();
    await persist();
  }
  return db;
}

export async function persist() {
  if (!db) return;
  const data = db.export();
  await localforage.setItem(STORE_KEY, data);
}

export type SqlUser = {
  id: number;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  password?: string;
};

export const sqliteUsers = {
  async list(): Promise<SqlUser[]> {
    const d = await getDB();
    const res = d.exec('SELECT id, name, email, gender FROM users ORDER BY id ASC');
    const rows = res[0]?.values || [];
    return rows.map((r: any[]) => ({ id: r[0] as number, name: r[1] as string, email: r[2] as string, gender: (r[3] as any) || undefined }));
  },
  async create(payload: Omit<SqlUser, 'id'>): Promise<SqlUser> {
    const d = await getDB();
    const stmt = d.prepare('INSERT INTO users (name, email, gender, password) VALUES (?, ?, ?, ?)');
    stmt.run([payload.name, payload.email, payload.gender ?? null, payload.password ?? null]);
    stmt.free();
    const idRes = d.exec('SELECT last_insert_rowid() as id');
    const id = (idRes[0].values[0][0] as number) || 0;
    await persist();
    return { id, name: payload.name, email: payload.email, gender: payload.gender };
  },
  async update(id: number, patch: Partial<Omit<SqlUser, 'id'>>): Promise<SqlUser> {
    const d = await getDB();
    // Read existing
    const curStmt = d.prepare('SELECT id, name, email, gender, password FROM users WHERE id = ? LIMIT 1');
    curStmt.bind([id]);
    const curRows: any[] = [];
    while (curStmt.step()) curRows.push(curStmt.get());
    curStmt.free();
    if (!curRows.length) throw new Error('User not found');
    const cur = curRows[0];
    const name = (patch.name ?? (cur[1] as string)) as string;
    const email = (patch.email ?? (cur[2] as string)) as string;
    const gender = (patch.gender ?? (cur[3] as string | null)) ?? null;
    const password = (patch.password ?? (cur[4] as string | null)) ?? null;
    const stmt = d.prepare('UPDATE users SET name = ?, email = ?, gender = ?, password = ? WHERE id = ?');
    stmt.run([name, email, gender, password, id]);
    stmt.free();
    await persist();
    return { id, name, email, gender: (gender as any) || undefined };
  },
  async remove(id: number): Promise<void> {
    const d = await getDB();
    const stmt = d.prepare('DELETE FROM users WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    await persist();
  },
  async findByEmail(email: string): Promise<SqlUser | null> {
    const d = await getDB();
    const stmt = d.prepare('SELECT id, name, email, gender FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1');
    stmt.bind([email]);
    const rows: any[] = [];
    while (stmt.step()) rows.push(stmt.get());
    stmt.free();
    const row = rows[0];
    if (!row) return null;
    return { id: row[0] as number, name: row[1] as string, email: row[2] as string, gender: (row[3] as any) || undefined };
  },
  async findForLogin(email: string, password: string): Promise<SqlUser | null> {
    const d = await getDB();
    const stmt = d.prepare('SELECT id, name, email, gender FROM users WHERE LOWER(email) = LOWER(?) AND password = ? LIMIT 1');
    stmt.bind([email, password]);
    const rows: any[] = [];
    while (stmt.step()) rows.push(stmt.get());
    stmt.free();
    const row = rows[0];
    if (!row) return null;
    return { id: row[0] as number, name: row[1] as string, email: row[2] as string, gender: (row[3] as any) || undefined };
  },
};
