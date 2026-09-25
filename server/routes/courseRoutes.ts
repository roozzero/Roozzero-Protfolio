import { Router, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db/pool";
import { requireAuth } from "../middleware/auth";

const router = Router();

// -------------------------------------------------------------
// GET /api/courses
// -------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.status = 'Published' AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `);

    // Fetch syllabus from cms_classes if stored there as well
    const [cmsClasses]: [any[], any] = await query("SELECT id, syllabus_json, tags_json FROM cms_classes");
    const cmsMap = new Map(cmsClasses.map(c => [c.id, c]));

    const courses = rows.map(r => {
      const cms = cmsMap.get(r.id);
      return {
        id: r.id,
        courseName: r.title,
        title: r.title,
        code: r.code,
        price: r.price,
        instructor: r.teacher_name || "Roozbeh",
        sessions: r.sessions_count || 16,
        description: r.description,
        shortDescription: r.short_description,
        courseImage: r.image,
        image: r.image,
        status: r.status,
        tags: cms?.tags_json || ["Engineering", "Web"],
        syllabus: cms?.syllabus_json || []
      };
    });

    return res.json({ success: true, data: courses });
  } catch (err: any) {
    console.error("[Get Courses Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to retrieve courses." } });
  }
});

// -------------------------------------------------------------
// GET /api/courses/:id
// -------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: [any[], any] = await query(
      `SELECT c.*, cat.name as category_name, u.name as teacher_name
       FROM courses c
       LEFT JOIN course_categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE (c.id = ? OR c.slug = ?) AND c.deleted_at IS NULL LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Course not found." } });
    }

    const course = rows[0];
    const [seasons]: [any[], any] = await query("SELECT * FROM course_seasons WHERE course_id = ? AND deleted_at IS NULL", [course.id]);
    const [sessions]: [any[], any] = await query("SELECT id, title, date, time, duration, status FROM sessions WHERE course_id = ? AND deleted_at IS NULL ORDER BY date ASC", [course.id]);

    return res.json({
      success: true,
      data: {
        ...course,
        seasons,
        sessions
      }
    });
  } catch (err: any) {
    console.error("[Get Course Detail Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to retrieve course details." } });
  }
});

// -------------------------------------------------------------
// GET /api/categories
// -------------------------------------------------------------
router.get("/meta/categories", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query("SELECT * FROM course_categories WHERE status = 'Active' ORDER BY name ASC");
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to retrieve categories." } });
  }
});

// -------------------------------------------------------------
// POST /api/courses/:id/enroll (Authenticated Student)
// -------------------------------------------------------------
router.post("/:id/enroll", requireAuth, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user!.id;
    const { seasonId } = req.body;

    // Check course exists & is active
    const [courses]: [any[], any] = await query("SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL", [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, error: { code: "COURSE_NOT_FOUND", message: "Course not found." } });
    }

    const course = courses[0];

    // Prevent duplicate enrollment
    const [existing]: [any[], any] = await query("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?", [studentId, courseId]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: "ALREADY_ENROLLED", message: "You are already enrolled in this course." }
      });
    }

    // Check season capacity if season specified
    if (seasonId) {
      const [seasonRows]: [any[], any] = await query("SELECT * FROM course_seasons WHERE id = ? LIMIT 1", [seasonId]);
      if (seasonRows.length > 0) {
        const season = seasonRows[0];
        const [enrolledCount]: [any[], any] = await query("SELECT COUNT(*) as count FROM enrollments WHERE season_id = ?", [seasonId]);
        if (season.max_capacity && enrolledCount[0].count >= season.max_capacity) {
          return res.status(400).json({
            success: false,
            error: { code: "CAPACITY_REACHED", message: "This course cohort has reached maximum capacity." }
          });
        }
      }
    }

    // If free course, activate immediately; otherwise set Pending until payment
    const isFree = !course.price || course.price.toLowerCase().includes("free") || course.price === "$0";
    const status = isFree ? "Active" : "Pending";

    await query(
      `INSERT INTO enrollments (student_id, course_id, season_id, status, joined_date, progress, attendance_percentage, avg_grade)
       VALUES (?, ?, ?, ?, CURDATE(), 0, 100.00, 0.00)`,
      [studentId, courseId, seasonId || null, status]
    );

    // Increment students_count in course
    await query("UPDATE courses SET students_count = students_count + 1 WHERE id = ?", [courseId]);

    // Create notification for student
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, 'Enrollment', ?, ?, '#dashboard')`,
      [studentId, `Enrolled in ${course.title}`, `Welcome to ${course.title}! Your curriculum and sessions are now accessible.`]
    );

    return res.status(201).json({
      success: true,
      data: {
        enrolled: true,
        courseId,
        status,
        message: isFree ? "Enrolled successfully!" : "Enrollment registered. Payment confirmation pending."
      }
    });
  } catch (err: any) {
    console.error("[Enrollment Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to complete enrollment." } });
  }
});

// -------------------------------------------------------------
// POST /api/courses/:id/registrations (From Landing CourseRegistrationModal)
// -------------------------------------------------------------
router.post("/:id/registrations", async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const { studentName, studentEmail, studentPhone, experienceLevel, notes } = req.body;

    if (!studentName || !studentEmail) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "Name and email are required." }
      });
    }

    const emailNorm = studentEmail.trim().toLowerCase();

    // Check course exists
    const [courses]: [any[], any] = await query("SELECT * FROM courses WHERE id = ? LIMIT 1", [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, error: { code: "COURSE_NOT_FOUND", message: "Course not found." } });
    }

    // Check if user exists or create student record
    let studentId: string;
    const [existingUsers]: [any[], any] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [emailNorm]);
    if (existingUsers.length > 0) {
      studentId = existingUsers[0].id;
    } else {
      studentId = `stu-${crypto.randomBytes(8).toString("hex")}`;
      const defaultHash = await (await import("bcryptjs")).default.hash("Welcome@123", 10);
      const username = emailNorm.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

      await query(
        `INSERT INTO users (id, username, email, password_hash, role_id, name, phone, status)
         VALUES (?, ?, ?, ?, 3, ?, ?, 'Active')`,
        [studentId, username, emailNorm, defaultHash, studentName, studentPhone || null]
      );
    }

    // Insert or update enrollment
    await query(
      `INSERT INTO enrollments (student_id, course_id, status, joined_date, notes)
       VALUES (?, ?, 'Active', CURDATE(), ?)
       ON DUPLICATE KEY UPDATE notes = ?`,
      [studentId, courseId, `Level: ${experienceLevel || "Beginner"}. Notes: ${notes || ""}`, `Level: ${experienceLevel || "Beginner"}. Notes: ${notes || ""}`]
    );

    // Notify student
    await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES (?, 'Registration', 'Course Registration Received', 'Your registration for ${courses[0].title} has been logged successfully.')`,
      [studentId]
    );

    return res.status(201).json({
      success: true,
      data: {
        registrationId: `reg-${Date.now()}`,
        studentId,
        courseId,
        message: "Registration received successfully!"
      }
    });
  } catch (err: any) {
    console.error("[Course Registration Modal Error]:", err);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: "Failed to submit course registration." } });
  }
});

export default router;
