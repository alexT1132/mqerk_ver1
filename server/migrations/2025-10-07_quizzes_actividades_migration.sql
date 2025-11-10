-- MQerkAcademy - Migration to enable Quizzes end-to-end
-- Date: 2025-10-07
-- Adjust DB name if different from your .env (default: mqerkacademy)

-- Optional: uncomment and set your DB
-- USE `mqerkacademy`;

-- 1) actividades: add newer columns used by the app
ALTER TABLE `actividades`
  ADD COLUMN IF NOT EXISTS `visible_desde` DATETIME NULL AFTER `imagen_portada`,
  ADD COLUMN IF NOT EXISTS `visible_hasta` DATETIME NULL AFTER `visible_desde`,
  ADD COLUMN IF NOT EXISTS `max_intentos` INT NULL AFTER `visible_hasta`,
  ADD COLUMN IF NOT EXISTS `requiere_revision` TINYINT(1) NOT NULL DEFAULT 1 AFTER `max_intentos`,
  ADD COLUMN IF NOT EXISTS `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `requiere_revision`,
  ADD COLUMN IF NOT EXISTS `publicado` TINYINT(1) NOT NULL DEFAULT 1 AFTER `activo`,
  ADD COLUMN IF NOT EXISTS `creado_por` INT NULL AFTER `publicado`,
  ADD COLUMN IF NOT EXISTS `time_limit_min` INT NULL AFTER `creado_por`,
  ADD COLUMN IF NOT EXISTS `passing_score` INT NULL AFTER `time_limit_min`,
  ADD COLUMN IF NOT EXISTS `shuffle_questions` TINYINT(1) NOT NULL DEFAULT 0 AFTER `passing_score`;

-- 2) quizzes_preguntas: create if missing
CREATE TABLE IF NOT EXISTS `quizzes_preguntas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_quiz` INT NOT NULL,
  `orden` INT NULL,
  `enunciado` TEXT NOT NULL,
  `tipo` VARCHAR(32) NOT NULL DEFAULT 'opcion_multiple',
  `puntos` INT NOT NULL DEFAULT 1,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_qp_quiz` (`id_quiz`),
  CONSTRAINT `fk_qp_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure missing columns exist even if table already existed
ALTER TABLE `quizzes_preguntas`
  ADD COLUMN IF NOT EXISTS `orden` INT NULL AFTER `id_quiz`,
  ADD COLUMN IF NOT EXISTS `activa` TINYINT(1) NOT NULL DEFAULT 1 AFTER `puntos`;

-- 3) quizzes_preguntas_opciones: create if missing
CREATE TABLE IF NOT EXISTS `quizzes_preguntas_opciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_pregunta` INT NOT NULL,
  `texto` TEXT NOT NULL,
  `es_correcta` TINYINT(1) NOT NULL DEFAULT 0,
  `orden` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_qpo_preg` (`id_pregunta`),
  CONSTRAINT `fk_qpo_preg` FOREIGN KEY (`id_pregunta`) REFERENCES `quizzes_preguntas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure missing column in opciones
ALTER TABLE `quizzes_preguntas_opciones`
  ADD COLUMN IF NOT EXISTS `orden` INT NULL AFTER `es_correcta`;

-- 4) quizzes_intentos: attempts per student
CREATE TABLE IF NOT EXISTS `quizzes_intentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_quiz` INT NOT NULL,
  `id_estudiante` INT NOT NULL,
  `puntaje` INT NOT NULL DEFAULT 0,
  `intent_number` INT NOT NULL DEFAULT 1,
  `tiempo_segundos` INT NULL,
  `total_preguntas` INT NULL,
  `correctas` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_qi_quiz_est` (`id_quiz`, `id_estudiante`),
  CONSTRAINT `fk_qi_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) quizzes_sesiones: live sessions
CREATE TABLE IF NOT EXISTS `quizzes_sesiones` (
  `id` CHAR(36) NOT NULL,
  `id_quiz` INT NOT NULL,
  `id_estudiante` INT NULL,
  `intento_num` INT NULL,
  `tiempo_limite_seg` INT NULL,
  `estado` VARCHAR(32) NOT NULL DEFAULT 'en_progreso',
  `finished_at` DATETIME NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_qs_quiz` (`id_quiz`),
  CONSTRAINT `fk_qs_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `actividades`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) quizzes_sesiones_respuestas: answers per session
CREATE TABLE IF NOT EXISTS `quizzes_sesiones_respuestas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_sesion` CHAR(36) NOT NULL,
  `id_pregunta` INT NOT NULL,
  `id_opcion` INT NULL,
  `valor_texto` TEXT NULL,
  `tiempo_ms` INT NULL,
  `correcta` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_qsr_sesion` (`id_sesion`),
  INDEX `idx_qsr_pregunta` (`id_pregunta`),
  CONSTRAINT `fk_qsr_sesion` FOREIGN KEY (`id_sesion`) REFERENCES `quizzes_sesiones`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qsr_preg` FOREIGN KEY (`id_pregunta`) REFERENCES `quizzes_preguntas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_qsr_opc` FOREIGN KEY (`id_opcion`) REFERENCES `quizzes_preguntas_opciones`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional helpful indexes (comment out if your MySQL doesn't support IF NOT EXISTS for CREATE INDEX)
-- CREATE INDEX IF NOT EXISTS `idx_actividades_tipo` ON `actividades` (`tipo`);
-- CREATE INDEX IF NOT EXISTS `idx_actividades_visible` ON `actividades` (`visible_desde`, `visible_hasta`);

-- Done.
