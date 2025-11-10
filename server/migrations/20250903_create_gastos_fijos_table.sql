-- Crear tabla de gastos fijos
CREATE TABLE IF NOT EXISTS gastos_fijos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NULL,
  categoria VARCHAR(120) NOT NULL,
  descripcion VARCHAR(500) NULL,
  proveedor VARCHAR(180) NULL,
  frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Semestral','Anual') NOT NULL DEFAULT 'Mensual',
  metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  importe DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estatus ENUM('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pendiente',
  calendar_event_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índices útiles
ALTER TABLE gastos_fijos
  ADD INDEX idx_gastos_fijos_fecha (fecha),
  ADD INDEX idx_gastos_fijos_metodo (metodo),
  ADD INDEX idx_gastos_fijos_estatus (estatus),
  ADD INDEX idx_gastos_fijos_frecuencia (frecuencia),
  ADD INDEX idx_gastos_fijos_calendar_event_id (calendar_event_id);
