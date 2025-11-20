import db from '../db.js';

async function check() {
  try {
    // Verificar si la tabla existe
    const [tables] = await db.query("SHOW TABLES LIKE 'quizzes'");
    console.log('Tabla quizzes existe:', tables.length > 0);
    
    if (tables.length > 0) {
      const [rows] = await db.query('SELECT COUNT(*) as total FROM quizzes');
      console.log('Total quizzes:', rows[0]?.total);
      
      const [rows2] = await db.query('SELECT id, titulo, publicado, activo, id_area FROM quizzes ORDER BY id DESC LIMIT 10');
      console.log('\nQuizzes:');
      rows2.forEach(q => {
        console.log(`  - ID: ${q.id}, Título: ${q.titulo}`);
        console.log(`    publicado: ${q.publicado}, activo: ${q.activo}, id_area: ${q.id_area}`);
      });
    }
    
    // Verificar quizzes en actividades
    const [rows3] = await db.query("SELECT COUNT(*) as total FROM actividades WHERE tipo = 'quiz'");
    console.log('\nQuizzes en actividades:', rows3[0]?.total);
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();

