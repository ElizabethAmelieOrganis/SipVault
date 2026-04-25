import type Database from "@tauri-apps/plugin-sql";

import { getDatabase } from "../connection";

export type WaterAccountContainer =
  | "plastic-bottle"
  | "can"
  | "cup"
  | "other";

export interface WaterAccountRecord {
  id: string;
  container: WaterAccountContainer;
  brand: string;
  initialWaterMl: number;
  remainingWaterMl: number;
  location: string;
  startTimeHours: number;
  createdAt: string;
}

export interface CreateWaterAccountInput {
  id: string;
  container: WaterAccountContainer;
  brand: string;
  initialWaterMl: number;
  remainingWaterMl: number;
  location: string;
  startTimeHours: number;
  createdAt?: string;
}

export interface UpdateWaterAccountInput {
  container?: WaterAccountContainer;
  brand?: string;
  initialWaterMl?: number;
  remainingWaterMl?: number;
  location?: string;
  startTimeHours?: number;
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

export async function initializeWaterAccountsTable(
  database: Database,
): Promise<void> {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS water_accounts (
      id TEXT PRIMARY KEY,
      container TEXT NOT NULL,
      brand TEXT NOT NULL,
      initial_water_ml INTEGER NOT NULL,
      remaining_water_ml INTEGER NOT NULL,
      location TEXT NOT NULL,
      start_time_hours INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function listWaterAccounts(): Promise<WaterAccountRecord[]> {
  const database = await getDatabase();
  const rows = await database.select<WaterAccountRow[]>(
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
      ORDER BY datetime(created_at) DESC, id DESC
    `,
  );

  return rows.map(mapWaterAccountRow);
}

export async function createWaterAccount(
  input: CreateWaterAccountInput,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    `
      INSERT INTO water_accounts (
        id,
        container,
        brand,
        initial_water_ml,
        remaining_water_ml,
        location,
        start_time_hours,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      input.id,
      input.container,
      input.brand,
      input.initialWaterMl,
      input.remainingWaterMl,
      input.location,
      input.startTimeHours,
      input.createdAt ?? new Date().toISOString(),
    ],
  );

  return result.rowsAffected > 0;
}

export async function updateWaterAccount(
  id: string,
  input: UpdateWaterAccountInput,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    `
      UPDATE water_accounts
      SET
        container = $1,
        brand = $2,
        initial_water_ml = $3,
        remaining_water_ml = $4,
        location = $5,
        start_time_hours = $6
      WHERE id = $7
    `,
    [
      input.container,
      input.brand,
      input.initialWaterMl,
      input.remainingWaterMl,
      input.location,
      input.startTimeHours,
      id,
    ],
  );

  return result.rowsAffected > 0;
}

export async function deleteWaterAccount(id: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.execute(
    "DELETE FROM water_accounts WHERE id = $1",
    [id],
  );

  return result.rowsAffected > 0;
}
