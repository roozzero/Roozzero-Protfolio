import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Only Administrator can access admin routes
router.use(requireAuth, requireRole("Administrator"));

// -------------------------------------------------------------
// GET /api/admin/dashboard
// -------------------------------------------------------------
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const [userStats]: [any[], any] = await query(`
      SELECT
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role_id = 3 AND status = 'Active' THEN 1 ELSE 0 END) as activeStudents,
        SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as totalTeachers,
        SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as totalAdmins
      FROM users WHERE deleted_at IS NULL
    `);

    const [courseStats]: [any[], any] = await query("SELECT COUNT(*) as totalCourses FROM courses WHERE deleted_at IS NULL");
    const [enrollmentStats]: [any[], any] = await query("SELECT COUNT(*) as activeEnrollments FROM enrollments WHERE status = 'Active'");
    const [unreadMessages]: [any[], any] = await query("SELECT COUNT(*) as unreadCount FROM contact_messages WHERE is_read = 0");
    const [recentActivity]: [any[], any] = await query(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      data: {
        totalUsers: userStats[0].totalUsers || 0,
        activeStudents: userStats[0].activeStudents || 0,
        totalTeachers: userStats[0].totalTeachers || 0,
        totalCourses: courseStats[0].totalCourses || 0,
        activeEnrollments: enrollmentStats[0].activeEnrollments || 0,
        unreadMessages: unreadMessages[0].unreadCount || 0,
        recentActivity
      }
    });
  } catch (err: any) {
    console.error("[Admin Dashboard Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/users
// -------------------------------------------------------------
router.get("/users", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || "1", 10);
    const limit = parseInt(req.query.limit as string || "20", 10);
    const search = req.query.search as string;
    const roleId = req.query.roleId as string;
    const offset = (page - 1) * limit;

    let whereClause = "u.deleted_at IS NULL";
    const params: any[] = [];

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (roleId) {
      whereClause += " AND u.role_id = ?";
      params.push(roleId);
    }

    const [countRows]: [any[], any] = await query(`SELECT COUNT(*) as count FROM users u WHERE ${whereClause}`, params);
    const total = countRows[0].count;

    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.username, u.email, u.phone, u.role_id, u.status, u.created_at, u.avatar_url,
             r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const users = rows.map(r => ({
      id: r.id,
      name: r.name,
      username: r.username,
      email: r.email,
      phone: r.phone,
      role: r.role_id === 1 ? "admin" : r.role_id === 2 ? "teacher" : "student",
      roleId: r.role_id,
      roleName: r.role_name,
      status: r.status,
      joinedDate: r.created_at ? r.created_at.toISOString().split("T")[0] : "",
      avatar: r.avatar_url
    }));

    return res.json({
      success: true,
      data: {
        users,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/users
// -------------------------------------------------------------
router.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, department, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Name, email and password are required." } });
    }

    const emailNorm = email.trim().toLowerCase();
    const [existing]: [any[], any] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [emailNorm]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "Email already exists." } });
    }

    const roleId = role === "admin" || role === "Administrator" ? 1 : role === "teacher" || role === "Teacher" ? 2 : 3;
    const prefix = roleId === 1 ? "admin" : roleId === 2 ? "teacher" : "stu";
    const newId = `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
    const username = emailNorm.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

    const hash = await bcrypt.hash(password, 10);
    await query(`
      INSERT INTO users (id, username, email, password_hash, role_id, name, phone, department, specialization, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `, [newId, username, emailNorm, hash, roleId, name, phone || null, department || null, specialization || null]);

    // Log admin action
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'Create User', ?)", [req.user!.id, `Created user ${emailNorm} with role ID ${roleId}`]);

    return res.status(201).json({
      success: true,
      data: {
        id: newId,
        name,
        email: emailNorm,
        roleId,
        status: "Active"
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/admin/users/:id
// -------------------------------------------------------------
router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { name, phone, status, roleId, department, specialization } = req.body;

    await query(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status),
          role_id = COALESCE(?, role_id),
          department = COALESCE(?, department),
          specialization = COALESCE(?, specialization)
      WHERE id = ?
    `, [name, phone, status, roleId, department, specialization, targetUserId]);

    return res.json({ success: true, message: "User updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/admin/users/:id
// -------------------------------------------------------------
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    if (targetUserId === req.user!.id) {
      return res.status(400).json({ success: false, error: { code: "CANNOT_DELETE_SELF", message: "You cannot delete your own account." } });
    }

    await query("UPDATE users SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?", [targetUserId]);
    await query("DELETE FROM sessions_tokens WHERE user_id = ?", [targetUserId]);

    return res.json({ success: true, message: "User deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/messages (Inbox)
// -------------------------------------------------------------
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100");
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PATCH /api/admin/messages/:id/read
// -------------------------------------------------------------
router.patch("/messages/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [id]);
    return res.json({ success: true, message: "Message marked as read." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/messages/:id/reply
// -------------------------------------------------------------
router.post("/messages/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const adminId = req.user!.id;

    if (!replyText) {
      return res.status(400).json({ success: false, error: { code: "REPLY_EMPTY", message: "Reply text is required." } });
    }

    await query(`
      UPDATE contact_messages
      SET reply_text = ?, replied_at = NOW(), replied_by = ?, is_read = 1
      WHERE id = ?
    `, [replyText, adminId, id]);

    return res.json({ success: true, message: "Reply saved and dispatched." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/activity-logs
// -------------------------------------------------------------
router.get("/activity-logs", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/login-history
// -------------------------------------------------------------
router.get("/login-history", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM login_history l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.attempt_time DESC
      LIMIT 100
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
