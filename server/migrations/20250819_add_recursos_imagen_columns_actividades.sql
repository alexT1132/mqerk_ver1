-- Añade columnas para soportar recursos múltiples (JSON) e imagen de portada en actividades
ALTER TABLE actividades
  ADD COLUMN recursos_json JSON NULL AFTER grupos,
  ADD COLUMN imagen_portada VARCHAR(255) NULL AFTER recursos_json;
