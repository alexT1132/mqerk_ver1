import { Router } from 'express';
import { listQuizzes, getQuiz, crearIntentoQuiz, listIntentosQuizEstudiante, resumenQuizzesEstudiante } from '../controllers/quizzes.controller.js';
import { listPreguntasQuiz, crearSesionQuiz, registrarRespuestasSesion, finalizarSesionQuiz } from '../controllers/quizzes_questions.controller.js';
import { getQuizAnalytics } from '../controllers/quizzes_analytics.controller.js';

const router = Router();

router.get('/quizzes', listQuizzes);
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes/:id/intentos', crearIntentoQuiz);
router.get('/quizzes/:id/intentos/:id_estudiante', listIntentosQuizEstudiante);
router.get('/quizzes/estudiante/:id_estudiante/resumen', resumenQuizzesEstudiante);

// Banco de preguntas y sesiones (simulaciones)
router.get('/quizzes/:id/preguntas', listPreguntasQuiz);
router.post('/quizzes/:id/sesiones', crearSesionQuiz); // body: {id_estudiante}
router.post('/quizzes/sesiones/:id_sesion/respuestas', registrarRespuestasSesion); // body: {respuestas:[]}
router.post('/quizzes/sesiones/:id_sesion/finalizar', finalizarSesionQuiz); // calcula puntaje y registra intento
// Analítica agregada
router.get('/quizzes/:id/analitica/:id_estudiante', getQuizAnalytics);

export default router;
