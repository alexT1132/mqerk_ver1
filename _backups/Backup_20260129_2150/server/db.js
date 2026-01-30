import mysql from 'mysql2/promise';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'mqerkacademy',
} = process.env;

const db = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 10000,
});

export async function pingDb() {
  let conn;
  try {
    // Timeout de 5 segundos para obtener conexión
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB connection timeout')), 5000)
    );
    
    conn = await Promise.race([
      db.getConnection(),
      timeoutPromise
    ]);
    
    // Timeout de 3 segundos para la query
    const queryTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB query timeout')), 3000)
    );
    
    await Promise.race([
      conn.query('SELECT 1'),
      queryTimeoutPromise
    ]);
  } catch (e) {
    // Re-lanzar el error para que el health controller lo maneje
    throw e;
  } finally {
    // Asegurar que la conexión se libera siempre
    if (conn) {
      try {
        conn.release();
      } catch (releaseErr) {
        console.error('[pingDb] Error releasing connection:', releaseErr?.message || releaseErr);
      }
    }
  }
}

// Export nombrado 'pool' para consumidores que esperan { pool }
export const pool = db;
export default db;
