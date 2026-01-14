-- Migración: Agregar campo proveedor a ai_usage_log
-- Fecha: 2025-01-XX
-- Descripción: Agrega el campo 'proveedor' para distinguir entre Gemini y Groq

-- Verificar si la columna existe antes de agregarla
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_usage_log' 
    AND COLUMN_NAME = 'proveedor'
);

-- Agregar columna proveedor solo si no existe
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `ai_usage_log` 
     ADD COLUMN `proveedor` VARCHAR(20) DEFAULT ''gemini'' 
     COMMENT ''Proveedor de IA usado: gemini o groq'' 
     AFTER `modelo_usado`',
    'SELECT ''Columna proveedor ya existe'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros existentes para que tengan 'gemini' como proveedor por defecto
UPDATE `ai_usage_log` 
SET `proveedor` = 'gemini' 
WHERE `proveedor` IS NULL OR `proveedor` = '';

-- Verificar si el índice existe antes de crearlo
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_usage_log' 
    AND INDEX_NAME = 'idx_ai_log_proveedor'
);

-- Agregar índice para consultas por proveedor solo si no existe
SET @sql_idx = IF(@idx_exists = 0,
    'CREATE INDEX `idx_ai_log_proveedor` ON `ai_usage_log` (`proveedor`)',
    'SELECT ''Índice idx_ai_log_proveedor ya existe'' AS message'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Actualizar comentario de la tabla
ALTER TABLE `ai_usage_log` 
COMMENT = 'Registro detallado de cada llamada a APIs de IA (Gemini/Groq)';

