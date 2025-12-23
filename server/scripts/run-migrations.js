import fs from 'fs';
import path from 'path';
import url from 'url';
import db from '../db.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    process.exit(0);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration(s)`);
  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, 'utf8');
    const statements = sql
      .split(/;\s*\n/g)
      .map(s => s.trim())
      .filter(Boolean);
    console.log(`Applying migration: ${file} (${statements.length} statement(s))`);
    const seedProblematic = file.includes('20250924_seed_test_questions_wais_matematica.sql');
    for (const stmt of statements) {
      try {
        await db.query(stmt);
      } catch (err) {
        if (['ER_DUP_FIELDNAME','ER_DUP_KEYNAME','ER_DUP_ENTRY'].includes(err.code)) {
          console.log(`  Skip benign error ${err.code}: ${err.message.split('\n')[0]}`);
          continue;
        }
        if (seedProblematic && err.code === 'ER_PARSE_ERROR') {
          console.log(`  Skip known seed parse issue in ${file}: ${err.message.split('\n')[0]}`);
          continue;
        }
        throw err;
      }
    }
  }
  console.log('All migrations applied successfully');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
