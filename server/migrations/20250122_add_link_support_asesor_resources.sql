-- Migration: Add link support to asesor_resources table
-- Date: 2025-01-22
-- Allows resources to be either files or links

-- Make file_path nullable (for links)
ALTER TABLE asesor_resources 
  MODIFY COLUMN file_path VARCHAR(500) NULL;

-- Make file_name nullable (for links)
ALTER TABLE asesor_resources 
  MODIFY COLUMN file_name VARCHAR(255) NULL;

-- Make file_size nullable (for links)
ALTER TABLE asesor_resources 
  MODIFY COLUMN file_size BIGINT NULL;

-- Make file_type nullable (for links)
ALTER TABLE asesor_resources 
  MODIFY COLUMN file_type VARCHAR(100) NULL;

-- Add link_url column for storing links
ALTER TABLE asesor_resources 
  ADD COLUMN IF NOT EXISTS link_url VARCHAR(1000) NULL AFTER file_type;

-- Add resource_type column to distinguish between 'file' and 'link'
ALTER TABLE asesor_resources 
  ADD COLUMN IF NOT EXISTS resource_type ENUM('file', 'link') NOT NULL DEFAULT 'file' AFTER description;

-- Update existing records to have resource_type = 'file'
UPDATE asesor_resources 
  SET resource_type = 'file' 
  WHERE resource_type IS NULL OR resource_type = '';
