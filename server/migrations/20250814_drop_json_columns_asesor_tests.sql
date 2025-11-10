-- Limpieza: eliminar columnas de respuestas detalladas ya no necesarias
ALTER TABLE asesor_tests
  DROP COLUMN IF EXISTS bigfive_respuestas,
  DROP COLUMN IF EXISTS dass21_respuestas,
  DROP COLUMN IF EXISTS zavic_respuestas,
  DROP COLUMN IF EXISTS baron_respuestas,
  DROP COLUMN IF EXISTS wais_respuestas,
  DROP COLUMN IF EXISTS academica_respuestas;

ALTER TABLE asesor_tests_history
  DROP COLUMN IF EXISTS bigfive_respuestas,
  DROP COLUMN IF EXISTS dass21_respuestas,
  DROP COLUMN IF EXISTS zavic_respuestas,
  DROP COLUMN IF EXISTS baron_respuestas,
  DROP COLUMN IF EXISTS wais_respuestas,
  DROP COLUMN IF EXISTS academica_respuestas;
