import db from '../db.js';

// Asegurar que la tabla de asistencias existe
let __inited = false;
async function ensureTable() {
  if (__inited) return;
  __inited = true;
  const sql = `
    CREATE TABLE IF NOT EXISTS asistencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_estudiante INT NOT NULL,
      id_asesor INT NOT NULL,
      fecha DATE NOT NULL,
      tipo ENUM('clase', 'tarea', 'simulacion') NOT NULL DEFAULT 'clase',
      asistio TINYINT(1) NOT NULL DEFAULT 1,
      observaciones TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_estudiante (id_estudiante),
      INDEX idx_asesor (id_asesor),
      INDEX idx_fecha (fecha),
      INDEX idx_estudiante_fecha (id_estudiante, fecha),
      UNIQUE KEY uniq_estudiante_fecha_tipo (id_estudiante, fecha, tipo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await db.query(sql);
}

// Inicializar tabla al importar
ensureTable().catch((err) => {
  console.error('Error inicializando tabla asistencias:', err);
});

/**
 * Registrar asistencia de un estudiante
 */
export async function registrarAsistencia(data) {
  await ensureTable();
  const { id_estudiante, id_asesor, fecha, tipo = 'clase', asistio = true, observaciones = null } = data;
  
  const sql = `
    INSERT INTO asistencias (id_estudiante, id_asesor, fecha, tipo, asistio, observaciones)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      asistio = VALUES(asistio),
      observaciones = VALUES(observaciones),
      updated_at = CURRENT_TIMESTAMP
  `;
  
  const [result] = await db.query(sql, [id_estudiante, id_asesor, fecha, tipo, asistio ? 1 : 0, observaciones]);
  return result.insertId || result.affectedRows;
}

/**
 * Registrar múltiples asistencias (para una clase con varios estudiantes)
 */
export async function registrarAsistenciasMasivas(data) {
  await ensureTable();
  const { id_asesor, fecha, tipo = 'clase', asistencias } = data; // asistencias: [{ id_estudiante, asistio, observaciones }]
  
  if (!Array.isArray(asistencias) || asistencias.length === 0) {
    throw new Error('Debe proporcionar al menos una asistencia');
  }
  
  const values = asistencias.map(a => [
    a.id_estudiante,
    id_asesor,
    fecha,
    tipo,
    a.asistio ? 1 : 0,
    a.observaciones || null
  ]);
  
  const sql = `
    INSERT INTO asistencias (id_estudiante, id_asesor, fecha, tipo, asistio, observaciones)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      asistio = VALUES(asistio),
      observaciones = VALUES(observaciones),
      updated_at = CURRENT_TIMESTAMP
  `;
  
  const [result] = await db.query(sql, [values]);
  return result.affectedRows;
}

/**
 * Obtener asistencias de un estudiante
 */
export async function getAsistenciasEstudiante(id_estudiante, options = {}) {
  await ensureTable();
  const { desde, hasta, tipo } = options;
  
  let sql = `
    SELECT a.*, 
           e.nombre, e.apellidos, e.grupo,
           u.usuario as asesor_nombre
    FROM asistencias a
    INNER JOIN estudiantes e ON a.id_estudiante = e.id
    LEFT JOIN usuarios u ON a.id_asesor = u.id
    WHERE a.id_estudiante = ?
  `;
  
  const params = [id_estudiante];
  
  if (desde) {
    sql += ' AND a.fecha >= ?';
    params.push(desde);
  }
  
  if (hasta) {
    sql += ' AND a.fecha <= ?';
    params.push(hasta);
  }
  
  if (tipo) {
    sql += ' AND a.tipo = ?';
    params.push(tipo);
  }
  
  sql += ' ORDER BY a.fecha DESC, a.tipo';
  
  const [rows] = await db.query(sql, params);
  return rows;
}

/**
 * Obtener asistencias de estudiantes de un asesor
 */
export async function getAsistenciasPorAsesor(id_asesor, options = {}) {
  await ensureTable();
  const { desde, hasta, tipo, grupo, id_estudiante } = options;
  
  let sql = `
    SELECT a.*, 
           e.nombre, e.apellidos, e.grupo,
           u.usuario as asesor_nombre
    FROM asistencias a
    INNER JOIN estudiantes e ON a.id_estudiante = e.id
    LEFT JOIN usuarios u ON a.id_asesor = u.id
    WHERE a.id_asesor = ?
  `;
  
  const params = [id_asesor];
  
  if (id_estudiante) {
    sql += ' AND a.id_estudiante = ?';
    params.push(id_estudiante);
  }
  
  if (grupo) {
    sql += ' AND e.grupo = ?';
    params.push(grupo);
  }
  
  if (desde) {
    sql += ' AND a.fecha >= ?';
    params.push(desde);
  }
  
  if (hasta) {
    sql += ' AND a.fecha <= ?';
    params.push(hasta);
  }
  
  if (tipo) {
    sql += ' AND a.tipo = ?';
    params.push(tipo);
  }
  
  sql += ' ORDER BY a.fecha DESC, e.grupo, e.nombre, e.apellidos';
  
  const [rows] = await db.query(sql, params);
  return rows;
}

/**
 * Obtener resumen de asistencia de un estudiante
 */
export async function getResumenAsistenciaEstudiante(id_estudiante, options = {}) {
  await ensureTable();
  const { desde, hasta } = options;
  
  let sql = `
    SELECT 
      tipo,
      COUNT(*) as total,
      SUM(asistio) as asistidas,
      ROUND(SUM(asistio) * 100.0 / COUNT(*), 2) as porcentaje
    FROM asistencias
    WHERE id_estudiante = ?
  `;
  
  const params = [id_estudiante];
  
  if (desde) {
    sql += ' AND fecha >= ?';
    params.push(desde);
  }
  
  if (hasta) {
    sql += ' AND fecha <= ?';
    params.push(hasta);
  }
  
  sql += ' GROUP BY tipo';
  
  const [rows] = await db.query(sql, params);
  
  // Calcular porcentaje general
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const asistidas = rows.reduce((sum, r) => sum + r.asistidas, 0);
  const porcentajeGeneral = total > 0 ? (asistidas / total) * 100 : 0;
  
  return {
    porTipo: rows,
    general: {
      total,
      asistidas,
      faltas: total - asistidas,
      porcentaje: porcentajeGeneral
    }
  };
}

/**
 * Eliminar asistencia
 */
export async function eliminarAsistencia(id, id_asesor) {
  await ensureTable();
  const sql = 'DELETE FROM asistencias WHERE id = ? AND id_asesor = ?';
  const [result] = await db.query(sql, [id, id_asesor]);
  return result.affectedRows > 0;
}

