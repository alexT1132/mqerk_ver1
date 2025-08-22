-- Añade columna para asignar un grupo único al asesor
ALTER TABLE asesor_perfiles
  ADD COLUMN grupo_asesor VARCHAR(10) NULL AFTER usuario_id,
  ADD INDEX idx_asesor_perfiles_grupo (grupo_asesor);
