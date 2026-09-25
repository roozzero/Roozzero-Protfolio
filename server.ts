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
// Support cPanel Passenger / Cloud dynamic assigned PORT
const PORT = parseInt(process.env.PORT || "3000", 10);

async function startServer() {
  console.log("===================================================");
  console.log("[Server] Roozzero Academy Production Server Starting...");
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);

  // Test MySQL connection and run migrations
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log("[Server] MySQL Connection established successfully.");
    await runMigrationsAndSeeds();
  } else {
    console.warn("[Server] MySQL connection not active. App will run in standby mode.");
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
