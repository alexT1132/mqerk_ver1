import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuiz, listIntentosQuizEstudiante, getQuizIntentoReview } from '../../api/quizzes';
import { ArrowLeft, Trophy, Clock, CheckCircle2, XCircle, Circle, Filter } from 'lucide-react';

// CÓDIGO CORREGIDO Y COMPLETO PARA LA PÁGINA DE RESULTADOS DEL QUIZ
export default function QuizResultadosPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { alumno, user } = useAuth() || {};
  const estudianteId = alumno?.id || user?.id_estudiante || user?.id || null;

  const [quiz, setQuiz] = useState(() => location.state?.quiz || null);
  const [intentos, setIntentos] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState('');

  const totalIntentos = intentos.length || (quiz?.totalIntentos || 0);
  const mejorPuntaje = intentos.length ? Math.max(...intentos.map(i => Number(i.puntaje || 0))) : (quiz?.mejorPuntaje || 0);
  const promedio = intentos.length ? (intentos.reduce((s, i) => s + Number(i.puntaje || 0), 0) / intentos.length) : (quiz?.promedio || 0);

  const [intentoSel, setIntentoSel] = useState(null);
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [filtro, setFiltro] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!estudianteId || !quizId) return;

    // Parte clave de la solución: Guardar la ruta de regreso para saber a dónde volver.
    if (location.state?.returnTo) {
      try { sessionStorage.setItem('quiz_return_to', location.state.returnTo); } catch { }
    }

    setLoadingMeta(true);
    setMetaError('');
    Promise.all([
      // Si el quiz no vino en el estado de la navegación, lo cargamos.
      quiz ? Promise.resolve({ data: { data: quiz } }) : getQuiz(quizId),
      listIntentosQuizEstudiante(quizId, estudianteId)
    ])
      .then(([qres, ires]) => {
        const qdata = qres?.data?.data || qres?.data || null;
        const lista = ires?.data?.data || ires?.data || [];
        setQuiz(qdata);
        const intentosMapeados = lista.map((it, idx) => ({
          id: it.id || idx + 1,
          numero: it.intent_number || it.numero || idx + 1,
          fecha: it.created_at || it.fecha || it.updated_at || new Date().toISOString(),
          puntaje: Number(it.puntaje ?? it.score ?? 0),
          tiempoEmpleado: Number(it.tiempo_segundos ?? it.duration_sec ?? 0),
        }));
        setIntentos(intentosMapeados);
        // Por defecto, seleccionar el último intento para mostrar sus detalles.
        if (intentosMapeados.length > 0) {
          setIntentoSel(intentosMapeados[intentosMapeados.length - 1].numero);
        }
      })
      .catch(() => setMetaError('No se pudo cargar la información del quiz.'))
      .finally(() => setLoadingMeta(false));
  }, [quizId, estudianteId]);

  useEffect(() => {
    if (!estudianteId || !quizId || !intentoSel) {
      setReview(null);
      return;
    }
    setLoadingReview(true);
    setReviewError('');
    getQuizIntentoReview(quizId, estudianteId, intentoSel)
      .then(resp => setReview(resp?.data?.data || resp?.data || null))
      .catch(() => setReviewError('No se pudo cargar el detalle de este intento.'))
      .finally(() => setLoadingReview(false));
  }, [quizId, estudianteId, intentoSel]);

  // ✅ SOLUCIÓN APLICADA AQUÍ ✅
  // Esta es la versión definitiva y correcta para el botón "Volver".
  const handleGoBack = () => {
    const returnToFromState = location.state?.returnTo;
    let returnToFromSession = null;

    try {
      returnToFromSession = sessionStorage.getItem('quiz_return_to');
    } catch {
      returnToFromSession = null;
    }

    const target = returnToFromState || returnToFromSession;

    if (target) {
      try { sessionStorage.removeItem('quiz_return_to'); } catch {}
      navigate(target, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const puntajeIntento = review?.resumen?.puntaje ?? (intentos.find(i => (i.numero) === review?.intento)?.puntaje) ?? null;
  const tiempoIntento = review?.resumen?.tiempo_segundos ?? (intentos.find(i => (i.numero) === review?.intento)?.tiempoEmpleado) ?? null;
  const correctasIntento = useMemo(() => (review?.preguntas || []).filter(p => p.correcta).length, [review]);
  const totalPreguntasIntento = review?.preguntas?.length || 0;
  const filtradas = useMemo(() => {
    if (!review?.preguntas) return [];
    if (filtro === 'correctas') return review.preguntas.filter(p => p.correcta);
    if (filtro === 'incorrectas') return review.preguntas.filter(p => !p.correcta);
    return review.preguntas;
  }, [review, filtro]);

  const ScoreRing = ({ value = 0 }) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    const color = pct < 50 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#22c55e';
    const textTone = pct < 50 ? 'text-red-600' : pct < 70 ? 'text-amber-600' : 'text-green-600';
    const bg = `conic-gradient(${color} ${pct * 3.6}deg, #e5e7eb 0deg)`;
    return (
      <div className="relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 flex-none" title={`${pct}%`}>
        <div className="absolute inset-0 rounded-full" style={{ background: bg }} />
        <div className="absolute inset-1.5 lg:inset-2 bg-white rounded-full grid place-items-center shadow-inner">
          <div className="text-center">
            <div className={`text-base lg:text-lg font-bold ${textTone}`}>{Math.round(pct)}%</div>
            <div className="text-[9px] lg:text-[10px] text-gray-500">puntaje</div>
          </div>
        </div>
      </div>
    );
  };

  // Formateo de duración similar a simulaciones (s, m s, h m s)
  const formatDuration = (seconds) => {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value <= 0) return '—';
    const sec = Math.round(value);
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    if (mins < 60) return `${mins}m${remSec ? ` ${remSec}s` : ''}`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h${remMins ? ` ${remMins}m` : ''}${remSec ? ` ${remSec}s` : ''}`;
  };

  const renderPregunta = (p, idx) => {
    const selected = new Set(p.seleccionadas || []);
    const isCorrect = !!p.correcta;
    return (
      <div key={p.id || idx} className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-medium text-gray-500">Pregunta {p.orden ?? (idx + 1)}</div>
              <div className="mt-0.5 text-gray-900 font-semibold leading-6 text-sm sm:text-base">{p.enunciado}</div>
            </div>
            <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isCorrect ? 'Correcta' : 'Incorrecta'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
            {p.tipo && (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md capitalize">
                {String(p.tipo).replace(/_/g, ' ')}
              </span>
            )}
            {typeof p.puntos === 'number' && (
              <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-600">
                {p.puntos} punto{p.puntos === 1 ? '' : 's'}
              </span>
            )}
            {p.tiempo_ms ? (
              <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-gray-500" />
                {formatDuration(p.tiempo_ms / 1000)}
              </span>
            ) : null}
          </div>
          <ul className="space-y-1.5 sm:space-y-2">
          {(p.opciones || []).map((o) => {
            const sel = selected.has(o.id);
            const corr = o.es_correcta === 1;
            const base = 'text-xs sm:text-sm rounded-lg border px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between transition-colors';
            const cl = sel && corr
              ? 'bg-green-50 border-green-300'
              : sel && !corr
                ? 'bg-red-50 border-red-300'
                : !sel && corr
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100';
            return (
              <li key={o.id} className={`${base} ${cl}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {sel ? (
                    corr ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  ) : (
                    corr ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  )}
                  <span className="truncate">{o.texto}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  {corr && <span className="text-emerald-700">Correcta</span>}
                  {sel && <span className="text-blue-700">Marcada</span>}
                </div>
              </li>
            );
          })}
          </ul>
          {p.valor_texto && (
            <div className="text-[11px] sm:text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md">
              <span className="font-medium text-gray-700">Respuesta escrita:</span>{' '}
              <span className="text-gray-800">{p.valor_texto}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 max-[380px]:px-2 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">Resultados del Quiz</h1>
            <div className="text-white/90 text-xs sm:text-sm md:text-base truncate">{quiz?.titulo || quiz?.nombre || `Quiz #${quizId}`}</div>
          </div>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="max-[380px]:hidden">Volver</span>
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 max-[380px]:px-2 py-4 sm:py-6 overflow-x-hidden">
        {loadingMeta ? (
          <div className="text-gray-600">Cargando información…</div>
        ) : metaError ? (
          <div className="text-red-600">{metaError}</div>
        ) : (
          <>
            <div className="lg:sticky lg:top-0 z-10">
              <div className="bg-white/90 backdrop-blur rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 mb-4 sm:mb-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 max-w-full">
                    <ScoreRing value={review ? (puntajeIntento || 0) : (mejorPuntaje || 0)} />
                    <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-700">
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
                          <span className="text-gray-500">Aciertos</span>
                          <span className="font-semibold">{review ? `${correctasIntento}/${totalPreguntasIntento || '--'}` : '—'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
                          <span className="text-gray-500">Intentos</span>
                          <span className="font-semibold">{totalIntentos || 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-500">Mejor</span>
                          <span className="font-semibold">{Number(mejorPuntaje || 0)}%</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
                          <span className="text-gray-500">Promedio</span>
                          <span className="font-semibold">{Number.isFinite(promedio) ? promedio.toFixed(1) : '0.0'}%</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-0.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span className="text-gray-500">Tiempo</span>
                          <span className="font-semibold">{review ? formatDuration(tiempoIntento) : '—'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-2 lg:gap-3 w-full">
                    {totalIntentos > 1 && (
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="font-medium text-xs md:text-sm text-gray-700 hidden sm:inline">Intento:</span>
                        <select className="border rounded-md px-2 py-1 text-xs md:text-sm" value={intentoSel || ''} onChange={(e) => setIntentoSel(Number(e.target.value))}>
                          {intentos.map(i => (<option key={i.id} value={i.numero}>#{i.numero}</option>))}
                        </select>
                      </div>
                    )}
                    <div className="hidden lg:flex items-center gap-2">
                      <span className="text-sm text-gray-600">Filtrar:</span>
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setFiltro('all')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'all' ? 'bg-white shadow border' : ''}`}>Todas</button>
                        <button onClick={() => setFiltro('correctas')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'correctas' ? 'bg-white shadow border' : ''}`}>Correctas</button>
                        <button onClick={() => setFiltro('incorrectas')} className={`px-3 py-1.5 text-xs rounded-md ${filtro === 'incorrectas' ? 'bg-white shadow border' : ''}`}>Incorrectas</button>
                      </div>
                    </div>
                    <button onClick={() => setMobileFiltersOpen(v => !v)} className="lg:hidden inline-flex items-center gap-1.5 px-2 py-1.5 text-xs bg-gray-100 rounded-md">
                      <Filter className="w-4 h-4" />
                      <span className="sr-only">Abrir filtros</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-4">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full justify-between">
                  <button onClick={() => setFiltro('all')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'all' ? 'bg-white shadow border' : ''}`}>Todas</button>
                  <button onClick={() => setFiltro('correctas')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'correctas' ? 'bg-white shadow border' : ''}`}>Correctas</button>
                  <button onClick={() => setFiltro('incorrectas')} className={`flex-1 mx-0.5 px-2 py-1.5 text-xs rounded-md ${filtro === 'incorrectas' ? 'bg-white shadow border' : ''}`}>Incorrectas</button>
                </div>
              </div>
            )}
            {loadingReview ? (
              <div className="text-gray-600">Cargando intento…</div>
            ) : reviewError ? (
              <div className="text-red-600">{reviewError}</div>
            ) : review && Array.isArray(review.preguntas) ? (
              filtradas.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                  {filtradas.map((p, idx) => (
                    <div key={p.id || idx}>{renderPregunta(p, idx)}</div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No hay preguntas bajo este filtro.</div>
              )
            ) : (
              <div className="text-gray-500">No hay detalles disponibles para este intento.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}