-- Migración: Añadir columna metadata_json para guardar imagen de preguntas y opciones
-- Sin esta columna, al "Guardar como borrador" con imágenes, la URL no se persiste y en la vista previa (y al reabrir) no se ven.
--
-- Opción A (recomendada): ejecutar el script Node que añade la columna solo si no existe:
--   node server/migrations/run_add_metadata_json.js
--
-- Opción B: ejecutar este SQL a mano. Si una línea da error #1060 "Duplicate column name",
-- esa tabla ya tiene la columna: comenta o borra esa línea y ejecuta solo el resto.

-- Quizzes: preguntas y opciones
-- ALTER TABLE quizzes_preguntas ADD COLUMN metadata_json TEXT NULL COMMENT 'JSON con imagen y otros metadatos de la pregunta';
ALTER TABLE quizzes_preguntas_opciones ADD COLUMN metadata_json TEXT NULL COMMENT 'JSON con imagen y otros metadatos de la opción';

-- Simulaciones: preguntas y opciones
ALTER TABLE simulaciones_preguntas ADD COLUMN metadata_json TEXT NULL COMMENT 'JSON con imagen y otros metadatos de la pregunta';
ALTER TABLE simulaciones_preguntas_opciones ADD COLUMN metadata_json TEXT NULL COMMENT 'JSON con imagen y otros metadatos de la opción';
