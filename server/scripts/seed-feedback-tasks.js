import db from '../db.js';

async function seed() {
  try {
    const [existing] = await db.query('SELECT COUNT(*) AS cnt FROM feedback_tasks');
    console.log('Tareas existentes:', existing[0].cnt);
    // Tareas mínimas SOLO con nombre y due_date
    const base = Date.now();
    const rows = [
      { nombre: 'Operaciones Fundamentales', due: new Date(base + 3*86400000) },
      { nombre: 'Expresiones Algebraicas', due: new Date(base + 6*86400000) },
      { nombre: 'Geometría Básica', due: new Date(base + 9*86400000) }
    ];
    const sql = 'INSERT INTO feedback_tasks (nombre, puntos, due_date, activo) VALUES (?,?,?,1)';
    for (const r of rows) {
      const dueStr = r.due.toISOString().slice(0,19).replace('T',' ');
      const [res] = await db.query(sql, [r.nombre, 10, dueStr]);
      console.log(`Insertada (#${res.insertId}) -> ${r.nombre} | due_date=${dueStr}`);
    }
    const [after] = await db.query('SELECT COUNT(*) AS cnt FROM feedback_tasks');
    console.log('Total ahora:', after[0].cnt);
    console.log('Listando últimas 3:');
    const [last] = await db.query('SELECT id,nombre,due_date FROM feedback_tasks ORDER BY id DESC LIMIT 3');
    console.table(last);
  } catch (e) {
    console.error('Error en seed:', e);
  } finally {
    process.exit(0);
  }
}

seed();
