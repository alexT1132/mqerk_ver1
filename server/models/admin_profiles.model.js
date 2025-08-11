import db from '../db.js';

export const createProfile = async ({ user_id, nombre, email, telefono = null, foto = null }) => {
  const [result] = await db.query(
    'INSERT INTO admin_profiles (user_id, nombre, email, telefono, foto) VALUES (?, ?, ?, ?, ?)',
    [user_id, nombre, email, telefono, foto]
  );
  return result;
};

export const getByUserId = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM admin_profiles WHERE user_id = ? LIMIT 1', [user_id]);
  return rows[0] || null;
};

export const getByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM admin_profiles WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

export const updateProfile = async (user_id, data) => {
  const fields = [];
  const values = [];
  Object.entries(data).forEach(([k, v]) => {
    fields.push(`${k} = ?`);
    values.push(v);
  });
  if (!fields.length) return { affectedRows: 0 };
  values.push(user_id);
  const [result] = await db.query(`UPDATE admin_profiles SET ${fields.join(', ')} WHERE user_id = ?`, values);
  return result;
};
