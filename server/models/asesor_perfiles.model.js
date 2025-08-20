import db from '../db.js';

export const createOrUpdatePerfil = async (preregistroId, data) => {
  const [existing] = await db.query('SELECT id FROM asesor_perfiles WHERE preregistro_id = ? LIMIT 1', [preregistroId]);
  const cols = [
  'grupo_asesor','grupos_asesor','direccion','municipio','nacimiento','nacionalidad','genero','rfc','nivel_estudios','institucion','titulo_academico','anio_graduacion','titulo_archivo','certificaciones_archivo','experiencia_rango','areas_especializacion','empresa','ultimo_puesto','funciones','plataformas','doc_identificacion','doc_comprobante_domicilio','doc_titulo_cedula','doc_certificaciones','doc_carta_recomendacion','doc_curriculum','doc_fotografia','fuente_conociste','motivaciones','dispuesto_capacitacion','consentimiento_datos','firma_texto','curp','entidad_curp'
  ];
  // Preparar valores (JSON stringify donde corresponda)
  const prep = (key,val)=> ['areas_especializacion','plataformas','fuente_conociste','motivaciones','grupos_asesor'].includes(key) ? (val==null? null : JSON.stringify(val)) : val;
  const values = cols.map(c=> prep(c, data[c]));
  if(existing.length){
    const setExpr = cols.map(c=> `${c}=?`).join(',');
    await db.query(`UPDATE asesor_perfiles SET ${setExpr} WHERE preregistro_id=?`, [...values, preregistroId]);
    return { updated: true };
  } else {
    await db.query(`INSERT INTO asesor_perfiles (preregistro_id, ${cols.join(',')}) VALUES (?${',?'.repeat(cols.length)})`, [preregistroId, ...values]);
    return { created: true };
  }
};

export const getByPreRegistro = async (preregistroId) => {
  const [rows] = await db.query('SELECT * FROM asesor_perfiles WHERE preregistro_id = ? LIMIT 1', [preregistroId]);
  if(!rows[0]) return null;
  const row = rows[0];
  const parse = (k)=> { try { row[k] = row[k] ? JSON.parse(row[k]) : null; } catch { /*ignore*/ } };
  ['areas_especializacion','plataformas','fuente_conociste','motivaciones','grupos_asesor'].forEach(parse);
  return row;
};

// Obtener perfil por usuario_id (para login/verify)
export const getByUserId = async (usuarioId) => {
  const [rows] = await db.query('SELECT * FROM asesor_perfiles WHERE usuario_id = ? LIMIT 1', [usuarioId]);
  if(!rows[0]) return null;
  const row = rows[0];
  const parse = (k)=> { try { row[k] = row[k] ? JSON.parse(row[k]) : null; } catch { /*ignore*/ } };
  ['areas_especializacion','plataformas','fuente_conociste','motivaciones','grupos_asesor'].forEach(parse);
  return row;
};

export const attachUsuario = async (preregistroId, usuarioId) => {
  await db.query('UPDATE asesor_perfiles SET usuario_id=? WHERE preregistro_id=?', [usuarioId, preregistroId]);
};

export const updatePerfilFields = async (preregistroId, fields) => {
  const allowed = [
  'grupo_asesor','grupos_asesor','direccion','municipio','nacimiento','nacionalidad','genero','rfc','nivel_estudios','institucion','titulo_academico','anio_graduacion','titulo_archivo','certificaciones_archivo','experiencia_rango','areas_especializacion','empresa','ultimo_puesto','funciones','plataformas','doc_identificacion','doc_comprobante_domicilio','doc_titulo_cedula','doc_certificaciones','doc_carta_recomendacion','doc_curriculum','doc_fotografia','fuente_conociste','motivaciones','dispuesto_capacitacion','consentimiento_datos','firma_texto','usuario_id','curp','entidad_curp'
  ];
  const prep = (k,v)=> ['areas_especializacion','plataformas','fuente_conociste','motivaciones','grupos_asesor'].includes(k) ? (v==null? null: JSON.stringify(v)) : v;
  const sets = [];
  const vals = [];
  for(const k of Object.keys(fields)){
    if(!allowed.includes(k)) continue;
    sets.push(`${k}=?`);
    vals.push(prep(k, fields[k]));
  }
  if(!sets.length) return { updated:false };
  await db.query(`UPDATE asesor_perfiles SET ${sets.join(', ')} WHERE preregistro_id=?`, [...vals, preregistroId]);
  return { updated:true };
};
