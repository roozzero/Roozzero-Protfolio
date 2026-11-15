-- ============================================================================
-- Migration 004: Course Workspace Extensions (Resources, Assignments, Discussions, Feedback)
-- Ensures all course workspace entities are associated with courses(id) in MySQL
-- and ready for both Administrator management and Student consumption.
-- ============================================================================

-- 1. Extend resources table to support descriptions, file paths, and external URLs across all schema versions
ALTER TABLE `resources` ADD COLUMN `description` TEXT DEFAULT NULL;
ALTER TABLE `resources` ADD COLUMN `teacher_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `resources` ADD COLUMN `stored_name` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `resources` ADD COLUMN `file_path` TEXT DEFAULT NULL;
ALTER TABLE `resources` ADD COLUMN `file_url` TEXT DEFAULT NULL;
ALTER TABLE `resources` ADD COLUMN `external_url` TEXT DEFAULT NULL;

-- 2. Extend assignments table to support detailed instructions and attachments/resources
ALTER TABLE `assignments` ADD COLUMN `instructions` TEXT DEFAULT NULL;
ALTER TABLE `assignments` ADD COLUMN `attachment_url` TEXT DEFAULT NULL;
ALTER TABLE `assignments` ADD COLUMN `attachment_name` VARCHAR(255) DEFAULT NULL;

-- 3. Extend discussion_threads to record author role (Student, Instructor, Administrator)
ALTER TABLE `discussion_threads` ADD COLUMN `author_role` VARCHAR(30) DEFAULT 'Student';

-- 4. Create course_feedback table separating administrator feedback/notes from student-submitted feedback
CREATE TABLE IF NOT EXISTS `course_feedback` (
  `id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `author_id` VARCHAR(50) DEFAULT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `author_role` VARCHAR(30) NOT NULL DEFAULT 'Administrator',
  `feedback_type` ENUM('admin', 'student') NOT NULL DEFAULT 'admin',
  `title` VARCHAR(200) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED DEFAULT NULL,
  `visibility` ENUM('Visible', 'Internal') NOT NULL DEFAULT 'Visible',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_feedback_course` (`course_id`),
  KEY `idx_course_feedback_type` (`feedback_type`),
  CONSTRAINT `fk_course_feedback_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_feedback_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
