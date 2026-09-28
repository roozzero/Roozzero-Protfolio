import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { query, getDbPool } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadResourceFile, uploadCorrectedFile } from "../middleware/upload";

const router = Router();

// Only Teachers & Administrators can access teacher management APIs
router.use(requireAuth, requireRole("Teacher", "Administrator"));

// Helper: Ensure teacher owns course or is Admin
async function verifyCourseOwnership(teacherId: string, courseId: string, roleName: string): Promise<boolean> {
  if (roleName === "Administrator" || roleName === "admin") return true;
  const [rows]: [any[], any] = await query("SELECT id FROM courses WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL", [courseId, teacherId]);
  return rows.length > 0;
}

// Middleware: Pre-check course ownership before resource upload to avoid saving unauthorized files
async function verifyCourseBeforeResourceUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = req.params.id;
    const teacherId = req.user!.id;
    const isAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    if (!isAdmin) {
      const [rows]: [any[], any] = await query(
        "SELECT id FROM courses WHERE id = ? AND teacher_id = ? AND deleted_at IS NULL",
        [courseId, teacherId]
      );
      if (rows.length === 0) {
        return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to add resources to this course." } });
      }
    }
    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// Middleware: Pre-check submission ownership before corrected file upload to avoid saving unauthorized files
async function verifySubmissionBeforeCorrectedUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const submissionId = req.params.id;
    const teacherId = req.user!.id;
    const isAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT sub.id, c.teacher_id
      FROM assignment_submissions sub
      INNER JOIN assignments a ON sub.assignment_id = a.id
      INNER JOIN courses c ON a.course_id = c.id
      WHERE sub.id = ? AND a.deleted_at IS NULL AND c.deleted_at IS NULL
    `, [submissionId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Submission not found." } });
    }

    if (!isAdmin && rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You are not authorized to upload corrected files for this submission." } });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

// -------------------------------------------------------------
// GET /api/teacher/dashboard
// -------------------------------------------------------------
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const courseFilter = isSuperAdmin ? "deleted_at IS NULL" : "teacher_id = ? AND deleted_at IS NULL";
    const courseParams = isSuperAdmin ? [] : [teacherId];

    const [courses]: [any[], any] = await query(`SELECT COUNT(*) as count FROM courses WHERE ${courseFilter}`, courseParams);
    const [students]: [any[], any] = await query(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE ${isSuperAdmin ? "c.deleted_at IS NULL" : "c.teacher_id = ? AND c.deleted_at IS NULL"}
    `, courseParams);

    const [sessions]: [any[], any] = await query(`
      SELECT COUNT(*) as count FROM sessions s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE ${isSuperAdmin ? "s.deleted_at IS NULL" : "c.teacher_id = ? AND s.deleted_at IS NULL"}
    `, courseParams);

    const [pendingSubs]: [any[], any] = await query(`
      SELECT COUNT(*) as count FROM assignment_submissions sub
      INNER JOIN assignments a ON sub.assignment_id = a.id
      INNER JOIN courses c ON a.course_id = c.id
      WHERE sub.status = 'Submitted' AND ${isSuperAdmin ? "a.deleted_at IS NULL" : "c.teacher_id = ? AND a.deleted_at IS NULL"}
    `, courseParams);

    return res.json({
      success: true,
      data: {
        totalCourses: courses[0].count,
        totalStudents: students[0].count,
        totalSessions: sessions[0].count,
        pendingSubmissions: pendingSubs[0].count
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/courses
// -------------------------------------------------------------
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as studentsCount,
             (SELECT COUNT(*) FROM sessions s WHERE s.course_id = c.id AND s.deleted_at IS NULL) as sessionsCount
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      WHERE ${isSuperAdmin ? "c.deleted_at IS NULL" : "c.teacher_id = ? AND c.deleted_at IS NULL"}
      ORDER BY c.created_at DESC
    `, isSuperAdmin ? [] : [teacherId]);

    const formatted = rows.map(r => ({
      id: r.id,
      title: r.title,
      code: r.code,
      studentsCount: r.studentsCount || 0,
      sessionsCount: r.sessionsCount || 0,
      progress: r.progress || 0,
      status: r.status,
      image: r.image
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/students (All students enrolled in teacher's courses)
// -------------------------------------------------------------
router.get("/students", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.status,
             e.progress, e.attendance_percentage as attendance, e.avg_grade as avgGrade, e.joined_date as joinedDate,
             c.id as courseId, c.title as courseTitle
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      INNER JOIN courses c ON e.course_id = c.id
      WHERE (${isSuperAdmin ? "1=1" : "c.teacher_id = ?"}) AND u.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY e.joined_date DESC
    `, isSuperAdmin ? [] : [teacherId]);

    const formatted = rows.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      courseId: s.courseId,
      courseTitle: s.courseTitle,
      progress: s.progress || 0,
      attendance: s.attendance || 100,
      avgGrade: s.avgGrade || 0,
      status: s.status,
      joinedDate: s.joinedDate ? (s.joinedDate instanceof Date ? s.joinedDate.toISOString().split("T")[0] : String(s.joinedDate).split("T")[0]) : ""
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/courses/:id/students
// -------------------------------------------------------------
router.get("/courses/:id/students", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user!.id;

    if (!(await verifyCourseOwnership(teacherId, courseId, req.user!.roleName))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not own this course." } });
    }

    const [rows]: [any[], any] = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.status,
             e.progress, e.attendance_percentage as attendance, e.avg_grade as avgGrade, e.joined_date as joinedDate,
             c.id as courseId, c.title as courseTitle
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.id
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.course_id = ? AND u.deleted_at IS NULL
    `, [courseId]);

    const formatted = rows.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      courseId: s.courseId,
      courseTitle: s.courseTitle,
      progress: s.progress || 0,
      attendance: s.attendance || 100,
      avgGrade: s.avgGrade || 0,
      status: s.status,
      joinedDate: s.joinedDate ? (s.joinedDate instanceof Date ? s.joinedDate.toISOString().split("T")[0] : String(s.joinedDate).split("T")[0]) : ""
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/sessions (All sessions for teacher's courses)
// -------------------------------------------------------------
router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT s.id, s.course_id as courseId, c.title as courseTitle, s.title, s.date, s.time, s.duration, s.link, s.status,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = s.course_id) as studentCount
      FROM sessions s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE (${isSuperAdmin ? "1=1" : "c.teacher_id = ?"}) AND s.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY s.date ASC
    `, isSuperAdmin ? [] : [teacherId]);

    const formatted = rows.map(sess => ({
      id: sess.id,
      courseId: sess.courseId,
      courseTitle: sess.courseTitle,
      title: sess.title,
      date: sess.date ? (sess.date instanceof Date ? sess.date.toISOString().split("T")[0] : String(sess.date).split("T")[0]) : "",
      time: sess.time,
      duration: sess.duration || "2 hours",
      link: sess.link || "",
      status: sess.status || "Scheduled",
      studentCount: sess.studentCount || 0
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/teacher/courses/:id/sessions
// -------------------------------------------------------------
router.post("/courses/:id/sessions", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user!.id;
    const { title, date, time, duration, link, status } = req.body;

    if (!(await verifyCourseOwnership(teacherId, courseId, req.user!.roleName))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not own this course." } });
    }

    const sessionId = `sess-${crypto.randomBytes(6).toString("hex")}`;
    await query(`
      INSERT INTO sessions (id, course_id, teacher_id, title, date, time, duration, link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [sessionId, courseId, teacherId, title, date, time, duration || "2 hours", link || null, status || "Scheduled"]);

    return res.status(201).json({
      success: true,
      data: {
        id: sessionId,
        courseId,
        title,
        date,
        time,
        duration,
        link,
        status: status || "Scheduled"
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/teacher/sessions/:id (Ownership verification enforced)
// -------------------------------------------------------------
router.put("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";
    const { title, date, time, duration, link, status } = req.body;

    // Verify session existence and course ownership
    const [rows]: [any[], any] = await query(`
      SELECT s.id, s.course_id, c.teacher_id
      FROM sessions s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE s.id = ? AND s.deleted_at IS NULL
    `, [sessionId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Session not found." } });
    }

    if (!isSuperAdmin && rows[0].teacher_id !== teacherId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to modify sessions belonging to other faculty." }
      });
    }

    await query(`
      UPDATE sessions
      SET title = COALESCE(?, title),
          date = COALESCE(?, date),
          time = COALESCE(?, time),
          duration = COALESCE(?, duration),
          link = COALESCE(?, link),
          status = COALESCE(?, status)
      WHERE id = ?
    `, [title, date, time, duration, link, status, sessionId]);

    return res.json({ success: true, message: "Session updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/teacher/sessions/:id (Ownership verification enforced)
// -------------------------------------------------------------
router.delete("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    // Verify session existence and course ownership
    const [rows]: [any[], any] = await query(`
      SELECT s.id, s.course_id, c.teacher_id
      FROM sessions s
      INNER JOIN courses c ON s.course_id = c.id
      WHERE s.id = ? AND s.deleted_at IS NULL
    `, [sessionId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Session not found." } });
    }

    if (!isSuperAdmin && rows[0].teacher_id !== teacherId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to delete sessions belonging to other faculty." }
      });
    }

    // Preserve soft-delete behavior
    await query("UPDATE sessions SET deleted_at = NOW() WHERE id = ?", [sessionId]);
    return res.json({ success: true, message: "Session removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/assignments (All assignments for teacher's courses)
// -------------------------------------------------------------
router.get("/assignments", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT a.id, a.course_id as courseId, c.title as courseTitle, a.title, a.description,
             a.publish_date as publishDate, a.due_date as dueDate, a.max_points as maxPoints, a.status
      FROM assignments a
      INNER JOIN courses c ON a.course_id = c.id
      WHERE (${isSuperAdmin ? "1=1" : "c.teacher_id = ?"}) AND a.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY a.due_date ASC
    `, isSuperAdmin ? [] : [teacherId]);

    const formatted = rows.map(ass => ({
      id: ass.id,
      courseId: ass.courseId,
      courseTitle: ass.courseTitle,
      title: ass.title,
      description: ass.description || "",
      publishDate: ass.publishDate ? (ass.publishDate instanceof Date ? ass.publishDate.toISOString().split("T")[0] : String(ass.publishDate).split("T")[0]) : "",
      dueDate: ass.dueDate ? (ass.dueDate instanceof Date ? ass.dueDate.toISOString().split("T")[0] : String(ass.dueDate).split("T")[0]) : "",
      maxPoints: ass.maxPoints || 100,
      status: ass.status || "Published",
      submissions: []
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/teacher/courses/:id/assignments
// -------------------------------------------------------------
router.post("/courses/:id/assignments", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const teacherId = req.user!.id;
    const { title, description, publishDate, dueDate, maxPoints, status } = req.body;

    if (!(await verifyCourseOwnership(teacherId, courseId, req.user!.roleName))) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not own this course." } });
    }

    const asgId = `asg-${crypto.randomBytes(6).toString("hex")}`;
    await query(`
      INSERT INTO assignments (id, course_id, teacher_id, title, description, publish_date, due_date, max_points, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [asgId, courseId, teacherId, title, description, publishDate || new Date(), dueDate, maxPoints || 100, status || "Published"]);

    return res.status(201).json({
      success: true,
      data: {
        id: asgId,
        courseId,
        title,
        description,
        publishDate,
        dueDate,
        maxPoints: maxPoints || 100,
        status: status || "Published",
        submissions: []
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/teacher/assignments/:id (Ownership verification enforced)
// -------------------------------------------------------------
router.put("/assignments/:id", async (req: Request, res: Response) => {
  try {
    const asgId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";
    const { title, description, dueDate, maxPoints, status } = req.body;

    const [rows]: [any[], any] = await query(`
      SELECT a.id, a.course_id, c.teacher_id
      FROM assignments a
      INNER JOIN courses c ON a.course_id = c.id
      WHERE a.id = ? AND a.deleted_at IS NULL
    `, [asgId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Assignment not found." } });
    }

    if (!isSuperAdmin && rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to modify this assignment." } });
    }

    await query(`
      UPDATE assignments
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          due_date = COALESCE(?, due_date),
          max_points = COALESCE(?, max_points),
          status = COALESCE(?, status)
      WHERE id = ?
    `, [title, description, dueDate, maxPoints, status, asgId]);

    return res.json({ success: true, message: "Assignment updated successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// DELETE /api/teacher/assignments/:id (Ownership verification enforced)
// -------------------------------------------------------------
router.delete("/assignments/:id", async (req: Request, res: Response) => {
  try {
    const asgId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT a.id, a.course_id, c.teacher_id
      FROM assignments a
      INNER JOIN courses c ON a.course_id = c.id
      WHERE a.id = ? AND a.deleted_at IS NULL
    `, [asgId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Assignment not found." } });
    }

    if (!isSuperAdmin && rows[0].teacher_id !== teacherId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to delete this assignment." } });
    }

    await query("UPDATE assignments SET deleted_at = NOW() WHERE id = ?", [asgId]);
    return res.json({ success: true, message: "Assignment removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// PUT /api/teacher/submissions/:id/grade (Items 12, 13, 14: Strict auth, validation, transaction)
// -------------------------------------------------------------
router.put("/submissions/:id/grade", async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";
    const { grade, feedback } = req.body;

    // 1. Find the submission, 2. Find assignment, 3. Find course
    const [subRows]: [any[], any] = await query(`
      SELECT sub.id, sub.student_id, sub.assignment_id,
             a.title as assignment_title, a.max_points,
             c.id as course_id, c.teacher_id
      FROM assignment_submissions sub
      INNER JOIN assignments a ON sub.assignment_id = a.id
      INNER JOIN courses c ON a.course_id = c.id
      WHERE sub.id = ? AND a.deleted_at IS NULL AND c.deleted_at IS NULL
    `, [submissionId]);

    if (subRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Submission or associated course not found." } });
    }

    const sub = subRows[0];

    // 4. Verify the authenticated teacher owns that course (Admins may grade any submission)
    if (!isSuperAdmin && sub.teacher_id !== teacherId) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to grade submissions for another instructor's course." }
      });
    }

    // Item 13: Validate grades
    if (grade === undefined || grade === null || grade === "") {
      return res.status(400).json({ success: false, error: { code: "MISSING_GRADE", message: "Grade score is required." } });
    }

    const numGrade = Number(grade);
    if (isNaN(numGrade) || !isFinite(numGrade)) {
      return res.status(400).json({ success: false, error: { code: "INVALID_GRADE", message: "Grade must be numeric." } });
    }

    if (numGrade < 0) {
      return res.status(400).json({ success: false, error: { code: "INVALID_GRADE", message: "Grade cannot be negative." } });
    }

    const maxPoints = sub.max_points != null ? Number(sub.max_points) : 100;
    if (numGrade > maxPoints) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_GRADE", message: `Grade cannot exceed the assignment maximum points (${maxPoints}).` }
      });
    }

    // Item 14: Make grading transactional
    const pool = getDbPool();
    if (!pool) {
      throw new Error("Database pool is unavailable");
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Step 1: Update submission
      await conn.query(`
        UPDATE assignment_submissions
        SET grade = ?, feedback = ?, status = 'Graded'
        WHERE id = ?
      `, [numGrade, feedback || null, submissionId]);

      // Step 2: Insert submission history
      await conn.query(`
        INSERT INTO submission_history (submission_id, grade, feedback, changed_by, notes)
        VALUES (?, ?, ?, ?, 'Grade and feedback updated by instructor')
      `, [submissionId, numGrade, feedback || null, teacherId]);

      // Step 3: Create notification for student
      await conn.query(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'Grade', 'Assignment Graded', ?, '#dashboard')
      `, [sub.student_id, `Your submission for '${sub.assignment_title}' has been graded: ${numGrade}/${maxPoints}.`]);

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return res.json({ success: true, message: "Submission graded successfully!" });
  } catch (err: any) {
    console.error("[Grading Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/teacher/submissions/:id/corrected-file (Item 15: Authorized before file handling)
// -------------------------------------------------------------
router.post(
  "/submissions/:id/corrected-file",
  verifySubmissionBeforeCorrectedUpload,
  uploadCorrectedFile.single("file"),
  async (req: Request, res: Response) => {
    try {
      const submissionId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: { code: "FILE_REQUIRED", message: "Please provide a corrected file." } });
      }

      await query(`
        UPDATE assignment_submissions
        SET corrected_file_name = ?, corrected_file_path = ?
        WHERE id = ?
      `, [file.originalname, `/uploads/corrected/${file.filename}`, submissionId]);

      return res.json({
        success: true,
        data: {
          fileName: file.originalname,
          filePath: `/uploads/corrected/${file.filename}`
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
);

// -------------------------------------------------------------
// POST /api/teacher/courses/:id/resources (Item 16: Ownership verified before upload)
// -------------------------------------------------------------
router.post(
  "/courses/:id/resources",
  verifyCourseBeforeResourceUpload,
  uploadResourceFile.single("file"),
  async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const teacherId = req.user!.id;
      const { title, description } = req.body;
      const file = req.file;

      const resId = `res-${crypto.randomBytes(6).toString("hex")}`;
      const fileType = file ? file.mimetype.split("/")[1] || "file" : "doc";
      const fileSize = file ? `${Math.round(file.size / 1024)} KB` : "1.0 MB";
      const filePath = file ? `/uploads/resources/${file.filename}` : null;

      await query(`
        INSERT INTO resources (id, title, description, course_id, teacher_id, file_name, stored_name, file_path, file_type, file_size, visibility, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Visible', CURDATE())
      `, [resId, title || "Course Material", description || null, courseId, teacherId, file ? file.originalname : "document", file ? file.filename : null, filePath, fileType, fileSize]);

      return res.status(201).json({
        success: true,
        data: {
          id: resId,
          title: title || "Course Material",
          fileType,
          fileSize,
          uploadedAt: new Date().toISOString().split("T")[0]
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  }
);

// -------------------------------------------------------------
// GET /api/teacher/resources (All resources for teacher's courses)
// -------------------------------------------------------------
router.get("/resources", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [rows]: [any[], any] = await query(`
      SELECT r.id, r.title, r.course_id as courseId, c.title as courseTitle,
             r.file_type as fileType, r.file_size as fileSize, r.uploaded_at as uploadedAt
      FROM resources r
      INNER JOIN courses c ON r.course_id = c.id
      WHERE (${isSuperAdmin ? "1=1" : "c.teacher_id = ?"}) AND r.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY r.uploaded_at DESC
    `, isSuperAdmin ? [] : [teacherId]);

    const formatted = rows.map(r => ({
      id: r.id,
      title: r.title,
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      fileType: r.fileType || "doc",
      fileSize: r.fileSize || "1.0 MB",
      uploadedAt: r.uploadedAt ? (r.uploadedAt instanceof Date ? r.uploadedAt.toISOString().split("T")[0] : String(r.uploadedAt).split("T")[0]) : ""
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/teacher/discussions (All discussion threads with replies)
// -------------------------------------------------------------
router.get("/discussions", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";

    const [threads]: [any[], any] = await query(`
      SELECT dt.id, dt.course_id as courseId, c.title as courseTitle,
             COALESCE(u.name, 'Student') as studentName,
             dt.title, dt.content as text, dt.created_at as time, dt.status
      FROM discussion_threads dt
      INNER JOIN courses c ON dt.course_id = c.id
      LEFT JOIN users u ON dt.student_id = u.id
      WHERE (${isSuperAdmin ? "1=1" : "c.teacher_id = ?"}) AND dt.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY dt.created_at DESC
    `, isSuperAdmin ? [] : [teacherId]);

    const threadIds = threads.map(t => t.id);
    let repliesMap = new Map<number | string, any[]>();

    if (threadIds.length > 0) {
      const placeholders = threadIds.map(() => "?").join(",");
      const [replies]: [any[], any] = await query(`
        SELECT dr.id, dr.thread_id, dr.content as text, dr.created_at as time,
               u.name as sender, r.name as role
        FROM discussion_replies dr
        LEFT JOIN users u ON dr.user_id = u.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE dr.thread_id IN (${placeholders})
        ORDER BY dr.created_at ASC
      `, threadIds);

      for (const rep of replies) {
        const list = repliesMap.get(rep.thread_id) || [];
        list.push({
          id: `rep-${rep.id}`,
          sender: rep.sender || "Instructor",
          role: rep.role === "Administrator" ? "Admin" : (rep.role || "Instructor"),
          time: rep.time ? (rep.time instanceof Date ? rep.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : String(rep.time)) : "Recent",
          text: rep.text
        });
        repliesMap.set(rep.thread_id, list);
      }
    }

    const formatted = threads.map(t => ({
      id: String(t.id),
      courseId: t.courseId,
      courseTitle: t.courseTitle,
      studentName: t.studentName,
      title: t.title,
      text: t.text,
      time: t.time ? (t.time instanceof Date ? t.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : String(t.time)) : "",
      status: t.status || "New",
      replies: repliesMap.get(t.id) || []
    }));

    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/teacher/discussions/:id/replies (Reply to discussion thread)
// -------------------------------------------------------------
router.post("/discussions/:id/replies", async (req: Request, res: Response) => {
  try {
    const threadId = req.params.id;
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator" || req.user!.roleName === "admin";
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: { code: "MISSING_TEXT", message: "Reply text is required." } });
    }

    // Verify thread existence and course ownership
    const [threads]: [any[], any] = await query(`
      SELECT dt.id, dt.course_id, dt.student_id, dt.title, c.teacher_id
      FROM discussion_threads dt
      INNER JOIN courses c ON dt.course_id = c.id
      WHERE dt.id = ? AND dt.deleted_at IS NULL AND c.deleted_at IS NULL
    `, [threadId]);

    if (threads.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Discussion thread not found." } });
    }

    if (!isSuperAdmin && threads[0].teacher_id !== teacherId) {
      return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "You are not authorized to reply to discussions in this course." } });
    }

    await query(`
      INSERT INTO discussion_replies (thread_id, user_id, content, created_at)
      VALUES (?, ?, ?, NOW())
    `, [threadId, teacherId, text.trim()]);

    await query("UPDATE discussion_threads SET status = 'Replied' WHERE id = ?", [threadId]);

    // Notify the student
    if (threads[0].student_id) {
      await query(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'Discussion', 'Instructor Replied', ?, '#dashboard')
      `, [threads[0].student_id, `Instructor replied to your question: "${threads[0].title}"`]);
    }

    return res.status(201).json({
      success: true,
      data: {
        id: `rep-${Date.now()}`,
        sender: req.user!.name,
        role: req.user!.roleName === "Administrator" ? "Admin" : "Instructor",
        time: "Just Now",
        text: text.trim()
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
