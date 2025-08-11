
import * as Estudiantes from "../models/estudiantes.model.js";
import * as EstudiantesConfig from "../models/estudiantes_config.model.js";
import * as Usuarios from "../models/usuarios.model.js";
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import * as SoftDeletes from "../models/soft_deletes.model.js";
import db from "../db.js";

// Crear un nuevo estudiante
export const crear = async (req, res) => {
  try {
    const { 
      nombre,
      apellidos, 
      email, 
      comunidad1, 
      comunidad2,
      telefono,
  fecha_nacimiento,
      grupo,
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
      comentario1,
      comentario2,
      curso,
      plan,
      anio,
  folio,
    } = req.body;

    // Validación básica
    if (!req.file || !nombre || !apellidos || !email || !telefono || !nombre_tutor || !tel_tutor || !grupo || !curso || !plan || !anio) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } 

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
      apellidos, 
      email, 
      foto: imagen,
      grupo,
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
      comentario1,
      comentario2,
      curso,
      plan,
  anio,
  folio: finalFolioNumber
    };

    console.log(estudianteGenerado);

    const result = await Estudiantes.createEstudiante(estudianteGenerado);

    const idInsertado = result?.insertId || null;

  return res.status(201).json({
      id: idInsertado,
      ...estudianteGenerado,
    });

  } catch (error) {
    console.error("Error en el controlador:", error);
  res.status(500).json({ message: "Error interno del servidor" });
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

  // Campos permitidos a actualizar desde el perfil del alumno
  // Importante: Los datos del curso (curso, grupo, plan, semestre) NO se pueden modificar desde este endpoint.
  // Si se requiere, hacerlo desde un endpoint administrativo separado.
  const allowedFields = [
    'email',
    'comunidad1',
    'telefono',
  'fecha_nacimiento',
    'nombre_tutor',
    'tel_tutor',
    'academico1',
    'academico2',
    'universidades1',
    'orientacion'
  ];

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
  const anioNum = Number(anio) || Number(String(new Date().getFullYear()).slice(-2));
  const max = await Estudiantes.getMaxFolioByCourseYear(curso || 'EEAU', anioNum);
  const next = (max || 0) + 1;
  res.status(200).json({ folio: next, curso: curso || 'EEAU', anio: anioNum });
  } catch (error) {
    console.error('❌ ERROR EN CONTROLADOR getUltimoFolio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

export const obtenerGruposConCantidad = async (req, res) => {
    try {
        // Obtener el parámetro curso desde la URL o el body
        const { curso } = req.params;

        if (!curso) {
            return res.status(400).json({ mensaje: "El parámetro curso es obligatorio" });
        }

        // Ejecutar el modelo
        const resultado = await Estudiantes.getGruposConCantidad(curso);

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
    const { nivel_experiencia, intereses } = req.body;
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
        const oldPath = estudiante.foto.startsWith('/public/') ? estudiante.foto.replace(/^\//, '') : null;
        if (oldPath && fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }
    } catch (_) {
      // Ignorar errores al eliminar archivo anterior
    }

    await Estudiantes.updateEstudiante(id, { foto: imagen });
    const actualizado = await Estudiantes.getEstudianteById(id);
    return res.status(200).json({ message: 'Foto actualizada', data: { id: actualizado.id, foto: actualizado.foto } });
  } catch (error) {
    console.error('Error al actualizar foto del alumno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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
      SELECT e.id, e.folio, e.nombre, e.apellidos, e.email, e.grupo, e.curso, e.plan, e.anio,
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
      WHERE e.verificacion = 2
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
      folio: r.folio,
      nombres: r.nombre,
      apellidos: r.apellidos,
      correoElectronico: r.email,
      curso: r.curso,
      turno: r.grupo, // el componente usa 'turno' para el grupo seleccionado
      estatus: 'Activo',
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
    const folio = req.params?.folio;
    if (!folio) return res.status(400).json({ message: 'Folio requerido' });
    const estudiante = await Estudiantes.getEstudianteByFolio(folio);
    if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
    return res.status(200).json({ data: estudiante });
  } catch (error) {
    console.error('Error getByFolioAdmin:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};