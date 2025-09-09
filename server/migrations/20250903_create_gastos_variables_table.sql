-- Crear tabla de gastos variables
CREATE TABLE IF NOT EXISTS gastos_variables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unidades INT NOT NULL DEFAULT 1,
  producto VARCHAR(200) NOT NULL,
  descripcion VARCHAR(500) NULL,
  entidad VARCHAR(180) NULL,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
  importe DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estatus ENUM('Pagado','Pendiente','Vencido') NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE gastos_variables
  ADD INDEX idx_gastos_variables_metodo (metodo),
  ADD INDEX idx_gastos_variables_estatus (estatus);
