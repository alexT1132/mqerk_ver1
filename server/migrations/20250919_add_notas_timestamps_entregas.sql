

-- Add timestamps to track notes and review times on activity deliveries
-- Allows UI to show an indicator for new/updated advisor notes

-- Add columns (ignore errors if they already exist)
ALTER TABLE actividades_entregas ADD COLUMN revisada_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE actividades_entregas ADD COLUMN comentarios_updated_at TIMESTAMP NULL DEFAULT NULL;

UPDATE actividades_entregas
SET revisada_at = NOW()
WHERE estado = 'revisada' AND revisada_at IS NULL;

UPDATE actividades_entregas
SET comentarios_updated_at = NOW()
WHERE comentarios IS NOT NULL AND comentarios <> '' AND comentarios_updated_at IS NULL;

-- Indexes are optional; add via manual migration if needed in production
