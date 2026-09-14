import express from "express";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));

// Fallback database file path
const FALLBACK_DB_PATH = path.join(process.cwd(), "database", "fallback_db.json");

// Ensure database directory exists
if (!fs.existsSync(path.dirname(FALLBACK_DB_PATH))) {
  fs.mkdirSync(path.dirname(FALLBACK_DB_PATH), { recursive: true });
}

// Initial mock state for fallback / seed backup
const INITIAL_MOCK_STATE: Record<string, any> = {
  admin_profile: {
    name: "Jaden Smith",
    email: "admin@roozzero.dev",
    phone: "+98 9123456789",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    bio: "Super Administrator and Learning Management Architect. Orchestrating system-wide course allocations, credential signing, and academy security operations.",
    department: "LMS Administration",
    theme: "dark",
    titlePrefix: "Mr.",
    specialization: "Super Admin"
  },
  teacher_profile: {
    name: "Sarah Vance",
    email: "teacher@academy.local",
    phone: "+98 9123456789",
    department: "Computer Science & Interactive Design",
    bio: "Dr. Sarah Vance holds a Ph.D. in Software Engineering from MIT. She specializes in reactive programming models, human-computer interaction, and typography layouts.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    status: "online",
    theme: "dark",
    titlePrefix: "Dr.",
    specialization: "Full Stack Developer",
    socialLinks: {
      github: "https://github.com/sarah-vance-phd",
      twitter: "https://twitter.com/sarah_vance",
      instagram: "https://instagram.com/sarah_v",
      linkedin: "https://linkedin.com/in/sarah-vance-phd",
      telegram: "https://t.me/sarah_vance"
    }
  },
  lms_student_profile: {
    id: "stu-1",
    name: "Courtney Henry",
    email: "courtney.henry@academy.local",
    phone: "+1 (555) 234-5678",
    bio: "Junior developer specializing in reactive systems and interactive graphic design layouts.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    address: "West Loop, Chicago, IL",
    timezone: "GMT-5 (EST)",
    titlePrefix: "Ms.",
    specialization: "Software Engineering Student"
  },
  teacher_courses: [
    { id: "react-adv", title: "Advanced React & Architecture", code: "CS-402", studentsCount: 28, sessionsCount: 16, progress: 75, status: "Active", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop" },
    { id: "swiss-typo", title: "Swiss Typography & Editorial Layout", code: "DES-301", studentsCount: 18, sessionsCount: 12, progress: 90, status: "Active", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=300&auto=format&fit=crop" },
    { id: "ml-found", title: "AI & Machine Learning Foundations", code: "CS-501", studentsCount: 35, sessionsCount: 20, progress: 40, status: "Active", image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=300&auto=format&fit=crop" }
  ],
  teacher_students: [
    { id: "stu-1", name: "Courtney Henry", email: "courtney.henry@academy.local", phone: "+1 (555) 234-5678", courseId: "react-adv", courseTitle: "Advanced React & Architecture", progress: 88, attendance: 95, avgGrade: 92, status: "Active", joinedDate: "2026-04-10" },
    { id: "stu-2", name: "Cody Fisher", email: "cody.fisher@academy.local", phone: "+1 (555) 345-6789", courseId: "react-adv", courseTitle: "Advanced React & Architecture", progress: 94, attendance: 100, avgGrade: 96, status: "Active", joinedDate: "2026-04-12" },
    { id: "stu-3", name: "Esther Howard", email: "esther.howard@academy.local", phone: "+1 (555) 456-7890", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", progress: 72, attendance: 84, avgGrade: 78, status: "Active", joinedDate: "2026-05-01" },
    { id: "stu-4", name: "Eleanor Pena", email: "eleanor.pena@academy.local", phone: "+1 (555) 567-8901", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", progress: 100, attendance: 100, avgGrade: 98, status: "Active", joinedDate: "2026-05-03" },
    { id: "stu-5", name: "Jane Cooper", email: "jane.cooper@academy.local", phone: "+1 (555) 678-9012", courseId: "ml-found", courseTitle: "AI & Machine Learning Foundations", progress: 45, attendance: 90, avgGrade: 84, status: "Active", joinedDate: "2026-05-15" },
    { id: "stu-6", name: "Wade Warren", email: "wade.warren@academy.local", phone: "+1 (555) 789-0123", courseId: "ml-found", courseTitle: "AI & Machine Learning Foundations", progress: 32, attendance: 75, avgGrade: 68, status: "Active", joinedDate: "2026-05-18" },
    { id: "stu-7", name: "Robert Fox", email: "robert.fox@academy.local", phone: "+1 (555) 890-1234", courseId: "react-adv", courseTitle: "Advanced React & Architecture", progress: 0, attendance: 0, avgGrade: 0, status: "Inactive", joinedDate: "2026-06-01" }
  ],
  teacher_sessions: [
    { id: "sess-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "Architectural Patterns & Custom State Management", date: "2026-07-02", time: "10:00 AM", duration: "2 hours", link: "https://meet.google.com/abc-defg-hij", status: "Scheduled", studentCount: 28 },
    { id: "sess-2", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", title: "The Grid System & Spatial Layout Rules", date: "2026-07-02", time: "02:00 PM", duration: "1.5 hours", link: "https://meet.google.com/klm-nopq-rst", status: "Scheduled", studentCount: 18 },
    { id: "sess-3", courseId: "ml-found", courseTitle: "AI & Machine Learning Foundations", title: "Linear Regression & Feature Engineering", date: "2026-07-03", time: "11:00 AM", duration: "2.5 hours", link: "https://meet.google.com/uvw-xyz1-abc", status: "Scheduled", studentCount: 35 },
    { id: "sess-4", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "Performance Optimization & Fiber Tree Reconciliation", date: "2026-06-30", time: "10:00 AM", duration: "2 hours", link: "https://meet.google.com/abc-defg-hij", status: "Completed", studentCount: 26 }
  ],
  teacher_assignments: [
    { id: "asg-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", title: "Custom Reactive State Orchestrator", description: "Build a highly optimized reactive state management library from scratch.", publishDate: "2026-06-25", dueDate: "2026-07-10", maxPoints: 100, status: "Published", submissions: [
      { id: "sub-1-1", studentId: "stu-1", studentName: "Courtney Henry", submittedAt: "2026-06-29 14:32", githubUrl: "https://github.com/courtney-h/reactive-orchestrator", notes: "Optimized atomic re-renders.", status: "Submitted", grade: null, feedback: null },
      { id: "sub-1-2", studentId: "stu-2", studentName: "Cody Fisher", submittedAt: "2026-06-30 09:15", githubUrl: "https://github.com/codyfisher/react-state-atomic", notes: "Supports concurrent rendering.", status: "Graded", grade: 98, feedback: "Outstanding structural organization." }
    ]},
    { id: "asg-2", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", title: "Modernist Tri-Fold Poster Design", description: "Design a grid-aligned tri-fold brochure celebrating Swiss designers.", publishDate: "2026-06-20", dueDate: "2026-07-05", maxPoints: 100, status: "Published", submissions: [
      { id: "sub-2-1", studentId: "stu-4", studentName: "Eleanor Pena", submittedAt: "2026-06-28 17:05", githubUrl: "https://github.com/eleanor-p/swiss-grid-layout", notes: "Baseline grids are perfect.", status: "Submitted", grade: null, feedback: null }
    ]},
    { id: "asg-3", courseId: "ml-found", courseTitle: "AI & Machine Learning Foundations", title: "Gradient Descent Optimizer", description: "Implement Stochastic Gradient Descent from scratch.", publishDate: "2026-07-01", dueDate: "2026-07-18", maxPoints: 50, status: "Published", submissions: [] }
  ],
  teacher_discussions: [
    { id: "disc-1", courseId: "react-adv", courseTitle: "Advanced React & Architecture", studentName: "Courtney Henry", title: "Concurrent Mode & useTransition re-rendering", text: "Is there a fiber lane allocation table I can reference?", time: "10:05 AM", status: "New", replies: [
      { id: "rep-1-1", sender: "Dr. Sarah Vance", role: "Instructor", time: "11:20 AM", text: "Yes! React uses 31 lanes. Transition lanes are 6 to 21." }
    ]},
    { id: "disc-2", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", studentName: "Eleanor Pena", title: "Strict baseline grids in CSS tailwind layouts", text: "When managing spacing, should we rely strictly on leading-relaxed?", time: "Yesterday", status: "Replied", replies: [
      { id: "rep-2-1", sender: "Dr. Sarah Vance", role: "Instructor", time: "Yesterday", text: "Line-height in multiples of 4px is best." }
    ]}
  ],
  teacher_resources: [
    { id: "res-1", title: "Lecture 1: Fiber Tree Reconciliation Specs", courseId: "react-adv", courseTitle: "Advanced React & Architecture", fileType: "pdf", fileSize: "4.2 MB", uploadedAt: "2026-06-15" },
    { id: "res-2", title: "Full Course Syllabus & Reading Requirements (2026)", courseId: "react-adv", courseTitle: "Advanced React & Architecture", fileType: "doc", fileSize: "1.1 MB", uploadedAt: "2026-06-10" },
    { id: "res-3", title: "Baseline Layout Grids Templates", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", fileType: "zip", fileSize: "18.5 MB", uploadedAt: "2026-06-21" }
  ],
  teacher_announcements: [
    { id: "ann-1", title: "Midterm Assignment Instructions Published", description: " Boileplate instructions are now active on the assignments page.", courseId: "react-adv", courseTitle: "Advanced React & Architecture", audience: "All Students", publishedAt: "2026-06-25", status: "Published" },
    { id: "ann-2", title: "Guest Speaker: Typography Legend Erik Spiekermann", description: "Virtual guest lecture with iconic typographer Erik Spiekermann.", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", audience: "Design Department", publishedAt: "2026-06-28", status: "Published" }
  ],
  teacher_grades: [
    { id: "grd-1", studentId: "stu-1", studentName: "Courtney Henry", courseId: "react-adv", courseTitle: "Advanced React & Architecture", assignmentId: "asg-1", assignmentTitle: "Custom Reactive State Orchestrator", score: 95, maxPoints: 100, letterGrade: "A", publishedDate: "2026-07-01" },
    { id: "grd-2", studentId: "stu-2", studentName: "Cody Fisher", courseId: "react-adv", courseTitle: "Advanced React & Architecture", assignmentId: "asg-1", assignmentTitle: "Custom Reactive State Orchestrator", score: 98, maxPoints: 100, letterGrade: "A", publishedDate: "2026-06-30" }
  ],
  teacher_certificates: [
    { id: "cert-1", studentId: "stu-2", studentName: "Cody Fisher", courseId: "react-adv", courseTitle: "Advanced React & Architecture", gpa: 4.0, status: "Approved", issueDate: "2026-06-30" },
    { id: "cert-2", studentId: "stu-4", studentName: "Eleanor Pena", courseId: "swiss-typo", courseTitle: "Swiss Typography & Editorial Layout", gpa: 3.95, status: "Approved", issueDate: "2026-06-29" }
  ],
  teacher_calendar_events: [
    { id: "e1", title: "Advanced React Lecture", date: "2026-07-02", type: "Class", courseId: "react-adv", time: "10:00 AM" },
    { id: "e2", title: "Swiss Typography Seminar", date: "2026-07-02", type: "Class", courseId: "swiss-typo", time: "02:00 PM" }
  ],
  teacher_course_seasons: [
    { id: "season-1", name: "Summer 2026 Core Intake", courseId: "react-adv", courseTitle: "Advanced React & Architecture", startDate: "2026-06-01", endDate: "2026-08-31", maxCapacity: 25, registrationStatus: "Open", notes: "Core intake cohort.", status: "Active" }
  ],
  cms_current_config: {
    general: { websiteTitle: "Roozzero Academy", websiteDescription: "Creative engineering workspace", academyLogo: "", favicon: "", primaryColor: "#000000", secondaryColor: "#111111", accentColor: "#FF3B30", defaultFont: "Inter", enableDarkTheme: true, maintenanceMode: false },
    hero: { backgroundImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop", overlayOpacity: 0.65, overlayColor: "#050505", heroTitle: "ELEVATING DIGITAL CRAFTSMANSHIP", heroSubtitle: "Creative systems, layout structures, typography.", animatedTexts: ["Advanced React Systems", "Swiss Typography", "AI Engineering"], ctaButtonText: "Explore Classes", ctaButtonLink: "#classes", typingSpeed: 80, loopTyping: true, cursorStyle: "pipe", fadeAnimation: true },
    about: { sectionTitle: "WHO'S ME", subtitle: "Creative Engineering & Modernist Layouts", description: "Bridges absolute grid designs with fast reactive architectures.", personalImage: "", statistics: [{ label: "SATISFIED LEARNERS", value: "100%" }], socialLinks: {} },
    skills: [
      { id: "skill-1", name: "React & Virtual DOM", percentage: 98, icon: "Code2", enabled: true, displayOrder: 1 }
    ],
    projects: [
      { id: "proj-1", title: "Reconciliation Inspector", description: "Debugging visualizer.", coverImage: "", galleryImages: [], technologies: ["React"], githubLink: "", liveDemoLink: "", category: "Core Software", displayOrder: 1, featured: true }
    ],
    classes: [
      { id: "react-adv", courseImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop", courseName: "Advanced React & Architecture", instructor: "Dr. Sarah Vance", price: "Free", description: "Master fiber reconciliation.", sessions: 16, status: "Published", displayOrder: 1, tags: ["React", "Performance"], syllabus: [] }
    ],
    students: [
      { id: "t-1", studentPhoto: "", studentName: "Courtney Henry", course: "Advanced React", rating: 5, review: "Excellent!", displayOrder: 1 }
    ],
    contact: { title: "GET IN TOUCH", description: "Send queries below.", email: "academy@roozzero.dev", phone: "", address: "", telegram: "", instagram: "", linkedin: "", github: "", submissionRecipientEmail: "schoepplake@gmail.com" },
    footer: { logo: "ROOZZERO", animatedText: "Modernist design and code.", copyright: "© 2026 Roozzero. All Rights Reserved.", footerButtonText: "Go to Top", footerButtonLink: "#", footerDescription: "Architectural honesty.", navigationLinks: [], socialLinks: [] },
    seo: { homepageTitle: "Roozzero Academy", metaDescription: "Modern education.", keywords: "react", ogTitle: "Roozzero", ogDescription: "Systems", ogImage: "", canonicalUrl: "", robotsSettings: "index, follow" },
    media: []
  }
};

// Lazy Database Helper Object
let dbPool: mysql.Pool | null = null;
let isConnectedToMySQL = false;

// Initialize MySQL Pool
function initDb() {
  if (dbPool) return dbPool;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;
  const password = process.env.DB_PASSWORD || "";
  const port = parseInt(process.env.DB_PORT || "3306", 10);

  if (host && user && database) {
    console.log(`[Database] Attempting to connect to MySQL database at ${host}:${port}/${database}...`);
    dbPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    return dbPool;
  } else {
    console.warn("[Database] MySQL configuration not complete in .env. Falling back to local file database.");
    return null;
  }
}

// Test Connection and Seed MySQL Tables dynamically if empty
async function verifyAndSeedMySQL() {
  const pool = initDb();
  if (!pool) return;

  try {
    const connection = await pool.getConnection();
    console.log("[Database] Connected to MySQL successfully.");
    isConnectedToMySQL = true;
    connection.release();

    // Check if roles table is populated as an indicator
    const [rows]: [any[], any] = await pool.query("SHOW TABLES LIKE 'roles'");
    if (rows.length > 0) {
      const [roleCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM roles");
      if (roleCount[0].count === 0) {
        console.log("[Database] Roles table is empty. Please run database/schema.sql in phpMyAdmin to seed initial database.");
      }
    }
  } catch (err: any) {
    console.error(`[Database] MySQL Connection Failed: ${err.message}. Using fallback JSON local file.`);
    isConnectedToMySQL = false;
  }
}

verifyAndSeedMySQL();

// Read current data state (consolidated)
async function getFullDataState() {
  // If MySQL is active, query real tables to generate consolidated state
  if (isConnectedToMySQL && dbPool) {
    try {
      console.log("[Database] Fetching data state from MySQL...");
      const state: Record<string, any> = {};

      // Users/Profiles query
      const [users]: [any[], any] = await dbPool.query("SELECT * FROM users");
      const admin = users.find(u => u.role_id === 1);
      const teacher = users.find(u => u.role_id === 2);
      const student = users.find(u => u.role_id === 3);

      if (admin) {
        state.admin_profile = {
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          photo: admin.avatar_url,
          bio: admin.bio,
          department: admin.department,
          titlePrefix: admin.title_prefix,
          specialization: admin.specialization,
          theme: "dark"
        };
      } else {
        state.admin_profile = INITIAL_MOCK_STATE.admin_profile;
      }

      if (teacher) {
        state.teacher_profile = {
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          bio: teacher.bio,
          photo: teacher.avatar_url,
          department: teacher.department,
          titlePrefix: teacher.title_prefix,
          specialization: teacher.specialization,
          status: teacher.status === "Active" ? "online" : "offline",
          theme: "dark"
        };
      } else {
        state.teacher_profile = INITIAL_MOCK_STATE.teacher_profile;
      }

      if (student) {
        state.lms_student_profile = {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          bio: student.bio,
          avatar: student.avatar_url,
          titlePrefix: student.title_prefix,
          specialization: student.specialization
        };
      } else {
        state.lms_student_profile = INITIAL_MOCK_STATE.lms_student_profile;
      }

      // Courses Table
      const [courses]: [any[], any] = await dbPool.query("SELECT * FROM courses WHERE deleted_at IS NULL");
      state.teacher_courses = courses.map(c => ({
        id: c.id,
        title: c.title,
        code: c.code,
        studentsCount: c.students_count,
        sessionsCount: c.sessions_count,
        progress: c.progress,
        status: c.status,
        image: c.image
      }));

      // Students
      const [students]: [any[], any] = await dbPool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.status, e.course_id, e.progress, e.attendance_percentage as attendance, e.avg_grade as avgGrade, e.joined_date as joinedDate, c.title as courseTitle
        FROM users u
        INNER JOIN enrollments e ON u.id = e.student_id
        INNER JOIN courses c ON e.course_id = c.id
        WHERE u.role_id = 3 AND u.deleted_at IS NULL
      `);
      state.teacher_students = students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        courseId: s.course_id,
        courseTitle: s.courseTitle,
        progress: s.progress,
        attendance: s.attendance,
        avgGrade: s.avgGrade,
        status: s.status,
        joinedDate: s.joinedDate ? s.joinedDate.toISOString().split("T")[0] : ""
      }));

      // Sessions
      const [sessions]: [any[], any] = await dbPool.query(`
        SELECT s.*, c.title as courseTitle
        FROM sessions s
        INNER JOIN courses c ON s.course_id = c.id
        WHERE s.deleted_at IS NULL
      `);
      state.teacher_sessions = sessions.map(s => ({
        id: s.id,
        courseId: s.course_id,
        courseTitle: s.courseTitle,
        title: s.title,
        date: s.date ? s.date.toISOString().split("T")[0] : "",
        time: s.time,
        duration: s.duration,
        link: s.link,
        status: s.status,
        studentCount: s.student_count
      }));

      // Assignments & Submissions
      const [assignments]: [any[], any] = await dbPool.query(`
        SELECT a.*, c.title as courseTitle
        FROM assignments a
        INNER JOIN courses c ON a.course_id = c.id
        WHERE a.deleted_at IS NULL
      `);
      
      const loadedAssignments = [];
      for (const a of assignments) {
        const [subs]: [any[], any] = await dbPool.query(`
          SELECT s.*, u.name as studentName
          FROM assignment_submissions s
          INNER JOIN users u ON s.student_id = u.id
          WHERE s.assignment_id = ?
        `, [a.id]);

        loadedAssignments.push({
          id: a.id,
          courseId: a.course_id,
          courseTitle: a.courseTitle,
          title: a.title,
          description: a.description,
          publishDate: a.publish_date ? a.publish_date.toISOString().split("T")[0] : "",
          dueDate: a.due_date ? a.due_date.toISOString().split("T")[0] : "",
          maxPoints: a.max_points,
          status: a.status,
          submissions: subs.map(sub => ({
            id: sub.id,
            studentId: sub.student_id,
            studentName: sub.studentName,
            submittedAt: sub.submitted_at,
            githubUrl: sub.github_url,
            notes: sub.notes,
            status: sub.status,
            grade: sub.grade,
            feedback: sub.feedback
          }))
        });
      }
      state.teacher_assignments = loadedAssignments;

      // Discussions
      const [discussions]: [any[], any] = await dbPool.query("SELECT d.*, c.title as courseTitle FROM discussion_threads d INNER JOIN courses c ON d.course_id = c.id WHERE d.deleted_at IS NULL");
      const loadedThreads = [];
      for (const d of discussions) {
        const [replies]: [any[], any] = await dbPool.query("SELECT * FROM discussion_replies WHERE thread_id = ?", [d.id]);
        loadedThreads.push({
          id: d.id,
          courseId: d.course_id,
          courseTitle: d.courseTitle,
          studentName: d.student_name,
          title: d.title,
          text: d.text,
          time: d.time,
          status: d.status,
          replies: replies.map(r => ({
            id: r.id,
            sender: r.sender_name,
            role: r.role,
            time: r.time,
            text: r.text
          }))
        });
      }
      state.teacher_discussions = loadedThreads;

      // Resources
      const [resources]: [any[], any] = await dbPool.query("SELECT r.*, c.title as courseTitle FROM resources r INNER JOIN courses c ON r.course_id = c.id WHERE r.deleted_at IS NULL");
      state.teacher_resources = resources.map(r => ({
        id: r.id,
        title: r.title,
        courseId: r.course_id,
        courseTitle: r.courseTitle,
        fileType: r.file_type,
        fileSize: r.file_size,
        uploadedAt: r.uploaded_at ? r.uploaded_at.toISOString().split("T")[0] : ""
      }));

      // Announcements
      const [announcements]: [any[], any] = await dbPool.query("SELECT * FROM announcements WHERE deleted_at IS NULL");
      state.teacher_announcements = announcements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        courseId: a.course_id,
        courseTitle: a.course_title,
        audience: a.audience,
        publishedAt: a.published_at ? a.published_at.toISOString().split("T")[0] : "",
        status: a.status
      }));

      // Calendar Events
      const [events]: [any[], any] = await dbPool.query("SELECT * FROM calendar_events");
      state.teacher_calendar_events = events.map(e => ({
        id: e.id,
        title: e.title,
        type: e.type,
        date: e.date ? e.date.toISOString().split("T")[0] : "",
        time: e.time,
        duration: e.duration,
        courseId: e.course_id
      }));

      // Seasons
      const [seasons]: [any[], any] = await dbPool.query("SELECT s.*, c.title as courseTitle FROM course_seasons s INNER JOIN courses c ON s.course_id = c.id WHERE s.deleted_at IS NULL");
      state.teacher_course_seasons = seasons.map(s => ({
        id: s.id,
        name: s.name,
        courseId: s.course_id,
        courseTitle: s.courseTitle,
        startDate: s.start_date ? s.start_date.toISOString().split("T")[0] : "",
        endDate: s.end_date ? s.end_date.toISOString().split("T")[0] : "",
        maxCapacity: s.max_capacity,
        registrationStatus: s.registration_status,
        notes: s.notes,
        status: s.status
      }));

      // Certificates
      const [certs]: [any[], any] = await dbPool.query("SELECT * FROM certificates");
      state.teacher_certificates = certs.map(c => ({
        id: c.id,
        studentId: c.student_id,
        studentName: c.student_name,
        courseId: c.course_id,
        courseTitle: c.course_title,
        gpa: parseFloat(c.gpa),
        status: c.status,
        issueDate: c.issue_date ? c.issue_date.toISOString().split("T")[0] : ""
      }));

      // Grades
      const [grades]: [any[], any] = await dbPool.query("SELECT * FROM grades");
      state.teacher_grades = grades.map(g => ({
        id: g.id,
        studentId: g.student_id,
        studentName: g.student_name,
        courseId: g.course_id,
        courseTitle: g.course_title,
        assignmentId: g.assignment_id,
        assignmentTitle: g.assignment_title,
        score: g.score,
        maxPoints: g.max_points,
        letterGrade: g.letter_grade,
        publishedDate: g.published_date ? g.published_date.toISOString().split("T")[0] : ""
      }));

      // CMS Section config loader
      const [general]: [any[], any] = await dbPool.query("SELECT * FROM cms_general_settings LIMIT 1");
      const [hero]: [any[], any] = await dbPool.query("SELECT * FROM cms_hero_section LIMIT 1");
      const [about]: [any[], any] = await dbPool.query("SELECT * FROM cms_about_me LIMIT 1");
      const [stats]: [any[], any] = await dbPool.query("SELECT * FROM cms_about_statistics ORDER BY display_order");
      const [skills]: [any[], any] = await dbPool.query("SELECT * FROM cms_skills ORDER BY display_order");
      const [projects]: [any[], any] = await dbPool.query("SELECT * FROM cms_projects ORDER BY display_order");
      const [classes]: [any[], any] = await dbPool.query("SELECT * FROM cms_classes ORDER BY display_order");
      const [testimonials]: [any[], any] = await dbPool.query("SELECT * FROM cms_testimonials ORDER BY display_order");
      const [contact]: [any[], any] = await dbPool.query("SELECT * FROM cms_contact_settings LIMIT 1");
      const [footer]: [any[], any] = await dbPool.query("SELECT * FROM cms_footer_settings LIMIT 1");
      const [seo]: [any[], any] = await dbPool.query("SELECT * FROM cms_seo_settings LIMIT 1");

      state.cms_current_config = {
        general: general[0] ? {
          websiteTitle: general[0].website_title,
          websiteDescription: general[0].website_description,
          academyLogo: general[0].academy_logo,
          favicon: general[0].favicon,
          primaryColor: general[0].primary_color,
          secondaryColor: general[0].secondary_color,
          accentColor: general[0].accent_color,
          defaultFont: general[0].default_font,
          enableDarkTheme: !!general[0].enable_dark_theme,
          maintenanceMode: !!general[0].maintenance_mode
        } : INITIAL_MOCK_STATE.cms_current_config.general,

        hero: hero[0] ? {
          backgroundImage: hero[0].background_image,
          overlayOpacity: parseFloat(hero[0].overlay_opacity),
          overlayColor: hero[0].overlay_color,
          heroTitle: hero[0].hero_title,
          heroSubtitle: hero[0].hero_subtitle,
          animatedTexts: hero[0].animated_texts ? hero[0].animated_texts.split(", ") : [],
          ctaButtonText: hero[0].cta_button_text,
          ctaButtonLink: hero[0].cta_button_link,
          typingSpeed: hero[0].typing_speed,
          loopTyping: !!hero[0].loop_typing,
          cursorStyle: hero[0].cursor_style,
          fadeAnimation: !!hero[0].fade_animation
        } : INITIAL_MOCK_STATE.cms_current_config.hero,

        about: about[0] ? {
          sectionTitle: about[0].section_title,
          subtitle: about[0].subtitle,
          description: about[0].description,
          personalImage: about[0].personal_image,
          statistics: stats.map(s => ({ label: s.label, value: s.value })),
          socialLinks: about[0].social_links_json || {}
        } : INITIAL_MOCK_STATE.cms_current_config.about,

        skills: skills.map(s => ({
          id: s.id,
          name: s.name,
          percentage: s.percentage,
          icon: s.icon,
          enabled: !!s.enabled,
          displayOrder: s.display_order
        })),

        projects: projects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          coverImage: p.cover_image,
          galleryImages: p.gallery_images_json || [],
          technologies: p.technologies_json || [],
          githubLink: p.github_link,
          liveDemoLink: p.live_demo_link,
          category: p.category,
          displayOrder: p.display_order,
          featured: !!p.featured
        })),

        classes: classes.map(c => ({
          id: c.id,
          courseImage: c.course_image,
          courseName: c.course_name,
          instructor: c.instructor,
          price: c.price,
          description: c.description,
          sessions: c.sessions,
          status: c.status,
          displayOrder: c.display_order,
          tags: c.tags_json || [],
          syllabus: c.syllabus_json || []
        })),

        students: testimonials.map(t => ({
          id: t.id,
          studentPhoto: t.student_photo,
          studentName: t.student_name,
          course: t.course,
          rating: t.rating,
          review: t.review,
          displayOrder: t.display_order
        })),

        contact: contact[0] ? {
          title: contact[0].title,
          description: contact[0].description,
          email: contact[0].email,
          phone: contact[0].phone,
          address: contact[0].address,
          telegram: contact[0].telegram,
          instagram: contact[0].instagram,
          linkedin: contact[0].linkedin,
          github: contact[0].github,
          submissionRecipientEmail: contact[0].submission_recipient_email
        } : INITIAL_MOCK_STATE.cms_current_config.contact,

        footer: footer[0] ? {
          logo: footer[0].logo,
          animatedText: footer[0].animated_text,
          copyright: footer[0].copyright,
          footerButtonText: footer[0].footer_button_text,
          footerButtonLink: footer[0].footer_button_link,
          footerDescription: footer[0].footer_description,
          navigationLinks: footer[0].navigation_links_json || [],
          socialLinks: footer[0].social_links_json || []
        } : INITIAL_MOCK_STATE.cms_current_config.footer,

        seo: seo[0] ? {
          homepageTitle: seo[0].homepage_title,
          metaDescription: seo[0].meta_description,
          keywords: seo[0].keywords,
          ogTitle: seo[0].og_title,
          ogDescription: seo[0].og_description,
          ogImage: seo[0].og_image,
          canonicalUrl: seo[0].canonical_url,
          robotsSettings: seo[0].robots_settings
        } : INITIAL_MOCK_STATE.cms_current_config.seo,

        media: []
      };

      // Fetch dynamic states from MySQL
      const [dynStates]: [any[], any] = await dbPool.query("SELECT * FROM dynamic_states");
      for (const row of dynStates) {
        try {
          state[row.state_key] = typeof row.state_value === "string" ? JSON.parse(row.state_value) : row.state_value;
        } catch (e) {
          state[row.state_key] = row.state_value;
        }
      }

      // Merge defaults for any missing state parameters
      for (const key of Object.keys(INITIAL_MOCK_STATE)) {
        if (state[key] === undefined) {
          state[key] = INITIAL_MOCK_STATE[key];
        }
      }

      return state;
    } catch (err: any) {
      console.error(`[Database] Error querying MySQL data state: ${err.message}. Falling back to file storage.`);
    }
  }

  // Load from local fallback JSON file
  if (fs.existsSync(FALLBACK_DB_PATH)) {
    try {
      const data = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read fallback file", e);
    }
  }

  // Save initial seed structure if file doesn't exist
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(INITIAL_MOCK_STATE, null, 2), "utf8");
  return INITIAL_MOCK_STATE;
}

// Write to MySQL or fallback JSON state
async function saveKeyToStorage(key: string, value: any) {
  // If MySQL is active, structurally map key updates back to DB tables
  if (isConnectedToMySQL && dbPool) {
    try {
      console.log(`[Database] Structured sync to MySQL for key: ${key}...`);
      const dataObj = typeof value === "string" ? JSON.parse(value) : value;

      if (key === "admin_profile" || key === "teacher_profile" || key === "lms_student_profile") {
        const id = key === "admin_profile" ? "admin-1" : key === "teacher_profile" ? "teacher-1" : dataObj.id || "stu-1";
        await dbPool.query(
          `INSERT INTO users (id, name, email, phone, bio, avatar_url, department, title_prefix, specialization, role_id, password_hash, username)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'placeholder', ?)
           ON DUPLICATE KEY UPDATE name = ?, email = ?, phone = ?, bio = ?, avatar_url = ?, department = ?, title_prefix = ?, specialization = ?`,
          [id, dataObj.name, dataObj.email, dataObj.phone, dataObj.bio, dataObj.photo || dataObj.avatar, dataObj.department || null, dataObj.titlePrefix || null, dataObj.specialization || null, key === "admin_profile" ? 1 : key === "teacher_profile" ? 2 : 3, id,
           dataObj.name, dataObj.email, dataObj.phone, dataObj.bio, dataObj.photo || dataObj.avatar, dataObj.department || null, dataObj.titlePrefix || null, dataObj.specialization || null]
        );
      } else if (key === "teacher_courses") {
        for (const c of dataObj) {
          await dbPool.query(
            `INSERT INTO courses (id, title, code, students_count, sessions_count, progress, status, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, code = ?, students_count = ?, sessions_count = ?, progress = ?, status = ?, image = ?`,
            [c.id, c.title, c.code, c.studentsCount || 0, c.sessionsCount || 0, c.progress || 0, c.status || "Active", c.image || null,
             c.title, c.code, c.studentsCount || 0, c.sessionsCount || 0, c.progress || 0, c.status || "Active", c.image || null]
          );
        }
      } else if (key === "teacher_students") {
        for (const s of dataObj) {
          // Sync student user record
          await dbPool.query(
            `INSERT INTO users (id, name, email, phone, role_id, password_hash, username, status)
             VALUES (?, ?, ?, ?, 3, 'placeholder', ?, ?)
             ON DUPLICATE KEY UPDATE name = ?, email = ?, phone = ?, status = ?`,
            [s.id, s.name, s.email, s.phone || null, s.id, s.status || "Active",
             s.name, s.email, s.phone || null, s.status || "Active"]
          );
          // Sync enrollment record
          await dbPool.query(
            `INSERT INTO enrollments (student_id, course_id, status, progress, attendance_percentage, avg_grade, joined_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = ?, progress = ?, attendance_percentage = ?, avg_grade = ?`,
            [s.id, s.courseId || "react-adv", s.status === "Active" ? "Active" : "Inactive", s.progress || 0, s.attendance || 100, s.avgGrade || 0, s.joinedDate || "2026-06-01",
             s.status === "Active" ? "Active" : "Inactive", s.progress || 0, s.attendance || 100, s.avgGrade || 0]
          );
        }
      } else if (key === "teacher_sessions") {
        for (const s of dataObj) {
          await dbPool.query(
            `INSERT INTO sessions (id, course_id, title, date, time, duration, link, status, student_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, date = ?, time = ?, duration = ?, link = ?, status = ?, student_count = ?`,
            [s.id, s.courseId || "react-adv", s.title, s.date || "2026-07-02", s.time, s.duration, s.link, s.status, s.studentCount || 0,
             s.title, s.date || "2026-07-02", s.time, s.duration, s.link, s.status, s.studentCount || 0]
          );
        }
      } else if (key === "teacher_assignments") {
        for (const a of dataObj) {
          await dbPool.query(
            `INSERT INTO assignments (id, course_id, title, description, publish_date, due_date, max_points, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, description = ?, publish_date = ?, due_date = ?, max_points = ?, status = ?`,
            [a.id, a.courseId || "react-adv", a.title, a.description, a.publishDate || "2026-06-01", a.dueDate || "2026-07-01", a.maxPoints || 100, a.status || "Published",
             a.title, a.description, a.publishDate || "2026-06-01", a.dueDate || "2026-07-01", a.maxPoints || 100, a.status || "Published"]
          );
          // Sync inner submissions if any
          if (Array.isArray(a.submissions)) {
            for (const sub of a.submissions) {
              await dbPool.query(
                `INSERT INTO assignment_submissions (id, assignment_id, student_id, submitted_at, github_url, notes, status, grade, feedback)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE github_url = ?, notes = ?, status = ?, grade = ?, feedback = ?`,
                [sub.id, a.id, sub.studentId, sub.submittedAt || "2026-06-30 00:00:00", sub.githubUrl || null, sub.notes || null, sub.status || "Submitted", sub.grade || null, sub.feedback || null,
                 sub.githubUrl || null, sub.notes || null, sub.status || "Submitted", sub.grade || null, sub.feedback || null]
              );
            }
          }
        }
      } else if (key === "teacher_discussions") {
        for (const d of dataObj) {
          await dbPool.query(
            `INSERT INTO discussion_threads (id, course_id, student_id, student_name, title, text, time, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, text = ?, time = ?, status = ?`,
            [d.id, d.courseId || "react-adv", d.studentId || "stu-1", d.studentName || "Courtney Henry", d.title, d.text, d.time, d.status || "New",
             d.title, d.text, d.time, d.status || "New"]
          );
          if (Array.isArray(d.replies)) {
            for (const r of d.replies) {
              await dbPool.query(
                `INSERT INTO discussion_replies (id, thread_id, sender_id, sender_name, role, time, text)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE text = ?, time = ?`,
                [r.id, d.id, r.senderId || "teacher-1", r.sender || "Dr. Sarah Vance", r.role || "Instructor", r.time, r.text,
                 r.text, r.time]
              );
            }
          }
        }
      } else if (key === "teacher_resources") {
        for (const r of dataObj) {
          await dbPool.query(
            `INSERT INTO resources (id, title, course_id, file_type, file_size, uploaded_at, visibility)
             VALUES (?, ?, ?, ?, ?, ?, 'Visible')
             ON DUPLICATE KEY UPDATE title = ?, file_type = ?, file_size = ?, uploaded_at = ?`,
            [r.id, r.title, r.courseId || "react-adv", r.fileType || "pdf", r.fileSize || "1.0 MB", r.uploadedAt || "2026-06-01",
             r.title, r.fileType || "pdf", r.fileSize || "1.0 MB", r.uploadedAt || "2026-06-01"]
          );
        }
      } else if (key === "teacher_announcements") {
        for (const a of dataObj) {
          await dbPool.query(
            `INSERT INTO announcements (id, title, description, course_id, course_title, audience, published_at, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, description = ?, course_title = ?, audience = ?, published_at = ?, status = ?`,
            [a.id, a.title, a.description, a.courseId || "all", a.courseTitle || "All Courses", a.audience || "Everyone", a.publishedAt || "2026-06-01", a.status || "Published",
             a.title, a.description, a.courseTitle || "All Courses", a.audience || "Everyone", a.publishedAt || "2026-06-01", a.status || "Published"]
          );
        }
      } else if (key === "teacher_calendar_events") {
        for (const e of dataObj) {
          await dbPool.query(
            `INSERT INTO calendar_events (id, title, type, date, time, course_id)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = ?, type = ?, date = ?, time = ?, course_id = ?`,
            [e.id, e.title, e.type || "Class", e.date || "2026-07-02", e.time || "All Day", e.courseId || null,
             e.title, e.type || "Class", e.date || "2026-07-02", e.time || "All Day", e.courseId || null]
          );
        }
      } else if (key === "teacher_course_seasons") {
        for (const s of dataObj) {
          await dbPool.query(
            `INSERT INTO course_seasons (id, name, course_id, start_date, end_date, max_capacity, registration_status, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = ?, start_date = ?, end_date = ?, max_capacity = ?, registration_status = ?, notes = ?, status = ?`,
            [s.id, s.name, s.courseId || "react-adv", s.startDate || "2026-06-01", s.endDate || "2026-08-31", s.maxCapacity || 25, s.registrationStatus || "Open", s.notes || null, s.status || "Active",
             s.name, s.startDate || "2026-06-01", s.endDate || "2026-08-31", s.maxCapacity || 25, s.registrationStatus || "Open", s.notes || null, s.status || "Active"]
          );
        }
      } else if (key === "teacher_certificates") {
        for (const c of dataObj) {
          await dbPool.query(
            `INSERT INTO certificates (id, student_id, student_name, course_id, course_title, gpa, status, issue_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = ?, issue_date = ?`,
            [c.id, c.studentId || "stu-1", c.studentName, c.courseId || "react-adv", c.courseTitle, c.gpa || null, c.status || "Draft", c.issueDate || null,
             c.status || "Draft", c.issueDate || null]
          );
        }
      } else if (key === "teacher_grades") {
        for (const g of dataObj) {
          await dbPool.query(
            `INSERT INTO grades (id, student_id, student_name, course_id, course_title, assignment_id, assignment_title, score, max_points, letter_grade, published_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE student_name = ?, course_title = ?, assignment_title = ?, score = ?, max_points = ?, letter_grade = ?, published_date = ?`,
            [g.id, g.studentId || "stu-1", g.studentName, g.courseId || "react-adv", g.courseTitle, g.assignmentId || "asg-1", g.assignmentTitle, g.score || 0, g.maxPoints || 100, g.letterGrade || "A", g.publishedDate || "2026-07-01",
             g.studentName, g.courseTitle, g.assignmentTitle, g.score || 0, g.maxPoints || 100, g.letterGrade || "A", g.publishedDate || "2026-07-01"]
          );
        }
      } else if (key === "cms_current_config") {
        // Sync general settings
        const g = dataObj.general || {};
        await dbPool.query(
          `INSERT INTO cms_general_settings (id, website_title, website_description, academy_logo, favicon, primary_color, secondary_color, accent_color, default_font, enable_dark_theme, maintenance_mode)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE website_title = ?, website_description = ?, academy_logo = ?, favicon = ?, primary_color = ?, secondary_color = ?, accent_color = ?, default_font = ?, enable_dark_theme = ?, maintenance_mode = ?`,
          [g.websiteTitle, g.websiteDescription, g.academyLogo, g.favicon, g.primaryColor, g.secondaryColor, g.accentColor, g.defaultFont, g.enableDarkTheme ? 1 : 0, g.maintenanceMode ? 1 : 0,
           g.websiteTitle, g.websiteDescription, g.academyLogo, g.favicon, g.primaryColor, g.secondaryColor, g.accentColor, g.defaultFont, g.enableDarkTheme ? 1 : 0, g.maintenanceMode ? 1 : 0]
        );

        // Sync hero section
        const h = dataObj.hero || {};
        const animatedStr = Array.isArray(h.animatedTexts) ? h.animatedTexts.join(", ") : "";
        await dbPool.query(
          `INSERT INTO cms_hero_section (id, background_image, overlay_opacity, overlay_color, hero_title, hero_subtitle, animated_texts, cta_button_text, cta_button_link, typing_speed, loop_typing, cursor_style, fade_animation)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE background_image = ?, overlay_opacity = ?, overlay_color = ?, hero_title = ?, hero_subtitle = ?, animated_texts = ?, cta_button_text = ?, cta_button_link = ?, typing_speed = ?, loop_typing = ?, cursor_style = ?, fade_animation = ?`,
          [h.backgroundImage, h.overlayOpacity, h.overlayColor, h.heroTitle, h.heroSubtitle, animatedStr, h.ctaButtonText, h.ctaButtonLink, h.typingSpeed, h.loopTyping ? 1 : 0, h.cursorStyle, h.fadeAnimation ? 1 : 0,
           h.backgroundImage, h.overlayOpacity, h.overlayColor, h.heroTitle, h.heroSubtitle, animatedStr, h.ctaButtonText, h.ctaButtonLink, h.typingSpeed, h.loopTyping ? 1 : 0, h.cursorStyle, h.fadeAnimation ? 1 : 0]
        );

        // Sync about section
        const ab = dataObj.about || {};
        await dbPool.query(
          `INSERT INTO cms_about_me (id, section_title, subtitle, description, personal_image, social_links_json)
           VALUES (1, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE section_title = ?, subtitle = ?, description = ?, personal_image = ?, social_links_json = ?`,
          [ab.sectionTitle, ab.subtitle, ab.description, ab.personalImage, JSON.stringify(ab.socialLinks || {}),
           ab.sectionTitle, ab.subtitle, ab.description, ab.personalImage, JSON.stringify(ab.socialLinks || {})]
        );

        // Sync statistics
        if (Array.isArray(ab.statistics)) {
          await dbPool.query("DELETE FROM cms_about_statistics");
          for (let i = 0; i < ab.statistics.length; i++) {
            const stat = ab.statistics[i];
            await dbPool.query(
              `INSERT INTO cms_about_statistics (label, value, display_order) VALUES (?, ?, ?)`,
              [stat.label, stat.value, i]
            );
          }
        }

        // Sync skills
        if (Array.isArray(dataObj.skills)) {
          for (const s of dataObj.skills) {
            await dbPool.query(
              `INSERT INTO cms_skills (id, name, percentage, icon, enabled, display_order)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE name = ?, percentage = ?, icon = ?, enabled = ?, display_order = ?`,
              [s.id, s.name, s.percentage, s.icon, s.enabled ? 1 : 0, s.displayOrder || 0,
               s.name, s.percentage, s.icon, s.enabled ? 1 : 0, s.displayOrder || 0]
            );
          }
        }

        // Sync projects
        if (Array.isArray(dataObj.projects)) {
          for (const p of dataObj.projects) {
            await dbPool.query(
              `INSERT INTO cms_projects (id, title, description, cover_image, gallery_images_json, technologies_json, github_link, live_demo_link, category, display_order, featured)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE title = ?, description = ?, cover_image = ?, gallery_images_json = ?, technologies_json = ?, github_link = ?, live_demo_link = ?, category = ?, display_order = ?, featured = ?`,
              [p.id, p.title, p.description, p.coverImage, JSON.stringify(p.galleryImages || []), JSON.stringify(p.technologies || []), p.githubLink, p.liveDemoLink, p.category, p.displayOrder || 0, p.featured ? 1 : 0,
               p.title, p.description, p.coverImage, JSON.stringify(p.galleryImages || []), JSON.stringify(p.technologies || []), p.githubLink, p.liveDemoLink, p.category, p.displayOrder || 0, p.featured ? 1 : 0]
            );
          }
        }

        // Sync classes
        if (Array.isArray(dataObj.classes)) {
          for (const c of dataObj.classes) {
            await dbPool.query(
              `INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE course_image = ?, course_name = ?, instructor = ?, price = ?, description = ?, sessions = ?, status = ?, display_order = ?, tags_json = ?, syllabus_json = ?`,
              [c.id, c.courseImage, c.courseName, c.instructor, c.price, c.description, c.sessions, c.status || "Published", c.displayOrder || 0, JSON.stringify(c.tags || []), JSON.stringify(c.syllabus || []),
               c.courseImage, c.courseName, c.instructor, c.price, c.description, c.sessions, c.status || "Published", c.displayOrder || 0, JSON.stringify(c.tags || []), JSON.stringify(c.syllabus || [])]
            );
          }
        }

        // Sync testimonials
        if (Array.isArray(dataObj.students)) {
          for (const t of dataObj.students) {
            await dbPool.query(
              `INSERT INTO cms_testimonials (id, student_photo, student_name, course, rating, review, display_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE student_photo = ?, student_name = ?, course = ?, rating = ?, review = ?, display_order = ?`,
              [t.id, t.studentPhoto, t.studentName, t.course, t.rating, t.review, t.displayOrder || 0,
               t.studentPhoto, t.studentName, t.course, t.rating, t.review, t.displayOrder || 0]
            );
          }
        }

        // Sync contact info
        const co = dataObj.contact || {};
        await dbPool.query(
          `INSERT INTO cms_contact_settings (id, title, description, email, phone, address, telegram, instagram, linkedin, github, submission_recipient_email)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = ?, description = ?, email = ?, phone = ?, address = ?, telegram = ?, instagram = ?, linkedin = ?, github = ?, submission_recipient_email = ?`,
          [co.title, co.description, co.email, co.phone, co.address, co.telegram, co.instagram, co.linkedin, co.github, co.submissionRecipientEmail,
           co.title, co.description, co.email, co.phone, co.address, co.telegram, co.instagram, co.linkedin, co.github, co.submissionRecipientEmail]
        );

        // Sync footer
        const fo = dataObj.footer || {};
        await dbPool.query(
          `INSERT INTO cms_footer_settings (id, logo, animated_text, copyright, footer_button_text, footer_button_link, footer_description, navigation_links_json, social_links_json)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE logo = ?, animated_text = ?, copyright = ?, footer_button_text = ?, footer_button_link = ?, footer_description = ?, navigation_links_json = ?, social_links_json = ?`,
          [fo.logo, fo.animatedText, fo.copyright, fo.footerButtonText, fo.footerButtonLink, fo.footerDescription, JSON.stringify(fo.navigationLinks || []), JSON.stringify(fo.socialLinks || []),
           fo.logo, fo.animatedText, fo.copyright, fo.footerButtonText, fo.footerButtonLink, fo.footerDescription, JSON.stringify(fo.navigationLinks || []), JSON.stringify(fo.socialLinks || [])]
        );

        // Sync SEO
        const se = dataObj.seo || {};
        await dbPool.query(
          `INSERT INTO cms_seo_settings (id, homepage_title, meta_description, keywords, og_title, og_description, og_image, canonical_url, robots_settings)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE homepage_title = ?, meta_description = ?, keywords = ?, og_title = ?, og_description = ?, og_image = ?, canonical_url = ?, robots_settings = ?`,
          [se.homepageTitle, se.metaDescription, se.keywords, se.ogTitle, se.ogDescription, se.ogImage, se.canonicalUrl, se.robotsSettings,
           se.homepageTitle, se.metaDescription, se.keywords, se.ogTitle, se.ogDescription, se.ogImage, se.canonicalUrl, se.robotsSettings]
        );
      }

      // Also always write to the dynamic_states table to ensure generic fallback and unstructured keys (like admin permissions, active sessions) are fully persisted
      const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
      await dbPool.query(
        `INSERT INTO dynamic_states (state_key, state_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE state_value = ?`,
        [key, serializedValue, serializedValue]
      );
    } catch (err: any) {
      console.error(`[Database] Error updating MySQL for key ${key}: ${err.message}. Saving to fallback JSON.`);
    }
  }

  // Always save to fallback JSON file to guarantee state durability & local offline works
  try {
    let currentState: Record<string, any> = {};
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const data = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
      currentState = JSON.parse(data);
    }
    const valObj = typeof value === "string" ? JSON.parse(value) : value;
    currentState[key] = valObj;
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(currentState, null, 2), "utf8");
  } catch (e: any) {
    console.error(`[Database] Failed to write fallback file: ${e.message}`);
  }
}

// -------------------------------------------------------------------------
// EXPRESS API ENDPOINTS
// -------------------------------------------------------------------------

// Check DB Connection Status
app.get("/api/db-status", (req, res) => {
  res.json({
    connected: isConnectedToMySQL,
    mode: isConnectedToMySQL ? "MySQL (Active)" : "Offline (Local JSON fallback database)",
    config: {
      host: process.env.DB_HOST || "none",
      database: process.env.DB_NAME || "none",
      port: process.env.DB_PORT || "3306",
      user: process.env.DB_USER || "none"
    }
  });
});

// Load consolidated database structure
app.get("/api/get-all-data", async (req, res) => {
  try {
    const data = await getFullDataState();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Sync/Save a modified key state
app.post("/api/save-key", async (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Missing state key parameter" });
  }
  try {
    await saveKeyToStorage(key, value);
    res.json({ success: true, key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset entire database to default seeds
app.post("/api/reset-db", async (req, res) => {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      fs.unlinkSync(FALLBACK_DB_PATH);
    }
    // Repopulate fallback database file
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(INITIAL_MOCK_STATE, null, 2), "utf8");

    // If connected to MySQL, truncate and reseed is recommended via importing database/schema.sql
    res.json({ success: true, message: "Database local state reset completed successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------------------
// VITE DEV SERVER MIDDLEWARE / PRODUCTION STATIC ROUTING
// -------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`===================================================`);
    console.log(`[Server] Academy Applet Server listening on port ${PORT}`);
    console.log(`[Server] Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`[Server] Access URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
}

startServer();
