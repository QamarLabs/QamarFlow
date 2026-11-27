import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Db = Database.Database;
const here = path.dirname(fileURLToPath(import.meta.url));

/** Opens (creating if needed) the SQLite file and applies schema.sql (idempotent). */
export function openDatabase(file: string): Db {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new Database(file);
  migrate(db);
  return db;
}

export function migrate(db: Db): void {
  db.exec(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));
  db.pragma('foreign_keys = ON');
}
