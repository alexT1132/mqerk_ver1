-- Migración: Agregar columnas para revisión manual por asesores
-- Fecha: 2025-12-17
-- Descripción: Agrega columnas para tracking de revisión manual de respuestas cortas

-- Tabla de respuestas de simulaciones
ALTER TABLE simulaciones_respuestas 
  ADD COLUMN IF NOT EXISTS revisada_por INT NULL COMMENT 'ID del usuario asesor que revisó manualmente',
  ADD COLUMN IF NOT EXISTS notas_revision TEXT NULL COMMENT 'Notas del asesor sobre la revisión',
  ADD COLUMN IF NOT EXISTS revisada_at TIMESTAMP NULL COMMENT 'Fecha de revisión manual';

-- Tabla de respuestas de quizzes
ALTER TABLE quizzes_sesiones_respuestas
  ADD COLUMN IF NOT EXISTS revisada_por INT NULL COMMENT 'ID del usuario asesor que revisó manualmente',
  ADD COLUMN IF NOT EXISTS notas_revision TEXT NULL COMMENT 'Notas del asesor sobre la revisión',
  ADD COLUMN IF NOT EXISTS revisada_at TIMESTAMP NULL COMMENT 'Fecha de revisión manual';

-- Índices para mejorar performance de consultas de revisión
CREATE INDEX IF NOT EXISTS idx_sim_resp_revisada_por ON simulaciones_respuestas(revisada_por);
CREATE INDEX IF NOT EXISTS idx_quiz_resp_revisada_por ON quizzes_sesiones_respuestas(revisada_por);
