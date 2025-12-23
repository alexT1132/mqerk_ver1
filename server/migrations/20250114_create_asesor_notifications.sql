-- Crear tabla de notificaciones para asesores
CREATE TABLE IF NOT EXISTS asesor_notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  asesor_user_id INT NOT NULL,
  type ENUM('payment','activity_submission','feedback_submission','simulation_completed','system','other') DEFAULT 'other',
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(255) NULL,
  metadata JSON NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_asesor_unread (asesor_user_id, is_read),
  INDEX idx_asesor_created (asesor_user_id, created_at),
  INDEX idx_type (type),
  FOREIGN KEY (asesor_user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

