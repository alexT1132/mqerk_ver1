-- Migration: Add response/detail columns to asesor_tests_history
-- Purpose: Align DB schema with new fields sent by the client (Test.jsx)
-- Note: Uses IF NOT EXISTS (MySQL 8+). If your MySQL version doesn't support it,
--       remove the IF NOT EXISTS clauses and run only once.

ALTER TABLE asesor_tests_history
  ADD COLUMN IF NOT EXISTS bigfive_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS dass21_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS zavic_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS baron_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS wais_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS academica_respuestas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS dass21_subescalas LONGTEXT NULL,
  ADD COLUMN IF NOT EXISTS bigfive_dimensiones LONGTEXT NULL;
