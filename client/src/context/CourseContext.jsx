import React, { createContext, useContext, useState } from 'react';

// Datos simulados de cursos
const mockCourses = [
  {
    id: 'curso1',
    nombre: 'Matemáticas Avanzadas',
    instructor: {
      nombre: 'Dr. Ana García',
      especialidad: 'Matemáticas Aplicadas',
      experiencia: '15 años'
    },
    tareas: [
      { id: 1, titulo: 'Tarea 1', estado: 'pendiente' },
      { id: 2, titulo: 'Tarea 2', estado: 'entregada' },
    ],
    actividades: [
      { id: 1, nombre: 'Foro de discusión', completada: true },
      { id: 2, nombre: 'Quiz 1', completada: false },
    ],
    metricas: {
      promedio: 9.1,
      avance: '60%',
    },
  },
  {
    id: 'curso2',
    nombre: 'Programación Web',
    instructor: {
      nombre: 'Ing. Carlos Mendoza',
      especialidad: 'Desarrollo Full Stack',
      experiencia: '10 años'
    },
    tareas: [
      { id: 1, titulo: 'Proyecto HTML', estado: 'pendiente' },
      { id: 2, titulo: 'Examen CSS', estado: 'pendiente' },
    ],
    actividades: [
      { id: 1, nombre: 'Laboratorio', completada: false },
      { id: 2, nombre: 'Quiz 2', completada: false },
    ],
    metricas: {
      promedio: 8.7,
      avance: '40%',
    },
  },
];

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
