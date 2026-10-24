import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadProfile, uploadMedia } from "../middleware/upload";

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
    const [enrollmentStats]: [any[], any] = await query(`
      SELECT COUNT(*) as activeEnrollments
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.status = 'Active' AND u.deleted_at IS NULL AND c.deleted_at IS NULL
    `);
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
// GET /api/admin/users/:id (Admin-Only User Profile Viewer)
// -------------------------------------------------------------
router.get("/users/:id", requireAuth, requireRole("Administrator"), async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const userId = typeof rawId === "string" ? rawId.trim() : "";

    if (!userId || userId.length > 100 || !/^[a-zA-Z0-9._-]+$/.test(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "A valid user identifier is required."
        }
      });
    }

    const [rows]: [any[], any] = await query(
      `SELECT
         u.id,
         u.username,
         u.email,
         u.role_id,
         u.provider,
         u.name,
         u.avatar_url,
         u.bio,
         u.phone,
         u.department,
         u.title_prefix,
         u.specialization,
         u.status,
         u.created_at,
         u.updated_at,
         r.name as role_name,
         (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) as enrolled_courses_count,
         (SELECT COUNT(*) FROM courses c WHERE c.teacher_id = u.id AND c.deleted_at IS NULL) as assigned_courses_count,
         (SELECT lh.attempt_time FROM login_history lh WHERE lh.user_id = u.id AND lh.status = 'Success' ORDER BY lh.attempt_time DESC LIMIT 1) as last_login_at
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "The requested user profile could not be found."
        }
      });
    }

    const r = rows[0];
    const lowerRole = (r.role_name || "").toLowerCase();
    const roleMapped =
      lowerRole === "administrator"
        ? "admin"
        : lowerRole === "teacher"
        ? "teacher"
        : lowerRole === "student"
        ? "student"
        : "user";

    const formatDateStr = (val: any): string | null => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString();
      return String(val);
    };

    const createdAtIso = formatDateStr(r.created_at);
    const updatedAtIso = formatDateStr(r.updated_at);
    const lastLoginIso = formatDateStr(r.last_login_at);

    const profileData = {
      id: r.id,
      name: r.name,
      username: r.username || null,
      email: r.email,
      phone: r.phone || null,
      role: roleMapped,
      roleId: Number(r.role_id),
      roleName: r.role_name,
      status: r.status || "Active",
      avatarUrl: r.avatar_url || null,
      bio: r.bio || null,
      department: r.department || null,
      titlePrefix: r.title_prefix || null,
      specialization: r.specialization || null,
      provider: r.provider || "local",
      joinedDate: createdAtIso ? createdAtIso.split(" ")[0].split("T")[0] : null,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      lastLoginAt: lastLoginIso,
      enrolledCoursesCount: Number(r.enrolled_courses_count || 0),
      assignedCoursesCount: Number(r.assigned_courses_count || 0)
    };

    return res.json({
      success: true,
      data: {
        user: profileData
      }
    });
  } catch (err: any) {
    console.error("[Admin Get User Profile Error]:", err);
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to retrieve user profile."
      }
    });
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
    // Allowed target roles: User, Student, Teacher, Administrator
    let normalizedRole = trimmedRole;
    if (trimmedRole.toLowerCase() === "admin") normalizedRole = "Administrator";

    const allowedRoles = ["User", "Student", "Teacher", "Administrator"];
    const matchedRole = allowedRoles.find(r => r.toLowerCase() === normalizedRole.toLowerCase());

    if (!matchedRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ROLE",
          message: "Invalid target role. Allowed roles are: User, Student, Teacher, Administrator."
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

    const lowerRole = (role || "user").toString().toLowerCase().trim();
    const roleId =
      lowerRole === "admin" || lowerRole === "administrator"
        ? 1
        : lowerRole === "teacher"
        ? 2
        : lowerRole === "student"
        ? 3
        : 4;
    const prefix = roleId === 1 ? "admin" : roleId === 2 ? "teacher" : roleId === 3 ? "stu" : "usr";
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
// GET /api/admin/messages (Inbox: contact inquiries & incoming internal messages)
// -------------------------------------------------------------
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;

    // 1. Fetch website contact messages
    const [contactRows]: [any[], any] = await query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100");

    // 2. Fetch internal messages sent to Admin or AllAdmins by students/teachers, or threads where users replied
    const [internalRows]: [any[], any] = await query(`
      SELECT DISTINCT
        m.id,
        m.reply_to_id,
        m.sender_id,
        m.sender_name,
        m.sender_role,
        m.recipient_type,
        m.recipient_id,
        m.recipient_name,
        m.subject,
        m.content,
        m.attachments_json,
        m.created_at,
        COALESCE(r.is_read, 0) as is_read,
        u.email as sender_email,
        u.avatar_url as sender_avatar
      FROM internal_messages m
      LEFT JOIN internal_message_recipients r ON m.id = r.message_id AND (r.recipient_id = ? OR r.recipient_id = 'admin-1')
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE (
        (m.recipient_type = 'AllAdmins' OR m.recipient_id = ? OR m.recipient_id = 'admin-1' OR r.recipient_id IS NOT NULL)
        OR (m.sender_id = ? OR m.sender_id = 'admin-1')
      )
        AND m.reply_to_id IS NULL
      ORDER BY m.created_at DESC
      LIMIT 100
    `, [adminId, adminId, adminId]);

    // Format website contact inquiries
    const formattedContacts = contactRows.map((r: any) => ({
      id: r.id,
      isInternal: false,
      sender_name: r.sender_name,
      sender_email: r.sender_email,
      phone: r.phone,
      subject: r.subject || "Website Inquiry",
      message: r.message,
      is_read: Boolean(r.is_read),
      reply_text: r.reply_text,
      replied_at: r.replied_at,
      replied_by: r.replied_by,
      created_at: r.created_at
    }));

    // Format internal incoming messages, including any reply threads
    const formattedInternals = [];
    for (const msg of internalRows) {
      const [replies]: [any[], any] = await query(`
        SELECT 
          m.id, 
          m.sender_id, 
          m.sender_name, 
          m.sender_role, 
          m.content, 
          m.created_at,
          u.avatar_url as sender_avatar
        FROM internal_messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.reply_to_id = ?
        ORDER BY m.created_at ASC
      `, [msg.id]);

      const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;
      const isAdminRoot = msg.sender_id === adminId || msg.sender_id === "admin-1";

      const effectiveSenderName = isAdminRoot
        ? (lastReply ? lastReply.sender_name : `To: ${msg.recipient_name || msg.recipient_type || "Recipients"}`)
        : msg.sender_name;
      const effectiveSenderRole = isAdminRoot
        ? (lastReply ? lastReply.sender_role : "admin")
        : msg.sender_role;
      const effectiveSenderAvatar = isAdminRoot
        ? (lastReply ? (lastReply.sender_avatar || null) : msg.sender_avatar)
        : msg.sender_avatar;

      formattedInternals.push({
        id: msg.id,
        isInternal: true,
        sender_id: msg.sender_id,
        sender_name: effectiveSenderName,
        sender_role: effectiveSenderRole,
        sender_email: msg.sender_email || `${msg.sender_id}@academy.local`,
        sender_avatar: effectiveSenderAvatar,
        recipient_type: msg.recipient_type,
        recipient_name: msg.recipient_name,
        subject: msg.subject,
        message: msg.content,
        attachments: msg.attachments_json ? JSON.parse(msg.attachments_json) : [],
        is_read: Boolean(msg.is_read),
        reply_text: lastReply ? lastReply.content : null,
        replied_at: lastReply ? lastReply.created_at : null,
        replied_by: lastReply ? lastReply.sender_id : null,
        replies: replies.map((rep: any) => ({
          id: rep.id,
          sender_id: rep.sender_id,
          sender_name: rep.sender_name,
          sender_role: rep.sender_role,
          sender_avatar: rep.sender_avatar,
          content: rep.content,
          created_at: rep.created_at
        })),
        created_at: msg.created_at
      });
    }

    // Merge and sort newest first
    const allMessages = [...formattedContacts, ...formattedInternals].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    });

    return res.json({ success: true, data: allMessages });
  } catch (err: any) {
    console.error("[Get Messages Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/messages/send (Authoritative MySQL Send)
// -------------------------------------------------------------
router.post("/messages/send", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const adminName = req.user!.name || "Administrator";
    const {
      recipientType,
      targetUserId,
      targetUserIds,
      courseId,
      seasonId,
      subject,
      content,
      attachments
    } = req.body;

    if (!subject || !subject.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Subject and message content are required." } });
    }

    let recipientUserIds: string[] = [];
    let recipientLabel = "";

    if (recipientType === "Individual") {
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: { code: "MISSING_RECIPIENT", message: "Please select a recipient user." } });
      }
      recipientUserIds = [targetUserId];
      const [u]: [any[], any] = await query("SELECT name FROM users WHERE id = ?", [targetUserId]);
      recipientLabel = u.length > 0 ? u[0].name : targetUserId;
    } else if (recipientType === "Multiple") {
      if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
        return res.status(400).json({ success: false, error: { code: "MISSING_RECIPIENT", message: "Please select at least one recipient." } });
      }
      recipientUserIds = targetUserIds;
      recipientLabel = `${targetUserIds.length} Recipients`;
    } else if (recipientType === "AllStudents") {
      const [students]: [any[], any] = await query("SELECT id FROM users WHERE role_id = 3 AND deleted_at IS NULL");
      recipientUserIds = students.map((s: any) => s.id);
      recipientLabel = "All Students";
    } else if (recipientType === "AllTeachers") {
      const [teachers]: [any[], any] = await query("SELECT id FROM users WHERE role_id = 2 AND deleted_at IS NULL");
      recipientUserIds = teachers.map((t: any) => t.id);
      recipientLabel = "All Teachers";
    } else if (recipientType === "AllAdmins") {
      const [admins]: [any[], any] = await query("SELECT id FROM users WHERE role_id = 1 AND deleted_at IS NULL");
      recipientUserIds = admins.map((a: any) => a.id);
      recipientLabel = "All Administrators";
    } else if (recipientType === "Course") {
      if (!courseId) {
        return res.status(400).json({ success: false, error: { code: "MISSING_COURSE", message: "Please select a course." } });
      }
      const [enrolled]: [any[], any] = await query("SELECT DISTINCT student_id as user_id FROM enrollments WHERE course_id = ?", [courseId]);
      recipientUserIds = enrolled.map((e: any) => e.user_id);
      const [c]: [any[], any] = await query("SELECT title FROM courses WHERE id = ?", [courseId]);
      recipientLabel = c.length > 0 ? `Course: ${c[0].title}` : `Course ${courseId}`;
    } else if (recipientType === "Season") {
      if (!seasonId) {
        return res.status(400).json({ success: false, error: { code: "MISSING_SEASON", message: "Please select a course season." } });
      }
      const [enrolled]: [any[], any] = await query("SELECT DISTINCT student_id as user_id FROM enrollments WHERE season_id = ?", [seasonId]);
      recipientUserIds = enrolled.map((e: any) => e.user_id);
      const [s]: [any[], any] = await query("SELECT name FROM course_seasons WHERE id = ?", [seasonId]);
      recipientLabel = s.length > 0 ? `Season: ${s[0].name}` : `Season ${seasonId}`;
    } else {
      recipientLabel = "General Broadcast";
    }

    const messageId = `msg_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const attachmentsJson = attachments && Array.isArray(attachments) && attachments.length > 0 ? JSON.stringify(attachments) : null;

    // 1. Insert central internal message record
    await query(`
      INSERT INTO internal_messages (id, sender_id, sender_name, sender_role, recipient_type, recipient_id, recipient_name, subject, content, attachments_json)
      VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, ?, ?)
    `, [messageId, adminId, adminName, recipientType, targetUserId || null, recipientLabel, subject.trim(), content.trim(), attachmentsJson]);

    // 2. Insert recipient delivery records & system notifications
    for (const rId of recipientUserIds) {
      await query(`
        INSERT INTO internal_message_recipients (message_id, recipient_id, is_read)
        VALUES (?, ?, 0)
      `, [messageId, rId]);

      await query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'system', ?, ?)
      `, [rId, subject.trim(), content.trim().length > 120 ? content.trim().substring(0, 117) + "..." : content.trim()]);
    }

    // 3. Log administrative audit trail
    await query(`
      INSERT INTO activity_logs (user_id, action, details)
      VALUES (?, 'SendMessage', ?)
    `, [adminId, `Sent message "${subject}" to ${recipientLabel} (${recipientUserIds.length} recipients)`]);

    return res.json({
      success: true,
      data: {
        id: messageId,
        subject: subject.trim(),
        recipientLabel,
        recipientCount: recipientUserIds.length,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("[Send Message Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/messages/sent (Authoritative MySQL Sent Messages)
// -------------------------------------------------------------
router.get("/messages/sent", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT 
        m.id,
        m.subject,
        m.content,
        m.recipient_type,
        m.recipient_id,
        m.recipient_name,
        m.attachments_json,
        m.created_at,
        COUNT(r.id) as delivered,
        SUM(CASE WHEN r.is_read = 1 THEN 1 ELSE 0 END) as read_count
      FROM internal_messages m
      LEFT JOIN internal_message_recipients r ON m.id = r.message_id
      WHERE m.sender_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT 100
    `, [adminId]);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      recipients: [r.recipient_name || r.recipient_type],
      recipientRole: r.recipient_name || r.recipient_type,
      subject: r.subject,
      content: r.content,
      timestamp: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      attachments: r.attachments_json ? JSON.parse(r.attachments_json) : undefined,
      deliveryStats: {
        delivered: Number(r.delivered || 0),
        read: Number(r.read_count || 0),
        unread: Math.max(0, Number(r.delivered || 0) - Number(r.read_count || 0))
      },
      isRead: false
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error("[Get Sent Messages Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PATCH /api/admin/messages/:id/read
// -------------------------------------------------------------
router.patch("/messages/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    // If numeric ID, update contact_messages
    if (!isNaN(Number(id))) {
      await query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [id]);
    } else {
      // Update internal_message_recipients
      await query("UPDATE internal_message_recipients SET is_read = 1, read_at = NOW() WHERE message_id = ? AND (recipient_id = ? OR recipient_id = 'admin-1')", [id, adminId]);
    }
    return res.json({ success: true, message: "Message marked as read." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/messages/unread-count (Unread Inbox Messages Count for Sidebar Alarm & Badge)
// -------------------------------------------------------------
router.get("/messages/unread-count", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const [contactRows]: [any[], any] = await query("SELECT COUNT(*) as cnt FROM contact_messages WHERE is_read = 0");
    const [internalRows]: [any[], any] = await query(`
      SELECT COUNT(*) as cnt FROM internal_message_recipients
      WHERE (recipient_id = ? OR recipient_id = 'admin-1' OR recipient_id = 'all-admins')
        AND is_read = 0
    `, [adminId]);

    const contactCount = Number(contactRows[0]?.cnt || 0);
    const internalCount = Number(internalRows[0]?.cnt || 0);
    const total = contactCount + internalCount;

    return res.json({ success: true, count: total, contactCount, internalCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, count: 0 });
  }
});

// -------------------------------------------------------------
// POST /api/admin/messages/:id/reply (Reply to Contact or Internal Message)
// -------------------------------------------------------------
router.post("/messages/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const adminId = req.user!.id;
    const adminName = req.user!.name || "Administrator";

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, error: { code: "REPLY_EMPTY", message: "Reply text is required." } });
    }

    if (!isNaN(Number(id))) {
      // Reply to website contact inquiry
      await query(`
        UPDATE contact_messages
        SET reply_text = ?, replied_at = NOW(), replied_by = ?, is_read = 1
        WHERE id = ?
      `, [replyText.trim(), adminId, id]);
    } else {
      // Reply to internal message thread
      const [parent]: [any[], any] = await query("SELECT * FROM internal_messages WHERE id = ?", [id]);
      if (parent.length > 0) {
        const replyId = `rep_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const targetUserId = parent[0].sender_id;

        await query(`
          INSERT INTO internal_messages (id, reply_to_id, sender_id, sender_name, sender_role, recipient_type, recipient_id, recipient_name, subject, content)
          VALUES (?, ?, ?, ?, 'admin', 'Individual', ?, ?, ?, ?)
        `, [replyId, id, adminId, adminName, targetUserId, parent[0].sender_name, `Re: ${parent[0].subject}`, replyText.trim()]);

        await query(`
          INSERT INTO internal_message_recipients (message_id, recipient_id, is_read)
          VALUES (?, ?, 0)
        `, [replyId, targetUserId]);

        await query(`
          INSERT INTO notifications (user_id, type, title, message)
          VALUES (?, 'system', ?, ?)
        `, [targetUserId, `Reply: ${parent[0].subject}`, replyText.trim().substring(0, 100)]);
      }
    }

    return res.json({ success: true, message: "Reply saved and dispatched." });
  } catch (err: any) {
    console.error("[Reply Message Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/admin/messages/:id (Delete Message Thread from Database)
// -------------------------------------------------------------
router.delete("/messages/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isNaN(Number(id))) {
      await query("DELETE FROM contact_messages WHERE id = ?", [id]);
    } else {
      await query("DELETE FROM internal_message_recipients WHERE message_id = ?", [id]);
      await query("DELETE FROM internal_messages WHERE id = ? OR reply_to_id = ?", [id, id]);
    }
    return res.json({ success: true, message: "Message deleted from database permanently." });
  } catch (err: any) {
    console.error("[Delete Message Error]:", err);
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
             u.email as studentEmail, u.phone as studentPhone, u.phone as student_phone,
             e.course_id as courseId, c.title as courseTitle,
             e.season_id as seasonId, COALESCE(cs.name, 'Core Cohort') as seasonName,
             e.joined_date as enrollmentDate, e.joined_date as joinedDate,
             COALESCE(e.progress, 0) as progress,
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
// DELETE /api/admin/announcements/:id (Delete Announcement from Database)
// -------------------------------------------------------------
router.delete("/announcements/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM announcements WHERE id = ?", [id]);
    return res.json({ success: true, message: "Announcement deleted from database permanently." });
  } catch (err: any) {
    console.error("[Delete Announcement Error]:", err);
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
      "SELECT id, name, username, email, phone, bio, avatar_url, department, title_prefix, specialization FROM users WHERE id = ?",
      [adminId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Admin user not found" } });
    }
    const u = rows[0];
    return res.json({
      success: true,
      data: {
        id: u.id,
        name: u.name || "",
        username: u.username || "",
        email: u.email || "",
        phone: u.phone || "",
        photo: u.avatar_url || null,
        avatarUrl: u.avatar_url || null,
        bio: u.bio || "",
        department: u.department || "LMS Administration",
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
    const { name, firstName, lastName, username, email, phone, photo, avatarUrl, bio, department, specialization, titlePrefix } = req.body;

    const resolvedName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : (firstName || lastName || null));
    const resolvedPhoto = photo !== undefined ? photo : (avatarUrl !== undefined ? avatarUrl : null);

    // If username is being updated, check uniqueness
    if (username) {
      const [existingUser]: [any[], any] = await query("SELECT id FROM users WHERE username = ? AND id != ?", [username.trim(), adminId]);
      if (existingUser.length > 0) {
        return res.status(409).json({ success: false, error: { code: "USERNAME_TAKEN", message: "Username is already in use." } });
      }
    }

    // If email is being updated, check uniqueness
    if (email) {
      const [existingEmail]: [any[], any] = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email.trim().toLowerCase(), adminId]);
      if (existingEmail.length > 0) {
        return res.status(409).json({ success: false, error: { code: "EMAIL_TAKEN", message: "Email is already in use." } });
      }
    }

    await query(
      `UPDATE users
       SET name = COALESCE(?, name),
           username = COALESCE(?, username),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           avatar_url = CASE WHEN ? = 1 THEN ? ELSE avatar_url END,
           bio = COALESCE(?, bio),
           department = COALESCE(?, department),
           title_prefix = COALESCE(?, title_prefix),
           specialization = COALESCE(?, specialization)
       WHERE id = ?`,
      [
        resolvedName || null,
        username ? username.trim() : null,
        email ? email.trim().toLowerCase() : null,
        phone || null,
        resolvedPhoto !== undefined && resolvedPhoto !== null ? 1 : 0,
        resolvedPhoto || null,
        bio !== undefined ? bio : null,
        department || null,
        titlePrefix || null,
        specialization || null,
        adminId
      ]
    );

    const [rows]: [any[], any] = await query(
      "SELECT id, name, username, email, phone, bio, avatar_url, department, title_prefix, specialization FROM users WHERE id = ?",
      [adminId]
    );
    const u = rows[0];
    return res.json({
      success: true,
      data: {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        phone: u.phone,
        photo: u.avatar_url,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        department: u.department,
        theme: "dark",
        titlePrefix: u.title_prefix,
        specialization: u.specialization
      }
    });
  } catch (err: any) {
    console.error("[Update Admin Profile Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/profile/avatar
// -------------------------------------------------------------
router.post("/profile/avatar", uploadProfile.single("avatar"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No profile photo uploaded." } });
    }
    const adminId = req.user!.id;
    const avatarUrl = `/uploads/profiles/${file.filename}`;
    await query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, adminId]);

    return res.json({
      success: true,
      data: {
        avatarUrl,
        photo: avatarUrl,
        message: "Admin profile photo uploaded successfully."
      }
    });
  } catch (err: any) {
    console.error("[Admin Avatar Upload Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/admin/profile/avatar
// -------------------------------------------------------------
router.delete("/profile/avatar", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    await query("UPDATE users SET avatar_url = NULL WHERE id = ?", [adminId]);
    return res.json({ success: true, message: "Profile photo removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/admin/profile/change-password
// -------------------------------------------------------------
router.post("/profile/change-password", async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "Current and new password are required." } });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { code: "PASSWORD_TOO_SHORT", message: "New password must be at least 6 characters." } });
    }

    const [rows]: [any[], any] = await query("SELECT password_hash FROM users WHERE id = ?", [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Admin user not found." } });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: { code: "INVALID_CURRENT_PASSWORD", message: "Incorrect current password." } });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, adminId]);

    // Log security activity
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'PasswordChange', 'Administrator password changed')", [adminId]);

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// COURSE MANAGEMENT FOR ADMINISTRATOR
// -------------------------------------------------------------

// GET /api/admin/teachers (List of all active instructors for assignment)
router.get("/teachers", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.specialization, u.department
      FROM users u
      WHERE u.role_id = 2 AND u.deleted_at IS NULL
      ORDER BY u.name ASC
    `);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/admin/courses (All courses in academy: Published, Active, Draft, and Pending)
// -------------------------------------------------------------
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name, u.email as teacher_email, u.avatar_url as teacher_avatar,
             req.name as requested_by_name,
             (
               SELECT COUNT(*)
               FROM enrollments e
               INNER JOIN users stu ON e.student_id = stu.id
               WHERE e.course_id = c.id AND stu.deleted_at IS NULL
             ) as real_students_count,
             (
               SELECT COUNT(*)
               FROM sessions s
               WHERE s.course_id = c.id AND s.deleted_at IS NULL
             ) as real_sessions_count
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN users req ON c.requested_by = req.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `);

    const formatted = rows.map((r: any) => {
      let syllabusList: any[] = [];
      if (r.syllabus_json) {
        try {
          syllabusList = typeof r.syllabus_json === "string" ? JSON.parse(r.syllabus_json) : r.syllabus_json;
        } catch {
          syllabusList = [];
        }
      }

      const actualStudentsCount = Number(r.real_students_count ?? 0);
      const configuredSessionsCount = Number(r.sessions_count || 12);

      return {
        id: r.id,
        title: r.title,
        courseName: r.title,
        code: r.code,
        slug: r.slug,
        price: r.price || "$0",
        description: r.description || "",
        shortDescription: r.short_description || r.description || "",
        categoryId: r.category_id,
        categoryName: r.category_name || "General",
        teacherId: r.teacher_id,
        instructor: r.teacher_name || "Unassigned",
        teacherName: r.teacher_name || "Unassigned",
        teacherAvatar: r.teacher_avatar || "",
        teacherEmail: r.teacher_email || "",
        studentsCount: actualStudentsCount,
        sessionsCount: configuredSessionsCount,
        sessions: configuredSessionsCount,
        scheduledSessionsCount: Number(r.real_sessions_count ?? 0),
        progress: r.progress || 0,
        status: r.status || "Active",
        image: r.image || "",
        courseImage: r.image || "",
        startDate: r.start_date ? (r.start_date instanceof Date ? r.start_date.toISOString().split("T")[0] : String(r.start_date).split("T")[0]) : "",
        endDate: r.end_date ? (r.end_date instanceof Date ? r.end_date.toISOString().split("T")[0] : String(r.end_date).split("T")[0]) : "",
        syllabusJson: syllabusList,
        syllabus: syllabusList,
        isPublished: Boolean(r.is_published || r.status === "Published"),
        approvalStatus: r.approval_status || "Approved",
        requestedBy: r.requested_by,
        requestedByName: r.requested_by_name,
        createdAt: r.created_at
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error("[Get Admin Courses Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/admin/courses/upload-image (Upload course cover image)
router.post("/courses/upload-image", uploadMedia.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No image file uploaded." } });
    }
    const publicUrl = `/uploads/media/${req.file.filename}`;
    return res.json({ success: true, url: publicUrl, filename: req.file.filename });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "UPLOAD_ERROR", message: err.message } });
  }
});

// POST /api/admin/courses (Admin creates new course - AJAX persisted to MySQL)
router.post("/courses", async (req: Request, res: Response) => {
  try {
    const {
      title,
      code,
      slug,
      price,
      description,
      shortDescription,
      categoryId,
      teacherId,
      sessionsCount,
      status,
      image,
      startDate,
      endDate,
      syllabusJson,
      isPublished
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: { code: "MISSING_TITLE", message: "Course title is required." } });
    }

    const rawSyllabus = syllabusJson ?? req.body.syllabus ?? [];
    let parsedIncomingSyllabus: any[] = [];
    if (Array.isArray(rawSyllabus)) {
      parsedIncomingSyllabus = rawSyllabus;
    } else if (typeof rawSyllabus === "string") {
      try {
        parsedIncomingSyllabus = JSON.parse(rawSyllabus);
      } catch {
        parsedIncomingSyllabus = [];
      }
    }

    const validSyllabus = Array.isArray(parsedIncomingSyllabus)
      ? parsedIncomingSyllabus.filter((m: any) => m && typeof m.title === "string" && m.title.trim().length > 0)
      : [];

    if (validSyllabus.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_SYLLABUS", message: "Please add at least one syllabus module with a title before creating the course." }
      });
    }

    const parsedSessionsCount = sessionsCount !== undefined && sessionsCount !== null && sessionsCount !== ""
      ? Number(sessionsCount)
      : 12;
    if (isNaN(parsedSessionsCount) || !Number.isFinite(parsedSessionsCount) || parsedSessionsCount < 1) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_SESSIONS_COUNT", message: "Total sessions must be a positive number (at least 1)." }
      });
    }

    const cleanStart = startDate ? String(startDate).substring(0, 10) : null;
    const cleanEnd = endDate ? String(endDate).substring(0, 10) : null;
    if (cleanStart && cleanEnd && cleanEnd < cleanStart) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_DATE_RANGE", message: "Course end date cannot be earlier than start date." }
      });
    }

    let validTeacherId: string | null = null;
    if (teacherId && String(teacherId).trim()) {
      const [tRows]: [any[], any] = await query(
        "SELECT id FROM users WHERE id = ? AND role_id = 2 AND deleted_at IS NULL",
        [String(teacherId).trim()]
      );
      if (tRows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_TEACHER", message: "Selected instructor does not exist or is not an active Teacher." }
        });
      }
      validTeacherId = String(teacherId).trim();
    }

    let validCatId = categoryId ? Number(categoryId) : 1;
    if (isNaN(validCatId) || validCatId < 1) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CATEGORY", message: "Invalid course category selected." }
      });
    }
    const [catRows]: [any[], any] = await query("SELECT id FROM course_categories WHERE id = ?", [validCatId]);
    if (catRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CATEGORY", message: "Selected course category does not exist." }
      });
    }

    const courseId = `crs-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    let courseCode = (code && String(code).trim()) || "";
    if (courseCode) {
      const [existingCodeRows]: [any[], any] = await query("SELECT id, deleted_at FROM courses WHERE code = ? LIMIT 1", [courseCode]);
      if (existingCodeRows && existingCodeRows.length > 0) {
        if (!existingCodeRows[0].deleted_at) {
          return res.status(409).json({
            success: false,
            error: { code: "DUPLICATE_CODE", message: `Course code "${courseCode}" is already in use by another active course.` }
          });
        }
        // If previously soft-deleted course held that code, disambiguate
        courseCode = `${courseCode}-${Math.floor(10 + Math.random() * 90)}`;
      }
    } else {
      courseCode = `CRS-${Math.floor(100 + Math.random() * 900)}`;
      const [existingCodeRows]: [any[], any] = await query("SELECT id FROM courses WHERE code = ? LIMIT 1", [courseCode]);
      if (existingCodeRows && existingCodeRows.length > 0) {
        courseCode = `${courseCode}-${Math.floor(10 + Math.random() * 90)}`;
      }
    }

    const baseSlug = (slug && String(slug).trim()) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || courseId;
    let courseSlug = baseSlug;
    const [existingSlugRows]: [any[], any] = await query("SELECT id FROM courses WHERE slug = ? LIMIT 1", [courseSlug]);
    if (existingSlugRows && existingSlugRows.length > 0) {
      courseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const isPub = Boolean(isPublished !== undefined ? isPublished : status === "Published");
    const courseStatus = isPub ? "Published" : (status || "Active");
    const syllabusStr = JSON.stringify(validSyllabus);
    const formattedPrice = typeof price === "number" ? `$${price}` : (price && String(price).trim() ? String(price).trim() : "$0");

    await query(`
      INSERT INTO courses (
        id, title, code, slug, price, description, short_description,
        category_id, teacher_id, sessions_count, students_count, status,
        image, start_date, end_date, syllabus_json, is_published, approval_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Approved')
    `, [
      courseId,
      title.trim(),
      courseCode,
      courseSlug,
      formattedPrice,
      description || "",
      shortDescription || description || "",
      validCatId,
      validTeacherId,
      Math.round(parsedSessionsCount),
      courseStatus,
      image || null,
      cleanStart,
      cleanEnd,
      syllabusStr,
      isPub ? 1 : 0
    ]);

    // Audit log
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'CreateCourse', ?)", [
      req.user!.id,
      `Created course "${title.trim()}" (${courseCode}) - Published: ${isPub ? 'Yes' : 'No'}`
    ]);

    // Return full course object for instant AJAX update
    const [createdRows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name, u.email as teacher_email, u.avatar_url as teacher_avatar
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [courseId]);

    const created = createdRows[0];
    let syllabusList: any[] = [];
    if (created.syllabus_json) {
      try {
        syllabusList = typeof created.syllabus_json === "string" ? JSON.parse(created.syllabus_json) : created.syllabus_json;
      } catch {
        syllabusList = [];
      }
    }

    // Synchronize with cms_classes so public landing page and CMS stay consistent
    await query(`
      INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON DUPLICATE KEY UPDATE
        course_image = VALUES(course_image),
        course_name = VALUES(course_name),
        instructor = VALUES(instructor),
        price = VALUES(price),
        description = VALUES(description),
        sessions = VALUES(sessions),
        status = VALUES(status),
        syllabus_json = VALUES(syllabus_json)
    `, [
      created.id,
      created.image || "",
      created.title,
      created.teacher_name || "Unassigned",
      created.price || "$0",
      created.description || "",
      created.sessions_count || 12,
      isPub ? "Published" : "Draft",
      JSON.stringify([created.category_name || "Engineering", "Academy"]),
      syllabusStr
    ]).catch(() => {});

    const formattedCreated = {
      id: created.id,
      title: created.title,
      courseName: created.title,
      code: created.code,
      slug: created.slug,
      price: created.price || "$0",
      description: created.description || "",
      shortDescription: created.short_description || "",
      categoryId: created.category_id,
      categoryName: created.category_name || "General",
      teacherId: created.teacher_id,
      instructor: created.teacher_name || "Unassigned",
      teacherName: created.teacher_name || "Unassigned",
      teacherAvatar: created.teacher_avatar || "",
      teacherEmail: created.teacher_email || "",
      studentsCount: 0,
      sessionsCount: created.sessions_count || 12,
      sessions: created.sessions_count || 12,
      scheduledSessionsCount: 0,
      progress: 0,
      status: created.status,
      image: created.image || "",
      courseImage: created.image || "",
      startDate: created.start_date ? (created.start_date instanceof Date ? created.start_date.toISOString().split("T")[0] : String(created.start_date).split("T")[0]) : "",
      endDate: created.end_date ? (created.end_date instanceof Date ? created.end_date.toISOString().split("T")[0] : String(created.end_date).split("T")[0]) : "",
      syllabusJson: syllabusList,
      syllabus: syllabusList,
      isPublished: Boolean(created.is_published || created.status === "Published"),
      approvalStatus: created.approval_status || "Approved"
    };

    return res.status(201).json({
      success: true,
      data: formattedCreated,
      message: "Course created successfully."
    });
  } catch (err: any) {
    console.error("[Create Course Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// GET /api/admin/courses/:id (Full course detail: instructor, students, syllabus)
router.get("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [cRows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name, u.email as teacher_email, u.avatar_url as teacher_avatar
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `, [id]);

    if (cRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course not found." } });
    }

    const course = cRows[0];

    // Enrolled students
    const [students]: [any[], any] = await query(`
      SELECT e.id as enrollment_id, e.student_id, e.status as enrollment_status, e.progress, e.avg_grade, e.joined_date,
             u.name as student_name, u.name as studentName,
             u.email as student_email, u.email as studentEmail,
             u.avatar_url as student_avatar,
             u.phone as student_phone, u.phone as studentPhone, u.phone as phone
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.course_id = ? AND u.deleted_at IS NULL
      ORDER BY e.joined_date DESC
    `, [id]);

    // Course Sessions
    const [courseSessions]: [any[], any] = await query(`
      SELECT s.id, s.course_id as courseId, c.title as courseTitle, s.title, s.date, s.time, s.duration, s.link, s.status,
             COALESCE(u.name, 'Instructor') as teacherName
      FROM sessions s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON COALESCE(s.teacher_id, c.teacher_id) = u.id
      WHERE s.course_id = ? AND s.deleted_at IS NULL
      ORDER BY s.date ASC
    `, [id]);

    let parsedSyllabus = [];
    if (course.syllabus_json) {
      try {
        parsedSyllabus = typeof course.syllabus_json === "string" ? JSON.parse(course.syllabus_json) : course.syllabus_json;
      } catch {
        parsedSyllabus = [];
      }
    }

    return res.json({
      success: true,
      data: {
        ...course,
        id: course.id,
        title: course.title,
        courseName: course.title,
        code: course.code,
        slug: course.slug,
        price: course.price || "$0",
        description: course.description || "",
        shortDescription: course.short_description || course.description || "",
        categoryId: course.category_id,
        categoryName: course.category_name || "General",
        teacherId: course.teacher_id,
        teacherName: course.teacher_name || "Unassigned",
        instructor: course.teacher_name || "Unassigned",
        studentsCount: students.length,
        sessionsCount: Number(course.sessions_count || 12),
        startDate: course.start_date ? (course.start_date instanceof Date ? course.start_date.toISOString().split("T")[0] : String(course.start_date).split("T")[0]) : "",
        endDate: course.end_date ? (course.end_date instanceof Date ? course.end_date.toISOString().split("T")[0] : String(course.end_date).split("T")[0]) : "",
        students,
        sessions: (courseSessions || []).map((s: any) => ({
          ...s,
          date: s.date ? (s.date instanceof Date ? s.date.toISOString().split("T")[0] : String(s.date).split("T")[0]) : ""
        })),
        syllabus: parsedSyllabus,
        syllabusJson: parsedSyllabus,
        isPublished: Boolean(course.is_published || course.status === "Published"),
        approvalStatus: course.approval_status || "Approved"
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PUT /api/admin/courses/:id (Admin updates any course, including teacher-defined courses)
router.put("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existingRows]: [any[], any] = await query(
      "SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Course not found." }
      });
    }
    const existingCourse = existingRows[0];

    const {
      title,
      code,
      slug,
      price,
      description,
      shortDescription,
      categoryId,
      teacherId,
      sessionsCount,
      status,
      image,
      startDate,
      endDate,
      syllabusJson,
      syllabus,
      isPublished,
      approvalStatus
    } = req.body;

    if (title !== undefined && (!String(title).trim())) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_TITLE", message: "Course title cannot be empty." }
      });
    }

    if (sessionsCount !== undefined && sessionsCount !== null) {
      const numSessions = Number(sessionsCount);
      if (isNaN(numSessions) || !Number.isFinite(numSessions) || numSessions < 1) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_SESSIONS_COUNT", message: "Total sessions must be a positive number (at least 1)." }
        });
      }
    }

    if (code !== undefined && String(code).trim()) {
      const trimmedCode = String(code).trim();
      const [dupCode]: [any[], any] = await query(
        "SELECT id FROM courses WHERE code = ? AND id != ? AND deleted_at IS NULL LIMIT 1",
        [trimmedCode, id]
      );
      if (dupCode.length > 0) {
        return res.status(409).json({
          success: false,
          error: { code: "DUPLICATE_CODE", message: `Course code "${trimmedCode}" is already used by another course.` }
        });
      }
    }

    if (teacherId !== undefined && teacherId !== null && String(teacherId).trim() !== "") {
      const [tRows]: [any[], any] = await query(
        "SELECT id FROM users WHERE id = ? AND role_id = 2 AND deleted_at IS NULL",
        [String(teacherId).trim()]
      );
      if (tRows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_TEACHER", message: "Selected user is not an active instructor." }
        });
      }
    }

    if (categoryId !== undefined && categoryId !== null) {
      const numCat = Number(categoryId);
      const [catRows]: [any[], any] = await query("SELECT id FROM course_categories WHERE id = ?", [numCat]);
      if (catRows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_CATEGORY", message: "Selected course category does not exist." }
        });
      }
    }

    const effectiveStartDate = startDate !== undefined
      ? (startDate ? String(startDate).substring(0, 10) : null)
      : (existingCourse.start_date ? (existingCourse.start_date instanceof Date ? existingCourse.start_date.toISOString().split("T")[0] : String(existingCourse.start_date).split("T")[0]) : null);
    const effectiveEndDate = endDate !== undefined
      ? (endDate ? String(endDate).substring(0, 10) : null)
      : (existingCourse.end_date ? (existingCourse.end_date instanceof Date ? existingCourse.end_date.toISOString().split("T")[0] : String(existingCourse.end_date).split("T")[0]) : null);

    if (effectiveStartDate && effectiveEndDate && effectiveEndDate < effectiveStartDate) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_DATE_RANGE", message: "Course end date cannot be earlier than start date." }
      });
    }

    const incomingSyllabusRaw = syllabusJson !== undefined ? syllabusJson : syllabus;
    let syllabusStr: string | undefined = undefined;
    if (incomingSyllabusRaw !== undefined) {
      let parsedSyl: any[] = [];
      if (Array.isArray(incomingSyllabusRaw)) {
        parsedSyl = incomingSyllabusRaw;
      } else if (typeof incomingSyllabusRaw === "string") {
        try {
          parsedSyl = JSON.parse(incomingSyllabusRaw);
        } catch {
          parsedSyl = [];
        }
      }
      const validModules = Array.isArray(parsedSyl)
        ? parsedSyl.filter((m: any) => m && typeof m.title === "string" && m.title.trim().length > 0)
        : [];
      if (validModules.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_SYLLABUS", message: "Course must contain at least one valid syllabus module." }
        });
      }
      syllabusStr = JSON.stringify(validModules);
    }

    const isPub = isPublished !== undefined ? Boolean(isPublished) : (status === "Published" ? true : undefined);
    const nextStatus = status || (isPub !== undefined ? (isPub ? "Published" : "Active") : null);

    await query(`
      UPDATE courses
      SET title = COALESCE(?, title),
          code = COALESCE(?, code),
          slug = COALESCE(?, slug),
          price = COALESCE(?, price),
          description = CASE WHEN ? = 1 THEN ? ELSE description END,
          short_description = CASE WHEN ? = 1 THEN ? ELSE short_description END,
          category_id = COALESCE(?, category_id),
          teacher_id = CASE WHEN ? = 1 THEN ? ELSE teacher_id END,
          sessions_count = COALESCE(?, sessions_count),
          status = COALESCE(?, status),
          image = CASE WHEN ? = 1 THEN ? ELSE image END,
          start_date = CASE WHEN ? = 1 THEN ? ELSE start_date END,
          end_date = CASE WHEN ? = 1 THEN ? ELSE end_date END,
          syllabus_json = COALESCE(?, syllabus_json),
          is_published = COALESCE(?, is_published),
          approval_status = COALESCE(?, approval_status)
      WHERE id = ?
    `, [
      title !== undefined ? String(title).trim() : null,
      code !== undefined && String(code).trim() ? String(code).trim() : null,
      slug !== undefined && String(slug).trim() ? String(slug).trim() : null,
      price !== undefined ? (typeof price === "number" ? `$${price}` : String(price).trim() || "$0") : null,
      description !== undefined ? 1 : 0,
      description !== undefined ? description : null,
      shortDescription !== undefined ? 1 : 0,
      shortDescription !== undefined ? shortDescription : null,
      categoryId ? Number(categoryId) : null,
      teacherId !== undefined ? 1 : 0,
      teacherId ? String(teacherId).trim() : null,
      sessionsCount !== undefined && sessionsCount !== null ? Math.round(Number(sessionsCount)) : null,
      nextStatus,
      image !== undefined ? 1 : 0,
      image || null,
      startDate !== undefined ? 1 : 0,
      effectiveStartDate,
      endDate !== undefined ? 1 : 0,
      effectiveEndDate,
      syllabusStr !== undefined ? syllabusStr : null,
      isPub !== undefined ? (isPub ? 1 : 0) : null,
      approvalStatus || null,
      id
    ]);

    // Fetch updated course record to return and sync with cms_classes
    const [updatedRows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name, u.email as teacher_email, u.avatar_url as teacher_avatar,
             (
               SELECT COUNT(*)
               FROM enrollments e
               INNER JOIN users stu ON e.student_id = stu.id
               WHERE e.course_id = c.id AND stu.deleted_at IS NULL
             ) as real_students_count
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [id]);

    const updated = updatedRows[0];
    let updatedSyllabus: any[] = [];
    if (updated.syllabus_json) {
      try {
        updatedSyllabus = typeof updated.syllabus_json === "string" ? JSON.parse(updated.syllabus_json) : updated.syllabus_json;
      } catch {
        updatedSyllabus = [];
      }
    }

    const updatedPub = Boolean(updated.is_published || updated.status === "Published");

    // Synchronize cms_classes
    await query(`
      INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON DUPLICATE KEY UPDATE
        course_image = VALUES(course_image),
        course_name = VALUES(course_name),
        instructor = VALUES(instructor),
        price = VALUES(price),
        description = VALUES(description),
        sessions = VALUES(sessions),
        status = VALUES(status),
        syllabus_json = VALUES(syllabus_json)
    `, [
      updated.id,
      updated.image || "",
      updated.title,
      updated.teacher_name || "Unassigned",
      updated.price || "$0",
      updated.description || "",
      updated.sessions_count || 12,
      updatedPub ? "Published" : "Draft",
      JSON.stringify([updated.category_name || "Engineering", "Academy"]),
      JSON.stringify(updatedSyllabus)
    ]).catch(() => {});

    // Audit log
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'UpdateCourse', ?)", [
      req.user!.id,
      `Updated course configuration for "${updated.title}"`
    ]);

    const formattedUpdated = {
      id: updated.id,
      title: updated.title,
      courseName: updated.title,
      code: updated.code,
      slug: updated.slug,
      price: updated.price || "$0",
      description: updated.description || "",
      shortDescription: updated.short_description || updated.description || "",
      categoryId: updated.category_id,
      categoryName: updated.category_name || "General",
      teacherId: updated.teacher_id,
      instructor: updated.teacher_name || "Unassigned",
      teacherName: updated.teacher_name || "Unassigned",
      teacherAvatar: updated.teacher_avatar || "",
      teacherEmail: updated.teacher_email || "",
      studentsCount: Number(updated.real_students_count ?? 0),
      sessionsCount: Number(updated.sessions_count || 12),
      sessions: Number(updated.sessions_count || 12),
      progress: updated.progress || 0,
      status: updated.status,
      image: updated.image || "",
      courseImage: updated.image || "",
      startDate: updated.start_date ? (updated.start_date instanceof Date ? updated.start_date.toISOString().split("T")[0] : String(updated.start_date).split("T")[0]) : "",
      endDate: updated.end_date ? (updated.end_date instanceof Date ? updated.end_date.toISOString().split("T")[0] : String(updated.end_date).split("T")[0]) : "",
      syllabusJson: updatedSyllabus,
      syllabus: updatedSyllabus,
      isPublished: updatedPub,
      approvalStatus: updated.approval_status || "Approved"
    };

    return res.json({
      success: true,
      data: formattedUpdated,
      message: "Course updated successfully in database."
    });
  } catch (err: any) {
    console.error("[Update Course Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PATCH /api/admin/courses/:id/publish (Toggle Course Publishing to Landing Page)
router.patch("/courses/:id/publish", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course not found." } });
    }

    const { isPublished } = req.body;
    const pubVal = isPublished ? 1 : 0;
    const newStatus = isPublished ? "Published" : "Active";

    await query("UPDATE courses SET is_published = ?, status = ? WHERE id = ?", [pubVal, newStatus, id]);
    await query("UPDATE cms_classes SET status = ? WHERE id = ?", [isPublished ? "Published" : "Draft", id]).catch(() => {});
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'TogglePublish', ?)", [
      req.user!.id,
      `Course ${id} publication set to: ${isPublished ? 'Published (Live on Landing)' : 'Unpublished (Draft)'}`
    ]);

    return res.json({
      success: true,
      isPublished: Boolean(isPublished),
      status: newStatus,
      message: isPublished ? "Course is now published on landing page." : "Course unpublished from landing page."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/admin/courses/:id/syllabus (Update Course Syllabus in Database)
router.post("/courses/:id/syllabus", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course not found." } });
    }

    const { syllabus } = req.body;
    const syllabusList = Array.isArray(syllabus)
      ? syllabus.filter((m: any) => m && typeof m.title === "string" && m.title.trim().length > 0)
      : [];

    if (syllabusList.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_SYLLABUS", message: "Please provide at least one syllabus module with a valid title." }
      });
    }

    const syllabusStr = JSON.stringify(syllabusList);

    await query("UPDATE courses SET syllabus_json = ? WHERE id = ?", [syllabusStr, id]);
    await query("UPDATE cms_classes SET syllabus_json = ? WHERE id = ?", [syllabusStr, id]).catch(() => {});
    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'UpdateSyllabus', ?)", [
      req.user!.id,
      `Updated syllabus (${syllabusList.length} items) for course ${id}`
    ]);

    return res.json({ success: true, data: syllabusList, message: "Course syllabus synchronized successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PATCH /api/admin/courses/:id/approve (Admin Approves Teacher Course Proposal)
router.patch("/courses/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course proposal not found." } });
    }

    const { publish } = req.body;
    const isPub = Boolean(publish);
    const newStatus = isPub ? "Published" : "Active";

    await query(`
      UPDATE courses
      SET approval_status = 'Approved',
          status = ?,
          is_published = ?
      WHERE id = ?
    `, [newStatus, isPub ? 1 : 0, id]);

    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'ApproveCourse', ?)", [
      req.user!.id,
      `Approved course proposal ${id} (Published: ${isPub ? 'Yes' : 'No'})`
    ]);

    return res.json({
      success: true,
      message: `Course proposal approved successfully${isPub ? ' and published to landing page' : ''}.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PATCH /api/admin/courses/:id/reject (Admin Rejects Teacher Course Proposal)
router.patch("/courses/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course proposal not found." } });
    }

    await query(`
      UPDATE courses
      SET approval_status = 'Rejected',
          status = 'Inactive',
          is_published = 0
      WHERE id = ?
    `, [id]);

    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'RejectCourse', ?)", [
      req.user!.id,
      `Rejected course proposal ${id}`
    ]);

    return res.json({
      success: true,
      message: "Course proposal rejected."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// DELETE /api/admin/courses/:id (Soft delete course while preserving enrollments, lessons, assignments, exams, and certificates)
router.delete("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Course not found or already deleted." }
      });
    }

    const courseTitle = existing[0].title;

    // Inspect related academic records to preserve data integrity (no destructive cascading delete)
    const [enrollCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?", [id]);
    const [lessonCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM lessons WHERE course_id = ?", [id]);
    const [assignCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM assignments WHERE course_id = ? AND deleted_at IS NULL", [id]);
    const [examCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM exams WHERE course_id = ?", [id]);
    const [sessionCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM sessions WHERE course_id = ? AND deleted_at IS NULL", [id]);
    const [certCountRows]: [any[], any] = await query("SELECT COUNT(*) as count FROM certificates WHERE course_id = ?", [id]);

    const preservedRelations = {
      enrollments: Number(enrollCountRows[0]?.count || 0),
      lessons: Number(lessonCountRows[0]?.count || 0),
      assignments: Number(assignCountRows[0]?.count || 0),
      exams: Number(examCountRows[0]?.count || 0),
      sessions: Number(sessionCountRows[0]?.count || 0),
      certificates: Number(certCountRows[0]?.count || 0)
    };

    // Soft-delete course and unpublish from landing page while keeping all student academic records intact
    await query("UPDATE courses SET deleted_at = NOW(), status = 'Inactive', is_published = 0 WHERE id = ?", [id]);
    await query("UPDATE cms_classes SET status = 'Draft' WHERE id = ?", [id]).catch(() => {});

    await query("INSERT INTO activity_logs (user_id, action, details) VALUES (?, 'DeleteCourse', ?)", [
      req.user!.id,
      `Archived/deleted course "${courseTitle}" (${id}) from active catalog (preserved ${preservedRelations.enrollments} enrollments, ${preservedRelations.assignments} assignments, ${preservedRelations.exams} exams)`
    ]);

    return res.json({
      success: true,
      data: { id, preservedRelations },
      message: `Course "${courseTitle}" removed from active catalog. Related academic records (${preservedRelations.enrollments} enrollments, ${preservedRelations.lessons} lessons, ${preservedRelations.assignments} assignments, ${preservedRelations.exams} exams) were safely preserved.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PUT /api/admin/courses/:id/teacher (Assign or change course teacher)
router.put("/courses/:id/teacher", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [existing]: [any[], any] = await query("SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course not found." } });
    }

    const { teacherId } = req.body;
    let teacherName = "Unassigned";

    if (teacherId) {
      const [tRows]: [any[], any] = await query("SELECT id, name FROM users WHERE id = ? AND role_id = 2 AND deleted_at IS NULL", [teacherId]);
      if (tRows.length === 0) {
        return res.status(400).json({ success: false, error: { code: "INVALID_TEACHER", message: "Selected user is not an active instructor." } });
      }
      teacherName = tRows[0].name;
    }

    await query("UPDATE courses SET teacher_id = ? WHERE id = ?", [teacherId || null, id]);
    await query("UPDATE cms_classes SET instructor = ? WHERE id = ?", [teacherName, id]).catch(() => {});

    return res.json({ success: true, message: "Course instructor updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// GET /api/admin/courses/:id/available-students (Students who can be added to course)
router.get("/courses/:id/available-students", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.email, u.avatar_url, u.phone
      FROM users u
      WHERE u.role_id = 3 AND u.deleted_at IS NULL
        AND u.id NOT IN (SELECT student_id FROM enrollments WHERE course_id = ?)
      ORDER BY u.name ASC
    `, [id]);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/admin/courses/:id/enroll (Admin enrolls a student)
router.post("/courses/:id/enroll", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId, seasonId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, error: { code: "MISSING_STUDENT", message: "Please select a student to enroll." } });
    }

    const [cRows]: [any[], any] = await query("SELECT id, title FROM courses WHERE id = ? AND deleted_at IS NULL", [id]);
    if (cRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "COURSE_NOT_FOUND", message: "Course not found." } });
    }
    const courseTitle = cRows[0].title;

    // Verify student exists
    const [uRows]: [any[], any] = await query("SELECT id, name, email FROM users WHERE id = ? AND deleted_at IS NULL", [studentId]);
    if (uRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "STUDENT_NOT_FOUND", message: "Student not found." } });
    }

    // Check duplicate
    const [existing]: [any[], any] = await query("SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?", [id, studentId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: { code: "ALREADY_ENROLLED", message: "Student is already enrolled in this course." } });
    }

    await query(`
      INSERT INTO enrollments (student_id, course_id, season_id, status, joined_date, progress, attendance_percentage, avg_grade)
      VALUES (?, ?, ?, 'Active', CURDATE(), 0, 100.00, 0.00)
    `, [studentId, id, seasonId || null]);

    // Synchronize exact students_count from enrollments
    await query(`
      UPDATE courses
      SET students_count = (
        SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.student_id = u.id WHERE e.course_id = ? AND u.deleted_at IS NULL
      )
      WHERE id = ?
    `, [id, id]);

    // Notify student
    await query(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'system', ?, ?)
    `, [studentId, `Enrolled in ${courseTitle}`, `An administrator has enrolled you in ${courseTitle}. Access your materials in My Courses.`]);

    return res.status(201).json({
      success: true,
      message: `Enrolled ${uRows[0].name} in ${courseTitle} successfully.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// DELETE /api/admin/courses/:id/enroll/:studentId (Admin removes student from course)
router.delete("/courses/:id/enroll/:studentId", async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    await query("DELETE FROM enrollments WHERE course_id = ? AND student_id = ?", [id, studentId]);
    await query(`
      UPDATE courses
      SET students_count = (
        SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.student_id = u.id WHERE e.course_id = ? AND u.deleted_at IS NULL
      )
      WHERE id = ?
    `, [id, id]);

    return res.json({ success: true, message: "Student removed from course." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// GET /api/admin/courses/:id/lessons (Get course syllabus)
router.get("/courses/:id/lessons", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: [any[], any] = await query(`
      SELECT id, title, description, duration, lesson_order, is_preview, status, video_url
      FROM lessons
      WHERE course_id = ?
      ORDER BY lesson_order ASC
    `, [id]);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/admin/courses/:id/lessons (Add lesson to syllabus)
router.post("/courses/:id/lessons", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, duration, lessonOrder, isPreview, videoUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: { code: "MISSING_TITLE", message: "Lesson title is required." } });
    }

    const lessonId = `lsn-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const order = lessonOrder ? Number(lessonOrder) : 1;

    await query(`
      INSERT INTO lessons (id, course_id, title, description, duration, lesson_order, is_preview, status, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Published', ?)
    `, [
      lessonId,
      id,
      title.trim(),
      description || "",
      duration || "45 mins",
      order,
      isPreview ? 1 : 0,
      videoUrl || null
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: lessonId,
        title: title.trim(),
        duration: duration || "45 mins",
        lessonOrder: order
      },
      message: "Lesson added to course syllabus."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PUT /api/admin/courses/:id/lessons/:lessonId (Update syllabus lesson)
router.put("/courses/:id/lessons/:lessonId", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, duration, lessonOrder, isPreview, videoUrl } = req.body;

    await query(`
      UPDATE lessons
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          duration = COALESCE(?, duration),
          lesson_order = COALESCE(?, lesson_order),
          is_preview = COALESCE(?, is_preview),
          video_url = COALESCE(?, video_url)
      WHERE id = ?
    `, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      duration || null,
      lessonOrder ? Number(lessonOrder) : null,
      isPreview !== undefined ? (isPreview ? 1 : 0) : null,
      videoUrl !== undefined ? videoUrl : null,
      lessonId
    ]);

    return res.json({ success: true, message: "Lesson updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// DELETE /api/admin/courses/:id/lessons/:lessonId (Delete lesson)
router.delete("/courses/:id/lessons/:lessonId", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    await query("DELETE FROM lessons WHERE id = ?", [lessonId]);
    return res.json({ success: true, message: "Lesson removed from syllabus." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// EXAMS MANAGEMENT FOR ADMINISTRATOR
// -------------------------------------------------------------

// GET /api/admin/exams (List of all exams)
router.get("/exams", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT e.*, c.title as course_title, u.name as teacher_name,
             (SELECT COUNT(*) FROM exam_submissions es WHERE es.exam_id = e.id) as submissions_count,
             (SELECT AVG(es.score) FROM exam_submissions es WHERE es.exam_id = e.id) as avg_score,
             (SELECT COUNT(*) FROM exam_submissions es WHERE es.exam_id = e.id AND es.passed = 1) as passed_count
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.teacher_id = u.id
      WHERE e.deleted_at IS NULL
      ORDER BY e.created_at DESC
    `);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      courseId: r.course_id,
      courseTitle: r.course_title || "General",
      teacherName: r.teacher_name || "Instructor",
      description: r.description || "",
      durationMinutes: r.duration_minutes || 60,
      dueDate: r.due_date ? (r.due_date instanceof Date ? r.due_date.toISOString().split("T")[0] : String(r.due_date)) : "",
      maxPoints: r.max_points || 100,
      passPercentage: r.pass_percentage || 60,
      status: r.status || "Published",
      submissionsCount: Number(r.submissions_count || 0),
      avgScore: Math.round(Number(r.avg_score || 0)),
      passRate: r.submissions_count > 0 ? Math.round((Number(r.passed_count || 0) / Number(r.submissions_count)) * 100) : 0
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/admin/exams (Create exam)
router.post("/exams", async (req: Request, res: Response) => {
  try {
    const { title, courseId, teacherId, description, durationMinutes, dueDate, maxPoints, passPercentage } = req.body;

    if (!title || !title.trim() || !courseId) {
      return res.status(400).json({ success: false, error: { code: "MISSING_FIELDS", message: "Title and Course are required." } });
    }

    const examId = `ex-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    await query(`
      INSERT INTO exams (id, course_id, teacher_id, title, description, duration_minutes, due_date, max_points, pass_percentage, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published')
    `, [
      examId,
      courseId,
      teacherId || null,
      title.trim(),
      description || "",
      durationMinutes ? Number(durationMinutes) : 60,
      dueDate || null,
      maxPoints ? Number(maxPoints) : 100,
      passPercentage ? Number(passPercentage) : 60
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: examId,
        title: title.trim(),
        courseId,
        message: "Exam created and published."
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// PATCH /api/admin/exams/:id/publish (Publish exam results)
router.patch("/exams/:id/publish", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query("UPDATE exams SET status = 'Graded' WHERE id = ?", [id]);
    return res.json({ success: true, message: "Exam results published." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// DELETE /api/admin/exams/:id (Delete exam)
router.delete("/exams/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query("UPDATE exams SET deleted_at = NOW() WHERE id = ?", [id]);
    return res.json({ success: true, message: "Exam removed." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
