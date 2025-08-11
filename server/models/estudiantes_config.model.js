import db from '../db.js';

// Ensure table exists (optional, safe to call at runtime)
export const ensureConfigTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS estudiantes_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_estudiante INT NOT NULL,
      nivel_experiencia VARCHAR(32) DEFAULT 'intermedio',
      intereses JSON DEFAULT (JSON_ARRAY()),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_estudiante (id_estudiante)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(sql);
};

export const getConfigByEstudianteId = async (id_estudiante) => {
  await ensureConfigTable();
  const [rows] = await db.query('SELECT * FROM estudiantes_config WHERE id_estudiante = ?', [id_estudiante]);
  return rows[0] || null;
};

export const upsertConfig = async (id_estudiante, data) => {
  await ensureConfigTable();
  // Prepare values
  const nivel = data.nivel_experiencia ?? 'intermedio';
  // Store intereses as JSON string; db driver handles JSON if stringified
  const intereses = JSON.stringify(Array.isArray(data.intereses) ? data.intereses : []);

  const sql = `
    INSERT INTO estudiantes_config (id_estudiante, nivel_experiencia, intereses)
  VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      nivel_experiencia = VALUES(nivel_experiencia),
      intereses = VALUES(intereses);
  `;
  const [result] = await db.query(sql, [id_estudiante, nivel, intereses]);
  return result;
};
