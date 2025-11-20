-- Script para eliminar la foreign key incorrecta de quizzes_intentos
-- que apunta a 'actividades' en lugar de 'quizzes'

-- Paso 1: Eliminar la foreign key incorrecta fk_quiz_intento_quiz
ALTER TABLE `quizzes_intentos` DROP FOREIGN KEY `fk_quiz_intento_quiz`;

-- Paso 2: Verificar que la foreign key correcta (fk_qi_quiz) existe y apunta a 'quizzes'
-- Esta debería estar creada correctamente por la migración 20251119_create_quizzes_table.sql
-- Si no existe, se debería añadir con:
-- ALTER TABLE `quizzes_intentos`
--   ADD CONSTRAINT `fk_qi_quiz` FOREIGN KEY (`id_quiz`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE;

-- Paso 3: Verificar la estructura final de la tabla
SHOW CREATE TABLE `quizzes_intentos`;

