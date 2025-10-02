-- Add math total; run only once or ignore duplicate column error
ALTER TABLE asesor_tests
  ADD COLUMN matematica_total INT NULL AFTER academica_total;

ALTER TABLE asesor_tests_history
  ADD COLUMN matematica_total INT NULL AFTER academica_total,
  ADD COLUMN matematica_respuestas LONGTEXT NULL AFTER academica_respuestas;
