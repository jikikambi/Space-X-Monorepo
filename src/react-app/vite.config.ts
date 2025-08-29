import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@space-x/shared/logger": path.resolve(__dirname, "../../shared/utils/logger.ts"),
      "@space-x/shared/Launch": path.resolve(__dirname, "../../shared/types/Launch.ts"),
      "@space-x/shared/Launchpad": path.resolve(__dirname, "../../shared/types/Launchpad.ts"),
      "@space-x/shared/Rocket": path.resolve(__dirname, "../../shared/types/Rocket.ts"),
      "@space-x/shared/Ship": path.resolve(__dirname, "../../shared/types/Ship.ts"),
      "@space-x/shared/Payload": path.resolve(__dirname, "../../shared/types/Payload.ts")
    },
  },
});
