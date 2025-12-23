-- Crear tabla para recursos educativos subidos por administrador
-- Estos recursos son visibles para todos los asesores
CREATE TABLE IF NOT EXISTS admin_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  tags JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_created (admin_user_id, created_at),
  INDEX idx_admin_type (admin_user_id, file_type),
  FULLTEXT INDEX idx_search (title, description),
  FOREIGN KEY (admin_user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

