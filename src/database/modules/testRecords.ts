import type Database from "@tauri-apps/plugin-sql";

import { getDatabase } from "../connection";

export interface TestRecord {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTestRecordInput {
  title: string;
  content?: string | null;
}

export interface UpdateTestRecordInput {
  title?: string;
  content?: string | null;
}

export async function initializeTestRecordsTable(
  database: Database,
): Promise<void> {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS test_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function listTestRecords(): Promise<TestRecord[]> {
  const database = await getDatabase();

  return database.select<TestRecord[]>(
    `
      SELECT
        id,
        title,
        content,
        created_at,
        updated_at
      FROM test_records
      ORDER BY created_at DESC, id DESC
    `,
  );
}

export async function getTestRecordById(
  id: number,
): Promise<TestRecord | null> {
  const database = await getDatabase();
  const result = await database.select<TestRecord[]>(
    `
      SELECT
        id,
        title,
        content,
        created_at,
        updated_at
      FROM test_records
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result[0] ?? null;
}

export async function createTestRecord(
  input: CreateTestRecordInput,
): Promise<number | null> {
  const database = await getDatabase();
  const result = await database.execute(
    `
      INSERT INTO test_records (
        title,
        content,
        updated_at
      )
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `,
    [
      input.title,
      input.content ?? null,
    ],
  );

  return result.lastInsertId ?? null;
}

export async function updateTestRecord(
  id: number,
  input: UpdateTestRecordInput,
): Promise<boolean> {
  const current = await getTestRecordById(id);

  if (!current) {
    return false;
  }

  const database = await getDatabase();
  const result = await database.execute(
    `
      UPDATE test_records
      SET
        title = $1,
        content = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `,
    [
      input.title ?? current.title,
      input.content ?? current.content,
      id,
    ],
  );

  return result.rowsAffected > 0;
}

export async function deleteTestRecord(id: number): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "DELETE FROM test_records WHERE id = $1",
    [id],
  );

  return result.rowsAffected > 0;
}
