-- Migración: Banco de preguntas para quizzes / simulaciones
-- Fecha: 2025-10-02
-- Objetivo: Soporte completo para simulaciones con preguntas, opciones y almacenamiento de respuestas.

-- Tabla de preguntas del quiz
CREATE TABLE IF NOT EXISTS quizzes_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_quiz INT NOT NULL,
  orden INT NOT NULL DEFAULT 1,
  enunciado TEXT NOT NULL,
  tipo ENUM('opcion_multiple','multi_respuesta','verdadero_falso') DEFAULT 'opcion_multiple',
  puntos INT NOT NULL DEFAULT 1,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_quiz_orden (id_quiz, orden),
  CONSTRAINT fk_pregunta_quiz FOREIGN KEY (id_quiz) REFERENCES actividades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de opciones de cada pregunta
CREATE TABLE IF NOT EXISTS quizzes_preguntas_opciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto TEXT NOT NULL,
  es_correcta TINYINT(1) NOT NULL DEFAULT 0,
  retroalimentacion VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pregunta (id_pregunta),
  CONSTRAINT fk_opcion_pregunta FOREIGN KEY (id_pregunta) REFERENCES quizzes_preguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de sesiones de intento (separada de quizzes_intentos para guardar estado en progreso)
CREATE TABLE IF NOT EXISTS quizzes_sesiones (
  id CHAR(36) PRIMARY KEY, -- UUID
  id_quiz INT NOT NULL,
  id_estudiante INT NOT NULL,
  intento_num INT NOT NULL,         -- coincide con intent_number proyectado
  estado ENUM('en_progreso','finalizado','cancelado') DEFAULT 'en_progreso',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  tiempo_limite_seg INT NULL,       -- snapshot del límite de tiempo
  metadata_json JSON NULL,
  INDEX idx_sesion_quiz_estudiante (id_quiz, id_estudiante),
  CONSTRAINT fk_sesion_quiz FOREIGN KEY (id_quiz) REFERENCES actividades(id) ON DELETE CASCADE,
  CONSTRAINT fk_sesion_est FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de respuestas por pregunta dentro de una sesión (permite múltiples tipos)
CREATE TABLE IF NOT EXISTS quizzes_sesiones_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_sesion CHAR(36) NOT NULL,
  id_pregunta INT NOT NULL,
  id_opcion INT NULL,              -- para opcion_multiple / multi_respuesta (una fila por selección)
  valor_texto TEXT NULL,           -- extensible para respuestas abiertas futuro
  correcta TINYINT(1) NULL,        -- se rellena al finalizar la sesión
  tiempo_ms INT NULL,              -- tiempo empleado en la pregunta
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resp_sesion (id_sesion),
  INDEX idx_resp_pregunta (id_pregunta),
  CONSTRAINT fk_resp_sesion FOREIGN KEY (id_sesion) REFERENCES quizzes_sesiones(id) ON DELETE CASCADE,
  CONSTRAINT fk_resp_pregunta FOREIGN KEY (id_pregunta) REFERENCES quizzes_preguntas(id) ON DELETE CASCADE,
  CONSTRAINT fk_resp_opcion FOREIGN KEY (id_opcion) REFERENCES quizzes_preguntas_opciones(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índices y notas:
-- 1. Se separan sesiones de intentos para poder calcular puntaje al finalizar y luego insertar en quizzes_intentos.
-- 2. Al finalizar una sesión: calcular correctas, total_preguntas, puntaje (%), insertar fila en quizzes_intentos.
-- 3. Opciones multi-respuesta: múltiples filas con misma pregunta y distinta id_opcion (correctas puede evaluarse por conjunto).
-- 4. Para performance se podrían agregar índices compuestos adicionales si el volumen crece.
