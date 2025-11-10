-- Migration: add motivo_rechazo and updated_at to comprobantes (idempotent)
-- Date: 2025-08-11

-- Backup (optional; skipped if already exists)
CREATE TABLE IF NOT EXISTS comprobantes_backup_20250811 AS
  SELECT * FROM comprobantes;

-- Add motivo_rechazo column if missing
-- Intentar agregar motivo_rechazo (ignorará error si ya existe)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT NULL AFTER metodo;

-- Add updated_at column if missing
-- Intentar agregar updated_at (ignorar error si ya existe)
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Initialize updated_at where null
UPDATE comprobantes SET updated_at = created_at WHERE updated_at IS NULL;

-- Verification query
SELECT id, id_estudiante, importe, metodo, motivo_rechazo, created_at, updated_at FROM comprobantes ORDER BY id DESC LIMIT 10;
