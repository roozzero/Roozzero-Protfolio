import { Router, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db/pool";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

// -------------------------------------------------------------
// GET /api/courses
// -------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query(`
      SELECT c.*, cat.name as category_name, u.name as teacher_name,
             (
               SELECT COUNT(*)
               FROM enrollments e
               INNER JOIN users stu ON e.student_id = stu.id
               WHERE e.course_id = c.id AND stu.deleted_at IS NULL
             ) as real_students_count
      FROM courses c
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE (c.status = 'Published' OR c.is_published = 1) AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `);

    // Fetch syllabus from cms_classes if stored there as well
    const [cmsClasses]: [any[], any] = await query("SELECT id, syllabus_json, tags_json FROM cms_classes").catch(() => [[], []]);
    const cmsMap = new Map((cmsClasses || []).map((c: any) => [c.id, c]));

    const courses = rows.map((r: any, idx: number) => {
      let syllabusList: any[] = [];
      if (r.syllabus_json) {
        try {
          syllabusList = typeof r.syllabus_json === "string" ? JSON.parse(r.syllabus_json) : r.syllabus_json;
        } catch {}
      }
      const cms = cmsMap.get(r.id);
      let cmsTags: string[] = ["Engineering", "Web"];
      if (cms?.tags_json) {
        try {
          cmsTags = typeof cms.tags_json === "string" ? JSON.parse(cms.tags_json) : cms.tags_json;
        } catch {}
      }
      let cmsSyllabus: any[] = [];
      if (cms?.syllabus_json) {
        try {
          cmsSyllabus = typeof cms.syllabus_json === "string" ? JSON.parse(cms.syllabus_json) : cms.syllabus_json;
        } catch {}
      }
      const imgUrl = r.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";
      return {
        id: r.id,
        courseName: r.title,
        title: r.title,
        code: r.code,
        price: r.price || "$0",
        instructor: r.teacher_name || "Unassigned",
        teacherName: r.teacher_name || "Unassigned",
        studentsCount: Number(r.real_students_count ?? 0),
        sessions: r.sessions_count || 12,
        sessionsCount: r.sessions_count || 12,
        description: r.description || "",
        shortDescription: r.short_description || r.description || "",
        courseImage: imgUrl,
        image: imgUrl,
        status: "Published",
        displayOrder: idx,
        startDate: r.start_date ? String(r.start_date).split("T")[0] : "",
        endDate: r.end_date ? String(r.end_date).split("T")[0] : "",
        tags: Array.isArray(cmsTags) ? cmsTags : ["Engineering", "Web"],
        syllabus: (Array.isArray(syllabusList) && syllabusList.length > 0) ? syllabusList : (Array.isArray(cmsSyllabus) ? cmsSyllabus : [])
      };
    });

    return res.json({ success: true, data: courses });
  } catch (err: any) {
    console.error("[Get Published Courses Error]:", err);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to retrieve published courses from database." }
    });
  }
});

// -------------------------------------------------------------
// Static routes registered BEFORE dynamic /:id to prevent route shadowing
// GET /api/courses/meta/categories
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

    // Synchronize students_count in course from actual enrollments
    await query(`
      UPDATE courses
      SET students_count = (
        SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.student_id = u.id WHERE e.course_id = ? AND u.deleted_at IS NULL
      )
      WHERE id = ?
    `, [courseId, courseId]);

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
router.post("/:id/registrations", optionalAuth, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const { studentName, studentEmail, studentPhone, experienceLevel, notes } = req.body;

    // Check course exists
    const [courses]: [any[], any] = await query("SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL LIMIT 1", [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, error: { code: "COURSE_NOT_FOUND", message: "Course not found." } });
    }

    let studentId: string;
    let effectiveName: string;
    let effectiveEmail: string;

    if (req.user) {
      // Authenticated session is authoritative; never trust client-supplied identity fields
      studentId = req.user.id;
      effectiveName = req.user.name;
      effectiveEmail = req.user.email;
    } else {
      // Unauthenticated visitor must supply valid credentials
      if (!studentName || !studentEmail) {
        return res.status(400).json({
          success: false,
          error: { code: "MISSING_FIELDS", message: "Name and email are required." }
        });
      }
      effectiveName = studentName.trim();
      effectiveEmail = studentEmail.trim().toLowerCase();

      // Check if user exists or create normal user record (role_id = 4)
      const [existingUsers]: [any[], any] = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [effectiveEmail]);
      if (existingUsers.length > 0) {
        studentId = existingUsers[0].id;
      } else {
        studentId = `usr-${crypto.randomBytes(8).toString("hex")}`;
        const defaultHash = await (await import("bcryptjs")).default.hash(crypto.randomBytes(16).toString("hex"), 10);
        const username = `${effectiveEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_")}_${Math.floor(100 + Math.random() * 900)}`;

        await query(
          `INSERT INTO users (id, username, email, password_hash, role_id, name, phone, status)
           VALUES (?, ?, ?, ?, 4, ?, ?, 'Active')`,
          [studentId, username, effectiveEmail, defaultHash, effectiveName, studentPhone || null]
        );
      }
    }

    // Prevent duplicate registrations
    const [existingEnrollment]: [any[], any] = await query(
      "SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1",
      [studentId, courseId]
    );

    if (existingEnrollment.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          registrationId: existingEnrollment[0].id,
          studentId,
          courseId,
          alreadyRegistered: true,
          message: "You are already registered for this course."
        }
      });
    }

    // Persist registration in MySQL
    const regNotes = `Level: ${experienceLevel || "Intermediate"}. Notes: ${notes || ""}`.trim();
    await query(
      `INSERT INTO enrollments (student_id, course_id, status, joined_date, progress, attendance_percentage, avg_grade, notes)
       VALUES (?, ?, 'Active', CURDATE(), 0, 100.00, 0.00, ?)`,
      [studentId, courseId, regNotes]
    );

    // Update course student count from actual enrollments
    await query(`
      UPDATE courses
      SET students_count = (
        SELECT COUNT(*) FROM enrollments e INNER JOIN users u ON e.student_id = u.id WHERE e.course_id = ? AND u.deleted_at IS NULL
      )
      WHERE id = ?
    `, [courseId, courseId]);

    // Notify student
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, 'Registration', 'Course Registration Received', ?, '#dashboard')`,
      [studentId, `Your registration for ${courses[0].title} has been received and confirmed.`]
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
