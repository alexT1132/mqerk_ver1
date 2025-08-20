-- Tabla de intentos de quizzes
-- Usa la tabla existente 'actividades' (filas con tipo='quiz') como definición de cada quiz

CREATE TABLE IF NOT EXISTS quizzes_intentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_quiz INT NOT NULL,
  id_estudiante INT NOT NULL,
  puntaje INT NOT NULL,                         -- 0-100
  intent_number INT NOT NULL,                   -- número progresivo de intento (1..n)
  tiempo_segundos INT NULL,                     -- duración del intento (opcional)
  total_preguntas INT NULL,                     -- para estadísticos futuros
  correctas INT NULL,                           -- respuestas correctas (futuro)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quiz_estudiante (id_quiz, id_estudiante),
  INDEX idx_estudiante (id_estudiante),
  CONSTRAINT fk_quiz_intento_quiz FOREIGN KEY (id_quiz) REFERENCES actividades(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_intento_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Notas:
-- 1. Se reutiliza actividades.max_intentos para limitar intentos si no es NULL.
-- 2. Se puede agregar columna 'detalle_json' en el futuro para almacenar respuestas.
-- 3. Los puntajes se entregan por ahora desde el frontend (placeholder) hasta implementar motor de corrección.
