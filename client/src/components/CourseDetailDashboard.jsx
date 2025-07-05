import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, TrendingUp, Clock, Users, Award, ChevronRight } from 'lucide-react';

const CourseDetailDashboard = () => {
  const { currentCourse, studentData } = useStudent();
  const navigate = useNavigate();
  const [elementsVisible, setElementsVisible] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setTimeout(() => setElementsVisible(true), 200);
  }, []);

  // Si no hay curso seleccionado, redirigir a cursos
  useEffect(() => {
    if (!currentCourse) {
      navigate('/alumno/cursos');
    }
  }, [currentCourse, navigate]);

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Cargando curso...</p>
        </div>
      </div>
    );
  }

  const firstName = studentData.name.split(' ')[0];

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 overflow-y-auto">
      {/* Elementos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] delay-[2000ms] top-80 right-20"></div>
        <div className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] delay-[4000ms] bottom-20 left-80"></div>
      </div>

      {/* Layout principal */}
      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header con información del curso */}
        <div className={`text-center mb-8 lg:mb-12 transition-all duration-1000 ${elementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 drop-shadow-2xl mb-4">
            ¡Bienvenido, {firstName}!
          </h1>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto border border-white/20">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
              Estás en el curso de:
            </h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-yellow-300 mb-4">
              {currentCourse.title}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Instructor: {currentCourse.instructor}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                <span>Progreso: {currentCourse.progress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={20} />
                <span>{currentCourse.metadata.lessons} lecciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de métricas del curso */}
        <div className={`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-300 ${elementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Progreso del curso */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-full">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Tu Progreso</h3>
                <p className="text-white/70 text-sm">Avance general</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-white mb-2">
                <span>Completado</span>
                <span className="font-bold">{currentCourse.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${currentCourse.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tiempo dedicado */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-3 rounded-full">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Tiempo Dedicado</h3>
                <p className="text-white/70 text-sm">Esta semana</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">12.5h</div>
            <div className="text-white/70 text-sm">+2.3h desde la semana pasada</div>
          </div>

          {/* Tareas completadas */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-full">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Tareas</h3>
                <p className="text-white/70 text-sm">Completadas</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">8/12</div>
            <div className="text-white/70 text-sm">4 tareas pendientes</div>
          </div>
        </div>

        {/* Sección de actividades recientes */}
        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-500 ${elementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
            Actividades Recientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actividad 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full">
                    <BookOpen className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Lección 8: Variables Avanzadas</h3>
                    <p className="text-white/70 text-sm">Completada hace 2 días</p>
                  </div>
                </div>
                <ChevronRight className="text-white/50 group-hover:text-white/80 transition-colors" size={20} />
              </div>
              <div className="text-white/80 text-sm">
                Excelente trabajo en esta lección. Puntuación: 92%
              </div>
            </div>

            {/* Actividad 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-teal-400 to-blue-500 p-2 rounded-full">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Tarea: Proyecto Final</h3>
                    <p className="text-white/70 text-sm">Vence en 3 días</p>
                  </div>
                </div>
                <ChevronRight className="text-white/50 group-hover:text-white/80 transition-colors" size={20} />
              </div>
              <div className="text-white/80 text-sm">
                Desarrollar una aplicación web completa usando los conceptos aprendidos.
              </div>
            </div>
          </div>
        </div>

        {/* Botón para volver a cursos */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/alumno/cursos')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Ver Todos Mis Cursos
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailDashboard;
