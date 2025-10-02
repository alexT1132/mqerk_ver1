-- Create tables for dynamic test question bank and forms
CREATE TABLE IF NOT EXISTS test_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_type VARCHAR(32) NOT NULL, -- e.g., 'wais', 'matematica'
  prompt TEXT NOT NULL,
  points INT NOT NULL DEFAULT 10,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  text VARCHAR(500) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asesor_test_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preregistro_id INT NOT NULL,
  test_type VARCHAR(32) NOT NULL,
  question_ids JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_preregistro_type (preregistro_id, test_type)
);
