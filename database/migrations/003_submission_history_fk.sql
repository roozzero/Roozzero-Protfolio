-- Migration 003: Preserve submission_history audit records when a user is permanently deleted
-- Converts submission_history.changed_by from NOT NULL / ON DELETE RESTRICT to DEFAULT NULL / ON DELETE SET NULL
ALTER TABLE `submission_history` DROP FOREIGN KEY `submission_history_ibfk_2`;
ALTER TABLE `submission_history` MODIFY COLUMN `changed_by` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `submission_history` ADD CONSTRAINT `fk_submission_history_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
