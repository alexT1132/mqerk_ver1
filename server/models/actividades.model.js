import db from '../db.js';

const buildWhere = (filters = {}) => {
  const clauses = [];
  const params = [];
  if (filters.tipo) { clauses.push('tipo = ?'); params.push(filters.tipo); }
  if (filters.activo !== undefined) { clauses.push('activo = ?'); params.push(filters.activo ? 1 : 0); }
  if (filters.id_area) { clauses.push('id_area = ?'); params.push(filters.id_area); }
  if (filters.visible === true) {
    clauses.push('(visible_desde IS NULL OR visible_desde <= NOW())');
    clauses.push('(visible_hasta IS NULL OR visible_hasta >= NOW())');
  }
  if (filters.publicado !== undefined) { clauses.push('publicado = ?'); params.push(filters.publicado ? 1 : 0); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  return { where, params };
};

export const createActividad = async (data) => {
  const sql = `INSERT INTO actividades
  (titulo, descripcion, tipo, id_area, materia, puntos_max, peso_calificacion, fecha_limite, grupos, recursos_json, imagen_portada, visible_desde, visible_hasta, max_intentos, requiere_revision, activo, publicado, creado_por, time_limit_min, passing_score, shuffle_questions)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const values = [
    data.titulo,
    data.descripcion || null,
    data.tipo || 'actividad',
    data.id_area || null,
    data.materia || null,
    data.puntos_max ?? 100,
    data.peso_calificacion ?? 0,
    data.fecha_limite || null,
  // grupos almacenado como JSON string o null
  data.grupos ? JSON.stringify(data.grupos) : null,
  data.recursos_json ? JSON.stringify(data.recursos_json) : null,
  data.imagen_portada || null,
  data.visible_desde || null,
    data.visible_hasta || null,
    data.max_intentos || null,
    data.requiere_revision !== undefined ? (data.requiere_revision ? 1 : 0) : 1,
    data.activo !== undefined ? (data.activo ? 1 : 0) : 1,
  data.publicado !== undefined ? (data.publicado ? 1 : 0) : 1,
  data.creado_por || null,
  data.time_limit_min || null,
  data.passing_score || null,
  data.shuffle_questions ? 1 : 0
  ];
  const [res] = await db.query(sql, values);
  return res.insertId;
};

export const updateActividad = async (id, data) => {
  const allowed = ['titulo','descripcion','tipo','id_area','materia','puntos_max','peso_calificacion','fecha_limite','grupos','recursos_json','imagen_portada','visible_desde','visible_hasta','max_intentos','requiere_revision','activo','publicado','time_limit_min','passing_score','shuffle_questions'];
  const sets = []; const params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      if (k === 'grupos') {
        params.push(data.grupos ? JSON.stringify(data.grupos) : null);
      } else if (k === 'recursos_json') {
        params.push(data.recursos_json ? JSON.stringify(data.recursos_json) : null);
      } else if (k === 'requiere_revision' || k === 'activo') params.push(data[k] ? 1 : 0); else params.push(data[k]);
      sets.push(`${k} = ?`);
    }
  }
  if (!sets.length) return { affectedRows:0 };
  const [res] = await db.query(`UPDATE actividades SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
  return res;
};

export const getActividad = async (id) => {
  const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? LIMIT 1', [id]);
  const row = rows[0];
  if (!row) return null;
  if (row.grupos) {
    try { if (typeof row.grupos === 'string') row.grupos = JSON.parse(row.grupos); } catch { row.grupos = null; }
  }
  if (row.recursos_json) {
    try { if (typeof row.recursos_json === 'string') row.recursos_json = JSON.parse(row.recursos_json); } catch { row.recursos_json = null; }
  }
  return row;
};

export const listActividades = async (filters = {}, { limit = 100, offset = 0 } = {}) => {
  const { where, params } = buildWhere(filters);
  const [rows] = await db.query(`SELECT * FROM actividades ${where} ORDER BY fecha_limite ASC, id DESC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
  for (const r of rows) {
    if (r.grupos) { try { if (typeof r.grupos === 'string') r.grupos = JSON.parse(r.grupos); } catch { r.grupos = null; } }
    if (r.recursos_json) { try { if (typeof r.recursos_json === 'string') r.recursos_json = JSON.parse(r.recursos_json); } catch { r.recursos_json = null; } }
  }
  return rows;
};
