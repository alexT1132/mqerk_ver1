-- Robustecimiento de esquema para actividades y quizzes
-- 1. Catálogo de áreas y módulos específicos
-- 2. Campos adicionales para configuración de quizzes
-- 3. Control de publicación separado de 'activo'
-- 4. JSON de detalle de intentos de quiz
-- 5. Índices y constraints adicionales

CREATE TABLE IF NOT EXISTS areas (
  id INT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  tipo ENUM('general','especifico') NOT NULL DEFAULT 'general',
  descripcion VARCHAR(255) NULL,
  icon_key VARCHAR(40) NULL,
  color_gradient VARCHAR(80) NULL,
  bg_color VARCHAR(120) NULL,
  border_color VARCHAR(60) NULL,
  orden INT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_areas_tipo (tipo),
  INDEX idx_areas_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed inicial (id establecidos manualmente para mantener referencias)
INSERT IGNORE INTO areas (id,nombre,tipo,descripcion,icon_key,color_gradient,bg_color,border_color,orden) VALUES
 (1,'Español y redacción indirecta','general','Competencias comunicativas y lingüísticas','FileText','from-amber-500 to-orange-600','bg-gradient-to-br from-amber-50 to-orange-50','border-amber-200',1),
 (2,'Matemáticas y pensamiento analítico','general','Razonamiento lógico y matemático','BarChart3','from-blue-500 to-indigo-600','bg-gradient-to-br from-blue-50 to-indigo-50','border-blue-200',2),
 (3,'Habilidades transversales','general','Competencias interpersonales y sociales','Users','from-emerald-500 to-green-600','bg-gradient-to-br from-emerald-50 to-green-50','border-emerald-200',3),
 (4,'Lengua extranjera','general','Comunicación en idioma extranjero','BookOpen','from-purple-500 to-violet-600','bg-gradient-to-br from-purple-50 to-violet-50','border-purple-200',4),
 (5,'Módulos específicos','general','Conocimientos especializados','Award','from-rose-500 to-pink-600','bg-gradient-to-br from-rose-50 to-pink-50','border-rose-200',5),
 (101,'Ciencias Exactas','especifico','Matemáticas, Física, Química y afines','BarChart3','from-blue-500 to-cyan-600','bg-gradient-to-br from-blue-50 to-cyan-50','border-blue-200',101),
 (102,'Ciencias Sociales','especifico','Sociología, Psicología y más','Users','from-purple-500 to-indigo-600','bg-gradient-to-br from-purple-50 to-indigo-50','border-purple-200',102),
 (103,'Humanidades y Artes','especifico','Literatura, Historia, Filosofía','BookOpen','from-rose-500 to-pink-600','bg-gradient-to-br from-rose-50 to-pink-50','border-rose-200',103),
 (104,'Ciencias Naturales y de la Salud','especifico','Biología, Medicina, Enfermería','Heart','from-emerald-500 to-green-600','bg-gradient-to-br from-emerald-50 to-green-50','border-emerald-200',104),
 (105,'Ingeniería y Tecnología','especifico','Ingenierías, Sistemas, Tecnología','Cog','from-orange-500 to-amber-600','bg-gradient-to-br from-orange-50 to-amber-50','border-orange-200',105),
 (106,'Ciencias Económico-Administrativas','especifico','Administración, Economía, Negocios','TrendingUp','from-teal-500 to-cyan-600','bg-gradient-to-br from-teal-50 to-cyan-50','border-teal-200',106),
 (107,'Educación y Deportes','especifico','Pedagogía y deportes','GraduationCap','from-violet-500 to-purple-600','bg-gradient-to-br from-violet-50 to-purple-50','border-violet-200',107),
 (108,'Agropecuarias','especifico','Agronomía, Veterinaria, Zootecnia','Leaf','from-lime-500 to-green-600','bg-gradient-to-br from-lime-50 to-green-50','border-lime-200',108),
 (109,'Turismo','especifico','Gestión turística y hotelería','Globe','from-blue-400 to-sky-600','bg-gradient-to-br from-blue-50 to-sky-50','border-blue-200',109),
 (110,'Núcleo UNAM / IPN','especifico','Materias esenciales ingreso','GraduationCap','from-yellow-500 to-amber-600','bg-gradient-to-br from-yellow-50 to-amber-50','border-yellow-200',110),
 (111,'Militar, Naval y Náutica Mercante','especifico','Preparación fuerzas e instituciones navales','Anchor','from-slate-500 to-gray-600','bg-gradient-to-br from-slate-50 to-gray-50','border-slate-200',111),
 (112,'Módulo Transversal: Análisis Psicométrico','especifico','Exámenes psicométricos y aptitud','Brain','from-purple-400 to-indigo-500','bg-gradient-to-br from-purple-50 to-indigo-50','border-purple-200',112);

-- 2. Campos adicionales en actividades
-- Agregar columnas solo si no existen
SET @col_pub := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'publicado');
SET @sql_pub := IF(@col_pub = 0, 'ALTER TABLE actividades ADD COLUMN publicado TINYINT(1) NOT NULL DEFAULT 1 AFTER activo', 'SELECT 1');
PREPARE s1 FROM @sql_pub;
EXECUTE s1;
DEALLOCATE PREPARE s1;

SET @col_tl := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'time_limit_min');
SET @sql_tl := IF(@col_tl = 0, 'ALTER TABLE actividades ADD COLUMN time_limit_min INT NULL AFTER max_intentos', 'SELECT 1');
PREPARE s2 FROM @sql_tl;
EXECUTE s2;
DEALLOCATE PREPARE s2;

SET @col_ps := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'passing_score');
SET @sql_ps := IF(@col_ps = 0, 'ALTER TABLE actividades ADD COLUMN passing_score INT NULL AFTER time_limit_min', 'SELECT 1');
PREPARE s3 FROM @sql_ps;
EXECUTE s3;
DEALLOCATE PREPARE s3;

SET @col_sh := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades' AND COLUMN_NAME = 'shuffle_questions');
SET @sql_sh := IF(@col_sh = 0, 'ALTER TABLE actividades ADD COLUMN shuffle_questions TINYINT(1) NOT NULL DEFAULT 0 AFTER passing_score', 'SELECT 1');
PREPARE s4 FROM @sql_sh;
EXECUTE s4;
DEALLOCATE PREPARE s4;

-- 3. Índice extra para consultas por estudiante/estado en entregas
-- Crear índice solo si no existe
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades_entregas' AND INDEX_NAME = 'idx_entregas_estudiante_estado'
);
SET @sql_idx := IF(@idx_exists = 0, 'ALTER TABLE actividades_entregas ADD INDEX idx_entregas_estudiante_estado (id_estudiante, estado)', 'SELECT 1');
PREPARE s5 FROM @sql_idx;
EXECUTE s5;
DEALLOCATE PREPARE s5;

-- 4. Detalle JSON + UNIQUE constraint en intentos de quiz
-- Agregar columna JSON y UNIQUE solo si no existen
SET @col_json := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quizzes_intentos' AND COLUMN_NAME = 'detalle_json');
SET @sql_json := IF(@col_json = 0, 'ALTER TABLE quizzes_intentos ADD COLUMN detalle_json JSON NULL AFTER correctas', 'SELECT 1');
PREPARE s6 FROM @sql_json;
EXECUTE s6;
DEALLOCATE PREPARE s6;

SET @uq_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'quizzes_intentos' AND CONSTRAINT_NAME = 'uq_quiz_estudiante_intento'
);
SET @sql_uq := IF(@uq_exists = 0, 'ALTER TABLE quizzes_intentos ADD UNIQUE KEY uq_quiz_estudiante_intento (id_quiz, id_estudiante, intent_number)', 'SELECT 1');
PREPARE s7 FROM @sql_uq;
EXECUTE s7;
DEALLOCATE PREPARE s7;

-- 5. Checks (si motor soporta; se ignoran silenciosamente en versiones previas a 8.0.16)
-- Checks solo si no existen (MySQL 8+)
SET @chk1 := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'actividades_entregas' AND CONSTRAINT_TYPE = 'CHECK' AND CONSTRAINT_NAME = 'chk_calificacion_rango'
);
SET @sql_chk1 := IF(@chk1 = 0, 'ALTER TABLE actividades_entregas ADD CONSTRAINT chk_calificacion_rango CHECK (calificacion IS NULL OR (calificacion >= 0 AND calificacion <= 100))', 'SELECT 1');
PREPARE s8 FROM @sql_chk1;
EXECUTE s8;
DEALLOCATE PREPARE s8;

SET @chk2 := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'quizzes_intentos' AND CONSTRAINT_TYPE = 'CHECK' AND CONSTRAINT_NAME = 'chk_quiz_puntaje_rango'
);
SET @sql_chk2 := IF(@chk2 = 0, 'ALTER TABLE quizzes_intentos ADD CONSTRAINT chk_quiz_puntaje_rango CHECK (puntaje >= 0 AND puntaje <= 100)', 'SELECT 1');
PREPARE s9 FROM @sql_chk2;
EXECUTE s9;
DEALLOCATE PREPARE s9;

-- NOTA: Si la versión de MySQL no soporta JSON o CHECK, ajustar manualmente.
