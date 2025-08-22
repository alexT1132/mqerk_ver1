import db from '../db.js';

async function ensureTable() {
  const createSQL = `CREATE TABLE IF NOT EXISTS actividades_entregas_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrega_id INT NOT NULL,
    archivo VARCHAR(255) NOT NULL,
    original_nombre VARCHAR(255) NULL,
    mime_type VARCHAR(120) NULL,
    tamano INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entrega_archivos_entrega (entrega_id),
    CONSTRAINT fk_entrega_archivo_entrega FOREIGN KEY (entrega_id) REFERENCES actividades_entregas(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
  await db.query(createSQL).catch(()=>{});
}

export const addArchivo = async ({ entrega_id, archivo, original_nombre, mime_type, tamano }) => {
  try {
    const sql = `INSERT INTO actividades_entregas_archivos (entrega_id, archivo, original_nombre, mime_type, tamano) VALUES (?,?,?,?,?)`;
    const [res] = await db.query(sql, [entrega_id, archivo, original_nombre, mime_type, tamano]);
    return res.insertId;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') { await ensureTable(); return addArchivo({ entrega_id, archivo, original_nombre, mime_type, tamano }); }
    throw e;
  }
};

export const listArchivosEntrega = async (entrega_id) => {
  try {
    const [rows] = await db.query('SELECT * FROM actividades_entregas_archivos WHERE entrega_id = ? ORDER BY id ASC', [entrega_id]);
    return rows;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') { await ensureTable(); return listArchivosEntrega(entrega_id); }
    throw e;
  }
};

export const deleteArchivo = async (id, entrega_id) => {
  try {
    const [res] = await db.query('DELETE FROM actividades_entregas_archivos WHERE id = ? AND entrega_id = ? LIMIT 1', [id, entrega_id]);
    return res.affectedRows > 0;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') { await ensureTable(); return false; }
    throw e;
  }
};
