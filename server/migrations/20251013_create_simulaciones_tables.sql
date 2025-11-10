-- Migración: Tablas dedicadas para Simulaciones (separadas de Quizzes)
-- Idempotente en MySQL 8+ usando IF NOT EXISTS

CREATE TABLE IF NOT EXISTS simulaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  id_area INT NULL,
  fecha_limite DATETIME NULL,
  time_limit_min INT NULL,
  publico TINYINT(1) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_por INT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simulaciones_preguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_simulacion INT NOT NULL,
  orden INT NULL,
  enunciado TEXT NOT NULL,
  tipo ENUM('opcion_multiple','multi_respuesta','verdadero_falso','respuesta_corta') NOT NULL DEFAULT 'opcion_multiple',
  puntos INT NOT NULL DEFAULT 1,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_sim_preg_sim FOREIGN KEY (id_simulacion) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS simulaciones_preguntas_opciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto TEXT NOT NULL,
  es_correcta TINYINT(1) NOT NULL DEFAULT 0,
  orden INT NULL,
  CONSTRAINT fk_sim_opc_preg FOREIGN KEY (id_pregunta) REFERENCES simulaciones_preguntas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS simulaciones_sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_simulacion INT NOT NULL,
  id_estudiante INT NOT NULL,
  started_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  elapsed_ms BIGINT NULL,
  CONSTRAINT fk_sim_ses_sim FOREIGN KEY (id_simulacion) REFERENCES simulaciones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS simulaciones_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_sesion INT NOT NULL,
  id_pregunta INT NOT NULL,
  id_opcion INT NULL,
  texto_libre TEXT NULL,
  tiempo_ms INT NULL,
  CONSTRAINT fk_sim_resp_ses FOREIGN KEY (id_sesion) REFERENCES simulaciones_sesiones(id) ON DELETE CASCADE,
  CONSTRAINT fk_sim_resp_preg FOREIGN KEY (id_pregunta) REFERENCES simulaciones_preguntas(id) ON DELETE CASCADE,
  CONSTRAINT fk_sim_resp_opc FOREIGN KEY (id_opcion) REFERENCES simulaciones_preguntas_opciones(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS simulaciones_intentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_simulacion INT NOT NULL,
  id_estudiante INT NOT NULL,
  puntaje DECIMAL(5,2) NOT NULL DEFAULT 0,
  intent_number INT NOT NULL DEFAULT 1,
  tiempo_segundos INT NULL,
  total_preguntas INT NULL,
  correctas INT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sim_int_sim FOREIGN KEY (id_simulacion) REFERENCES simulaciones(id) ON DELETE CASCADE
);
