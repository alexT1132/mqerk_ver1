import db from '../db.js';

export const createContrato = async (data) => {
  const sql = `INSERT INTO contratos (id_estudiante, folio, folio_formateado, archivo, original_nombre, mime_type, tamano, firmado, version, notas)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [data.id_estudiante, data.folio, data.folio_formateado || null, data.archivo, data.original_nombre || null, data.mime_type || null, data.tamano || null, data.firmado ? 1 : 0, data.version || 1, data.notas || null];
  const [result] = await db.query(sql, values);
  return result;
};

export const getContratoByEstudiante = async (id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM contratos WHERE id_estudiante = ? ORDER BY created_at DESC LIMIT 1', [id_estudiante]);
  return rows[0] || null;
};

export const getContratoByFolio = async (folio) => {
  const [rows] = await db.query('SELECT * FROM contratos WHERE folio = ? ORDER BY created_at DESC LIMIT 1', [folio]);
  return rows[0] || null;
};

// Eliminar un contrato por ID (última versión u otro específico)
export const deleteContratoById = async (id) => {
  if (!id) return { affectedRows: 0 };
  const [result] = await db.query('DELETE FROM contratos WHERE id = ? LIMIT 1', [id]);
  return result;
};

// Eliminar todos los contratos asociados a un folio (para garantizar limpieza total)
export const deleteContratosByFolio = async (folio) => {
  if (!folio) return { affectedRows: 0 };
  const [result] = await db.query('DELETE FROM contratos WHERE folio = ?', [folio]);
  return result;
};
