// vite.config.ts (located at the project root)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal"; // Comment out if causing issues, or use if confirmed stable

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay(), // Re-enable if desired and stable, after core app is running
    // ...(process.env.NODE_ENV !== "production" &&
    // process.env.REPL_ID !== undefined
    //   ? [
    //         await import("@replit/vite-plugin-cartographer").then((m) =>
    //           m.cartographer(),
    //         ),
    //     ]
    //   : []),
  ],
  resolve: {
    alias: {
      // Alias '@' now correctly points to 'client/src' relative to the client root
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "shared"), // Use __dirname for consistency
      "@assets": path.resolve(__dirname, "attached_assets"), // Use __dirname for consistency
    }
  },
  // CRUCIAL FIX: Vite's root is explicitly set to the 'client' directory.
  // This means all paths in index.html and client-side code are relative to 'client/'
  root: path.resolve(__dirname, "client"),

  // Public directory is relative to the Vite root. If index.html is in 'client',
  // then publicDir should also be the client folder.
  publicDir: path.resolve(__dirname, "client"),

  build: {
    // Output build files to 'dist' at the project root, outside of the client folder
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    // IMPORTANT: For Replit, use the specific Replit proxy setup for 'fs' or 'proxy'
    // This is from your previous vite.config.ts
    // If your backend is running on port 5000 in Replit, this should be correct.
    proxy: {
        '/api': 'http://localhost:5000' // Ensure this matches your backend port
    },
    // The 'fs' deny might be overly restrictive for some Replit setups, commenting for now
    // fs: {
    //   deny: ["**/.*"],
    // },
  },
});
