-- Tabla para tracking de uso de análisis IA
-- Permite controlar límites diarios por estudiante y tipo de análisis

CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de análisis: simulacion, quiz',
  contador INT DEFAULT 0 COMMENT 'Número de análisis usados hoy',
  limite_diario INT DEFAULT 5 COMMENT 'Límite diario según rol del estudiante',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para optimizar consultas
  UNIQUE KEY unique_student_date_type (id_estudiante, fecha, tipo),
  INDEX idx_student_date (id_estudiante, fecha),
  INDEX idx_date (fecha),
  
  -- Relación con tabla de estudiantes
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracking de uso diario de análisis IA por estudiante';

-- Crear índice adicional para limpiezas periódicas
CREATE INDEX idx_fecha_cleanup ON ai_usage_tracking(fecha);
