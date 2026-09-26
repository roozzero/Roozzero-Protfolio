import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { query } from "../db/pool";
import { requireAuth } from "../middleware/auth";

const router = Router();
const UPLOAD_ROOT = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");

// -------------------------------------------------------------
// GET /api/files/submissions/:id (Protected)
// -------------------------------------------------------------
router.get("/submissions/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const subId = req.params.id;
    const userId = req.user!.id;
    const role = req.user!.roleName;

    const [rows]: [any[], any] = await query(`
      SELECT s.*, a.course_id, c.teacher_id
      FROM assignment_submissions s
      INNER JOIN assignments a ON s.assignment_id = a.id
      INNER JOIN courses c ON a.course_id = c.id
      WHERE s.id = ?
    `, [subId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Submission not found." } });
    }

    const sub = rows[0];

    // Authorization check: must be owner student, teacher of course, or admin
    const isOwner = sub.student_id === userId;
    const isTeacher = sub.teacher_id === userId;
    const isAdmin = role === "Administrator" || role === "admin";

    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You are not authorized to access this submission file." }
      });
    }

    const isCorrected = req.query.type === "corrected";
    const targetFilePath = isCorrected ? sub.corrected_file_path : sub.submitted_file_path;
    const targetFileName = isCorrected ? sub.corrected_file_name : sub.submitted_file_name;

    if (!targetFilePath) {
      return res.status(404).json({
        success: false,
        error: { code: "NO_FILE", message: isCorrected ? "No corrected file was attached to this submission." : "No file was attached to this submission." }
      });
    }

    // Secure path resolution to prevent path traversal
    const safeRelPath = targetFilePath.replace(/^\/uploads\//, "");
    const absolutePath = path.resolve(UPLOAD_ROOT, safeRelPath);

    if (!absolutePath.startsWith(UPLOAD_ROOT) || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, error: { code: "FILE_MISSING", message: "Physical file could not be found." } });
    }

    return res.download(absolutePath, targetFileName || path.basename(absolutePath));
  } catch (err: any) {
    console.error("[Download Submission Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// GET /api/files/resources/:id (Protected)
// -------------------------------------------------------------
router.get("/resources/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const resId = req.params.id;
    const userId = req.user!.id;
    const role = req.user!.roleName;

    const [rows]: [any[], any] = await query("SELECT * FROM resources WHERE id = ? AND deleted_at IS NULL", [resId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Resource not found." } });
    }

    const resource = rows[0];

    // Authorization: student must be enrolled, or teacher owns course, or admin
    const isAdmin = role === "Administrator" || role === "admin";
    const isTeacher = resource.teacher_id === userId;
    const [enrollment]: [any[], any] = await query("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Active'", [userId, resource.course_id]);
    const isEnrolled = enrollment.length > 0;

    if (!isAdmin && !isTeacher && !isEnrolled) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You must be actively enrolled in this course to download its resources." }
      });
    }

    // Log download count
    await query("INSERT INTO resource_downloads (resource_id, user_id) VALUES (?, ?)", [resId, userId]);

    if (!resource.file_path) {
      return res.status(404).json({ success: false, error: { code: "NO_FILE", message: "Resource file has no physical asset." } });
    }

    const safeRelPath = resource.file_path.replace(/^\/uploads\//, "");
    const absolutePath = path.resolve(UPLOAD_ROOT, safeRelPath);

    if (!absolutePath.startsWith(UPLOAD_ROOT) || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, error: { code: "FILE_MISSING", message: "Resource file is not found on disk." } });
    }

    return res.download(absolutePath, resource.file_name || path.basename(absolutePath));
  } catch (err: any) {
    console.error("[Download Resource Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
