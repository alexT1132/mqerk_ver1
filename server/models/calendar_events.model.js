import db from "../db.js";

// Table: calendar_events
// Columns:
// id (PK), user_id (admin usuario id), titulo, descripcion, fecha (DATE), hora (TIME),
// tipo (VARCHAR), prioridad (VARCHAR), recordar_minutos (INT), completado (TINYINT 0/1),
// created_at, updated_at

export const getEventsByUserAndRange = async (userId, fromDate, toDate) => {
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
  // Bloquear eliminación si existe un ingreso vinculado a este evento
  const [result] = await db.query(
    `DELETE ce FROM calendar_events AS ce
     WHERE ce.id = ? AND ce.user_id = ?
       AND NOT EXISTS (SELECT 1 FROM ingresos i WHERE i.calendar_event_id = ce.id)`,
    [id, userId]
  );
  return result.affectedRows > 0;
};
