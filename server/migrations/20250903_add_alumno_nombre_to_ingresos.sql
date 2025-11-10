-- Agrega columna para almacenar el nombre del alumno capturado manualmente
ALTER TABLE ingresos
  ADD COLUMN alumno_nombre VARCHAR(200) NULL AFTER estudiante_id;

-- (Opcional) Completar para registros existentes con nombre desde estudiantes
UPDATE ingresos i
LEFT JOIN estudiantes e ON e.id = i.estudiante_id
SET i.alumno_nombre = CONCAT(COALESCE(e.nombre,''), ' ', COALESCE(e.apellidos,''))
WHERE i.alumno_nombre IS NULL AND i.estudiante_id IS NOT NULL;
