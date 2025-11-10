-- Crear tabla de ingresos y migrar datos desde comprobantes
CREATE TABLE IF NOT EXISTS ingresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NULL,
  asesor_preregistro_id BIGINT UNSIGNED NULL,
  asesor_nombre VARCHAR(180) NULL,
  curso VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  importe DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estatus ENUM('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pagado',
  comprobante_id INT NULL,
  notas TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índices
ALTER TABLE ingresos
  ADD INDEX idx_ingresos_fecha (fecha),
  ADD INDEX idx_ingresos_estudiante (estudiante_id),
  ADD INDEX idx_ingresos_metodo (metodo),
  ADD INDEX idx_ingresos_estatus (estatus);

-- Llaves foráneas
-- Agregar FKs solo si no existen
SET @fk_est := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ingresos_estudiante'
);
SET @sql_fk_est := IF(@fk_est = 0,
  'ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE fk1 FROM @sql_fk_est;
EXECUTE fk1;
DEALLOCATE PREPARE fk1;

SET @fk_as := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ingresos_asesor'
);
SET @sql_fk_as := IF(@fk_as = 0,
  'ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_asesor FOREIGN KEY (asesor_preregistro_id) REFERENCES asesor_preregistros(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE fk2 FROM @sql_fk_as;
EXECUTE fk2;
DEALLOCATE PREPARE fk2;

SET @fk_comp := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_ingresos_comprobante'
);
SET @sql_fk_comp := IF(@fk_comp = 0,
  'ALTER TABLE ingresos ADD CONSTRAINT fk_ingresos_comprobante FOREIGN KEY (comprobante_id) REFERENCES comprobantes(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE fk3 FROM @sql_fk_comp;
EXECUTE fk3;
DEALLOCATE PREPARE fk3;

-- Backfill básico desde comprobantes (solo si ingresos está vacío)
INSERT INTO ingresos (estudiante_id, asesor_nombre, curso, fecha, metodo, importe, estatus, comprobante_id)
SELECT e.id,
       e.asesor,
       e.curso,
       DATE(c.created_at) AS fecha,
       CASE LOWER(COALESCE(c.metodo,''))
         WHEN 'efectivo' THEN 'Efectivo'
         WHEN 'transferencia' THEN 'Transferencia'
         WHEN 'tarjeta' THEN 'Tarjeta'
         ELSE 'Efectivo'
       END AS metodo,
       COALESCE(c.importe, 0.00) AS importe,
       CASE WHEN c.importe IS NULL OR c.importe = 0 THEN 'Pendiente' ELSE 'Pagado' END AS estatus,
       c.id
FROM comprobantes c
JOIN estudiantes e ON e.id = c.id_estudiante
WHERE c.importe IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM ingresos LIMIT 1);
