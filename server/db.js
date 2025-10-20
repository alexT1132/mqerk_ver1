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
  const conn = await db.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}

// Export nombrado 'pool' para consumidores que esperan { pool }
export const pool = db;
export default db;
