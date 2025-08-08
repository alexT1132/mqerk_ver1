import React, { createContext, useContext, useState } from 'react';

/**
 * CONTEXTO PARA CATÁLOGO GENERAL DE CURSOS
 * 
 * Propósito: Manejar el catálogo completo de cursos disponibles en la plataforma
 * - Cursos ofertados por la institución
 * - Información general de cada curso
 * - Filtros y búsqueda de cursos
 * - NO incluye información específica del estudiante
 * 
 * Responsabilidades:
 * - Listar todos los cursos disponibles
 * - Mostrar detalles de un curso específico
 * - Filtrar cursos por categoría/tipo
 * - Buscar cursos
 * 
 * NO es responsable de:
 * - Cursos matriculados del estudiante (usar StudentContext)
 * - Progreso del estudiante (usar StudentContext)
 * - Curso actual del estudiante (usar StudentContext)
 */

// TODO: BACKEND - Estos datos serán proporcionados por el endpoint de catálogo general
// Estructura esperada del API: GET /api/courses/catalog
// {
//   courses: [
//     {
//       id: string,
//       title: string,
//       instructor: string,
//       image: string,
//       category: string,
//       type: string,
//       isActive: boolean,
//       metadata: Array<{ icon: string, text: string }>,
//       description: string,
//       requirements: string[],
//       duration: string,
//       level: string
//     }
//   ]
// }

// Mock data para testing - ELIMINAR cuando se conecte al backend
const mockCatalogCourses = [
  {
    id: 'catalog-1',
    title: 'Desarrollo Web Completo',
    instructor: 'Ing. Carlos Rodríguez',
    image: 'https://placehold.co/400x250/dc2626/ffffff?text=Desarrollo+Web',
    category: 'programacion',
    type: 'curso',
    isActive: true,
    level: 'intermedio',
    duration: '6 meses',
    description: 'Aprende desarrollo web desde cero hasta nivel avanzado',
    requirements: ['Conocimientos básicos de computación', 'Dedicación de 10 horas por semana'],
    metadata: [
      { icon: 'reloj', text: '6 meses intensivos' },
      { icon: 'libro', text: '48 módulos' },
      { icon: 'estudiante', text: '1,200 estudiantes' }
    ]
  },
  {
    id: 'catalog-2',
    title: 'Inglés Conversacional Avanzado',
    instructor: 'Prof. María González',
    image: 'https://placehold.co/400x250/4f46e5/ffffff?text=Inglés',
    category: 'idiomas',
    type: 'curso',
    isActive: true,
    level: 'avanzado',
    duration: '4 meses',
    description: 'Perfecciona tu inglés conversacional con profesores nativos',
    requirements: ['Nivel B1 de inglés', 'Micrófono y cámara'],
    metadata: [
      { icon: 'reloj', text: '4 meses' },
      { icon: 'libro', text: '32 lecciones' },
      { icon: 'estudiante', text: '800 estudiantes' }
    ]
  },
  {
    id: 'catalog-3',
    title: 'Matemáticas para Ingeniería',
    instructor: 'Dr. Ana López',
    image: 'https://placehold.co/400x250/059669/ffffff?text=Matemáticas',
    category: 'exactas',
    type: 'curso',
    isActive: true,
    level: 'avanzado',
    duration: '5 meses',
    description: 'Domina las matemáticas necesarias para carreras de ingeniería',
    requirements: ['Matemáticas de bachillerato', 'Calculadora científica'],
    metadata: [
      { icon: 'reloj', text: '5 meses' },
      { icon: 'libro', text: '60 ejercicios' },
      { icon: 'estudiante', text: '450 estudiantes' }
    ]
  }
];

const CourseContext = createContext();

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  // Estado para el catálogo general de cursos
  const [catalogCourses] = useState(mockCatalogCourses);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: BACKEND - Función para cargar catálogo desde API
  const loadCourseCatalog = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('/api/courses/catalog', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      // const data = await response.json();
      // setCatalogCourses(data.courses);
      
      // Mock para testing - eliminar cuando se implemente backend
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Función para seleccionar un curso del catálogo (para ver detalles)
  const selectCourseFromCatalog = (courseId) => {
    const course = catalogCourses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  // Función para buscar cursos en el catálogo
  const searchCourses = (term) => {
    setSearchTerm(term);
  };

  // Función para filtrar por categoría
  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };

  // Función para obtener cursos filtrados
  const getFilteredCourses = () => {
    let filtered = catalogCourses;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => 
        course.category === selectedCategory || course.type === selectedCategory
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Función para obtener detalles de un curso específico
  const getCourseDetails = (courseId) => {
    return catalogCourses.find(course => course.id === courseId) || null;
  };

  // Función para obtener categorías disponibles
  const getAvailableCategories = () => {
    const categories = [...new Set(catalogCourses.map(course => course.category))];
    return categories;
  };

  const value = {
    // Estado del catálogo
    catalogCourses,
    selectedCourse,
    searchTerm,
    selectedCategory,
    isLoading,
    error,
    
    // Funciones para manejo del catálogo
    loadCourseCatalog,
    selectCourseFromCatalog,
    searchCourses,
    filterByCategory,
    getFilteredCourses,
    getCourseDetails,
    getAvailableCategories,
    
    // Funciones de utilidad
    clearSelection: () => setSelectedCourse(null),
    clearSearch: () => setSearchTerm(''),
    clearFilters: () => {
      setSearchTerm('');
      setSelectedCategory('all');
    }
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};