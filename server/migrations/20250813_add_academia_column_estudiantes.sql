-- Agrega columna academia con valor por defecto
ALTER TABLE estudiantes 
  ADD COLUMN academia VARCHAR(100) NOT NULL DEFAULT 'MQerKAcademy' AFTER plan;
