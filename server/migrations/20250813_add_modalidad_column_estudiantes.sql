-- Agregar columna 'modalidad' separada de 'postulacion' (antes se reutilizaba postulacion para guardar modalidad)
ALTER TABLE estudiantes 
  ADD COLUMN modalidad VARCHAR(50) NULL AFTER postulacion;

-- Migrar datos existentes: copiar valores previos usados como modalidad
UPDATE estudiantes SET modalidad = postulacion WHERE (modalidad IS NULL OR modalidad = '') AND postulacion IS NOT NULL AND postulacion <> '';

-- (Opcional) Si en el futuro 'postulacion' tendrá otro propósito, mantenerla; de lo contrario podría eliminarse tras validar.
