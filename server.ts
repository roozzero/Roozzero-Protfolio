import path from "path";
import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createExpressApp } from "./server/app";
import { testConnection } from "./server/db/pool";
import { runMigrationsAndSeeds } from "./server/db/migrate";

// Load environment variables
dotenv.config();

const app = createExpressApp();
// Port 3000 & iFrame: Dev server must run on port 3000
const PORT = 3000;

async function startServer() {
  console.log("===================================================");
  console.log("[Server] Roozzero Academy Production Server Starting...");
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

  if (process.env.NODE_ENV !== "production") {
    let viteMiddleware: express.RequestHandler | null = null;
    const viteReady = createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      viteMiddleware = vite.middlewares;
      return vite;
    });

    app.use(async (req, res, next) => {
      try {
        if (!viteMiddleware) {
          await viteReady;
        }
        if (viteMiddleware) {
          return viteMiddleware(req, res, next);
        }
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 immediately so dev server readiness checks succeed without delay
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Academy listening on port ${PORT}`);
    console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
    console.log("===================================================");
  });

  // Test database connection and run migrations asynchronously in background
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log("[Server] Database connection established successfully.");
      await runMigrationsAndSeeds();
    } else {
      console.warn("[Server] Database connection could not be established.");
    }
  } catch (dbErr) {
    console.error("[Server Database Init Error]:", dbErr);
  }
}

startServer().catch((err) => {
  console.error("[Server Fatal Boot Error]:", err);
  process.exit(1);
});
