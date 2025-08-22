-- Asegura integridad referencial y evita uso de id_area = 5 (contenedor UI)
-- Ejecutar DESPUÉS de 20250818_alter_make_schema_more_robust.sql

-- 1. Limpieza preventiva: cualquier asignación errónea al contenedor se pone NULL
UPDATE actividades SET id_area = NULL WHERE id_area = 5;

-- 1.b Limpiar cualquier id_area que no exista actualmente en catalogo (evita error 150)
UPDATE actividades a
LEFT JOIN areas ar ON ar.id = a.id_area
SET a.id_area = NULL
WHERE a.id_area IS NOT NULL AND ar.id IS NULL;

-- 2. Agregar FK (si ya existe, esta sentencia fallará; manejar afuera si se requiere idempotencia total)
-- 2.a Verificar manualmente antes de ejecutar:
-- SELECT DISTINCT id_area FROM actividades WHERE id_area IS NOT NULL AND id_area NOT IN (SELECT id FROM areas);
-- Si devuelve filas, resolver antes de seguir.

ALTER TABLE actividades 
  ADD CONSTRAINT fk_actividades_area FOREIGN KEY (id_area) REFERENCES areas(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 3. CHECK para prohibir id_area = 5 (contenedor). Ignorado si versión no soporta.
ALTER TABLE actividades
  ADD CONSTRAINT chk_actividades_area_not_container CHECK (id_area IS NULL OR id_area <> 5);
