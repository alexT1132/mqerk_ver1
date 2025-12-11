
import * as Estudiantes from "../models/estudiantes.model.js";
import * as EstudiantesConfig from "../models/estudiantes_config.model.js";
import { ensureEstatusColumn } from "../models/estudiantes.model.js";
import * as Usuarios from "../models/usuarios.model.js";
import bcrypt from 'bcryptjs';
import * as SoftDeletes from "../models/soft_deletes.model.js";
import db from "../db.js";
import { generarContratoEstudiante } from "../libs/contracts.js";
import * as Contratos from "../models/contratos.model.js";
import fs from 'fs';
import path from 'path';

// Helper para aceptar folio numérico o formateado (p.ej. MEEAU26-0001)
const parseFolioParam = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const formattedRegex = /^[Mm][A-Z]{4}\d{2}-\d{4}$/; // M + 4 letras curso + 2 digitos año + - + 4 digitos correlativo
  if (formattedRegex.test(trimmed)) {
    const numPart = trimmed.split('-').pop();
    const n = Number(numPart);
    return Number.isNaN(n) ? null : n; // correlativo es el folio numérico original
  }
  // Sólo dígitos
  if (/^-?\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

// Crear un nuevo estudiante
export const crear = async (req, res) => {
  try {
    const { 
      nombre,
      apellido_paterno,
      apellido_materno,
      apellidos, // Mantener para compatibilidad
      email, 
      comunidad1, 
      comunidad2,
      telefono,
  fecha_nacimiento,
  grupo,
  turno,
      nombre_tutor,
      tel_tutor,
      academico1,
      academico2,
      semestre,
      alergia,
      alergia2,
      discapacidad1,
      discapacidad2,
      orientacion,
      universidades1,
      universidades2,
      postulacion,
  modalidad,
      comentario1,
      comentario2,
      curso,
      plan,
  academia,
      anio,
  folio,
  asesor,
    } = req.body;

    // Validación básica - verificar campos obligatorios
    const camposFaltantes = [];
    
    // Log para depuración
    console.log('📋 Datos recibidos:', {
      tieneFile: !!req.file,
      nombre: nombre ? '✓' : '✗',
      apellido_paterno: apellido_paterno ? '✓' : '✗',
      apellido_materno: apellido_materno ? '✓' : '✗',
      apellidos: apellidos ? '✓' : '✗',
      email: email ? '✓' : '✗',
      telefono: telefono ? '✓' : '✗',
      nombre_tutor: nombre_tutor ? '✓' : '✗',
      tel_tutor: tel_tutor ? '✓' : '✗',
      grupo: grupo ? '✓' : '✗',
      curso: curso ? '✓' : '✗',
      plan: plan ? '✓' : '✗',
      anio: anio ? '✓' : '✗',
    });
    
    if (!req.file) camposFaltantes.push('foto');
    if (!nombre || !nombre.trim()) camposFaltantes.push('nombre');
    if (!email || !email.trim()) camposFaltantes.push('email');
    if (!telefono || !telefono.trim()) camposFaltantes.push('telefono');
    if (!nombre_tutor || !nombre_tutor.trim()) camposFaltantes.push('nombre_tutor');
    if (!tel_tutor || !tel_tutor.trim()) camposFaltantes.push('tel_tutor');
    if (!grupo || !grupo.trim()) camposFaltantes.push('grupo');
    if (!curso || !curso.trim()) camposFaltantes.push('curso');
    if (!plan || !plan.trim()) camposFaltantes.push('plan');
    if (!anio || !anio.toString().trim()) camposFaltantes.push('anio');
    
    // Validar apellidos: aceptar separados o combinados
    const tieneApellidosSeparados = apellido_paterno && apellido_paterno.trim() && apellido_materno && apellido_materno.trim();
    const tieneApellidosCombinados = apellidos && apellidos.trim();
    
    if (!tieneApellidosSeparados && !tieneApellidosCombinados) {
      camposFaltantes.push('apellidos (paterno y materno, o apellidos combinados)');
    }
    
    if (camposFaltantes.length > 0) {
      console.error('❌ Campos faltantes:', camposFaltantes);
      return res.status(400).json({ 
        message: "Campos obligatorios faltantes", 
        campos: camposFaltantes,
        debug: {
          recibido: {
            nombre: !!nombre,
            apellido_paterno: !!apellido_paterno,
            apellido_materno: !!apellido_materno,
            apellidos: !!apellidos,
            email: !!email,
            telefono: !!telefono,
            nombre_tutor: !!nombre_tutor,
            tel_tutor: !!tel_tutor,
            grupo: !!grupo,
            curso: !!curso,
            plan: !!plan,
            anio: !!anio,
            tieneFile: !!req.file
          }
        }
      });
    }
    
    // Si no vienen los campos separados, usar apellidos como respaldo
    const apellidoPaterno = apellido_paterno || (apellidos ? apellidos.split(' ')[0] : '');
    const apellidoMaterno = apellido_materno || (apellidos ? apellidos.split(' ').slice(1).join(' ') : '');
    const apellidosCompletos = apellidos || `${apellidoPaterno} ${apellidoMaterno}`.trim(); 

    // Ruta relativa para la imagen
    const imagen = `/public/${req.file.filename}`;

    // Generar folio numérico secuencial por curso + año (ignorar folio entrante)
    let finalFolioNumber = 1;
    try {
      const anioNum = Number(anio) || Number(String(new Date().getFullYear()).slice(-2));
      const max = await Estudiantes.getMaxFolioByCourseYear(curso, anioNum);
      finalFolioNumber = (max || 0) + 1;
    } catch (e) {
      console.error('No se pudo calcular folio secuencial, usando 1 por defecto:', e);
      finalFolioNumber = 1;
    }

    // Objeto listo para guardar en la base de datos
  const estudianteGenerado = {
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      apellidos: apellidosCompletos, // Mantener para compatibilidad 
      email, 
      foto: imagen,
  grupo,
  turno: turno && turno.trim() !== '' ? turno.trim() : 'VESPERTINO',
      comunidad1, 
      comunidad2,
      telefono,
  fecha_nacimiento,
      nombre_tutor,
      tel_tutor,
      academico1,
      academico2,
      semestre,
      alergia,
      alergia2,
      discapacidad1,
      discapacidad2,
      orientacion,
      universidades1,
      universidades2,
  postulacion,
  modalidad: modalidad && modalidad.trim() !== '' ? modalidad.trim() : 'Presencial',
      comentario1,
      comentario2,
      curso,
      plan,
  academia: academia && academia.trim() !== '' ? academia.trim() : 'MQerKAcademy',
  anio,
  folio: finalFolioNumber,
  asesor: asesor && asesor.trim() !== '' ? asesor.trim() : 'Kélvil Valentín Gómez Ramírez'
    };

    console.log(estudianteGenerado);

    let result;
    try {
      result = await Estudiantes.createEstudiante(estudianteGenerado);
    } catch (dbError) {
      console.error('❌ Error en createEstudiante:', {
        message: dbError.message,
        code: dbError.code,
        sqlMessage: dbError.sqlMessage
      });
      return res.status(500).json({ 
        message: "Error al guardar en la base de datos",
        error: process.env.NODE_ENV === 'development' ? dbError.message : 'Error interno del servidor',
        detalles: process.env.NODE_ENV === 'development' ? {
          code: dbError.code,
          sqlMessage: dbError.sqlMessage
        } : undefined
      });
    }

    const idInsertado = result?.insertId || null;
  const basePrefix = (curso || 'EEAU').slice(0,4).toUpperCase();
  const nextYearDigits = String((Number(anio) + 1) % 100).padStart(2,'0');
  const folioFormateado = `M${basePrefix}${nextYearDigits}-${String(finalFolioNumber).padStart(4,'0')}`;

    return res.status(201).json({
      id: idInsertado,
      ...estudianteGenerado,
      folio_formateado: folioFormateado
    });

  } catch (error) {
    console.error("❌ Error en el controlador crear estudiante:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    
    // Si es un error de base de datos, dar más información
    if (error.code && error.sqlMessage) {
      return res.status(500).json({ 
        message: "Error al procesar el registro",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        detalles: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          sqlMessage: error.sqlMessage
        } : undefined
      });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todos los estudiantes
export const obtener = async (req, res) => {
  try {
    Estudiantes.ObtenerUsuarios((error, results) => {
      if (error) {
        console.error("Error al obtener estudiantes:", error);
        return res.status(500).json({ message: "Error al obtener los estudiantes", error });
      }

      res.status(200).json({ data: results });
    });
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener uno por ID
export const obtenerUno = async (req, res) => {
  try {
    const { id } = req.params;
    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: "Estudiante no encontrado" });
    res.status(200).json({ data: estudiante });
  } catch (error) {
    console.error("Error al obtener estudiante:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Actualizar un estudiante
export const actualizar = async (req, res) => {
  const { id } = req.params;

  // Campos permitidos a actualizar desde el perfil del alumno / admin
  // Ampliado para permitir que un administrador complete información académica y de curso.
  const allowedFields = [
  // Básicos
  'nombre',
  'apellidos',
  'email',
  'telefono',
  'fecha_nacimiento',
  // Ubicación / comunidad
  'comunidad1',
  'comunidad2',
  // Tutor
  'nombre_tutor',
  'tel_tutor',
  // Académico actual
  'academico1', // nivel / academia
  'academico2', // bachillerato
  'semestre',
  // Aspiraciones / orientación
  'orientacion', // usamos para licenciatura / orientación vocacional
  'universidades1', // universidades a postular
  'universidades2',
  // Curso / asignaciones
  'curso',
  'grupo',
  'turno',
  'postulacion', // modalidad
  'modalidad',
  'asesor',
  'academia',
  // Salud
  'alergia',
  'alergia2',
  'discapacidad1',
  'discapacidad2',
  // Expectativas / comentarios
  'comentario1',
  'comentario2'
  ];

  // Incluir estatus si viene explícito desde el admin (Activo|Suspendido)
  if (req.body && typeof req.body.estatus === 'string') {
    const v = String(req.body.estatus);
    if (v === 'Activo' || v === 'Suspendido') allowedFields.push('estatus');
  }

  // Construir objeto con solo campos permitidos presentes en el body
  const data = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      data[key] = req.body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No hay campos válidos para actualizar' });
  }

  try {
    const result = await Estudiantes.updateEstudiante(id, data);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    // Devolver el registro actualizado
    const estudiante = await Estudiantes.getEstudianteById(id);
    res.status(200).json({ message: 'Perfil actualizado correctamente', data: estudiante });
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ message: 'Error interno del servidor', error });
  }
};

// Eliminar un estudiante
export const eliminar = (req, res) => {
  const { id } = req.params;

  Negocios.deleteNegocio(id, (error, result) => {
    if (error) return res.status(500).json({ message: "Error al eliminar el negocio", error });
    res.status(200);
  });
};

export const getUltimoFolio = async (req, res) => {
  try {
    const { curso, anio } = req.query || {};
    const cursoSafe = curso || 'EEAU';
    const anioNum = Number(anio) || Number(String(new Date().getFullYear()).slice(-2));
    const max = await Estudiantes.getMaxFolioByCourseYear(cursoSafe, anioNum);
    const next = (max || 0) + 1;
  const basePrefix = cursoSafe.slice(0,4).toUpperCase();
  const nextYearDigits = String((anioNum + 1) % 100).padStart(2,'0');
  const folioFormateado = `M${basePrefix}${nextYearDigits}-${String(next).padStart(4,'0')}`;
    res.status(200).json({ folio: next, curso: cursoSafe, anio: anioNum, folio_formateado: folioFormateado });
  } catch (error) {
    console.error('❌ ERROR EN CONTROLADOR getUltimoFolio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const obtenerGruposConCantidad = async (req, res) => {
    try {
        // Obtener el parámetro curso desde la URL o el body
  const { curso } = req.params;
  const status = (req.query?.status || 'aprobados').toLowerCase();

        if (!curso) {
            return res.status(400).json({ mensaje: "El parámetro curso es obligatorio" });
        }

  // Ejecutar el modelo (filtrado por estado)
  const resultado = await Estudiantes.getGruposConCantidad(curso, status);

        // Responder con los datos obtenidos
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener grupos con cantidad:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// ===== Configuración del Alumno =====
export const getConfiguracion = async (req, res) => {
  try {
    const { id } = req.params; // id del estudiante
    const config = await EstudiantesConfig.getConfigByEstudianteId(id);
    // Si no hay config, devolver valores por defecto
    const defaults = {
      id_estudiante: Number(id),
      nivel_experiencia: 'intermedio',
      intereses: []
    };
    return res.status(200).json(config ? config : defaults);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const upsertConfiguracion = async (req, res) => {
  try {
    const { id } = req.params; // id del estudiante
    const { nivel_experiencia, intereses } = req.body || {};
    await EstudiantesConfig.upsertConfig(id, { nivel_experiencia, intereses });
    const config = await EstudiantesConfig.getConfigByEstudianteId(id);
    return res.status(200).json({ message: 'Configuración actualizada', data: config });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params; // id del usuario (no estudiante)
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseñas requeridas' });
    }
    const user = await Usuarios.getUsuarioPorid(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword, user.contraseña);
    if (!ok) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(newPassword, 10);
    await Usuarios.updatePassword(id, hash);
    return res.status(200).json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== Actualizar foto de perfil del Alumno =====
export const actualizarFoto = async (req, res) => {
  try {
    const { id } = req.params; // id del estudiante
    if (!req.file) {
      return res.status(400).json({ message: 'Archivo de imagen requerido' });
    }

    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    // Ruta relativa expuesta por express.static('/public')
    const imagen = `/public/${req.file.filename}`;

    // Intentar eliminar la foto anterior si existe y es diferente
    try {
      if (estudiante.foto && typeof estudiante.foto === 'string') {
        const rel = estudiante.foto.startsWith('/public/') ? estudiante.foto.replace(/^\//, '') : null;
        if (rel) {
          const abs = path.resolve(process.cwd(), rel);
          if (fs.existsSync(abs)) {
            fs.unlink(abs, (err) => {
              if (err) console.warn('No se pudo eliminar foto anterior:', abs, err?.message);
            });
          }
        }
      }
    } catch (_) {
      // Ignorar errores al eliminar archivo anterior
    }

    await Estudiantes.updateEstudiante(id, { foto: imagen });
    const actualizado = await Estudiantes.getEstudianteById(id);
    return res.status(200).json({ message: 'Foto actualizada', data: { id: actualizado.id, foto: actualizado.foto } });
  } catch (error) {
    console.error('Error al actualizar foto del alumno:', error?.message, error?.stack);
    res.status(500).json({ message: 'Error interno del servidor al actualizar foto', detail: error?.message });
  }
};

// ===== Soft delete de cuenta de alumno (marca y conserva registros) =====
export const softDeleteCuenta = async (req, res) => {
  try {
    const { id } = req.params; // id del estudiante
    const { reason } = req.body || {};
    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

  // Buscar usuario vinculado para registrar id_usuario si existe
  const usuario = await Usuarios.getUsuarioPorEstudianteId(estudiante.id).catch(() => null);

  await SoftDeletes.markSoftDelete({ id_usuario: usuario?.id || null, id_estudiante: estudiante.id, reason: reason || null });

    return res.status(200).json({ message: 'Cuenta marcada para eliminación (soft delete)'});
  } catch (error) {
    console.error('Error en soft delete de cuenta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== Alumnos aprobados y con acceso activado (verificacion=2) y pago aprobado (comprobantes.importe no nulo) =====
export const getApprovedStudents = async (req, res) => {
  try {
    // Requiere admin autenticado: validación en route con authREquired
    const curso = req.query?.curso || null;
    const grupo = req.query?.grupo || null;

    // Subconsulta para último pago aprobado por estudiante
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
        ${curso ? 'AND e.curso = ?' : ''}
        ${grupo ? 'AND e.grupo = ?' : ''}
      ORDER BY c.created_at DESC`;

    const params = [];
    if (curso) params.push(curso);
    if (grupo) params.push(grupo);

    const [rows] = await db.query(sql, params);

    // Map a una forma amigable para el frontend ListaAlumnos
    const data = (rows || []).map(r => ({
      id: r.id,
      // Enviamos ambos: folio (numérico original) y folio_formateado (nuevo generado en BD)
      folio: r.folio,
      folio_formateado: r.folio_formateado || null,
      nombres: r.nombre,
      apellidos: r.apellidos,
      correoElectronico: r.email,
      curso: r.curso,
      turno: r.grupo, // el componente usa 'turno' para el grupo seleccionado
  plan: r.plan, // incluir plan del curso para contratos/pagos
  estatus: r.estatus || 'Activo',
      fechaRegistro: r.registrado_en ? new Date(r.registrado_en).toISOString().split('T')[0] : null,
      pago: {
        importe: Number(r.pago_importe || 0),
        metodo: r.pago_metodo || null,
        fecha: r.pago_fecha ? new Date(r.pago_fecha).toISOString() : null,
      },
      municipioComunidad: '', // compat con filtro del frontend
    }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error getApprovedStudents:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener por folio (admin protegido)
export const getByFolioAdmin = async (req, res) => {
  try {
    const folioRaw = req.params?.folio;
    if (!folioRaw) return res.status(400).json({ message: 'Folio requerido' });
    const folioParsed = parseFolioParam(folioRaw);
    let estudiante = null;
    if (folioParsed == null) {
      estudiante = await Estudiantes.getEstudianteByFolioFormateado(folioRaw);
    } else {
      estudiante = await Estudiantes.getEstudianteByFolio(folioParsed);
      if (!estudiante) {
        estudiante = await Estudiantes.getEstudianteByFolioFormateado(folioRaw);
      }
    }
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
  return res.status(200).json({ data: estudiante });
  } catch (error) {
    console.error('Error getByFolioAdmin:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== Generar contrato PDF del estudiante (admin) =====
export const generarContrato = async (req, res) => {
  try {
    const folio = req.params?.folio;
    if (!folio) return res.status(400).json({ message: 'Folio requerido' });
    const folioParsed = parseFolioParam(folio);
    let estudiante = null;
    if (folioParsed == null) {
      estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
    } else {
      estudiante = await Estudiantes.getEstudianteByFolio(folioParsed);
      if (!estudiante) {
        estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
      }
    }
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
    // Flags de comportamiento
    const force = String(req.query?.force || '0') === '1'; // forzar regeneración
    const store = String(req.query?.store || '0') === '1'; // guardar físicamente y registrar
    const check = String(req.query?.check || '0') === '1'; // sólo verificar existencia sin generar
    const preview = !store; // si no se especifica store=1 es solo vista previa

    // Contrato existente (última versión)
    const existente = await Contratos.getContratoByFolio(estudiante.folio).catch(() => null);

    // Rama de sólo verificación (no genera ni guarda)
    if (check) {
      if (existente && existente.archivo) {
        return res.status(200).json({ existing: true, archivo: existente.archivo, stored: true, message: 'Contrato existente' });
      }
      return res.status(200).json({ existing: false, stored: false, message: 'Contrato no encontrado' });
    }

    // Si ya existe en BD y no se fuerza y se pide store (guardar) simplemente devolver
    if (existente && existente.archivo && !force && store) {
      return res.status(200).json({ existing: true, archivo: existente.archivo, stored: true, message: 'Contrato existente' });
    }

    // Asegurar folio_formateado
    if (!estudiante.folio_formateado) {
      const basePrefix = (estudiante.curso || 'EEAU').slice(0,4).toUpperCase();
      const nextYearDigits = String((Number(estudiante.anio) + 1) % 100).padStart(2,'0');
      estudiante.folio_formateado = `M${basePrefix}${nextYearDigits}-${String(estudiante.folio).padStart(4,'0')}`;
    }

    const pdfBuffer = await generarContratoEstudiante(estudiante);

    if (preview) {
      // Devolver PDF en base64 para vista previa sin guardar
      const base64 = pdfBuffer.toString('base64');
      return res.status(200).json({ preview: true, stored: false, existing: !!existente, needsStore: true, archivo_base64: base64, mime: 'application/pdf' });
    }

    // Guardar archivo y registrar en BD
    const filename = `contrato-${Date.now()}-${estudiante.folio_formateado}.pdf`;
    const fsPath = path.resolve(process.cwd(), 'contratos');
    try { if (!fs.existsSync(fsPath)) fs.mkdirSync(fsPath, { recursive: true }); } catch (_) {}
    const absFile = path.join(fsPath, filename);
    await fs.promises.writeFile(absFile, pdfBuffer);
    const relPath = `/contratos/${filename}`;

    // Registrar sólo si no existe o si force
    if (!existente || force) {
      await Contratos.createContrato({
        id_estudiante: estudiante.id,
        folio: estudiante.folio,
        folio_formateado: estudiante.folio_formateado,
        archivo: relPath,
        original_nombre: filename,
        mime_type: 'application/pdf',
        tamano: pdfBuffer.length,
        firmado: 0,
        version: (existente?.version || 0) + 1,
        notas: null
      });
    }

    return res.status(201).json({ preview: false, stored: true, existing: !!existente && !force, archivo: relPath, message: 'Contrato generado y guardado' });
  } catch (error) {
    console.error('Error generarContrato:', error);
    return res.status(500).json({ message: 'Error interno del servidor al generar contrato' });
  }
};

// ===== Subir contrato firmado (admin) =====
export const subirContrato = async (req, res) => {
  try {
    const folio = req.params?.folio;
    if (!folio) return res.status(400).json({ message: 'Folio requerido' });
    if (!req.file) return res.status(400).json({ message: 'Archivo PDF requerido' });
    const folioParsed = parseFolioParam(folio);
    let estudiante = null;
    if (folioParsed == null) {
      estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
    } else {
      estudiante = await Estudiantes.getEstudianteByFolio(folioParsed);
      if (!estudiante) {
        estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
      }
    }
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    // Construir registro
    const relPath = `/contratos/${req.file.filename}`; // ruta pública a servir con express.static si se configura
    await Contratos.createContrato({
      id_estudiante: estudiante.id,
      folio: estudiante.folio,
      folio_formateado: estudiante.folio_formateado,
      archivo: relPath,
      original_nombre: req.file.originalname,
      mime_type: req.file.mimetype,
      tamano: req.file.size,
      firmado: 1,
      version: 1,
      notas: null
    });

    return res.status(201).json({ message: 'Contrato subido correctamente', archivo: relPath });
  } catch (error) {
    console.error('Error subirContrato:', error);
    return res.status(500).json({ message: 'Error interno del servidor al subir contrato' });
  }
};

// ===== Admin: obtener y actualizar cuenta (usuario/contraseña) del alumno =====
export const getCuentaAlumno = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const requester = requesterId ? await Usuarios.getUsuarioPorid(requesterId) : null;
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params; // id del estudiante
    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
    const usuario = await Usuarios.getUsuarioPorEstudianteId(estudiante.id);
    if (!usuario) return res.status(404).json({ message: 'Cuenta no vinculada a este estudiante' });
    return res.status(200).json({ data: { id_usuario: usuario.id, usuario: usuario.usuario } });
  } catch (error) {
    console.error('getCuentaAlumno error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateCuentaAlumno = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const requester = requesterId ? await Usuarios.getUsuarioPorid(requesterId) : null;
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params; // id del estudiante
    const { usuario: nuevoUsuario } = req.body || {};
    if (!nuevoUsuario || typeof nuevoUsuario !== 'string') return res.status(400).json({ message: 'usuario es requerido' });
    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
    // validar disponibilidad del username
    const ya = await Usuarios.getUsuarioPorusername(nuevoUsuario);
    if (ya && ya.id_estudiante !== estudiante.id) return res.status(409).json({ message: 'Usuario ya existe' });
    const linked = await Usuarios.getUsuarioPorEstudianteId(estudiante.id);
    if (!linked) return res.status(404).json({ message: 'Cuenta no vinculada a este estudiante' });
    await Usuarios.updateUsername(linked.id, nuevoUsuario);
    return res.status(200).json({ message: 'Usuario actualizado', data: { id_usuario: linked.id, usuario: nuevoUsuario } });
  } catch (error) {
    console.error('updateCuentaAlumno error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetPasswordAlumno = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const requester = requesterId ? await Usuarios.getUsuarioPorid(requesterId) : null;
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params; // id del estudiante
    const { newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ message: 'newPassword mínimo 6 caracteres' });
    const estudiante = await Estudiantes.getEstudianteById(id);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
    const linked = await Usuarios.getUsuarioPorEstudianteId(estudiante.id);
    if (!linked) return res.status(404).json({ message: 'Cuenta no vinculada a este estudiante' });
    const hash = await bcrypt.hash(newPassword, 10);
    await Usuarios.updatePassword(linked.id, hash);
    return res.status(200).json({ message: 'Contraseña restablecida' });
  } catch (error) {
    console.error('resetPasswordAlumno error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== Eliminar contrato existente más reciente (admin) =====
export const eliminarContrato = async (req, res) => {
  try {
    const folio = req.params?.folio;
    if (!folio) return res.status(400).json({ message: 'Folio requerido' });
    const folioParsed = parseFolioParam(folio);
    let estudiante = null;
    if (folioParsed == null) {
      estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
    } else {
      estudiante = await Estudiantes.getEstudianteByFolio(folioParsed);
      if (!estudiante) {
        estudiante = await Estudiantes.getEstudianteByFolioFormateado(folio);
      }
    }
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

    const existente = await Contratos.getContratoByFolio(estudiante.folio);
    if (!existente) return res.status(404).json({ message: 'No hay contrato registrado para eliminar' });

    // Borrar archivos físicos de TODAS las versiones
    try {
      const [allRows] = await db.query('SELECT archivo FROM contratos WHERE folio = ?', [estudiante.folio]);
      for (const row of allRows) {
        if (row.archivo) {
          try {
            const rel = row.archivo.startsWith('/') ? row.archivo.slice(1) : row.archivo;
            const abs = path.resolve(process.cwd(), rel);
            if (fs.existsSync(abs)) await fs.promises.unlink(abs);
          } catch (_) {}
        }
      }
    } catch (_) {}

    await Contratos.deleteContratosByFolio(estudiante.folio);
    return res.status(200).json({ message: 'Contratos eliminados', removed: true });
  } catch (error) {
    console.error('Error eliminarContrato:', error);
    return res.status(500).json({ message: 'Error interno del servidor al eliminar contrato' });
  }
};