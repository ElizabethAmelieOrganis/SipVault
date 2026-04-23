import { createApp } from "vue";
import App from "./App.vue";
import { canUseDatabase, initializeDatabase } from "./database";
import router from "./router";

async function bootstrap() {
  if (canUseDatabase()) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Failed to initialize database", error);
    }
  } else {
    console.info("Skipping database initialization outside the Tauri runtime.");
  }

  createApp(App).use(router).mount("#app");
}

void bootstrap();
