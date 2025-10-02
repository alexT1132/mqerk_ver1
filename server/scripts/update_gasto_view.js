import db from '../db.js';

async function updateView() {
  try {
    // Drop if exists
    await db.query('DROP VIEW IF EXISTS vw_gasto_mensual');
    
    // Create with filters for Pagado using UNION ALL + GROUP BY
    const createSQL = `
      CREATE VIEW vw_gasto_mensual AS
      SELECT mes, SUM(total_gasto) AS total_gasto
      FROM (
        SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes, importe AS total_gasto
        FROM gastos_fijos
        WHERE estatus = 'Pagado'
        UNION ALL
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, importe AS total_gasto
        FROM gastos_variables
        WHERE estatus = 'Pagado'
      ) all_gastos
      GROUP BY mes
      ORDER BY mes DESC
    `;
    
    await db.query(createSQL);
    
    console.log('View vw_gasto_mensual updated successfully with Pagado filter.');
    
    // Test for September 2025 as per screenshot
    const [rows] = await db.query('SELECT * FROM vw_gasto_mensual WHERE mes = "2025-09"');
    console.log('Test for 2025-09:', rows);
    
  } catch (err) {
    console.error('Error updating view:', err.message);
  } finally {
    await db.end();
  }
}

updateView().catch(console.error);