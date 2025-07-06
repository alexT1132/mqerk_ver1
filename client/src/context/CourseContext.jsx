import React, { createContext, useContext, useState } from 'react';

// TODO: Los datos de cursos serán proporcionados por el backend
// Estructura esperada: { id, nombre, instructor: { nombre, especialidad, experiencia }, tareas: [], actividades: [], metricas: { promedio, avance } }
// Curso de prueba para testing - ELIMINAR en producción
const testCourse = {
  id: 'test-course-001',
  title: 'Curso de Prueba - Matemáticas Avanzadas',
  instructor: 'Prof. Testing',
  image: 'https://placehold.co/400x200/4f46e5/ffffff?text=Matematicas',
  category: 'exactas',
  type: 'curso',
  isActive: true,
  metadata: [
    { icon: 'reloj', text: '12 semanas' },
    { icon: 'libro', text: '24 lecciones' },
    { icon: 'estudiante', text: '150 estudiantes' }
  ]
};

const mockCourses = [testCourse]; // Incluir curso de prueba para testing

const CourseContext = createContext();

export const useCourse = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
  const [courses] = useState(mockCourses);

  const changeCourse = (id) => {
    const found = courses.find((c) => c.id === id);
    if (found) setSelectedCourse(found);
  };

  return (
    <CourseContext.Provider value={{ selectedCourse, courses, changeCourse }}>
      {children}
    </CourseContext.Provider>
  );
};
