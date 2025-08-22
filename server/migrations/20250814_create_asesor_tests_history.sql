-- Historial de versiones de resultados de tests de asesores
CREATE TABLE IF NOT EXISTS asesor_tests_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  preregistro_id BIGINT UNSIGNED NOT NULL,
  scenario_type VARCHAR(30) NULL,
  version INT NOT NULL DEFAULT 1,
  bigfive_total INT NOT NULL DEFAULT 0,
  dass21_total INT NOT NULL DEFAULT 0,
  zavic_total INT NOT NULL DEFAULT 0,
  baron_total INT NOT NULL DEFAULT 0,
  wais_total INT NOT NULL DEFAULT 0,
  academica_total INT NOT NULL DEFAULT 0,
  bigfive_respuestas JSON NULL,
  dass21_respuestas JSON NULL,
  zavic_respuestas JSON NULL,
  baron_respuestas JSON NULL,
  wais_respuestas JSON NULL,
  academica_respuestas JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asesor_tests_hist_prereg FOREIGN KEY (preregistro_id)
    REFERENCES asesor_preregistros(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_asesor_tests_hist_prereg (preregistro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
