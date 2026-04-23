import Database from "@tauri-apps/plugin-sql";

export const DATABASE_PATH = "sqlite:sipvault.db";

let databasePromise: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
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
