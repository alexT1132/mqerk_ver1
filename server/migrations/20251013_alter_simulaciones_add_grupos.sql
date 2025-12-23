-- Alter simulaciones: add grupos column to store group assignments (JSON string)
ALTER TABLE simulaciones ADD COLUMN IF NOT EXISTS grupos JSON NULL;