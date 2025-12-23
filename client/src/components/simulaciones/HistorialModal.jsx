import React, { useEffect, useRef, useState } from 'react';
import { FileText, Lightbulb, Sparkles, AlertTriangle, Eye } from 'lucide-react';
import { analyzeQuizPerformance } from '../../service/quizAnalysisService';
import AnalisisModal from './AnalisisModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { getQuizIntentoReview } from '../../api/quizzes';
import { useAuth } from '../../context/AuthContext';

/**
 * Modal compacto de historial de intentos.
 */
export default function HistorialModal({ open, item, historial, onClose }) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isAnalisisModalOpen, setIsAnalisisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const { alumno, user } = useAuth() || {};
  const estudianteId = alumno?.id || user?.id_estudiante || user?.id || null;
  const estudianteNombre = (() => {
    try {
      if (alumno?.nombre) return `${alumno.nombre} ${alumno.apellidos || ''}`.trim();
      if (user?.name && user.name !== 'XXXX') return String(user.name);
      if (user?.nombre) return `${user.nombre} ${user.apellidos || ''}`.trim();
    } catch { }
    return null;
  })();
  const scrollLock = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isAnalisisModalOpen) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, isAnalisisModalOpen]);

  useEffect(() => {
    if (open && !isAnalisisModalOpen) {
      previousFocusRef.current = document.activeElement;
      closeButtonRef.current?.focus();
    } else if (!open && previousFocusRef.current) {
      if (document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    }
  }, [open, isAnalisisModalOpen]);

  // Lock background scroll when the modal is open (prevents double scrollbars on mobile)
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      scrollLock.current = true;
      const prevRootOverflow = root.style.overflow;
      const prevBodyOverflow = document.body.style.overflow;
      root.dataset.prevOverflow = prevRootOverflow;
      document.body.dataset.prevOverflow = prevBodyOverflow;
      root.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (scrollLock.current) {
        root.style.overflow = root.dataset.prevOverflow || '';
        document.body.style.overflow = document.body.dataset.prevOverflow || '';
        delete root.dataset.prevOverflow;
        delete document.body.dataset.prevOverflow;
        scrollLock.current = false;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAnalysisResult('');
      setIsLoadingAnalysis(false);
      setAnalysisError('');
      setIsAnalisisModalOpen(false);
    }
  }, [open]);

  const handleAnalyzePerformance = async () => {
    if (!historial || historial.intentos.length === 0) {
      setAnalysisError("No hay suficientes datos para un análisis.");
      setIsAnalisisModalOpen(true);
      return;
    }

    setIsAnalisisModalOpen(true);
    setIsLoadingAnalysis(true);
    setAnalysisResult('');
    setAnalysisError('');
    setAnalysisMeta(null);

    try {
      // Ordenar cronológicamente (más antiguo -> más reciente) para análisis
      const ordered = Array.isArray(historial.intentos)
        ? [...historial.intentos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        : [];
      // Cálculos adicionales
      const scores = ordered.map(i => i.puntaje);
      const fechas = ordered.map(i => i.fecha);
      // Usar segundos. Acepta 'tiempo_segundos' (estándar backend) o fallback 'tiempoEmpleado' (normalizado en cliente)
      const durationsArr = ordered
        .map(i => {
          if (typeof i.tiempo_segundos === 'number') return i.tiempo_segundos;
          if (typeof i.tiempoEmpleado === 'number') return i.tiempoEmpleado;
          return null;
        })
        .filter(v => v != null);
      const promedioDuracion = durationsArr.length ? (durationsArr.reduce((a, b) => a + b, 0) / durationsArr.length) : null;
      const mejorDuracion = durationsArr.length ? Math.min(...durationsArr) : null;
      const peorDuracion = durationsArr.length ? Math.max(...durationsArr) : null;
      const ultimoPuntaje = scores.length > 0 ? scores[scores.length - 1] : null;
      const mejoraDesdePrimero = (scores.length > 1) ? (scores[scores.length - 1] - scores[0]) : 0;
      // Métricas del intento oficial (siempre el primero cronológico)
      const oficialPuntaje = scores.length ? scores[0] : null;
      const oficialFecha = fechas.length ? fechas[0] : null;
      const oficialDuracion = durationsArr.length ? durationsArr[0] : null;
      // Pendiente de tendencia (regresión lineal simple)
      let pendienteTendencia = null;
      if (scores.length > 1) {
        const n = scores.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = scores.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * scores[i], 0);
        const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
        pendienteTendencia = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      }
      // Desviación estándar
      let desviacionPuntaje = null;
      if (scores.length > 1) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        desviacionPuntaje = Math.sqrt(scores.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (scores.length - 1));
      }
      // Enriquecer con el detalle del último intento (igual que la página de resultados)
      let detalleUltimoIntento = null;
      // Nuevo: analizar errores recurrentes en los últimos intentos (hasta 5) para dar pistas y recursos
      const MAX_REVIEWS = Math.min(5, ordered.length);
      const recurrentMap = new Map(); // key: texto base de enunciado, value: { count, sample }
      try {
        const intentoSel = historial.intentos.length; // último intento (1..N)
        if (item?.id && estudianteId && intentoSel) {
          // 1) Traer último intento
          const resp = await getQuizIntentoReview(item.id, estudianteId, intentoSel);
          detalleUltimoIntento = resp?.data?.data || resp?.data || null;
          // 2) Traer hasta 5 intentos hacia atrás para detectar errores repetidos
          const indices = [];
          for (let k = Math.max(1, intentoSel - MAX_REVIEWS + 1); k <= intentoSel; k++) indices.push(k);
          for (const k of indices) {
            try {
              const r = (k === intentoSel) ? { data: { data: detalleUltimoIntento } } : await getQuizIntentoReview(item.id, estudianteId, k);
              const det = r?.data?.data || r?.data || null;
              if (!det || !Array.isArray(det.preguntas)) continue;
              for (const p of det.preguntas) {
                if (p && !p.correcta) {
                  const base = String(p.enunciado || '').replace(/\s+/g, ' ').trim();
                  if (!base) continue;
                  const key = base.toLowerCase().slice(0, 200);
                  const prev = recurrentMap.get(key) || { count: 0, sample: base };
                  prev.count += 1;
                  if (!prev.sample) prev.sample = base;
                  recurrentMap.set(key, prev);
                }
              }
            } catch (e) {
              // seguimos con los demás
              console.warn('No se pudo obtener intento', k, e);
            }
          }
        }
      } catch (e) {
        // si falla, continuamos con análisis básico
        console.warn('No se pudo obtener el detalle del intento para análisis IA:', e);
      }

      // Derivar métricas por pregunta del último intento
      const preguntas = Array.isArray(detalleUltimoIntento?.preguntas) ? detalleUltimoIntento.preguntas : [];
      const totalPreguntasIntento = preguntas.length || null;
      const correctasIntento = preguntas.filter(p => !!p.correcta).length || null;
      const incorrectasIntento = (totalPreguntasIntento != null ? totalPreguntasIntento - correctasIntento : null);
      const omitidasIntento = preguntas.filter(p => !p.correcta && (!p.seleccionadas || p.seleccionadas.length === 0) && !p.valor_texto).length || null;
      let incorrectasLista = preguntas.filter(p => !p.correcta).map(p => p.enunciado).slice(0, 12);
      if ((!incorrectasLista || incorrectasLista.length === 0) && Array.isArray(detalleUltimoIntento?.preguntas)) {
        incorrectasLista = detalleUltimoIntento.preguntas.filter(p => !p.correcta).map(p => p.enunciado).slice(0, 12);
      }
      // Detalle textual por pregunta incorrecta: selección vs correcta
      const incorrectasDetalle = preguntas.filter(p => !p.correcta).map(p => {
        const optMap = new Map((p.opciones || []).map(o => [o.id, o.texto]));
        const seleccion = (Array.isArray(p.seleccionadas) ? p.seleccionadas : []).map(id => optMap.get(id)).filter(Boolean);
        const correctas = (p.opciones || []).filter(o => Number(o.es_correcta) === 1).map(o => o.texto);
        return { enunciado: p.enunciado, seleccion, correctas, tipo: p.tipo };
      }).slice(0, 10);
      const tiemposMs = preguntas.map(p => p.tiempo_ms || 0).filter(v => Number(v) > 0);
      // Fallback a resumen.tiempo_segundos si no hay tiempos por pregunta
      const resumenIntento = detalleUltimoIntento?.resumen || null;
      const totalTiempoIntento = (tiemposMs.length > 0)
        ? tiemposMs.reduce((a, b) => a + b, 0)
        : (resumenIntento?.tiempo_segundos ? Number(resumenIntento.tiempo_segundos) * 1000 : null);
      const promedioTiempoPregunta = (tiemposMs.length > 0 && totalPreguntasIntento)
        ? (totalTiempoIntento / tiemposMs.length)
        : (totalTiempoIntento != null && totalPreguntasIntento ? (totalTiempoIntento / totalPreguntasIntento) : null);

      const previoPuntaje = scores.length > 1 ? scores[scores.length - 2] : null;
      const deltaUltimoVsAnterior = (ultimoPuntaje != null && previoPuntaje != null) ? (ultimoPuntaje - previoPuntaje) : null;
      const deltaUltimoVsOficial = (ultimoPuntaje != null && oficialPuntaje != null) ? (ultimoPuntaje - oficialPuntaje) : null;
      const deltaMejorVsOficial = (historial?.mejorPuntaje != null && oficialPuntaje != null) ? (historial.mejorPuntaje - oficialPuntaje) : null;
      const practiceCount = Math.max(0, (historial?.totalIntentos || scores.length) - 1);

      // Construir lista de errores recurrentes (top 5)
      const recurrentList = Array.from(recurrentMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(x => ({ enunciado: x.sample, veces: x.count }));

      const metaPayload = {
        itemName: item?.nombre,
        alumnoNombre: estudianteNombre || null,
        totalIntentos: historial.totalIntentos,
        mejorPuntaje: historial.mejorPuntaje,
        promedio: historial.promedio,
        scores,
        fechas,
        duraciones: durationsArr,
        ultimoPuntaje,
        previoPuntaje,
        deltaUltimoVsAnterior,
        deltaUltimoVsOficial,
        deltaMejorVsOficial,
        practiceCount,
        erroresRecurrentes: recurrentList,
        mejoraDesdePrimero,
        pendienteTendencia,
        desviacionPuntaje,
        promedioDuracion,
        mejorDuracion,
        peorDuracion,
        // Nuevo: detalle del último intento
        intentoNumero: detalleUltimoIntento?.intento ?? ordered.length,
        totalPreguntasIntento,
        correctasIntento,
        incorrectasIntento,
        omitidasIntento,
        incorrectasLista,
        incorrectasDetalle,
        promedioTiempoPregunta,
        totalTiempoIntento,
        // Calificación oficial (intento 1)
        oficialPuntaje,
        oficialFecha,
        oficialDuracion,
      };
      const result = await analyzeQuizPerformance(metaPayload);
      // Preparar metadatos para exportación clara
      setAnalysisMeta({
        itemName: item?.nombre || '',
        alumnoNombre: estudianteNombre || null,
        totalIntentos: historial.totalIntentos || 0,
        mejorPuntaje: historial.mejorPuntaje || 0,
        promedio: Math.round(historial.promedio || 0),
        ultimoPuntaje: ultimoPuntaje ?? null,
        oficialPuntaje: oficialPuntaje ?? null,
        previoPuntaje: previoPuntaje ?? null,
        deltaUltimoVsAnterior: deltaUltimoVsAnterior,
        deltaUltimoVsOficial: deltaUltimoVsOficial,
        deltaMejorVsOficial: deltaMejorVsOficial,
        practiceCount,
        pendienteTendencia: (typeof pendienteTendencia === 'number') ? Number(pendienteTendencia) : null,
        desviacionPuntaje: (typeof desviacionPuntaje === 'number') ? Number(desviacionPuntaje) : null,
        promedioDuracion: promedioDuracion != null ? Math.round(promedioDuracion) : null,
        mejorDuracion: mejorDuracion != null ? Math.round(mejorDuracion) : null,
        peorDuracion: peorDuracion != null ? Math.round(peorDuracion) : null,
        intentoNumero: metaPayload.intentoNumero || null,
        totalPreguntasIntento: totalPreguntasIntento || null,
        correctasIntento: correctasIntento || 0,
        incorrectasIntento: incorrectasIntento || 0,
        omitidasIntento: omitidasIntento || 0,
        totalTiempoIntento: totalTiempoIntento != null ? Math.round(totalTiempoIntento / 1000) : null,
        promedioTiempoPregunta: promedioTiempoPregunta != null ? Math.round(promedioTiempoPregunta / 1000) : null,
        erroresRecurrentes: recurrentList,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error al llamar a la API de Gemini:", error);
      setAnalysisError("Hubo un problema al generar el análisis. Inténtalo de nuevo.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  if (!open || !item) return null;

  const safeHist = historial || { intentos: [], totalIntentos: 0, mejorPuntaje: 0, promedio: 0 };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 pt-safe pb-safe ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 overscroll-contain overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="historial-modal compact-desktop no-scrollbar relative bg-white/98 rounded-2xl shadow-2xl ring-1 ring-black/5 w-full max-w-[92vw] md:max-w-[30rem] lg:max-w-[32rem] xl:max-w-[36rem] h-[72vh] sm:h-[68vh] md:h-[62vh] lg:h-[58vh] max-h-[720px] overflow-hidden flex flex-col transform translate-y-6 sm:translate-y-8 md:translate-x-8 lg:translate-x-0">
          <div className="hm-header sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 flex-shrink-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 id="modal-title" className="text-lg sm:text-xl font-bold truncate">Historial de Intentos</h2>
                <p className="text-indigo-100 mt-1 text-sm truncate">{item.nombre}</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors ml-3 flex-shrink-0 p-2 hover:bg-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Cerrar modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Contenido scrollable */}
          <div className="hm-content flex-1 min-h-0 shrink p-3 sm:p-4 overflow-y-auto">
            <div className="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                <div className="text-blue-600 text-[11px] sm:text-xs font-medium" data-metric="title">Total de Intentos</div>
                <div className="text-lg sm:text-xl font-bold text-blue-800" data-metric="value">{safeHist.totalIntentos}</div>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                <div className="text-green-600 text-[11px] sm:text-xs font-medium" data-metric="title">Mejor Puntaje</div>
                <div className="text-lg sm:text-xl font-bold text-green-800" data-metric="value">{safeHist.mejorPuntaje}%</div>
              </div>
              <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200">
                <div className="text-purple-600 text-[11px] sm:text-xs font-medium" data-metric="title">Promedio</div>
                <div className="text-lg sm:text-xl font-bold text-purple-800" data-metric="value">{Math.round(safeHist.promedio || 0)}%</div>
              </div>
              <div className="bg-orange-50 p-2 sm:p-3 rounded-lg border border-orange-200">
                <div className="text-orange-600 text-[11px] sm:text-xs font-medium" data-metric="title">Último Intento</div>
                <div className="text-[11px] sm:text-sm font-bold text-orange-800" data-metric="value">
                  {safeHist.intentos.length > 0 ? new Date(safeHist.intentos[0].fecha).toLocaleDateString('es-ES') : 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Historial Detallado ({safeHist.intentos.length} intentos)</h3>
              {safeHist.intentos.length > 0 ? (
                <div className="attempts-box bg-gray-50 rounded-lg border border-gray-200 p-2 sm:p-3">
                  <div className="attempts-stack space-y-3">
                    {safeHist.intentos.map((intento, index) => {
                      const intentoNumero = intento.intent_number || (safeHist.totalIntentos - index);
                      const formatDur = (s) => {
                        if (s == null || Number.isNaN(Number(s))) return null;
                        const total = Math.max(0, Number(s));
                        const mm = Math.floor(total / 60);
                        const ss = total % 60;
                        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
                      };
                      const durSec = (typeof intento?.tiempo_segundos === 'number') ? intento.tiempo_segundos
                        : (typeof intento?.tiempoEmpleado === 'number') ? intento.tiempoEmpleado
                          : null;
                      // Ocultamos la duración en la UI del historial (se usa solo para IA)
                      return (
                        <div key={intento.id ?? intentoNumero} className="attempt-row bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0 flex-1">
                            <div className="attempt-index w-6 h-6 sm:w-7 sm:h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-[11px] sm:text-xs flex-shrink-0">{intentoNumero}</div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 text-sm">Intento {intentoNumero}</div>
                              <div className="text-xs text-gray-500 truncate">{new Date(intento.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</div>
                              {/* Duración oculta en UI: solo se usa para IA */}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2.5 sm:space-x-4 flex-shrink-0 ml-2">
                            <div className="text-right">
                              <div className={`${intento.puntaje === safeHist.mejorPuntaje ? 'text-green-600' : 'text-gray-700'} font-bold text-sm sm:text-base`}>
                                {intento.puntaje}%
                                {intento.puntaje === safeHist.mejorPuntaje && (<span className="ml-1 text-yellow-500">👑</span>)}
                              </div>
                            </div>
                            <div className={`${intento.puntaje >= 90 ? 'bg-green-500' : intento.puntaje >= 70 ? 'bg-yellow-500' : intento.puntaje >= 50 ? 'bg-orange-500' : 'bg-red-500'} score-bar w-1.5 h-5 sm:h-6 rounded-full`}></div>
                            <button
                              title="Ver detalles del intento"
                              onClick={() => {
                                // Para Actividades: incluir flags para reabrir historial al volver
                                const params = new URLSearchParams(location.search || '');
                                params.set('historial', '1');
                                if (item?.id != null) params.set('quizId', String(item.id));
                                const qs = params.toString();
                                const returnTo = `${location.pathname}${qs ? `?${qs}` : ''}`;
                                navigate(`/alumno/actividades/quiz/${item?.id}/resultados?intento=${intento.intent_number || intentoNumero}`, {
                                  state: { quiz: item, returnTo }
                                });
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Detalles</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base">No hay intentos registrados.</p>
                </div>
              )}
            </div>

            {/* ...existing code... removed inline CTA section; CTA now in footer */}
          </div>

          {/* Footer fijo con CTA elegante */}
          <div className="hm-footer relative flex-shrink-0 bg-white/95 supports-[backdrop-filter]:backdrop-blur border-t border-gray-200 px-3 sm:px-4 pt-3 pb-3 sm:pb-4 pb-safe">
            <div className="pointer-events-none absolute -top-3 left-0 right-0 h-3 bg-gradient-to-t from-transparent to-black/5"></div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Análisis con IA</h3>
            </div>
            <button
              onClick={handleAnalyzePerformance}
              disabled={safeHist.intentos.length < 2}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm sm:text-[15px] font-semibold text-white shadow-md hover:shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              <Sparkles className="w-4 h-4" />
              Generar Análisis de Rendimiento
            </button>
            {safeHist.intentos.length < 2 && (
              <p className="text-xs sm:text-sm text-gray-500 italic mt-2">Realiza al menos 2 intentos para que la IA pueda analizar tu progreso y errores recurrentes.</p>
            )}
            <div className="h-[env(safe-area-inset-bottom,8px)]"></div>
          </div>
        </div>
      </div>

      <AnalisisModal
        open={isAnalisisModalOpen}
        onClose={() => setIsAnalisisModalOpen(false)}
        isLoading={isLoadingAnalysis}
        analysisText={analysisResult}
        error={analysisError}
        itemName={item ? item.nombre : ''}
        analysisMeta={analysisMeta}
        onRetry={handleAnalyzePerformance}
      />

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .sm\\:animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
           animation: slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

        /* Smooth touch scroll on iOS */
        .historial-modal { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-y; }

        /* Ocultar scrollbars del área de contenido */
        .hm-content { -ms-overflow-style: none; scrollbar-width: none; }
        .hm-content::-webkit-scrollbar { width: 0; height: 0; display: none; }

      `}</style>
    </>
  );
}