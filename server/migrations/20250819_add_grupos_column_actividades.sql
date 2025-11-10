-- Agrega columna grupos (JSON) a actividades para asignar grupos a cada actividad
ALTER TABLE actividades
  ADD COLUMN grupos JSON NULL AFTER fecha_limite;
