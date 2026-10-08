import { Router, Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import { query } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadSubmission, uploadProfile } from "../middleware/upload";

const router = Router();

// Require Student (or Admin) for student portal endpoints
router.use(requireAuth, requireRole("Student", "Administrator"));

// -------------------------------------------------------------
// GET /api/student/profile
// -------------------------------------------------------------
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query("SELECT id, name, username, email, phone, bio, avatar_url, title_prefix, specialization FROM users WHERE id = ?", [studentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Student profile not found." } });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/student/profile
// -------------------------------------------------------------
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { name, firstName, lastName, username, email, phone, bio, specialization, avatarUrl } = req.body;

    // Determine target full name if firstName/lastName provided
    const resolvedName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : (firstName || lastName || undefined));

    // Check unique username if provided
    if (username) {
      const [existingUsername]: [any[], any] = await query(
        "SELECT id FROM users WHERE username = ? AND id != ? AND deleted_at IS NULL",
        [username, studentId]
      );
      if (existingUsername.length > 0) {
        return res.status(409).json({ success: false, error: { code: "USERNAME_TAKEN", message: "Username is already in use." } });
      }
    }

    // Check unique email if provided
    if (email) {
      const [existingEmail]: [any[], any] = await query(
        "SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL",
        [email, studentId]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({ success: false, error: { code: "EMAIL_TAKEN", message: "Email is already in use." } });
      }
    }

    const shouldUpdateAvatar = avatarUrl !== undefined;
    const finalAvatar = avatarUrl ? avatarUrl : null;

    await query(
      `UPDATE users
       SET name = COALESCE(?, name),
           username = COALESCE(?, username),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           bio = COALESCE(?, bio),
           specialization = COALESCE(?, specialization),
           avatar_url = CASE WHEN ? = 1 THEN ? ELSE avatar_url END
       WHERE id = ?`,
      [
        resolvedName || null,
        username || null,
        email || null,
        phone || null,
        bio || null,
        specialization || null,
        shouldUpdateAvatar ? 1 : 0,
        finalAvatar,
        studentId
      ]
    );

    const [updated]: [any[], any] = await query("SELECT id, name, username, email, phone, bio, avatar_url, specialization FROM users WHERE id = ?", [studentId]);
    return res.json({ success: true, data: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/profile/avatar
// -------------------------------------------------------------
router.post("/profile/avatar", uploadProfile.single("avatar"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No profile image provided." } });
    }
    const studentId = req.user!.id;
    const avatarUrl = `/uploads/profiles/${file.filename}`;
    await query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, studentId]);

    return res.json({
      success: true,
      data: {
        avatarUrl,
        message: "Profile image uploaded successfully."
      }
    });
  } catch (err: any) {
    console.error("[Avatar Upload Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/student/profile/avatar
// -------------------------------------------------------------
router.delete("/profile/avatar", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    await query("UPDATE users SET avatar_url = NULL WHERE id = ?", [studentId]);
    return res.json({ success: true, message: "Profile image removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/courses
// -------------------------------------------------------------
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT c.id, c.title, c.code, c.image, c.price, c.sessions_count,
             e.status as enrollment_status, e.progress, e.attendance_percentage, e.avg_grade, e.joined_date,
             u.name as teacher_name
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = ? AND c.deleted_at IS NULL
    `, [studentId]);

    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/sessions
// -------------------------------------------------------------
router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT s.id, s.course_id, s.title, s.description, s.date, s.time, s.duration, s.link, s.status,
             c.title as course_title,
             att.status as attendance_status
      FROM sessions s
      INNER JOIN enrollments e ON s.course_id = e.course_id
      INNER JOIN courses c ON s.course_id = c.id
      LEFT JOIN session_attendance att ON s.id = att.session_id AND att.student_id = ?
      WHERE e.student_id = ? AND e.status = 'Active' AND s.deleted_at IS NULL
      ORDER BY s.date ASC, s.time ASC
    `, [studentId, studentId]);

    const formatted = rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      courseTitle: r.course_title,
      title: r.title,
      date: r.date ? r.date.toISOString().split("T")[0] : "",
      time: r.time,
      duration: r.duration,
      link: r.link,
      status: r.status,
      attendanceStatus: r.attendance_status || "Pending"
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/assignments
// -------------------------------------------------------------
router.get("/assignments", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [assignments]: [any[], any] = await query(`
      SELECT a.id, a.course_id, a.title, a.description, a.publish_date, a.due_date, a.max_points, a.status,
             c.title as course_title,
             sub.id as submission_id, sub.submitted_at, sub.github_url, sub.status as submission_status, sub.grade, sub.feedback,
             sub.submitted_file_name, sub.submitted_file_path, sub.corrected_file_name, sub.corrected_file_path
      FROM assignments a
      INNER JOIN enrollments e ON a.course_id = e.course_id
      INNER JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE e.student_id = ? AND a.status = 'Published' AND a.deleted_at IS NULL
      ORDER BY a.due_date ASC
    `, [studentId, studentId]);

    const formatted = assignments.map(a => ({
      id: a.id,
      courseId: a.course_id,
      courseTitle: a.course_title,
      title: a.title,
      description: a.description,
      publishDate: a.publish_date ? a.publish_date.toISOString().split("T")[0] : "",
      dueDate: a.due_date ? a.due_date.toISOString().split("T")[0] : "",
      maxPoints: a.max_points,
      status: a.status,
      mySubmission: a.submission_id ? {
        id: a.submission_id,
        submittedAt: a.submitted_at,
        githubUrl: a.github_url,
        status: a.submission_status,
        grade: a.grade,
        feedback: a.feedback,
        fileName: a.submitted_file_name,
        filePath: a.submitted_file_path,
        correctedFileName: a.corrected_file_name,
        correctedFilePath: a.corrected_file_path
      } : null
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/assignments/:id/submit
// -------------------------------------------------------------
async function verifyStudentSubmissionEligibility(req: Request, res: Response, next: (err?: any) => void) {
  try {
    const userRole = (req.user?.roleName || "").toLowerCase();
    if (userRole !== "student" && userRole !== "administrator" && userRole !== "admin") {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Only enrolled students can submit coursework." } });
    }

    const assignmentId = req.params.id;
    const studentId = req.user!.id;

    // Verify assignment exists and not deleted
    const [assignments]: [any[], any] = await query(`
      SELECT a.*, c.id as course_exists
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.id AND c.deleted_at IS NULL
      WHERE a.id = ? AND a.deleted_at IS NULL
    `, [assignmentId]);

    if (assignments.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Assignment not found." } });
    }

    const assignment = assignments[0];
    if (!assignment.course_id || !assignment.course_exists) {
      return res.status(400).json({ success: false, error: { code: "INVALID_COURSE", message: "Assignment does not belong to an active course." } });
    }

    // Verify assignment is available for submission
    if (assignment.status !== "Published") {
      return res.status(400).json({ success: false, error: { code: "NOT_AVAILABLE", message: "Assignment is not currently available for submissions." } });
    }

    // Verify student is actively enrolled in the course
    if (userRole !== "administrator" && userRole !== "admin") {
      const [enrollments]: [any[], any] = await query(
        "SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Active'",
        [studentId, assignment.course_id]
      );

      if (enrollments.length === 0) {
        return res.status(403).json({
          success: false,
          error: { code: "NOT_ENROLLED", message: "You are not enrolled in the course for this assignment." }
        });
      }
    }

    (req as any).verifiedAssignment = assignment;
    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

router.post("/assignments/:id/submit", verifyStudentSubmissionEligibility, uploadSubmission.single("file"), async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user!.id; // Authoritative identity from session
    const { githubUrl, notes } = req.body;
    const assignment = (req as any).verifiedAssignment;

    // Evaluate deadline rules
    const isLate = assignment.due_date && new Date(assignment.due_date) < new Date();
    const submissionStatus = isLate ? "Late" : "Submitted";

    const subId = `sub-${crypto.randomBytes(8).toString("hex")}`;
    const file = req.file;

    // Insert or update submission
    await query(`
      INSERT INTO assignment_submissions
      (id, assignment_id, student_id, github_url, notes, status, submitted_file_name, submitted_file_path, submitted_file_size, submitted_file_type, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        github_url = VALUES(github_url),
        notes = VALUES(notes),
        status = VALUES(status),
        submitted_file_name = COALESCE(VALUES(submitted_file_name), submitted_file_name),
        submitted_file_path = COALESCE(VALUES(submitted_file_path), submitted_file_path),
        submitted_file_size = COALESCE(VALUES(submitted_file_size), submitted_file_size),
        submitted_file_type = COALESCE(VALUES(submitted_file_type), submitted_file_type),
        submitted_at = NOW()
    `, [
      subId,
      assignmentId,
      studentId,
      githubUrl || null,
      notes || null,
      submissionStatus,
      file ? file.originalname : null,
      file ? `/uploads/submissions/${file.filename}` : null,
      file ? `${Math.round(file.size / 1024)} KB` : null,
      file ? file.mimetype : null
    ]);

    // Log in submission history
    await query(`
      INSERT INTO submission_history (submission_id, changed_by, notes)
      VALUES (?, ?, 'Assignment submitted by student')
    `, [subId, studentId]);

    // Notify assigned teacher
    if (assignment.teacher_id) {
      await query(`
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (?, 'Submission', 'New Assignment Submission', ?)
      `, [assignment.teacher_id, `${req.user!.name} submitted '${assignment.title}'`]);
    }

    return res.status(201).json({
      success: true,
      data: {
        submissionId: subId,
        status: submissionStatus,
        message: isLate ? "Assignment submitted (flagged as late)." : "Assignment submitted successfully!"
      }
    });
  } catch (err: any) {
    console.error("[Assignment Submission Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to submit assignment." } });
  }
});

// -------------------------------------------------------------
// GET /api/student/grades
// -------------------------------------------------------------
router.get("/grades", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT g.*, c.title as course_title, a.title as assignment_title
      FROM grades g
      INNER JOIN courses c ON g.course_id = c.id
      INNER JOIN assignments a ON g.assignment_id = a.id
      WHERE g.student_id = ?
      ORDER BY g.published_date DESC
    `, [studentId]);

    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/resources
// -------------------------------------------------------------
router.get("/resources", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT r.id, r.title, r.description, r.course_id, r.file_type, r.file_size, r.uploaded_at, r.file_path,
             c.title as course_title
      FROM resources r
      INNER JOIN enrollments e ON r.course_id = e.course_id
      INNER JOIN courses c ON r.course_id = c.id
      WHERE e.student_id = ? AND r.visibility = 'Visible' AND r.deleted_at IS NULL
      ORDER BY r.uploaded_at DESC
    `, [studentId]);

    const formatted = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      courseId: r.course_id,
      courseTitle: r.course_title,
      fileType: r.file_type,
      fileSize: r.file_size,
      uploadedAt: r.uploaded_at ? r.uploaded_at.toISOString().split("T")[0] : "",
      downloadUrl: `/api/files/resources/${r.id}`
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/discussions
// -------------------------------------------------------------
router.get("/discussions", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [threads]: [any[], any] = await query(`
      SELECT d.*, c.title as course_title
      FROM discussion_threads d
      INNER JOIN enrollments e ON d.course_id = e.course_id
      INNER JOIN courses c ON d.course_id = c.id
      WHERE e.student_id = ? AND d.deleted_at IS NULL
      ORDER BY d.created_at DESC
    `, [studentId]);

    const result = [];
    for (const thread of threads) {
      const [replies]: [any[], any] = await query(
        "SELECT * FROM discussion_replies WHERE thread_id = ? ORDER BY created_at ASC",
        [thread.id]
      );
      result.push({
        id: thread.id,
        courseId: thread.course_id,
        courseTitle: thread.course_title,
        studentName: thread.student_name,
        title: thread.title,
        text: thread.text,
        time: thread.time || "Recent",
        status: thread.status,
        replies: replies.map(r => ({
          id: r.id,
          sender: r.sender_name,
          role: r.role,
          time: r.time,
          text: r.text
        }))
      });
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/discussions
// -------------------------------------------------------------
router.post("/discussions", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const studentName = req.user!.name;
    const { courseId, title, text } = req.body;

    if (!courseId || !title || !text) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required." } });
    }

    const threadId = `disc-${crypto.randomBytes(8).toString("hex")}`;
    await query(
      `INSERT INTO discussion_threads (id, course_id, student_id, student_name, title, text, time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Just now', 'New')`,
      [threadId, courseId, studentId, studentName, title, text]
    );

    return res.status(201).json({
      success: true,
      data: {
        id: threadId,
        courseId,
        studentName,
        title,
        text,
        time: "Just now",
        status: "New",
        replies: []
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/discussions/:id/replies
// -------------------------------------------------------------
router.post("/discussions/:id/replies", async (req: Request, res: Response) => {
  try {
    const threadId = req.params.id;
    const senderId = req.user!.id;
    const senderName = req.user!.name;
    const role = req.user!.roleName;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Reply text is required." } });
    }

    const replyId = `rep-${crypto.randomBytes(8).toString("hex")}`;
    await query(
      `INSERT INTO discussion_replies (id, thread_id, sender_id, sender_name, role, time, text)
       VALUES (?, ?, ?, ?, ?, 'Just now', ?)`,
      [replyId, threadId, senderId, senderName, role, text]
    );

    await query("UPDATE discussion_threads SET status = 'Replied' WHERE id = ?", [threadId]);

    return res.status(201).json({
      success: true,
      data: {
        id: replyId,
        sender: senderName,
        role,
        time: "Just now",
        text
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/announcements
// -------------------------------------------------------------
router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT a.*
      FROM announcements a
      WHERE a.status = 'Published' AND a.deleted_at IS NULL AND (
        a.course_id = 'all' OR a.course_id IN (
          SELECT course_id FROM enrollments WHERE student_id = ? AND status = 'Active'
        )
      )
      ORDER BY a.published_at DESC
    `, [studentId]);

    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/certificates
// -------------------------------------------------------------
router.get("/certificates", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query("SELECT * FROM certificates WHERE student_id = ?", [studentId]);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/calendar
// -------------------------------------------------------------
router.get("/calendar", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [events]: [any[], any] = await query(`
      SELECT e.id, e.title, e.type, e.date, e.time, e.duration, e.course_id, c.title as course_title
      FROM calendar_events e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.course_id IS NULL OR e.course_id IN (
        SELECT course_id FROM enrollments WHERE student_id = ? AND status = 'Active'
      )
      ORDER BY e.date ASC
    `, [studentId]);

    const formatted = events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date ? e.date.toISOString().split("T")[0] : "",
      time: e.time,
      duration: e.duration,
      courseId: e.course_id,
      courseTitle: e.course_title
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/notifications
// -------------------------------------------------------------
router.get("/notifications", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [rows]: [any[], any] = await query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId]);
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PATCH /api/notifications/:id/read
// -------------------------------------------------------------
router.patch("/notifications/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [id, userId]);
    return res.json({ success: true, message: "Notification marked as read." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/messages (Student Inbox Messages from MySQL)
// -------------------------------------------------------------
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;

    const [rows]: [any[], any] = await query(`
      SELECT 
        m.id,
        m.reply_to_id,
        m.sender_id,
        m.sender_name,
        m.sender_role,
        m.recipient_type,
        m.subject,
        m.content,
        m.attachments_json,
        m.created_at,
        COALESCE(r.is_read, 0) as is_read
      FROM internal_messages m
      LEFT JOIN internal_message_recipients r ON m.id = r.message_id AND r.recipient_id = ?
      WHERE (r.recipient_id = ? OR m.recipient_type = 'AllStudents' OR (m.recipient_type = 'Individual' AND m.recipient_id = ?))
        AND m.reply_to_id IS NULL
      ORDER BY m.created_at DESC
      LIMIT 100
    `, [studentId, studentId, studentId]);

    const formatted = rows.map((r: any) => {
      const d = new Date(r.created_at);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const roleSuffix = r.sender_role === "admin" ? " (Academy Admin)" : r.sender_role === "teacher" ? " (Instructor)" : "";

      return {
        id: r.id,
        from: `${r.sender_name}${roleSuffix}`,
        senderId: r.sender_id,
        senderName: r.sender_name,
        senderRole: r.sender_role,
        subject: r.subject,
        body: r.content,
        content: r.content,
        date: dateStr,
        timestamp: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        read: Boolean(r.is_read),
        attachments: r.attachments_json ? JSON.parse(r.attachments_json) : []
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error("[Student Get Messages Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PATCH /api/student/messages/:id/read
// -------------------------------------------------------------
router.patch("/messages/:id/read", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.id;

    const [existing]: [any[], any] = await query("SELECT id FROM internal_message_recipients WHERE message_id = ? AND recipient_id = ?", [id, studentId]);
    if (existing.length > 0) {
      await query("UPDATE internal_message_recipients SET is_read = 1, read_at = NOW() WHERE message_id = ? AND recipient_id = ?", [id, studentId]);
    } else {
      await query("INSERT INTO internal_message_recipients (message_id, recipient_id, is_read, read_at) VALUES (?, ?, 1, NOW())", [id, studentId]);
    }

    return res.json({ success: true, message: "Message marked as read." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/messages/:id/reply
// -------------------------------------------------------------
router.post("/messages/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const studentId = req.user!.id;
    const studentName = req.user!.name || "Student";

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, error: { code: "REPLY_EMPTY", message: "Reply text is required." } });
    }

    const [parent]: [any[], any] = await query("SELECT * FROM internal_messages WHERE id = ?", [id]);
    if (parent.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Original message not found." } });
    }

    const orig = parent[0];
    const replyId = `rep_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const targetUserId = orig.sender_id;

    await query(`
      INSERT INTO internal_messages (id, reply_to_id, sender_id, sender_name, sender_role, recipient_type, recipient_id, recipient_name, subject, content)
      VALUES (?, ?, ?, ?, 'student', 'Individual', ?, ?, ?, ?)
    `, [replyId, id, studentId, studentName, targetUserId, orig.sender_name, `Re: ${orig.subject}`, replyText.trim()]);

    await query(`
      INSERT INTO internal_message_recipients (message_id, recipient_id, is_read)
      VALUES (?, ?, 0)
    `, [replyId, targetUserId]);

    await query(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'message', ?, ?)
    `, [targetUserId, `Student Reply: ${orig.subject}`, `${studentName} replied: "${replyText.trim().substring(0, 100)}"`]);

    return res.json({ success: true, message: "Reply dispatched successfully." });
  } catch (err: any) {
    console.error("[Student Reply Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/student/messages/send (Student Sends Message to Admin/Teacher)
// -------------------------------------------------------------
router.post("/messages/send", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const studentName = req.user!.name || "Student";
    const { targetUserId, subject, content } = req.body;

    if (!subject || !subject.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Subject and message are required." } });
    }

    const targetRecipientId = targetUserId || "admin-1";
    const [recipientUser]: [any[], any] = await query("SELECT name FROM users WHERE id = ?", [targetRecipientId]);
    const recipientName = recipientUser.length > 0 ? recipientUser[0].name : "Administrator";

    const messageId = `msg_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    await query(`
      INSERT INTO internal_messages (id, sender_id, sender_name, sender_role, recipient_type, recipient_id, recipient_name, subject, content)
      VALUES (?, ?, ?, 'student', 'Individual', ?, ?, ?, ?)
    `, [messageId, studentId, studentName, targetRecipientId, recipientName, subject.trim(), content.trim()]);

    await query(`
      INSERT INTO internal_message_recipients (message_id, recipient_id, is_read)
      VALUES (?, ?, 0)
    `, [messageId, targetRecipientId]);

    await query(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'message', ?, ?)
    `, [targetRecipientId, `Student Inquiry: ${subject.trim()}`, `${studentName}: "${content.trim().substring(0, 100)}"`]);

    return res.json({ success: true, data: { id: messageId, message: "Inquiry sent successfully." } });
  } catch (err: any) {
    console.error("[Student Send Message Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/student/exams (Student's exams from enrolled courses)
// -------------------------------------------------------------
router.get("/exams", async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.id;
    const [rows]: [any[], any] = await query(`
      SELECT e.*, c.title as course_title, u.name as teacher_name,
             es.id as submission_id, es.score as student_score, es.passed as student_passed,
             es.status as submission_status, es.submitted_at as student_submitted_at, es.feedback as student_feedback
      FROM exams e
      JOIN enrollments en ON e.course_id = en.course_id AND en.student_id = ?
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.teacher_id = u.id
      LEFT JOIN exam_submissions es ON e.id = es.exam_id AND es.student_id = ?
      WHERE e.deleted_at IS NULL AND e.status IN ('Published', 'Graded')
      ORDER BY e.due_date ASC, e.created_at DESC
    `, [studentId, studentId]);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      courseId: r.course_id,
      courseTitle: r.course_title,
      teacherName: r.teacher_name || "Instructor",
      description: r.description || "",
      durationMinutes: r.duration_minutes || 60,
      dueDate: r.due_date ? (r.due_date instanceof Date ? r.due_date.toISOString().split("T")[0] : String(r.due_date)) : "",
      maxPoints: r.max_points || 100,
      passPercentage: r.pass_percentage || 60,
      status: r.status,
      submission: r.submission_id ? {
        id: r.submission_id,
        score: r.student_score,
        passed: Boolean(r.student_passed),
        status: r.submission_status,
        submittedAt: r.student_submitted_at,
        feedback: r.student_feedback
      } : null
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error("[Student Exams Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// POST /api/student/exams/:id/submit
router.post("/exams/:id/submit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.id;
    const { notes } = req.body;

    const [exams]: [any[], any] = await query("SELECT * FROM exams WHERE id = ? AND deleted_at IS NULL", [id]);
    if (exams.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Exam not found." } });
    }

    const exam = exams[0];
    const subId = `exsub-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    
    // Simulate auto-eval or instructor submission: standard 85 score
    const score = Math.floor(75 + Math.random() * 20);
    const passed = score >= (exam.max_points * (exam.pass_percentage / 100));

    await query(`
      INSERT INTO exam_submissions (id, exam_id, student_id, score, passed, feedback, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Graded')
      ON DUPLICATE KEY UPDATE score = VALUES(score), passed = VALUES(passed), submitted_at = NOW()
    `, [subId, id, studentId, score, passed ? 1 : 0, notes || "Exam completed and scored successfully."]);

    return res.json({
      success: true,
      data: {
        submissionId: subId,
        score,
        passed,
        message: "Exam submitted successfully."
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
