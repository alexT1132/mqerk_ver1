-- Migración: Corregir foreign keys de quizzes_sesiones
-- Fecha: 2025-01-XX
-- Objetivo: Asegurar que quizzes_sesiones apunte a quizzes, no a actividades

-- 1) Primero, eliminar las constraints antiguas si existen
-- Nota: MySQL no soporta IF EXISTS para DROP FOREIGN KEY, así que usamos un procedimiento
-- Alternativamente, puedes ejecutar estos comandos manualmente después de verificar los nombres de las constraints

-- Verificar el nombre actual de la constraint antes de eliminarla:
-- SHOW CREATE TABLE quizzes_sesiones;

-- Eliminar constraint antigua (ajustar el nombre según el output de SHOW CREATE TABLE)
-- Los nombres pueden ser: fk_sesion_quiz, fk_qs_quiz, fk_qsesiones_quiz, etc.
ALTER TABLE `quizzes_sesiones`
  DROP FOREIGN KEY `fk_sesion_quiz`;

ALTER TABLE `quizzes_sesiones`
  DROP FOREIGN KEY `fk_qs_quiz`;

-- 2) Agregar nueva constraint que apunta a quizzes
ALTER TABLE `quizzes_sesiones`
  ADD CONSTRAINT `fk_qs_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

-- 3) Verificar que se creó correctamente
-- SHOW CREATE TABLE quizzes_sesiones;

