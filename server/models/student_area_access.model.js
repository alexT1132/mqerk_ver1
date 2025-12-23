import db from '../db.js';

export const createRequest = async ({ id_estudiante, area_id, area_type='actividad', notes=null }) => {
  const [res] = await db.query(
    'INSERT INTO student_area_requests (id_estudiante, area_id, area_type, notes) VALUES (?,?,?,?)',
    [id_estudiante, area_id, area_type, notes]
  );
  return res.insertId;
};

export const listMyRequests = async (id_estudiante, { area_type=null, status=null } = {}) => {
  const clauses = ['id_estudiante = ?'];
  const params = [id_estudiante];
  if (area_type) { clauses.push('area_type = ?'); params.push(area_type); }
  if (status) { clauses.push('status = ?'); params.push(status); }
  const where = 'WHERE ' + clauses.join(' AND ');
  const [rows] = await db.query(`SELECT * FROM student_area_requests ${where} ORDER BY id DESC`, params);
  return rows;
};

// Devuelve true si el estudiante tiene permiso para el área indicada (sin importar el tipo)
export const hasPermission = async (id_estudiante, area_id) => {
  const [rows] = await db.query(
    'SELECT 1 FROM student_area_permissions WHERE id_estudiante = ? AND area_id = ? LIMIT 1',
    [id_estudiante, area_id]
  );
  return rows && rows.length > 0;
};

// Lista de area_id permitidos para un estudiante (cubre cualquier area_type)
export const getAllowedAreaIds = async (id_estudiante) => {
  const [rows] = await db.query(
    'SELECT DISTINCT area_id FROM student_area_permissions WHERE id_estudiante = ? ORDER BY area_id ASC',
    [id_estudiante]
  );
  return rows.map(r => r.area_id);
};

export const listRequests = async ({ status='pending', area_type=null, area_id=null, limit=200, offset=0 } = {}) => {
  const clauses = [];
  const params = [];
  if (status) { clauses.push('r.status = ?'); params.push(status); }
  if (area_type) { clauses.push('r.area_type = ?'); params.push(area_type); }
  if (area_id) { clauses.push('r.area_id = ?'); params.push(area_id); }
  const where = clauses.length ? ('WHERE ' + clauses.join(' AND ')) : '';
  const [rows] = await db.query(
    `SELECT r.*, e.nombre, e.apellidos, e.folio, e.folio_formateado
     FROM student_area_requests r
     LEFT JOIN estudiantes e ON e.id = r.id_estudiante
     ${where}
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
};

export const approveRequest = async (id, decided_by) => {
  // Set approved; create permission if not exists
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rws] = await conn.query('SELECT * FROM student_area_requests WHERE id=? FOR UPDATE', [id]);
    const req = rws?.[0];
    if (!req) { await conn.rollback(); return { ok:false, reason:'not-found' }; }
    const now = new Date();
    await conn.query('UPDATE student_area_requests SET status="approved", decided_by=?, decided_at=? WHERE id=?', [decided_by || null, now, id]);
    await conn.query(
      'INSERT IGNORE INTO student_area_permissions (id_estudiante, area_id, area_type, granted_by, granted_at) VALUES (?,?,?,?,?)',
      [req.id_estudiante, req.area_id, req.area_type, decided_by || null, now]
    );
    await conn.commit();
    return { ok:true, request: req };
  } catch (e) {
    try { await conn.rollback(); } catch {}
    throw e;
  } finally { conn.release(); }
};

export const denyRequest = async (id, decided_by, notes=null) => {
  const [res] = await db.query('UPDATE student_area_requests SET status="denied", decided_by=?, decided_at=NOW(), notes=COALESCE(?, notes) WHERE id=?', [decided_by || null, notes, id]);
  return res.affectedRows > 0;
};

export const revokePermission = async ({ id_estudiante, area_id, area_type }) => {
  const [res] = await db.query('DELETE FROM student_area_permissions WHERE id_estudiante=? AND area_id=? AND area_type=?', [id_estudiante, area_id, area_type]);
  // Optionally mark last approved request as revoked
  try {
    await db.query('UPDATE student_area_requests SET status="revoked", decided_at=NOW() WHERE id_estudiante=? AND area_id=? AND area_type=? AND status="approved" ORDER BY id DESC LIMIT 1', [id_estudiante, area_id, area_type]);
  } catch {}
  return res.affectedRows > 0;
};

export const listPermissions = async (id_estudiante, { area_type=null } = {}) => {
  const clauses = ['id_estudiante = ?'];
  const params = [id_estudiante];
  if (area_type) { clauses.push('area_type = ?'); params.push(area_type); }
  const where = 'WHERE ' + clauses.join(' AND ');
  const [rows] = await db.query(`SELECT * FROM student_area_permissions ${where} ORDER BY granted_at DESC`, params);
  return rows;
};
