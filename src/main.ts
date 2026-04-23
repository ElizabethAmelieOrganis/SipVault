import { createApp } from "vue";
import App from "./App.vue";
import { initializeDatabase } from "./database";

async function bootstrap() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database", error);
  }

  createApp(App).mount("#app");
}

void bootstrap();
