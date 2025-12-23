-- Migración: Agregar columnas para apellidos separados
-- Fecha: 2025-12-08
-- Descripción: Agrega columnas apellido_paterno y apellido_materno a la tabla estudiantes
--              para facilitar el manejo y visualización de datos

-- Agregar columnas nuevas
ALTER TABLE `estudiantes` 
ADD COLUMN `apellido_paterno` varchar(100) DEFAULT NULL AFTER `nombre`,
ADD COLUMN `apellido_materno` varchar(100) DEFAULT NULL AFTER `apellido_paterno`;

-- Migrar datos existentes: dividir apellidos en paterno y materno
-- Esto asume que el primer apellido es el paterno y el resto es el materno
UPDATE `estudiantes` 
SET 
  `apellido_paterno` = SUBSTRING_INDEX(`apellidos`, ' ', 1),
  `apellido_materno` = CASE 
    WHEN LOCATE(' ', `apellidos`) > 0 
    THEN SUBSTRING(`apellidos`, LOCATE(' ', `apellidos`) + 1)
    ELSE ''
  END
WHERE `apellidos` IS NOT NULL AND `apellidos` != '';

-- Hacer las columnas NOT NULL después de migrar los datos
ALTER TABLE `estudiantes` 
MODIFY COLUMN `apellido_paterno` varchar(100) NOT NULL,
MODIFY COLUMN `apellido_materno` varchar(100) NOT NULL;

-- Nota: La columna `apellidos` se mantiene para compatibilidad con código existente
-- pero se recomienda usar apellido_paterno y apellido_materno en el futuro

