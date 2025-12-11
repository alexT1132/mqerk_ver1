-- Crear tabla para notificaciones de confirmación de asesorías realizadas
CREATE TABLE IF NOT EXISTS admin_asesoria_confirmaciones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ingreso_id INT NOT NULL,
  asesor_user_id INT NOT NULL,
  asesor_nombre VARCHAR(255) NOT NULL,
  estudiante_id INT NULL,
  alumno_nombre VARCHAR(255) NULL,
  curso VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NULL,
  estado ENUM('pendiente', 'confirmada', 'rechazada') DEFAULT 'pendiente',
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_ingreso (ingreso_id),
  INDEX idx_asesor (asesor_user_id),
  INDEX idx_created (created_at),
  FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

