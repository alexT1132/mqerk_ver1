-- Migración: Actualizar límite diario de estudiantes a 5
-- Fecha: 2025-01-XX
-- Descripción: Cambia el límite diario de estudiantes de 30 a 5 para análisis de simulaciones

-- Actualizar el límite diario de estudiantes a 5
UPDATE `ai_quota_config` 
SET `limite_diario_estudiante` = 5
WHERE `activo` = 1;

-- Verificar que se actualizó correctamente
SELECT 
    id,
    limite_diario_estudiante,
    limite_mensual_estudiante,
    limite_diario_asesor,
    limite_diario_admin
FROM `ai_quota_config`
WHERE `activo` = 1;

