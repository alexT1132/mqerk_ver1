import db from '../db.js';

async function check() {
  try {
    // Verificar quizzes en la tabla quizzes
    const [quizzes] = await db.query('SELECT id, titulo, publicado, activo, id_area FROM quizzes ORDER BY id DESC');
    console.log('=== Quizzes en tabla quizzes ===');
    console.log('Total:', quizzes.length);
    quizzes.forEach(q => {
      console.log(`  ID ${q.id}: ${q.titulo}`);
      console.log(`    publicado: ${q.publicado}, activo: ${q.activo}, área: ${q.id_area}`);
    });
    
    // Verificar quizzes en actividades (legacy)
    const [actividades] = await db.query("SELECT id, titulo, tipo, publicado, activo, id_area FROM actividades WHERE tipo = 'quiz' ORDER BY id DESC LIMIT 10");
    console.log('\n=== Quizzes en tabla actividades (legacy) ===');
    console.log('Total:', actividades.length);
    actividades.forEach(a => {
      console.log(`  ID ${a.id}: ${a.titulo}`);
      console.log(`    publicado: ${a.publicado}, activo: ${a.activo}, área: ${a.id_area}`);
    });
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();

