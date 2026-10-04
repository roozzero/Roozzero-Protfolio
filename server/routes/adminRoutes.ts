import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadProfile } from "../middleware/upload";

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
        OR (m.sender_id = ? AND EXISTS (SELECT 1 FROM internal_messages rep WHERE rep.reply_to_id = m.id))
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

      const effectiveSenderName = (msg.sender_id === adminId && lastReply) ? lastReply.sender_name : msg.sender_name;
      const effectiveSenderRole = (msg.sender_id === adminId && lastReply) ? lastReply.sender_role : msg.sender_role;
      const effectiveSenderAvatar = (msg.sender_id === adminId && lastReply) ? (lastReply.sender_avatar || null) : msg.sender_avatar;

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

export default router;
