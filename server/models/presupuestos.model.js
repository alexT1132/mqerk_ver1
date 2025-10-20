import db from '../db.js';

export async function list() {
  const [rows] = await db.query('SELECT id, mes, monto, created_at, updated_at FROM presupuestos_mensuales ORDER BY mes DESC');
  return rows;
}

export async function upsert({ mes, monto }) {
  const [res] = await db.query(
    'INSERT INTO presupuestos_mensuales (mes, monto) VALUES (?, ?) ON DUPLICATE KEY UPDATE monto = VALUES(monto), updated_at = CURRENT_TIMESTAMP',
    [mes, monto]
  );
  const [rows] = await db.query('SELECT id, mes, monto, created_at, updated_at FROM presupuestos_mensuales WHERE mes = ?', [mes]);
  return rows[0] || null;
}

export async function remove(mes) {
  const [res] = await db.query('DELETE FROM presupuestos_mensuales WHERE mes = ? LIMIT 1', [mes]);
  return res.affectedRows > 0;
}

export async function getMonthlySummary(mes) {
  // Si no pasa mes, usar el actual (YYYY-MM)
  const month = mes || new Date().toISOString().slice(0,7);
  // Presupuesto asignado para el mes
  const [[budgetRow]] = await db.query('SELECT monto FROM presupuestos_mensuales WHERE mes = ? LIMIT 1', [month]);
  const budget = Number(budgetRow?.monto || 0);
  // Sumar egresos reales (Pagado) del mes: fijos + variables + pagos a asesores
  const [[fijos]] = await db.query(
    "SELECT COALESCE(SUM(importe),0) AS total FROM gastos_fijos WHERE estatus = 'Pagado' AND DATE_FORMAT(fecha, '%Y-%m') = ?",
    [month]
  );
  const [[vars]] = await db.query(
    "SELECT COALESCE(SUM(importe),0) AS total FROM gastos_variables WHERE estatus = 'Pagado' AND DATE_FORMAT(created_at, '%Y-%m') = ?",
    [month]
  );
  const [[asesores]] = await db.query(
    "SELECT COALESCE(SUM(ingreso_final),0) AS total FROM pagos_asesores WHERE status = 'Pagado' AND DATE_FORMAT(fecha_pago, '%Y-%m') = ?",
    [month]
  );
  const spent = Number(fijos?.total || 0) + Number(vars?.total || 0) + Number(asesores?.total || 0);
  const leftover = Math.max(0, budget - spent);
  return { mes: month, budget, spent, leftover };
}
