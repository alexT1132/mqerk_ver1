import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const migrationFile = path.join(__dirname, '..', 'migrations', '20251118_add_respuesta_corta_to_quizzes_preguntas.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    const statements = sql
      .split(/;\s*\n/g)
      .map(s => s.trim())
      .filter(Boolean);
    
    console.log(`Applying migration: 20251118_add_respuesta_corta_to_quizzes_preguntas.sql (${statements.length} statement(s))`);
    
    for (const stmt of statements) {
      try {
        await db.query(stmt);
        console.log('✓ Migration applied successfully');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
          console.log(`  Skip benign error ${err.code}: ${err.message.split('\n')[0]}`);
          continue;
        }
        // Si el error es que el valor ya existe en el ENUM, también es benigno
        if (err.message && err.message.includes('Duplicate value')) {
          console.log(`  Skip: El valor 'respuesta_corta' ya existe en el ENUM`);
          continue;
        }
        throw err;
      }
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();

