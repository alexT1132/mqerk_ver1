-- Tabla unificada para actividades obligatorias y quizzes/simulaciones
-- Nombres y columnas en español para consistencia con el resto del esquema.
-- Por ahora sólo se usarán filas con tipo = 'actividad'; 'quiz' quedará reservado.

CREATE TABLE IF NOT EXISTS actividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  tipo ENUM('actividad','quiz') NOT NULL DEFAULT 'actividad', -- futuro: habilitar 'quiz'
  id_area INT NULL,                  -- FUTURO: referencia a tabla 'areas' (cuando exista)
  materia VARCHAR(120) NULL,         -- texto libre temporal si no hay catálogo de áreas/materias
  puntos_max INT NOT NULL DEFAULT 100,  -- máximo evaluable (quiz) o base (actividad)
  peso_calificacion DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- % sobre calificación final
  fecha_limite DATETIME NULL,        -- fecha límite de entrega
  visible_desde DATETIME NULL,       -- fecha desde la que se muestra
  visible_hasta DATETIME NULL,       -- fecha hasta la que se muestra (opcional)
  max_intentos INT NULL,             -- NULL = ilimitado; >=1 restringe (sobretodo en quiz)
  requiere_revision TINYINT(1) NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_por INT NULL,               -- FUTURO: usuario creador
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_actividades_tipo (tipo),
  INDEX idx_actividades_fecha_limite (fecha_limite),
  INDEX idx_actividades_activo (activo),
  INDEX idx_actividades_area (id_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Entregas únicas (estilo Classroom). Si el alumno sustituye, se crea nueva fila y se marca replaced_by para historial simple.
CREATE TABLE IF NOT EXISTS actividades_entregas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_actividad INT NOT NULL,
  id_estudiante INT NOT NULL,
  archivo VARCHAR(255) NOT NULL,
  original_nombre VARCHAR(255) NULL,
  mime_type VARCHAR(120) NULL,
  tamano INT NULL,
  calificacion INT NULL,                             -- 0-100 cuando se revisa
  comentarios TEXT NULL,                             -- feedback del asesor
  estado ENUM('entregada','revisada') NOT NULL DEFAULT 'entregada',
  version INT NOT NULL DEFAULT 1,                    -- incremento al reemplazar
  replaced_by INT NULL,                              -- referencia a la nueva entrega si se reemplaza
  entregada_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- alias de created_at semántico
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_entregas_actividad_estudiante (id_actividad, id_estudiante),
  INDEX idx_entregas_estudiante (id_estudiante),
  INDEX idx_entregas_estado (estado),
  CONSTRAINT fk_entregas_actividad FOREIGN KEY (id_actividad) REFERENCES actividades(id) ON DELETE CASCADE,
  CONSTRAINT fk_entregas_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_entregas_replaced FOREIGN KEY (replaced_by) REFERENCES actividades_entregas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- NOTAS DE USO INICIAL (versión simplificada sin múltiples intentos):
-- 1. Sólo una entrega activa por alumno/actividad. Reemplazos generan nueva fila y enlazan la anterior via replaced_by.
-- 2. Estados: 'entregada' (subida) -> 'revisada' (asesor asigna calificación y comentarios).
-- 3. Para permitir sustitución antes de la fecha límite: verificar que fecha actual <= fecha_limite y que la entrega actual no esté revisada.
-- 4. Para agregar quizzes en el futuro se puede crear otra tabla de resultados o reutilizar esta añadiendo campos específicos.
