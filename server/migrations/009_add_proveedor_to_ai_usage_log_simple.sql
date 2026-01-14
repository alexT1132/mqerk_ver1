-- Migración SIMPLE: Agregar campo proveedor a ai_usage_log
-- Fecha: 2025-01-XX
-- Descripción: Agrega el campo 'proveedor' para distinguir entre Gemini y Groq
-- NOTA: Si la columna ya existe, este script dará error pero es seguro ignorarlo

-- Agregar columna proveedor
-- Si ya existe, MySQL dará error 1060 (Duplicate column name) - puedes ignorarlo
ALTER TABLE `ai_usage_log` 
ADD COLUMN `proveedor` VARCHAR(20) DEFAULT 'gemini' 
COMMENT 'Proveedor de IA usado: gemini o groq' 
AFTER `modelo_usado`;

-- Actualizar registros existentes para que tengan 'gemini' como proveedor por defecto
UPDATE `ai_usage_log` 
SET `proveedor` = 'gemini' 
WHERE `proveedor` IS NULL OR `proveedor` = '';

-- Agregar índice para consultas por proveedor
-- Si ya existe, MySQL dará error 1061 (Duplicate key name) - puedes ignorarlo
CREATE INDEX `idx_ai_log_proveedor` ON `ai_usage_log` (`proveedor`);

-- Actualizar comentario de la tabla
ALTER TABLE `ai_usage_log` 
COMMENT = 'Registro detallado de cada llamada a APIs de IA (Gemini/Groq)';

