import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const schema = readFileSync(schemaPath, 'utf8');
const databaseDirectory = dirname(fileURLToPath(import.meta.url));

export const defaultDatabasePath = join(databaseDirectory, '../../taskflow.db');

export function createDatabase(filename = ':memory:') {
  const database = new Database(filename);

  database.pragma('foreign_keys = ON');
  database.exec(schema);

  return database;
}