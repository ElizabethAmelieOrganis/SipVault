import type Database from "@tauri-apps/plugin-sql";

import { initializeTestRecordsTable } from "./testRecords";
import { initializeWaterAccountsTable } from "./waterAccounts";
import { initializeWaterIntakeTables } from "./waterIntake";

export const databaseModuleInitializers: Array<
  (database: Database) => Promise<void>
> = [
  initializeTestRecordsTable,
  initializeWaterAccountsTable,
  initializeWaterIntakeTables,
];

export * from "./testRecords";
export * from "./waterAccounts";
export * from "./waterIntake";
