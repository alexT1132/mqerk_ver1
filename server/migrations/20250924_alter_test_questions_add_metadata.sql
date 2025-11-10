-- Extend test_questions with metadata/support for AI generation and human review
ALTER TABLE test_questions ADD COLUMN difficulty VARCHAR(16) NULL AFTER points;
ALTER TABLE test_questions ADD COLUMN dimension VARCHAR(32) NULL AFTER difficulty;
ALTER TABLE test_questions ADD COLUMN tags LONGTEXT NULL AFTER dimension;
ALTER TABLE test_questions ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'human' AFTER tags;
ALTER TABLE test_questions ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'draft' AFTER source;
ALTER TABLE test_questions ADD COLUMN seed_prompt LONGTEXT NULL AFTER status;
ALTER TABLE test_questions ADD COLUMN provenance_model VARCHAR(64) NULL AFTER seed_prompt;
ALTER TABLE test_questions ADD COLUMN hash VARCHAR(64) NULL AFTER provenance_model;
ALTER TABLE test_questions ADD INDEX idx_test_type_status (test_type, status);
