-- Seed initial questions for WAIS (razonamiento) and Matemática tests
-- This migration assumes tables test_questions and test_options already exist.
-- Safe to run multiple times: it checks for existing prompts before inserting options.

-- =============================
-- WAIS (razonamiento lógico)
-- =============================

-- WAIS-001: Secuencia numérica (potencias de 2)
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', '¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '24', 0 FROM test_questions q
WHERE q.test_type='wais' AND q.prompt='¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?'
AND NOT EXISTS (
  SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='24'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '30', 0 FROM test_questions q
WHERE q.test_type='wais' AND q.prompt='¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?'
AND NOT EXISTS (
  SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='30'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '32', 1 FROM test_questions q
WHERE q.test_type='wais' AND q.prompt='¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?'
AND NOT EXISTS (
  SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='32'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '36', 0 FROM test_questions q
WHERE q.test_type='wais' AND q.prompt='¿Cuál es el siguiente número de la secuencia? 2, 4, 8, 16, ?'
AND NOT EXISTS (
  SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='36'
);

-- WAIS-002: Analogías
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', 'Perro es a canino como gato es a _____', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='Perro es a canino como gato es a _____'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'felino', 1 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Perro es a canino como gato es a _____'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='felino');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'ómnivoro', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Perro es a canino como gato es a _____'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='ómnivoro');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'doméstico', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Perro es a canino como gato es a _____'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='doméstico');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'mamífero', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Perro es a canino como gato es a _____'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='mamífero');

-- WAIS-003: Serie de letras
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', 'Complete la serie: A, C, F, J, O, __', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='Complete la serie: A, C, F, J, O, __'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'S', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Complete la serie: A, C, F, J, O, __'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='S'); -- +2,+3,+4,+5,+6 => U
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'U', 1 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Complete la serie: A, C, F, J, O, __'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='U');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'V', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Complete la serie: A, C, F, J, O, __'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='V');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'T', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Complete la serie: A, C, F, J, O, __'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='T');

-- WAIS-004: Deducción lógica
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', 'Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Sí, siempre', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Sí, siempre');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'No, es imposible', 1 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='No, es imposible');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Solo a veces', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Solo a veces');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Depende del tamaño de C', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si todos los A son B y ningún B es C, entonces ¿algún A puede ser C?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Depende del tamaño de C');

-- WAIS-005: Extraño en el grupo
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', '¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Triángulo', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Triángulo');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Cuadrado', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Cuadrado');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Círculo', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Círculo');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Esfera', 1 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='¿Cuál no pertenece al grupo? Triángulo, Cuadrado, Círculo, Esfera'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Esfera'); -- 3 figuras 2D, 1 figura 3D

-- WAIS-006: Calendario (módulo 7)
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'wais', 'Si hoy es lunes, ¿qué día será dentro de 100 días?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='wais' AND prompt='Si hoy es lunes, ¿qué día será dentro de 100 días?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Miércoles', 1 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si hoy es lunes, ¿qué día será dentro de 100 días?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Miércoles'); -- 100 % 7 = 2
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Jueves', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si hoy es lunes, ¿qué día será dentro de 100 días?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Jueves');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Viernes', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si hoy es lunes, ¿qué día será dentro de 100 días?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Viernes');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'Domingo', 0 FROM test_questions q WHERE q.test_type='wais' AND q.prompt='Si hoy es lunes, ¿qué día será dentro de 100 días?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='Domingo');

-- =============================
-- Matemática (aritmética y álgebra básica)
-- =============================

-- MAT-001: Porcentajes
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', '¿Cuál es el 25% de 320?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='¿Cuál es el 25% de 320?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '64', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál es el 25% de 320?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='64');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '72', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál es el 25% de 320?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='72');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '80', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál es el 25% de 320?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='80');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '96', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál es el 25% de 320?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='96');

-- MAT-002: Ecuación lineal
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', 'Resuelva para x: 3x + 5 = 20', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='Resuelva para x: 3x + 5 = 20'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'x = 5', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Resuelva para x: 3x + 5 = 20'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='x = 5');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'x = 15', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Resuelva para x: 3x + 5 = 20'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='x = 15');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'x = 4', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Resuelva para x: 3x + 5 = 20'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='x = 4');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, 'x = 10', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Resuelva para x: 3x + 5 = 20'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='x = 10');

-- MAT-003: Fracciones equivalentes
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', '¿Cuál fracción es equivalente a 3/4?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='¿Cuál fracción es equivalente a 3/4?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '6/8', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál fracción es equivalente a 3/4?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='6/8');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '9/16', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál fracción es equivalente a 3/4?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='9/16');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '12/20', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál fracción es equivalente a 3/4?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='12/20');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '15/24', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='¿Cuál fracción es equivalente a 3/4?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='15/24');

-- MAT-004: Área de rectángulo
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', 'Calcule el área de un rectángulo de 7 cm por 12 cm.', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='Calcule el área de un rectángulo de 7 cm por 12 cm.'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '84 cm²', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Calcule el área de un rectángulo de 7 cm por 12 cm.'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='84 cm²');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '38 cm²', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Calcule el área de un rectángulo de 7 cm por 12 cm.'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='38 cm²');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '96 cm²', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Calcule el área de un rectángulo de 7 cm por 12 cm.'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='96 cm²');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '60 cm²', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Calcule el área de un rectángulo de 7 cm por 12 cm.'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='60 cm²');

-- MAT-005: Orden de operaciones
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', 'Evalúe: 6 + 2 × 3 - 4', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='Evalúe: 6 + 2 × 3 - 4'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '8', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Evalúe: 6 + 2 × 3 - 4'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='8');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '12', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Evalúe: 6 + 2 × 3 - 4'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='12');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '10', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Evalúe: 6 + 2 × 3 - 4'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='10');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '6', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Evalúe: 6 + 2 × 3 - 4'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='6');

-- MAT-006: Proporciones
INSERT INTO test_questions (test_type, prompt, points, active)
SELECT 'matematica', 'Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?', 10, 1
WHERE NOT EXISTS (
  SELECT 1 FROM test_questions WHERE test_type='matematica' AND prompt='Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?'
);
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '15', 1 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='15'); -- (3/2)*10 = 15
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '12', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='12');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '18', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='18');
INSERT INTO test_options (question_id, text, is_correct)
SELECT q.id, '20', 0 FROM test_questions q WHERE q.test_type='matematica' AND q.prompt='Una receta usa 3 tazas de harina por 2 tazas de agua. ¿Cuánta harina se necesita para 10 tazas de agua?'
AND NOT EXISTS (SELECT 1 FROM test_options o WHERE o.question_id=q.id AND o.text='20');
