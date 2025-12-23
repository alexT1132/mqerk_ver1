import db from '../server/db.js';
import fs from 'fs';

async function checkQuizzes() {
    try {
        const [rows] = await db.query(`
      SELECT id, titulo, publicado, visible_desde, visible_hasta, id_area, activo, NOW() as server_time 
      FROM quizzes 
      ORDER BY id DESC 
      LIMIT 10
    `);

        const output = {
            server_time: rows[0]?.server_time,
            quizzes: rows
        };

        fs.writeFileSync('debug_output.json', JSON.stringify(output, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkQuizzes();
