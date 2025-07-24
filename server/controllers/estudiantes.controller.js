import * as Estudiantes from "../models/estudiantes.model.js";

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
      folio
    } = req.body;

    // Validación básica
    if (!req.file || !nombre || !apellidos || !email || !telefono || !nombre_tutor || !tel_tutor || !telefono || !curso || !plan || !anio || !folio) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } 

    // Ruta relativa para la imagen
    const imagen = `/public/${req.file.filename}`;

    // Objeto listo para guardar en la base de datos
    const estudianteGenerado = {
      nombre,
      apellidos, 
      email, 
      foto: imagen,
      comunidad1, 
      comunidad2,
      telefono,
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
      folio
    };

    const result = await Estudiantes.createEstudiante(estudianteGenerado);

    const idInsertado = result?.insertId || null;

    return res.status(201).json({
      id: idInsertado,
      ...estudianteGenerado,
    });

  } catch (error) {
    console.error("Error en el controlador:", error);
    // res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener todos los estudiantes
export const obtener = async (req, res) => {
  try {
    Estudiantes.ObtenerNegocios((error, results) => {
      if (error) {
        console.error("Error al obtener negocios:", error);
        return res.status(500).json({ message: "Error al obtener los negocios", error });
      }

      res.status(200).json({ data: results });
    });
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Obtener uno por ID
export const obtenerUno = (req, res) => {
  const { id } = req.params;
  Negocios.getNegocioById(id, (error, result) => {
    if (error) return res.status(500).json({ message: "Error al obtener el negocio", error });
    if (result.length === 0) return res.status(404).json({ message: "Negocio no encontrado" });
    res.status(200).json({ data: result[0] });
  });
};

// Actualizar un estudiante
export const actualizar = (req, res) => {
  const { id } = req.params;
  const { nombre, ubicacion, tipo } = req.body;

  if (!nombre || !ubicacion || !tipo) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const data = { nombre, ubicacion, tipo };

  Negocios.updateNegocio(id, data, (error, result) => {
    if (error) return res.status(500).json({ message: "Error al actualizar el negocio", error });
    res.status(200).json({ message: "Negocio actualizado correctamente" });
  });
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
    const folio = await Estudiantes.obtenerUltimoFolio();

    if (!folio) {
      return res.status(404).json({ mensaje: 'No hay registros aún' });
    }

    res.status(200).json({ folio });
  } catch (error) {
    console.error('❌ ERROR EN CONTROLADOR getUltimoFolio:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
};