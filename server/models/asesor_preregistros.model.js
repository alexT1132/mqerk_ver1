import db from '../db.js';

export const createPreRegistro = async (data) => {
  const sql = `INSERT INTO asesor_preregistros (nombres, apellidos, correo, telefono, area, estudios) VALUES (?,?,?,?,?,?)`;
  const values = [data.nombres, data.apellidos, data.correo, data.telefono, data.area, data.estudios];
  const [result] = await db.query(sql, values);
  return { id: result.insertId, ...data, status: 'pending' };
};

export const findByCorreo = async (correo) => {
  const [rows] = await db.query('SELECT * FROM asesor_preregistros WHERE correo = ? LIMIT 1', [correo]);
  return rows[0] || null;
};

export const getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM asesor_preregistros WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const updateStatus = async (id, status) => {
  const allowed = ['pending','testing','completed','rejected'];
  if(!allowed.includes(status)) throw new Error('Status invalido');
  const [result] = await db.query('UPDATE asesor_preregistros SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows > 0;
};

export const listAll = async () => {
  const [rows] = await db.query('SELECT * FROM asesor_preregistros ORDER BY created_at DESC');
  return rows;
};

export const updateBasicData = async (id, fields) => {
  const allowed = ['nombres','apellidos','correo','telefono','area','estudios'];
  const sets = [];
  const vals = [];
  for(const k of allowed){
    if(Object.prototype.hasOwnProperty.call(fields, k)){
      sets.push(`${k}=?`);
      vals.push(fields[k]);
    }
  }
  if(!sets.length) return { updated:false };
  vals.push(id);
  const [r] = await db.query(`UPDATE asesor_preregistros SET ${sets.join(', ')} WHERE id=?`, vals);
  return { updated: r.affectedRows>0 };
};
