-- Ensure time-related columns exist for quizzes attempts and sessions
-- This migration is idempotent on MySQL 8+ using IF NOT EXISTS.

-- quizzes_intentos: store total time (seconds) and aggregates
ALTER TABLE quizzes_intentos
  ADD COLUMN IF NOT EXISTS intent_number INT NULL AFTER puntaje,
  ADD COLUMN IF NOT EXISTS tiempo_segundos INT NULL AFTER intent_number,
  ADD COLUMN IF NOT EXISTS total_preguntas INT NULL AFTER tiempo_segundos,
  ADD COLUMN IF NOT EXISTS correctas INT NULL AFTER total_preguntas;

-- quizzes_sesiones: mark lifecycle and limit
ALTER TABLE quizzes_sesiones
  ADD COLUMN IF NOT EXISTS estado ENUM('en_progreso','finalizado') NOT NULL DEFAULT 'en_progreso' AFTER intento_num,
  ADD COLUMN IF NOT EXISTS tiempo_limite_seg INT NULL AFTER estado,
  ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP AFTER tiempo_limite_seg,
  ADD COLUMN IF NOT EXISTS finished_at DATETIME NULL AFTER created_at;

-- quizzes_sesiones_respuestas: per-question time and correctness flag
ALTER TABLE quizzes_sesiones_respuestas
  ADD COLUMN IF NOT EXISTS tiempo_ms INT NULL AFTER valor_texto,
  ADD COLUMN IF NOT EXISTS correcta TINYINT(1) NULL AFTER tiempo_ms;

-- Optional helpful indexes (safe to skip if already present)
CREATE INDEX IF NOT EXISTS idx_qi_quiz_est ON quizzes_intentos (id_quiz, id_estudiante);
CREATE INDEX IF NOT EXISTS idx_qs_quiz_est ON quizzes_sesiones (id_quiz, id_estudiante);
CREATE INDEX IF NOT EXISTS idx_qsr_sesion ON quizzes_sesiones_respuestas (id_sesion);
