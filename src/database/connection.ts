import Database from "@tauri-apps/plugin-sql";
import { isTauri } from "@tauri-apps/api/core";

export const DATABASE_PATH = "sqlite:sipvault.db";

let databasePromise: Promise<Database> | null = null;

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
    databasePromise = Database.load(DATABASE_PATH);
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
