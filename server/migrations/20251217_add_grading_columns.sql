-- Migración: Agregar columnas para calificación en segundo plano
-- Fecha: 2025-12-17
-- Descripción: Agrega columnas para tracking de calificación de respuestas cortas

-- Tabla de respuestas de simulaciones
ALTER TABLE simulaciones_respuestas 
  ADD COLUMN IF NOT EXISTS calificacion_status ENUM('pending', 'graded', 'manual_review') DEFAULT 'graded' COMMENT 'Estado de calificación de la respuesta',
  ADD COLUMN IF NOT EXISTS calificacion_metodo VARCHAR(50) NULL COMMENT 'Método usado: exacta, palabras_clave, ia, revisar',
  ADD COLUMN IF NOT EXISTS calificacion_confianza INT NULL COMMENT 'Nivel de confianza 0-100',
  ADD COLUMN IF NOT EXISTS calificada_at TIMESTAMP NULL COMMENT 'Fecha de calificación';

-- Tabla de respuestas de quizzes
ALTER TABLE quizzes_sesiones_respuestas
  ADD COLUMN IF NOT EXISTS calificacion_status ENUM('pending', 'graded', 'manual_review') DEFAULT 'graded' COMMENT 'Estado de calificación de la respuesta',
  ADD COLUMN IF NOT EXISTS calificacion_metodo VARCHAR(50) NULL COMMENT 'Método usado: exacta, palabras_clave, ia, revisar',
  ADD COLUMN IF NOT EXISTS calificacion_confianza INT NULL COMMENT 'Nivel de confianza 0-100',
  ADD COLUMN IF NOT EXISTS calificada_at TIMESTAMP NULL COMMENT 'Fecha de calificación';

-- Índices para mejorar performance de consultas de calificación pendiente
CREATE INDEX IF NOT EXISTS idx_sim_resp_calificacion_status ON simulaciones_respuestas(calificacion_status);
CREATE INDEX IF NOT EXISTS idx_quiz_resp_calificacion_status ON quizzes_sesiones_respuestas(calificacion_status);

-- Comentarios para documentación
ALTER TABLE simulaciones_respuestas COMMENT = 'Respuestas de estudiantes a simulaciones con soporte para calificación automática';
ALTER TABLE quizzes_sesiones_respuestas COMMENT = 'Respuestas de estudiantes a quizzes con soporte para calificación automática';
