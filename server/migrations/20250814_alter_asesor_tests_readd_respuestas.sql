-- Reagrega columnas JSON para almacenar respuestas completas y metadatos psicométricos.
-- Idempotente: solo añade si no existen.
ALTER TABLE asesor_tests
  ADD COLUMN IF NOT EXISTS bigfive_respuestas JSON NULL AFTER academica_total,
  ADD COLUMN IF NOT EXISTS dass21_respuestas JSON NULL AFTER bigfive_respuestas,
  ADD COLUMN IF NOT EXISTS zavic_respuestas JSON NULL AFTER dass21_respuestas,
  ADD COLUMN IF NOT EXISTS baron_respuestas JSON NULL AFTER zavic_respuestas,
  ADD COLUMN IF NOT EXISTS wais_respuestas JSON NULL AFTER baron_respuestas,
  ADD COLUMN IF NOT EXISTS academica_respuestas JSON NULL AFTER wais_respuestas,
  ADD COLUMN IF NOT EXISTS dass21_subescalas JSON NULL AFTER academica_respuestas,
  ADD COLUMN IF NOT EXISTS bigfive_dimensiones JSON NULL AFTER dass21_subescalas;

ALTER TABLE asesor_tests_history
  ADD COLUMN IF NOT EXISTS bigfive_respuestas JSON NULL AFTER academica_total,
  ADD COLUMN IF NOT EXISTS dass21_respuestas JSON NULL AFTER bigfive_respuestas,
  ADD COLUMN IF NOT EXISTS zavic_respuestas JSON NULL AFTER dass21_respuestas,
  ADD COLUMN IF NOT EXISTS baron_respuestas JSON NULL AFTER zavic_respuestas,
  ADD COLUMN IF NOT EXISTS wais_respuestas JSON NULL AFTER baron_respuestas,
  ADD COLUMN IF NOT EXISTS academica_respuestas JSON NULL AFTER wais_respuestas,
  ADD COLUMN IF NOT EXISTS dass21_subescalas JSON NULL AFTER academica_respuestas,
  ADD COLUMN IF NOT EXISTS bigfive_dimensiones JSON NULL AFTER dass21_subescalas;
