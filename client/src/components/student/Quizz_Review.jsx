// BACKEND: Página separada para responder quizzes (runner/review)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { crearSesionQuiz, listPreguntasQuiz, enviarRespuestasSesion, finalizarSesionQuiz } from '../../api/simulaciones';
import { CheckCircle2, AlertTriangle, Timer, Send, Loader2, Maximize2 } from 'lucide-react';
import { createAreaRequest } from '../../api/areaAccess';
import { getQuiz } from '../../api/quizzes';
import MathEquationEditor, { isMathSubject, isMathQuestion } from '../shared/MathEquationEditor.jsx';

// --- Ícono de Check para opciones seleccionadas ---
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Confetti overlay sin dependencias (canvas + requestAnimationFrame)
function ConfettiOverlay({ run = true, duration = 2500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!run) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const setSize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#10b981'];
    const shapes = ['rect', 'circle', 'triangle'];

    const spawnBurst = (count = 80, y = 0.25) => {
      const { width } = canvas.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI) - (Math.PI / 2);
        const speed = 6 + Math.random() * 6;
        particlesRef.current.push({
          x: Math.random() * width,
          y: canvas.clientHeight * y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6,
          g: 0.25 + Math.random() * 0.25,
          w: 5 + Math.random() * 6,
          h: 8 + Math.random() * 10,
          r: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          alpha: 1,
        });
      }
    };

    // Tres ráfagas escalonadas
    spawnBurst(90, 0.2);
    setTimeout(() => spawnBurst(70, 0.1), 200);
    setTimeout(() => spawnBurst(80, 0.15), 400);

    const animate = (t) => {
      if (!startRef.current) startRef.current = t;
      const elapsed = t - startRef.current;

      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        // Fade out near the end
        if (elapsed > duration * 0.6) {
          p.alpha = Math.max(0, p.alpha - 0.015);
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        switch (p.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(p.w, p.h) / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -p.h / 2);
            ctx.lineTo(p.w / 2, p.h / 2);
            ctx.lineTo(-p.w / 2, p.h / 2);
            ctx.closePath();
            ctx.fill();
            break;
          default:
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      // Remove off-screen or fully transparent
      particlesRef.current = particlesRef.current.filter((p) => p.y < height + 40 && p.alpha > 0.02);

      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      particlesRef.current = [];
      startRef.current = 0;
    };
  }, [run, duration]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <canvas ref={canvasRef} className="w-screen h-screen" />
    </div>
  );
}

export default function Quizz_Review() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { alumno, isAuthenticated, loading: authLoading } = useAuth();

  const estudianteId = useMemo(() => alumno?.id_estudiante || alumno?.id || alumno?.folio || null, [alumno]);

  // Estado básico del runner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sesionId, setSesionId] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Quiz');
  const [startedAt, setStartedAt] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null);
  const [isMathQuiz, setIsMathQuiz] = useState(false);
  // Timing por pregunta (ms) para análisis: distribuimos el tiempo entre preguntas según interacción
  const timingRef = useRef({ lastTs: null, lastQid: null, buckets: new Map() });
  
  // Estados para la lógica de seguridad
  const [tabAwayCount, setTabAwayCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isWindowTooSmall, setIsWindowTooSmall] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [forcedSubmitMessage, setForcedSubmitMessage] = useState('');
  const [autoTimeout, setAutoTimeout] = useState(false);

  // Refs para control
  const timerRef = useRef(null);
  const submitOnceRef = useRef(false);

  // --- Lógica de seguridad y carga ---
  useEffect(() => {
    if (finalizado) return;

    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; return ''; };
    const onPopState = () => { window.history.pushState(null, '', window.location.href); };
    const onVisibility = () => { if (document.visibilityState === 'hidden') { setTabAwayCount((c) => c + 1); } };
    
    const onResize = () => {
      // En móviles/tablets (dispositivos táctiles) NO bloquear por tamaño de ventana
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
      if (isTouch) {
        setIsWindowTooSmall(false);
        return;
      }
      // En desktop, advierte si la ventana está muy reducida
      const screenPercentage = Math.round((window.innerWidth / window.screen.width) * 100);
      setIsWindowTooSmall(screenPercentage < 75);
    };
    onResize();

    // VERSIÓN MEJORADA: Bloquea más atajos de teclado
    const onKeyDown = (e) => {
      // Bloqueo de Recarga
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) { 
        e.preventDefault(); 
      }
      // Bloqueo de Navegación y Backspace
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); }
      if (e.key === 'Backspace' && !['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase()) && !e.target.isContentEditable) { e.preventDefault(); }

      // Bloqueo de atajos para DevTools y ver código fuente
      if (e.key === 'F12' || 
         (e.ctrlKey && e.shiftKey && e.key === 'I') || 
         (e.ctrlKey && e.shiftKey && e.key === 'J') || 
         (e.ctrlKey && e.shiftKey && e.key === 'C') ||
         (e.ctrlKey && e.key === 'u'))
      {
        e.preventDefault();
      }
    };

    const onContextMenu = (e) => { e.preventDefault(); };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('contextmenu', onContextMenu, true);
    
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('contextmenu', onContextMenu, true);
    };
  }, [finalizado]);

  // Lógica de advertencia/bloqueo por cambio de pestaña
  useEffect(() => {
    if (showFinalWarning) return;
    
    if (tabAwayCount >= 5 && tabAwayCount <= 6) {
      setShowWarningModal(true);
    }
    else if (tabAwayCount > 6 && !submitOnceRef.current) {
      submitOnceRef.current = true;
      setShowWarningModal(false); 
      setShowFinalWarning(true);
      setForcedSubmitMessage('El quiz se finalizó por exceder el límite de cambios de pestaña.');

      setTimeout(async () => {
        try { await handleEnviar(); } 
        catch (err) { console.error("Fallo el envío automático por cambio de pestaña:", err); } 
        // El cierre automático se maneja en el useEffect de finalizado
        // No necesitamos hacer nada aquí porque handleEnviar() ya marca finalizado como true
      }, 5000); 
    }
  }, [tabAwayCount, navigate, showFinalWarning]);
  
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      setLoading(true); setError('');
      try {
        // Requiere sesión activa del alumno
        if (!isAuthenticated) {
          setError('Debes iniciar sesión para realizar el quiz.');
          setLoading(false);
          return;
        }
        if (!estudianteId) {
          setError('No se pudo determinar tu ID de estudiante. Vuelve a iniciar sesión.');
          setLoading(false);
          return;
        }
        const [preg, meta] = await Promise.all([ listPreguntasQuiz(quizId), getQuiz(quizId) ]);
        
        if (!mounted) return;
        setPreguntas(preg?.data?.data || preg?.data || []);
        // Inicializar reloj base al cargar preguntas
        timingRef.current.lastTs = Date.now();
        timingRef.current.lastQid = null;
        const q = meta?.data?.data || meta?.data || {};
        
        // Determinar si es un quiz de matemáticas - buscar materia en múltiples lugares
        // También verificar el título del quiz como fallback
        const materia = q?.materia || meta?.data?.materia || meta?.data?.data?.materia || meta?.materia || '';
        const titulo = q?.titulo || q?.title || q?.nombre || q?.name || q?.tema || '';
        console.log('[Quizz_Review] Materia del quiz encontrada:', materia);
        console.log('[Quizz_Review] Título del quiz:', titulo);
        console.log('[Quizz_Review] Objeto completo meta:', meta);
        console.log('[Quizz_Review] Objeto q:', q);
        
        // Verificar si es matemáticas por materia o por título
        const esMatematicas = isMathSubject(materia) || isMathSubject(titulo);
        console.log('[Quizz_Review] ¿Es quiz de matemáticas?', esMatematicas);
        setIsMathQuiz(esMatematicas);
  setQuizMeta(q || null);
        const tlm = Number(q.time_limit_min || q.timeLimitMin || q.tiempo_limite_min || q.time_limit || 0);
        if (!Number.isNaN(tlm) && tlm > 0) setTimeLimitSec(tlm * 60);
        else setTimeLimitSec(null);
        if (q.titulo || q.title || q.nombre || q.name || q.tema) setQuizTitle(q.titulo || q.title || q.nombre || q.name || q.tema);
        try {
          const ses = await crearSesionQuiz(quizId, { id_estudiante: estudianteId });
          const sid = ses?.data?.id || ses?.data?.data?.id || ses?.data?.sesionId;
          if (sid) setSesionId(sid);
        } catch (e) {
          const status = e?.response?.status;
          const msg = e?.response?.data?.message;
          if (status === 403) {
            setError(msg || 'No tienes permiso para este módulo/área.');
          } else if (status === 401) {
            setError('Sesión no válida o expirada. Inicia sesión nuevamente.');
          } else if (status === 400) {
            setError(msg || 'Solicitud inválida al iniciar la sesión de quiz.');
          } else {
            setError('No se pudo iniciar la sesión del quiz.');
          }
          setLoading(false);
          return;
        }
        setStartedAt(Date.now());
      } catch (e) { 
          console.error(e);
          setError('No se pudieron cargar las preguntas del quiz.'); 
      }
      finally { if (mounted) setLoading(false); }
    };
    bootstrap();
    return () => { mounted = false; };
  }, [quizId, estudianteId, isAuthenticated]);

  // Marcar este quiz como "abierto" en localStorage con un latido periódico
  useEffect(() => {
    if (!quizId) return;
    const key = `quiz_open_${quizId}`;
    const pid = Math.random().toString(36).slice(2);
    const beat = () => {
      try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), pid })); } catch {}
    };
    beat();
    const iv = setInterval(beat, 5000);
    const onVis = () => beat();
    const onUnload = () => { try { localStorage.removeItem(key); } catch {} };
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);
    return () => {
      clearInterval(iv);
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('pagehide', onUnload);
      try { localStorage.removeItem(key); } catch {}
    };
  }, [quizId]);
  
  const [timeLimitSec, setTimeLimitSec] = useState(null);
  const [remainingSec, setRemainingSec] = useState(null);

  useEffect(() => {
    if (finalizado || !timeLimitSec) return;
    const key = sesionId ? `quiz_end_${sesionId}` : `quiz_end_q_${quizId}`;
    let endTs = Number(sessionStorage.getItem(key));
    if (!endTs || endTs <= Date.now()) {
      endTs = Date.now() + timeLimitSec * 1000;
      sessionStorage.setItem(key, String(endTs));
    }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((endTs - Date.now()) / 1000));
      setRemainingSec(rem);
      if (rem <= 0 && !submitOnceRef.current) {
        submitOnceRef.current = true;
        setAutoTimeout(true);
        setTimeout(() => handleEnviar(), 300);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLimitSec, sesionId, quizId, finalizado]);

  const handleSelect = (idPregunta, idOpcion) => {
    if (showFinalWarning || showWarningModal || isWindowTooSmall) return;
    // Acumular tiempo desde la última interacción a la pregunta anterior
    const now = Date.now();
    const t = timingRef.current;
    if (t.lastTs != null && t.lastQid != null) {
      const delta = Math.max(0, now - t.lastTs);
      const prev = t.buckets.get(t.lastQid) || 0;
      t.buckets.set(t.lastQid, prev + delta);
    }
    t.lastTs = now;
    t.lastQid = idPregunta;
    setRespuestas(prev => ({ ...prev, [idPregunta]: idOpcion }));
  };

  // Manejar respuesta corta (texto libre)
  const handleTextAnswer = (idPregunta, valorTexto) => {
    if (showFinalWarning || showWarningModal || isWindowTooSmall) return;
    // Acumular tiempo desde la última interacción a la pregunta anterior
    const now = Date.now();
    const t = timingRef.current;
    if (t.lastTs != null && t.lastQid != null) {
      const delta = Math.max(0, now - t.lastTs);
      const prev = t.buckets.get(t.lastQid) || 0;
      t.buckets.set(t.lastQid, prev + delta);
    }
    t.lastTs = now;
    t.lastQid = idPregunta;
    setRespuestas(prev => ({ ...prev, [idPregunta]: { valor_texto: valorTexto } }));
  };

  const handleEnviar = async () => {
    if (enviando) return;
    setEnviando(true); 
    setError('');
    try {
      // Cerrar el último tramo de tiempo sobre la última pregunta activa
      const now = Date.now();
      if (timingRef.current.lastTs != null && timingRef.current.lastQid != null) {
        const delta = Math.max(0, now - timingRef.current.lastTs);
        const prev = timingRef.current.buckets.get(timingRef.current.lastQid) || 0;
        timingRef.current.buckets.set(timingRef.current.lastQid, prev + delta);
        timingRef.current.lastTs = now;
      }
      // Construir payload incluyendo tiempo_ms por pregunta (si disponible)
      // Soporta tanto opciones (id_opcion) como respuestas cortas (valor_texto)
      const payload = Object.entries(respuestas).map(([id_pregunta, respuesta]) => {
        const tiempo = Math.max(0, Math.round(timingRef.current.buckets.get(Number(id_pregunta)) || 0)) || undefined;
        // Si la respuesta es un objeto con valor_texto, es una respuesta corta
        if (typeof respuesta === 'object' && respuesta !== null && respuesta.valor_texto !== undefined) {
          return {
            id_pregunta: Number(id_pregunta),
            id_opcion: null,
            valor_texto: respuesta.valor_texto || '',
            tiempo_ms: tiempo
          };
        }
        // Si no, es una opción seleccionada
        return {
          id_pregunta: Number(id_pregunta),
          id_opcion: Number(respuesta),
          valor_texto: null,
          tiempo_ms: tiempo
        };
      });
      if (sesionId) {
        if (payload.length) await enviarRespuestasSesion(sesionId, payload);
        const finishedAt = Date.now();
        const elapsedMs = (startedAt ? (finishedAt - startedAt) : null);
        const finalizePayload = {
          finished_at: new Date(finishedAt).toISOString(),
          started_at: startedAt ? new Date(startedAt).toISOString() : null,
          elapsed_ms: elapsedMs,
          reason: autoTimeout ? 'timeout' : (showFinalWarning ? 'forced' : 'manual'),
          answered_count: Object.keys(respuestas).length,
          question_count: preguntas.length,
        };
        try {
          await finalizarSesionQuiz(sesionId, finalizePayload);
        } catch (e) {
          const status = e?.response?.status;
          const msg = e?.response?.data?.message || 'No se pudo finalizar el quiz.';
          setError(status === 403 ? `${msg} (contacta a tu asesor si persiste).` : msg);
          setEnviando(false);
          throw e;
        }
      }
      setFinalizado(true);
      const key = sesionId ? `quiz_end_${sesionId}` : `quiz_end_q_${quizId}`;
      sessionStorage.removeItem(key);
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'QUIZ_FINISHED', quizId, sesionId }, window.location.origin);
      }
    } catch (e) {
      console.error(e);
      setError('No se pudo enviar el quiz. Intenta de nuevo.');
      setEnviando(false);
      throw e; 
    }
  };

  const formatTime = (sec) => {
    if (sec == null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // Contar preguntas respondidas (incluyendo respuestas cortas que pueden estar vacías)
  const answeredCount = Object.keys(respuestas).filter(id => {
    const respuesta = respuestas[id];
    // Si es un objeto con valor_texto, contar solo si tiene texto
    if (typeof respuesta === 'object' && respuesta !== null && respuesta.valor_texto !== undefined) {
      return String(respuesta.valor_texto || '').trim().length > 0;
    }
    // Si es una opción seleccionada (número), contar
    return respuesta !== null && respuesta !== undefined;
  }).length;
  const totalQuestions = preguntas.length;
  const timePercent = useMemo(() => {
    if (!timeLimitSec || remainingSec == null) return null;
    return Math.max(0, Math.min(100, Math.round((remainingSec / timeLimitSec) * 100)));
  }, [timeLimitSec, remainingSec]);

  // Función para construir la ruta de retorno preservando el área correcta
  const getReturnPath = () => {
    // 1. Intentar usar returnTo del state (si se pasó al navegar)
    const returnTo = location.state?.returnTo;
    if (returnTo && typeof returnTo === 'string' && returnTo.includes('/alumno/actividades')) {
      return returnTo;
    }
    
    // 2. Intentar obtener areaId del quizMeta
    const areaIdFromMeta = quizMeta?.id_area || quizMeta?.area_id;
    if (areaIdFromMeta && Number.isFinite(Number(areaIdFromMeta))) {
      return `/alumno/actividades?type=quiz&areaId=${areaIdFromMeta}`;
    }
    
    // 3. Intentar obtener areaId de la URL actual (si se pasó como parámetro)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const areaIdFromUrl = urlParams.get('areaId');
      if (areaIdFromUrl && Number.isFinite(Number(areaIdFromUrl))) {
        return `/alumno/actividades?type=quiz&areaId=${areaIdFromUrl}`;
      }
    } catch {}
    
    // 4. Fallback: área por defecto (Español)
    return '/alumno/actividades?type=quiz&areaId=1';
  };

  // Cerrar pestaña con fallback: intenta cerrar y, si el navegador lo bloquea, vuelve a Actividades
  const handleCloseTab = () => {
    const returnPath = getReturnPath();
    try { localStorage.removeItem(`quiz_open_${quizId}`); } catch {}
    try {
      if (window.opener && !window.opener.closed) {
        try { window.opener.focus(); } catch {}
        try { window.opener.postMessage({ type: 'QUIZ_CLOSED', quizId, sesionId }, window.location.origin); } catch {}
      }
    } catch {}
    try { window.close(); } catch {}
    // Si window.close() no cierra (pestaña no abierta por script), redirigir como fallback
    setTimeout(() => {
      try { navigate(returnPath, { replace: true }); }
      catch { try { window.location.href = returnPath; } catch {} }
    }, 150);
  };

  // ---------------- Navegación de retorno flexible ----------------
  // --- Navegación de retorno a la tabla de quizzes con el área correcta ---
  const handleReturnButton = () => {
    const returnPath = getReturnPath();
    navigate(returnPath, { replace: true });
  };

  // Cerrar automáticamente la pestaña cuando el quiz termina
  useEffect(() => {
    if (!finalizado) return;
    
    // Limpiar localStorage
    try { localStorage.removeItem(`quiz_open_${quizId}`); } catch {}
    
    // Obtener la ruta de retorno correcta
    const returnPath = getReturnPath();
    
    // Función para intentar cerrar la pestaña de manera más agresiva
    const attemptClose = () => {
      try {
        // Notificar a la ventana padre si existe
        if (window.opener && !window.opener.closed) {
          try { 
            window.opener.focus(); 
            window.opener.postMessage({ 
              type: forcedSubmitMessage ? 'QUIZ_CLOSED' : 'QUIZ_FINISHED', 
              quizId, 
              sesionId 
            }, window.location.origin); 
          } catch {}
        }
        
        // Intentar cerrar la pestaña - solo funciona si fue abierta con window.open()
        const canClose = window.opener !== null || window.history.length <= 1;
        if (canClose) {
          try {
            window.close();
            // Si window.close() no funciona inmediatamente, usar location.href como alternativa
            setTimeout(() => {
              if (!document.hidden) {
                // La pestaña aún está visible, usar fallback
                window.location.href = 'about:blank';
                setTimeout(() => {
                  try { navigate(returnPath, { replace: true }); }
                  catch { try { window.location.href = returnPath; } catch {} }
                }, 100);
              }
            }, 100);
          } catch (e) {
            console.log('[Quiz] window.close() falló:', e.message);
            // Fallback inmediato si window.close() falla
            window.location.href = returnPath;
          }
        } else {
          // No se puede cerrar porque no fue abierta por script, redirigir directamente
          window.location.href = returnPath;
        }
      } catch (e) {
        console.log('[Quiz] Error al cerrar pestaña:', e.message);
        // Fallback final: redirigir
        try { navigate(returnPath, { replace: true }); }
        catch { try { window.location.href = returnPath; } catch {} }
      }
    };
    
    // Si fue forzado por seguridad o timeout, cerrar más rápido
    if (forcedSubmitMessage || autoTimeout) {
      const delay = forcedSubmitMessage ? 2500 : 4000; // 2.5s si fue forzado, 4s si fue timeout
      const closeTimer = setTimeout(attemptClose, delay);
      
      return () => {
        clearTimeout(closeTimer);
      };
    }
    // Si terminó normalmente, dar tiempo para ver el resultado pero cerrar automáticamente
    else {
      const closeTimer = setTimeout(attemptClose, 8000); // 8 segundos después de terminar normalmente
      
      return () => {
        clearTimeout(closeTimer);
      };
    }
  }, [finalizado, forcedSubmitMessage, autoTimeout, quizId, sesionId, navigate, location, quizMeta]);

  // Permisos: solicitud rápida si hay 403 por área
  const handleRequestAccess = async () => {
    // Intentamos inferir el área desde la ruta de retorno (?areaId=)
    try {
      const guessedArea = Number(quizMeta?.id_area || quizMeta?.area_id || 0);
      const url = new URL(window.location.href);
      const areaIdFromUrl = Number(url.searchParams.get('areaId') || 0);
      const areaId = guessedArea || areaIdFromUrl || 1;
      await createAreaRequest({ area_id: areaId, area_type: 'actividad', notes: `Solicitud acceso para QUIZ ${quizId}` });
      alert('Solicitud enviada. Un asesor revisará tu acceso.');
    } catch (e) {
      alert('No se pudo enviar la solicitud. Intenta más tarde.');
    }
  };


  return (
    <div className="min-h-screen bg-white font-sans">
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm mt-12 sm:mt-16">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 break-words leading-tight flex-1">{quizTitle}</h1>
                {/* Contador compacto para móviles */}
                <span className="sm:hidden text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap flex-shrink-0 mt-0.5">{answeredCount}/{totalQuestions}</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-500 hidden sm:block mt-0.5 leading-tight">Modo seguro activado. Concéntrate en tus respuestas.</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {answeredCount}/{totalQuestions}
              </div>
              <div className={`flex items-center gap-1 text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full border ${timeLimitSec ? (remainingSec!=null && remainingSec<=60 ? 'border-red-300 bg-red-50 text-red-700 animate-pulse' : 'border-gray-200 bg-white text-gray-800') : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
                <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="whitespace-nowrap">{timeLimitSec ? formatTime(remainingSec) : 'Sin límite'}</span>
              </div>
            </div>
          </div>
        </div>
        {timePercent != null && (
          <div className="w-full h-0.5 bg-gray-200">
            <div className={`h-0.5 rounded-r-full transition-all duration-500 ${timePercent <= 15 ? 'bg-red-500' : timePercent <= 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${timePercent}%` }} />
          </div>
        )}
      </div>

  <div className="w-full px-3 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-4 sm:pb-8">
        {loading && (
          <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
            <p className="font-medium">Cargando quiz...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Error al cargar</p>
              <p className="text-sm">{error}</p>
              {String(error).toLowerCase().includes('permiso') && (
                <div className="mt-3">
                  <button onClick={handleRequestAccess} className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Solicitar acceso</button>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && !finalizado && (
          <div className="space-y-5 sm:space-y-8">
            {preguntas.length === 0 ? (
              <div className="py-24 text-center text-gray-500">Este quiz aún no tiene preguntas.</div>
            ) : (
              preguntas.map((p, idx) => (
                <div key={p.id} className="sm:bg-white sm:border sm:border-gray-200 sm:rounded-xl sm:shadow-sm sm:hover:border-indigo-300 sm:hover-shadow-md transition-all p-0 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[12px] sm:text-sm font-bold ring-3 sm:ring-4 ring-indigo-100">{idx + 1}</div>
                    <div className="w-full">
                      <p className="font-semibold text-gray-900 mb-3 sm:mb-4 text-[15px] sm:text-lg">{p.enunciado || p.pregunta || `Pregunta ${idx+1}`}</p>
                      
                      {/* Opción múltiple */}
                      {p.tipo === 'opcion_multiple' && (p.opciones || []).length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                          {(p.opciones || []).map(op => {
                            const checked = respuestas[p.id] === op.id;
                            return (
                              <button key={op.id} onClick={() => handleSelect(p.id, op.id)} aria-pressed={checked}
                                className={`group text-left border rounded-lg p-3 sm:p-3.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${checked ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                              >
                                <div className="flex items-start gap-3">
                                  <span aria-hidden="true" className={`inline-flex flex-none shrink-0 grow-0 h-5 w-5 min-w-[20px] min-h-[20px] items-center justify-center rounded-full border-2 transition-colors duration-200 ${checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 bg-white group-hover:border-indigo-500'}`}>
                                    {checked && <CheckIcon />}
                                  </span>
                                  <span className="text-[14px] sm:text-sm text-gray-800 leading-[1.35] break-words">{op.texto || op.opcion || `Opción ${op.id}`}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Verdadero/Falso */}
                      {p.tipo === 'verdadero_falso' && (p.opciones || []).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(p.opciones || []).map(op => {
                            const checked = respuestas[p.id] === op.id;
                            return (
                              <button key={op.id} onClick={() => handleSelect(p.id, op.id)} aria-pressed={checked}
                                className={`group text-left border-2 rounded-xl p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${checked ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span aria-hidden="true" className={`inline-flex flex-none shrink-0 grow-0 h-6 w-6 min-w-[24px] min-h-[24px] items-center justify-center rounded-full border-2 transition-colors duration-200 ${checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 bg-white group-hover:border-indigo-500'}`}>
                                    {checked && <CheckIcon />}
                                  </span>
                                  <span className="text-base sm:text-lg font-semibold text-gray-800">{op.texto || op.opcion || `Opción ${op.id}`}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Respuesta corta */}
                      {p.tipo === 'respuesta_corta' && (
                        <div>
                          {(() => {
                            // Verificar materia del quiz O contenido de la pregunta individual
                            const esMatematicas = isMathQuiz || isMathQuestion(p);
                            console.log('[Quizz_Review] Renderizando respuesta_corta', {
                              isMathQuiz,
                              isMathQuestion: isMathQuestion(p),
                              esMatematicas,
                              preguntaTexto: (p.enunciado || p.pregunta || '').substring(0, 50)
                            });
                            return esMatematicas ? (
                              <MathEquationEditor
                                value={typeof respuestas[p.id] === 'object' && respuestas[p.id]?.valor_texto !== undefined 
                                  ? respuestas[p.id].valor_texto 
                                  : (respuestas[p.id] || '')}
                                onChange={(value) => handleTextAnswer(p.id, value)}
                                placeholder="Escribe tu respuesta aquí..."
                                rows={4}
                              />
                            ) : (
                              <>
                                <textarea
                                  value={typeof respuestas[p.id] === 'object' && respuestas[p.id]?.valor_texto !== undefined 
                                    ? respuestas[p.id].valor_texto 
                                    : (respuestas[p.id] || '')}
                                  onChange={(e) => handleTextAnswer(p.id, e.target.value)}
                                  placeholder="Escribe tu respuesta aquí..."
                                  rows={4}
                                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors resize-y"
                                />
                                <p className="mt-2 text-xs text-gray-500">Escribe tu respuesta en el cuadro de texto arriba.</p>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Fallback: Si el tipo no se reconoce o no hay opciones, mostrar mensaje */}
                      {p.tipo !== 'opcion_multiple' && p.tipo !== 'verdadero_falso' && p.tipo !== 'respuesta_corta' && (!p.opciones || p.opciones.length === 0) && (
                        <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                          Tipo de pregunta no soportado: {p.tipo || 'desconocido'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {finalizado && (
          <div className="relative py-20 text-center animate-fade-in-up">
            {/* Confetti solo en éxito manual (no forzado ni por timeout) */}
            {!forcedSubmitMessage && !autoTimeout && (
              <ConfettiOverlay run={true} duration={2800} />
            )}
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              {forcedSubmitMessage ? '¡Quiz Finalizado!' : (autoTimeout ? '¡Tiempo agotado!' : '¡Quiz enviado con éxito!')}
            </h2>
            <p className="text-gray-600 mt-2">
              {forcedSubmitMessage || (autoTimeout ? 'Tus respuestas fueron guardadas automáticamente.' : 'Tus resultados han sido registrados.')}
            </p>
            {!forcedSubmitMessage && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button onClick={handleReturnButton} className="px-6 py-2.5 rounded-lg font-semibold bg-gray-800 hover:bg-black text-white transition-colors">Volver</button>
                <button onClick={handleCloseTab} className="px-6 py-2.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Cerrar Pestaña</button>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && !error && !finalizado && totalQuestions > 0 && (
         <div className="sticky bottom-0 z-40 bg-white/90 backdrop-blur-lg shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
          <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-center sm:justify-end">
            <button
              disabled={enviando || answeredCount === 0 || showFinalWarning || showWarningModal || isWindowTooSmall}
              onClick={handleEnviar}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 rounded-lg text-white font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${enviando || answeredCount === 0 || showFinalWarning || showWarningModal || isWindowTooSmall ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>{enviando ? 'Enviando...' : 'Finalizar y Enviar'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Cambio de Pestaña */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all animate-fade-in-up relative">
            <AlertTriangle className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Has Salido de la Pestaña del Quiz</h2>
            <p className="text-gray-600 mt-3">
              El verdadero reto es contigo mismo. ¡Confiamos en tu honestidad!<br/>
              Respira profundo y concéntrate en tus respuestas.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              (Advertencia {tabAwayCount} de 7)
            </p>
            <button 
              onClick={() => setShowWarningModal(false)}
              className="mt-6 w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Entendido, continuar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Bloqueo por tamaño de ventana */}
      {isWindowTooSmall && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all animate-fade-in-up relative">
            <Maximize2 className="w-14 h-14 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Maximiza la Ventana para Continuar</h2>
            <p className="text-gray-600 mt-2">
             Para asegurar una experiencia de examen justa, el quiz se pausará hasta que la ventana ocupe la pantalla completa.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Bloqueo final por advertencias */}
      {showFinalWarning && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all animate-fade-in-up">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Límite de Advertencias Excedido</h2>
            <p className="text-gray-600 mt-3">
              Se ha detectado una posible falta a las reglas del quiz.
            </p>
            <p className="font-semibold text-gray-800 mt-4">
              El quiz se enviará automáticamente y serás redirigido.
            </p>
            <div className="mt-6">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}