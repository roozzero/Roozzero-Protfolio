import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { getDbPool } from "./pool";
import { DEFAULT_CMS_CONFIG, DEFAULT_HOMEPAGE_CLASSES } from "../../src/constants/defaultCms";

dotenv.config();

export async function runMigrationsAndSeeds() {
  const pool = getDbPool();
  if (!pool) {
    console.warn("[Migration] Database pool is not initialized. Skipping DB migrations.");
    return;
  }

  try {
    console.log("[Migration] Checking and running schema migrations...");
    const migrationsDir = path.join(process.cwd(), "database", "migrations");
    if (fs.existsSync(migrationsDir)) {
      const sqlFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
      for (const file of sqlFiles) {
        const sqlContent = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        const cleanSql = sqlContent
          .split("\n")
          .filter(line => !line.trim().startsWith("--"))
          .join("\n");

        const statements = cleanSql
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (stmtErr: any) {
            const msg = String(stmtErr.message || "");
            if (
              !msg.includes("already exists") &&
              !msg.includes("Duplicate column") &&
              !msg.includes("duplicate column name") &&
              !msg.includes("Duplicate key name")
            ) {
              console.warn(`[Migration Warning ${file}]: ${msg}`);
            }
          }
        }
      }
      console.log("[Migration] Schema tables and extensions verified successfully.");
    }

    // Ensure login_history.user_id is nullable to support failed unknown logins
    try {
      await pool.query("ALTER TABLE `login_history` MODIFY COLUMN `user_id` VARCHAR(50) DEFAULT NULL");
    } catch {
      // Ignore if table does not exist yet or already altered
    }

    // Seed Roles (RBAC: Administrator, Teacher, Student, User)
    const [rolesCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM roles");
    if (rolesCount[0].count === 0) {
      console.log("[Migration] Seeding standard RBAC roles...");
      await pool.query(`
        INSERT INTO roles (id, name, description) VALUES
        (1, 'Administrator', 'Full system access and LMS management'),
        (2, 'Teacher', 'Manage assigned courses, students, grading and sessions'),
        (3, 'Student', 'Enroll in courses, view lessons, submit assignments'),
        (4, 'User', 'Standard registered academy user with public portal access')
      `);
    } else {
      // Ensure 'User' role exists in existing databases
      const [userRoleExists]: [any[], any] = await pool.query("SELECT id FROM roles WHERE name = 'User' LIMIT 1");
      if (userRoleExists.length === 0) {
        console.log("[Migration] Adding missing 'User' role to roles table...");
        await pool.query("INSERT INTO roles (name, description) VALUES ('User', 'Standard registered academy user with public portal access')");
      }
    }

    // Canonical Master Administrator Synchronization from process.env.ADMIN_EMAIL and process.env.ADMIN_PASSWORD
    const [adminRoleRows]: [any[], any] = await pool.query(
      "SELECT id FROM roles WHERE name = 'Administrator' LIMIT 1"
    );
    const adminRoleId = adminRoleRows.length > 0 ? adminRoleRows[0].id : 1;

    const configuredAdminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : "admin@roozzero.info";
    const configuredAdminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    // Look up existing Administrator by canonical role, not old email
    const [adminUsers]: [any[], any] = await pool.query(
      `SELECT u.id, u.username, u.email, u.password_hash, u.role_id, u.status
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'Administrator'
       LIMIT 1`
    );

    if (adminUsers.length === 0) {
      if (configuredAdminEmail && configuredAdminPassword) {
        console.log(`[Migration] Initializing canonical Administrator account (${configuredAdminEmail})...`);
        const hashedPassword = await bcrypt.hash(configuredAdminPassword, 10);
        await pool.query(`
          INSERT INTO users (id, username, email, password_hash, role_id, name, title_prefix, department, specialization, bio, status)
          VALUES ('admin-1', 'admin', ?, ?, ?, 'Roozbeh Tavakoli', 'Mr.', 'LMS Administration', 'System Architect & Super Admin', 'Academy director and full stack software architect.', 'Active')
        `, [configuredAdminEmail, hashedPassword, adminRoleId]);
      }
    } else {
      const existingAdmin = adminUsers[0];
      const adminId = existingAdmin.id;

      // Synchronize Email from process.env.ADMIN_EMAIL if configured and different
      if (process.env.ADMIN_EMAIL && configuredAdminEmail !== (existingAdmin.email || "").trim().toLowerCase()) {
        const [conflictRows]: [any[], any] = await pool.query(
          "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
          [configuredAdminEmail, adminId]
        );
        if (conflictRows.length > 0) {
          console.error(`[Migration Error] Configured ADMIN_EMAIL (${configuredAdminEmail}) is already in use by user ID: ${conflictRows[0].id}. Skipping email update.`);
        } else {
          await pool.query("UPDATE users SET email = ? WHERE id = ?", [configuredAdminEmail, adminId]);
          console.log(`[Migration] Updated Administrator email to configured ADMIN_EMAIL (${configuredAdminEmail}).`);
        }
      }

      // Synchronize Password from process.env.ADMIN_PASSWORD if configured
      if (configuredAdminPassword) {
        let needsPasswordUpdate = false;
        const currentHash = existingAdmin.password_hash || "";

        // Check if existing hash is invalid, plaintext, or does not match configured password
        const isBcryptFormat = currentHash.startsWith("$2a$") || currentHash.startsWith("$2b$") || currentHash.startsWith("$2y$");
        if (!isBcryptFormat) {
          needsPasswordUpdate = true;
        } else if (process.env.ADMIN_PASSWORD) {
          try {
            const matches = await bcrypt.compare(configuredAdminPassword, currentHash);
            if (!matches) {
              needsPasswordUpdate = true;
            }
          } catch {
            needsPasswordUpdate = true;
          }
        }

        if (needsPasswordUpdate) {
          const newHashedPassword = await bcrypt.hash(configuredAdminPassword, 10);
          await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHashedPassword, adminId]);
          console.log("[Migration] Synchronized Administrator password.");
        }
      }
    }

    // Remove unintended demo users (@academy.local) and recalculate real course enrollment counts
    try {
      await pool.query(
        "UPDATE courses SET teacher_id = NULL WHERE teacher_id IN ('teacher-1', 'stu-1', 'stu-2')"
      );
      await pool.query(
        "DELETE FROM users WHERE id IN ('teacher-1', 'stu-1', 'stu-2') OR email IN ('teacher@academy.local', 'student@academy.local', 'courtney.henry@academy.local', 'cody.fisher@academy.local')"
      );
      await pool.query(
        "UPDATE courses SET students_count = (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = courses.id)"
      );
    } catch (cleanupErr: any) {
      console.warn("[Migration Cleanup Notice]:", cleanupErr.message);
    }

    // Seed Course Categories
    const [catCount]: [any[], any] = await pool.query("SELECT COUNT(*) as count FROM course_categories");
    if (catCount[0].count === 0) {
      console.log("[Migration] Seeding default course categories...");
      await pool.query(`
        INSERT INTO course_categories (id, name, slug, description) VALUES
        (1, 'Web Development', 'web-development', 'Modern web engineering and frameworks'),
        (2, 'Cybersecurity', 'cybersecurity', 'Web security, ethical hacking and defense'),
        (3, 'CMS & WordPress', 'cms-wordpress', 'Website building, eCommerce and CMS tools'),
        (4, 'UI/UX & Design Systems', 'ui-ux-design', 'Interface design, design systems, and user experience')
      `);
    } else {
      await pool.query(`
        INSERT IGNORE INTO course_categories (id, name, slug, description) VALUES
        (4, 'UI/UX & Design Systems', 'ui-ux-design', 'Interface design, design systems, and user experience')
      `).catch(() => {});
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
    throw err;
  }
}
