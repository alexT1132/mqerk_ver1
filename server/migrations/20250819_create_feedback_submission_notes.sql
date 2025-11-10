-- Tabla para notas/retroalimentación del asesor sobre entregas de feedback
CREATE TABLE IF NOT EXISTS feedback_submission_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_submission INT NOT NULL,
  id_asesor INT NULL,
  nota TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_submission (id_submission),
  CONSTRAINT fk_notes_submission FOREIGN KEY (id_submission) REFERENCES feedback_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
