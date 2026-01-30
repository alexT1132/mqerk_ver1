import db from "../db.js";

// Ensure that the EEAU table exists and is seeded with a default row
export async function ensureEEAUTable() {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS eeau (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE DEFAULT 'EEAU',
        titulo VARCHAR(180) NOT NULL DEFAULT 'Programa EEAU',
        asesor VARCHAR(180) NOT NULL DEFAULT 'Kelvin Valentin Ramirez',
        duracion_meses INT NOT NULL DEFAULT 8,
        imagen_portada VARCHAR(255) NULL,
        activo TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_eeau_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await db.query(createSql);
    // Seed default row when missing
    const [rows] = await db.query("SELECT id FROM eeau WHERE codigo = 'EEAU' LIMIT 1");
    if (!rows || rows.length === 0) {
      await db.query(
        "INSERT INTO eeau (codigo, titulo, asesor, duracion_meses, imagen_portada, activo) VALUES (?,?,?,?,?,1)",
        ['EEAU', 'Programa EEAU', 'Kelvin Valentin Ramirez', 8, '/public/eeau_portada.png']
      );
    }
  } catch (error) {
    // Detectar errores de conexión específicamente
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      const dbConfig = {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || '3306',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'mqerkacademy'
      };
      console.error('[eeau.model] Error de conexión a MySQL:', {
        message: `No se puede conectar a MySQL en ${dbConfig.host}:${dbConfig.port}`,
        suggestion: 'Verifica que MySQL esté corriendo y que las credenciales en .env sean correctas',
        config: { ...dbConfig, password: dbConfig.password ? '***' : '(vacía)' }
      });
    }
    throw error;
  }
}

export const getEEAUCourse = async () => {
  try {
    const [rows] = await db.query(
      "SELECT id, codigo, titulo, asesor, duracion_meses, imagen_portada, activo FROM eeau WHERE codigo = 'EEAU' AND activo = 1 LIMIT 1"
    );
    return rows?.[0] || null;
  } catch (e) {
    // Si es un error de conexión, no intentar crear la tabla
    if (e.code === 'ECONNREFUSED' || e.code === 'ETIMEDOUT') {
      throw e; // Re-lanzar el error de conexión sin intentar crear tabla
    }
    // If table is missing for some reason, try to create and seed it on the fly
    try {
      await ensureEEAUTable();
      const [rows] = await db.query(
        "SELECT id, codigo, titulo, asesor, duracion_meses, imagen_portada, activo FROM eeau WHERE codigo = 'EEAU' AND activo = 1 LIMIT 1"
      );
      return rows?.[0] || null;
    } catch (inner) {
      throw inner;
    }
  }
};
