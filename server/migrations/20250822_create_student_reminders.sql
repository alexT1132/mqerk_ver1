-- Tabla de recordatorios personales del alumno
CREATE TABLE IF NOT EXISTS student_reminders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  date DATE NOT NULL,
  priority ENUM('red','orange','yellow','green','blue','purple') DEFAULT 'blue',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_date (student_id, date),
  INDEX idx_student_created (student_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
