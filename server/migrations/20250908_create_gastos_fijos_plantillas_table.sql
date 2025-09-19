-- Create table for reusable fixed-expense templates (semi-fixed recurring)
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS gastos_fijos_plantillas (
	id INT AUTO_INCREMENT PRIMARY KEY,
	categoria VARCHAR(120) NOT NULL,
	descripcion VARCHAR(255) NULL,
	proveedor VARCHAR(120) NULL,
	frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Semestral','Anual') NOT NULL DEFAULT 'Mensual',
	metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
	monto_sugerido DECIMAL(12,2) NOT NULL DEFAULT 0,
	activo TINYINT(1) NOT NULL DEFAULT 1,
	last_used_at DATETIME NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

