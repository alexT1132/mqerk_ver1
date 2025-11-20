-- Migración: Agregar 'respuesta_corta' al ENUM de tipo en quizzes_preguntas
-- Fecha: 2025-11-18
-- Objetivo: Permitir preguntas de tipo respuesta corta en quizzes

-- Agregar 'respuesta_corta' al ENUM del campo tipo
ALTER TABLE quizzes_preguntas 
MODIFY COLUMN tipo ENUM('opcion_multiple','multi_respuesta','verdadero_falso','respuesta_corta') DEFAULT 'opcion_multiple';

