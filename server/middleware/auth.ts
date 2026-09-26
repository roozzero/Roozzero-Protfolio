import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { query } from "../db/pool";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  roleId: number;
  roleName: "Administrator" | "Teacher" | "Student" | string;
  status: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  titlePrefix?: string;
  specialization?: string;
  bio?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}

export const SESSION_COOKIE_NAME = "academy_session";

export async function createSession(
  userId: string,
  req: Request,
  res: Response,
  rememberMe: boolean = false
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const days = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "unknown";

  try {
    await query(
      `INSERT INTO sessions_tokens (user_id, session_token, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, token, ipAddress.slice(0, 45), userAgent.slice(0, 255), expiresAt]
    );

    // Set HttpOnly cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      expires: expiresAt,
      path: "/"
    });

    return token;
  } catch (err: any) {
    console.error(`[Session Error] Failed to create session: ${err.message}`);
    throw err;
  }
}

export async function destroySession(sessionToken: string, res: Response): Promise<void> {
  try {
    await query("DELETE FROM sessions_tokens WHERE session_token = ?", [sessionToken]);
  } catch (err: any) {
    console.warn(`[Session Warning] Failed to delete session token from DB: ${err.message}`);
  }

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/"
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[SESSION_COOKIE_NAME];

  // Also support Authorization header Bearer token
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required. Please sign in to access this resource."
      }
    });
  }

  try {
    const [rows]: [any[], any] = await query(
      `SELECT s.session_token, s.expires_at,
              u.id, u.username, u.email, u.name, u.avatar_url, u.phone, u.department,
              u.title_prefix, u.specialization, u.bio, u.status, u.role_id,
              r.name as role_name
       FROM sessions_tokens s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN roles r ON u.role_id = r.id
       WHERE s.session_token = ? AND s.expires_at > NOW() AND u.deleted_at IS NULL`,
      [token]
    );

    if (!rows || rows.length === 0) {
      // Invalidate stale cookie
      res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
      return res.status(401).json({
        success: false,
        error: {
          code: "SESSION_EXPIRED",
          message: "Your session has expired. Please log in again."
        }
      });
    }

    const row = rows[0];
    if (row.status === "Suspended") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_SUSPENDED",
          message: "Your account has been suspended. Please contact academy administration."
        }
      });
    }

    req.sessionToken = token;
    req.user = {
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      roleId: row.role_id,
      roleName: row.role_name,
      status: row.status,
      avatarUrl: row.avatar_url,
      phone: row.phone,
      department: row.department,
      titlePrefix: row.title_prefix,
      specialization: row.specialization,
      bio: row.bio
    };

    next();
  } catch (err: any) {
    console.error(`[Auth Middleware Error]: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to verify authentication."
      }
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." }
      });
    }

    // Role aliases (e.g. Administrator or admin, Teacher or teacher)
    const userRole = req.user.roleName.toLowerCase();
    const hasRole = allowedRoles.some(
      r => r.toLowerCase() === userRole || (r.toLowerCase() === "admin" && userRole === "administrator")
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied. Requires one of: [${allowedRoles.join(", ")}].`
        }
      });
    }

    next();
  };
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return next();
  }

  try {
    const [rows]: [any[], any] = await query(
      `SELECT s.session_token, s.expires_at,
              u.id, u.username, u.email, u.name, u.avatar_url, u.phone, u.department,
              u.title_prefix, u.specialization, u.bio, u.status, u.role_id,
              r.name as role_name
       FROM sessions_tokens s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN roles r ON u.role_id = r.id
       WHERE s.session_token = ? AND s.expires_at > NOW() AND u.deleted_at IS NULL`,
      [token]
    );

    if (rows && rows.length > 0 && rows[0].status !== "Suspended") {
      const row = rows[0];
      req.sessionToken = token;
      req.user = {
        id: row.id,
        username: row.username,
        email: row.email,
        name: row.name,
        roleId: row.role_id,
        roleName: row.role_name,
        status: row.status,
        avatarUrl: row.avatar_url,
        phone: row.phone,
        department: row.department,
        titlePrefix: row.title_prefix,
        specialization: row.specialization,
        bio: row.bio
      };
    }
  } catch (err: any) {
    // Ignore error for optional auth
  }

  next();
}
