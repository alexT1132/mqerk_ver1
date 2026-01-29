import React, { useState, useEffect } from 'react';
import { Upload, Eye, CheckCircle, XCircle, Sparkles, Star, ChevronDown, RefreshCcw, PlusCircle, Info, MessageSquareText, X, Calendar, FileText } from 'lucide-react';
import PdfMobileViewer from '../common/PdfMobileViewer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { listTasks, listSubmissionsByStudent, createSubmission, createTask, updateTask, cancelSubmissionApi, getSubmissionNote } from '../../api/feedback.js';
import { buildStaticUrl, getApiOrigin } from '../../utils/url.js';

const Feedback_Alumno_Comp = () => {
  // Auth
  const { alumno } = useAuth();
  const alumnoId = alumno?.id;

  // Estado para tareas desde backend
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Estados
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // Crear actividad abierta por el alumno
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskError, setNewTaskError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiScore, setConfettiScore] = useState(0);
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' o etiqueta ordinal ('Octavo', ...)
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [viewingTaskName, setViewingTaskName] = useState('');
  const [viewingTaskPdf, setViewingTaskPdf] = useState('');
  const isPdfIframeBlocked = React.useMemo(() => {
    try {
      if (!viewingTaskPdf) return false;
      const u = new URL(viewingTaskPdf);
      const host = u.hostname.toLowerCase();
      return host.includes('docs.google.com') || host.includes('drive.google.com');
    } catch {
      return false;
    }
  }, [viewingTaskPdf]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const TASKS_PER_PAGE = 10;
  // Errores de archivo
  const [fileError, setFileError] = useState("");
  const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024; // limite maximo de cada archivo pdf 1.5MB
  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  // Notas del asesor por submission
  const [notesBySubmission, setNotesBySubmission] = useState({}); // { subId: 'texto' }
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteView, setNoteView] = useState({ text: '', taskName: '' });

  // Conteo global de tareas creadas por el alumno (informativo)
  const studentOwnedCount = tasks.filter(t => t._isStudentOwned).length;
  // Límite global del curso (8 meses, 240 entregas) 
  const COURSE_MONTHS = 8;
  const TOTAL_MAX_SUBMISSIONS = 240;
  const perMonthCap = Math.floor(TOTAL_MAX_SUBMISSIONS / COURSE_MONTHS);
  const [monthlyCountThisMonth, setMonthlyCountThisMonth] = useState(0);
  const [monthlyCapReached, setMonthlyCapReached] = useState(false);

  // Palabras motivacionales
  const motivationalWords = [
    "¡Genial, sigue así!",
    "¡Excelente trabajo!",
    "¡Imparable, lo lograste!",
    "¡Muy bien hecho!",
    "¡Orgulloso de ti!",
    "¡Brillante desempeño!",
    "¡Increíble esfuerzo!",
    "¡Vas por buen camino!",
    "¡Sigue brillando!",
    "¡Tu dedicación inspira!",
    "¡Aprender es crecer!",
    "¡Nunca te rindas!",
    "¡Eres un ejemplo!",
    "¡Cada día mejoras más!",
    "¡Tu constancia da frutos!"
  ];
  const [motivationalWord, setMotivationalWord] = useState("");
  // Subidas consecutivas (streak en la sesión)
  const [consecutiveUploads, setConsecutiveUploads] = useState(0);
  const [showTripleEffect, setShowTripleEffect] = useState(false);
  // Tamaño último archivo elegido (para feedback rápido)
  const [lastSelectedSizeMB, setLastSelectedSizeMB] = useState(null);
  const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  // Efecto para calcular los puntos totales
  useEffect(() => {
    const calculatedTotalPoints = tasks.reduce((sum, task) => sum + (task.score || 0), 0);
    setTotalPoints(calculatedTotalPoints);
  }, [tasks]);

  // Cargar tareas y entregas del alumno
  useEffect(() => {
    if (!alumnoId) return;
    let cancel = false;
    async function loadData() {
      setLoadingTasks(true); setFetchError("");
      try {
        const [tasksRes, subsRes] = await Promise.all([
          listTasks({ activo: 1 }),
          listSubmissionsByStudent(alumnoId, { limit: 10000 }).catch(() => ({ data: { data: [] } }))
        ]);
        if (cancel) return;
        const tasksRaw = Array.isArray(tasksRes?.data?.data) ? tasksRes.data.data : [];
        const subs = Array.isArray(subsRes?.data?.data) ? subsRes.data.data : [];
        // Calcular conteo mensual (por mes calendario basado en created_at)
        const byMonth = subs.reduce((acc, s) => {
          if (s?.replaced_by) return acc; // solo las vigentes
          const created = s?.created_at ? new Date(s.created_at) : null;
          const m = created ? created.getMonth() : null;
          if (m !== null) acc[m] = (acc[m] || 0) + 1;
          return acc;
        }, {});
        const nowM = new Date().getMonth();
        const usedThisMonth = byMonth[nowM] || 0;
        setMonthlyCountThisMonth(usedThisMonth);
        setMonthlyCapReached(usedThisMonth >= perMonthCap);
        // Filtrar: mostrar tareas globales (sin grupos) y tareas propias (grupos contiene alumnoId)
        const filtered = tasksRaw.filter(t => {
          const g = Array.isArray(t.grupos) ? t.grupos : null;
          return !g || g.includes(alumnoId);
        });
        const mapped = filtered.map(t => {
          const sub = subs.find(s => s.id_task === t.id && !s.replaced_by);
          const rel = sub?.archivo || null;
          const fullUrl = rel ? buildStaticUrl(rel) : null;
          return {
            id: t.id,
            name: t.nombre,
            dueDate: t.due_date,
            submittedPdf: fullUrl,
            isSubmitted: !!sub,
            score: sub ? (sub.puntos || 10) : null,
            _subId: sub?.id || null,
            _isStudentOwned: Array.isArray(t.grupos) && t.grupos.includes(alumnoId),
          };
        });
        setTasks(mapped);
        // Prefetch de notas del asesor para las tareas con entrega
        const withSub = mapped.filter(t => t._subId);
        if (withSub.length) {
          const pairs = await Promise.all(withSub.map(async t => {
            try {
              const res = await getSubmissionNote(t._subId);
              return [t._subId, res?.data?.data?.nota || ''];
            } catch { return [t._subId, '']; }
          }));
          const map = {};
          for (const [sid, txt] of pairs) map[sid] = txt;
          setNotesBySubmission(map);
        } else {
          setNotesBySubmission({});
        }
      } catch (e) {
        console.error('Error cargando tareas feedback', e);
        setFetchError('No se pudieron cargar las tareas');
      } finally {
        if (!cancel) setLoadingTasks(false);
      }
    }
    loadData();
    return () => { cancel = true; };
  }, [alumnoId]);

  // Subir archivo (crea submission)
  const handleFileUpload = async (taskId, file) => {
    // Validaciones
    const current = tasks.find(x => x.id === taskId);
    const replacingExisting = !!current?.isSubmitted;
    if (monthlyCapReached && !replacingExisting) {
      setFileError(`Has alcanzado el máximo mensual (${perMonthCap}). Inténtalo el próximo mes.`);
      return;
    }
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setFileError('Solo se permiten archivos PDF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('El PDF supera el límite de 1.5MB. Por favor comprímelo antes de subirlo.');
      return;
    }
    setFileError('');
    if (!alumnoId) { setFileError('Alumno no autenticado'); return; }
    try {
      setLoadingUpload(true);
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append('id_task', taskId);
      fd.append('id_estudiante', alumnoId);
      // Si es una actividad creada por el alumno, actualizar due_date al momento de subir
      const t = tasks.find(x => x.id === taskId);
      // No modificar due_date aquí: mantener el mes asignado al crear para que el agrupado sea consistente
      try { /* antes se actualizaba due_date aquí; se elimina para evitar mover la tarea de mes */ } catch { }
      const res = await createSubmission(fd);
      const sub = res?.data?.data;
      if (sub) {
        const rel = sub.archivo;
        const fullUrl = rel ? buildStaticUrl(rel) : null;
        setTasks(prev => prev.map(t => {
          if (t.id !== taskId) return t;
          // Mantener dueDate sin cambios para no mover la tarea de mes al subir
          return { ...t, submittedPdf: fullUrl, isSubmitted: true, score: sub.puntos || 10, _subId: sub.id, dueDate: t.dueDate };
        }));
        // Actualizar contador mensual en caliente si NO es reemplazo
        try {
          if (!replacingExisting) {
            setMonthlyCountThisMonth(prev => {
              const next = prev + 1;
              setMonthlyCapReached(next >= perMonthCap);
              return next;
            });
          }
        } catch { }
        setConfettiScore(sub.puntos || 10);
        const randomWord = motivationalWords[Math.floor(Math.random() * motivationalWords.length)];
        setMotivationalWord(randomWord);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 9500);
        // Actualizar streak
        setConsecutiveUploads(prev => {
          const next = prev + 1;
          if (next === 3) {
            setShowTripleEffect(true);
            // Ocultar después de 6s
            setTimeout(() => setShowTripleEffect(false), 5000);
          }
          return next;
        });
      }
      setShowModal(false);
      setSelectedTask(null);
    } catch (e) {
      console.error('Error al subir PDF', e);
      setFileError(e?.response?.data?.message || 'Error al subir archivo');
    } finally {
      setLoadingUpload(false);
    }
  };

  // Función para cancelar entrega
  const handleCancelSubmission = async (taskId) => {
    try {
      const t = tasks.find(x => x.id === taskId);
      const subId = t?._subId;
      if (!subId) throw new Error('Sin entrega activa');
      await cancelSubmissionApi(subId);
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, submittedPdf: null, isSubmitted: false, score: null, _subId: null } : task));
      // Recalcular contador mensual desde backend para consistencia
      try {
        const subsRes = await listSubmissionsByStudent(alumnoId, { limit: 10000 }).catch(() => ({ data: { data: [] } }));
        const subs = Array.isArray(subsRes?.data?.data) ? subsRes.data.data : [];
        const byMonth = subs.reduce((acc, s) => {
          if (s?.replaced_by) return acc; // solo vigentes
          const created = s?.created_at ? new Date(s.created_at) : null;
          const m = created ? created.getMonth() : null;
          if (m !== null) acc[m] = (acc[m] || 0) + 1;
          return acc;
        }, {});
        const nowM = new Date().getMonth();
        const usedThisMonth = byMonth[nowM] || 0;
        setMonthlyCountThisMonth(usedThisMonth);
        setMonthlyCapReached(usedThisMonth >= perMonthCap);
      } catch { }
      setShowModal(false);
      setSelectedTask(null);
    } catch (e) {
      setFileError(e?.response?.data?.message || 'No se pudo cancelar la entrega');
    }
  };

  // Funciones de modal
  const openModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  // Crear nueva actividad (abierta)
  const openCreateTask = () => { setNewTaskName(''); setNewTaskError(''); setShowCreateTaskModal(true); };
  const closeCreateTask = () => { setShowCreateTaskModal(false); setNewTaskName(''); setNewTaskError(''); };
  const confirmCreateTask = async () => {
    const name = (newTaskName || '').trim();
    if (!name) { setNewTaskError('Escribe un nombre'); return; }
    if (name.length > 100) { setNewTaskError('Máximo 100 caracteres'); return; }
    if (!alumnoId) { setNewTaskError('Sesión inválida'); return; }
    if (isPastSelectedMonth) { setNewTaskError('No puedes crear actividades en meses pasados'); return; }
    if (studentOwnedCountThisMonth >= perMonthCap) {
      setNewTaskError(`Has alcanzado el límite mensual de ${perMonthCap} actividades creadas.`);
      return;
    }
    try {
      setNewTaskError('');
      // Establece due_date según el mes seleccionado (ordinal → calendar)
      let due = new Date();
      if (selectedMonth !== 'all') {
        const mk = monthKeyByOrdinal[selectedMonth];
        if (mk) {
          const [y, m] = mk.split('-').map(Number);
          due = new Date(y, (m - 1), 1, 12, 0, 0);
        }
      }
      const body = { nombre: name, due_date: due.toISOString(), puntos: 10, grupos: JSON.stringify([alumnoId]), activo: 1 };
      await createTask(body);
      // Refrescar lista
      const [tasksRes, subsRes] = await Promise.all([
        listTasks({ activo: 1 }),
        listSubmissionsByStudent(alumnoId, { limit: 10000 }).catch(() => ({ data: { data: [] } }))
      ]);
      const tasksRaw = Array.isArray(tasksRes?.data?.data) ? tasksRes.data.data : [];
      const subs = Array.isArray(subsRes?.data?.data) ? subsRes.data.data : [];
      // Actualizar conteo mensual tras crear
      const byMonth2 = subs.reduce((acc, s) => {
        if (s?.replaced_by) return acc;
        const created = s?.created_at ? new Date(s.created_at) : null;
        const m = created ? created.getMonth() : null;
        if (m !== null) acc[m] = (acc[m] || 0) + 1;
        return acc;
      }, {});
      const nowM2 = new Date().getMonth();
      const usedThisMonth2 = byMonth2[nowM2] || 0;
      setMonthlyCountThisMonth(usedThisMonth2);
      setMonthlyCapReached(usedThisMonth2 >= perMonthCap);
      const filtered = tasksRaw.filter(t => { const g = Array.isArray(t.grupos) ? t.grupos : null; return !g || g.includes(alumnoId); });
      const mapped = filtered.map(t => {
        const sub = subs.find(s => s.id_task === t.id && !s.replaced_by);
        const rel = sub?.archivo || null; const fullUrl = rel ? buildStaticUrl(rel) : null;
        return { id: t.id, name: t.nombre, dueDate: t.due_date, submittedPdf: fullUrl, isSubmitted: !!sub, score: sub ? (sub.puntos || 10) : null, _subId: sub?.id || null, _isStudentOwned: Array.isArray(t.grupos) && t.grupos.includes(alumnoId) };
      });
      setTasks(mapped);
      closeCreateTask();
    } catch (e) {
      console.error('crear actividad abierta', e);
      setNewTaskError(e?.response?.data?.message || 'No se pudo crear la actividad');
    }
  };

  const openViewTaskModal = (task) => {
    setViewingTaskName(task.name);
    setViewingTaskPdf(task.submittedPdf);
    setShowViewTaskModal(true);
  };

  const openNoteModal = (task) => {
    const text = task?._subId ? (notesBySubmission[task._subId] || '') : '';
    setNoteView({ text, taskName: task?.name || 'Actividad' });
    setShowNoteModal(true);
  };
  const closeNoteModal = () => { setShowNoteModal(false); setNoteView({ text: '', taskName: '' }); };

  const closeViewTaskModal = () => {
    setShowViewTaskModal(false);
    setViewingTaskName('');
    setViewingTaskPdf('');
  };

  // Efecto para mensaje motivacional (ahora solo para el contador de tareas, no visual)
  useEffect(() => {
    const submittedCount = tasks.filter(task => task.isSubmitted).length;
    // Puedes usar esto para otra lógica si quieres, pero el mensaje visual se movió al confeti
    if (submittedCount >= 3) {
      // Por ejemplo, podrías activar otra animación o un log aquí
      // console.log("¡Más de 3 tareas entregadas!");
    }
  }, [tasks]);

  // Helpers y mapeo de meses (ordinales relativos al inicio del curso)
  const monthKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  const addMonths = (date, n) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + n, 1, 12, 0, 0);
  };
  const distinctMonths = React.useMemo(() => {
    const set = new Set();
    for (const t of tasks) { if (t?.dueDate) set.add(monthKey(t.dueDate)); }
    return Array.from(set).sort((a, b) => new Date(b + "-01") - new Date(a + "-01"));
  }, [tasks]);
  // Ordinales ascendentes (1..8) para alinear con la duración del curso: Primero, Segundo, ...
  const ORDINALS_ASC = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo'];
  // Determinar el "inicio del curso" para mapear 8 meses relativos.
  // Prioridad: alumno.fecha_inicio > alumno.created_at > primer dueDate en tareas > hoy
  const courseStartDate = React.useMemo(() => {
    try {
      const tryDate = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d?.getTime?.()) ? null : d;
      };
      return (
        tryDate(alumno?.fecha_inicio) ||
        tryDate(alumno?.created_at) ||
        (() => {
          const dueDates = tasks.map(t => t?.dueDate ? new Date(t.dueDate) : null).filter(Boolean);
          if (dueDates.length === 0) return null;
          const min = new Date(Math.min(...dueDates.map(d => d.getTime())));
          return isNaN(min?.getTime?.()) ? null : min;
        })() ||
        new Date()
      );
    } catch {
      return new Date();
    }
  }, [alumno, tasks]);

  // Construir 8 llaves de mes desde el inicio del curso (inclusive)
  const monthKeyByOrdinal = React.useMemo(() => {
    const map = {};
    for (let i = 0; i < COURSE_MONTHS; i++) {
      const mk = monthKey(addMonths(courseStartDate, i));
      map[ORDINALS_ASC[i]] = mk;
    }
    return map;
  }, [courseStartDate]);

  // Recalcular el conteo de creadas por el alumno para el mes seleccionado (ordinal)
  const studentOwnedCountForSelected = React.useMemo(() => {
    try {
      const mk = selectedMonth === 'all' ? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })() : monthKeyByOrdinal[selectedMonth];
      if (!mk) return 0;
      return tasks.filter(t => t._isStudentOwned && t?.dueDate && monthKey(t.dueDate) === mk).length;
    } catch { return 0; }
  }, [tasks, selectedMonth, monthKeyByOrdinal]);
  // Conteo mensual de tareas creadas por el alumno (para límite mensual = perMonthCap)
  const studentOwnedCountThisMonth = studentOwnedCountForSelected;
  // selectedMonth en pasado
  const isPastSelectedMonth = React.useMemo(() => {
    if (selectedMonth === 'all') return false;
    const mk = monthKeyByOrdinal[selectedMonth];
    if (!mk) return false;
    const [y, m] = mk.split('-').map(Number);
    const now = new Date();
    if (y < now.getFullYear()) return true;
    if (y === now.getFullYear() && (m - 1) < now.getMonth()) return true;
    return false;
  }, [selectedMonth, monthKeyByOrdinal]);

  // Filtrado por mes usando etiquetas ordinales
  const filteredTasks = tasks.filter(task => {
    if (selectedMonth === 'all') return true;
    const mk = monthKeyByOrdinal[selectedMonth];
    if (!mk || !task?.dueDate) return false;
    return monthKey(task.dueDate) === mk;
  });

  // Ordenar por más reciente a más antiguo (por dueDate)
  const sortedTasks = React.useMemo(() => {
    try {
      return [...filteredTasks].sort((a, b) => {
        const ta = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
        const tb = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
        return tb - ta; // descendente: más reciente primero
      });
    } catch {
      return filteredTasks;
    }
  }, [filteredTasks]);

  // Progreso mensual (respecto a tareas del mes sin considerar búsqueda)
  const monthTotal = filteredTasks.length;
  const monthSubmitted = filteredTasks.filter(t => t.isSubmitted).length;
  const monthProgress = monthTotal === 0 ? 0 : Math.round((monthSubmitted / monthTotal) * 100);

  // Contador visible de entregas del mes mostrado:
  // - Si estás en "Todos los meses", mostramos el conteo del mes actual.
  // - Si seleccionas un mes específico, mostramos el conteo de ese mes (según las tareas visibles).
  const displayMonthlyCount = React.useMemo(() => {
    try {
      if (selectedMonth === 'all') {
        const cm = new Date().getMonth();
        return tasks.reduce((acc, t) => {
          if (!t?.isSubmitted) return acc;
          const d = t?.dueDate ? new Date(t.dueDate) : null;
          if (d && !isNaN(d?.getTime?.()) && d.getMonth() === cm) return acc + 1;
          return acc;
        }, 0);
      }
      // Mes específico: usamos lo que está en la tabla filtrada
      return filteredTasks.filter(t => t.isSubmitted).length;
    } catch {
      return 0;
    }
  }, [tasks, filteredTasks, selectedMonth]);

  // Filtrado por búsqueda
  const searchedTasks = sortedTasks.filter(t =>
    t.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Ajustar página actual si el filtro reduce el número de páginas
  const totalPages = Math.max(1, Math.ceil(searchedTasks.length / TASKS_PER_PAGE));

  // Evitar setState durante render: ajustar página cuando cambie el total de páginas
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);
  const indexOfLast = currentPage * TASKS_PER_PAGE;
  const indexOfFirst = indexOfLast - TASKS_PER_PAGE;
  const paginatedTasks = searchedTasks.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Paginación compacta (mostrar primeras, últimas y vecinas)
  const buildPageList = () => {
    const pages = [];
    const neighbors = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - neighbors && i <= currentPage + neighbors) ||
        (currentPage <= 2 && i <= 3) ||
        (currentPage >= totalPages - 1 && i >= totalPages - 2)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  // Verificar fecha límite
  const isWithinDeadline = (dueDate) => {
    if (!dueDate) return true; // si no hay fecha, no bloquear
    const due = new Date(dueDate);
    if (isNaN(due?.getTime?.())) return true;
    return Date.now() < due.getTime();
  };

  // Permisos por mes: permitir gestionar/subir si la tarea es del mes actual o futuro.
  // Bloquear solo si la tarea pertenece a un mes pasado (comparando año y mes).
  const canActOnTask = (task) => {
    try {
      const now = new Date();
      const ny = now.getFullYear();
      const nm = now.getMonth();
      const due = task?.dueDate ? new Date(task.dueDate) : now; // sin fecha => tratar como mes actual
      if (isNaN(due?.getTime?.())) return true;
      const y = due.getFullYear();
      const m = due.getMonth();
      if (y < ny) return false;
      if (y === ny && m < nm) return false;
      return true; // mes actual o futuro
    } catch { return true; }
  };

  // Opciones de meses a mostrar: siempre 1..8 para no atarnos a meses calendario
  const months = ORDINALS_ASC;

  const handleMonthSelect = (monthValue, monthName) => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return 'Todos los meses';
    return selectedMonth; // etiqueta ordinal
  };

  // Función para abrir el PDF en una nueva pestaña
  const handleOpenPdfInNewTab = () => {
    if (viewingTaskPdf) {
      window.open(viewingTaskPdf, '_blank');
    } else {
      window.open('https://www.africau.edu/images/default/sample.pdf', '_blank');
    }
  };

  // Hooks responsivos y preferencias de movimiento reducido
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleResize = () => setIsMobile(mq.matches);
    const handleMotion = () => setReducedMotion(motionMq.matches);
    handleResize(); handleMotion();
    mq.addEventListener('change', handleResize);
    motionMq.addEventListener('change', handleMotion);
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      mq.removeEventListener('change', handleResize);
      motionMq.removeEventListener('change', handleMotion);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Vista rápida del nombre completo en móvil
  const [showFullNameId, setShowFullNameId] = useState(null);
  useEffect(() => {
    if (!showFullNameId) return;
    const t = setTimeout(() => setShowFullNameId(null), 2500);
    return () => clearTimeout(t);
  }, [showFullNameId]);

  // Urgencia según horas restantes (solo mostrar si NO se ha entregado y la fecha está próxima o vencida)
  // Reglas:
  //  - No mostrar nada si la tarea ya fue entregada.
  //  - Mostrar "Urgente" si faltan <=24h.
  //  - Mostrar "Atención" si faltan <=72h (y >24h).
  //  - Mostrar "Vencido" si ya pasó la fecha y no está entregada.
  //  - No mostrar "Tranquilo" para evitar ruido visual cuando falta mucho tiempo.
  const getUrgencyInfo = (dueDate, isSubmitted) => {
    if (isSubmitted) return null; // Ya entregada: no se muestra indicador.
    const due = new Date(dueDate);
    if (isNaN(due?.getTime?.())) return null;
    const diffMs = due.getTime() - Date.now();
    const hours = diffMs / (1000 * 60 * 60);
    if (hours < 0) return { label: 'Vencido', color: 'bg-gray-300 text-gray-700', ring: 'ring-gray-300' };
    if (hours <= 24) return { label: 'Urgente', color: 'bg-red-100 text-red-600', ring: 'ring-red-300' };
    if (hours <= 72) return { label: 'Atención', color: 'bg-yellow-100 text-yellow-700', ring: 'ring-yellow-300' };
    return null; // Lejano: sin badge
  };

  return (
    <div className="min-h-screen bg-white px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-4 lg:py-8 font-sans text-gray-800 flex flex-col items-center relative overflow-hidden">
      {/* Título responsivo - Mejorado */}
      <div className="w-full max-w-7xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 drop-shadow-2xl text-center tracking-tight">
          FEEDBACK
        </h1>
      </div>

      {/* Puntos + Progreso - Mejorado */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border-2 border-violet-200/50 rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row gap-5 sm:items-center w-full max-w-7xl ring-2 ring-violet-100/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Star className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-xl" fill="currentColor" />
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
          <div>
            <p className="text-base sm:text-lg md:text-xl font-extrabold text-violet-700">Puntos Totales</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 drop-shadow-lg">{totalPoints} pts</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-extrabold text-violet-700">Progreso mensual</span>
            <span className="text-xs sm:text-sm font-extrabold text-violet-800 bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-200">{monthProgress}%</span>
          </div>
          <div className="w-full h-4 bg-violet-200/50 rounded-full overflow-hidden shadow-inner border border-violet-200/50">
            <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 transition-all duration-500 shadow-lg" style={{ width: `${monthProgress}%` }} />
          </div>
          <p className="mt-2 text-xs sm:text-sm text-violet-600 font-semibold text-right">{monthSubmitted}/{monthTotal} entregadas</p>
        </div>
      </div>
      {fetchError && (
        <div className="w-full max-w-3xl mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{fetchError}</div>
      )}
      {loadingTasks && (
        <div className="w-full max-w-3xl mb-4 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin" />Cargando...</div>
      )}

      {/* Animación de confeti y felicitaciones */}
      {showConfetti && (
        <>
          {/* Overlay sutil */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-40"></div>
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
            {/* Confeti: menos cantidad y sin sombra en móvil */}
            {Array.from({ length: reducedMotion ? 25 : (isMobile ? 70 : 320) }).map((_, i) => {
              const size = 6 + Math.random() * 18;
              const left = Math.random() * 100;
              const delay = Math.random() * 2.5;
              const duration = 5 + Math.random() * 4;
              const rotate = Math.random() * 360;
              const skew = Math.random() * 40 - 20;
              const borderRadius = Math.random() > 0.5 ? '50%' : '20%';
              const colors = [
                'bg-red-400', 'bg-blue-400', 'bg-green-400',
                'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
                'bg-orange-400', 'bg-cyan-400', 'bg-lime-400'
              ];
              return (
                <div
                  key={i}
                  className={`absolute ${!isMobile ? 'shadow-md' : ''} ${colors[i % colors.length]} opacity-80`}
                  style={{
                    width: `${size}px`,
                    height: `${size * (0.7 + Math.random() * 0.6)}px`,
                    left: `${left}%`,
                    top: 0,
                    zIndex: 41,
                    borderRadius,
                    transform: `rotate(${rotate}deg) skew(${skew}deg)`,
                    animation: `fallConfetti ${duration}s linear ${delay}s forwards`
                  }}
                />
              );
            })}
            {/* Keyframes para caída de confeti */}
            <style>
              {`
                @keyframes fallConfetti {
                  0% { top: 0; opacity: 1; }
                  80% { opacity: 1; }
                  100% { top: 100vh; opacity: 0; }
                }
              `}
            </style>
            {/* Mensaje motivacional y felicitación */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-28 h-28 sm:w-44 sm:h-44 text-yellow-300 animate-pulse drop-shadow-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl sm:text-5xl px-7 py-4 sm:px-12 sm:py-6 rounded-2xl shadow-2xl border-4 border-yellow-200 animate-bounce">
                    +{confettiScore} puntos
                  </div>
                </div>
              </div>
              <p className="mt-4 text-2xl sm:text-4xl font-extrabold text-purple-700 drop-shadow-2xl">
                {motivationalWord}
              </p>
              <p className="mt-2 text-xl sm:text-3xl font-extrabold text-white drop-shadow-2xl">
                ¡Felicidades, trabajo excelente!
              </p>
            </div>
          </div>
          {/* Sonido de celebración (opcional, descomenta si quieres usarlo y tienes un archivo .mp3 en public/) */}
          {!reducedMotion && (<audio autoPlay src="/A1.mp3" />)}
        </>
      )}

      {/* Efecto especial al llegar a 3 subidas consecutivas */}
      {showTripleEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-24">
          <div className="relative flex flex-col items-center animate-fade-in">
            <div className="relative">
              <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-400 blur-xl opacity-60 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold tracking-widest text-amber-700 bg-white/70 px-3 py-1 rounded-full backdrop-blur border border-amber-300 shadow">RACHA</span>
                  <span className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent drop-shadow">x3</span>
                  <span className="text-sm sm:text-base font-bold text-amber-700">¡Triple Entrega!</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
          <style>{`
            @keyframes fadeInScale {0%{opacity:0;transform:scale(.6)}50%{opacity:1}100%{opacity:1;transform:scale(1)}}
            .animate-fade-in{animation:fadeInScale .8s cubic-bezier(.34,1.56,.64,1) forwards}
          `}</style>
        </div>
      )}

      {/* Filtros: Mes + Búsqueda - Mejorado */}
      <div className="mb-4 sm:mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full max-w-7xl lg:static sticky top-0 z-30 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 px-3 sm:px-4 pt-3 pb-2 rounded-xl sm:rounded-2xl border-2 border-violet-200/50 shadow-lg">
        <label className="text-sm sm:text-base md:text-lg font-extrabold text-violet-700 flex items-center gap-2 text-center sm:text-left">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Feedback del mes:</span>
        </label>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:min-w-[200px] p-3 pr-10 rounded-xl bg-white border-2 border-violet-300 text-violet-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-violet-400 focus:outline-none focus:border-violet-400 active:scale-95 transition-all touch-manipulation flex items-center justify-between text-sm sm:text-base font-semibold"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Seleccionar mes"
          >
            <span className="truncate">{getSelectedMonthName()}</span>
            <ChevronDown className={`w-5 h-5 text-violet-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-violet-200 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
              <div
                onClick={() => handleMonthSelect('all', 'Todos los meses')}
                className={`px-4 py-3 hover:bg-violet-50 cursor-pointer text-violet-700 border-b border-violet-100 font-medium transition-colors ${selectedMonth === 'all' ? 'bg-violet-50' : ''}`}
              >
                Todos los meses
              </div>
              {months.map((month, index) => (
                <div
                  key={index}
                  onClick={() => handleMonthSelect(month, month)}
                  className={`px-4 py-3 hover:bg-violet-50 cursor-pointer text-violet-700 border-b border-violet-100 last:border-b-0 font-medium transition-colors ${selectedMonth === month ? 'bg-violet-50' : ''}`}
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full p-3 pr-10 rounded-xl bg-white border-2 border-violet-300 text-violet-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-violet-400 focus:outline-none focus:border-violet-400 placeholder-violet-300 text-sm sm:text-base font-medium transition-all"
            aria-label="Buscar tarea"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={openCreateTask}
            disabled={studentOwnedCountThisMonth >= perMonthCap || isPastSelectedMonth}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-extrabold shadow-lg border-2 transition-all active:scale-95 touch-manipulation ${(studentOwnedCountThisMonth >= perMonthCap || isPastSelectedMonth) ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white border-violet-700 hover:shadow-xl'}`}
            title={studentOwnedCountThisMonth >= perMonthCap ? `Has alcanzado el límite mensual de ${perMonthCap} actividades creadas` : (isPastSelectedMonth ? 'No puedes crear actividades en meses pasados' : 'Crear nueva actividad')}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nueva actividad</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* Vista de escritorio - Tabla - Mejorada */}
      <div className="hidden lg:block w-full max-w-7xl 2xl:max-w-[1600px]">
        <div className="bg-white border-2 border-violet-200/50 rounded-xl sm:rounded-2xl shadow-xl overflow-x-auto ring-2 ring-violet-100/50">
          <table className="min-w-[1200px] 2xl:min-w-[1200px] table-fixed text-[13px] 2xl:text-[12px]">
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '36%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500">
              <tr>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-left text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">No.</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-left text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Nombre de la tarea</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-center text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Cargar mi actividad</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-left text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Fecha de entrega</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-center text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Visualizar</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-center text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Nota</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-center text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Entregado</th>
                <th scope="col" className="px-4 2xl:px-3 py-3 2xl:py-2 text-center text-xs 2xl:text-[11px] font-extrabold text-white uppercase tracking-widest">Puntaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-200/50 bg-white">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task, index) => (
                  <tr key={task.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-violet-50/30'} hover:bg-violet-100/50 transition-colors duration-200`}>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px] font-extrabold text-violet-700">{indexOfFirst + index + 1}</td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px] text-gray-800 font-bold truncate" title={task.name}>{task.name}</td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px]">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => openModal(task)}
                          disabled={!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted)}
                          className={`flex items-center px-4 2xl:px-3 py-2 2xl:py-1.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 text-sm 2xl:text-xs font-extrabold border-2 touch-manipulation ${(!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted))
                              ? 'bg-gray-400 cursor-not-allowed text-white border-gray-500'
                              : (task.isSubmitted
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white focus:ring-violet-300 border-violet-700'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white focus:ring-blue-300 border-blue-600')
                            }`}
                        >
                          <Upload className="w-4 h-4 mr-1.5" />
                          {task.isSubmitted ? 'Gestionar' : (monthlyCapReached ? 'Límite' : 'Subir')}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px] text-gray-800">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{(task._isStudentOwned && !task.isSubmitted) ? 'Se genera al subir' : new Date(task.dueDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}</span>
                        {(() => {
                          if (task._isStudentOwned && !task.isSubmitted) return null; const u = getUrgencyInfo(task.dueDate, task.isSubmitted); return u ? (
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full border-2 ${u.color} ${u.ring}`}>{u.label}</span>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px]">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => openViewTaskModal(task)}
                          disabled={!task.submittedPdf}
                          className={`p-3 2xl:p-2.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 border-2 touch-manipulation ${task.submittedPdf
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white focus:ring-emerald-300 border-emerald-600'
                              : 'bg-gray-400 cursor-not-allowed text-white border-gray-500'
                            }`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px]">
                      <div className="flex justify-center items-center">
                        {task._subId ? (
                          (notesBySubmission[task._subId] ? (
                            <button
                              onClick={() => openNoteModal(task)}
                              className="inline-flex items-center gap-1.5 px-3 2xl:px-2.5 py-1.5 2xl:py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg text-sm 2xl:text-xs font-extrabold border-2 border-violet-700 transition-all active:scale-95 touch-manipulation"
                              title="Ver nota del asesor"
                            >
                              <MessageSquareText className="w-4 h-4" /> Nota
                            </button>
                          ) : (
                            <span className="text-gray-500 font-medium">Sin nota</span>
                          ))
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px]">
                      <div className="flex justify-center items-center">
                        {task.isSubmitted ? (
                          <CheckCircle className="w-7 h-7 2xl:w-8 2xl:h-8 text-emerald-500 drop-shadow-lg" />
                        ) : (
                          <XCircle className="w-7 h-7 2xl:w-8 2xl:h-8 text-red-500 drop-shadow-lg" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 2xl:px-3 py-3 2xl:py-2 whitespace-nowrap text-[13px] 2xl:text-[12px]">
                      <div className="text-violet-700 font-extrabold text-center bg-gradient-to-r from-violet-100 to-indigo-100 px-2.5 py-1 rounded-lg border border-violet-200">{task.score !== null ? `${task.score} pts` : '-'}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-600 text-base sm:text-lg font-medium">
                    No hay tareas para el mes seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Controles de paginación escritorio - Mejorados */}
        {filteredTasks.length > TASKS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t-2 border-violet-200 rounded-b-xl sm:rounded-b-2xl">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold border-2 transition-all active:scale-95 touch-manipulation ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400 shadow-sm'}`}
            >
              Anterior
            </button>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {buildPageList().map((p, idx) => (
                p === '...'
                  ? <span key={idx} className="px-2 py-1 text-sm text-gray-500 select-none font-bold">...</span>
                  : <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-extrabold border-2 flex items-center justify-center transition-all active:scale-95 touch-manipulation shadow-sm ${p === currentPage ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-700 shadow-lg' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400'}`}
                  >{p}</button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold border-2 transition-all active:scale-95 touch-manipulation ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400 shadow-sm'}`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Vista móvil - Cards en 2 columnas - Mejoradas */}
      <div className="lg:hidden w-full max-w-7xl">
        {paginatedTasks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {paginatedTasks.map((task, index) => (
              <div
                key={task.id}
                className="relative bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border-2 border-violet-200/50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 flex flex-col gap-2.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-300/60 ring-1 ring-violet-100/50"
              >
                {/* Header con badge alineado (sin superponer) */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md shrink-0 border-2 border-white">#{indexOfFirst + index + 1}</span>
                    <h3
                      className="font-extrabold text-violet-800 text-xs sm:text-sm leading-snug break-words line-clamp-2 min-w-0"
                      title={task.name}
                    >
                      {task.name}
                    </h3>
                    <button
                      type="button"
                      className="sm:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 border-2 border-violet-200 shrink-0 hover:bg-violet-200 transition-colors"
                      aria-label="Ver nombre completo"
                      title="Ver nombre completo"
                      onClick={() => setShowFullNameId(task.id)}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-xl text-[10px] font-extrabold shadow-sm border-2 ${task.isSubmitted ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-600 border-red-300'}`}>
                    {task.isSubmitted ? 'Entregado' : 'Pendiente'}
                  </span>
                </div>
                {/* Overlay con nombre completo (solo móvil) */}
                {showFullNameId === task.id && (
                  <div className="lg:hidden absolute left-2 right-2 top-10 z-20 bg-white/95 border-2 border-violet-200 rounded-xl shadow-xl p-2 text-[13px] text-violet-800 break-words font-semibold">
                    {task.name}
                  </div>
                )}
                {/* Puntaje */}
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 drop-shadow" fill="currentColor" />
                  <span className="text-sm sm:text-base font-extrabold text-violet-700 bg-gradient-to-r from-violet-100 to-indigo-100 px-2 py-0.5 rounded-lg border border-violet-200">{task.score !== null ? `${task.score} pts` : '-'}</span>
                </div>
                {/* Fecha de entrega + urgencia */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-semibold mb-2 flex-wrap">
                  <span className="bg-violet-200 text-violet-700 px-2 py-0.5 rounded-lg border border-violet-300">Entrega:</span>
                  <span className="text-gray-700">{(task._isStudentOwned && !task.isSubmitted) ? 'Se genera al subir' : new Date(task.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</span>
                  {(() => {
                    if (task._isStudentOwned && !task.isSubmitted) return null; const u = getUrgencyInfo(task.dueDate, task.isSubmitted); return u ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border-2 ${u.color} ${u.ring}`}>{u.label}</span>
                    ) : null;
                  })()}
                </div>
                {/* Estado visual */}
                <div className="flex items-center gap-1.5 mb-2">
                  {task.isSubmitted ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  )}
                  <span className={`font-extrabold text-xs sm:text-sm ${task.isSubmitted ? 'text-emerald-600' : 'text-red-500'}`}>{task.isSubmitted ? '¡Entregado!' : 'Sin entregar'}</span>
                </div>
                {/* Botones de acción */}
                <div className={`grid ${notesBySubmission[task._subId] ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-auto`}>
                  <button
                    onClick={() => openModal(task)}
                    disabled={!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted)}
                    className={`w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-xl shadow-md transition-all duration-200 text-xs font-extrabold gap-1 border-2 active:scale-95 touch-manipulation ${(!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted))
                        ? 'bg-gray-400 cursor-not-allowed text-white border-gray-500'
                        : (task.isSubmitted ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-violet-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-blue-600')
                      }`}
                    aria-label={task.isSubmitted ? 'Gestionar entrega' : 'Subir tarea'}
                    title={task.isSubmitted ? 'Gestionar entrega' : (monthlyCapReached ? 'Límite mensual' : 'Subir tarea')}
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">
                      {task.isSubmitted ? 'Gestionar' : (monthlyCapReached ? 'Límite' : 'Subir')}
                    </span>
                  </button>
                  <button
                    onClick={() => openViewTaskModal(task)}
                    disabled={!task.submittedPdf}
                    className={`w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-xl shadow-md transition-all duration-200 text-xs font-extrabold border-2 active:scale-95 touch-manipulation ${task.submittedPdf
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-emerald-600'
                        : 'bg-gray-400 cursor-not-allowed text-white border-gray-500'
                      }`}
                    aria-label="Ver tarea"
                    title={task.submittedPdf ? 'Ver' : 'Sin archivo'}
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Ver</span>
                  </button>
                  {notesBySubmission[task._subId] && (
                    <button
                      onClick={() => openNoteModal(task)}
                      className="w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-xl shadow-md transition-all duration-200 text-xs font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-2 border-violet-700 active:scale-95 touch-manipulation"
                      aria-label="Ver nota"
                      title="Ver nota del asesor"
                    >
                      <MessageSquareText className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">Nota</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-violet-200/50 rounded-xl sm:rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-base sm:text-lg font-medium">
              No hay tareas para el mes seleccionado.
            </p>
          </div>
        )}
        {/* Controles de paginación móvil - Mejorados */}
        {filteredTasks.length > TASKS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6 bg-white border-2 border-violet-200/50 rounded-xl p-4 shadow-md">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all active:scale-95 touch-manipulation ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400 shadow-sm'}`}
            >Anterior</button>
            <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs">
              {buildPageList().map((p, idx) => (
                p === '...'
                  ? <span key={idx} className="px-2 py-1 text-gray-500 select-none font-bold">...</span>
                  : <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all active:scale-95 touch-manipulation shadow-sm ${p === currentPage ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-700 shadow-lg' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400'}`}
                  >{p}</button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all active:scale-95 touch-manipulation ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-violet-700 border-violet-300 hover:bg-violet-50 hover:border-violet-400 shadow-sm'}`}
            >Siguiente</button>
          </div>
        )}
      </div>

      {/* Modal para Subir/Cancelar - Mejorado */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-violet-200/50 ring-2 ring-violet-100/50">
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 -m-6 sm:-m-8 mb-6 sm:mb-8 p-5 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {selectedTask.isSubmitted ? 'Gestionar Entrega' : 'Subir Tarea'}
              </h2>
            </div>
            {monthlyCapReached && (
              <div className="mb-3 text-xs sm:text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                Límite mensual alcanzado ({perMonthCap}). Podrás subir nuevamente el próximo mes.
              </div>
            )}
            <p className="mb-6 text-gray-700 text-sm sm:text-base font-medium">
              Tarea: <span className="font-extrabold text-violet-600">{selectedTask.name}</span>
            </p>

            {selectedTask.isSubmitted ? (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base font-medium">Ya has subido un archivo. ¿Deseas cancelarlo o subir uno nuevo?</p>
                {fileError && (
                  <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-3 font-semibold">
                    {fileError} {' '}
                    {fileError.includes('1.5MB') && (
                      <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Comprimir PDF</a>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleCancelSubmission(selectedTask.id)}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm font-extrabold border-2 border-red-600 touch-manipulation"
                  >
                    Cancelar Entrega
                  </button>
                  <label className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm cursor-pointer font-extrabold border-2 border-blue-600 touch-manipulation text-center">
                    {loadingUpload ? 'Subiendo...' : 'Subir Nuevo PDF'}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setLastSelectedSizeMB(formatMB(f.size));
                          handleFileUpload(selectedTask.id, f);
                        }
                      }}
                      className="hidden"
                      disabled={loadingUpload}
                    />
                  </label>
                </div>
                <div className="mt-3 text-[11px] sm:text-xs text-gray-600 leading-snug font-medium">
                  Límite: <span className="font-extrabold">1.5MB</span>. {lastSelectedSizeMB && (<span>Archivo elegido: {lastSelectedSizeMB} MB. </span>)}
                  ¿Pesa más? <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Comprimir PDF</a>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base font-medium">Por favor, sube tu tarea en formato PDF.</p>
                {fileError && (
                  <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-3 font-semibold">
                    {fileError} {' '}
                    {fileError.includes('1.5MB') && (
                      <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Comprimir PDF</a>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      setLastSelectedSizeMB(formatMB(f.size));
                      handleFileUpload(selectedTask.id, f);
                    }
                  }}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-2 file:text-sm file:font-extrabold file:bg-gradient-to-r file:from-violet-100 file:to-indigo-100 file:text-violet-700 hover:file:from-violet-200 hover:file:to-indigo-200 file:shadow-md file:border-violet-300 mb-2"
                  disabled={loadingUpload}
                />
                <div className="mb-4 text-[11px] sm:text-xs text-gray-600 leading-snug font-medium">
                  Límite: <span className="font-extrabold">1.5MB</span>. {lastSelectedSizeMB && (<span>Archivo elegido: {lastSelectedSizeMB} MB. </span>)}
                  ¿Pesa más? <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Comprimir PDF</a>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm font-extrabold border-2 border-gray-600 touch-manipulation"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de visualización de tarea - Mejorado */}
      {showViewTaskModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 pt-16 sm:pt-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeViewTaskModal();
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl 2xl:max-w-5xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] transform transition-all duration-300 scale-100 border-2 border-violet-200/50 ring-2 ring-violet-100/50 flex flex-col overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1">Visualizar Tarea</h2>
                <p className="text-violet-100 text-xs sm:text-sm truncate font-medium">
                  Tarea: <span className="font-extrabold text-white">{viewingTaskName}</span>
                </p>
              </div>
              <button
                onClick={closeViewTaskModal}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 border border-white/30"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Contenido del PDF */}
            <div className="flex-1 overflow-hidden flex flex-col p-3 sm:p-6 bg-gray-50">
              {viewingTaskPdf ? (
                <>
                  {/* Contenedor del PDF con mejor diseño */}
                  <div className={`w-full bg-white rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner relative flex flex-col ${(isMobile || isPdfIframeBlocked) ? 'flex-1 min-h-[400px] sm:min-h-[450px]' : 'h-[calc(75vh-200px)] sm:h-[calc(75vh-180px)]'}`}>
                    {(isMobile || isPdfIframeBlocked) ? (
                      <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
                        <PdfMobileViewer url={viewingTaskPdf} enableGestures={true} />
                      </div>
                    ) : (
                      <iframe
                        allowFullScreen
                        key={viewingTaskPdf}
                        src={viewingTaskPdf}
                        title="Visor de PDF"
                        className="w-full h-full border-none"
                        onError={(e) => {
                          e.currentTarget.outerHTML = '<div class=\'w-full h-full flex items-center justify-center text-sm text-red-500 bg-red-50 rounded\'>Error cargando PDF. Por favor, intenta abrirlo en una nueva pestaña.</div>';
                        }}
                      />
                    )}
                  </div>

                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No hay archivo subido para visualizar.</p>
                  </div>
                </div>
              )}

              {/* Botones de acción - Mejorados */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4 flex-shrink-0">
                {viewingTaskPdf && (
                  <button
                    onClick={handleOpenPdfInNewTab}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 border-2 border-blue-700 touch-manipulation"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ver en nueva pestaña
                  </button>
                )}
                <button
                  onClick={closeViewTaskModal}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 text-xs sm:text-sm font-extrabold border-2 border-gray-600 touch-manipulation"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal: Ver nota del asesor - Mejorado */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeNoteModal}>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-violet-200/50 ring-2 ring-violet-100/50" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
              <div className="font-extrabold text-sm sm:text-base truncate flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Nota del asesor · {noteView.taskName}</span>
              </div>
              <button onClick={closeNoteModal} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold transition-all active:scale-95 border border-white/30">
                <X className="w-3.5 h-3.5" /> Cerrar
              </button>
            </div>
            <div className="p-4 sm:p-5">
              {noteView.text ? (
                <p className="text-sm sm:text-base text-slate-800 whitespace-pre-wrap break-words font-medium leading-relaxed">{noteView.text}</p>
              ) : (
                <p className="text-sm sm:text-base text-slate-500 font-medium">No hay nota disponible para esta entrega.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}

      {/* Modal: Crear nueva actividad - Mejorado */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-violet-200/50 ring-2 ring-violet-100/50">
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 -m-6 sm:-m-8 mb-6 sm:mb-8 p-5 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Nueva actividad</h2>
            </div>
            <p className="text-sm text-gray-700 mb-4 font-medium">Crea una actividad con el nombre que prefieras. La fecha de entrega se generará cuando subas tu PDF.</p>
            <label className="block text-sm font-extrabold text-violet-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Nombre de la actividad</span>
            </label>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              maxLength={100}
              className="w-full p-3 rounded-xl bg-white border-2 border-violet-300 text-violet-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-violet-400 focus:outline-none focus:border-violet-400 font-medium transition-all"
              placeholder="Ej. Lectura capítulo 1"
            />
            {newTaskError && <div className="mt-3 text-xs text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-3 font-extrabold">{newTaskError}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeCreateTask} className="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm font-extrabold border-2 border-gray-600 touch-manipulation">Cancelar</button>
              <button onClick={confirmCreateTask} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm font-extrabold border-2 border-violet-700 touch-manipulation">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback_Alumno_Comp;