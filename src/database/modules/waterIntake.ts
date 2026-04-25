import type Database from "@tauri-apps/plugin-sql";

import { getDatabase } from "../connection";
import type {
  WaterAccountContainer,
  WaterAccountRecord,
} from "./waterAccounts";

export type WaterIntakeMode = "exact" | "estimated";

export interface DailyWaterGoalRecord {
  goalDate: string;
  targetMl: number;
  updatedAt: string;
}

export interface WaterIntakeRecord {
  id: string;
  recordDate: string;
  accountId: string;
  accountBrand: string;
  accountContainer: WaterAccountContainer;
  consumedMl: number;
  mode: WaterIntakeMode;
  note: string | null;
  occurredAt: string;
  sourceRemainingBeforeMl: number;
  sourceRemainingAfterMl: number;
}

export interface SaveDailyWaterGoalInput {
  goalDate: string;
  targetMl: number;
}

export interface RecordWaterIntakeInput {
  id: string;
  recordDate: string;
  accountId: string;
  requestedConsumedMl: number;
  mode: WaterIntakeMode;
  note?: string | null;
  occurredAt?: string;
}

export interface RecordWaterIntakeResult {
  record: WaterIntakeRecord;
  updatedAccount: WaterAccountRecord;
}

interface DailyWaterGoalRow {
  goal_date: string;
  target_ml: number;
  updated_at: string;
}

interface WaterIntakeRow {
  id: string;
  record_date: string;
  account_id: string;
  account_brand: string;
  account_container: WaterAccountContainer;
  consumed_ml: number;
  mode: WaterIntakeMode;
  note: string | null;
  occurred_at: string;
  source_remaining_before_ml: number;
  source_remaining_after_ml: number;
}

interface WaterAccountRow {
  id: string;
  container: WaterAccountContainer;
  brand: string;
  initial_water_ml: number;
  remaining_water_ml: number;
  location: string;
  start_time_hours: number;
  created_at: string;
}

function mapDailyWaterGoalRow(row: DailyWaterGoalRow): DailyWaterGoalRecord {
  return {
    goalDate: row.goal_date,
    targetMl: row.target_ml,
    updatedAt: row.updated_at,
  };
}

function mapWaterIntakeRow(row: WaterIntakeRow): WaterIntakeRecord {
  return {
    id: row.id,
    recordDate: row.record_date,
    accountId: row.account_id,
    accountBrand: row.account_brand,
    accountContainer: row.account_container,
    consumedMl: row.consumed_ml,
    mode: row.mode,
    note: row.note,
    occurredAt: row.occurred_at,
    sourceRemainingBeforeMl: row.source_remaining_before_ml,
    sourceRemainingAfterMl: row.source_remaining_after_ml,
  };
}

function mapWaterAccountRow(row: WaterAccountRow): WaterAccountRecord {
  return {
    id: row.id,
    container: row.container,
    brand: row.brand,
    initialWaterMl: row.initial_water_ml,
    remainingWaterMl: row.remaining_water_ml,
    location: row.location,
    startTimeHours: row.start_time_hours,
    createdAt: row.created_at,
  };
}

function normalizeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
}

async function rollbackTransaction(database: Database): Promise<void> {
  try {
    await database.execute("ROLLBACK");
  } catch {
    // Ignore rollback failures after a failed transaction step.
  }
}

export async function initializeWaterIntakeTables(
  database: Database,
): Promise<void> {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS water_daily_goals (
      goal_date TEXT PRIMARY KEY,
      target_ml INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS water_intake_records (
      id TEXT PRIMARY KEY,
      record_date TEXT NOT NULL,
      account_id TEXT NOT NULL,
      account_brand TEXT NOT NULL,
      account_container TEXT NOT NULL,
      consumed_ml INTEGER NOT NULL,
      mode TEXT NOT NULL,
      note TEXT,
      occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      source_remaining_before_ml INTEGER NOT NULL,
      source_remaining_after_ml INTEGER NOT NULL
    )
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_water_intake_records_record_date
    ON water_intake_records (record_date, occurred_at DESC)
  `);
}

export async function getDailyWaterGoal(
  goalDate: string,
): Promise<DailyWaterGoalRecord | null> {
  const database = await getDatabase();
  const rows = await database.select<DailyWaterGoalRow[]>(
    `
      SELECT
        goal_date,
        target_ml,
        updated_at
      FROM water_daily_goals
      WHERE goal_date = $1
      LIMIT 1
    `,
    [goalDate],
  );

  return rows[0] ? mapDailyWaterGoalRow(rows[0]) : null;
}

export async function saveDailyWaterGoal(
  input: SaveDailyWaterGoalInput,
): Promise<DailyWaterGoalRecord> {
  const database = await getDatabase();
  const targetMl = normalizeInteger(input.targetMl);

  await database.execute(
    `
      INSERT INTO water_daily_goals (
        goal_date,
        target_ml,
        updated_at
      )
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT(goal_date) DO UPDATE SET
        target_ml = excluded.target_ml,
        updated_at = CURRENT_TIMESTAMP
    `,
    [input.goalDate, targetMl],
  );

  return {
    goalDate: input.goalDate,
    targetMl,
    updatedAt: new Date().toISOString(),
  };
}

export async function listWaterIntakeRecordsByDate(
  recordDate: string,
): Promise<WaterIntakeRecord[]> {
  const database = await getDatabase();
  const rows = await database.select<WaterIntakeRow[]>(
    `
      SELECT
        id,
        record_date,
        account_id,
        account_brand,
        account_container,
        consumed_ml,
        mode,
        note,
        occurred_at,
        source_remaining_before_ml,
        source_remaining_after_ml
      FROM water_intake_records
      WHERE record_date = $1
      ORDER BY datetime(occurred_at) DESC, id DESC
    `,
    [recordDate],
  );

  return rows.map(mapWaterIntakeRow);
}

export async function recordWaterIntake(
  input: RecordWaterIntakeInput,
): Promise<RecordWaterIntakeResult> {
  const database = await getDatabase();
  const accountRows = await database.select<WaterAccountRow[]>(
    `
      SELECT
        id,
        container,
        brand,
        initial_water_ml,
        remaining_water_ml,
        location,
        start_time_hours,
        created_at
      FROM water_accounts
      WHERE id = $1
      LIMIT 1
    `,
    [input.accountId],
  );

  const accountRow = accountRows[0];

  if (!accountRow) {
    throw new Error("The selected water source could not be found.");
  }

  const sourceRemainingBeforeMl = normalizeInteger(accountRow.remaining_water_ml);
  const requestedConsumedMl = normalizeInteger(input.requestedConsumedMl);
  const consumedMl = Math.min(requestedConsumedMl, sourceRemainingBeforeMl);

  if (consumedMl <= 0) {
    throw new Error("The selected source does not have any water left to record.");
  }

  const sourceRemainingAfterMl = sourceRemainingBeforeMl - consumedMl;
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const note = input.note?.trim() ? input.note.trim() : null;

  await database.execute("BEGIN TRANSACTION");

  try {
    await database.execute(
      `
        UPDATE water_accounts
        SET remaining_water_ml = $1
        WHERE id = $2
      `,
      [sourceRemainingAfterMl, input.accountId],
    );

    await database.execute(
      `
        INSERT INTO water_intake_records (
          id,
          record_date,
          account_id,
          account_brand,
          account_container,
          consumed_ml,
          mode,
          note,
          occurred_at,
          source_remaining_before_ml,
          source_remaining_after_ml
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        input.id,
        input.recordDate,
        input.accountId,
        accountRow.brand,
        accountRow.container,
        consumedMl,
        input.mode,
        note,
        occurredAt,
        sourceRemainingBeforeMl,
        sourceRemainingAfterMl,
      ],
    );

    await database.execute("COMMIT");
  } catch (error) {
    await rollbackTransaction(database);
    throw error;
  }

  return {
    record: {
      id: input.id,
      recordDate: input.recordDate,
      accountId: input.accountId,
      accountBrand: accountRow.brand,
      accountContainer: accountRow.container,
      consumedMl,
      mode: input.mode,
      note,
      occurredAt,
      sourceRemainingBeforeMl,
      sourceRemainingAfterMl,
    },
    updatedAccount: mapWaterAccountRow({
      ...accountRow,
      remaining_water_ml: sourceRemainingAfterMl,
    }),
  };
}
