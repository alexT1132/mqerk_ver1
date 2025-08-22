-- Permite asignar múltiples grupos a un asesor (lista en JSON) manteniendo compatibilidad con grupo_asesor
ALTER TABLE asesor_perfiles
  ADD COLUMN grupos_asesor JSON NULL AFTER grupo_asesor;

-- Opcional: más adelante migrar valores existentes de grupo_asesor a grupos_asesor.
