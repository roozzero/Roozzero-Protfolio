import { Router, Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { query, isDbConnected } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadMedia } from "../middleware/upload";
import { DEFAULT_CMS_CONFIG } from "../../src/constants/defaultCms";

const router = Router();

// -------------------------------------------------------------
// GET /api/cms (Public)
// -------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: DEFAULT_CMS_CONFIG });
    }

    // Check if published config exists in cms_versions
    try {
      const [vRows]: [any[], any] = await query("SELECT config_json FROM cms_versions WHERE id = 'current' LIMIT 1");
      if (vRows && vRows.length > 0 && vRows[0].config_json) {
        const parsed = typeof vRows[0].config_json === "string" ? JSON.parse(vRows[0].config_json) : vRows[0].config_json;
        return res.json({
          success: true,
          data: {
            ...DEFAULT_CMS_CONFIG,
            ...parsed,
            hero: { ...DEFAULT_CMS_CONFIG.hero, ...(parsed.hero || {}) },
            aboutMe: { ...DEFAULT_CMS_CONFIG.aboutMe, ...(parsed.aboutMe || {}) },
            skills: { ...DEFAULT_CMS_CONFIG.skills, ...(parsed.skills || {}) },
            projects: { ...DEFAULT_CMS_CONFIG.projects, ...(parsed.projects || {}) },
            classes: Array.isArray(parsed.classes) && parsed.classes.length > 0 ? parsed.classes : DEFAULT_CMS_CONFIG.classes,
            testimonials: { ...DEFAULT_CMS_CONFIG.testimonials, ...(parsed.testimonials || {}) },
            contact: { ...DEFAULT_CMS_CONFIG.contact, ...(parsed.contact || {}) },
            footer: { ...DEFAULT_CMS_CONFIG.footer, ...(parsed.footer || {}) }
          }
        });
      }
    } catch (vErr) {
      // Table might not exist or pool standby, proceed to table queries
    }

    const [general]: [any[], any] = await query("SELECT * FROM cms_general_settings LIMIT 1");
    const [hero]: [any[], any] = await query("SELECT * FROM cms_hero_section LIMIT 1");
    const [about]: [any[], any] = await query("SELECT * FROM cms_about_me LIMIT 1");
    const [stats]: [any[], any] = await query("SELECT * FROM cms_about_statistics ORDER BY display_order");
    const [skills]: [any[], any] = await query("SELECT * FROM cms_skills ORDER BY display_order");
    const [projects]: [any[], any] = await query("SELECT * FROM cms_projects ORDER BY display_order");
    const [classes]: [any[], any] = await query("SELECT * FROM cms_classes ORDER BY display_order");
    const [testimonials]: [any[], any] = await query("SELECT * FROM cms_testimonials ORDER BY display_order");
    const [contact]: [any[], any] = await query("SELECT * FROM cms_contact_settings LIMIT 1");
    const [footer]: [any[], any] = await query("SELECT * FROM cms_footer_settings LIMIT 1");
    const [seo]: [any[], any] = await query("SELECT * FROM cms_seo_settings LIMIT 1");

    const cmsConfig = {
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
      } : DEFAULT_CMS_CONFIG.general,

      hero: hero[0] ? {
        badge: DEFAULT_CMS_CONFIG.hero.badge,
        headline: hero[0].hero_title || DEFAULT_CMS_CONFIG.hero.headline,
        heroImage: hero[0].background_image || DEFAULT_CMS_CONFIG.hero.heroImage,
        subtitle: hero[0].hero_subtitle || DEFAULT_CMS_CONFIG.hero.subtitle,
        animatedTexts: hero[0].animated_texts ? hero[0].animated_texts.split(", ") : DEFAULT_CMS_CONFIG.hero.animatedTexts,
        ctaButtonText: hero[0].cta_button_text,
        ctaButtonLink: hero[0].cta_button_link,
        typingSpeed: hero[0].typing_speed,
        loopTyping: !!hero[0].loop_typing,
        cursorStyle: hero[0].cursor_style,
        fadeAnimation: !!hero[0].fade_animation
      } : DEFAULT_CMS_CONFIG.hero,

      aboutMe: about[0] ? {
        badge: about[0].subtitle || DEFAULT_CMS_CONFIG.aboutMe.badge,
        title: about[0].section_title || DEFAULT_CMS_CONFIG.aboutMe.title,
        bio: about[0].description || DEFAULT_CMS_CONFIG.aboutMe.bio,
        cvUrl: DEFAULT_CMS_CONFIG.aboutMe.cvUrl,
        githubUrl: DEFAULT_CMS_CONFIG.aboutMe.githubUrl,
        portraitImage: about[0].personal_image || DEFAULT_CMS_CONFIG.aboutMe.portraitImage,
        cards: stats.length > 0 ? stats.map((s, idx) => ({
          id: `card-${idx}`,
          tag: s.label,
          badgeText: s.label,
          badgeIcon: "Award",
          statNumber: s.value,
          statSubtitle: s.label,
          footerLabel: "Standard",
          footerValue: "Active"
        })) : DEFAULT_CMS_CONFIG.aboutMe.cards
      } : DEFAULT_CMS_CONFIG.aboutMe,

      skills: {
        ...DEFAULT_CMS_CONFIG.skills,
        skills: skills.length > 0 ? skills.map(s => ({
          id: s.id,
          name: s.name,
          category: "frontend",
          percentage: s.percentage,
          levelBadge: `${s.percentage}% Proficiency`,
          description: `Comprehensive expertise in ${s.name}`,
          icon: s.icon,
          enabled: !!s.enabled
        })) : DEFAULT_CMS_CONFIG.skills.skills
      },

      projects: {
        ...DEFAULT_CMS_CONFIG.projects,
        projects: projects.length > 0 ? projects.map(p => ({
          id: p.id,
          tabLabel: p.category || "Full-Stack",
          title: p.title,
          badge: p.category || "Application",
          description: p.description,
          coverImage: p.cover_image,
          tags: p.technologies_json || [],
          liveDemoUrl: p.live_demo_link || "#",
          githubUrl: p.github_link || "#"
        })) : DEFAULT_CMS_CONFIG.projects.projects
      },

      classes: classes.length > 0 ? classes.map(c => ({
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
      })) : DEFAULT_CMS_CONFIG.classes,

      classesHeader: DEFAULT_CMS_CONFIG.classesHeader,

      testimonials: {
        ...DEFAULT_CMS_CONFIG.testimonials,
        testimonials: testimonials.length > 0 ? testimonials.map(t => ({
          id: t.id,
          name: t.student_name,
          role: "Student",
          company: "Academy",
          course: t.course,
          rating: t.rating,
          avatar: t.student_photo,
          text: t.review,
          highlight: "Verified Student Feedback"
        })) : DEFAULT_CMS_CONFIG.testimonials.testimonials
      },

      contact: contact[0] ? {
        badge: DEFAULT_CMS_CONFIG.contact.badge,
        title: contact[0].title || DEFAULT_CMS_CONFIG.contact.title,
        description: contact[0].description || DEFAULT_CMS_CONFIG.contact.description,
        email: contact[0].email || DEFAULT_CMS_CONFIG.contact.email,
        phone: contact[0].phone || DEFAULT_CMS_CONFIG.contact.phone,
        location: contact[0].address || DEFAULT_CMS_CONFIG.contact.location,
        telegramUrl: contact[0].telegram || DEFAULT_CMS_CONFIG.contact.telegramUrl,
        instagramUrl: contact[0].instagram || DEFAULT_CMS_CONFIG.contact.instagramUrl,
        linkedinUrl: contact[0].linkedin || DEFAULT_CMS_CONFIG.contact.linkedinUrl,
        githubUrl: contact[0].github || DEFAULT_CMS_CONFIG.contact.githubUrl
      } : DEFAULT_CMS_CONFIG.contact,

      footer: footer[0] ? {
        brandName: footer[0].logo || DEFAULT_CMS_CONFIG.footer.brandName,
        animatedWords: footer[0].animated_text ? footer[0].animated_text.split(", ") : DEFAULT_CMS_CONFIG.footer.animatedWords,
        copyright: footer[0].copyright || DEFAULT_CMS_CONFIG.footer.copyright,
        tagline: footer[0].footer_description || DEFAULT_CMS_CONFIG.footer.tagline
      } : DEFAULT_CMS_CONFIG.footer,

      seo: seo[0] ? {
        homepageTitle: seo[0].homepage_title,
        metaDescription: seo[0].meta_description,
        keywords: seo[0].keywords,
        ogTitle: seo[0].og_title,
        ogDescription: seo[0].og_description,
        ogImage: seo[0].og_image,
        canonicalUrl: seo[0].canonical_url,
        robotsSettings: seo[0].robots_settings
      } : DEFAULT_CMS_CONFIG.seo
    };

    return res.json({ success: true, data: cmsConfig });
  } catch (err: any) {
    return res.json({ success: true, data: DEFAULT_CMS_CONFIG });
  }
});

// Helper to save whole config into cms_versions table
async function saveCmsVersion(fullConfig: any) {
  try {
    if (!isDbConnected()) return;
    await query(`
      INSERT INTO cms_versions (id, timestamp, label, config_json)
      VALUES ('current', NOW(), 'Published Live', ?)
      ON DUPLICATE KEY UPDATE
        timestamp = VALUES(timestamp),
        label = VALUES(label),
        config_json = VALUES(config_json)
    `, [JSON.stringify(fullConfig)]);
  } catch (e: any) {
    console.warn("[Save CMS Version Warning]:", e.message);
  }
}

// -------------------------------------------------------------
// PUT /api/admin/cms/:section (Admin only)
// -------------------------------------------------------------
router.put("/:section", requireAuth, requireRole("Administrator"), async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const data = req.body;

    if (!isDbConnected()) {
      return res.json({ success: true, message: `CMS ${section} updated.` });
    }

    if (section === "all") {
      await saveCmsVersion(data);

      // Also sync relational tables if payload has individual sections
      if (data.hero) {
        const h = data.hero;
        const animStr = Array.isArray(h.animatedTexts) ? h.animatedTexts.join(", ") : (h.animatedTexts || "");
        await query(`
          INSERT INTO cms_hero_section (id, background_image, overlay_opacity, overlay_color, hero_title, hero_subtitle, animated_texts, cta_button_text, cta_button_link, typing_speed, loop_typing, cursor_style, fade_animation)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            background_image = VALUES(background_image),
            hero_title = VALUES(hero_title),
            hero_subtitle = VALUES(hero_subtitle),
            animated_texts = VALUES(animated_texts)
        `, [h.heroImage || h.backgroundImage, "0.50", "#000000", h.headline || h.heroTitle || "ROOZZERO", h.subtitle || "", animStr, h.ctaButtonText || "Explore", h.ctaButtonLink || "#classes", 80, 1, "pipe", 1]);
      }

      if (data.aboutMe) {
        const ab = data.aboutMe;
        await query(`
          INSERT INTO cms_about_me (id, section_title, subtitle, description, personal_image, social_links_json)
          VALUES (1, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            section_title = VALUES(section_title),
            subtitle = VALUES(subtitle),
            description = VALUES(description),
            personal_image = VALUES(personal_image)
        `, [ab.title || "WHO'S ME", ab.badge || "About Me", ab.bio || "", ab.portraitImage || null, JSON.stringify(ab.socialLinks || {})]);
      }

      if (data.skills && Array.isArray(data.skills.skills)) {
        await query("DELETE FROM cms_skills");
        for (let i = 0; i < data.skills.skills.length; i++) {
          const s = data.skills.skills[i];
          await query("INSERT INTO cms_skills (id, name, percentage, icon, enabled, display_order) VALUES (?, ?, ?, ?, ?, ?)",
            [s.id || `skill-${i}`, s.name || "", s.percentage || 100, s.icon || "Code", 1, i]);
        }
      }

      if (data.projects && Array.isArray(data.projects.projects)) {
        await query("DELETE FROM cms_projects");
        for (let i = 0; i < data.projects.projects.length; i++) {
          const p = data.projects.projects[i];
          await query("INSERT INTO cms_projects (id, title, description, cover_image, gallery_images_json, technologies_json, github_link, live_demo_link, category, display_order, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [p.id || `proj-${i}`, p.title || "", p.description || "", p.coverImage || "", JSON.stringify([]), JSON.stringify(p.tags || []), p.githubUrl || "", p.liveDemoUrl || "", p.tabLabel || "", i, 1]);
        }
      }

      if (Array.isArray(data.classes)) {
        await query("DELETE FROM cms_classes");
        for (let i = 0; i < data.classes.length; i++) {
          const c = data.classes[i];
          await query("INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [c.id || `cls-${i}`, c.courseImage || "", c.courseName || "", c.instructor || "", String(c.price || "Free"), c.description || "", c.sessions || 12, c.status || "Published", i, JSON.stringify(c.tags || []), JSON.stringify(c.syllabus || [])]);
        }
      }

      if (data.testimonials && Array.isArray(data.testimonials.testimonials)) {
        await query("DELETE FROM cms_testimonials");
        for (let i = 0; i < data.testimonials.testimonials.length; i++) {
          const t = data.testimonials.testimonials[i];
          await query("INSERT INTO cms_testimonials (id, student_photo, student_name, course, rating, review, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [t.id || `test-${i}`, t.avatar || "", t.name || "", t.course || "", t.rating || 5, t.text || "", i]);
        }
      }

      if (data.contact) {
        const c = data.contact;
        await query(`
          INSERT INTO cms_contact_settings (id, title, description, email, phone, address, telegram, instagram, linkedin, github, submission_recipient_email)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            email = VALUES(email),
            phone = VALUES(phone),
            address = VALUES(address),
            telegram = VALUES(telegram),
            instagram = VALUES(instagram),
            linkedin = VALUES(linkedin),
            github = VALUES(github)
        `, [c.title || "", c.description || "", c.email || "", c.phone || "", c.location || "", c.telegramUrl || "", c.instagramUrl || "", c.linkedinUrl || "", c.githubUrl || "", c.email || ""]);
      }

      if (data.footer) {
        const f = data.footer;
        const words = Array.isArray(f.animatedWords) ? f.animatedWords.join(", ") : (f.animatedText || "");
        await query(`
          INSERT INTO cms_footer_settings (id, logo, animated_text, copyright, footer_button_text, footer_button_link, footer_description, navigation_links_json, social_links_json)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            logo = VALUES(logo),
            animated_text = VALUES(animated_text),
            copyright = VALUES(copyright),
            footer_description = VALUES(footer_description)
        `, [f.brandName || "ROOZZERO", words, f.copyright || "", "", "", f.tagline || "", JSON.stringify([]), JSON.stringify([])]);
      }

      return res.json({ success: true, message: "All homepage sections updated & persisted to database." });
    }

    if (section === "general") {
      await query(`
        INSERT INTO cms_general_settings (id, website_title, website_description, academy_logo, favicon, primary_color, secondary_color, accent_color, default_font, enable_dark_theme, maintenance_mode)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          website_title = VALUES(website_title),
          website_description = VALUES(website_description),
          academy_logo = VALUES(academy_logo),
          favicon = VALUES(favicon),
          primary_color = VALUES(primary_color),
          secondary_color = VALUES(secondary_color),
          accent_color = VALUES(accent_color),
          default_font = VALUES(default_font),
          enable_dark_theme = VALUES(enable_dark_theme),
          maintenance_mode = VALUES(maintenance_mode)
      `, [data.websiteTitle, data.websiteDescription, data.academyLogo, data.favicon, data.primaryColor, data.secondaryColor, data.accentColor, data.defaultFont, data.enableDarkTheme ? 1 : 0, data.maintenanceMode ? 1 : 0]);
    } else if (section === "hero") {
      const animStr = Array.isArray(data.animatedTexts) ? data.animatedTexts.join(", ") : (data.animatedTexts || "");
      await query(`
        INSERT INTO cms_hero_section (id, background_image, overlay_opacity, overlay_color, hero_title, hero_subtitle, animated_texts, cta_button_text, cta_button_link, typing_speed, loop_typing, cursor_style, fade_animation)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          background_image = VALUES(background_image),
          overlay_opacity = VALUES(overlay_opacity),
          overlay_color = VALUES(overlay_color),
          hero_title = VALUES(hero_title),
          hero_subtitle = VALUES(hero_subtitle),
          animated_texts = VALUES(animated_texts),
          cta_button_text = VALUES(cta_button_text),
          cta_button_link = VALUES(cta_button_link),
          typing_speed = VALUES(typing_speed),
          loop_typing = VALUES(loop_typing),
          cursor_style = VALUES(cursor_style),
          fade_animation = VALUES(fade_animation)
      `, [data.heroImage || data.backgroundImage, data.overlayOpacity || "0.50", data.overlayColor || "#000000", data.headline || data.heroTitle, data.subtitle || data.heroSubtitle, animStr, data.ctaButtonText, data.ctaButtonLink, data.typingSpeed, data.loopTyping ? 1 : 0, data.cursorStyle, data.fadeAnimation ? 1 : 0]);
    } else if (section === "about" || section === "aboutMe") {
      await query(`
        INSERT INTO cms_about_me (id, section_title, subtitle, description, personal_image, social_links_json)
        VALUES (1, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          section_title = VALUES(section_title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          personal_image = VALUES(personal_image),
          social_links_json = VALUES(social_links_json)
      `, [data.title || data.sectionTitle, data.badge || data.subtitle, data.bio || data.description, data.portraitImage || data.personalImage, JSON.stringify(data.socialLinks || {})]);

      if (Array.isArray(data.statistics) || Array.isArray(data.cards)) {
        const statsList = data.statistics || data.cards;
        await query("DELETE FROM cms_about_statistics");
        for (let i = 0; i < statsList.length; i++) {
          const s = statsList[i];
          await query("INSERT INTO cms_about_statistics (label, value, display_order) VALUES (?, ?, ?)", [s.label || s.tag || s.badgeText, s.value || s.statNumber, i]);
        }
      }
    } else if (section === "skills") {
      const skillsList = Array.isArray(data.skills) ? data.skills : (Array.isArray(data) ? data : []);
      if (skillsList.length > 0) {
        await query("DELETE FROM cms_skills");
        for (let i = 0; i < skillsList.length; i++) {
          const s = skillsList[i];
          await query("INSERT INTO cms_skills (id, name, percentage, icon, enabled, display_order) VALUES (?, ?, ?, ?, ?, ?)",
            [s.id || `skill-${i}`, s.name, s.percentage, s.icon || "Code", s.enabled !== false ? 1 : 0, i]);
        }
      }
    } else if (section === "projects") {
      const projList = Array.isArray(data.projects) ? data.projects : (Array.isArray(data) ? data : []);
      if (projList.length > 0) {
        await query("DELETE FROM cms_projects");
        for (let i = 0; i < projList.length; i++) {
          const p = projList[i];
          await query("INSERT INTO cms_projects (id, title, description, cover_image, gallery_images_json, technologies_json, github_link, live_demo_link, category, display_order, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [p.id || `proj-${i}`, p.title, p.description, p.coverImage, JSON.stringify(p.galleryImages || []), JSON.stringify(p.tags || []), p.githubUrl || p.githubLink || "", p.liveDemoUrl || p.liveDemoLink || "", p.tabLabel || p.category || "", i, 1]);
        }
      }
    } else if (section === "classes") {
      const classList = Array.isArray(data.classes) ? data.classes : (Array.isArray(data) ? data : []);
      if (classList.length > 0) {
        await query("DELETE FROM cms_classes");
        for (let i = 0; i < classList.length; i++) {
          const c = classList[i];
          await query("INSERT INTO cms_classes (id, course_image, course_name, instructor, price, description, sessions, status, display_order, tags_json, syllabus_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [c.id || `cls-${i}`, c.courseImage, c.courseName, c.instructor, String(c.price || "Free"), c.description, c.sessions || 12, c.status || "Published", i, JSON.stringify(c.tags || []), JSON.stringify(c.syllabus || [])]);
        }
      }
    } else if (section === "students" || section === "testimonials") {
      const testList = Array.isArray(data.testimonials) ? data.testimonials : (Array.isArray(data) ? data : []);
      if (testList.length > 0) {
        await query("DELETE FROM cms_testimonials");
        for (let i = 0; i < testList.length; i++) {
          const t = testList[i];
          await query("INSERT INTO cms_testimonials (id, student_photo, student_name, course, rating, review, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [t.id || `test-${i}`, t.avatar || t.studentPhoto || "", t.name || t.studentName, t.course || "", t.rating || 5, t.text || t.review || "", i]);
        }
      }
    } else if (section === "contact") {
      await query(`
        INSERT INTO cms_contact_settings (id, title, description, email, phone, address, telegram, instagram, linkedin, github, submission_recipient_email)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          email = VALUES(email),
          phone = VALUES(phone),
          address = VALUES(address),
          telegram = VALUES(telegram),
          instagram = VALUES(instagram),
          linkedin = VALUES(linkedin),
          github = VALUES(github),
          submission_recipient_email = VALUES(submission_recipient_email)
      `, [data.title, data.description, data.email, data.phone, data.location || data.address, data.telegramUrl || data.telegram, data.instagramUrl || data.instagram, data.linkedinUrl || data.linkedin, data.githubUrl || data.github, data.email]);
    } else if (section === "footer") {
      const animWords = Array.isArray(data.animatedWords) ? data.animatedWords.join(", ") : (data.animatedText || "");
      await query(`
        INSERT INTO cms_footer_settings (id, logo, animated_text, copyright, footer_button_text, footer_button_link, footer_description, navigation_links_json, social_links_json)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          logo = VALUES(logo),
          animated_text = VALUES(animated_text),
          copyright = VALUES(copyright),
          footer_button_text = VALUES(footer_button_text),
          footer_button_link = VALUES(footer_button_link),
          footer_description = VALUES(footer_description),
          navigation_links_json = VALUES(navigation_links_json),
          social_links_json = VALUES(social_links_json)
      `, [data.brandName || data.logo, animWords, data.copyright, data.footerButtonText || "", data.footerButtonLink || "", data.tagline || data.footerDescription, JSON.stringify(data.navigationLinks || []), JSON.stringify(data.socialLinks || [])]);
    } else if (section === "seo") {
      await query(`
        INSERT INTO cms_seo_settings (id, homepage_title, meta_description, keywords, og_title, og_description, og_image, canonical_url, robots_settings)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          homepage_title = VALUES(homepage_title),
          meta_description = VALUES(meta_description),
          keywords = VALUES(keywords),
          og_title = VALUES(og_title),
          og_description = VALUES(og_description),
          og_image = VALUES(og_image),
          canonical_url = VALUES(canonical_url),
          robots_settings = VALUES(robots_settings)
      `, [data.homepageTitle, data.metaDescription, data.keywords, data.ogTitle, data.ogDescription, data.ogImage, data.canonicalUrl, data.robotsSettings]);
    }

    return res.json({ success: true, message: `CMS ${section} updated successfully.` });
  } catch (err: any) {
    console.warn(`[Update CMS Section Warning - ${req.params.section}]:`, err.message);
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

// -------------------------------------------------------------
// Media Library Endpoints
// -------------------------------------------------------------
router.post("/media/upload", requireAuth, requireRole("Administrator"), uploadMedia.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: { code: "FILE_REQUIRED", message: "Please provide a file." } });
    }

    const mediaId = `med-${crypto.randomBytes(6).toString("hex")}`;
    const filePath = `/uploads/media/${file.filename}`;

    await query(`
      INSERT INTO media_files (id, file_name, stored_name, file_path, file_type, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [mediaId, file.originalname, file.filename, filePath, file.mimetype.split("/")[0], file.mimetype, file.size]);

    return res.status(201).json({
      success: true,
      data: {
        id: mediaId,
        fileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

router.get("/media/files", requireAuth, requireRole("Administrator"), async (req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await query("SELECT * FROM media_files ORDER BY created_at DESC LIMIT 100");
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
});

export default router;
