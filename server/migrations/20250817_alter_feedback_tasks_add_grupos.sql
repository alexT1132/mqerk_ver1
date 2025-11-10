-- Añade columna grupos (JSON) para asignaciones de actividades a grupos
ALTER TABLE feedback_tasks
  ADD COLUMN grupos JSON NULL AFTER due_date;

-- Índice opcional si se filtra por activo ya existe; si se necesitaran búsquedas por tamaño grupos se evaluará después.
