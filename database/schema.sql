-- MySQL Database Schema for Academy LMS & CMS
-- Compatible with phpMyAdmin, MySQL 5.7+, and MySQL 8.0+
-- Designed with Third Normal Form (3NF), Referential Integrity, Indexes, and Cascades.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `dynamic_states`;
DROP TABLE IF EXISTS `grades`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `calendar_events`;
DROP TABLE IF EXISTS `certificates`;
DROP TABLE IF EXISTS `discussion_replies`;
DROP TABLE IF EXISTS `discussion_threads`;
DROP TABLE IF EXISTS `media_files`;
DROP TABLE IF EXISTS `resource_downloads`;
DROP TABLE IF EXISTS `resources`;
DROP TABLE IF EXISTS `resource_categories`;
DROP TABLE IF EXISTS `submission_history`;
DROP TABLE IF EXISTS `assignment_submissions`;
DROP TABLE IF EXISTS `assignment_files`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `session_attendance`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `course_seasons`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `course_categories`;
DROP TABLE IF EXISTS `cms_versions`;
DROP TABLE IF EXISTS `cms_footer_settings`;
DROP TABLE IF EXISTS `cms_contact_settings`;
DROP TABLE IF EXISTS `cms_testimonials`;
DROP TABLE IF EXISTS `cms_classes`;
DROP TABLE IF EXISTS `cms_projects`;
DROP TABLE IF EXISTS `cms_skills`;
DROP TABLE IF EXISTS `cms_about_statistics`;
DROP TABLE IF EXISTS `cms_about_me`;
DROP TABLE IF EXISTS `cms_hero_section`;
DROP TABLE IF EXISTS `cms_general_settings`;
DROP TABLE IF EXISTS `cms_seo_settings`;
DROP TABLE IF EXISTS `login_history`;
DROP TABLE IF EXISTS `sessions_tokens`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. AUTHENTICATION & USERS SCHEMA
-- ==========================================

-- Roles Table
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions Table
CREATE TABLE `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role-Permissions Junction Table
CREATE TABLE `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `users` (
  `id` VARCHAR(50) PRIMARY KEY, -- standard id string matching firebase/local UUIDs (e.g. 'admin-1', 'stu-1', 'teacher-1')
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT NOT NULL,
  `provider` VARCHAR(50) DEFAULT 'local', -- 'local' or 'google'
  `google_id` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `department` VARCHAR(150) DEFAULT NULL,
  `title_prefix` VARCHAR(20) DEFAULT NULL, -- e.g. 'Dr.', 'Mr.', 'Ms.'
  `specialization` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_token_expires` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions Tokens Table (Login sessions)
CREATE TABLE `sessions_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `session_token` VARCHAR(255) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_token` (`session_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login History Table
CREATE TABLE `login_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Success', 'Failed') NOT NULL,
  `attempt_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_login_history_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 2. WEBSITE CMS SCHEMA
-- ==========================================

-- CMS General Settings
CREATE TABLE `cms_general_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `website_title` VARCHAR(255) NOT NULL DEFAULT 'Roozzero Academy',
  `website_description` TEXT,
  `academy_logo` VARCHAR(255) DEFAULT NULL,
  `favicon` VARCHAR(255) DEFAULT NULL,
  `primary_color` VARCHAR(50) DEFAULT '#000000',
  `secondary_color` VARCHAR(50) DEFAULT '#111111',
  `accent_color` VARCHAR(50) DEFAULT '#FF3B30',
  `default_font` VARCHAR(100) DEFAULT 'Inter',
  `enable_dark_theme` TINYINT(1) DEFAULT 1,
  `maintenance_mode` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Hero Section
CREATE TABLE `cms_hero_section` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `background_image` VARCHAR(255) DEFAULT NULL,
  `overlay_opacity` DECIMAL(3,2) DEFAULT 0.50,
  `overlay_color` VARCHAR(50) DEFAULT '#000000',
  `hero_title` VARCHAR(255) DEFAULT 'ELEVATING DIGITAL CRAFTSMANSHIP',
  `hero_subtitle` TEXT,
  `animated_texts` TEXT, -- Comma separated text values for typing effect
  `cta_button_text` VARCHAR(100) DEFAULT 'Explore Classes',
  `cta_button_link` VARCHAR(255) DEFAULT '#classes',
  `typing_speed` INT DEFAULT 80,
  `loop_typing` TINYINT(1) DEFAULT 1,
  `cursor_style` ENUM('pipe', 'block', 'underline') DEFAULT 'pipe',
  `fade_animation` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS About Me Section
CREATE TABLE `cms_about_me` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `section_title` VARCHAR(255) DEFAULT 'WHO''S ME',
  `subtitle` VARCHAR(255) DEFAULT 'Pioneering Creative Engineering & Architectural Layouts',
  `description` TEXT,
  `personal_image` VARCHAR(255) DEFAULT NULL,
  `social_links_json` JSON DEFAULT NULL, -- stores Twitter, Facebook, GitHub, LinkedIn, Instagram
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS About Me Statistics Table
CREATE TABLE `cms_about_statistics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `label` VARCHAR(100) NOT NULL,
  `value` VARCHAR(50) NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Skills Section
CREATE TABLE `cms_skills` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `percentage` INT NOT NULL,
  `icon` VARCHAR(50) NOT NULL, -- lucide icon name
  `enabled` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Projects Section
CREATE TABLE `cms_projects` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `cover_image` VARCHAR(255) DEFAULT NULL,
  `gallery_images_json` JSON DEFAULT NULL, -- String array of screenshots
  `technologies_json` JSON DEFAULT NULL, -- String array of tags
  `github_link` VARCHAR(255) DEFAULT NULL,
  `live_demo_link` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Classes Section (Live landing courses)
CREATE TABLE `cms_classes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `course_image` VARCHAR(255) DEFAULT NULL,
  `course_name` VARCHAR(255) NOT NULL,
  `instructor` VARCHAR(150) DEFAULT 'Dr. Sarah Vance',
  `price` VARCHAR(50) DEFAULT 'Free',
  `description` TEXT,
  `sessions` INT DEFAULT 12,
  `status` ENUM('Draft', 'Published', 'Hidden') DEFAULT 'Published',
  `display_order` INT DEFAULT 0,
  `tags_json` JSON DEFAULT NULL, -- String array of tags
  `syllabus_json` JSON DEFAULT NULL, -- [{id, title, description, duration}]
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Testimonials Section (My Students feedback)
CREATE TABLE `cms_testimonials` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_photo` VARCHAR(255) DEFAULT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `course` VARCHAR(255) DEFAULT NULL,
  `rating` INT DEFAULT 5,
  `review` TEXT,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Contact Settings Section
CREATE TABLE `cms_contact_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `title` VARCHAR(255) DEFAULT 'GET IN TOUCH',
  `description` TEXT,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT,
  `telegram` VARCHAR(255) DEFAULT NULL,
  `instagram` VARCHAR(255) DEFAULT NULL,
  `linkedin` VARCHAR(255) DEFAULT NULL,
  `github` VARCHAR(255) DEFAULT NULL,
  `submission_recipient_email` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Footer Settings Section
CREATE TABLE `cms_footer_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `logo` VARCHAR(255) DEFAULT NULL,
  `animated_text` TEXT,
  `copyright` VARCHAR(255) DEFAULT NULL,
  `footer_button_text` VARCHAR(100) DEFAULT NULL,
  `footer_button_link` VARCHAR(255) DEFAULT NULL,
  `footer_description` TEXT,
  `navigation_links_json` JSON DEFAULT NULL, -- [{label, url, id}]
  `social_links_json` JSON DEFAULT NULL, -- [{platform, url, id}]
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS SEO Settings Section
CREATE TABLE `cms_seo_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `homepage_title` VARCHAR(255) DEFAULT 'Roozzero Academy',
  `meta_description` TEXT,
  `keywords` TEXT,
  `og_title` VARCHAR(255) DEFAULT NULL,
  `og_description` TEXT,
  `og_image` VARCHAR(255) DEFAULT NULL,
  `canonical_url` VARCHAR(255) DEFAULT NULL,
  `robots_settings` VARCHAR(100) DEFAULT 'index, follow',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CMS Version History
CREATE TABLE `cms_versions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `timestamp` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `config_json` JSON NOT NULL, -- Full CMS configuration snapshot
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 3. COURSES & BATCHeS (LMS CORE) SCHEMA
-- ==========================================

-- Course Categories Table
CREATE TABLE `course_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE `courses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `category_id` INT DEFAULT NULL,
  `students_count` INT DEFAULT 0,
  `sessions_count` INT DEFAULT 0,
  `progress` INT DEFAULT 0,
  `status` ENUM('Active', 'Inactive', 'Archived') DEFAULT 'Active',
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL,
  INDEX `idx_courses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Seasons (Batches / Cohorts) Table
CREATE TABLE `course_seasons` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `max_capacity` INT DEFAULT 25,
  `registration_status` ENUM('Open', 'Closed', 'Not Available') DEFAULT 'Open',
  `notes` TEXT,
  `status` VARCHAR(100) DEFAULT 'Active', -- e.g. 'Active', 'Pending Admin Approval'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_seasons_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student-Course Enrollments (Junction Table with progress details)
CREATE TABLE `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `status` ENUM('Active', 'Completed', 'Dropped', 'Inactive') DEFAULT 'Active',
  `progress` INT DEFAULT 0,
  `attendance_percentage` DECIMAL(5,2) DEFAULT 100.00,
  `avg_grade` DECIMAL(5,2) DEFAULT 0.00,
  `joined_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_student_course` (`student_id`, `course_id`),
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_enrollments_student` (`student_id`),
  INDEX `idx_enrollments_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions (Lectures / Classes / Calendar items) Table
CREATE TABLE `sessions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `course_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `duration` VARCHAR(50) DEFAULT '2 hours',
  `link` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  `student_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_course` (`course_id`),
  INDEX `idx_sessions_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Table
CREATE TABLE `session_attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `status` ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Present',
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_session_student` (`session_id`, `student_id`),
  FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 4. ASSIGNMENTS & SUBMISSIONS SCHEMA
-- ==========================================

-- Assignments Table
CREATE TABLE `assignments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `course_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `publish_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `max_points` INT DEFAULT 100,
  `status` ENUM('Draft', 'Published', 'Archived') DEFAULT 'Published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_assignments_course` (`course_id`),
  INDEX `idx_assignments_due` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment Files Table (Attachments/materials from teachers)
CREATE TABLE `assignment_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) DEFAULT NULL,
  `file_type` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions Table
CREATE TABLE `assignment_submissions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `assignment_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `submitted_at` DATETIME NOT NULL,
  `github_url` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT,
  `status` ENUM('Not Submitted', 'Submitted', 'Under Review', 'Graded', 'Deadline Passed') DEFAULT 'Submitted',
  `grade` INT DEFAULT NULL,
  `feedback` TEXT,
  `submitted_file_name` VARCHAR(255) DEFAULT NULL,
  `submitted_file_url` VARCHAR(255) DEFAULT NULL,
  `submitted_file_size` VARCHAR(50) DEFAULT NULL,
  `submitted_file_type` VARCHAR(50) DEFAULT NULL,
  `corrected_file_name` VARCHAR(255) DEFAULT NULL,
  `corrected_file_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_assignment_student` (`assignment_id`, `student_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_submissions_assignment` (`assignment_id`),
  INDEX `idx_submissions_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submission Revision & Grade History Table
CREATE TABLE `submission_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submission_id` VARCHAR(50) NOT NULL,
  `grade` INT DEFAULT NULL,
  `feedback` TEXT,
  `changed_by` VARCHAR(50) NOT NULL, -- user_id of grader
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 5. RESOURCES & DOWNLOADS SCHEMA
-- ==========================================

-- Resource Categories
CREATE TABLE `resource_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resources Table
CREATE TABLE `resources` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL, -- e.g. 'pdf', 'doc', 'zip', 'code'
  `file_size` VARCHAR(50) DEFAULT NULL,
  `uploaded_at` DATE NOT NULL,
  `visibility` ENUM('Visible', 'Hidden') DEFAULT 'Visible',
  `file_name` VARCHAR(255) DEFAULT NULL,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `download_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `resource_categories` (`id`) ON DELETE SET NULL,
  INDEX `idx_resources_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resource Download Statistics Table
CREATE TABLE `resource_downloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resource_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `download_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 6. DISCUSSIONS SCHEMA
-- ==========================================

-- Threads Table
CREATE TABLE `discussion_threads` (
  `id` VARCHAR(50) PRIMARY KEY,
  `course_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL, -- cached name or student name
  `title` VARCHAR(255) NOT NULL,
  `text` TEXT NOT NULL,
  `time` VARCHAR(50) DEFAULT NULL, -- friendly timestamp (e.g. '10:05 AM', 'Yesterday')
  `status` ENUM('New', 'Replied', 'Under Review', 'Closed') DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_discussions_course` (`course_id`),
  INDEX `idx_discussions_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Replies Table
CREATE TABLE `discussion_replies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `thread_id` VARCHAR(50) NOT NULL,
  `sender_id` VARCHAR(50) NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(50) NOT NULL, -- e.g. 'Instructor', 'Student', 'Admin'
  `time` VARCHAR(50) DEFAULT NULL, -- e.g. '11:20 AM', 'Yesterday'
  `text` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`thread_id`) REFERENCES `discussion_threads` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_replies_thread` (`thread_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 7. CERTIFICATES, CALENDAR, NOTIFICATIONS, ANNOUNCEMENTS, LOGS
-- ==========================================

-- Certificates Table
CREATE TABLE `certificates` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `course_title` VARCHAR(255) NOT NULL,
  `gpa` DECIMAL(3,2) DEFAULT NULL,
  `status` ENUM('Draft', 'Waiting for Admin Approval', 'Approved', 'Rejected') DEFAULT 'Draft',
  `issue_date` DATE DEFAULT NULL,
  `signature_url` VARCHAR(255) DEFAULT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  `download_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_certificates_student` (`student_id`),
  INDEX `idx_certificates_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar Events Table
CREATE TABLE `calendar_events` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('Class', 'Deadline', 'Exam', 'Holiday', 'Office Hours', 'Academy Event') NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(50) DEFAULT 'All Day',
  `duration` VARCHAR(50) DEFAULT NULL,
  `course_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_calendar_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) DEFAULT NULL,
  `recipient_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'System',
  `is_read` TINYINT(1) DEFAULT 0,
  `read_status` TINYINT(1) DEFAULT 0, -- 0 for Unread, 1 for Read
  `priority` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`, `is_read`),
  INDEX `idx_notifications_recipient` (`recipient_id`, `read_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcements Table
CREATE TABLE `announcements` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `course_id` VARCHAR(50) NOT NULL, -- or 'all'
  `course_title` VARCHAR(255) DEFAULT 'All Courses',
  `audience` VARCHAR(150) DEFAULT 'Everyone', -- e.g. 'All Students', 'Everyone', 'Design Department'
  `published_at` DATE NOT NULL,
  `expiration_date` DATE DEFAULT NULL,
  `status` ENUM('Draft', 'Published', 'Expired') DEFAULT 'Published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_announcements_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Library Table
CREATE TABLE `media_files` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('image', 'video', 'pdf', 'icon') NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `size` VARCHAR(50) NOT NULL,
  `upload_date` VARCHAR(50) NOT NULL,
  `dimensions` VARCHAR(50) DEFAULT NULL,
  `usage_count` INT DEFAULT 0,
  `usage_locations_json` JSON DEFAULT NULL, -- String array of tabs/views where it's referenced
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) DEFAULT NULL, -- Nullable for system or guest actions
  `action` VARCHAR(100) NOT NULL, -- e.g. 'Login', 'Course Creation', 'Grade Update'
  `details` TEXT, -- full description of what changed
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_logs_user` (`user_id`),
  INDEX `idx_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 8. ESSENTIAL SYSTEM CONFIGURATION & ROLES
-- ==========================================

-- Seed Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Administrator', 'Super Administrator with system-wide settings & CMS control'),
(2, 'Teacher', 'Faculty instructor managing allocated courses, students, and grading'),
(3, 'Student', 'Enrolled academy learner participating in classes and assignments'),
(4, 'User', 'Standard registered academy user with public portal access');

-- Seed Permissions
INSERT INTO `permissions` (`id`, `name`, `code`, `description`) VALUES
(1, 'Manage System Settings', 'manage_settings', 'Ability to update system preferences and API keys'),
(2, 'Manage CMS Homepage', 'manage_cms', 'Edit editable sections of landing and subpages'),
(3, 'View Admin Analytics', 'view_reports', 'View registration metrics and system-wide audits'),
(4, 'Manage Course Creation', 'create_courses', 'Add, archive or change courses and batched seasons'),
(5, 'Grade Assignments', 'grade_submissions', 'Evaluate submissions and publish letter grades'),
(6, 'Submit Assignments', 'submit_homework', 'Submit Github links and code templates for homework');

-- Seed Role Permissions mapping
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 4), (2, 5),
(3, 6);

-- Seed Master Administrator Account
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `name`, `bio`, `department`, `title_prefix`, `specialization`, `status`) VALUES
('admin-1', 'admin', 'admin@roozzero.info', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQbLVp8.t8Q8C3Z8E7uQ9X0Z7V9K2O', 1, 'Roozbeh Tavakoli', 'Academy director and full stack software architect.', 'LMS Administration', 'Mr.', 'System Architect & Super Admin', 'Active');

-- Seed Course Categories
INSERT INTO `course_categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Web Development', 'web-development', 'Modern web engineering and frameworks'),
(2, 'Cybersecurity', 'cybersecurity', 'Web security, ethical hacking and defense'),
(3, 'CMS & WordPress', 'cms-wordpress', 'Website building, eCommerce and CMS tools'),
(4, 'UI/UX & Design Systems', 'ui-ux-design', 'Interface design, design systems, and user experience');

-- Seed Resource Categories
INSERT INTO `resource_categories` (`id`, `name`, `description`) VALUES
(1, 'Course Lecture Slide Decks', 'PDF presentation slides reviewing main textbook materials'),
(2, 'Workshop Source Code Boilerplate', 'Compressed code scripts containing initial setup modules');

-- Seed CMS General Settings
INSERT INTO `cms_general_settings` (`id`, `website_title`, `website_description`, `academy_logo`, `favicon`, `primary_color`, `secondary_color`, `accent_color`, `default_font`, `enable_dark_theme`, `maintenance_mode`) VALUES
(1, 'Roozzero Academy', 'A high-end, visual platform designed for teaching advanced software engineering systems, modernist structural grids, and digital editorial layouts.', NULL, NULL, '#000000', '#111111', '#FF3B30', 'Inter', 1, 0);

-- Seed CMS Hero Section
INSERT INTO `cms_hero_section` (`id`, `background_image`, `overlay_opacity`, `overlay_color`, `hero_title`, `hero_subtitle`, `animated_texts`, `cta_button_text`, `cta_button_link`, `typing_speed`, `loop_typing`, `cursor_style`, `fade_animation`) VALUES
(1, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop', 0.65, '#050505', 'ELEVATING DIGITAL CRAFTSMANSHIP', 'We train the next generation of creative engineers, layout designers, and modular architects in an elite workspace.', 'Advanced React Systems, Swiss Modernist Layouts, AI Engineering Pipelines, Spatial Graphic Grids', 'Explore Classes', '#classes', 80, 1, 'pipe', 1);

-- Seed CMS About Me Section
INSERT INTO `cms_about_me` (`id`, `section_title`, `subtitle`, `description`, `personal_image`, `social_links_json`) VALUES
(1, 'WHO''S ME', 'Pioneering Creative Engineering & Architectural Layouts', 'We bridge the gap between absolute baseline grid designs and blazing-fast reactive architectures. Our platform offers high-fidelity visual trackers, deep-performance custom reconcilers, and pixel-perfect typographies, making learning immersive, technical, and beautifully modernist.', NULL, '{"github": "https://github.com/roozzero", "twitter": "https://twitter.com/roozzero", "linkedin": "https://linkedin.com/in/roozzero", "instagram": "https://instagram.com/roozzero"}');

-- Seed CMS Contact Settings
INSERT INTO `cms_contact_settings` (`id`, `title`, `description`, `email`, `phone`, `address`, `telegram`, `instagram`, `linkedin`, `github`, `submission_recipient_email`) VALUES
(1, 'GET IN TOUCH', 'Interested in enrollment, collaborative research, or custom workshops? Send your queries below.', 'academy@roozzero.dev', '+98 9123456789', 'Main Campus Office, Creative Engineering Block, Suite 404', '@roozzero_tele', 'roozzero_design', 'roozzero_pro', 'roozzero', 'admin@roozzero.info');

-- Seed CMS Footer Settings
INSERT INTO `cms_footer_settings` (`id`, `logo`, `animated_text`, `copyright`, `footer_button_text`, `footer_button_link`, `footer_description`, `navigation_links_json`, `social_links_json`) VALUES
(1, 'ROOZZERO', 'Pioneering Creative Engineering & Architectural Layouts', '© 2026 Roozzero. All Rights Reserved.', 'Go to Top', '#', 'Designed with absolute architectural honesty, modernist aesthetic rules, and clean reactive performance.', '[{"id": "fl-1", "url": "#classes", "label": "Classes"}, {"id": "fl-2", "url": "#skills", "label": "Skills"}, {"id": "fl-3", "url": "#projects", "label": "Projects"}]', '[{"id": "fs-1", "url": "https://github.com", "platform": "github"}, {"id": "fs-2", "url": "https://linkedin.com", "platform": "linkedin"}]');

-- Seed CMS SEO Settings
INSERT INTO `cms_seo_settings` (`id`, `homepage_title`, `meta_description`, `keywords`, `og_title`, `og_description`, `og_image`, `canonical_url`, `robots_settings`) VALUES
(1, 'Roozzero Academy - Creative Engineering & Modernist Design Systems', 'Elite online portal teaching high-performance React architectures, spatial typography grids, and AI frameworks.', 'react, tailwind, typography, swiss grid, learning management, cms, full stack', 'Roozzero Academy Portal', 'Pioneering Creative Engineering and Modernist Design Systems', NULL, 'https://roozzero.dev', 'index, follow');

-- ==========================================
-- 9. DYNAMIC STATES, EXAMS & GRADES SCHEMA
-- ==========================================

-- Dynamic States Table for unstructured/dynamic keys
CREATE TABLE `dynamic_states` (
  `state_key` VARCHAR(100) PRIMARY KEY,
  `state_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exams Table
CREATE TABLE `exams` (
  `id` VARCHAR(50) PRIMARY KEY,
  `course_id` VARCHAR(50) NOT NULL,
  `teacher_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `duration_minutes` INT DEFAULT 60,
  `due_date` DATE DEFAULT NULL,
  `max_points` INT DEFAULT 100,
  `pass_percentage` INT DEFAULT 60,
  `status` VARCHAR(50) DEFAULT 'Published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Submissions Table
CREATE TABLE `exam_submissions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `exam_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `score` INT DEFAULT 0,
  `max_points` INT DEFAULT 100,
  `passed` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Submitted',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `graded_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grades Table
CREATE TABLE `grades` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `course_title` VARCHAR(255) NOT NULL,
  `assignment_id` VARCHAR(50) NOT NULL,
  `assignment_title` VARCHAR(255) NOT NULL,
  `score` INT NOT NULL,
  `max_points` INT NOT NULL,
  `letter_grade` VARCHAR(10) NOT NULL,
  `published_date` DATE NOT NULL,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

