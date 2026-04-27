import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const createUniPlugin =
  typeof uni === "function"
    ? uni
    : (uni as unknown as { default: typeof uni }).default;

export default defineConfig({
  plugins: [createUniPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
});
