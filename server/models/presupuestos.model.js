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
  // Si no pasa mes, usar el actual
  const month = mes || new Date().toISOString().slice(0,7);
  const [[budgetRow]] = await db.query('SELECT monto FROM presupuestos_mensuales WHERE mes = ? LIMIT 1', [month]);
  const [[spentRow]] = await db.query('SELECT total_gasto AS spent FROM vw_gasto_mensual WHERE mes = ? LIMIT 1', [month]);
  const budget = Number(budgetRow?.monto || 0);
  const spent = Number(spentRow?.spent || 0);
  const leftover = Math.max(0, budget - spent);
  return { mes: month, budget, spent, leftover };
}
