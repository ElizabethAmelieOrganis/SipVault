import type Database from "@tauri-apps/plugin-sql";

import { initializeTestRecordsTable } from "./testRecords";
import { initializeWaterAccountsTable } from "./waterAccounts";

export const databaseModuleInitializers: Array<
  (database: Database) => Promise<void>
> = [initializeTestRecordsTable, initializeWaterAccountsTable];

export * from "./testRecords";
export * from "./waterAccounts";
