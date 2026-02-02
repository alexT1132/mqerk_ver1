
import db from './db.js';

async function run() {
    try {
        const [rows] = await db.query('SELECT id, nombre FROM areas');
        console.log('--- AREAS LIST ---');
        rows.forEach(r => console.log(`${r.id}: ${r.nombre}`));
        console.log('------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
