import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { getDbPool, query } from "./pool";
import { DEFAULT_CMS_CONFIG, DEFAULT_HOMEPAGE_CLASSES } from "../../src/constants/defaultCms";

export async function runMigrationsAndSeeds() {
  const pool = getDbPool();
  if (!pool) {
    console.warn("[Migration] MySQL pool is not initialized. Skipping DB migrations.");
    return;
  }

  try {
    console.log("[Migration] Checking and running schema migrations...");
    const migrationPath = path.join(process.cwd(), "database", "migrations", "001_initial_schema.sql");
    if (fs.existsSync(migrationPath)) {
      const sqlContent = fs.readFileSync(migrationPath, "utf-8");
      // Split by semicolon statements, avoiding empty lines
      const statements = sqlContent
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (stmtErr: any) {
          // Ignore table already exists or harmless warning
          if (!stmtErr.message.includes("already exists")) {
            console.warn(`[Migration Warning]: ${stmtErr.message}`);
          }
        }
      }
      console.log("[Migration] Schema tables verified successfully.");
    }

    // Seed Roles
    const [rolesCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM roles");
    if (rolesCount[0].count === 0) {
      console.log("[Migration] Seeding standard RBAC roles...");
      await pool.query(`
        INSERT INTO roles (id, name, description) VALUES
        (1, 'Administrator', 'Full system access and LMS management'),
        (2, 'Teacher', 'Manage assigned courses, students, grading and sessions'),
        (3, 'Student', 'Enroll in courses, view lessons, submit assignments')
      `);
    }

    // Seed Admin User
    const [adminCheck]: [any[], any] = await pool.query("SELECT * FROM users WHERE email = 'admin@roozzero.dev' OR role_id = 1 LIMIT 1");
    if (adminCheck.length === 0) {
      console.log("[Migration] Seeding initial Administrator user...");
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 10);
      await pool.query(`
        INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
        VALUES ('admin-1', 'admin', 'admin@roozzero.dev', ?, 1, 'Roozbeh Tavakoli', 'Mr.', 'LMS Administration', 'System Architect & Super Admin', 'Academy director and full stack software architect.', 'Active')
      `, [hashedPassword]);
    }

    // Seed Teacher User
    const [teacherCheck]: [any[], any] = await pool.query("SELECT * FROM users WHERE email = 'teacher@academy.local' OR role_id = 2 LIMIT 1");
    if (teacherCheck.length === 0) {
      console.log("[Migration] Seeding initial Teacher user...");
      const hashedTeacherPassword = await bcrypt.hash("Teacher@123", 10);
      await pool.query(`
        INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
        VALUES ('teacher-1', 'sarah_vance', 'teacher@academy.local', ?, 2, 'Dr. Sarah Vance', 'Dr.', 'Computer Science', 'Frontend & Reactive Systems', 'Lead instructor specializing in React architectures and secure frontend applications.', 'Active')
      `, [hashedTeacherPassword]);
    }

    // Seed Student User
    const [studentCheck]: [any[], any] = await pool.query("SELECT * FROM users WHERE email = 'student@academy.local' LIMIT 1");
    if (studentCheck.length === 0) {
      console.log("[Migration] Seeding initial Student user...");
      const hashedStudentPassword = await bcrypt.hash("Student@123", 10);
      await pool.query(`
        INSERT INTO users (id, username, email, password_hash, role_id, name, status)
        VALUES ('stu-1', 'courtney_henry', 'student@academy.local', ?, 3, 'Courtney Henry', 'Active')
      `, [hashedStudentPassword]);
    }

    // Seed Course Categories
    const [catCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM course_categories");
    if (catCount[0].count === 0) {
      console.log("[Migration] Seeding default course categories...");
      await pool.query(`
        INSERT INTO course_categories (id, name, slug, description) VALUES
        (1, 'Web Development', 'web-development', 'Modern web engineering and frameworks'),
        (2, 'Cybersecurity', 'cybersecurity', 'Web security, ethical hacking and defense'),
        (3, 'CMS & WordPress', 'cms-wordpress', 'Website building, eCommerce and CMS tools')
      `);
    }

    // Seed Courses from DEFAULT_HOMEPAGE_CLASSES
    const [courseCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM courses");
    if (courseCount[0].count === 0) {
      console.log("[Migration] Seeding default academy courses...");
      for (let i = 0; i < DEFAULT_HOMEPAGE_CLASSES.length; i++) {
        const cls = DEFAULT_HOMEPAGE_CLASSES[i];
        const categoryId = cls.id.includes("sec") || cls.id.includes("hunt") || cls.id.includes("bg") ? 2 : cls.id === "wordpress" ? 3 : 1;
        await pool.query(`
          INSERT INTO courses (id, title, code, slug, description, short_description, price, category_id, teacher_id, students_count, sessions_count, status, image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'teacher-1', 24, ?, 'Published', ?)
        `, [
          cls.id,
          cls.courseName,
          `CRS-${100 + i}`,
          cls.id,
          cls.description || cls.shortDescription,
          cls.shortDescription,
          cls.price || "Free",
          categoryId,
          cls.sessions || 16,
          cls.courseImage
        ]);

        // Insert first batch/season for each course
        await pool.query(`
          INSERT INTO course_seasons (id, name, course_id, start_date, end_date, max_capacity, registration_status, status)
          VALUES (?, ?, ?, '2026-06-01', '2026-09-30', 30, 'Open', 'Active')
        `, [`season-${cls.id}`, `${cls.courseName} - Summer 2026 Batch`, cls.id]);
      }
    }

    // Seed Default CMS Settings
    const [cmsGenCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM cms_general_settings");
    if (cmsGenCount[0].count === 0) {
      console.log("[Migration] Seeding default CMS settings...");
      const g = DEFAULT_CMS_CONFIG.general;
      await pool.query(`
        INSERT INTO cms_general_settings (id, website_title, website_description, academy_logo, primary_color, secondary_color, accent_color, default_font, enable_dark_theme, maintenance_mode)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [g.websiteTitle, g.websiteDescription, g.academyLogo || null, g.primaryColor, g.secondaryColor, g.accentColor, g.defaultFont, g.enableDarkTheme ? 1 : 0, g.maintenanceMode ? 1 : 0]);

      const cms: any = DEFAULT_CMS_CONFIG;
      const h = cms.hero || {};
      await pool.query(`
        INSERT INTO cms_hero_section (id, background_image, overlay_opacity, overlay_color, hero_title, hero_subtitle, animated_texts, cta_button_text, cta_button_link, typing_speed, loop_typing, cursor_style, fade_animation)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [h.backgroundImage || h.heroImage, h.overlayOpacity || "0.4", h.overlayColor || "#000000", h.heroTitle || h.headline, h.heroSubtitle || h.subtitle, (h.animatedTexts || []).join(", "), h.ctaButtonText || "Explore", h.ctaButtonLink || "#classes", h.typingSpeed || 50, h.loopTyping ? 1 : 0, h.cursorStyle || "emerald", h.fadeAnimation ? 1 : 0]);

      const ab = cms.aboutMe || cms.about || {};
      await pool.query(`
        INSERT INTO cms_about_me (id, section_title, subtitle, description, personal_image, social_links_json)
        VALUES (1, ?, ?, ?, ?, ?)
      `, [ab.title || ab.sectionTitle || "About Me", ab.badge || ab.subtitle || "", ab.bio || ab.description || "", ab.portraitImage || ab.personalImage || null, JSON.stringify(ab.socialLinks || {})]);

      if (Array.isArray(ab.cards)) {
        for (let idx = 0; idx < ab.cards.length; idx++) {
          const card = ab.cards[idx];
          await pool.query(`INSERT INTO cms_about_statistics (label, value, display_order) VALUES (?, ?, ?)`, [card.tag || card.badgeText, card.statNumber, idx]);
        }
      }

      const skillsList = Array.isArray(cms.skills?.skills) ? cms.skills.skills : (Array.isArray(cms.skills) ? cms.skills : []);
      for (let s of skillsList) {
        await pool.query(`INSERT INTO cms_skills (id, name, percentage, icon, enabled, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
          [s.id, s.name, s.percentage, s.icon || "Code", s.enabled ? 1 : 1, s.displayOrder || 0]);
      }

      const projectsList = Array.isArray(cms.projects?.projects) ? cms.projects.projects : (Array.isArray(cms.projects) ? cms.projects : []);
      for (let p of projectsList) {
        await pool.query(`INSERT INTO cms_projects (id, title, description, cover_image, gallery_images_json, technologies_json, github_link, live_demo_link, category, display_order, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.id, p.title, p.description, p.coverImage, JSON.stringify(p.galleryImages || []), JSON.stringify(p.technologies || []), p.githubLink, p.liveDemoLink, p.category, p.displayOrder || 0, p.featured ? 1 : 0]);
      }

      const classesList = Array.isArray(cms.classes) ? cms.classes : DEFAULT_HOMEPAGE_CLASSES;
      for (let c of classesList) {
        await pool.query(`INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.courseImage, c.courseName, c.instructor, c.price, c.description, c.sessions, c.status || 'Published', c.displayOrder || 0, JSON.stringify(c.tags || []), JSON.stringify(c.syllabus || [])]);
      }

      const testimonialsList = Array.isArray(cms.testimonials?.testimonials) ? cms.testimonials.testimonials : (Array.isArray(cms.students) ? cms.students : []);
      for (let t of testimonialsList) {
        await pool.query(`INSERT INTO cms_testimonials (id, student_photo, student_name, course, rating, review, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.studentPhoto || t.avatar, t.studentName || t.name, t.course || "", t.rating || 5, t.review || t.comment, t.displayOrder || 0]);
      }

      const co = cms.contact || {};
      await pool.query(`INSERT INTO cms_contact_settings (id, title, description, email, phone, address, telegram, instagram, linkedin, github, submission_recipient_email) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [co.title || "", co.description || "", co.email || "", co.phone || "", co.address || "", co.telegramUrl || co.telegram || "", co.instagramUrl || co.instagram || "", co.linkedinUrl || co.linkedin || "", co.githubUrl || co.github || "", co.email || ""]);

      const fo = cms.footer || {};
      await pool.query(`INSERT INTO cms_footer_settings (id, logo, animated_text, copyright, footer_button_text, footer_button_link, footer_description, navigation_links_json, social_links_json) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fo.logo || "", fo.animatedText || "", fo.copyright || "", fo.footerButtonText || "", fo.footerButtonLink || "", fo.footerDescription || "", JSON.stringify(fo.navigationLinks || []), JSON.stringify(fo.socialLinks || [])]);

      const se = cms.seo || {};
      await pool.query(`INSERT INTO cms_seo_settings (id, homepage_title, meta_description, keywords, og_title, og_description, og_image, canonical_url, robots_settings) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [se.homepageTitle || "", se.metaDescription || "", se.keywords || "", se.ogTitle || "", se.ogDescription || "", se.ogImage || "", se.canonicalUrl || "", se.robotsSettings || ""]);
    }

    console.log("[Migration] Database setup and seed verification completed successfully.");
  } catch (err: any) {
    console.error(`[Migration Error]: ${err.message}`);
  }
}
