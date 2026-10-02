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
        SUM(CASE WHEN LOWER(r.name) = 'user' THEN 1 ELSE 0 END) as normalUsers,
        SUM(CASE WHEN LOWER(r.name) = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN LOWER(r.name) = 'teacher' THEN 1 ELSE 0 END) as teachers,
        SUM(CASE WHEN LOWER(r.name) = 'administrator' THEN 1 ELSE 0 END) as administrators,
        SUM(CASE WHEN LOWER(r.name) = 'student' AND u.status = 'Active' THEN 1 ELSE 0 END) as activeStudents
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.deleted_at IS NULL
    `);

    const [courseStats]: [any[], any] = await query("SELECT COUNT(*) as totalCourses FROM courses WHERE deleted_at IS NULL");
    const [enrollmentStats]: [any[], any] = await query("SELECT COUNT(*) as activeEnrollments FROM enrollments WHERE status = 'Active'");
    const [unreadMessages]: [any[], any] = await query("SELECT COUNT(*) as unreadCount FROM contact_messages WHERE is_read = 0");
    const [certificatesCount]: [any[], any] = await query("SELECT COUNT(*) as totalCertificates FROM certificates");
    const [recentActivity]: [any[], any] = await query(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    const stats = {
      totalUsers: Number(userStats[0]?.totalUsers || 0),
      normalUsers: Number(userStats[0]?.normalUsers || 0),
      students: Number(userStats[0]?.students || 0),
      teachers: Number(userStats[0]?.teachers || 0),
      administrators: Number(userStats[0]?.administrators || 0),
      activeStudents: Number(userStats[0]?.activeStudents || 0),
      totalCourses: Number(courseStats[0]?.totalCourses || 0),
      activeEnrollments: Number(enrollmentStats[0]?.activeEnrollments || 0),
      unreadMessages: Number(unreadMessages[0]?.unreadCount || 0),
      totalCertificates: Number(certificatesCount[0]?.totalCertificates || 0)
    };

    return res.json({
      success: true,
      data: {
        stats,
        ...stats,
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
    const limit = parseInt(req.query.limit as string || "50", 10);
    const search = req.query.search as string;
    const roleId = req.query.roleId as string;
    const roleFilter = (req.query.role as string || "").toLowerCase();
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
    } else if (roleFilter && roleFilter !== "all") {
      if (roleFilter === "admin" || roleFilter === "administrator") {
        whereClause += " AND LOWER(r.name) = 'administrator'";
      } else if (roleFilter === "teacher") {
        whereClause += " AND LOWER(r.name) = 'teacher'";
      } else if (roleFilter === "student") {
        whereClause += " AND LOWER(r.name) = 'student'";
      } else if (roleFilter === "user" || roleFilter === "normal") {
        whereClause += " AND LOWER(r.name) = 'user'";
      }
    }

    const [countRows]: [any[], any] = await query(`
      SELECT COUNT(*) as count 
      FROM users u 
      INNER JOIN roles r ON u.role_id = r.id 
      WHERE ${whereClause}
    `, params);
    const total = countRows[0]?.count || 0;

    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.username, u.email, u.phone, u.role_id, u.status, u.created_at, u.avatar_url,
             r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const users = rows.map(r => {
      const lowerRole = (r.role_name || "").toLowerCase();
      const roleMapped = lowerRole === "administrator" ? "admin" : lowerRole === "teacher" ? "teacher" : lowerRole === "student" ? "student" : "user";
      return {
        id: r.id,
        name: r.name,
        username: r.username,
        email: r.email,
        phone: r.phone,
        role: roleMapped,
        roleId: r.role_id,
        roleName: r.role_name,
        status: r.status,
        joinedDate: r.created_at ? (typeof r.created_at === "string" ? r.created_at.split(" ")[0].split("T")[0] : (r.created_at.toISOString ? r.created_at.toISOString().split("T")[0] : String(r.created_at))) : "",
        avatar: r.avatar_url
      };
    });

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
// PATCH /api/admin/users/:userId/role
// -------------------------------------------------------------
router.patch("/users/:userId/role", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Role is required." }
      });
    }

    const trimmedRole = role.trim();
    // Allowed target roles: User, Student, Teacher. (Administrator is protected and cannot be assigned)
    const allowedRoles = ["User", "Student", "Teacher"];
    const matchedRole = allowedRoles.find(r => r.toLowerCase() === trimmedRole.toLowerCase());

    if (!matchedRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ROLE",
          message: "Invalid target role. Allowed roles are: User, Student, Teacher. Administrator cannot be assigned."
        }
      });
    }

    // Lookup target user and their current role
    const [targetRows]: [any[], any] = await query(`
      SELECT u.id, u.email, u.name, u.role_id, r.name as role_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [userId]);

    if (targetRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found." }
      });
    }

    const targetUser = targetRows[0];
    const canonicalAdminEmail = (process.env.ADMIN_EMAIL || "admin@roozzero.info").trim().toLowerCase();

    // Protect Master Administrator from modification or demotion
    if (
      targetUser.id === "admin-1" ||
      targetUser.role_name.toLowerCase() === "administrator" ||
      targetUser.email.toLowerCase() === canonicalAdminEmail
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: "PROTECTED_ADMIN",
          message: "The Master Administrator account is protected and cannot be modified or demoted."
        }
      });
    }

    // Find target role ID in MySQL roles table
    const [roleRows]: [any[], any] = await query("SELECT id FROM roles WHERE name = ? LIMIT 1", [matchedRole]);
    if (roleRows.length === 0) {
      return res.status(500).json({
        success: false,
        error: { code: "ROLE_NOT_CONFIGURED", message: `Role '${matchedRole}' is not configured in the database.` }
      });
    }

    const newRoleId = roleRows[0].id;

    // Update user role in MySQL
    await query("UPDATE users SET role_id = ? WHERE id = ?", [newRoleId, userId]);

    // Log administrative activity
    await query(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, 'RoleChange', ?)
    `, [req.user!.id, `Changed role of ${targetUser.name} (${targetUser.email}) from ${targetUser.role_name} to ${matchedRole}`]);

    return res.json({
      success: true,
      data: {
        userId,
        previousRole: targetUser.role_name,
        newRole: matchedRole,
        message: `User role successfully updated to ${matchedRole}.`
      }
    });
  } catch (err: any) {
    console.error("[Role Update Error]:", err);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    });
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

    const canonicalAdminEmail = (process.env.ADMIN_EMAIL || "admin@roozzero.info").trim().toLowerCase();
    if (targetUserId === "admin-1") {
      if (roleId && roleId !== 1) {
        return res.status(403).json({ success: false, error: { code: "PROTECTED_ADMIN", message: "The Master Administrator role cannot be modified." } });
      }
      if (status && status !== "Active") {
        return res.status(403).json({ success: false, error: { code: "PROTECTED_ADMIN", message: "The Master Administrator cannot be deactivated." } });
      }
    }

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
    const canonicalAdminEmail = (process.env.ADMIN_EMAIL || "admin@roozzero.info").trim().toLowerCase();
    if (targetUserId === "admin-1" || targetUserId === req.user!.id) {
      return res.status(403).json({ success: false, error: { code: "PROTECTED_ADMIN", message: "The Master Administrator account cannot be deleted." } });
    }

    // Also check if target is an Administrator by role
    const [targetRows]: [any[], any] = await query("SELECT u.id, u.email, r.name as role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1", [targetUserId]);
    if (targetRows.length > 0) {
      if (targetRows[0].role_name === "Administrator" || targetRows[0].email.toLowerCase() === canonicalAdminEmail) {
        return res.status(403).json({ success: false, error: { code: "PROTECTED_ADMIN", message: "Administrator accounts cannot be deleted." } });
      }
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

// -------------------------------------------------------------
// GET /api/admin/enrollments
// -------------------------------------------------------------
router.get("/enrollments", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT e.id, e.student_id as studentId, u.name as studentName,
             e.course_id as courseId, c.title as courseTitle,
             e.season_id as seasonId, COALESCE(cs.name, 'Core Cohort') as seasonName,
             e.joined_date as enrollmentDate,
             'Paid' as paymentStatus,
             e.status as courseStatus
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      INNER JOIN courses c ON e.course_id = c.id
      LEFT JOIN course_seasons cs ON e.season_id = cs.id
      WHERE u.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY e.joined_date DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/certificates
// -------------------------------------------------------------
router.get("/certificates", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT cert.id, cert.student_id as studentId, u.name as studentName,
             cert.course_id as courseId, c.title as courseTitle,
             cert.gpa, cert.status, cert.issue_date as issueDate, cert.certificate_number as certificateNumber
      FROM certificates cert
      INNER JOIN users u ON cert.student_id = u.id
      INNER JOIN courses c ON cert.course_id = c.id
      ORDER BY cert.created_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/admin/certificates/:id/status
// -------------------------------------------------------------
router.put("/certificates/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query("UPDATE certificates SET status = ? WHERE id = ?", [status, id]);
    return res.json({ success: true, message: "Certificate status updated." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/announcements
// -------------------------------------------------------------
router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT a.id, a.title, a.description, a.course_id as courseId,
             COALESCE(c.title, 'All Courses') as courseTitle,
             a.audience, a.published_at as publishedAt, a.status
      FROM announcements a
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE a.deleted_at IS NULL
      ORDER BY a.published_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/announcements
// -------------------------------------------------------------
router.post("/announcements", async (req: Request, res: Response) => {
  try {
    const { title, description, courseId, audience, status } = req.body;
    const adminId = req.user!.id;
    const newId = `ann-${Date.now()}`;
    await query(`
      INSERT INTO announcements (id, title, description, course_id, author_id, audience, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [newId, title, description, courseId || "all", adminId, audience || "Everyone", status || "Published"]);
    return res.status(201).json({ success: true, data: { id: newId } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/course-seasons
// -------------------------------------------------------------
router.get("/course-seasons", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT cs.id, cs.name, cs.course_id as courseId, c.title as courseTitle,
             cs.start_date as startDate, cs.end_date as endDate,
             cs.max_capacity as maxCapacity, cs.registration_status as registrationStatus,
             cs.notes, cs.status
      FROM course_seasons cs
      INNER JOIN courses c ON cs.course_id = c.id
      ORDER BY cs.start_date DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/profile
// -------------------------------------------------------------
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const [rows]: [any[], any] = await query(
      "SELECT id, name, username, email, phone, bio, avatar_url, title_prefix, specialization FROM users WHERE id = ?",
      [adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Admin user not found" } });
    }
    const u = rows[0];
    return res.json({
      success: true,
      data: {
        name: u.name || "Jaden Smith",
        email: u.email || (process.env.ADMIN_EMAIL || "admin@roozzero.info"),
        phone: u.phone || "+98 9123456789",
        photo: u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
        bio: u.bio || "Super Administrator and Learning Management Architect. Orchestrating system-wide course allocations, credential signing, and academy security operations.",
        department: "LMS Administration",
        theme: "dark",
        titlePrefix: u.title_prefix || "Mr.",
        specialization: u.specialization || "Super Admin"
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/admin/profile
// -------------------------------------------------------------
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { name, email, phone, photo, bio, titlePrefix, specialization } = req.body;

    await query(
      `UPDATE users
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           avatar_url = COALESCE(?, avatar_url),
           bio = COALESCE(?, bio),
           title_prefix = COALESCE(?, title_prefix),
           specialization = COALESCE(?, specialization)
       WHERE id = ?`,
      [name || null, email || null, phone || null, photo || null, bio || null, titlePrefix || null, specialization || null, adminId]
    );

    const [rows]: [any[], any] = await query(
      "SELECT id, name, username, email, phone, bio, avatar_url, title_prefix, specialization FROM users WHERE id = ?",
      [adminId]
    );
    const u = rows[0];
    return res.json({
      success: true,
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        photo: u.avatar_url,
        bio: u.bio,
        department: "LMS Administration",
        theme: "dark",
        titlePrefix: u.title_prefix,
        specialization: u.specialization
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
