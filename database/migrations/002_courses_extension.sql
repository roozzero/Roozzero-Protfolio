-- Extension for courses table to support publishing, dates, syllabus, and teacher requests
ALTER TABLE `courses`
  ADD COLUMN IF NOT EXISTS `slug` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `price` VARCHAR(50) DEFAULT 'Free',
  ADD COLUMN IF NOT EXISTS `description` LONGTEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `short_description` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `teacher_id` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `start_date` DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `end_date` DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `syllabus_json` LONGTEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_published` TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `requested_by` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approval_status` VARCHAR(50) DEFAULT 'Approved',
  MODIFY COLUMN `status` VARCHAR(50) DEFAULT 'Active';

-- Align notifications table columns with backend routes
ALTER TABLE `notifications`
  MODIFY COLUMN `id` VARCHAR(50) NOT NULL DEFAULT (UUID()),
  ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(50) NULL AFTER `recipient_id`,
  ADD COLUMN IF NOT EXISTS `link` VARCHAR(255) NULL AFTER `message`,
  MODIFY COLUMN `recipient_id` VARCHAR(50) NULL,
  MODIFY COLUMN `type` VARCHAR(50) DEFAULT 'System';
