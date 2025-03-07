/* eslint-disable import/no-extraneous-dependencies */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fs from "fs";
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
// IMP START - Bundler Issues
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      crypto: "empty-module",
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    target: "esnext",
  },
  // IMP END - Bundler Issues
  server: {
    host: "0.0.0.0",  // ✅ Allows external access
    port: 5174,       // ✅ Use your desired port (not 5173)
    strictPort: true, // ✅ Ensures it doesn't switch ports
    allowedHosts: ["wfounders.club"],
    https: {
      key: fs.readFileSync("devSSL/key.pem"),
      cert: fs.readFileSync("devSSL/cert.pem"),
    },
  },
});
