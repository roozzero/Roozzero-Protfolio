import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db/pool";
import { createSession, destroySession, requireAuth, AuthenticatedUser, SESSION_COOKIE_NAME } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
  username: z.string().min(3).max(50).optional(),
  phone: z.string().optional()
}).refine(data => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

// Helper: Sanitize user for client output
function sanitizeUser(user: any): Partial<AuthenticatedUser> {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    roleId: user.role_id,
    roleName: user.role_name || (user.role_id === 1 ? "Administrator" : user.role_id === 2 ? "Teacher" : "Student"),
    status: user.status,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    department: user.department,
    titlePrefix: user.title_prefix,
    specialization: user.specialization,
    bio: user.bio
  };
}

// -------------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------------
router.post(
  "/register",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many registrations. Please try again later." }),
  async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Validation failed",
            fields: parsed.error.flatten().fieldErrors
          }
        });
      }

      const { name, email, password, phone } = parsed.data;
      const normalizedEmail = email.trim().toLowerCase();
      const generatedUsername = parsed.data.username || normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

      // Check existing email
      const [existingUser]: [any[], any] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email address already exists. Please sign in."
          }
        });
      }

      // Check existing username, suffix if taken
      let finalUsername = generatedUsername;
      const [existingUsername]: [any[], any] = await query("SELECT id FROM users WHERE username = ? LIMIT 1", [finalUsername]);
      if (existingUsername.length > 0) {
        finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      // Hash password securely with bcrypt
      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = `stu-${crypto.randomBytes(8).toString("hex")}`;

      // Insert Student user (role_id = 3)
      await query(
        `INSERT INTO users (id, username, email, password_hash, role_id, name, phone, status, provider)
         VALUES (?, ?, ?, ?, 3, ?, ?, 'Active', 'local')`,
        [newUserId, finalUsername, normalizedEmail, passwordHash, name, phone || null]
      );

      // Create login session & HttpOnly cookie
      await createSession(newUserId, req, res, false);

      // Log activity
      await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Registration', 'Student registered account')", [newUserId]);

      const [createdRows]: [any[], any] = await query(
        `SELECT u.*, r.name as role_name FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
        [newUserId]
      );

      return res.status(201).json({
        success: true,
        data: {
          user: sanitizeUser(createdRows[0])
        }
      });
    } catch (err: any) {
      console.error("[Auth Register Error]:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to register user account." }
      });
    }
  }
);

// -------------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------------
router.post(
  "/login",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many login attempts. Please try again after 15 minutes." }),
  async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Validation failed"
          }
        });
      }

      const { email, password, rememberMe } = parsed.data;
      const normalizedEmail = email.trim().toLowerCase();
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "unknown";

      const [users]: [any[], any] = await query(
        `SELECT u.*, r.name as role_name
         FROM users u
         INNER JOIN roles r ON u.role_id = r.id
         WHERE u.email = ? AND u.deleted_at IS NULL
         LIMIT 1`,
        [normalizedEmail]
      );

      if (users.length === 0) {
        // Record failed login attempt
        await query("INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES ('unknown', ?, ?, 'Failed')", [ip, userAgent]);
        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." }
        });
      }

      const user = users[0];

      if (user.status === "Suspended") {
        return res.status(403).json({
          success: false,
          error: { code: "ACCOUNT_SUSPENDED", message: "Account has been suspended. Please contact administrator." }
        });
      }

      // Verify bcrypt password hash
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        await query("INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES (?, ?, ?, 'Failed')", [user.id, ip, userAgent]);
        return res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." }
        });
      }

      // Successful login: create session token in DB and set cookie
      await createSession(user.id, req, res, !!rememberMe);

      // Record success in login_history and activity_logs
      await query("INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES (?, ?, ?, 'Success')", [user.id, ip, userAgent]);
      await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Login', 'User authenticated successfully')", [user.id]);

      return res.json({
        success: true,
        data: {
          user: sanitizeUser(user)
        }
      });
    } catch (err: any) {
      console.error("[Auth Login Error]:", err);
      return res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Login failed due to a server error." }
      });
    }
  }
);

// -------------------------------------------------------------
// POST /api/auth/logout
// -------------------------------------------------------------
router.post("/logout", async (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME] || req.sessionToken;
  if (token) {
    await destroySession(token, res);
  } else {
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  }

  return res.json({
    success: true,
    message: "Logged out successfully."
  });
});

// -------------------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------------------
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// -------------------------------------------------------------
// POST /api/auth/forgot-password
// -------------------------------------------------------------
router.post(
  "/forgot-password",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  async (req: Request, res: Response) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email" } });
      }

      const email = parsed.data.email.trim().toLowerCase();
      const [users]: [any[], any] = await query("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL", [email]);

      if (users.length > 0) {
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [token, expires, users[0].id]);
        console.log(`[Password Reset Token for ${email}]: ${token}`);
      }

      // Always return positive response to prevent user enumeration
      return res.json({
        success: true,
        message: "If this email exists in our records, password reset instructions have been dispatched."
      });
    } catch (err: any) {
      console.error("[Forgot Password Error]:", err);
      return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to process request" } });
    }
  }
);

// -------------------------------------------------------------
// POST /api/auth/reset-password
// -------------------------------------------------------------
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } });
    }

    const { token, newPassword } = parsed.data;
    const [users]: [any[], any] = await query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Password reset link is invalid or has expired." }
      });
    }

    const userId = users[0].id;
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password and invalidate token
    await query("UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", [newHash, userId]);
    // Invalidate existing sessions for security
    await query("DELETE FROM sessions_tokens WHERE user_id = ?", [userId]);

    return res.json({
      success: true,
      message: "Password reset successfully. You may now log in with your new credentials."
    });
  } catch (err: any) {
    console.error("[Reset Password Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to reset password." } });
  }
});

// -------------------------------------------------------------
// POST /api/auth/change-password
// -------------------------------------------------------------
router.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } });
    }

    const { currentPassword, newPassword } = parsed.data;
    const userId = req.user!.id;

    const [rows]: [any[], any] = await query("SELECT password_hash FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found." } });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: { code: "INVALID_PASSWORD", message: "Current password does not match." } });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId]);

    return res.json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (err: any) {
    console.error("[Change Password Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to change password." } });
  }
});

// -------------------------------------------------------------
// Google OAuth Endpoints
// -------------------------------------------------------------
router.get("/google", (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      error: {
        code: "OAUTH_NOT_CONFIGURED",
        message: "Google OAuth is not configured on this server. Please use email and password."
      }
    });
  }

  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${process.env.APP_URL || "http://localhost:3000"}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20profile%20email`;
  res.redirect(googleAuthUrl);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).send("Google OAuth is not configured on this server.");
  }
  // If user implements real google token exchange
  return res.redirect("/#login?error=Google_OAuth_Callback_Pending");
});

export default router;
