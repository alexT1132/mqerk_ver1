import db from '../db.js';

export async function listByStudent(studentId){
  const [rows] = await db.query(
    'SELECT id, student_id, title, description, DATE_FORMAT(date, "%Y-%m-%d") as date, priority, created_at, updated_at FROM student_reminders WHERE student_id = ? ORDER BY date ASC, id ASC',
    [studentId]
  );
  return rows;
}

export async function create(studentId, { title, description, date, priority }){
  const [res] = await db.query(
    'INSERT INTO student_reminders (student_id, title, description, date, priority) VALUES (?,?,?,?,?)',
    [studentId, title, description || null, date, priority]
  );
  return { id: res.insertId, student_id: studentId, title, description, date, priority };
}

export async function update(reminderId, studentId, payload){
  const fields = [];
  const params = [];
  if(payload.title !== undefined){ fields.push('title = ?'); params.push(payload.title); }
  if(payload.description !== undefined){ fields.push('description = ?'); params.push(payload.description); }
  if(payload.date !== undefined){ fields.push('date = ?'); params.push(payload.date); }
  if(payload.priority !== undefined){ fields.push('priority = ?'); params.push(payload.priority); }
  if(fields.length === 0) return null;
  params.push(reminderId, studentId);
  const [res] = await db.query(`UPDATE student_reminders SET ${fields.join(', ')} WHERE id = ? AND student_id = ?`, params);
  return res.affectedRows > 0;
}

export async function remove(reminderId, studentId){
  const [res] = await db.query('DELETE FROM student_reminders WHERE id = ? AND student_id = ?', [reminderId, studentId]);
  return res.affectedRows > 0;
}
