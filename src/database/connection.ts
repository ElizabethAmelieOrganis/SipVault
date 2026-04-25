import Database from "@tauri-apps/plugin-sql";
import { isTauri } from "@tauri-apps/api/core";

export const DATABASE_PATH = "sqlite:sipvault.db";

let databasePromise: Promise<Database> | null = null;

async function configureDatabase(database: Database): Promise<Database> {
  await database.execute("PRAGMA journal_mode = WAL");
  await database.execute("PRAGMA busy_timeout = 5000");
  await database.execute("PRAGMA foreign_keys = ON");
  return database;
}

export function canUseDatabase(): boolean {
  return isTauri();
}

export function getDatabase(): Promise<Database> {
  if (!canUseDatabase()) {
    return Promise.reject(
      new Error("The Tauri SQL plugin is only available inside the Tauri runtime."),
    );
  }

  if (!databasePromise) {
    databasePromise = Database.load(DATABASE_PATH).then(configureDatabase);
  }

  return databasePromise;
}

export async function closeDatabase(): Promise<boolean> {
  if (!databasePromise) {
    return true;
  }

  const database = await databasePromise;
  databasePromise = null;

  return database.close(DATABASE_PATH);
}
