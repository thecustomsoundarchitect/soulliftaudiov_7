import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config"; // Ensure this path is correct relative to server/
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false, // Vite config will be passed directly
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1); // Exit if Vite encounters an error
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // This path needs to be absolute from the project root.
      // Since index.html is now at the root, we resolve to it directly.
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..", // Go up from 'server/' to the project root
        "index.html", // Directly target index.html at the root
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // CORRECTED REPLACEMENT: Only add nanoid for cache busting,
      // the path itself should remain '/src/main.tsx' relative to Vite's root (which is 'client')
      // OR, if Vite's root is '.', then '/client/src/main.tsx'
      // Given Bolt AI's diagnosis, it implies Vite's root is 'client'.
      // So, the script tag in index.html should say /src/main.tsx (relative to client)
      // and this replacement just adds the ?v=nanoid() for cache busting.
      template = template.replace(
        `src="/src/main.tsx"`, // Original script src in index.html
        `src="/src/main.tsx?v=${nanoid()}"`, // Corrected replacement, adding version for cache busting
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Corrected path to serve static assets from the 'dist' folder at the root
  const distPath = path.resolve(import.meta.dirname, "..", "dist"); // Go up from 'server/' to root, then into 'dist'

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
