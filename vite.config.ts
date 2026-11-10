import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://tauri.app/v1/guides/features/configuration
export default defineConfig(async () => ({
  plugins: [react()],

  // Vite options tailored for Tauri development
  clearScreen: false,

  // Tauri expects a fixed port, fail when that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. note that the files added to the file watcher need to be watched via chokidar to work with Tauri
      // 4. add ignoreFirst: true to make it work
      ignored: ["**/src-tauri/**"],
      add: true,
      ignoreInitial: true,
    },
    ...(host
      ? {
          strictPort: true,
          host: host,
        }
      : {}),
  },
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: host ? "es2021" : "es2021",
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // Print out md5 hashes
    outDir: "dist",
    rollupOptions: {
      output: [
        {
          format: "iife",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
