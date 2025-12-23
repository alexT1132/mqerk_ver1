// Usage:
//   node server/scripts/create-asesor-user.js <preregistroId> <username> <password>
// Creates or updates a user with role 'asesor' and attaches it to asesor_perfiles by preregistro_id.

import bcrypt from 'bcryptjs';
import db from '../db.js';

async function getUsuarioByUsername(username){
  const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ? LIMIT 1', [username]);
  return rows[0] || null;
}

async function createUsuario({ usuario, hash, role='asesor' }){
  const [res] = await db.query(
    'INSERT INTO usuarios (usuario, contraseña, role, id_estudiante) VALUES (?, ?, ?, NULL)',
    [usuario, hash, role]
  );
  return res.insertId;
}

async function updateUsuarioPassword(id, hash){
  await db.query('UPDATE usuarios SET contraseña = ?, password_changed_at = CURRENT_TIMESTAMP, must_change = 0 WHERE id = ?', [hash, id]);
}

async function ensurePerfilRow(preregistroId){
  // Create row if not exists
  await db.query('INSERT IGNORE INTO asesor_perfiles (preregistro_id) VALUES (?)', [preregistroId]);
}

async function attachUsuarioToPerfil(preregistroId, usuarioId){
  await db.query('UPDATE asesor_perfiles SET usuario_id=? WHERE preregistro_id=?', [usuarioId, preregistroId]);
}

async function main(){
  const preregistroId = Number(process.argv[2]);
  const username = process.argv[3];
  const password = process.argv[4];
  if(!preregistroId || !username || !password){
    console.error('Usage: node server/scripts/create-asesor-user.js <preregistroId> <username> <password>');
    process.exit(1);
  }
  try{
    const hash = await bcrypt.hash(password, 10);
    let user = await getUsuarioByUsername(username);
    let userId;
    if(user){
      await updateUsuarioPassword(user.id, hash);
      userId = user.id;
      console.log(`[OK] Updated password for existing user '${username}' (id=${userId})`);
    } else {
      userId = await createUsuario({ usuario: username, hash, role: 'asesor' });
      console.log(`[OK] Created asesor user '${username}' (id=${userId})`);
    }
    await ensurePerfilRow(preregistroId);
    await attachUsuarioToPerfil(preregistroId, userId);
    console.log(`[OK] Attached user id=${userId} to asesor_perfiles.preregistro_id=${preregistroId}`);
    console.log('You can now login at POST /api/login with { usuario, contraseña } and access /asesor');
    process.exit(0);
  }catch(e){
    console.error('[ERROR] Failed to create/attach asesor user:', e);
    process.exit(2);
  }
}

main();
