-- Script para corregir foreign keys de quizzes_sesiones
-- Problema: La tabla puede tener dos foreign keys en id_quiz:
--   1. fk_qs_quiz → quizzes(id) ✅ (correcto)
--   2. fk_sesion_quiz → actividades(id) ❌ (incorrecto, debe eliminarse)

-- PASO 1: Verificar qué foreign keys existen actualmente
-- Ejecuta esto primero para ver qué constraints existen:
-- SELECT 
--   CONSTRAINT_NAME,
--   REFERENCED_TABLE_NAME,
--   REFERENCED_COLUMN_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME = 'quizzes_sesiones'
--   AND COLUMN_NAME = 'id_quiz'
--   AND REFERENCED_TABLE_NAME IS NOT NULL;

-- PASO 2: Eliminar la constraint antigua que apunta a actividades (si existe)
-- Nota: Si la constraint no existe, MySQL mostrará un error que puedes ignorar
ALTER TABLE `quizzes_sesiones`
  DROP FOREIGN KEY IF EXISTS `fk_sesion_quiz`;

-- Si el comando anterior falla porque MySQL no soporta IF EXISTS, usa este:
-- ALTER TABLE `quizzes_sesiones` DROP FOREIGN KEY `fk_sesion_quiz`;

-- PASO 3: Verificar que solo quede la constraint correcta
-- SHOW CREATE TABLE quizzes_sesiones;

-- PASO 4: Si no existe fk_qs_quiz, crearla:
-- ALTER TABLE `quizzes_sesiones`
--   ADD CONSTRAINT `fk_qs_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

