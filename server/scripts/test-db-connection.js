import dotenv from 'dotenv';
dotenv.config({ override: true });
import mysql from 'mysql2/promise';

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'mqerkacademy',
} = process.env;

console.log('🔍 Verificando conexión a MySQL...\n');
console.log('Configuración:');
console.log(`  Host: ${DB_HOST}`);
console.log(`  Puerto: ${DB_PORT}`);
console.log(`  Usuario: ${DB_USER}`);
console.log(`  Contraseña: ${DB_PASSWORD ? '***' : '(vacía)'}`);
console.log(`  Base de datos: ${DB_NAME}\n`);

async function testConnection() {
  try {
    console.log('⏳ Intentando conectar...');
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 5000,
    });

    console.log('✅ Conexión exitosa a MySQL!\n');

    // Verificar si la base de datos existe
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [DB_NAME]);
    if (databases.length > 0) {
      console.log(`✅ La base de datos "${DB_NAME}" existe.\n`);
      
      // Intentar usar la base de datos
      await connection.query(`USE ${DB_NAME}`);
      console.log(`✅ Acceso a la base de datos "${DB_NAME}" exitoso.\n`);
      
      // Verificar algunas tablas
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`✅ Encontradas ${tables.length} tabla(s) en la base de datos.\n`);
    } else {
      console.log(`⚠️  La base de datos "${DB_NAME}" NO existe.`);
      console.log(`   Necesitas crearla con: CREATE DATABASE ${DB_NAME};\n`);
    }

    await connection.end();
    console.log('✅ Prueba de conexión completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error de conexión:\n');
    
    if (error.code === 'ETIMEDOUT') {
      console.error('   Error: TIMEOUT - No se pudo conectar al servidor MySQL.');
      console.error('   Posibles causas:');
      console.error('   1. MySQL no está corriendo');
      console.error('   2. El puerto está bloqueado por firewall');
      console.error('   3. El host es incorrecto');
      console.error('\n   Soluciones:');
      console.error('   - Verifica que MySQL esté corriendo:');
      console.error('     Windows: Abre "Servicios" y busca "MySQL"');
      console.error('     Linux/Mac: sudo systemctl status mysql');
      console.error('   - Verifica que el puerto 3306 esté abierto');
      console.error('   - Verifica las credenciales en el archivo .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Error: CONEXIÓN RECHAZADA - El servidor MySQL rechazó la conexión.');
      console.error('   Posibles causas:');
      console.error('   1. MySQL no está corriendo en el puerto especificado');
      console.error('   2. El puerto es incorrecto');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Error: ACCESO DENEGADO - Usuario o contraseña incorrectos.');
      console.error('   Verifica las credenciales en el archivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   Error: La base de datos "${DB_NAME}" no existe.`);
      console.error(`   Créala con: CREATE DATABASE ${DB_NAME};`);
    } else {
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}`);
    }
    
    console.error('\n');
    process.exit(1);
  }
}

testConnection();

