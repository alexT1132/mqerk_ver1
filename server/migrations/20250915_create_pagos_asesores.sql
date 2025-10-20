-- Tabla de pagos a asesores
CREATE TABLE IF NOT EXISTS pagos_asesores (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  -- Debe coincidir exactamente con el tipo de asesor_preregistros.id (BIGINT UNSIGNED)
  asesor_preregistro_id BIGINT UNSIGNED NULL,
  asesor_nombre VARCHAR(255) NULL,
  tipo_servicio ENUM('curso','asesoria','otro') NOT NULL,
  servicio_detalle VARCHAR(255) NULL,
  id_pago_ref BIGINT NULL,
  monto_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas_trabajadas DECIMAL(6,2) NULL,
  honorarios_comision DECIMAL(10,2) NOT NULL DEFAULT 0,
  ingreso_final DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_pago DATE NOT NULL,
  metodo_pago VARCHAR(100) NULL,
  nota TEXT NULL,
  status ENUM('Pendiente','Pagado','Cancelado') NOT NULL DEFAULT 'Pagado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asesor (asesor_preregistro_id),
  INDEX idx_fecha (fecha_pago),
  CONSTRAINT fk_pagos_asesor_registro FOREIGN KEY (asesor_preregistro_id)
    REFERENCES asesor_preregistros(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
