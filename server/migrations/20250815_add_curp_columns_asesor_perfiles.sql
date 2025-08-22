ALTER TABLE asesor_perfiles
  ADD COLUMN curp VARCHAR(18) NULL AFTER firma_texto,
  ADD COLUMN entidad_curp VARCHAR(100) NULL AFTER curp;

-- Índice opcional para búsquedas por CURP
CREATE INDEX idx_asesor_perfiles_curp ON asesor_perfiles(curp);
