import { Router, Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { query } from "../db/pool";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadMedia } from "../middleware/upload";
import { DEFAULT_CMS_CONFIG } from "../../src/constants/defaultCms";

const router = Router();

// -------------------------------------------------------------
// GET /api/cms (Public)
// -------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
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
        backgroundImage: hero[0].background_image,
        overlayOpacity: parseFloat(hero[0].overlay_opacity),
        overlayColor: hero[0].overlay_color,
        heroTitle: hero[0].hero_title,
        heroSubtitle: hero[0].hero_subtitle,
        animatedTexts: hero[0].animated_texts ? hero[0].animated_texts.split(", ") : DEFAULT_CMS_CONFIG.hero.animatedTexts,
        ctaButtonText: hero[0].cta_button_text,
        ctaButtonLink: hero[0].cta_button_link,
        typingSpeed: hero[0].typing_speed,
        loopTyping: !!hero[0].loop_typing,
        cursorStyle: hero[0].cursor_style,
        fadeAnimation: !!hero[0].fade_animation
      } : DEFAULT_CMS_CONFIG.hero,

      about: about[0] ? {
        sectionTitle: about[0].section_title,
        subtitle: about[0].subtitle,
        description: about[0].description,
        personalImage: about[0].personal_image,
        statistics: stats.length > 0 ? stats.map(s => ({ label: s.label, value: s.value })) : DEFAULT_CMS_CONFIG.about.statistics,
        socialLinks: about[0].social_links_json || {}
      } : DEFAULT_CMS_CONFIG.about,

      skills: skills.length > 0 ? skills.map(s => ({
        id: s.id,
        name: s.name,
        percentage: s.percentage,
        icon: s.icon,
        enabled: !!s.enabled,
        displayOrder: s.display_order
      })) : DEFAULT_CMS_CONFIG.skills,

      projects: projects.length > 0 ? projects.map(p => ({
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
      })) : DEFAULT_CMS_CONFIG.projects,

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

      students: testimonials.length > 0 ? testimonials.map(t => ({
        id: t.id,
        studentPhoto: t.student_photo,
        studentName: t.student_name,
        course: t.course,
        rating: t.rating,
        review: t.review,
        displayOrder: t.display_order
      })) : DEFAULT_CMS_CONFIG.students,

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
      } : DEFAULT_CMS_CONFIG.contact,

      footer: footer[0] ? {
        logo: footer[0].logo,
        animatedText: footer[0].animated_text,
        copyright: footer[0].copyright,
        footerButtonText: footer[0].footer_button_text,
        footerButtonLink: footer[0].footer_button_link,
        footerDescription: footer[0].footer_description,
        navigationLinks: footer[0].navigation_links_json || [],
        socialLinks: footer[0].social_links_json || []
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
    console.error("[Get CMS Error]:", err);
    return res.json({ success: true, data: DEFAULT_CMS_CONFIG });
  }
});

// -------------------------------------------------------------
// PUT /api/admin/cms/:section (Admin only)
// -------------------------------------------------------------
router.put("/:section", requireAuth, requireRole("Administrator"), async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const data = req.body;

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
      `, [data.backgroundImage, data.overlayOpacity, data.overlayColor, data.heroTitle, data.heroSubtitle, animStr, data.ctaButtonText, data.ctaButtonLink, data.typingSpeed, data.loopTyping ? 1 : 0, data.cursorStyle, data.fadeAnimation ? 1 : 0]);
    } else if (section === "about") {
      await query(`
        INSERT INTO cms_about_me (id, section_title, subtitle, description, personal_image, social_links_json)
        VALUES (1, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          section_title = VALUES(section_title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          personal_image = VALUES(personal_image),
          social_links_json = VALUES(social_links_json)
      `, [data.sectionTitle, data.subtitle, data.description, data.personalImage, JSON.stringify(data.socialLinks || {})]);

      if (Array.isArray(data.statistics)) {
        await query("DELETE FROM cms_about_statistics");
        for (let i = 0; i < data.statistics.length; i++) {
          const s = data.statistics[i];
          await query("INSERT INTO cms_about_statistics (label, value, display_order) VALUES (?, ?, ?)", [s.label, s.value, i]);
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
      `, [data.title, data.description, data.email, data.phone, data.address, data.telegram, data.instagram, data.linkedin, data.github, data.submissionRecipientEmail]);
    } else if (section === "footer") {
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
      `, [data.logo, data.animatedText, data.copyright, data.footerButtonText, data.footerButtonLink, data.footerDescription, JSON.stringify(data.navigationLinks || []), JSON.stringify(data.socialLinks || [])]);
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
    console.error(`[Update CMS Section Error - ${req.params.section}]:`, err);
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
