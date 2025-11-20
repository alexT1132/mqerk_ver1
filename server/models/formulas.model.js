import db from "../db.js";

// Ensure formulas table exists (idempotent)
let __inited = false;
async function ensureTable() {
  if (__inited) return;
  const sql = `CREATE TABLE IF NOT EXISTS formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NULL,
    latex TEXT NOT NULL,
    descripcion TEXT NULL,
    tiene_placeholders TINYINT(1) NOT NULL DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo),
    INDEX idx_orden (orden)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
  await db.query(sql);
  // Ensure required columns exist (best-effort idempotent)
  try {
    const [cols] = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'formulas'"
    );
    const have = new Set(cols.map(c => c.COLUMN_NAME));
    const alters = [];
    if (!have.has('categoria')) alters.push("ADD COLUMN categoria VARCHAR(100) NOT NULL");
    if (!have.has('nombre')) alters.push("ADD COLUMN nombre VARCHAR(255) NULL");
    if (!have.has('latex')) alters.push("ADD COLUMN latex TEXT NOT NULL");
    if (!have.has('descripcion')) alters.push("ADD COLUMN descripcion TEXT NULL");
    if (!have.has('tiene_placeholders')) alters.push("ADD COLUMN tiene_placeholders TINYINT(1) NOT NULL DEFAULT 0");
    if (!have.has('activo')) alters.push("ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1");
    if (!have.has('orden')) alters.push("ADD COLUMN orden INT NOT NULL DEFAULT 0");
    if (!have.has('created_at')) alters.push("ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
    if (!have.has('updated_at')) alters.push("ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    if (alters.length) {
      await db.query(`ALTER TABLE formulas ${alters.join(', ')}`);
    }
  } catch {}
  __inited = true;
}

// Table: formulas
// Columns:
// id (PK), categoria (VARCHAR), nombre (VARCHAR), latex (TEXT), descripcion (TEXT),
// tiene_placeholders (TINYINT 0/1), activo (TINYINT 0/1), orden (INT),
// created_at, updated_at

export const getAllFormulas = async (activoOnly = true) => {
  await ensureTable();
  const whereClause = activoOnly ? 'WHERE activo = 1' : '';
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas
     ${whereClause}
     ORDER BY categoria ASC, orden ASC, id ASC`
  );
  return rows;
};

export const getFormulasByCategory = async (categoria, activoOnly = true) => {
  await ensureTable();
  const whereClause = activoOnly ? 'AND activo = 1' : '';
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas
     WHERE categoria = ? ${whereClause}
     ORDER BY orden ASC, id ASC`,
    [categoria]
  );
  return rows;
};

export const getCategories = async (activoOnly = true) => {
  await ensureTable();
  const whereClause = activoOnly ? 'WHERE activo = 1' : '';
  const [rows] = await db.query(
    `SELECT DISTINCT categoria
     FROM formulas
     ${whereClause}
     ORDER BY categoria ASC`
  );
  return rows.map(r => r.categoria);
};

export const getFormulaById = async (id) => {
  await ensureTable();
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const createFormula = async (data) => {
  await ensureTable();
  const {
    categoria,
    nombre = null,
    latex,
    descripcion = null,
    tiene_placeholders = false,
    activo = true,
    orden = 0,
  } = data || {};

  if (!categoria || !latex) {
    throw new Error('categoria y latex son obligatorios');
  }

  const tienePlaceholders = latex.includes('\\square') ? 1 : 0;

  const [result] = await db.query(
    `INSERT INTO formulas
      (categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [categoria, nombre, latex, descripcion, tienePlaceholders, activo ? 1 : 0, orden]
  );
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
};

export const updateFormula = async (id, updates) => {
  await ensureTable();
  const allowed = ['categoria', 'nombre', 'latex', 'descripcion', 'tiene_placeholders', 'activo', 'orden'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = ?`);
      let val = updates[key];
      if (key === 'tiene_placeholders' || key === 'activo') {
        val = updates[key] ? 1 : 0;
      }
      // Si se actualiza latex, recalcular tiene_placeholders
      if (key === 'latex') {
        const tienePlaceholders = val.includes('\\square') ? 1 : 0;
        fields.push('tiene_placeholders = ?');
        values.push(val, tienePlaceholders);
        continue;
      }
      values.push(val);
    }
  }
  if (fields.length === 0) return null;

  values.push(id);
  await db.query(
    `UPDATE formulas SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const deleteFormula = async (id) => {
  await ensureTable();
  const [result] = await db.query(`DELETE FROM formulas WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const bulkCreateFormulas = async (formulas) => {
  await ensureTable();
  if (!Array.isArray(formulas) || formulas.length === 0) {
    return [];
  }

  const values = formulas.map(f => {
    const tienePlaceholders = f.latex && f.latex.includes('\\square') ? 1 : 0;
    return [
      f.categoria || 'Sin categoría',
      f.nombre || null,
      f.latex,
      f.descripcion || null,
      tienePlaceholders,
      f.activo !== false ? 1 : 0,
      f.orden || 0
    ];
  });

  const placeholders = formulas.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
  const [result] = await db.query(
    `INSERT INTO formulas (categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden)
     VALUES ${placeholders}`,
    values.flat()
  );

  // Retornar las fórmulas creadas
  const [rows] = await db.query(
    `SELECT id, categoria, nombre, latex, descripcion, tiene_placeholders, activo, orden, created_at, updated_at
     FROM formulas
     WHERE id >= ? AND id < ?
     ORDER BY id ASC`,
    [result.insertId, result.insertId + result.affectedRows]
  );
  return rows;
};

// Initialize table on module load (best-effort)
ensureTable().catch(() => {});

