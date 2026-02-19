import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import { uploadPreguntaImage } from '../middlewares/preguntaImageMulter.js';
import { uploadPreguntaImagen } from '../controllers/uploads.controller.js';

const router = Router();

// Imagen de pregunta u opción (quiz o simulación): sube archivo y devuelve { url: '/uploads/preguntas/...' }
router.post('/uploads/pregunta-imagen', authREquired, uploadPreguntaImage.single('image'), uploadPreguntaImagen);

export default router;
