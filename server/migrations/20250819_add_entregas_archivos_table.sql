-- Tabla de archivos adjuntos múltiples por entrega (soporte tipo Classroom)
CREATE TABLE IF NOT EXISTS actividades_entregas_archivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entrega_id INT NOT NULL,
  archivo VARCHAR(255) NOT NULL,
  original_nombre VARCHAR(255) NULL,
  mime_type VARCHAR(120) NULL,
  tamano INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entrega_archivos_entrega (entrega_id),
  CONSTRAINT fk_entrega_archivo_entrega FOREIGN KEY (entrega_id) REFERENCES actividades_entregas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
