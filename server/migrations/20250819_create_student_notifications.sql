-- Crear tabla de notificaciones para estudiantes
CREATE TABLE IF NOT EXISTS student_notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  type ENUM('assignment','grade','payment','class_reminder','new_content','message','progress','system','other') DEFAULT 'other',
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(255) NULL,
  metadata JSON NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_unread (student_id, is_read),
  INDEX idx_student_created (student_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
