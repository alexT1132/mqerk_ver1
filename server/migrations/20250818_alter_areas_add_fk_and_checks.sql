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

-- Agregar FK solo si no existe ya
SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS rc
  WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
    AND rc.CONSTRAINT_NAME = 'fk_actividades_area'
);
SET @add_fk_sql := IF(@fk_exists = 0,
  'ALTER TABLE actividades ADD CONSTRAINT fk_actividades_area FOREIGN KEY (id_area) REFERENCES areas(id) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @add_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. CHECK para prohibir id_area = 5 (contenedor). Ignorado si versión no soporta.
-- Agregar CHECK solo si no existe ya (MySQL 8.0+) 
SET @chk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS tc
  WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
    AND tc.TABLE_NAME = 'actividades'
    AND tc.CONSTRAINT_TYPE = 'CHECK'
    AND tc.CONSTRAINT_NAME = 'chk_actividades_area_not_container'
);
SET @add_chk_sql := IF(@chk_exists = 0,
  'ALTER TABLE actividades ADD CONSTRAINT chk_actividades_area_not_container CHECK (id_area IS NULL OR id_area <> 5)',
  'SELECT 1'
);
PREPARE stmt2 FROM @add_chk_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
