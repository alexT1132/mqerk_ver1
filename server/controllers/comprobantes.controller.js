import * as Comprobantes from "../models/comprobantes.model.js";
import * as Estudiantes from "../models/estudiantes.model.js";

// Crear un nuevo estudiante
export const crear = async (req, res) => {
  try {
    const { 
      id_estudiante
    } = req.body;

    // Validación básica
    if (!req.file || !id_estudiante) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } 

    // Ruta relativa para la imagen
    const url = `/comprobantes/${req.file.filename}`;

    // Objeto listo para guardar en la base de datos
    const comprobanteGenerado = {
      id_estudiante,
      comprobante: url
    };

    const result = await Comprobantes.createComprobante(comprobanteGenerado);

    // Actualizar la verificación del estudiante
    const verificacion = await Estudiantes.updateComprobante(id_estudiante, { verificacion: 1 });

    return res.status(201).json({
      message: "Comprobante creado exitosamente"
    });
  } catch (error) {
    console.error("Error en el controlador:", error);
  }
};

export const obtenerComprobantes = async (req, res) => {
    try {
        // Obtener el parámetro grupo desde la URL o el body
        const { grupo, curso } = req.params;

        if (!grupo || !curso) {
            return res.status(400).json({ mensaje: "Los parámetros grupo y curso son obligatorios" });
        }

        // Ejecutar el modelo
        const resultado = await Comprobantes.getComprobantes(grupo, curso);

        // Responder con los datos obtenidos
        res.status(200).json(resultado);
    } catch (error) {
        console.error("Error al obtener comprobantes:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

export const GetEnableVerificacion = async (req, res) => {
    try {
        const { folio } = req.params;
        const { importe, metodo } = req.body;

        if (!folio) {
            return res.status(400).json({ mensaje: "El parámetro folio es obligatorio" });
        }

        // Obtener el estudiante por folio
        const estudiante = await Comprobantes.getEstudianteVerificacion(folio);

        if (!estudiante) {
            return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        }

        // Actualizar el comprobante
        const resultComprobante = await Comprobantes.actualizarComprobante(estudiante.id, { importe, metodo });

        const resultAcceso = await Comprobantes.verificarAcceso(estudiante.id);

        res.status(200).json({ mensaje: 'Verificación actualizada correctamente' });

    } catch (error) {
        console.error("Error al obtener verificación del comprobante:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};