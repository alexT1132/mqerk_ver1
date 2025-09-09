import * as PreReg from '../models/asesor_preregistros.model.js';
import * as Perfil from '../models/asesor_perfiles.model.js';
import * as Usuarios from '../models/usuarios.model.js';
import bcrypt from 'bcryptjs';
import * as Perfiles from '../models/asesor_perfiles.model.js';
import db from '../db.js';
import * as AsesorPerfiles from '../models/asesor_perfiles.model.js';

export const crearPreRegistro = async (req, res) => {
  try {
    const { nombres, apellidos, correo, telefono, area, estudios } = req.body;
    if(!nombres || !apellidos || !correo || !telefono || !area || !estudios){
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }
    const existente = await PreReg.findByCorreo(correo);
    if(existente){
      return res.status(409).json({ message: 'Correo ya preregistrado', preregistro: existente });
    }
    const creado = await PreReg.createPreRegistro({ nombres, apellidos, correo, telefono, area, estudios });
    return res.status(201).json({ preregistro: creado });
  } catch (err) {
    console.error('Error crearPreRegistro', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const obtenerPreRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PreReg.getById(id);
    if(!pr) return res.status(404).json({ message: 'No encontrado' });
    res.json({ preregistro: pr });
  } catch(err){
    res.status(500).json({ message: 'Error interno' });
  }
};

export const listarPreRegistros = async (_req, res) => {
  try {
    const list = await PreReg.listAll();
    res.json({ data: list });
  } catch(err){
    res.status(500).json({ message: 'Error interno' });
  }
};

export const actualizarPreRegistroBasico = async (req, res) => {
  try {
    const { id } = req.params;
    const pr = await PreReg.getById(id);
    if(!pr) return res.status(404).json({ message: 'No encontrado' });
    const { nombres, apellidos, correo, telefono, area, estudios } = req.body || {};
    const toUpdate = { nombres, apellidos, correo, telefono, area, estudios };
    Object.keys(toUpdate).forEach(k=> toUpdate[k] === undefined && delete toUpdate[k]);
    if(!Object.keys(toUpdate).length) return res.status(400).json({ message:'Sin campos' });
    // Validación simple correo duplicado
    if(correo && correo !== pr.correo){
      const existe = await PreReg.findByCorreo(correo);
      if(existe && existe.id !== pr.id) return res.status(409).json({ message:'Correo ya usado' });
    }
    const result = await PreReg.updateBasicData(id, toUpdate);
    if(!result.updated) return res.status(400).json({ message:'No actualizado' });
    const refreshed = await PreReg.getById(id);
    res.json({ preregistro: refreshed });
  } catch(err){
    console.error('Error actualizarPreRegistroBasico', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Finalizar proceso (versión sin tests): crear credenciales si no existen y marcar completado
export const finalizarProcesoAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    const prereg = await PreReg.getById(preregistroId);
    if(!prereg) return res.status(404).json({ message: 'Preregistro no existe' });

    if(prereg.status === 'rejected') {
      return res.status(400).json({ message:'Preregistro rechazado' });
    }

    // Si ya completado, no recrear credenciales
    if(prereg.status === 'completed') {
      return res.json({ ok:true, message:'Ya finalizado' });
    }

    // Generar username: nombre + dominio
    const firstNameRaw = (prereg.nombres || '').trim().split(/\s+/)[0] || 'asesor';
    const normalize = (s)=> s.normalize('NFD').replace(/[^\p{L}0-9]/gu,'').toLowerCase();
    let base = normalize(firstNameRaw) || 'asesor';
    let username = `${base}.mqerkacademy`;
    let counter = 2;
    while(await Usuarios.getUsuarioPorusername(username)){
      username = `${base}.mqerkacademy-${counter}`;
      counter++;
    }

    // Password segura
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*()-_=+';
    const pick = (pool)=> pool[Math.floor(Math.random()*pool.length)];
    let pwdChars = [ pick(upper), pick(lower), pick(digits), pick(symbols) ];
    const all = upper+lower+digits+symbols;
    while(pwdChars.length < 10){ pwdChars.push(pick(all)); }
    pwdChars = pwdChars.sort(()=>Math.random()-0.5);
    const plainPassword = pwdChars.join('');
    const hash = await bcrypt.hash(plainPassword, 10);

    await Usuarios.createUsuario({ usuario: username, contraseña: hash, role: 'asesor', id_estudiante: null });
    // Vincular usuario al perfil si ya existe registro en asesor_perfiles
    try {
      const [perfilRows] = await db.query('SELECT preregistro_id FROM asesor_perfiles WHERE preregistro_id=? LIMIT 1',[prereg.id]);
      if(perfilRows && perfilRows.length){
        const [userRow] = await db.query('SELECT id FROM usuarios WHERE usuario=? LIMIT 1',[username]);
        if(userRow && userRow.length){
          await db.query('UPDATE asesor_perfiles SET usuario_id=? WHERE preregistro_id=?',[userRow[0].id, prereg.id]);
        }
      }
    } catch(_e){ /* ignore linking errors */ }
    await PreReg.updateStatus(prereg.id, 'completed');

    res.json({ ok:true, credenciales:{ usuario: username, password: plainPassword } });
  } catch(err){
    console.error('Error finalizarProcesoAsesor (sin tests)', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Guardar / actualizar perfil completo (después de aprobado y antes o después de generar credenciales)
export const guardarPerfilAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    const prereg = await PreReg.getById(preregistroId);
    if(!prereg) return res.status(404).json({ message: 'Preregistro no existe' });
    if(prereg.status === 'rejected') return res.status(400).json({ message: 'Preregistro rechazado' });
    // Se permite guardar perfil si ya aprobado (status completed) o durante fase antes de completar
    const payload = req.body || {};
    const result = await Perfil.createOrUpdatePerfil(preregistroId, payload);
    return res.status(result.created ? 201 : 200).json({ ok:true, ...result });
  } catch(err){
    console.error('Error guardarPerfilAsesor', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const obtenerPerfilAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    const perfil = await Perfil.getByPreRegistro(preregistroId);
    if(!perfil) return res.status(404).json({ message: 'No existe perfil' });
    res.json({ perfil });
  } catch(err){
    res.status(500).json({ message: 'Error interno' });
  }
};

export const subirDocumentosPerfil = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    const prereg = await PreReg.getById(preregistroId);
    if(!prereg) return res.status(404).json({ message: 'Preregistro no existe' });
    if(!req.files || Object.keys(req.files).length === 0){
      return res.status(400).json({ message: 'Sin archivos' });
    }
    const fieldMap = {
      doc_identificacion: 'doc_identificacion',
      doc_comprobante_domicilio: 'doc_comprobante_domicilio',
      doc_titulo_cedula: 'doc_titulo_cedula',
      doc_certificaciones: 'doc_certificaciones',
      doc_carta_recomendacion: 'doc_carta_recomendacion',
      doc_curriculum: 'doc_curriculum',
      doc_fotografia: 'doc_fotografia',
      titulo_archivo: 'titulo_archivo',
      certificaciones_archivo: 'certificaciones_archivo'
    };
    const updates = {};
    for(const key of Object.keys(req.files)){
      const arr = req.files[key];
      if(!arr || !arr.length) continue;
      const stored = arr[0];
      if(fieldMap[key]) updates[fieldMap[key]] = stored.path.replace(/\\/g,'/');
    }
    if(!Object.keys(updates).length) return res.status(400).json({ message: 'Campos de archivo no reconocidos' });
    await Perfil.updatePerfilFields(preregistroId, updates);
    res.json({ ok:true, actualizados: Object.keys(updates) });
  } catch(err){
    console.error('Error subirDocumentosPerfil', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Actualizar solo el grupo asignado al asesor
export const actualizarGrupoAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    const { grupo } = req.body || {};
    if(!grupo) return res.status(400).json({ message:'grupo requerido' });
    // Validar formato simple (max 10 chars alfanum + guiones)
    if(!/^[A-Za-z0-9_-]{1,10}$/.test(grupo)) return res.status(400).json({ message:'Formato grupo invalido' });
    const perfil = await Perfiles.getByPreRegistro(preregistroId);
    if(!perfil) return res.status(404).json({ message:'Perfil no existe' });
    await Perfiles.updatePerfilFields(preregistroId, { grupo_asesor: grupo });
    // Auto-asignar alumnos del grupo que no tengan asesor (o asesor default)
    const [asesorRows] = await db.query('SELECT nombres, apellidos FROM asesor_preregistros WHERE id=? LIMIT 1', [preregistroId]);
    const fullName = asesorRows[0] ? `${asesorRows[0].nombres} ${asesorRows[0].apellidos}`.trim() : null;
    let afectados = 0;
    if(fullName){
      const [rUpd] = await db.query(
        `UPDATE estudiantes SET asesor=? WHERE grupo=? AND (asesor IS NULL OR asesor='' OR asesor='Kélvil Valentín Gómez Ramírez')`,
        [fullName, grupo]
      );
      afectados = rUpd.affectedRows || 0;
    }
  // Recalcular conteos (solo estudiantes aprobados/verificacion=2)
  const [[{ total = 0 } = {}]] = await db.query('SELECT COUNT(*) AS total FROM estudiantes WHERE verificacion=2 AND TRIM(grupo)=TRIM(?)', [grupo]);
  const [[{ asignados = 0 } = {}]] = fullName ? await db.query('SELECT COUNT(*) AS asignados FROM estudiantes WHERE verificacion=2 AND TRIM(grupo)=TRIM(?) AND asesor=?', [grupo, fullName]) : [[{ asignados:0 }]];
    const refreshed = await Perfiles.getByPreRegistro(preregistroId);
    res.json({ ok:true, perfil: refreshed, autoAsignados: afectados, conteos: { total_estudiantes_grupo: total, estudiantes_asignados: asignados } });
  } catch(err){
    console.error('Error actualizarGrupoAsesor', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Nuevo: actualizar múltiples grupos (JSON) manteniendo compatibilidad con grupo_asesor (primer elemento)
export const actualizarGruposAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    let { grupos } = req.body || {};
    if(typeof grupos === 'string') { try { grupos = JSON.parse(grupos); } catch { /* ignore */ } }
    if(!Array.isArray(grupos) || !grupos.length) return res.status(400).json({ message:'grupos debe ser array no vacío'});
    grupos = [...new Set(grupos.map(g=> String(g).trim()).filter(g=> /^[A-Za-z0-9_-]{1,10}$/.test(g)))];
    if(!grupos.length) return res.status(400).json({ message:'Sin grupos válidos'});
    const perfil = await Perfiles.getByPreRegistro(preregistroId);
    if(!perfil) return res.status(404).json({ message:'Perfil no existe' });
    // Actualizar campos
    await Perfiles.updatePerfilFields(preregistroId, { grupos_asesor: grupos, grupo_asesor: grupos[0] });
    // Auto-asignar alumnos del primer grupo NUEVO (comportamiento básico; futuro: manejar varios)
    const primerGrupo = grupos[0];
    const [asesorRows] = await db.query('SELECT nombres, apellidos FROM asesor_preregistros WHERE id=? LIMIT 1', [preregistroId]);
    const fullName = asesorRows[0] ? `${asesorRows[0].nombres} ${asesorRows[0].apellidos}`.trim() : null;
    let afectados = 0;
    if(fullName){
      const [rUpd] = await db.query(
        `UPDATE estudiantes SET asesor=? WHERE grupo=? AND (asesor IS NULL OR asesor='' OR asesor='Kélvil Valentín Gómez Ramírez')`,
        [fullName, primerGrupo]
      );
      afectados = rUpd.affectedRows || 0;
    }
    const refreshed = await Perfiles.getByPreRegistro(preregistroId);
    res.json({ ok:true, perfil: refreshed, autoAsignados: afectados });
  } catch(err){
    console.error('Error actualizarGruposAsesor', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Actualizar status del asesor (admin)
export const actualizarStatusAsesor = async (req, res) => {
  try {
    const { id } = req.params; // id del preregistro
    const { status } = req.body || {};
    if(!status) return res.status(400).json({ message:'status requerido' });
    const allowed = ['pending','testing','completed','rejected'];
    if(!allowed.includes(status)) return res.status(400).json({ message:'status invalido' });
    const prereg = await PreReg.getById(id);
    if(!prereg) return res.status(404).json({ message:'No encontrado' });
    // Si pasa a completed y antes no lo estaba, no generamos credenciales automáticamente aquí para evitar duplicar lógica.
    await PreReg.updateStatus(id, status);
    const refreshed = await PreReg.getById(id);
    res.json({ ok:true, preregistro: refreshed });
  } catch(err){
    console.error('Error actualizarStatusAsesor', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Asignar todos los alumnos de un grupo al asesor (solo alumnos sin asesor o con asesor por defecto)
export const asignarAlumnosGrupoAsesor = async (req, res) => {
  try {
    const { preregistroId } = req.params;
    // Obtener datos del asesor
    const [asesorRows] = await db.query('SELECT nombres, apellidos FROM asesor_preregistros WHERE id=? LIMIT 1', [preregistroId]);
    if(!asesorRows[0]) return res.status(404).json({ message: 'Asesor no encontrado' });
    const fullName = `${asesorRows[0].nombres} ${asesorRows[0].apellidos}`.trim();
    // Obtener grupo asignado al perfil
    const [perfilRows] = await db.query('SELECT grupo_asesor FROM asesor_perfiles WHERE preregistro_id=? LIMIT 1', [preregistroId]);
    if(!perfilRows[0] || !perfilRows[0].grupo_asesor) return res.status(400).json({ message: 'El asesor no tiene un grupo asignado' });
    const grupo = perfilRows[0].grupo_asesor;
    // Actualizar estudiantes del grupo que no tienen asesor asignado (null, vacio o valor por defecto)
    const [result] = await db.query(
      `UPDATE estudiantes SET asesor=? 
       WHERE grupo=? AND (asesor IS NULL OR asesor='' OR asesor='Kélvil Valentín Gómez Ramírez')`,
      [fullName, grupo]
    );
    // Conteos posteriores
    const [[{ total_grupo = 0 } = {}]] = await db.query('SELECT COUNT(*) AS total_grupo FROM estudiantes WHERE grupo=?', [grupo]);
    const [[{ asignados = 0 } = {}]] = await db.query('SELECT COUNT(*) AS asignados FROM estudiantes WHERE grupo=? AND asesor=?', [grupo, fullName]);
    res.json({ ok:true, afectados: result.affectedRows, grupo, asesor: fullName, total_grupo, asignados });
  } catch(err){
    console.error('Error asignarAlumnosGrupoAsesor', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Listar estudiantes aprobados del grupo del asesor autenticado
export const listarEstudiantesAsesor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });
    // Recuperar perfil por user id para conocer grupo asignado
    let perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil) {
      // fallback: si existe solo un perfil con grupo y sin usuario, usarlo (migración)
      try {
        const [pRows] = await db.query(
          'SELECT * FROM asesor_perfiles WHERE usuario_id IS NULL AND grupo_asesor IS NOT NULL AND grupo_asesor<>"" LIMIT 2'
        );
        if (pRows.length === 1) {
          perfil = pRows[0];
        }
      } catch (_e) {}
    }
    const gruposArr = perfil?.grupos_asesor || (perfil?.grupo_asesor ? [perfil.grupo_asesor] : []);
    const allGroups = Array.isArray(gruposArr) ? gruposArr : [];
    // grupo opcional por query; si no viene, preferir primero para compat
    const requested = (req.query?.grupo || '').toString().trim();
    const grupo = requested || (allGroups[0] || null);
    if (!grupo || !allGroups.includes(grupo)) {
      // Si no hay grupo aún asignado, devolvemos solo metadatos
      return res.status(200).json({ data: [], grupo: null, grupos_asesor: allGroups });
    }

    // Alinear con Admin: solo aprobados (verificacion=2), sin soft-deletes, y con pago aprobado (comprobante con importe)
    const sql = `
      SELECT e.id, e.folio, e.folio_formateado, e.nombre, e.apellidos, e.email, e.grupo, e.curso, e.plan, e.anio,
             e.estatus,
             e.created_at AS registrado_en,
             c.importe AS pago_importe, c.metodo AS pago_metodo, c.created_at AS pago_fecha
      FROM estudiantes e
      INNER JOIN (
        SELECT id_estudiante, MAX(created_at) AS latest
        FROM comprobantes
        WHERE importe IS NOT NULL
        GROUP BY id_estudiante
      ) lp ON lp.id_estudiante = e.id
      INNER JOIN comprobantes c ON c.id_estudiante = lp.id_estudiante AND c.created_at = lp.latest
      LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
      WHERE e.verificacion = 2
        AND sd.id IS NULL
        AND TRIM(e.grupo) = TRIM(?)
      ORDER BY c.created_at DESC`;

  const [rows] = await db.query(sql, [grupo]);
    const data = rows.map((r) => ({
      id: r.id,
      folio: r.folio,
      folio_formateado: r.folio_formateado || null,
      nombres: r.nombre,
      apellidos: r.apellidos,
      correoElectronico: r.email,
      grupo: r.grupo,
      curso: r.curso,
      plan: r.plan,
      anio: r.anio,
      estatus: r.estatus || 'Activo',
      fechaRegistro: r.registrado_en ? new Date(r.registrado_en).toISOString().split('T')[0] : null,
      pago: {
        importe: Number(r.pago_importe || 0),
        metodo: r.pago_metodo || null,
        fecha: r.pago_fecha ? new Date(r.pago_fecha).toISOString() : null,
      },
    }));
  return res.json({ data, grupo, grupos_asesor: allGroups });
  } catch (err) {
    console.error('Error listarEstudiantesAsesor', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Listar preregistros con información de perfil (incluyendo grupo_asesor) para panel admin
export const listarAsesoresAdmin = async (_req, res) => {
  try {
    // NOTA: Se fuerza collation para evitar "Illegal mix of collations" al comparar columnas con distinta configuración.
  const targetCollation = 'utf8mb4_unicode_ci';
    const [rows] = await db.query(`
      SELECT pr.id, pr.nombres, pr.apellidos, pr.correo, pr.telefono, pr.area, pr.estudios, pr.status,
             ap.grupo_asesor, ap.id AS perfil_id,
             COALESCE((
               SELECT COUNT(DISTINCT e.id) FROM estudiantes e 
               WHERE TRIM(e.grupo) COLLATE ${targetCollation} = TRIM(ap.grupo_asesor) COLLATE ${targetCollation}
                 AND e.verificacion = 2
             ),0) AS total_estudiantes_grupo,
             COALESCE((
               SELECT COUNT(DISTINCT e.id) FROM estudiantes e 
               WHERE TRIM(e.grupo) COLLATE ${targetCollation} = TRIM(ap.grupo_asesor) COLLATE ${targetCollation}
                 AND e.verificacion = 2
                 AND e.asesor COLLATE ${targetCollation} = (CONCAT(pr.nombres,' ',pr.apellidos)) COLLATE ${targetCollation}
             ),0) AS estudiantes_asignados
      FROM asesor_preregistros pr
      LEFT JOIN asesor_perfiles ap ON ap.preregistro_id = pr.id
      ORDER BY pr.created_at DESC
    `);
    res.json({ data: rows });
  } catch(err){
    console.error('Error listarAsesoresAdmin', err);
    res.status(500).json({ message:'Error interno' });
  }
};

// Listar grupos distintos de estudiantes (para asignar a asesores)
export const listarGruposDisponibles = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT DISTINCT grupo FROM estudiantes WHERE grupo IS NOT NULL AND grupo <> '' ORDER BY grupo ASC`);
    res.json({ grupos: rows.map(r=> r.grupo) });
  } catch(err){
    console.error('Error listarGruposDisponibles', err);
    res.status(500).json({ message:'Error interno' });
  }
};
