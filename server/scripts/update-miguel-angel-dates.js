import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'mqerkacademy',
} = process.env;

async function updateMiguelAngelDates() {
  let connection;
  try {
    console.log('🔌 Conectando a la base de datos...');
    const connectionConfig = {
      host: DB_HOST || '127.0.0.1',
      port: Number(DB_PORT) || 3306,
      user: DB_USER || 'root',
      database: DB_NAME || 'mqerkacademy',
    };
    if (DB_PASSWORD && DB_PASSWORD.trim() !== '') {
      connectionConfig.password = DB_PASSWORD;
    } else {
      connectionConfig.password = undefined;
    }
    connection = await mysql.createConnection(connectionConfig);

    console.log('✅ Conectado a la base de datos\n');

    // Buscar al alumno Miguel Angel
    console.log('📋 Buscando al alumno "Miguel Angel"...\n');
    const [students] = await connection.query(
      `SELECT id, nombre, apellidos, email, folio, plan, verificacion, created_at 
       FROM estudiantes 
       WHERE (nombre LIKE '%Miguel%' AND apellidos LIKE '%Angel%') 
       OR (nombre LIKE '%miguel%' AND apellidos LIKE '%angel%')
       OR CONCAT(nombre, ' ', apellidos) LIKE '%Miguel%Angel%'`
    );

    if (students.length === 0) {
      console.log('❌ No se encontró al alumno Miguel Angel');
      return;
    }

    const student = students[0];
    console.log('✅ Alumno encontrado:');
    console.log(`   ID: ${student.id}`);
    console.log(`   Nombre: ${student.nombre} ${student.apellidos}`);
    console.log(`   Fecha de creación actual: ${student.created_at}\n`);

    // Cambiar la fecha de creación para que el segundo pago esté vencido (fuera de tolerancia)
    // Poner fecha de creación a 24/10/2025 para que:
    // - Pago #1: 24/10/2025 (pagado, tiene comprobante)
    // - Pago #2: 24/11/2025 (vencido, límite con tolerancia 27/11/2025, hoy 25/12 está fuera de tolerancia)
    const newCreatedAt = new Date('2025-10-24T00:00:00');
    
    console.log(`📅 Cambiando fecha de creación a: ${newCreatedAt.toLocaleString('es-MX')}\n`);
    
    await connection.query(
      `UPDATE estudiantes 
       SET created_at = ? 
       WHERE id = ?`,
      [newCreatedAt, student.id]
    );

    console.log('✅ Fecha de creación actualizada\n');

    // Verificar los nuevos cálculos de fechas
    console.log('📆 Nuevo calendario de pagos:');
    const activationDate = newCreatedAt;
    const planType = (student.plan || 'mensual').toLowerCase();
    const totalPayments = planType === 'premium' ? 1 : (planType === 'start' ? 2 : 8);
    
    for (let i = 0; i < totalPayments; i++) {
      const paymentDate = new Date(activationDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);
      const dueDay = Math.min(24, lastDayOfMonth.getDate());
      const dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), dueDay);
      const toleranceDays = (planType === 'mensual' || planType === 'start') ? 3 : 0;
      const limitDate = new Date(dueDate);
      limitDate.setDate(limitDate.getDate() + toleranceDays);
      const now = new Date();
      const isOverdue = now > limitDate;
      
      console.log(`   Pago #${i + 1}:`);
      console.log(`     Fecha de pago: ${dueDate.toLocaleDateString('es-MX')}`);
      console.log(`     Fecha límite (con tolerancia): ${limitDate.toLocaleDateString('es-MX')}`);
      console.log(`     Estado: ${isOverdue ? '❌ VENCIDO (fuera de tolerancia)' : '✅ Dentro de plazo'}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

updateMiguelAngelDates();

