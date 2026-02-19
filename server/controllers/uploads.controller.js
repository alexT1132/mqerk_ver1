/**
 * Subir imagen de pregunta/opción para quizzes y simulaciones.
 * Devuelve la URL pública para guardar en enunciado/opción.
 */
export const uploadPreguntaImagen = (req, res) => {
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen' });
  }
  const url = `/uploads/preguntas/${req.file.filename}`;
  return res.status(200).json({ url });
};
