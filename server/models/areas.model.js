import db from '../db.js';

export const getAreaById = async (id) => {
  const [rows] = await db.query('SELECT * FROM areas WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const listAreas = async ({ activos = true } = {}) => {
  const clauses = [];
  const params = [];
  if (activos) { clauses.push('activo = 1'); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const [rows] = await db.query(`SELECT * FROM areas ${where} ORDER BY orden ASC, id ASC` , params);
  return rows;
};

export const getCatalogStructured = async () => {
  const rows = await listAreas({ activos: true });
  const contenedor = rows.find(r => r.id === 5) || null; // contenedor visual
  const generales = rows.filter(r => r.id > 0 && r.id < 5);
  const modulos = rows.filter(r => r.id >= 101);
  return { contenedor, generales, modulos };
};
