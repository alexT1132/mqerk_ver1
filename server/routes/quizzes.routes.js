import { Router } from 'express';
import { listQuizzes, getQuiz, crearIntentoQuiz, listIntentosQuizEstudiante, resumenQuizzesEstudiante, createQuiz, deleteQuiz, updateQuiz, estudiantesEstadoQuiz } from '../controllers/quizzes.controller.js';
import { listPreguntasQuiz, crearSesionQuiz, registrarRespuestasSesion, finalizarSesionQuiz, getReviewQuizIntento, getQuizFull } from '../controllers/quizzes_questions.controller.js';
import { getQuizAnalytics } from '../controllers/quizzes_analytics.controller.js';
import { authREquired } from '../middlewares/validateToken.js';

const router = Router();

// Auth required for listing to apply per-student area filtering
router.get('/quizzes', authREquired, listQuizzes);
router.post('/quizzes', authREquired, createQuiz);
router.get('/quizzes/:id', getQuiz);
router.put('/quizzes/:id', authREquired, updateQuiz);
router.delete('/quizzes/:id', authREquired, deleteQuiz);
router.post('/quizzes/:id/intentos', authREquired, crearIntentoQuiz);
router.get('/quizzes/:id/intentos/:id_estudiante', listIntentosQuizEstudiante);
router.get('/quizzes/estudiante/:id_estudiante/resumen', resumenQuizzesEstudiante);
// Estado por estudiante para un quiz (asesor)
router.get('/quizzes/:id/estudiantes-estado', authREquired, estudiantesEstadoQuiz);

// Banco de preguntas y sesiones (simulaciones)
router.get('/quizzes/:id/preguntas', authREquired, listPreguntasQuiz);
// Admin: obtener quiz completo (meta + preguntas + opciones con es_correcta)
router.get('/quizzes/:id/full', authREquired, getQuizFull);
router.post('/quizzes/:id/sesiones', authREquired, crearSesionQuiz); // body: {id_estudiante}
router.post('/quizzes/sesiones/:id_sesion/respuestas', authREquired, registrarRespuestasSesion); // body: {respuestas:[]}
router.post('/quizzes/sesiones/:id_sesion/finalizar', authREquired, finalizarSesionQuiz); // calcula puntaje y registra intento
// Review detallado de intento
router.get('/quizzes/:id/review/:id_estudiante', authREquired, getReviewQuizIntento); // opcional ?intento=N para el intento específico
// Analítica agregada
router.get('/quizzes/:id/analitica/:id_estudiante', authREquired, getQuizAnalytics);

export default router;
