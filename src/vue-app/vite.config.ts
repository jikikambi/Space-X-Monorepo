import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@space-x/shared/logger": path.resolve(__dirname, "../../shared/utils/logger.ts"),
      "@space-x/shared/Launch": path.resolve(__dirname, "../../shared/types/Launch.ts")
    }
  }
});