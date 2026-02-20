// imoprtaciones de React y hooks
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCourse } from '../../context/CourseContext.jsx';
// Importaciones de Recharts para gráficos
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// Importaciones de Material UI Charts
import { BarChart as MUIBarChart } from '@mui/x-charts/BarChart';
// APIs para cargar datos reales
import { resumenQuizzesEstudiante } from '../../api/quizzes.js';
import { resumenActividadesEstudiante } from '../../api/actividades.js';
import { resumenSimulacionesEstudiante } from '../../api/simulaciones.js';
import { getResumenAsistenciaEstudiante } from '../../api/asistencias.js';
import {
  ChartModal,
  ActivitiesQuizCard,
  SimulatorsCards,
  SubjectResultsCard,
  FeedbackCard,
  DashboardHeader,
  PersonalDataCollapsible,
  getSimulatorRecommendation,
  calculateAcademicStatus,
} from './metricsAlumno/index.js';


const reeseProfilePic = "https://placehold.co/128x128/A0AEC0/FFFFFF?text=Foto";

// --- CONSTANTES ---
// NOTA: Los datos mock ya no se usan - el componente ahora usa solo datos reales de las APIs
// Se mantienen aquí solo como referencia/documentación
// Datos de usuario por defecto (NO SE USAN - solo referencia)
 
// const DEFAULT_USER_DATA = {
//   name: "Mari Lu Rodríguez Marquez",
//   email: "XXXXXXXXXXXXX@gmail.com",
//   telefono: "",
//   comunidad: "",
//   telTutor: "",
//   nombreTutor: "",
//   activeCourse: "XXXXXXXXX",
//   currentBachillerato: "XXXXXXXXXXXXX",
//   academy: "MQerK Academy",
//   universityOption: "XXXXXXXXX",
//   licenciaturaOption: "XXXXXXXXX",
//   advisor: "L.C.Q Kelvin Valentin Gomez Ramirez",
//   group: "xXXXX",
//   folio: "MEEAU25-0001",
//   profilePic: reeseProfilePic,
// };

// Datos de métricas por defecto (NO SE USAN - solo referencia)
 
// DEFAULT_METRICS_DATA eliminado: ya no se usa (solo datos reales/props).

// Helpers de cálculo/mensajes se movieron a `./metricsAlumno/utils.js`.

// ChartModal + UI helpers se movieron a `./metricsAlumno/*` para reducir este archivo.

/**
 * Componente AlumnoDashboardMetrics
 * Muestra las métricas y el resumen del dashboard del alumno.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} [props.userData] - Datos de usuario opcionales para sobrescribir los valores por defecto.
 * @param {Object} [props.metricsData] - Datos de métricas opcionales para sobrescribir los valores por defecto.
 * @param {boolean} [props.isLoading=false] - Bandera para mostrar un estado de carga.
 * @param {string|null} [props.error=null] - Mensaje de error a mostrar si la carga de datos falla.
 */
export function AlumnoDashboardMetrics({ userData, metricsData, isLoading = false, error = null, showMetrics = false }) {
  const { selectedCourse } = useCourse();
  const { alumno } = useAuth();

  // Estados para datos reales de las APIs
  const [realMetricsData, setRealMetricsData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [showPersonalData, setShowPersonalData] = useState(false); // Estado para colapsar datos personales por defecto

  // Helper to build absolute URL for stored photos
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const apiUrl = (import.meta?.env?.VITE_API_URL) || `http://${host}:1002/api`;
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
  const buildStaticUrl = (p) => {
    if (!p) return reeseProfilePic;
    if (/^https?:\/\//i.test(p)) return p;
    return `${apiOrigin}${p.startsWith('/') ? '' : '/'}${p}`;
  };

  // Función para transformar datos de APIs al formato esperado
  const transformApiDataToMetrics = useMemo(() => {
    return (quizzesData, actividadesData, simulacionesData, asistenciaResumen) => {
      // Calcular métricas de quizzes
      const quizzesArray = Array.isArray(quizzesData) ? quizzesData : [];
      const quizzesAprobados = quizzesArray.filter(q => {
        const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
        return puntaje != null && Number(puntaje) >= 70;
      }).length;
      const totalQuizzes = quizzesArray.length;
      const quizProgress = totalQuizzes > 0 ? Math.round((quizzesAprobados / totalQuizzes) * 100) : 0;

      // Calcular métricas de actividades
      const actividadesArray = Array.isArray(actividadesData) ? actividadesData : [];
      const actividadesCompletadas = actividadesArray.filter(a => {
        const estado = a.entrega_estado;
        return estado === 'revisada' || estado === 'entregada';
      }).length;
      const totalActividades = actividadesArray.length;
      const activitiesProgress = totalActividades > 0 ? Math.round((actividadesCompletadas / totalActividades) * 100) : 0;

      // Calcular promedio mensual de quizzes (último intento o mejor puntaje)
      // Convertir de escala 0-100 a 0-10 para el cálculo
      const quizScores = quizzesArray
        .map(q => {
          const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
          if (puntaje == null) return null;
          const score = Number(puntaje);
          // Si el puntaje es mayor a 10, asumimos que está en escala 0-100 y lo convertimos
          return score > 10 ? score / 10 : score;
        })
        .filter(p => p != null && p >= 0 && p <= 10);
      const monthlyAverage = quizScores.length > 0
        ? Math.round((quizScores.reduce((sum, p) => sum + p, 0) / quizScores.length) * 10) // Convertir de vuelta a 0-100
        : 0;

      // Calcular promedio de actividades (calificaciones)
      // Convertir de escala 0-100 a 0-10 para el cálculo
      const actividadScores = actividadesArray
        .map(a => {
          const calif = a.calificacion;
          if (calif == null || isNaN(Number(calif))) return null;
          const score = Number(calif);
          // Si la calificación es mayor a 10, asumimos que está en escala 0-100 y la convertimos
          return score > 10 ? score / 10 : score;
        })
        .filter(c => c != null && c >= 0 && c <= 10);
      const actividadAverage = actividadScores.length > 0
        ? Math.round((actividadScores.reduce((sum, c) => sum + c, 0) / actividadScores.length) * 10) // Convertir de vuelta a 0-100
        : 0;

      // Promedio general (ponderado: 60% quizzes, 40% actividades)
      // Solo calcular si hay al menos un tipo de datos
      let overallAverage = 0;
      if (quizScores.length > 0 && actividadScores.length > 0) {
        overallAverage = Math.round((monthlyAverage * 0.6) + (actividadAverage * 0.4));
      } else if (quizScores.length > 0) {
        overallAverage = monthlyAverage;
      } else if (actividadScores.length > 0) {
        overallAverage = actividadAverage;
      }

      // Generar datos para gráfico de progreso mensual (historial real)
      const currentYear = new Date().getFullYear();
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      const getDate = (d) => d ? new Date(d) : null;

      // Helper para calcular promedios acumulados por mes
      const monthlyAverageData = months.map((month, idx) => {
        const limitDate = new Date(currentYear, idx + 1, 0, 23, 59, 59); // Fin del mes

        // Filtrar quizzes hasta esa fecha
        const relevantQuizzes = quizzesArray.filter(q => {
          const fecha = getDate(q.fecha_oficial_intento ?? q.fecha_ultimo_intento ?? q.created_at);
          return fecha && fecha <= limitDate;
        }).map(q => {
          const puntaje = q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje;
          const val = Number(puntaje);
          return val > 10 ? val / 10 : val; // Normalizar 0-10
        }).filter(p => p != null);

        // Filtrar actividades hasta esa fecha
        const relevantActs = actividadesArray.filter(a => {
          const fecha = getDate(a.entregada_at ?? a.revisada_at ?? a.created_at);
          return fecha && fecha <= limitDate;
        }).map(a => {
          const val = Number(a.calificacion);
          if (isNaN(val) || a.calificacion == null) return null;
          return val > 10 ? val / 10 : val; // Normalizar 0-10
        }).filter(p => p != null);

        // Calcular promedio ponderado acumulado
        let qAvg = 0;
        if (relevantQuizzes.length > 0) {
          qAvg = relevantQuizzes.reduce((sum, val) => sum + val, 0) / relevantQuizzes.length;
        }

        let aAvg = 0;
        if (relevantActs.length > 0) {
          aAvg = relevantActs.reduce((sum, val) => sum + val, 0) / relevantActs.length;
        }

        let avg = 0;
        if (relevantQuizzes.length > 0 && relevantActs.length > 0) {
          avg = (qAvg * 0.6) + (aAvg * 0.4);
        } else if (relevantQuizzes.length > 0) {
          avg = qAvg;
        } else if (relevantActs.length > 0) {
          avg = aAvg;
        }

        return {
          month,
          promedio: Math.round(avg * 10) // Escala 0-100
        };
      });

      // Generar datos para gráfico de actividades/quiz (últimos 8 meses - acumulativo real)
      const last8Months = months.slice(-8);
      const activityProgressChartData = last8Months.map((period, idx) => {
        // Mapear idx (0-7) a mes real (4-11, May-Dic)
        // Nota: Esto asume visualización fija May-Dic. Idealmente debería ser dinámico.
        const monthIndex = 4 + idx;
        const limitDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59);

        const quizzesPasados = quizzesArray.filter(q => {
          const fecha = getDate(q.fecha_oficial_intento ?? q.fecha_ultimo_intento ?? q.created_at);
          const puntaje = Number(q.oficial_puntaje ?? q.mejor_puntaje ?? q.ultimo_puntaje);
          return fecha && fecha <= limitDate && puntaje >= 70;
        }).length;

        const actsCompletadas = actividadesArray.filter(a => {
          const fecha = getDate(a.entregada_at ?? a.revisada_at ?? a.created_at);
          const estado = a.entrega_estado;
          return fecha && fecha <= limitDate && (estado === 'revisada' || estado === 'entregada');
        }).length;

        return {
          period,
          quizts: totalQuizzes > 0 ? Math.round((quizzesPasados / totalQuizzes) * 100) : 0,
          activities: totalActividades > 0 ? Math.round((actsCompletadas / totalActividades) * 100) : 0
        };
      });

      // Calcular feedback score (promedio de calificaciones de actividades o quizzes)
      const feedbackScore = actividadAverage || monthlyAverage || 0;

      // Obtener porcentaje de asistencia del resumen
      // El backend devuelve el porcentaje ya calculado, pero también tenemos total y asistidas
      const attendanceGeneral = asistenciaResumen?.general;
      let attendancePercentage = null;
      let attendanceData = null;
      if (attendanceGeneral) {
        // Usar el porcentaje calculado por el backend, o calcularlo si no está disponible
        attendancePercentage = attendanceGeneral.porcentaje != null
          ? Number(attendanceGeneral.porcentaje)
          : (attendanceGeneral.total > 0
            ? Math.round((attendanceGeneral.asistidas / attendanceGeneral.total) * 100)
            : null);
        // Guardar también los datos de total y asistidas para mostrar información más precisa
        attendanceData = {
          total: attendanceGeneral.total || 0,
          asistidas: attendanceGeneral.asistidas || 0,
          faltas: attendanceGeneral.faltas || 0
        };
      }

      return {
        attendance: attendancePercentage, // Porcentaje de asistencia desde la API
        attendanceData, // Datos adicionales de asistencia (total, asistidas, faltas)
        activities: {
          current: actividadesCompletadas,
          total: totalActividades || 0
        },
        quiz: {
          current: quizzesAprobados,
          total: totalQuizzes || 0
        },
        monthlyAverage: overallAverage,
        monthlyAverageData,
        activityProgress: activityProgressChartData,
        feedbackScore,

        // Procesar simuladores - separar generales de específicos
        simulatorGrades: (() => {
          const simulacionesArray = Array.isArray(simulacionesData) ? simulacionesData : [];

          if (simulacionesArray.length === 0) {
            return { generales: [], especificos: [] };
          }

          // Separar por tipo:
          // - GENERALES: id_area null (sin categoría) o id_area 1-5 (áreas fundamentales)
          // - ESPECÍFICOS: id_area >= 100 (módulos universitarios: UNAM, IPN, etc.)
          const simuladoresGenerales = simulacionesArray.filter(sim => {
            const area = sim.id_area;
            // Considerar como general si:
            // 1. No tiene id_area (null/undefined) - simuladores sin categoría específica
            // 2. Tiene id_area entre 1-5 - áreas fundamentales
            if (area === null || area === undefined) return true;
            const areaNum = Number(area);
            return areaNum >= 1 && areaNum <= 5;
          });

          const simuladoresEspecificos = simulacionesArray.filter(sim => {
            const area = sim.id_area;
            // Solo considerar como específico si tiene id_area >= 100
            if (area === null || area === undefined) return false;
            const areaNum = Number(area);
            return areaNum >= 100;
          });

          // console.log('🔍 Simuladores generales filtrados:', simuladoresGenerales);
          // console.log('🔍 Simuladores específicos filtrados:', simuladoresEspecificos);

          // Calcular puntajes por área general (mejor puntaje de cada área)
          const puntajesPorArea = {};

          // Primero, calcular puntajes para áreas 1-5
          [1, 2, 3, 4, 5].forEach(areaId => {
            const simsArea = simuladoresGenerales.filter(s => Number(s.id_area) === areaId);
            if (simsArea.length > 0) {
              const puntajes = simsArea.map(sim => {
                const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
                return Number(puntaje) || 0;
              });
              puntajesPorArea[areaId] = Math.max(...puntajes, 0);
            } else {
              puntajesPorArea[areaId] = 0;
            }
          });

          // Luego, calcular puntaje para simuladores sin categoría (id_area null)
          const simsSinCategoria = simuladoresGenerales.filter(s => s.id_area === null || s.id_area === undefined);
          if (simsSinCategoria.length > 0) {
            const puntajes = simsSinCategoria.map(sim => {
              const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
              return Number(puntaje) || 0;
            });
            puntajesPorArea[0] = Math.max(...puntajes, 0); // Usar área 0 para "General"
          } else {
            puntajesPorArea[0] = 0;
          }

          // Calcular puntajes por módulo específico (solo id_area >= 100)
          const puntajesPorModulo = {};

          simuladoresEspecificos.forEach(sim => {
            const area = sim.id_area;
            const key = `modulo_${area}`;

            if (!puntajesPorModulo[key]) {
              puntajesPorModulo[key] = {
                puntajes: [],
                nombre: `Módulo ${area}`,
                id_area: area
              };
            }

            const puntaje = sim.mejor_puntaje ?? sim.ultimo_puntaje ?? sim.oficial_puntaje ?? 0;
            puntajesPorModulo[key].puntajes.push(Number(puntaje) || 0);
          });

          // console.log('🔍 Puntajes por área (incluyendo área 0 para generales):', puntajesPorArea);
          // console.log('🔍 Puntajes por módulo:', puntajesPorModulo);

          return {
            generales: [
              { area: 'General', id_area: 0, puntaje: puntajesPorArea[0] || 0, color: '#A855F7' },
              { area: 'Español', id_area: 1, puntaje: puntajesPorArea[1] || 0, color: '#8B5CF6' },
              { area: 'Matemáticas', id_area: 2, puntaje: puntajesPorArea[2] || 0, color: '#EC4899' },
              { area: 'Hab. Trans.', id_area: 3, puntaje: puntajesPorArea[3] || 0, color: '#F59E0B' },
              { area: 'L. Extranjera', id_area: 4, puntaje: puntajesPorArea[4] || 0, color: '#6366F1' }
            ],
            especificos: Object.entries(puntajesPorModulo).map(([key, data]) => ({
              modulo: data.nombre,
              id_area: data.id_area,
              puntaje: Math.max(...data.puntajes, 0),
              color: '#10B981'
            }))
          };
        })(),

        // Datos de materias - se mantendrán vacíos hasta que haya datos reales
        subjectResults: {
          total: 0,
          subjects: []
        },
      };
    };
  }, []);

  // Cargar datos reales de las APIs
  useEffect(() => {
    if (!alumno?.id || !showMetrics) return;

    let alive = true;
    setLoadingMetrics(true);
    setMetricsError(null);

    const loadMetrics = async () => {
      try {
        // Obtener rango de fechas del último mes para el resumen de asistencia
        const fechaHasta = new Date().toISOString().split('T')[0];
        const fechaDesde = new Date();
        fechaDesde.setMonth(fechaDesde.getMonth() - 1);
        const fechaDesdeStr = fechaDesde.toISOString().split('T')[0];

        const [quizzesRes, actividadesRes, simulacionesRes, asistenciaRes] = await Promise.allSettled([
          resumenQuizzesEstudiante(alumno.id),
          resumenActividadesEstudiante(alumno.id),
          resumenSimulacionesEstudiante(alumno.id),
          getResumenAsistenciaEstudiante(alumno.id, {
            desde: fechaDesdeStr,
            hasta: fechaHasta
          })
        ]);

        if (!alive) return;

        const quizzesData = quizzesRes.status === 'fulfilled'
          ? (quizzesRes.value?.data?.data || quizzesRes.value?.data || [])
          : [];
        const actividadesData = actividadesRes.status === 'fulfilled'
          ? (actividadesRes.value?.data || actividadesRes.value || [])
          : [];
        const simulacionesData = simulacionesRes.status === 'fulfilled'
          ? (simulacionesRes.value?.data?.data || simulacionesRes.value?.data || [])
          : [];
        const asistenciaResumen = asistenciaRes.status === 'fulfilled'
          ? (asistenciaRes.value?.data || asistenciaRes.value || null)
          : null;

        // DEBUG TEMPORAL: Ver estructura de simuladores
        // console.log('🎯 DEBUG SIMULADORES - Datos completos:', simulacionesData);
        // console.log('🎯 DEBUG SIMULADORES - Total:', simulacionesData.length);
        // if (simulacionesData.length > 0) {
        //   console.log('🎯 DEBUG SIMULADORES - Primer elemento:', simulacionesData[0]);
        // }

        const transformed = transformApiDataToMetrics(quizzesData, actividadesData, simulacionesData, asistenciaResumen);
        setRealMetricsData(transformed);
      } catch (err) {
        if (!alive) return;
        console.error('Error cargando métricas:', err);
        setMetricsError(err?.message || 'Error al cargar métricas');
        // Mantener datos por defecto en caso de error
        setRealMetricsData(null);
      } finally {
        if (alive) setLoadingMetrics(false);
      }
    };

    loadMetrics();
    return () => { alive = false; };
  }, [alumno?.id, showMetrics, transformApiDataToMetrics]);

  // Map alumno from AuthContext into userData shape (sin datos mock)
  const alumnoUserData = alumno ? {
    name: `${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || '',
    email: alumno.email || '',
    telefono: alumno.telefono || '',
    comunidad: alumno.comunidad1 || '',
    telTutor: alumno.tel_tutor || '',
    nombreTutor: alumno.nombre_tutor || '',
    folio: alumno.folio || '',
    profilePic: buildStaticUrl(alumno.foto) || reeseProfilePic,
  } : {};

  // Fusionar los datos: solo usar datos reales o props, sin datos mock por defecto
  const mergedMetricsData = useMemo(() => {
    // Si hay datos reales de API, usarlos como base
    if (realMetricsData) {
      return { ...realMetricsData, ...metricsData };
    }
    // Si hay datos de props, usarlos
    if (metricsData) {
      return metricsData;
    }
    // Si no hay datos, retornar estructura vacía (no mock)
    return {
      attendance: null,
      activities: { current: 0, total: 0 },
      quiz: { current: 0, total: 0 },
      monthlyAverage: 0,
      monthlyAverageData: [],
      activityProgress: [],
      feedbackScore: 0,
      subjectResults: { total: 0, subjects: [] },
      simulatorGrades: [],
    };
  }, [realMetricsData, metricsData]);

  // Determinar si estamos cargando (combinar props y estado interno)
  const isActuallyLoading = isLoading || loadingMetrics;
  const actualError = error || metricsError;

  // Si hay un curso seleccionado, usar sus datos simulados para métricas (solo si no hay datos reales)
  const currentMetricsData = useMemo(() => {
    if (selectedCourse?.metricas && !realMetricsData) {
      return {
        ...mergedMetricsData,
        monthlyAverage: selectedCourse.metricas.promedio || mergedMetricsData.monthlyAverage,
        // Calcular progreso de actividades basado en el avance del curso
        activities: {
          ...mergedMetricsData.activities,
          current: (() => {
            const avanceNum = Number.parseInt(selectedCourse.metricas.avance, 10);
            const avance = Number.isFinite(avanceNum) ? avanceNum : 0;
            return Math.floor((avance / 100) * mergedMetricsData.activities.total);
          })()
        }
      };
    }
    return mergedMetricsData;
  }, [selectedCourse, mergedMetricsData, realMetricsData]);

  // Calcular el estado académico dinámicamente (sin mutar objetos)
  const calculatedAcademicStatus = useMemo(() => calculateAcademicStatus(currentMetricsData), [
    currentMetricsData.attendance,
    currentMetricsData.monthlyAverage,
    currentMetricsData.activities?.current,
    currentMetricsData.activities?.total,
    currentMetricsData.quiz?.current,
    currentMetricsData.quiz?.total,
  ]);
  const currentMetricsWithStatus = useMemo(() => ({
    ...currentMetricsData,
    academicStatus: calculatedAcademicStatus,
  }), [currentMetricsData, calculatedAcademicStatus]);

  // Fusiona: alumno (Auth) <- props (override) - sin datos mock
  const currentUserData = {
    name: '',
    email: '',
    telefono: '',
    comunidad: '',
    telTutor: '',
    nombreTutor: '',
    folio: '',
    profilePic: reeseProfilePic,
    ...alumnoUserData,
    ...userData
  };

  const buildCourseCode = () => 'MEEAU';
  const onlyDigits = (v) => typeof v === 'string' ? /^\d+$/.test(v) : (typeof v === 'number' && Number.isFinite(v));
  const seqNum = onlyDigits(currentUserData.folio) ? parseInt(currentUserData.folio, 10) : null;
  const yy = String((alumno?.anio && Number(alumno?.anio)) ? Number(alumno.anio) : new Date().getFullYear()).slice(-2);
  const displayFolio = seqNum != null
    ? `${buildCourseCode()}${yy}-${String(seqNum).padStart(4, '0')}`
    : currentUserData.folio;

  // Estados para modales de gráficos (todos los hooks deben estar antes de returns condicionales)
  const [isActivitiesChartModalOpen, setIsActivitiesChartModalOpen] = useState(false);
  const [isMonthlyAverageModalOpen, setIsMonthlyAverageModalOpen] = useState(false);
  const [isSubjectResultsModalOpen, setIsSubjectResultsModalOpen] = useState(false);

  // Usar directamente los datos reales sin perfiles de testing
  const finalMetricsData = useMemo(() => currentMetricsWithStatus, [currentMetricsWithStatus]);

  // Recalcular el estado académico con el perfil actual (sin mutar)
  const finalAcademicStatus = useMemo(() => calculateAcademicStatus(finalMetricsData), [
    finalMetricsData.attendance,
    finalMetricsData.monthlyAverage,
    finalMetricsData.activities?.current,
    finalMetricsData.activities?.total,
    finalMetricsData.quiz?.current,
    finalMetricsData.quiz?.total,
  ]);

  // Prepara los datos para el PieChart de Recharts
  const pieChartData = useMemo(() => {
    const subjects = finalMetricsData?.subjectResults?.subjects || currentMetricsData?.subjectResults?.subjects || [];
    const totalPercent = subjects.reduce((sum, subject) => sum + subject.percent, 0);

    return subjects.map((subject, index) => {
      const normalizedPercent = (subject.percent / totalPercent) * 100;
      return {
        name: subject.fullName,
        value: normalizedPercent,
        originalPercent: subject.percent,
        code: subject.code,
        color: subject.color,
      };
    });
  }, [finalMetricsData?.subjectResults?.subjects, currentMetricsData?.subjectResults?.subjects]);

  // Obtiene recomendaciones dinámicas basadas en la puntuación total del simulador
  const { subjects: recommendedSubjects, message: recommendationMessage } = useMemo(() => {
    const subjectResults = finalMetricsData?.subjectResults || currentMetricsData?.subjectResults;
    return getSimulatorRecommendation(
      subjectResults?.total || 0,
      subjectResults?.subjects || []
    );
  }, [finalMetricsData?.subjectResults, currentMetricsData?.subjectResults]);

  // Custom Tooltip mejorado para el PieChart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 relative z-[9999] backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: data.color }}
            ></div>
            <div>
              <p className="font-bold text-sm text-gray-100">{data.name}</p>
              <p className="text-xl font-black" style={{ color: data.color }}>
                {data.originalPercent}%
              </p>
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip para gráficos de barras
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-4 rounded-xl shadow-2xl border border-blue-400 relative z-[9999] backdrop-blur-sm">
          <p className="font-bold text-blue-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium text-gray-200">{entry.dataKey}:</span>
              <span className="font-bold text-lg" style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </div>
          ))}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-800"></div>
        </div>
      );
    }
    return null;
  };

  // Custom Label para el PieChart (muestra la abreviación)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8px"
        fontWeight="bold"
      >
        {pieChartData[index].code}
      </text>
    );
  };

  // --- Renderizado Condicional: Estado de Carga ---
  if (isActuallyLoading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  // Si solo queremos mostrar foto + nombre + datos personales, salimos temprano
  if (!showMetrics) {
    return (
      <div className="w-full font-inter text-gray-800 px-2 sm:px-3 md:px-4">

        {/* Sección de Encabezado del Dashboard */}
        <DashboardHeader displayFolio={displayFolio} />

        {/* Sección de Información del Usuario (solo datos personales) */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 hover:shadow-3xl transition-all duration-150">

          {/* Columna izquierda: Foto de perfil y nombre */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <img
                src={currentUserData.profilePic}
                alt={currentUserData.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-150 hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = reeseProfilePic; }}
              />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <div className="text-center bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100">
              <p className="text-lg font-bold text-gray-900 mb-1">{currentUserData.name}</p>
              <div className="flex items-center justify-center text-xs text-green-600 font-medium">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Estudiante Activo
              </div>
            </div>
          </div>

          {/* Columnas derechas para detalles de datos personales */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-lg">
                <h3 className="text-lg font-bold text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  DATOS PERSONALES
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Correo */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Correo electrónico</p>
                      <p className="text-sm font-bold text-gray-800 break-all">{currentUserData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Teléfono estudiante */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.telefono || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Municipio / Comunidad */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.comunidad || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Teléfono tutor */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.telTutor || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Nombre tutor */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-150 hover:-translate-y-1 sm:col-span-2">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nombre de mi tutor</p>
                      <p className="text-sm font-bold text-gray-800">{currentUserData.nombreTutor || '—'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Eliminar contenedor principal para mejor integración - solo contenido directo
  return (
    <div className="w-full font-inter text-gray-800 pt-8 sm:pt-10 md:pt-11 px-2 sm:px-3 md:px-4">

      {/* Sección de Encabezado del Dashboard */}
      <DashboardHeader displayFolio={displayFolio} />

      {/* Sección de Información del Usuario - Colapsable */}
      <PersonalDataCollapsible
        currentUserData={currentUserData}
        showPersonalData={showPersonalData}
        onToggle={() => setShowPersonalData((v) => !v)}
        fallbackProfilePic={reeseProfilePic}
      />

      {/* Sección "TU STATUS MENSUAL" */}
      <div className="text-center mb-6 mt-8">
        <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
          <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TU STATUS MENSUAL
          </h2>
        </div>
      </div>

      {/* Primera fila de métricas (5 columnas) - Diseño MÁS GRANDE y premium */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-16 max-w-8xl mx-auto">

        {/* Métrica de Asistencia - Diseño Moderno con Gradientes Vibrantes */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Porcentaje de días asistidos en el mes actual">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Tarjeta principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(6,182,212,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">

              {/* Icono animado con efecto de brillo */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>

              {/* Información principal - Porcentaje grande */}
              <div className="text-center mb-3">
                {(() => {
                  const attendance = finalMetricsData.attendance ?? null;

                  // Intentar obtener datos reales del resumen de asistencia si están disponibles
                  const attendanceData = finalMetricsData.attendanceData;
                  const totalDays = attendanceData?.total ?? null;
                  const attendedDays = attendanceData?.asistidas ?? null;

                  if (attendance === null || attendance === undefined) {
                    return (
                      <>
                        <div className="text-2xl font-black text-gray-400 mb-1">
                          —
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin datos
                        </div>
                      </>
                    );
                  }

                  // Si tenemos datos reales de días, usarlos; si no, calcular basado en el mes actual
                  let displayDays = null;
                  let displayTotal = null;

                  if (totalDays != null && attendedDays != null) {
                    displayDays = attendedDays;
                    displayTotal = totalDays;
                  } else {
                    // Fallback: calcular basado en días del mes actual
                    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                    displayDays = Math.round((attendance / 100) * daysInMonth);
                    displayTotal = daysInMonth;
                  }

                  return (
                    <>
                      <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {Math.round(attendance)}%
                      </div>
                      <div className="text-sm text-white/90 font-bold drop-shadow-md">
                        {displayDays} de {displayTotal} días
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Barra de progreso con efecto glassmorphism */}
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                <div
                  className="h-full bg-gradient-to-r from-white via-cyan-100 to-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(0, finalMetricsData.attendance ?? 0))}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Asistencia
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Este mes
          </p>
        </div>

        {/* Métrica de Actividades - Diseño Moderno con Gradiente Naranja */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Progreso en actividades del curso actual">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Card principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(251,146,60,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">
              {/* Header con icono animado */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>

              {/* Progreso principal */}
              <div className="text-center mb-3">
                {(() => {
                  const current = finalMetricsData.activities?.current ?? 0;
                  const total = finalMetricsData.activities?.total ?? 0;
                  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

                  if (total === 0) {
                    return (
                      <>
                        <div className="text-xl font-black text-gray-400 mb-1">
                          0/0
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin actividades
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="text-2xl sm:text-3xl font-black text-white mb-1 drop-shadow-lg">
                        {current}/{total}
                      </div>
                      <div className="text-xs sm:text-sm text-white/90 font-bold drop-shadow-md">
                        {percentage}%
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Barra de progreso con glassmorphism */}
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                {(() => {
                  const current = finalMetricsData.activities?.current ?? 0;
                  const total = finalMetricsData.activities?.total ?? 0;
                  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
                  return (
                    <div
                      className="h-full bg-gradient-to-r from-white via-amber-100 to-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Actividades
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Curso actual
          </p>
        </div>

        {/* Métrica de Quiz - Diseño Moderno con Gradiente Verde */}
        <div className="flex flex-col items-center group cursor-pointer transition-all duration-300" title="Porcentaje de quizzes aprobados">
          <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Card principal con gradiente oscuro para mejor legibilidad */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500">

              {/* Icono animado */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>

              {/* Datos principales */}
              <div className="text-white text-center">
                {(() => {
                  const current = finalMetricsData.quiz?.current ?? 0;
                  const total = finalMetricsData.quiz?.total ?? 0;
                  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

                  if (total === 0) {
                    return (
                      <>
                        <div className="text-2xl font-black text-gray-400 mb-1">
                          —
                        </div>
                        <div className="text-xs text-gray-400 font-bold">
                          Sin quizzes
                        </div>
                      </>
                    );
                  }

                  return (
                    <>
                      <div className="text-2xl sm:text-3xl font-black mb-1 drop-shadow-lg">
                        {percentage}%
                      </div>
                      <div className="text-xs sm:text-sm font-bold drop-shadow-md">
                        {current} de {total}
                      </div>
                      <div className="text-xs mt-1 text-white/90">
                        aprobados
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* Título con gradiente */}
          <h3 className="font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quiz
          </h3>
          <p className="text-sm text-gray-600 text-center font-semibold">
            Evaluaciones
          </p>
        </div>

        {/* Métrica de Promedio Mensual - Con clic para abrir modal de Material UI */}
        {(() => {
          const monthlyAverage = finalMetricsData.monthlyAverage ?? 0;
          const hasMonthlyData = finalMetricsData.monthlyAverageData &&
            finalMetricsData.monthlyAverageData.length > 0 &&
            finalMetricsData.monthlyAverageData.some(item => item.promedio > 0);

          // Mostrar siempre, incluso si no hay datos (mostrará 0%)
          // if (!hasMonthlyData || monthlyAverage === 0) return null;

          return (
            <div
              className="flex flex-col items-center group cursor-pointer transition-all duration-150"
              title="Haz clic para ver el gráfico detallado de tu promedio mensual"
              onClick={() => setIsMonthlyAverageModalOpen(true)}
            >
              <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                {/* Contenedor del gráfico visual con gradiente oscuro para mejor legibilidad */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(139,92,246,0.5)] border border-white/20 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-500">

                  {/* Header del gráfico con icono animado */}
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-1 sm:mr-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                        <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                      </svg>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                      {monthlyAverage > 0 ? `${Math.round(monthlyAverage)}%` : '—'}
                    </span>
                  </div>

                  {/* Gráfico de barras simplificado */}
                  {hasMonthlyData ? (
                    <div className="flex items-end justify-center space-x-1 h-12 mb-2">
                      {finalMetricsData.monthlyAverageData.slice(-5).map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-3 bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-sm"
                            style={{ height: `${Math.max(4, (item.promedio / 100) * 40)}px` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-12 mb-2">
                      <span className="text-xs text-white/80">Sin datos históricos</span>
                    </div>
                  )}

                  {/* Indicador de clic */}
                  {hasMonthlyData && (
                    <div className="text-center">
                      <span className="text-xs text-white font-bold drop-shadow-md">Clic para ver detalle</span>
                    </div>
                  )}

                  {/* Icono de expansión */}
                  <div className="absolute top-2 right-2 w-5 h-5 text-white/70 opacity-90">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Título con gradiente */}
              <h3 className="w-full text-center font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Promedio mensual
              </h3>
              <p className="text-sm text-gray-600 text-center font-semibold">
                Tendencia histórica
              </p>
            </div>
          );
        })()}

        {/* Métrica de Estado Académico - Ajustado para evitar descuadres responsive */}
        <div className="relative flex flex-col items-center group cursor-pointer transition-all duration-300 min-h-[300px] sm:min-h-[320px]">
          <div className="relative mb-3 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
            {/* Contenedor principal consistente con otras tarjetas */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(107,114,128,0.35)] border border-white/30 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm">

              {/* Estado actual destacado MÁS GRANDE */}
              <div className="text-center mb-4 sm:mb-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center shadow-xl ring-4 sm:ring-6 mb-3 sm:mb-4 transition-all duration-200 animate-pulse drop-shadow-lg ${finalMetricsData.academicStatus.level === 'R' ? 'bg-gradient-to-br from-red-600 to-red-700 ring-red-200 group-hover:ring-red-300' :
                  finalMetricsData.academicStatus.level === 'A' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-yellow-200 group-hover:ring-yellow-300' :
                    'bg-gradient-to-br from-green-600 to-green-700 ring-green-200 group-hover:ring-green-300'
                  } group-hover:ring-8 sm:group-hover:ring-10 group-hover:shadow-2xl`}>
                  <span className="text-white font-black text-xl sm:text-2xl lg:text-3xl drop-shadow-sm">
                    {finalMetricsData.academicStatus.level}
                  </span>
                </div>
                <div className={`text-base sm:text-lg font-black ${finalMetricsData.academicStatus.level === 'R' ? 'text-red-700' :
                  finalMetricsData.academicStatus.level === 'A' ? 'text-yellow-600' :
                    'text-green-700'
                  }`}>
                  {finalMetricsData.academicStatus.description}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Puntaje: {Math.round(finalMetricsData.academicStatus.score)}%
                </div>
              </div>

            </div>
          </div>

          {/* Indicadores pequeños de estados (siempre debajo del card) */}
          <div className="flex justify-center space-x-3 mb-2">
            {[
              { level: 'R', name: 'Riesgo', desc: 'Necesita apoyo adicional' },
              { level: 'A', name: 'Activo', desc: 'Progreso satisfactorio' },
              { level: 'D', name: 'Destacado', desc: 'Rendimiento excepcional' }
            ].map((status) => (
              <div
                key={status.level}
                className={`w-6 h-6 rounded-full cursor-help transition-all duration-150 ${finalMetricsData.academicStatus.level === status.level ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'
                  } ${status.level === 'R' ? 'bg-red-600' :
                    status.level === 'A' ? 'bg-yellow-400' :
                      'bg-green-600'
                  }`}
                title={`${status.name}: ${status.desc}`}
              ></div>
            ))}
          </div>

          {/* Título */}
          <h3 className="w-full text-center text-gray-700 font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors duration-200 leading-tight">
            Estado académico
          </h3>
          <p className="text-base text-gray-500 text-center leading-relaxed">
            Evaluación actual
          </p>
          {/* Tooltip informativo completo (solo escritorio para evitar descuadres en pantallas pequeñas) */}
          <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg p-3 pointer-events-none max-w-xs w-max">
            <div className="font-bold mb-1">{finalMetricsData.academicStatus.description}</div>
            <div>Puntaje: {Math.round(finalMetricsData.academicStatus.score)}%</div>
            <div className="mt-1 text-gray-300">
              {finalMetricsData.academicStatus.level === 'R' && 'Se recomienda apoyo adicional'}
              {finalMetricsData.academicStatus.level === 'A' && 'Mantén tu ritmo de estudio'}
              {finalMetricsData.academicStatus.level === 'D' && '¡Excelente desempeño!'}
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de tarjetas de métricas (4 columnas) - MÁS GRANDES y elegantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">

        {/* Gráfico de Actividades / Quiz - Diseño Moderno Premium */}
        <ActivitiesQuizCard
          currentMetricsData={currentMetricsData}
          onOpen={() => setIsActivitiesChartModalOpen(true)}
        />

        <SubjectResultsCard
          subjectResults={currentMetricsData.subjectResults}
          onOpen={() => setIsSubjectResultsModalOpen(true)}
        />

        <FeedbackCard score={currentMetricsData.feedbackScore} />

        <SimulatorsCards simulatorGrades={currentMetricsData.simulatorGrades} />

      </div> {/* Close grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 */}

      {/* Modal para el Gráfico de Actividades / Quizt */}
      <ChartModal
        isOpen={isActivitiesChartModalOpen}
        onClose={() => setIsActivitiesChartModalOpen(false)}
        title="Avance Mensual de Actividades y Quizts"
      >
        <div className="mb-4">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-blue-600 font-semibold mb-0">Total Actividades</div>
                <div className="text-2xl font-bold text-blue-700">
                  {currentMetricsData.activities.current} / {currentMetricsData.activities.total}
                </div>
                <div className="text-xs text-blue-500 mt-0">
                  {currentMetricsData.activities.total > 0
                    ? Math.round((currentMetricsData.activities.current / currentMetricsData.activities.total) * 100)
                    : 0}% completadas
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="text-sm text-purple-600 font-semibold mb-0">Total Quizts</div>
                <div className="text-2xl font-bold text-purple-700">
                  {currentMetricsData.quiz.current} / {currentMetricsData.quiz.total}
                </div>
                <div className="text-xs text-purple-500 mt-0">
                  {currentMetricsData.quiz.total > 0
                    ? Math.round((currentMetricsData.quiz.current / currentMetricsData.quiz.total) * 100)
                    : 0}% aprobados
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentMetricsData.activityProgress}
                margin={{ top: 20, right: 10, left: -20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Meses', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Porcentaje (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '5px' }}
                  iconType="square"
                />
                <Bar dataKey="activities" name="Actividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="quizts" name="Quizts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </ChartModal>

      {/* Modal para el Gráfico de Promedio Mensual con Material UI */}
      <ChartModal
        isOpen={isMonthlyAverageModalOpen}
        onClose={() => setIsMonthlyAverageModalOpen(false)}
        title="Evolución del Promedio Mensual - Últimos 12 Meses"
      >
        <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-sm sm:text-base text-blue-600 font-medium mb-0">Promedio General</div>
                <div className="text-xs text-blue-500 mt-0">
                  Basado en {finalMetricsData.monthlyAverageData?.length || 0} meses de datos
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-semibold text-blue-700">
                {finalMetricsData.monthlyAverage}%
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden">
            <MUIBarChart
              width={typeof window !== 'undefined' ? Math.min(1200, Math.max(300, window.innerWidth - 100)) : 500}
              height={typeof window !== 'undefined' ? Math.min(480, Math.max(260, window.innerHeight * 0.45)) : 360}
              dataset={finalMetricsData.monthlyAverageData || []}
              xAxis={[{
                scaleType: 'band',
                dataKey: 'month',
                label: 'Meses',
                labelStyle: { fontSize: 12, fill: '#6b7280' },
                tickLabelStyle: { fontSize: 10, angle: -45, textAnchor: 'end' }
              }]}
              yAxis={[{
                label: 'Promedio (%)',
                min: 0,
                max: 100,
                labelStyle: { fontSize: 12, fill: '#6b7280' },
                tickLabelStyle: { fontSize: 10 }
              }]}
              series={[
                {
                  dataKey: 'promedio',
                  label: 'Promedio Mensual',
                  color: '#3b82f6'
                }
              ]}
              // Margen izquierdo reducido drásticamente para móviles (de 80 a 40 o 50)
              margin={{ left: 50, right: 10, top: 20, bottom: 60 }}
              sx={{
                '& .MuiChartsAxis-line': {
                  stroke: '#6b7280',
                  strokeWidth: 1,
                },
                '& .MuiChartsAxis-tick': {
                  stroke: '#6b7280',
                  strokeWidth: 1,
                },
                '& .MuiChartsAxis-tickLabel': {
                  fill: '#374151',
                  fontSize: '10px',
                  fontWeight: 400,
                },
                '& .MuiChartsLegend-label': {
                  fill: '#374151',
                  fontSize: '12px',
                  fontWeight: 500,
                },
                '& .MuiChartsBar-root': {
                  rx: 6,
                }
              }}
            />
          </div>
      </ChartModal>

      {/* Modal para el Gráfico de Resultados por Materia */}
      <ChartModal
        isOpen={isSubjectResultsModalOpen}
        onClose={() => setIsSubjectResultsModalOpen(false)}
        title="Resultados Detallados por Materia - 1er Simulador"
      >
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
          {/* Resumen general */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 text-center">
              <div className="text-sm text-purple-600 font-semibold mb-1">Puntuación General del Simulador</div>
              <div className="text-4xl font-bold text-purple-700">
                {currentMetricsData.subjectResults.total}%
              </div>
            </div>
          </div>

          {/* Gráfico de pastel */}
          <div style={{ width: '100%', height: '300px', marginBottom: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={3}
                  cornerRadius={6}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="square"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Información adicional en el modal */}
          <div className="mt-4 p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Desglose por Materia
                </h4>
                <div className="space-y-2">
                  {currentMetricsData.subjectResults.subjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-sm shadow-sm"
                          style={{ backgroundColor: subject.color }}
                        ></div>
                        <span className="font-semibold text-gray-700">{subject.code}</span>
                        <span className="text-xs text-gray-500">({subject.fullName})</span>
                      </div>
                      <span className="text-gray-700 font-bold">{subject.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Recomendaciones
                </h4>
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm font-semibold text-red-700 mb-1">
                      Materias por reforzar:
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      {recommendedSubjects.length > 0 ? recommendedSubjects.join(', ') : 'Ninguna'}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {recommendationMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartModal>

      {/* Sección de Recomendaciones Personalizadas basadas en Estado Académico */}
      <div className="mt-16 mb-8">
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-2 sm:px-4">
          {/* Header de la sección */}
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
              <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RECOMENDACIÓN
              </h2>
            </div>
          </div>

          {/* Tarjeta principal de la frase */}
          {(() => {
            // Calcular clases basadas en el estado académico
            const isRiesgo = finalAcademicStatus.level === 'R';
            const isActivo = finalAcademicStatus.level === 'A';
            const isDestacado = finalAcademicStatus.level === 'D';

            const cardBgClass = isRiesgo
              ? 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100 border-red-200'
              : isActivo
                ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-yellow-200'
                : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200';

            const iconBgClass = isRiesgo
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : isActivo
                ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                : 'bg-gradient-to-br from-green-500 to-emerald-600';

            const badgeBgClass = isRiesgo
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : isActivo
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-600';

            const textClass = isRiesgo
              ? 'text-red-700'
              : isActivo
                ? 'text-amber-700'
                : 'text-green-700';

            const separatorClass = isRiesgo
              ? 'bg-gradient-to-r from-red-400 to-red-600'
              : isActivo
                ? 'bg-gradient-to-r from-yellow-400 to-amber-600'
                : 'bg-gradient-to-r from-green-400 to-emerald-600';

            return (
              <div className={`relative p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-lg border transition-colors duration-150 ${cardBgClass}`}>

                {/* Header: Icono + Badge de estado */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md shrink-0 ${iconBgClass}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v18l6-3 6 3 6-3V4l-6 3-6-3-6 3z" />
                    </svg>
                  </div>
                  <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white shadow-sm ${badgeBgClass}`}>
                    Estado: {finalAcademicStatus.description}
                  </div>
                </div>

                {/* Mensaje principal */}
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold leading-snug ${textClass} mb-4`}>
                  {(() => {
                    if (finalAcademicStatus.level === 'R') {
                      return "Dedica más tiempo al estudio diario y busca apoyo adicional";
                    } else if (finalAcademicStatus.level === 'A') {
                      return "¡Vas por buen camino! Mantén ese ritmo de estudio constante";
                    } else {
                      return "¡Excelente desempeño! Sigue así y ayuda a tus compañeros";
                    }
                  })()}
                </p>

                {/* Separador */}
                <div className={`h-0.5 w-16 rounded-full ${separatorClass} mb-5`} />

                {/* Consejo de estudio */}
                <p className="text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  {(() => {
                    if (finalAcademicStatus.level === 'R') {
                      return "Estudia 2-3 horas diarias en sesiones de 25 minutos";
                    } else if (finalAcademicStatus.level === 'A') {
                      return "Estudia todos los días un poco, no todo en un solo día";
                    } else {
                      return "Mantén tu rutina de estudio y comparte tus técnicas";
                    }
                  })()}
                </p>

                {/* Detalle de recomendación (integrado en misma tarjeta cuando hay riesgo) */}
                {finalAcademicStatus.level === 'R' && (
                  <div className="mt-5 pt-5 border-t border-gray-200/60">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Considera establecer un horario de estudio diario, buscar apoyo de tu asesor académico,
                      y utilizar técnicas de estudio que se adapten mejor a tu estilo de aprendizaje.
                      <span className="block mt-2 font-medium text-gray-700">¡Cada pequeño paso cuenta hacia tu éxito!</span>
                    </p>
                  </div>
                )}

                {/* Lema */}
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-5 tracking-wide">
                  La constancia vence al cansancio • Pequeños pasos llevan a grandes logros
                </p>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}



export default AlumnoDashboardMetrics;