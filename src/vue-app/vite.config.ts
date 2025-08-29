import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@space-x/shared/logger": path.resolve(__dirname, "../../shared/utils/logger.ts"),
      "@space-x/shared/Launch": path.resolve(__dirname, "../../shared/types/Launch.ts"),
      "@space-x/shared/Launchpad": path.resolve(__dirname, "../../shared/types/Launchpad.ts"),
      "@space-x/shared/Rocket": path.resolve(__dirname, "../../shared/types/Rocket.ts"),
      "@space-x/shared/Ship": path.resolve(__dirname, "../../shared/types/Ship.ts"),
      "@space-x/shared/Payload": path.resolve(__dirname, "../../shared/types/Payload.ts")
    }
  }
});