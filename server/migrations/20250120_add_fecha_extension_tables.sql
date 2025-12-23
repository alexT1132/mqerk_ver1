-- Tabla para extensiones de fecha límite de actividades
-- Permite extender fechas por grupo o por estudiante individual

CREATE TABLE IF NOT EXISTS actividades_fecha_extensiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_actividad INT NOT NULL,
  tipo ENUM('grupo', 'estudiante') NOT NULL,
  grupo VARCHAR(50) NULL,              -- NULL si tipo = 'estudiante'
  id_estudiante INT NULL,             -- NULL si tipo = 'grupo'
  nueva_fecha_limite DATETIME NOT NULL,
  creado_por INT NULL,                -- ID del asesor/admin que creó la extensión
  notas TEXT NULL,                    -- Notas opcionales sobre la extensión
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_extension_actividad (id_actividad),
  INDEX idx_extension_grupo (grupo),
  INDEX idx_extension_estudiante (id_estudiante),
  INDEX idx_extension_tipo (tipo),
  CONSTRAINT fk_extension_actividad FOREIGN KEY (id_actividad) REFERENCES actividades(id) ON DELETE CASCADE,
  CONSTRAINT fk_extension_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  -- Asegurar que solo uno de grupo o id_estudiante esté definido
  CONSTRAINT chk_extension_tipo CHECK (
    (tipo = 'grupo' AND grupo IS NOT NULL AND id_estudiante IS NULL) OR
    (tipo = 'estudiante' AND id_estudiante IS NOT NULL AND grupo IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Agregar campo para permitir edición después de calificada
-- Nota: MySQL no soporta IF NOT EXISTS en ALTER TABLE ADD COLUMN, usar con cuidado
ALTER TABLE actividades_entregas 
ADD COLUMN permite_editar_despues_calificada TINYINT(1) NOT NULL DEFAULT 0;

