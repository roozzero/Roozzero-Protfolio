-- ============================================================================
-- ROOZZERO ACADEMY - MIGRATION 005: CERTIFICATES, ATTENDANCE & EXAM SUBMISSIONS
-- ============================================================================

SET NAMES utf8mb4;

-- Ensure certificates table has certificate_number, verification_token, and final_grade columns
ALTER TABLE `certificates`
  ADD COLUMN IF NOT EXISTS `certificate_number` VARCHAR(100) DEFAULT NULL AFTER `course_title`,
  ADD COLUMN IF NOT EXISTS `verification_token` VARCHAR(100) DEFAULT NULL AFTER `certificate_number`,
  ADD COLUMN IF NOT EXISTS `final_grade` DECIMAL(5,2) DEFAULT NULL AFTER `verification_token`;

-- Ensure default attendance_percentage on new enrollments is 0.00 (not 100.00) when no attendance records exist
ALTER TABLE `enrollments`
  MODIFY COLUMN `attendance_percentage` DECIMAL(5,2) DEFAULT 0.00;

-- Ensure exam_submissions table has feedback column used by student exams endpoints
ALTER TABLE `exam_submissions`
  ADD COLUMN IF NOT EXISTS `feedback` TEXT DEFAULT NULL AFTER `passed`;
