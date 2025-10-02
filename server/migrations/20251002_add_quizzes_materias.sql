-- Tablas para materias/etiquetas de preguntas de quizzes
CREATE TABLE IF NOT EXISTS quizzes_materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quizzes_preguntas_materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta BIGINT NOT NULL,
  id_materia INT NOT NULL,
  peso TINYINT NULL DEFAULT 1,
  UNIQUE KEY uq_pregunta_materia (id_pregunta, id_materia),
  CONSTRAINT fk_qpm_pregunta FOREIGN KEY (id_pregunta) REFERENCES quizzes_preguntas(id) ON DELETE CASCADE,
  CONSTRAINT fk_qpm_materia FOREIGN KEY (id_materia) REFERENCES quizzes_materias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices auxiliares
CREATE INDEX idx_qpm_pregunta ON quizzes_preguntas_materias (id_pregunta);
CREATE INDEX idx_qpm_materia ON quizzes_preguntas_materias (id_materia);

-- Vista (si no existe) para estadísticas agregadas por materia (simplifica queries futuras)
CREATE OR REPLACE VIEW vw_quiz_resumen_materias AS
SELECT 
  s.id_quiz,
  s.id_estudiante,
  m.id               AS id_materia,
  m.nombre           AS materia,
  COUNT(DISTINCT sr.id_pregunta)                          AS preguntas_vistas,
  SUM(CASE WHEN sr.correcta = 1 THEN 1 ELSE 0 END)        AS correctas,
  SUM(CASE WHEN sr.correcta = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT sr.id_pregunta),0) AS ratio_correctas
FROM quizzes_sesiones_respuestas sr
JOIN quizzes_sesiones s          ON s.id = sr.id_sesion AND s.estado = 'finalizado'
JOIN quizzes_preguntas_materias pm ON pm.id_pregunta = sr.id_pregunta
JOIN quizzes_materias m          ON m.id = pm.id_materia
GROUP BY s.id_quiz, s.id_estudiante, m.id, m.nombre;
