// Script temporal para insertar un preregistro y perfil de asesor de prueba
import db from '../db.js';

async function run(){
  try {
    // Insert preregistro básico
    const [prRes] = await db.query(`INSERT INTO asesor_preregistros (nombres, apellidos, correo, telefono, area, estudios, status) VALUES (?,?,?,?,?,?,?)`, [
      'Carlos','Pérez','carlos.perez@example.com','2871000000','Tecnologia','Licenciatura','pending'
    ]);
    const preregistroId = prRes.insertId;

    // Insert perfil completo mínimo (valores dummy obligatorios)
    const perfilData = {
      direccion:'Calle Falsa 123', municipio:'Tuxtepec', nacimiento:'1990-05-10', nacionalidad:'Mexicana', genero:'Masculino', rfc:'PECA900510XXX', nivel_estudios:'Licenciatura', institucion:'Universidad X', titulo_academico:1, anio_graduacion:2014, experiencia_rango:'1-3 años', empresa:'Empresa Demo', ultimo_puesto:'Desarrollador', funciones:'Desarrollo de apps', dispuesto_capacitacion:1, consentimiento_datos:1
    };
    const cols = Object.keys(perfilData);
    const placeholders = cols.map(()=>'?').join(',');
    await db.query(`INSERT INTO asesor_perfiles (preregistro_id, ${cols.join(',')}) VALUES (? , ${placeholders})`, [preregistroId, ...cols.map(k=> perfilData[k])]);

    console.log('Preregistro y perfil creados', { preregistroId });
    process.exit(0);
  } catch (e){
    console.error(e);
    process.exit(1);
  }
}
run();
