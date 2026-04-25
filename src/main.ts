import { createApp } from "vue";
import App from "./App.vue";
import "@styles/index.css";
import { canUseDatabase, initializeDatabase } from "./database";
import { setDatabaseStatus } from "./database/status";
import router from "./router";

async function bootstrap() {
  if (canUseDatabase()) {
    try {
      await initializeDatabase();
      setDatabaseStatus("connected");
    } catch (error) {
      setDatabaseStatus("disconnected");
      console.error("Failed to initialize database", error);
    }
  } else {
    setDatabaseStatus("unsupported");
    console.info("Skipping database initialization outside the Tauri runtime.");
  }

  createApp(App).use(router).mount("#app");
}

void bootstrap();
