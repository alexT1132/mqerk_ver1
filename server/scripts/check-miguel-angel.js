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

async function checkMiguelAngel() {
  let connection;
  try {
    console.log('🔌 Conectando a la base de datos...');
    console.log(`   Host: ${DB_HOST}, User: ${DB_USER}, Database: ${DB_NAME}, Password: ${DB_PASSWORD ? '***' : '(vacía)'}`);
    const connectionConfig = {
      host: DB_HOST || '127.0.0.1',
      port: Number(DB_PORT) || 3306,
      user: DB_USER || 'root',
      database: DB_NAME || 'mqerkacademy',
    };
    // Solo agregar password si existe y no está vacía
    if (DB_PASSWORD && DB_PASSWORD.trim() !== '') {
      connectionConfig.password = DB_PASSWORD;
    } else {
      // Forzar password a undefined si está vacía
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
      console.log('\n🔍 Buscando todos los alumnos para referencia...\n');
      const [allStudents] = await connection.query(
        `SELECT id, nombre, apellidos, email, folio, plan, verificacion, created_at 
         FROM estudiantes 
         LIMIT 10`
      );
      console.log('Alumnos encontrados:');
      allStudents.forEach(s => {
        console.log(`  - ID: ${s.id}, Nombre: ${s.nombre} ${s.apellidos}, Folio: ${s.folio}, Plan: ${s.plan || s.plan_type || 'N/A'}`);
      });
      return;
    }

    const student = students[0];
    console.log('✅ Alumno encontrado:');
    console.log(`   ID: ${student.id}`);
    console.log(`   Nombre: ${student.nombre} ${student.apellidos}`);
    console.log(`   Email: ${student.email || 'N/A'}`);
    console.log(`   Folio: ${student.folio || 'N/A'}`);
    console.log(`   Plan: ${student.plan || 'N/A'}`);
    console.log(`   Verificación: ${student.verificacion || 0}`);
    console.log(`   Fecha de creación: ${student.created_at || 'N/A'}`);
    console.log('');

    // Buscar comprobantes del alumno
    console.log('💰 Buscando comprobantes del alumno...\n');
    const [receipts] = await connection.query(
      `SELECT id, id_estudiante, importe, metodo, motivo_rechazo, created_at, updated_at
       FROM comprobantes 
       WHERE id_estudiante = ?
       ORDER BY created_at ASC`,
      [student.id]
    );

    console.log(`📊 Total de comprobantes: ${receipts.length}`);
    
    // Buscar también en la tabla de ingresos si existe
    console.log('\n💰 Buscando ingresos registrados...\n');
    let ingresos = [];
    try {
      const [ingresosRows] = await connection.query(
        `SELECT id, estudiante_id, importe, metodo, estatus, fecha, created_at
         FROM ingresos 
         WHERE estudiante_id = ?
         ORDER BY fecha ASC`,
        [student.id]
      );
      ingresos = ingresosRows;
      console.log(`📊 Total de ingresos registrados: ${ingresos.length}`);
      if (ingresos.length > 0) {
        ingresos.forEach((ing, idx) => {
          console.log(`\n   Ingreso #${idx + 1}:`);
          console.log(`     ID: ${ing.id}`);
          console.log(`     Importe: $${ing.importe || 0}`);
          console.log(`     Método: ${ing.metodo || 'N/A'}`);
          console.log(`     Estatus: ${ing.estatus || 'N/A'}`);
          console.log(`     Fecha: ${ing.fecha || 'N/A'}`);
        });
      }
    } catch (err) {
      console.log('   ⚠️  No se pudo consultar la tabla ingresos (puede que no exista)');
    }
    if (receipts.length > 0) {
      console.log('\n📋 Detalles de comprobantes:');
      receipts.forEach((r, idx) => {
        const isApproved = r.importe && !r.motivo_rechazo;
        console.log(`\n   Comprobante #${idx + 1}:`);
        console.log(`     ID: ${r.id}`);
        console.log(`     Importe: $${r.importe || 0}`);
        console.log(`     Método: ${r.metodo || 'N/A'}`);
        console.log(`     Estado: ${isApproved ? '✅ APROBADO' : r.motivo_rechazo ? '❌ RECHAZADO: ' + r.motivo_rechazo : '⏳ PENDIENTE'}`);
        console.log(`     Creado: ${r.created_at}`);
        console.log(`     Actualizado: ${r.updated_at}`);
      });
    } else {
      console.log('   ⚠️  No se encontraron comprobantes');
    }

    // Calcular approvedPaymentsCount
    const approvedCount = receipts.filter(r => r.importe && !r.motivo_rechazo).length;
    console.log(`\n✅ Comprobantes aprobados: ${approvedCount}`);

    // Buscar fecha de activación del plan (si existe en localStorage o en alguna tabla)
    console.log('\n📅 Información de fechas:');
    console.log(`   Fecha de creación (usada como fecha de activación por defecto): ${student.created_at}`);
    
    // Calcular fechas de pagos esperadas
    const activationDate = new Date(student.created_at);
    const planType = (student.plan || 'mensual').toLowerCase();
    const totalPayments = planType === 'premium' ? 1 : (planType === 'start' ? 2 : 8);
    
    console.log(`\n📆 Calendario de pagos esperado (Plan: ${planType}, Total: ${totalPayments} pagos):`);
    for (let i = 0; i < totalPayments; i++) {
      const paymentDate = new Date(activationDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0);
      const dueDay = Math.min(24, lastDayOfMonth.getDate());
      const dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), dueDay);
      const isPaid = i === 0 || (i <= approvedCount);
      console.log(`   Pago #${i + 1}: ${dueDate.toLocaleDateString('es-MX')} - ${isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}`);
    }

    console.log('\n📝 Resumen:');
    console.log(`   - Plan: ${planType}`);
    console.log(`   - Total de pagos: ${totalPayments}`);
    console.log(`   - Primer pago (inscripción): ✅ SIEMPRE PAGADO`);
    console.log(`   - Comprobantes aprobados: ${approvedCount}`);
    console.log(`   - Pagos adicionales pagados: ${Math.max(0, approvedCount)}`);
    console.log(`   - Estado esperado del Pago #1: ✅ PAGADO (inscripción)`);
    console.log(`   - Estado esperado del Pago #2: ${approvedCount >= 1 ? '✅ PAGADO' : '⏳ PENDIENTE'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

checkMiguelAngel();

