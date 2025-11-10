-- Tabla contratos para almacenar PDFs de contratos generados o subidos
CREATE TABLE IF NOT EXISTS contratos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  folio INT NOT NULL,
  folio_formateado VARCHAR(32) NULL,
  archivo VARCHAR(255) NOT NULL,
  original_nombre VARCHAR(255) NULL,
  mime_type VARCHAR(100) NULL,
  tamano INT NULL,
  firmado TINYINT(1) DEFAULT 0,
  version INT DEFAULT 1,
  notas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contratos_folio (folio),
  CONSTRAINT fk_contratos_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE
);
