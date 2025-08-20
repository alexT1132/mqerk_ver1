import db from '../db.js';

export const createNotification = async (n) => {
  const [res] = await db.query(
    `INSERT INTO student_notifications (student_id,type,title,message,action_url,metadata) VALUES (?,?,?,?,?,?)`,
    [n.student_id, n.type || 'other', n.title, n.message, n.action_url || null, n.metadata ? JSON.stringify(n.metadata) : null]
  );
  return res.insertId;
};

export const bulkCreateNotifications = async (list=[]) => {
  if(!list.length) return 0;
  const values = [];
  const placeholders = list.map(n => {
    values.push(n.student_id, n.type || 'other', n.title, n.message, n.action_url || null, n.metadata ? JSON.stringify(n.metadata) : null);
    return '(?,?,?,?,?,?)';
  }).join(',');
  const [res] = await db.query(
    `INSERT INTO student_notifications (student_id,type,title,message,action_url,metadata) VALUES ${placeholders}`,
    values
  );
  return res.affectedRows;
};

export const listNotifications = async (student_id, { limit=50, offset=0 } = {}) => {
  const [rows] = await db.query(
    `SELECT id, student_id, type, title, message, action_url, metadata, is_read, created_at
     FROM student_notifications
     WHERE student_id = ?
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [student_id, Number(limit), Number(offset)]
  );
  for(const r of rows){
    if(r.metadata && typeof r.metadata === 'string'){
      try { r.metadata = JSON.parse(r.metadata); } catch { r.metadata = null; }
    }
  }
  return rows;
};

export const markRead = async (id, student_id, read=true) => {
  const [res] = await db.query(`UPDATE student_notifications SET is_read=? WHERE id=? AND student_id=?`, [read?1:0, id, student_id]);
  return res.affectedRows;
};

export const markAllRead = async (student_id) => {
  const [res] = await db.query(`UPDATE student_notifications SET is_read=1 WHERE student_id=? AND is_read=0`, [student_id]);
  return res.affectedRows;
};

export const deleteNotification = async (id, student_id) => {
  const [res] = await db.query(`DELETE FROM student_notifications WHERE id=? AND student_id=?`, [id, student_id]);
  return res.affectedRows;
};

export const deleteRead = async (student_id) => {
  const [res] = await db.query(`DELETE FROM student_notifications WHERE student_id=? AND is_read=1`, [student_id]);
  return res.affectedRows;
};
