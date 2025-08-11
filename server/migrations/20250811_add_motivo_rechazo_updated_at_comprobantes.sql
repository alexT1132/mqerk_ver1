-- Migration: add motivo_rechazo and updated_at to comprobantes (idempotent)
-- Date: 2025-08-11

-- Backup (optional; skipped if already exists)
CREATE TABLE IF NOT EXISTS comprobantes_backup_20250811 AS
  SELECT * FROM comprobantes;

-- Add motivo_rechazo column if missing
SET @need_motivo := (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comprobantes'
    AND COLUMN_NAME = 'motivo_rechazo'
);
SET @sql := IF(@need_motivo,
  'ALTER TABLE comprobantes ADD COLUMN motivo_rechazo TEXT NULL AFTER metodo',
  'SELECT "motivo_rechazo exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add updated_at column if missing
SET @need_upd := (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'comprobantes'
    AND COLUMN_NAME = 'updated_at'
);
SET @sql := IF(@need_upd,
  'ALTER TABLE comprobantes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
  'SELECT "updated_at exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Initialize updated_at where null
UPDATE comprobantes SET updated_at = created_at WHERE updated_at IS NULL;

-- Verification query
SELECT id, id_estudiante, importe, metodo, motivo_rechazo, created_at, updated_at FROM comprobantes ORDER BY id DESC LIMIT 10;
