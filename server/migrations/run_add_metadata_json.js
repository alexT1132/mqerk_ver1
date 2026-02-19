/**
 * Ejecuta la migración add_metadata_json: añade la columna metadata_json
 * a quizzes_preguntas, quizzes_preguntas_opciones, simulaciones_preguntas y simulaciones_preguntas_opciones
 * solo si no existe. Seguro ejecutar varias veces.
 *
 * Uso (desde la raíz del proyecto):
 *   node server/migrations/run_add_metadata_json.js
 * O desde server/:
 *   node migrations/run_add_metadata_json.js
 */
import db from '../db.js';

const TABLES = [
  'quizzes_preguntas',
  'quizzes_preguntas_opciones',
  'simulaciones_preguntas',
  'simulaciones_preguntas_opciones'
];

async function columnExists(conn, tableName) {
  const [rows] = await conn.query(
    `SELECT 1 FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'metadata_json'`,
    [tableName]
  );
  return rows.length > 0;
}

async function run() {
  let conn;
  try {
    conn = await db.getConnection();
    for (const table of TABLES) {
      const exists = await columnExists(conn, table);
      if (exists) {
        console.log(`[OK] ${table} ya tiene metadata_json, se omite.`);
      } else {
        await conn.query(
          `ALTER TABLE ?? ADD COLUMN metadata_json TEXT NULL COMMENT 'JSON con imagen y otros metadatos'`,
          [table]
        );
        console.log(`[OK] Columna metadata_json añadida a ${table}.`);
      }
    }
    console.log('Migración completada.');
  } catch (e) {
    console.error('Error en migración:', e.message);
    process.exitCode = 1;
  } finally {
    if (conn) conn.release();
    process.exit(process.exitCode ?? 0);
  }
}

run();
