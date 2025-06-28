import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  root: "./client",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"), // Keep client/src aliased to @
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
    outDir: "../dist/public",
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: "dist/public", // Ensure this is correct for your build output
    emptyOutDir: true,
  },
  server: {
    fs: {
      "/api": "http://localhost:5000", // Or your backend port
      deny: ["**/.*"],
    },
  },
});
