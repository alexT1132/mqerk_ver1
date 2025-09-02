import React, { useState, useEffect } from 'react';
import { Upload, Eye, CheckCircle, XCircle, Sparkles, Star, ChevronDown, RefreshCcw, PlusCircle, Info, MessageSquareText, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { listTasks, listSubmissionsByStudent, createSubmission, createTask, updateTask, cancelSubmissionApi, getSubmissionNote } from '../../api/feedback.js';
import { buildStaticUrl } from '../../utils/url.js';

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
  const formatMB = (bytes) => (bytes / (1024*1024)).toFixed(2);

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
          listSubmissionsByStudent(alumnoId, { limit: 10000 }).catch(() => ({ data: { data: [] }}))
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
  try { /* antes se actualizaba due_date aquí; se elimina para evitar mover la tarea de mes */ } catch {}
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
      // Ajustar contador mensual si aplica
      try {
        const dueM = t?.dueDate ? new Date(t.dueDate).getMonth() : null;
        const nowM = new Date().getMonth();
        if (dueM !== null && dueM === nowM) {
          setMonthlyCountThisMonth(prev => {
            const next = Math.max(0, prev - 1);
            setMonthlyCapReached(next >= perMonthCap);
            return next;
          });
        }
      } catch {}
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
        listSubmissionsByStudent(alumnoId, { limit: 10000 }).catch(() => ({ data: { data: [] }}))
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

  // Helpers y mapeo de meses (igual que vista del asesor)
  const monthKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
  };
  const distinctMonths = React.useMemo(() => {
    const set = new Set();
    for (const t of tasks) { if (t?.dueDate) set.add(monthKey(t.dueDate)); }
    return Array.from(set).sort((a,b)=> new Date(b+"-01") - new Date(a+"-01"));
  }, [tasks]);
  const REVERSED_ORDINALS = ['Octavo','Séptimo','Sexto','Quinto','Cuarto','Tercero','Segundo','Primero'];
  const monthKeyByOrdinal = React.useMemo(() => {
    const map = {};
    distinctMonths.forEach((mk, idx) => { if (idx < REVERSED_ORDINALS.length) map[REVERSED_ORDINALS[idx]] = mk; });
    return map;
  }, [distinctMonths]);

  // Recalcular el conteo de creadas por el alumno para el mes seleccionado (ordinal)
  const studentOwnedCountForSelected = React.useMemo(() => {
    try {
      const mk = selectedMonth === 'all' ? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })() : monthKeyByOrdinal[selectedMonth];
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
    if (y === now.getFullYear() && (m-1) < now.getMonth()) return true;
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
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
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

  // Opciones de meses a mostrar (ordinales, mismo orden que en asesor)
  const months = REVERSED_ORDINALS;

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
    // TODO: Backend - Aquí tu compañero debe usar la URL real del PDF desde el backend
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
    <div className="min-h-screen bg-white p-3 sm:p-6 font-sans text-gray-800 flex flex-col items-center relative overflow-hidden">
      {/* Título responsivo */}
  <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-8 text-purple-700 drop-shadow-lg text-center tracking-tight">
        FEEDBACK
      </h1>
     

      {/* Puntos + Progreso */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-200 rounded-xl shadow-lg p-5 sm:p-6 mb-4 sm:mb-8 flex flex-col sm:flex-row gap-5 sm:items-center w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 drop-shadow-lg" fill="currentColor" />
          <div>
            <p className="text-base sm:text-xl font-semibold text-purple-700">Puntos Totales</p>
            <p className="text-3xl sm:text-4xl font-bold text-purple-800 drop-shadow-lg">{totalPoints} pts</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-700">Progreso mensual</span>
            <span className="text-xs font-bold text-purple-800">{monthProgress}%</span>
          </div>
          <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500" style={{ width: `${monthProgress}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-purple-600 text-right">{monthSubmitted}/{monthTotal} entregadas</p>
        </div>
      </div>
      {fetchError && (
        <div className="w-full max-w-3xl mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{fetchError}</div>
      )}
      {loadingTasks && (
        <div className="w-full max-w-3xl mb-4 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin"/>Cargando...</div>
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

  {/* Filtros: Mes + Búsqueda */}
  <div className="mb-4 sm:mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full max-w-3xl lg:static sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-1 pt-2 rounded-xl">
        <label className="text-sm sm:text-lg font-medium text-purple-700 drop-shadow-sm text-center sm:text-left">
          Feedback del mes:
        </label>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:min-w-[200px] p-3 pr-10 rounded-lg bg-white border-2 border-purple-200 text-purple-700 shadow-lg focus:ring-2 focus:ring-purple-400 focus:outline-none focus:border-purple-400 flex items-center justify-between text-sm sm:text-base"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Seleccionar mes"
          >
            <span className="truncate">{getSelectedMonthName()}</span>
            <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-purple-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
              <div
                onClick={() => handleMonthSelect('all', 'Todos los meses')}
                className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-purple-700 border-b border-purple-100"
              >
                Todos los meses
              </div>
        {months.map((month, index) => (
                <div
                  key={index}
          onClick={() => handleMonthSelect(month, month)}
                  className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-purple-700 border-b border-purple-100 last:border-b-0"
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar tarea..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full p-3 rounded-lg bg-white border-2 border-purple-200 text-purple-700 shadow-lg focus:ring-2 focus:ring-purple-400 focus:outline-none focus:border-purple-400 placeholder-purple-300 text-sm sm:text-base"
            aria-label="Buscar tarea"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={openCreateTask}
            disabled={studentOwnedCountThisMonth >= perMonthCap || isPastSelectedMonth}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg border-2 ${(studentOwnedCountThisMonth >= perMonthCap || isPastSelectedMonth) ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-700'}`}
            title={studentOwnedCountThisMonth >= perMonthCap ? `Has alcanzado el límite mensual de ${perMonthCap} actividades creadas` : (isPastSelectedMonth ? 'No puedes crear actividades en meses pasados' : 'Crear nueva actividad')}
          >
            <PlusCircle className="w-5 h-5" />
            Nueva actividad
          </button>
        </div>
      </div>

  {/* Vista de escritorio - Tabla */}
  {/* Contenedor más ancho y con scroll horizontal para evitar que el contenido se mueva o se corte */}
  <div className="hidden lg:block w-full max-w-7xl">
    <div className="bg-purple-100 bg-opacity-70 backdrop-blur-sm border-2 border-purple-300 rounded-2xl shadow-xl overflow-x-auto">
      <table className="min-w-[1100px] table-fixed">
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
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600">
            <tr>
      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">No.</th>
      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Nombre de la tarea</th>
      <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Cargar mi actividad</th>
      <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Fecha de entrega</th>
      <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Visualizar</th>
      <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Nota</th>
      <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Entregado</th>
      <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Puntaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-300 bg-purple-100 bg-opacity-50">
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((task, index) => (
                <tr key={task.id} className="hover:bg-purple-200 hover:bg-opacity-70 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">{indexOfFirst + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium truncate" title={task.name}>{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-center items-center">
                    <button
                      onClick={() => openModal(task)}
                      disabled={!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted)}
                      className={`flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                        (!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted))
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : (task.isSubmitted
                              ? 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-300'
                              : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300')
                      }`}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      {task.isSubmitted ? 'Gestionar Entrega' : (monthlyCapReached ? 'Límite mensual' : 'Subir Tarea')}
                    </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <div className="flex flex-col gap-1">
                      <span>{(task._isStudentOwned && !task.isSubmitted) ? 'Se genera al subir' : new Date(task.dueDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                      {(() => { if (task._isStudentOwned && !task.isSubmitted) return null; const u = getUrgencyInfo(task.dueDate, task.isSubmitted); return u ? (
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ring-1 ${u.color} ${u.ring}`}>{u.label}</span>
                      ) : null; })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-center items-center">
                    <button
                      onClick={() => openViewTaskModal(task)}
                      disabled={!task.submittedPdf}
                      className={`p-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                        task.submittedPdf
                          ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300'
                          : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-center items-center">
                    {task._subId ? (
                      (notesBySubmission[task._subId] ? (
                        <button
                          onClick={() => openNoteModal(task)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow"
                          title="Ver nota del asesor"
                        >
                          <MessageSquareText className="w-4 h-4"/> Nota
                        </button>
                      ) : (
                        <span className="text-gray-500">Sin nota</span>
                      ))
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-center items-center">
                      {task.isSubmitted ? (
                        <CheckCircle className="w-7 h-7 text-green-500 drop-shadow-lg" />
                      ) : (
                        <XCircle className="w-7 h-7 text-red-500 drop-shadow-lg" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-purple-700 font-semibold text-center">{task.score !== null ? `${task.score} pts` : '-'}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-600 text-lg font-medium">
                  No hay tareas para el mes seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
        {/* Controles de paginación escritorio */}
        {filteredTasks.length > TASKS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-purple-300">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
            >
              Anterior
            </button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {buildPageList().map((p, idx) => (
                p === '...'
                  ? <span key={idx} className="px-2 py-1 text-sm text-gray-500 select-none">...</span>
                  : <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-8 h-8 rounded-md text-sm font-medium border flex items-center justify-center transition ${p === currentPage ? 'bg-purple-600 text-white border-purple-600' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
                    >{p}</button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

  {/* Vista móvil - Cards en 2 columnas */}
  <div className="lg:hidden w-full max-w-4xl">
    {paginatedTasks.length > 0 ? (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {paginatedTasks.map((task, index) => (
              <div
                key={task.id}
                className="relative bg-gradient-to-br from-purple-100 via-indigo-100 to-white border-2 border-purple-200 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col gap-2 transition-transform duration-200 hover:scale-[1.02] hover:shadow-purple-300/60"
              >
                {/* Header con badge alineado (sin superponer) */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md shrink-0">#{indexOfFirst + index + 1}</span>
                    <h3
                      className="font-bold text-purple-800 text-sm sm:text-base leading-snug break-words line-clamp-2 min-w-0"
                      title={task.name}
                    >
                      {task.name}
                    </h3>
                    <button
                      type="button"
                      className="sm:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0"
                      aria-label="Ver nombre completo"
                      title="Ver nombre completo"
                      onClick={() => setShowFullNameId(task.id)}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${task.isSubmitted ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-600 border border-red-300'}`}>
                    {task.isSubmitted ? 'Entregado' : 'Pendiente'}
                  </span>
                </div>
                {/* Overlay con nombre completo (solo móvil) */}
                {showFullNameId === task.id && (
                  <div className="lg:hidden absolute left-2 right-2 top-10 z-20 bg-white/95 border border-purple-200 rounded-lg shadow-xl p-2 text-[13px] text-purple-800 break-words">
                    {task.name}
                  </div>
                )}
                {/* Puntaje */}
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 drop-shadow" fill="currentColor" />
                  <span className="text-sm sm:text-base font-bold text-purple-700">{task.score !== null ? `${task.score} pts` : '-'}</span>
                </div>
                {/* Fecha de entrega + urgencia */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium mb-2 flex-wrap">
                  <span className="bg-purple-200 text-purple-700 px-2 py-0.5 rounded-lg">Entrega:</span>
                  <span className="text-gray-700">{(task._isStudentOwned && !task.isSubmitted) ? 'Se genera al subir' : new Date(task.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</span>
                  {(() => { if (task._isStudentOwned && !task.isSubmitted) return null; const u = getUrgencyInfo(task.dueDate, task.isSubmitted); return u ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.color} ring-1 ${u.ring}`}>{u.label}</span>
                  ) : null; })()}
                </div>
                {/* Estado visual */}
                <div className="flex items-center gap-1.5 mb-2">
                  {task.isSubmitted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold text-xs ${task.isSubmitted ? 'text-green-600' : 'text-red-500'}`}>{task.isSubmitted ? '¡Entregado!' : 'Sin entregar'}</span>
                </div>
                {/* Botones de acción */}
                <div className={`grid ${notesBySubmission[task._subId] ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mt-auto`}>
                  <button
                    onClick={() => openModal(task)}
                    disabled={!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted)}
                    className={`w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-lg shadow-md transition-all duration-200 text-xs font-semibold gap-1 ${
                      (!canActOnTask(task) || (monthlyCapReached && !task.isSubmitted))
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : (task.isSubmitted ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white')
                    }`}
                    aria-label={task.isSubmitted ? 'Gestionar entrega' : 'Subir tarea'}
                    title={task.isSubmitted ? 'Gestionar entrega' : (monthlyCapReached ? 'Límite mensual' : 'Subir tarea')}
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">
                      {task.isSubmitted ? 'Gestionar' : (monthlyCapReached ? 'Límite mensual' : 'Subir')}
                    </span>
                  </button>
                  <button
                    onClick={() => openViewTaskModal(task)}
                    disabled={!task.submittedPdf}
                    className={`w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-lg shadow-md transition-all duration-200 text-xs font-semibold ${
                      task.submittedPdf
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-white'
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
                      className="w-full flex items-center justify-center h-9 sm:h-auto px-2 sm:px-3 py-2 rounded-lg shadow-md transition-all duration-200 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
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
          <div className="bg-white border-2 border-purple-200 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-base font-medium">
              No hay tareas para el mes seleccionado.
            </p>
          </div>
        )}
        {/* Controles de paginación móvil */}
        {filteredTasks.length > TASKS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6 bg-white border border-purple-200 rounded-xl p-4 shadow-md">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
            >Anterior</button>
            <div className="flex items-center gap-1 flex-wrap justify-center text-xs">
              {buildPageList().map((p, idx) => (
                p === '...'
                  ? <span key={idx} className="px-2 py-1 text-gray-500 select-none">...</span>
                  : <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-7 h-7 rounded-md border flex items-center justify-center ${p === currentPage ? 'bg-purple-600 text-white border-purple-600' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
                    >{p}</button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}
            >Siguiente</button>
          </div>
        )}
      </div>

      {/* Modal para Subir/Cancelar */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">
              {selectedTask.isSubmitted ? 'Gestionar Entrega' : 'Subir Tarea'}
            </h2>
            {monthlyCapReached && (
              <div className="mb-3 text-xs sm:text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                Límite mensual alcanzado ({perMonthCap}). Podrás subir nuevamente el próximo mes.
              </div>
            )}
            <p className="mb-6 text-gray-700 text-sm sm:text-base">
              Tarea: <span className="font-semibold text-purple-600">{selectedTask.name}</span>
            </p>

            {selectedTask.isSubmitted ? (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base">Ya has subido un archivo. ¿Deseas cancelarlo o subir uno nuevo?</p>
                {fileError && (
                  <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {fileError} {' '}
                    {fileError.includes('1.5MB') && (
                      <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Comprimir PDF</a>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleCancelSubmission(selectedTask.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
                  >
                    Cancelar Entrega
                  </button>
                  <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm cursor-pointer">
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
                <div className="mt-3 text-[11px] sm:text-xs text-gray-600 leading-snug">
                  Límite: <span className="font-semibold">1.5MB</span>. {lastSelectedSizeMB && (<span>Archivo elegido: {lastSelectedSizeMB} MB. </span>)}
                  ¿Pesa más? <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Comprimir PDF</a>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base">Por favor, sube tu tarea en formato PDF.</p>
                {fileError && (
                  <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {fileError} {' '}
                    {fileError.includes('1.5MB') && (
                      <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Comprimir PDF</a>
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
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:shadow-md mb-2"
                  disabled={loadingUpload}
                />
                <div className="mb-4 text-[11px] sm:text-xs text-gray-600 leading-snug">
                  Límite: <span className="font-semibold">1.5MB</span>. {lastSelectedSizeMB && (<span>Archivo elegido: {lastSelectedSizeMB} MB. </span>)}
                  ¿Pesa más? <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Comprimir PDF</a>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de visualización de tarea */}
      {showViewTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200 flex flex-col"
               style={{ maxHeight: '70vh' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">Visualizar Tarea</h2>
            <p className="mb-4 text-gray-700 text-sm sm:text-base">
              Tarea: <span className="font-semibold text-purple-600">{viewingTaskName}</span>
            </p>
    {viewingTaskPdf ? (
              <>
                <div className="flex-grow w-full h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-300 flex items-center justify-center relative">
      {(isMobile || isPdfIframeBlocked) ? (
                    <span className="text-gray-500 text-center text-xs px-2">En móvil, usa "Ver en nueva pestaña" para mejor experiencia.</span>
                  ) : (
                    <iframe
                      key={viewingTaskPdf}
                      src={viewingTaskPdf}
                      title="Visor de PDF"
                      className="w-full h-full border-none"
                      onError={(e) => { e.currentTarget.outerHTML = '<div class=\'w-full h-full flex items-center justify-center text-xs text-red-500\'>Error cargando PDF</div>'; }}
                    />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 text-center mb-2">
                  Ruta: {viewingTaskPdf?.replace(window.location.origin,'')}
                </p>
              </>
            ) : (
              <p className="mb-6 text-gray-700 text-sm sm:text-base text-center">
                No hay archivo subido para visualizar.
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-auto">
              {viewingTaskPdf && (
                <button
                  onClick={handleOpenPdfInNewTab}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  Ver en nueva pestaña
                </button>
              )}
              <button
                onClick={closeViewTaskModal}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver nota del asesor */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeNoteModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-purple-200" onClick={(e)=> e.stopPropagation()}>
            <div className="px-4 py-3 bg-[#3d18c3] text-white flex items-center justify-between">
              <div className="font-semibold text-sm truncate">Nota del asesor · {noteView.taskName}</div>
              <button onClick={closeNoteModal} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs">
                <X className="w-3.5 h-3.5"/> Cerrar
              </button>
            </div>
            <div className="p-4">
              {noteView.text ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{noteView.text}</p>
              ) : (
                <p className="text-sm text-slate-500">No hay nota disponible para esta entrega.</p>
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

      {/* Modal: Crear nueva actividad */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">Nueva actividad</h2>
            <p className="text-sm text-gray-700 mb-3">Crea una actividad con el nombre que prefieras. La fecha de entrega se generará cuando subas tu PDF.</p>
            <label className="block text-sm font-medium text-purple-700 mb-1">Nombre de la actividad</label>
            <input
              type="text"
              value={newTaskName}
              onChange={(e)=> setNewTaskName(e.target.value)}
              maxLength={100}
              className="w-full p-3 rounded-lg bg-white border-2 border-purple-200 text-purple-700 shadow focus:ring-2 focus:ring-purple-400 focus:outline-none focus:border-purple-400"
              placeholder="Ej. Lectura capítulo 1"
            />
            {newTaskError && <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{newTaskError}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeCreateTask} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow text-sm">Cancelar</button>
              <button onClick={confirmCreateTask} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow text-sm">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback_Alumno_Comp;