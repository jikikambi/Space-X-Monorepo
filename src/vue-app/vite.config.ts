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

      //"@": fileURLToPath(new URL("./src", import.meta.url)),
      //"@space-x/shared/logger": fileURLToPath(new URL("../../shared/utils/logger.ts", import.meta.url)),
      //"@space-x/shared/Launch": fileURLToPath(new URL("../../shared/types/Launch.ts", import.meta.url)),
      // "@space-x/shared/Launchpad": fileURLToPath(new URL("../../shared/types/Launchpad.ts", import.meta.url)),
      // "@space-x/shared/Rocket": fileURLToPath(new URL("../../shared/types/Rocket.ts", import.meta.url)),
      // "@space-x/shared/Ship": fileURLToPath(new URL("../../shared/types/Ship.ts", import.meta.url)),
      // "@space-x/shared/Payload": fileURLToPath(new URL("../../shared/types/Payload.ts", import.meta.url)),
    }
  }
});