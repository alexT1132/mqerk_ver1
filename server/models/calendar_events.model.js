import db from "../db.js";

// Ensure calendar_events table exists (idempotent)
let __inited = false;
async function ensureTable() {
  if (__inited) return;
  const sql = `CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'personal',
    prioridad VARCHAR(50) NOT NULL DEFAULT 'media',
    recordar_minutos INT NOT NULL DEFAULT 15,
    completado TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_fecha (user_id, fecha)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
  await db.query(sql);
  // Ensure required columns exist (best-effort idempotent)
  try {
    const [cols] = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'calendar_events'"
    );
    const have = new Set(cols.map(c => c.COLUMN_NAME));
    const alters = [];
    if (!have.has('user_id')) alters.push("ADD COLUMN user_id INT NOT NULL");
    if (!have.has('titulo')) alters.push("ADD COLUMN titulo VARCHAR(255) NOT NULL");
    if (!have.has('descripcion')) alters.push("ADD COLUMN descripcion TEXT NULL");
    if (!have.has('fecha')) alters.push("ADD COLUMN fecha DATE NOT NULL");
    if (!have.has('hora')) alters.push("ADD COLUMN hora TIME NOT NULL");
    if (!have.has('tipo')) alters.push("ADD COLUMN tipo VARCHAR(50) NOT NULL DEFAULT 'personal'");
    if (!have.has('prioridad')) alters.push("ADD COLUMN prioridad VARCHAR(50) NOT NULL DEFAULT 'media'");
    if (!have.has('recordar_minutos')) alters.push("ADD COLUMN recordar_minutos INT NOT NULL DEFAULT 15");
    if (!have.has('completado')) alters.push("ADD COLUMN completado TINYINT(1) NOT NULL DEFAULT 0");
    if (!have.has('created_at')) alters.push("ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    if (!have.has('updated_at')) alters.push("ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    if (alters.length) {
      await db.query(`ALTER TABLE calendar_events ${alters.join(', ')}`);
    }
  } catch {}
  __inited = true;
}

// Table: calendar_events
// Columns:
// id (PK), user_id (admin usuario id), titulo, descripcion, fecha (DATE), hora (TIME),
// tipo (VARCHAR), prioridad (VARCHAR), recordar_minutos (INT), completado (TINYINT 0/1),
// created_at, updated_at

export const getEventsByUserAndRange = async (userId, fromDate, toDate) => {
  await ensureTable();
  const [rows] = await db.query(
    `SELECT id, user_id, titulo, descripcion, fecha, TIME_FORMAT(hora, '%H:%i') AS hora,
            tipo, prioridad, recordar_minutos, completado,
            created_at, updated_at
     FROM calendar_events
     WHERE user_id = ? AND fecha BETWEEN ? AND ?
     ORDER BY fecha ASC, hora ASC`,
    [userId, fromDate, toDate]
  );
  return rows;
};

export const createEvent = async (userId, data) => {
  await ensureTable();
  const {
    titulo,
    descripcion = null,
    fecha,
    hora,
    tipo = 'personal',
    prioridad = 'media',
    recordar_minutos = 15,
    completado = 0,
  } = data || {};

  const [result] = await db.query(
    `INSERT INTO calendar_events
      (user_id, titulo, descripcion, fecha, hora, tipo, prioridad, recordar_minutos, completado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [userId, titulo, descripcion, fecha, hora, tipo, prioridad, Number.isInteger(recordar_minutos) ? recordar_minutos : 15, completado ? 1 : 0]
  );
  const [rows] = await db.query(`SELECT id, user_id, titulo, descripcion, fecha, TIME_FORMAT(hora, '%H:%i') AS hora, tipo, prioridad, recordar_minutos, completado, created_at, updated_at FROM calendar_events WHERE id = ?`, [result.insertId]);
  return rows[0];
};

export const updateEvent = async (id, userId, updates) => {
  await ensureTable();
  // Build dynamic SET
  const allowed = ['titulo','descripcion','fecha','hora','tipo','prioridad','recordar_minutos','completado'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = ?`);
      let val = updates[key];
      if (key === 'completado') val = updates[key] ? 1 : 0;
      values.push(val);
    }
  }
  if (fields.length === 0) return null;

  values.push(id, userId);
  await db.query(`UPDATE calendar_events SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, values);
  const [rows] = await db.query(`SELECT id, user_id, titulo, descripcion, fecha, TIME_FORMAT(hora, '%H:%i') AS hora, tipo, prioridad, recordar_minutos, completado, created_at, updated_at FROM calendar_events WHERE id = ? AND user_id = ?`, [id, userId]);
  return rows[0] || null;
};

export const deleteEvent = async (id, userId) => {
  await ensureTable();
  // Bloquear eliminación si existe un ingreso vinculado a este evento
  const [result] = await db.query(
    `DELETE ce FROM calendar_events AS ce
     WHERE ce.id = ? AND ce.user_id = ?
       AND NOT EXISTS (SELECT 1 FROM ingresos i WHERE i.calendar_event_id = ce.id)`,
    [id, userId]
  );
  return result.affectedRows > 0;
};

// Initialize table on module load (best-effort)
ensureTable().catch(() => {});
