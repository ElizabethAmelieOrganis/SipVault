import { closeDatabase, getDatabase } from "./connection";
import { databaseModuleInitializers } from "./modules";

export * from "./connection";
export * from "./modules";

export async function initializeDatabase() {
  const database = await getDatabase();

  for (const initializeModule of databaseModuleInitializers) {
    await initializeModule(database);
  }

  return database;
}

export { closeDatabase };
