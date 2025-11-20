import db from '../db.js';

async function check() {
  try {
    console.log('Verificando quiz con filtros de visibilidad:');
    const [rows] = await db.query(`
      SELECT id, titulo, publicado, activo, id_area, visible_desde, visible_hasta 
      FROM quizzes 
      WHERE activo = 1 
        AND publicado = 1 
        AND (visible_desde IS NULL OR visible_desde <= NOW()) 
        AND (visible_hasta IS NULL OR visible_hasta >= NOW()) 
        AND id_area = 2
    `);
    console.log('Quizzes visibles para estudiantes (área 2):', rows.length);
    rows.forEach(q => console.log(`  - ID ${q.id}: ${q.titulo}`));
    
    // Verificar también sin filtro de área
    const [allRows] = await db.query(`
      SELECT id, titulo, publicado, activo, id_area 
      FROM quizzes 
      WHERE activo = 1 AND publicado = 1
    `);
    console.log('\nTodos los quizzes publicados:', allRows.length);
    allRows.forEach(q => console.log(`  - ID ${q.id}: ${q.titulo} (área: ${q.id_area})`));
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();

