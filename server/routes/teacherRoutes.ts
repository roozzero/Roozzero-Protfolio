import { Router, Request, Response } from "express";
import crypto from "crypto";
import { query } from "../db/pool";
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

// -------------------------------------------------------------
// GET /api/teacher/dashboard
// -------------------------------------------------------------
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const isSuperAdmin = req.user!.roleName === "Administrator";

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
    const isSuperAdmin = req.user!.roleName === "Administrator";

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
      phone: s.phone,
      courseId: s.courseId,
      courseTitle: s.courseTitle,
      progress: s.progress || 0,
      attendance: s.attendance || 100,
      avgGrade: s.avgGrade || 0,
      status: s.status,
      joinedDate: s.joinedDate ? s.joinedDate.toISOString().split("T")[0] : ""
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
// PUT /api/teacher/sessions/:id
// -------------------------------------------------------------
router.put("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { title, date, time, duration, link, status } = req.body;

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
// DELETE /api/teacher/sessions/:id
// -------------------------------------------------------------
router.delete("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    await query("UPDATE sessions SET deleted_at = NOW() WHERE id = ?", [sessionId]);
    return res.json({ success: true, message: "Session removed successfully." });
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
// PUT /api/teacher/submissions/:id/grade
// -------------------------------------------------------------
router.put("/submissions/:id/grade", async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;
    const teacherId = req.user!.id;
    const { grade, feedback } = req.body;

    if (grade === undefined) {
      return res.status(400).json({ success: false, error: { code: "MISSING_GRADE", message: "Grade score is required." } });
    }

    // Update submission
    await query(`
      UPDATE assignment_submissions
      SET grade = ?, feedback = ?, status = 'Graded'
      WHERE id = ?
    `, [grade, feedback || null, submissionId]);

    // Record submission history
    await query(`
      INSERT INTO submission_history (submission_id, grade, feedback, changed_by, notes)
      VALUES (?, ?, ?, ?, 'Grade and feedback updated by instructor')
    `, [submissionId, grade, feedback || null, teacherId]);

    // Fetch student ID to notify them
    const [subRows]: [any[], any] = await query("SELECT student_id, assignment_id FROM assignment_submissions WHERE id = ?", [submissionId]);
    if (subRows.length > 0) {
      const studentId = subRows[0].student_id;
      await query(`
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (?, 'Grade', 'Assignment Graded', ?, '#dashboard')
      `, [studentId, `Your assignment submission received a grade of ${grade}%.`]);
    }

    return res.json({ success: true, message: "Submission graded successfully!" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// POST /api/teacher/submissions/:id/corrected-file
// -------------------------------------------------------------
router.post("/submissions/:id/corrected-file", uploadCorrectedFile.single("file"), async (req: Request, res: Response) => {
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
});

// -------------------------------------------------------------
// POST /api/teacher/courses/:id/resources
// -------------------------------------------------------------
router.post("/courses/:id/resources", uploadResourceFile.single("file"), async (req: Request, res: Response) => {
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
});

export default router;
