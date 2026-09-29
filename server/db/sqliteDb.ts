import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { DEFAULT_CMS_CONFIG, DEFAULT_HOMEPAGE_CLASSES } from "../../src/constants/defaultCms";

let dbInstance: DatabaseSync | null = null;

export function getSqliteDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dbDir = path.join(process.cwd(), "database");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "academy_local.db");
  const db = new DatabaseSync(dbPath);

  // Custom SQL functions to match MySQL
  db.function("NOW", () => new Date().toISOString().replace("T", " ").slice(0, 19));
  db.function("CURDATE", () => new Date().toISOString().slice(0, 10));

  // Initialize schema
  initSchema(db);

  // Seed default data
  seedDefaultData(db);

  dbInstance = db;
  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      provider TEXT DEFAULT 'local',
      google_id TEXT,
      name TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      phone TEXT,
      department TEXT,
      title_prefix TEXT,
      specialization TEXT,
      status TEXT DEFAULT 'Active',
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT NOT NULL,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_general_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      website_title TEXT DEFAULT 'Roozzero Academy',
      website_description TEXT,
      academy_logo TEXT,
      favicon TEXT,
      primary_color TEXT DEFAULT '#000000',
      secondary_color TEXT DEFAULT '#111111',
      accent_color TEXT DEFAULT '#FF3B30',
      default_font TEXT DEFAULT 'Inter',
      enable_dark_theme INTEGER DEFAULT 1,
      maintenance_mode INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_hero_section (
      id INTEGER PRIMARY KEY DEFAULT 1,
      background_image TEXT,
      overlay_opacity REAL DEFAULT 0.50,
      overlay_color TEXT DEFAULT '#000000',
      hero_title TEXT,
      hero_subtitle TEXT,
      animated_texts TEXT,
      cta_button_text TEXT DEFAULT 'Explore Classes',
      cta_button_link TEXT DEFAULT '#classes',
      typing_speed INTEGER DEFAULT 80,
      loop_typing INTEGER DEFAULT 1,
      cursor_style TEXT DEFAULT 'pipe',
      fade_animation INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_about_me (
      id INTEGER PRIMARY KEY DEFAULT 1,
      section_title TEXT DEFAULT 'WHO''S ME',
      subtitle TEXT,
      description TEXT,
      personal_image TEXT,
      social_links_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_about_statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      icon TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      gallery_images_json TEXT,
      technologies_json TEXT,
      github_link TEXT,
      live_demo_link TEXT,
      category TEXT,
      display_order INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_classes (
      id TEXT PRIMARY KEY,
      course_image TEXT,
      course_name TEXT NOT NULL,
      instructor TEXT DEFAULT 'Roozbeh',
      price TEXT DEFAULT 'Free',
      description TEXT,
      sessions INTEGER DEFAULT 16,
      status TEXT DEFAULT 'Published',
      display_order INTEGER DEFAULT 0,
      tags_json TEXT,
      syllabus_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_testimonials (
      id TEXT PRIMARY KEY,
      student_photo TEXT,
      student_name TEXT NOT NULL,
      course TEXT,
      rating INTEGER DEFAULT 5,
      review TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_contact_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      title TEXT DEFAULT 'GET IN TOUCH',
      description TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      telegram TEXT,
      instagram TEXT,
      linkedin TEXT,
      github TEXT,
      submission_recipient_email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_footer_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      logo TEXT,
      animated_text TEXT,
      copyright TEXT,
      footer_button_text TEXT,
      footer_button_link TEXT,
      footer_description TEXT,
      navigation_links_json TEXT,
      social_links_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_seo_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      homepage_title TEXT,
      meta_description TEXT,
      keywords TEXT,
      og_title TEXT,
      og_description TEXT,
      og_image TEXT,
      canonical_url TEXT,
      robots_settings TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cms_versions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      label TEXT NOT NULL,
      config_json TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      slug TEXT,
      description TEXT,
      short_description TEXT,
      category_id INTEGER,
      teacher_id TEXT,
      students_count INTEGER DEFAULT 0,
      sessions_count INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      price TEXT DEFAULT 'Free',
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'Published',
      difficulty TEXT DEFAULT 'Intermediate',
      duration TEXT DEFAULT '16 Sessions',
      max_students INTEGER DEFAULT 50,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_seasons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      course_id TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      max_capacity INTEGER DEFAULT 25,
      registration_status TEXT DEFAULT 'Open',
      notes TEXT,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      season_id TEXT,
      status TEXT DEFAULT 'Active',
      progress INTEGER DEFAULT 0,
      attendance_percentage REAL DEFAULT 100.00,
      avg_grade REAL DEFAULT 0.00,
      joined_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      teacher_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      time TEXT NOT NULL,
      duration TEXT DEFAULT '2 hours',
      link TEXT,
      recording_url TEXT,
      status TEXT DEFAULT 'Scheduled',
      student_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      session_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      lesson_order INTEGER DEFAULT 0,
      video_url TEXT,
      duration TEXT DEFAULT '45 mins',
      is_preview INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (student_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS session_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT DEFAULT 'Present',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (session_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_number TEXT NOT NULL UNIQUE,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      issue_date DATE NOT NULL,
      grade TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'Valid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      github_url TEXT,
      notes TEXT,
      status TEXT DEFAULT 'Submitted',
      submitted_file_name TEXT,
      submitted_file_path TEXT,
      submitted_file_size INTEGER,
      submitted_file_type TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      grade REAL,
      feedback TEXT,
      corrected_file_name TEXT,
      corrected_file_path TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (assignment_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS submission_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id TEXT NOT NULL,
      grade REAL,
      feedback TEXT,
      changed_by TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      teacher_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      publish_date DATE NOT NULL,
      due_date DATE NOT NULL,
      max_points INTEGER DEFAULT 100,
      status TEXT DEFAULT 'Published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignment_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      stored_name TEXT,
      file_url TEXT NOT NULL,
      file_size TEXT,
      file_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_id TEXT NOT NULL,
      course_title TEXT NOT NULL,
      assignment_id TEXT NOT NULL,
      assignment_title TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_points INTEGER NOT NULL DEFAULT 100,
      letter_grade TEXT NOT NULL,
      published_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      course_id TEXT NOT NULL,
      teacher_id TEXT,
      category_id INTEGER,
      file_name TEXT,
      stored_name TEXT,
      file_path TEXT,
      file_type TEXT NOT NULL,
      file_size TEXT NOT NULL,
      visibility TEXT DEFAULT 'Visible',
      uploaded_at DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discussion_threads (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discussion_replies (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      role TEXT DEFAULT 'Student',
      time TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      course_id TEXT DEFAULT 'all',
      course_title TEXT DEFAULT 'All Courses',
      author_id TEXT,
      audience TEXT DEFAULT 'Everyone',
      published_at DATE NOT NULL,
      status TEXT DEFAULT 'Published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Class',
      date DATE NOT NULL,
      time TEXT DEFAULT 'All Day',
      duration TEXT DEFAULT '2 hours',
      course_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'Completed',
      payment_method TEXT,
      transaction_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec("ALTER TABLE assignment_submissions ADD COLUMN corrected_file_name TEXT;"); } catch {}
  try { db.exec("ALTER TABLE assignment_submissions ADD COLUMN corrected_file_path TEXT;"); } catch {}
  try { db.exec("ALTER TABLE assignment_submissions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"); } catch {}
}

function seedDefaultData(db: DatabaseSync) {
  // 1. Roles
  const rolesCountRow = db.prepare("SELECT COUNT(*) as count FROM roles").get() as any;
  if (!rolesCountRow || rolesCountRow.count === 0) {
    db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)").run(1, "Administrator", "Full system access and platform governance");
    db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)").run(2, "Teacher", "Course creation, student grading, and session conduction");
    db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)").run(3, "Student", "Course enrollment, learning materials, and assignment submission");
  }

  // 2. Administrator User
  const adminCheck = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@roozzero.dev") as any;
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  if (!adminCheck) {
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 'Active')
    `).run(
      "admin-1",
      "admin",
      "admin@roozzero.dev",
      adminHash,
      "Roozbeh Tavakoli",
      "Mr.",
      "LMS Administration",
      "System Architect & Super Admin",
      "Academy director and full stack software architect."
    );
  } else if (process.env.ADMIN_PASSWORD) {
    const match = bcrypt.compareSync(process.env.ADMIN_PASSWORD, adminCheck.password_hash);
    if (!match) {
      const newAdminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newAdminHash, adminCheck.id);
    }
  }

  // 3. Teacher User
  const teacherCheck = db.prepare("SELECT id FROM users WHERE email = ?").get("teacher@academy.local") as any;
  if (!teacherCheck) {
    const teacherHash = bcrypt.hashSync("Teacher@123", 10);
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
      VALUES (?, ?, ?, ?, 2, ?, ?, ?, ?, ?, 'Active')
    `).run(
      "teacher-1",
      "teacher",
      "teacher@academy.local",
      teacherHash,
      "Roozbeh Tavakoli",
      "Eng.",
      "Department of Web Security",
      "Offensive Security & Red Teaming",
      "Senior security researcher and web penetration tester."
    );
  }

  // 4. Student User
  const studentCheck = db.prepare("SELECT id FROM users WHERE email = ?").get("student@academy.local") as any;
  if (!studentCheck) {
    const studentHash = bcrypt.hashSync("Student@123", 10);
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
      VALUES (?, ?, ?, ?, 3, ?, ?, ?, ?, ?, 'Active')
    `).run(
      "student-1",
      "student",
      "student@academy.local",
      studentHash,
      "Alex Morgan",
      "Student",
      "Undergraduate Studies",
      "Full Stack Development",
      "Dedicated software engineering student focusing on React and modern architectures."
    );
  }

  // 5. Default CMS Version & Classes
  const cmsVersionCheck = db.prepare("SELECT id FROM cms_versions WHERE id = 'current'").get() as any;
  if (!cmsVersionCheck) {
    db.prepare(`
      INSERT INTO cms_versions (id, timestamp, label, config_json)
      VALUES ('current', NOW(), 'Published Live', ?)
    `).run(JSON.stringify(DEFAULT_CMS_CONFIG));
  }

  // 6. Courses
  const coursesCountRow = db.prepare("SELECT COUNT(*) as count FROM courses").get() as any;
  if (!coursesCountRow || coursesCountRow.count === 0) {
    const defaultClasses = DEFAULT_HOMEPAGE_CLASSES || [];
    for (const c of defaultClasses) {
      db.prepare(`
        INSERT INTO courses (id, title, code, slug, description, short_description, teacher_id, sessions_count, price, status, image)
        VALUES (?, ?, ?, ?, ?, ?, 'teacher-1', ?, ?, 'Published', ?)
      `).run(
        c.id,
        c.courseName,
        c.id.toUpperCase(),
        c.id,
        c.description,
        c.shortDescription,
        c.sessions || 16,
        c.price || "Free",
        c.courseImage
      );

      // Save into cms_classes
      db.prepare(`
        INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, syllabus_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Published', ?)
      `).run(
        c.id,
        c.courseImage,
        c.courseName,
        c.instructor || "Roozbeh",
        c.price || "Free",
        c.description,
        c.sessions || 16,
        JSON.stringify(c.syllabus || [])
      );
    }
  }
}

function normalizeSql(sql: string): string {
  return sql
    .replace(/ON\s+DUPLICATE\s+KEY\s+UPDATE/gi, "ON CONFLICT DO UPDATE SET")
    .replace(/VALUES\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi, "excluded.$1");
}

function normalizeParam(val: any): any {
  if (val === undefined) return null;
  if (val instanceof Date) return val.toISOString().replace("T", " ").slice(0, 19);
  if (typeof val === "boolean") return val ? 1 : 0;
  return val;
}

export function sqliteQuery<T = any>(sql: string, params?: any[] | Record<string, any>): [T, any] {
  const db = getSqliteDb();
  const normalizedSql = normalizeSql(sql.trim());

  let flatParams: any[] = [];
  if (Array.isArray(params)) {
    flatParams = params.map(normalizeParam);
  } else if (params && typeof params === "object") {
    // named parameters
    flatParams = Object.values(params).map(normalizeParam);
  }

  const isSelect = /^(SELECT|PRAGMA|EXPLAIN|WITH)\b/i.test(normalizedSql);

  if (isSelect) {
    const stmt = db.prepare(normalizedSql);
    const rows = stmt.all(...flatParams);
    // Convert rows to plain prototype objects
    const plainRows = rows.map(r => Object.assign({}, r));
    return [plainRows as unknown as T, []];
  } else {
    const stmt = db.prepare(normalizedSql);
    const info = stmt.run(...flatParams);
    const resultHeader = {
      affectedRows: info.changes,
      insertId: Number(info.lastInsertRowid),
      warningStatus: 0
    };
    return [resultHeader as unknown as T, []];
  }
}

export const sqlitePool = {
  query: async <T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> => {
    return sqliteQuery<T>(sql, params);
  },
  execute: async <T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> => {
    return sqliteQuery<T>(sql, params);
  },
  getConnection: async () => {
    const db = getSqliteDb();
    return {
      query: async <T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> => {
        return sqliteQuery<T>(sql, params);
      },
      execute: async <T = any>(sql: string, params?: any[] | Record<string, any>): Promise<[T, any]> => {
        return sqliteQuery<T>(sql, params);
      },
      beginTransaction: async () => {
        db.exec("BEGIN");
      },
      commit: async () => {
        db.exec("COMMIT");
      },
      rollback: async () => {
        db.exec("ROLLBACK");
      },
      release: () => {}
    };
  }
};
