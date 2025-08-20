import { Router } from 'express';
import { listQuizzes, getQuiz, crearIntentoQuiz, listIntentosQuizEstudiante, resumenQuizzesEstudiante } from '../controllers/quizzes.controller.js';

const router = Router();

router.get('/quizzes', listQuizzes);
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes/:id/intentos', crearIntentoQuiz);
router.get('/quizzes/:id/intentos/:id_estudiante', listIntentosQuizEstudiante);
router.get('/quizzes/estudiante/:id_estudiante/resumen', resumenQuizzesEstudiante);

export default router;
