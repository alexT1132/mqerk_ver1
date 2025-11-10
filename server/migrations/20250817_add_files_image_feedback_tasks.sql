ALTER TABLE feedback_tasks
  ADD COLUMN archivos_json JSON NULL AFTER descripcion,
  ADD COLUMN imagen_portada VARCHAR(255) NULL AFTER archivos_json;

-- Index para consultas frecuentes
CREATE INDEX idx_feedback_tasks_activo ON feedback_tasks (activo);
