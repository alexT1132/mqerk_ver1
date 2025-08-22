-- Crear tabla de preregistros de asesores
CREATE TABLE IF NOT EXISTS asesor_preregistros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(160) NOT NULL,
  correo VARCHAR(160) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  area VARCHAR(120) NOT NULL,
  estudios VARCHAR(120) NOT NULL,
  status ENUM('pending','testing','completed','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_asesor_prereg_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
