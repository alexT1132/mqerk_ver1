-- Tabla de presupuestos mensuales para egresos
CREATE TABLE IF NOT EXISTS presupuestos_mensuales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mes CHAR(7) NOT NULL, -- formato YYYY-MM
  monto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_presupuesto_mes (mes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Vista de gasto mensual por egresos (Pagado)
DROP VIEW IF EXISTS vw_gasto_mensual;
CREATE VIEW vw_gasto_mensual AS
SELECT ym.mes,
       COALESCE(gf.total_gasto, 0) + COALESCE(gv.total_gasto, 0) AS total_gasto
FROM (
  SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL seq MONTH), '%Y-%m') AS mes
  FROM (
    SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11
  ) s
) ym
LEFT JOIN (
  SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, SUM(importe) AS total_gasto
  FROM gastos_fijos
  WHERE estatus = 'Pagado'
  GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) gf ON gf.mes = ym.mes
LEFT JOIN (
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, SUM(importe) AS total_gasto
  FROM gastos_variables
  WHERE estatus = 'Pagado'
  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
) gv ON gv.mes = ym.mes;