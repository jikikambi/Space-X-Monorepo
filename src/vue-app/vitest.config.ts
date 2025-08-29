import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "node:path";

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),      
      "@space-x/shared": fileURLToPath(new URL("../../shared", import.meta.url)),
    },
  },
  css: {
    postcss: path.resolve(__dirname, "../../postcss.config.js"), 
  },
});


