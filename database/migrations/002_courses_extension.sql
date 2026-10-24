-- Extension for courses table to support publishing, dates, syllabus, and teacher requests
-- Each column addition is a standalone statement so existing columns can be safely skipped by the migration runner
ALTER TABLE `courses` ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `price` VARCHAR(50) DEFAULT 'Free';
ALTER TABLE `courses` ADD COLUMN `description` LONGTEXT DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `short_description` TEXT DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `teacher_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `start_date` DATE DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `end_date` DATE DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `syllabus_json` LONGTEXT DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `is_published` TINYINT(1) DEFAULT 0;
ALTER TABLE `courses` ADD COLUMN `requested_by` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `courses` ADD COLUMN `approval_status` VARCHAR(50) DEFAULT 'Approved';
ALTER TABLE `courses` MODIFY COLUMN `status` VARCHAR(50) DEFAULT 'Active';

-- Align notifications table columns with backend routes safely across both 001_initial_schema.sql and schema.sql
ALTER TABLE `notifications` ADD COLUMN `recipient_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `notifications` ADD COLUMN `user_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `notifications` ADD COLUMN `link` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `notifications` ADD COLUMN `is_read` TINYINT(1) DEFAULT 0;
ALTER TABLE `notifications` ADD COLUMN `read_status` TINYINT(1) DEFAULT 0;
ALTER TABLE `notifications` ADD COLUMN `priority` VARCHAR(20) DEFAULT 'Medium';
ALTER TABLE `notifications` MODIFY COLUMN `user_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `notifications` MODIFY COLUMN `recipient_id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `notifications` MODIFY COLUMN `type` VARCHAR(50) DEFAULT 'System';

