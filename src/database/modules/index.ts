import type Database from "@tauri-apps/plugin-sql";

import { initializeTestRecordsTable } from "./testRecords";

export const databaseModuleInitializers: Array<
  (database: Database) => Promise<void>
> = [initializeTestRecordsTable];

export * from "./testRecords";
