import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import path from "path";

// Import only when in dev mode
const devPlugins = [];
if (process.env.NODE_ENV !== "production") {
  const { default: reactDevTools } = require("vite-plugin-react-devtools");
  devPlugins.push(reactDevTools());
}

export default defineConfig({
  plugins: [react(), ...devPlugins],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@space-x/shared": fileURLToPath(new URL("../../shared", import.meta.url)),
    },
  },
  css: {
    postcss: path.resolve(__dirname, "../../postcss.config.js"),
  },
  // test: {
  //   globals: true,
  //   environment: "jsdom",
  //   setupFiles: ["./src/setupTests.ts"], // optional for testing-library
  //   include: ["src/**/*.{test,spec}.{ts,tsx}"],
  //   clearMocks: true,
  // },
});