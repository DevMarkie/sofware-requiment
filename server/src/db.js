import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbFile = path.join(process.cwd(), 'server', 'data.sqlite');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const db = new Database(dbFile);

db.pragma('journal_mode = WAL');
