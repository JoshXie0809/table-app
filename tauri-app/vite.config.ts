import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { env } from "process";

const host = env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // 要讓 lit 運作
  esbuild: {
    target: 'es2022', // ✅ Lit 建議 target，支援 class fields + decorator
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sql: resolve(__dirname, 'src/windows/sql/sql.html'),
        editor: resolve(__dirname, 'src/windows/editor/editor.thml')
      }
    }
  }
}));
