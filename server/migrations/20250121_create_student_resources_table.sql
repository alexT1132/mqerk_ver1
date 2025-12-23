-- Crear tabla para recursos educativos subidos por alumnos
-- Estos recursos son visibles para todos los alumnos
CREATE TABLE IF NOT EXISTS student_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  tags JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estudiante_created (estudiante_id, created_at),
  INDEX idx_estudiante_type (estudiante_id, file_type),
  FULLTEXT INDEX idx_search (title, description),
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

