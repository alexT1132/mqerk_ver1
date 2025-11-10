-- Agrega columnas que el modelo intenta insertar pero no existen todavía en asesor_tests_history
ALTER TABLE asesor_tests_history
  ADD COLUMN IF NOT EXISTS dass21_subescalas JSON NULL AFTER academica_respuestas,
  ADD COLUMN IF NOT EXISTS bigfive_dimensiones JSON NULL AFTER dass21_subescalas;
