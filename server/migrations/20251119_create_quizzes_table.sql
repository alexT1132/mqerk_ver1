-- Migración: Crear tabla quizzes dedicada
-- Fecha: 2025-11-19
-- Objetivo: Separar los quizzes de la tabla actividades en una tabla dedicada

-- 1) Crear tabla quizzes
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,
  `id_area` INT NULL,
  `materia` VARCHAR(255) NULL,
  `puntos_max` INT NOT NULL DEFAULT 100,
  `peso_calificacion` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `fecha_limite` DATETIME NULL,
  `grupos` JSON NULL,
  `max_intentos` INT NULL,
  `requiere_revision` TINYINT(1) NOT NULL DEFAULT 0,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `publicado` TINYINT(1) NOT NULL DEFAULT 0,
  `creado_por` INT NULL,
  `time_limit_min` INT NULL,
  `passing_score` INT NULL,
  `shuffle_questions` TINYINT(1) NOT NULL DEFAULT 0,
  `visible_desde` DATETIME NULL,
  `visible_hasta` DATETIME NULL,
  `imagen_portada` VARCHAR(255) NULL,
  `recursos_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_quizzes_area` (`id_area`),
  INDEX `idx_quizzes_creado_por` (`creado_por`),
  INDEX `idx_quizzes_activo` (`activo`),
  INDEX `idx_quizzes_publicado` (`publicado`),
  CONSTRAINT `fk_quizzes_area` FOREIGN KEY (`id_area`) REFERENCES `areas`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_quizzes_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2) Migrar datos existentes de actividades a quizzes (solo los que tienen tipo='quiz')
INSERT INTO `quizzes` (
  `id`, `titulo`, `descripcion`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`,
  `fecha_limite`, `grupos`, `max_intentos`, `requiere_revision`, `activo`, `publicado`,
  `creado_por`, `time_limit_min`, `passing_score`, `shuffle_questions`, `visible_desde`,
  `visible_hasta`, `imagen_portada`, `recursos_json`, `created_at`, `updated_at`
)
SELECT 
  `id`, `titulo`, `descripcion`, `id_area`, `materia`, `puntos_max`, `peso_calificacion`,
  `fecha_limite`, `grupos`, `max_intentos`, `requiere_revision`, `activo`, `publicado`,
  `creado_por`, `time_limit_min`, `passing_score`, `shuffle_questions`, `visible_desde`,
  `visible_hasta`, `imagen_portada`, `recursos_json`, `created_at`, `updated_at`
FROM `actividades`
WHERE `tipo` = 'quiz'
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- 3) Actualizar foreign keys de quizzes_preguntas para que apunten a quizzes
-- Primero eliminar la constraint antigua
ALTER TABLE `quizzes_preguntas`
  DROP FOREIGN KEY IF EXISTS `fk_pregunta_quiz`,
  DROP FOREIGN KEY IF EXISTS `fk_qp_quiz`;

-- Agregar nueva constraint que apunta a quizzes
ALTER TABLE `quizzes_preguntas`
  ADD CONSTRAINT `fk_qp_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

-- 4) Actualizar foreign keys de quizzes_intentos
ALTER TABLE `quizzes_intentos`
  DROP FOREIGN KEY IF EXISTS `fk_qi_quiz`;

ALTER TABLE `quizzes_intentos`
  ADD CONSTRAINT `fk_qi_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

-- 5) Actualizar foreign keys de quizzes_sesiones
ALTER TABLE `quizzes_sesiones`
  DROP FOREIGN KEY IF EXISTS `fk_qs_quiz`;

ALTER TABLE `quizzes_sesiones`
  ADD CONSTRAINT `fk_qs_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

