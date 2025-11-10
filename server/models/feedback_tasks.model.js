import db from '../db.js';
const safeParse = (s)=> { try { return JSON.parse(s); } catch { return null; } };

export const createTask = async (data) => {
  // Compat: insertar solo columnas existentes en el esquema actual
  const sql = `INSERT INTO feedback_tasks (nombre, descripcion, puntos, due_date, grupos, activo) VALUES (?,?,?,?,?,?)`;
  const gruposJSON = data.grupos ? JSON.stringify(data.grupos) : null;
  const values = [data.nombre, data.descripcion || null, data.puntos || 10, data.due_date, gruposJSON, data.activo ?? 1];
  const [res] = await db.query(sql, values);
  return res.insertId;
};

export const listTasks = async ({ activo, limit = 100, offset = 0 }) => {
  const filters = [];
  const params = [];
  if (activo !== undefined) { filters.push('activo = ?'); params.push(activo ? 1 : 0); }
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
  const [rows] = await db.query(`SELECT * FROM feedback_tasks ${where} ORDER BY due_date ASC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
  return rows.map(r => ({ ...r, grupos: r.grupos ? safeParse(r.grupos) : null }));
};

export const getTask = async (id) => {
  const [rows] = await db.query('SELECT * FROM feedback_tasks WHERE id = ? LIMIT 1', [id]);
  if(!rows[0]) return null;
  const row = rows[0];
  row.grupos = row.grupos ? safeParse(row.grupos) : null;
  return row;
};

export const updateTask = async (id, data) => {
  const fields = [];
  const params = [];
  for (const key of ['nombre','descripcion','puntos','due_date','activo']) {
    if (data[key] !== undefined) { fields.push(`${key} = ?`); params.push(data[key]); }
  }
  if (data.grupos !== undefined) {
    fields.push('grupos = ?');
    params.push(data.grupos ? JSON.stringify(data.grupos) : null);
  }
  if (!fields.length) return { affectedRows: 0 };
  const [res] = await db.query(`UPDATE feedback_tasks SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  return res;
};

export const deleteTask = async (id) => {
  const [res] = await db.query('DELETE FROM feedback_tasks WHERE id = ?', [id]);
  return res;
};
