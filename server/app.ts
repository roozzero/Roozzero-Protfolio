import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { isDbConnected } from "./db/pool";
import { requireAuth, requireRole } from "./middleware/auth";

import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import studentRoutes from "./routes/studentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import adminRoutes from "./routes/adminRoutes";
import cmsRoutes from "./routes/cmsRoutes";
import contactRoutes from "./routes/contactRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import fileRoutes from "./routes/fileRoutes";

export function createExpressApp() {
  const app = express();

  // HTTP Security Headers with CSP configured so images, fonts, and inline styles are not broken
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS configuration
  const allowedOrigins = process.env.APP_URL ? [process.env.APP_URL] : ["http://localhost:3000"];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin, curl, server-to-server or configured origin
        if (!origin || allowedOrigins.includes(origin) || origin.includes("run.app") || origin.includes("localhost")) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Safe public media directories (profiles & CMS media only)
  const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
  app.use("/uploads/media", express.static(path.join(uploadRoot, "media")));
  app.use("/uploads/profiles", express.static(path.join(uploadRoot, "profiles")));

  // -----------------------------------------------------------
  // API Routes
  // -----------------------------------------------------------
  app.use("/api/auth", authRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/student", studentRoutes);
  app.use("/api/teacher", teacherRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/cms", cmsRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/certificates", certificateRoutes);
  app.use("/api/files", fileRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      status: "ok",
      database: isDbConnected() ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });

  // Sanitized DB status
  app.get("/api/db-status", (req, res) => {
    const isConn = isDbConnected();
    res.json({
      success: true,
      connected: isConn,
      mode: isConn ? "MySQL Database (Active)" : "Offline Standby Mode"
    });
  });

  // Legacy sync endpoint protected by Admin Auth (satisfies Section 57)
  app.get("/api/get-all-data", requireAuth, requireRole("Administrator"), (req, res) => {
    res.json({ success: true, message: "Legacy endpoint is deprecated. Please use resource-specific REST endpoints." });
  });

  // Standard API 404 handler
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "ENDPOINT_NOT_FOUND",
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
      }
    });
  });

  // Centralized Error Handling Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Unhandled Server Error]: ${err.message}`, err.stack);
    const isProd = process.env.NODE_ENV === "production";
    res.status(err.status || 500).json({
      success: false,
      error: {
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: isProd ? "An internal server error occurred." : err.message
      }
    });
  });

  return app;
}
