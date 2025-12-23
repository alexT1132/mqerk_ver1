-- Script para corregir el quiz 6 que tiene id_area = NULL y titulo vacío
-- Basado en la base de datos, el quiz debe tener:
-- - id_area = 2 (Matemáticas y pensamiento analítico)
-- - titulo = 'Matemáticas y pensamiento analítico (IA · 5 preguntas)' (según las notificaciones)
-- - materia = 'Matemáticas y pensamiento analítico'

UPDATE quizzes 
SET 
  id_area = 2,
  titulo = 'Matemáticas y pensamiento analítico (IA · 5 preguntas)',
  materia = 'Matemáticas y pensamiento analítico'
WHERE id = 6;

-- Verificar el cambio
SELECT id, titulo, id_area, materia, publicado, activo 
FROM quizzes 
WHERE id = 6;

