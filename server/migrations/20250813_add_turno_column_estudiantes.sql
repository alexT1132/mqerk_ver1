-- Agrega columna turno para separar del campo grupo
ALTER TABLE estudiantes
  ADD COLUMN turno VARCHAR(50) NOT NULL DEFAULT 'VESPERTINO' AFTER curso;

-- Backfill opcional: si existían datos en grupo que representan turno
UPDATE estudiantes SET turno = grupo WHERE (turno IS NULL OR turno = '') AND grupo IS NOT NULL AND grupo <> '';
