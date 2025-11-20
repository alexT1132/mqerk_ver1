import db from '../db.js';
import * as Quizzes from '../models/quizzes_intentos.model.js';
import * as QQ from '../models/quizzes_questions.model.js';

async function check() {
  try {
    const id = 1;
    console.log('Verificando quiz ID:', id);
    
    // Verificar quiz
    const quiz = await Quizzes.getQuizById(id);
    console.log('Quiz encontrado:', quiz ? 'Sí' : 'No');
    if (quiz) {
      console.log('  Título:', quiz.titulo);
      console.log('  Tabla:', quiz.id ? 'quizzes' : 'actividades');
    }
    
    // Verificar preguntas
    const preguntas = await QQ.listPreguntasQuiz(id);
    console.log('Preguntas encontradas:', preguntas.length);
    
    if (preguntas.length > 0) {
      for (const p of preguntas) {
        const opciones = await QQ.listOpcionesPregunta(p.id);
        console.log(`  - Pregunta ${p.id}: ${p.enunciado?.substring(0, 50)}... (${opciones.length} opciones)`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
}

check();

