import db from '../db.js';

/**
 * Modelo para documentos del asesor
 * Almacena los documentos que el asesor debe subir (INE, CV, contratos, etc.)
 */

async function ensureTable() {
  try {
    // Crear la tabla sin foreign key para permitir id_asesor NULL (para lineamientos globales)
    const sql = `
      CREATE TABLE IF NOT EXISTS documentos_asesor (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_asesor INT NULL,
        tipo_seccion ENUM('documento', 'contrato', 'lineamiento') NOT NULL DEFAULT 'documento',
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NULL,
        archivo_path VARCHAR(500) NULL,
        estado ENUM('pending', 'done', 'rechazado') NOT NULL DEFAULT 'pending',
        observaciones TEXT NULL,
        fecha_vencimiento DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_asesor (id_asesor),
        INDEX idx_tipo_seccion (tipo_seccion),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.query(sql);
    
    // Asegurar que la columna id_asesor permita NULL (por si la tabla ya existía con NOT NULL)
    try {
      await db.query(`
        ALTER TABLE documentos_asesor 
        MODIFY COLUMN id_asesor INT NULL
      `);
    } catch (err) {
      // Ignorar errores - la columna ya puede ser NULL o no existe
    }
  } catch (err) {
    console.error('[DB] Error en ensureTable de documentos_asesor:', err?.code || err?.message || err);
    // No re-lanzar - permitir que el servidor continúe
  }
}

// Inicializar tabla al importar (no bloquear el servidor si falla)
ensureTable().catch(err => {
  console.error('[DB] Error asegurando tabla documentos_asesor:', err?.code || err?.message || err);
  if (err?.code === 'ETIMEDOUT') {
    console.error('[DB] ⚠️  No se puede conectar a MySQL. Verifica que el servidor MySQL esté corriendo.');
  }
  // No re-lanzar el error para que el servidor pueda iniciar
});

// Exportar ensureTable para que pueda ser llamado desde el controlador
export { ensureTable };

/**
 * Obtener todos los documentos de un asesor
 */
export async function getDocumentosByAsesor(id_asesor) {
  try {
    await ensureTable();
  } catch (err) {
    console.warn('[Documentos] Error en ensureTable:', err?.message);
  }
  const [rows] = await db.query(
    `SELECT * FROM documentos_asesor 
     WHERE id_asesor = ? 
     ORDER BY tipo_seccion, nombre`,
    [id_asesor]
  );
  return rows || [];
}

/**
 * Obtener un documento por ID
 */
export async function getDocumentoById(id) {
  await ensureTable();
  const [rows] = await db.query(
    'SELECT * FROM documentos_asesor WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * Crear un nuevo documento
 */
export async function createDocumento(data) {
  await ensureTable();
  const {
    id_asesor,
    tipo_seccion = 'documento',
    nombre,
    descripcion = null,
    archivo_path = null,
    estado = 'pending',
    observaciones = null,
    fecha_vencimiento = null
  } = data;

  const [result] = await db.query(
    `INSERT INTO documentos_asesor 
     (id_asesor, tipo_seccion, nombre, descripcion, archivo_path, estado, observaciones, fecha_vencimiento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_asesor, tipo_seccion, nombre, descripcion, archivo_path, estado, observaciones, fecha_vencimiento]
  );

  return getDocumentoById(result.insertId);
}

/**
 * Actualizar un documento
 */
export async function updateDocumento(id, data) {
  await ensureTable();
  const {
    nombre,
    descripcion,
    archivo_path,
    estado,
    observaciones,
    fecha_vencimiento
  } = data;

  const updates = [];
  const values = [];

  if (nombre !== undefined) {
    updates.push('nombre = ?');
    values.push(nombre);
  }
  if (descripcion !== undefined) {
    updates.push('descripcion = ?');
    values.push(descripcion);
  }
  if (archivo_path !== undefined) {
    updates.push('archivo_path = ?');
    values.push(archivo_path);
  }
  if (estado !== undefined) {
    updates.push('estado = ?');
    values.push(estado);
  }
  if (observaciones !== undefined) {
    updates.push('observaciones = ?');
    values.push(observaciones);
  }
  if (fecha_vencimiento !== undefined) {
    updates.push('fecha_vencimiento = ?');
    values.push(fecha_vencimiento);
  }

  if (updates.length === 0) {
    return getDocumentoById(id);
  }

  values.push(id);
  await db.query(
    `UPDATE documentos_asesor SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getDocumentoById(id);
}

/**
 * Eliminar un documento
 */
export async function deleteDocumento(id) {
  await ensureTable();
  await db.query('DELETE FROM documentos_asesor WHERE id = ?', [id]);
  return { success: true };
}

/**
 * Inicializar documentos por defecto para un asesor
 * NOTA: Los lineamientos NO se inicializan aquí, son documentos globales de la empresa
 */
export async function inicializarDocumentosPorDefecto(id_asesor) {
  await ensureTable();
  
  // Verificar si ya tiene documentos (solo documentos y contratos, no lineamientos)
  const [existing] = await db.query(
    'SELECT COUNT(*) as count FROM documentos_asesor WHERE id_asesor = ? AND tipo_seccion != "lineamiento"',
    [id_asesor]
  );
  
  if (existing[0]?.count > 0) {
    return; // Ya tiene documentos, no inicializar
  }

  // Documentos requeridos (solo documentos personales y contratos)
  const documentos = [
    { tipo_seccion: 'documento', nombre: 'INE ambos lados', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Comprobante de domicilio', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'CIF SAT', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Título académico', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Cédula Profesional', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Certificaciones', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'CV actualizado', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Fotografía profesional', estado: 'pending' },
    { tipo_seccion: 'documento', nombre: 'Carta de recomendación', estado: 'pending' },
    { tipo_seccion: 'contrato', nombre: 'Contrato de prestación de servicios', estado: 'pending' },
  ];

  for (const doc of documentos) {
    await createDocumento({
      id_asesor,
      ...doc
    });
  }
}

/**
 * Obtener lineamientos globales (disponibles para todos los asesores)
 * Los lineamientos globales tienen id_asesor = NULL
 */
export async function getLineamientosGlobales() {
  try {
    await ensureTable();
  } catch (err) {
    console.warn('[Documentos] Error en ensureTable:', err?.message);
  }
  const [rows] = await db.query(
    `SELECT * FROM documentos_asesor 
     WHERE tipo_seccion = 'lineamiento' AND id_asesor IS NULL
     ORDER BY nombre`,
    []
  );
  return rows || [];
}

/**
 * Crear o actualizar un lineamiento global (solo para admin)
 */
export async function createOrUpdateLineamientoGlobal(data) {
  await ensureTable();
  const {
    nombre,
    descripcion = null,
    archivo_path = null,
    estado = 'done' // Los lineamientos siempre están disponibles
  } = data;

  // Verificar si ya existe
  const [existing] = await db.query(
    'SELECT id FROM documentos_asesor WHERE tipo_seccion = "lineamiento" AND nombre = ? AND id_asesor IS NULL LIMIT 1',
    [nombre]
  );

  if (existing.length > 0) {
    // Actualizar existente
    return await updateDocumento(existing[0].id, {
      descripcion,
      archivo_path,
      estado
    });
  } else {
    // Crear nuevo (id_asesor = NULL indica que es global)
    const [result] = await db.query(
      `INSERT INTO documentos_asesor 
       (id_asesor, tipo_seccion, nombre, descripcion, archivo_path, estado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [null, 'lineamiento', nombre, descripcion, archivo_path, estado]
    );
    return getDocumentoById(result.insertId);
  }
}

