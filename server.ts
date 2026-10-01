import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createExpressApp } from "./server/app";
import { testConnection } from "./server/db/pool";
import { runMigrationsAndSeeds } from "./server/db/migrate";

// Load environment variables
dotenv.config();

// Ensure local MySQL/MariaDB service is running if present
try {
  if (fs.existsSync("/usr/bin/mysqld_safe") || fs.existsSync("/usr/sbin/mysqld")) {
    execSync("pgrep -x mysqld > /dev/null || pgrep -x mariadbd > /dev/null || (/usr/bin/mysqld_safe --user=mysql --nowatch 2>&1 & sleep 2)");
  }
} catch {}

const app = createExpressApp();
// Port 3000 & iFrame: Dev server must run on port 3000
const PORT = 3000;

async function startServer() {
  console.log("===================================================");
  console.log("[Server] Roozzero Academy Production Server Starting...");
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

  // Test database connection and run migrations
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log("[Server] Database connection established successfully.");
    await runMigrationsAndSeeds();
  } else {
    console.warn("[Server] Database connection could not be established.");
  }

  // Vite development middleware vs production static distribution
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Academy listening on port ${PORT}`);
    console.log(`[Server] Health check available at: http://localhost:${PORT}/api/health`);
    console.log("===================================================");
  });
}

startServer().catch((err) => {
  console.error("[Server Fatal Boot Error]:", err);
  process.exit(1);
});
