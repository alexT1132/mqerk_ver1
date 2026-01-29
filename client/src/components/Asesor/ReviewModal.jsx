import { useState, useEffect } from 'react';
import { X, Eye, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getQuizIntentoReview } from '../../api/quizzes';
import { getSimulacionIntentoReview } from '../../api/simulaciones';
import AnalizadorFallosRepetidos from './AnalizadorFallosRepetidos';
import ManualReviewShortAnswer from './ManualReviewShortAnswer';
import InlineMath from './simGen/InlineMath';

// Componente para renderizar texto con fórmulas LaTeX
function MathText({ text = "" }) {
  if (!text) return null;

  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }
    nodesToRemove.forEach(n => {
      const parent = n.parentNode;
      while (n.firstChild) {
        parent.insertBefore(n.firstChild, n);
      }
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  let processedText = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  processedText = processedText.replace(/×/g, '\\times').replace(/÷/g, '\\div');
  
  const latexPlaceholder = '___LATEX_PLACEHOLDER___';
  const latexMatches = [];
  let placeholderIndex = 0;
  
  processedText = processedText.replace(/\$([^$]+?)\$/g, (match) => {
    const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
    latexMatches.push(match);
    placeholderIndex++;
    return placeholder;
  });
  
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  
  latexMatches.forEach((match, idx) => {
    processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
  });

  const re = /\$([^$]+?)\$/g;
  const parts = [];
  let lastIndex = 0;
  let m;
  let matchFound = false;

  re.lastIndex = 0;

  while ((m = re.exec(processedText)) !== null) {
    matchFound = true;
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: processedText.slice(lastIndex, m.index) });
    }
    const formula = m[1].trim();
    if (formula) {
      parts.push({ type: 'math', content: formula });
    }
    lastIndex = m.index + m[0].length;
  }
  
  if (lastIndex < processedText.length) {
    parts.push({ type: 'text', content: processedText.slice(lastIndex) });
  }

  if (!matchFound || parts.length === 0) {
    return (
      <span dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }} />
    );
  }

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.type === 'math') {
          return <InlineMath key={idx} formula={part.content} />;
        }
        return (
          <span key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }} />
        );
      })}
    </span>
  );
}

/**
 * Modal reutilizable para revisar intentos de quiz o simulación
 * @param {Object} props
 * @param {boolean} props.open - Si la modal está abierta
 * @param {Function} props.onClose - Función para cerrar la modal
 * @param {string} props.tipo - 'quiz' o 'simulacion'
 * @param {number} props.idEvaluacion - ID del quiz o simulación
 * @param {Object} props.estudiante - Objeto con datos del estudiante { id, nombre, totalIntentos }
 * @param {string} props.titulo - Título del quiz/simulación
 */
export default function ReviewModal({ 
  open, 
  onClose, 
  tipo, 
  idEvaluacion, 
  estudiante, 
  titulo 
}) {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [selectedIntento, setSelectedIntento] = useState(1);

  // Cargar datos del intento cuando cambia el intento seleccionado o se abre la modal
  useEffect(() => {
    if (open && idEvaluacion && estudiante?.id) {
      loadIntentoData(selectedIntento);
    }
  }, [open, idEvaluacion, estudiante?.id, selectedIntento]);

  const loadIntentoData = async (intentoNum) => {
    if (!idEvaluacion || !estudiante?.id) return;
    
    setLoading(true);
    try {
      const reviewFn = tipo === 'quiz' ? getQuizIntentoReview : getSimulacionIntentoReview;
      const { data } = await reviewFn(idEvaluacion, estudiante.id, intentoNum);
      setReviewData(data?.data || null);
    } catch (e) {
      console.error('Error al cargar intento:', e);
      setReviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeIntento = (intentoNum) => {
    setSelectedIntento(intentoNum);
  };

  const handleReviewComplete = () => {
    // Recargar datos después de revisar una respuesta corta
    if (idEvaluacion && estudiante?.id) {
      loadIntentoData(selectedIntento);
    }
  };

  if (!open) return null;

  const preguntas = reviewData?.preguntas || [];
  const preguntasOpcionMultiple = preguntas.filter(p => 
    p.tipo === 'opcion_multiple' || 
    p.tipo === 'verdadero_falso' || 
    p.tipo === 'multi_respuesta'
  );
  const respuestasCortas = preguntas.filter(p => p.tipo === 'respuesta_corta');

  return (

    //aqui es donde se ajusta el margen d ela distancia
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 pt-24 sm:pt-18">
      <div className="w-full max-w-4xl max-h-[75vh] sm:max-h-[80vh] rounded-xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col mt-8 sm:mt-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg flex-shrink-0">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {titulo || (tipo === 'quiz' ? 'Quiz' : 'Simulación')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">
                {estudiante?.nombre || 'Alumno'}
              </p>
            </div>
            {estudiante?.totalIntentos > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <label className="text-xs sm:text-sm text-slate-700 font-semibold hidden sm:inline">Intento:</label>
                <select
                  value={selectedIntento}
                  onChange={(e) => handleChangeIntento(Number(e.target.value))}
                  className="text-xs sm:text-sm border-2 border-indigo-200 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:border-indigo-300 transition-colors"
                >
                  {Array.from({ length: estudiante.totalIntentos }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num === 1 ? `Intento ${num} (Oficial)` : `Intento ${num} (Práctica)`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="ml-2 sm:ml-4 rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Contenido con scroll - Scrollbars ocultos */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-b from-slate-50/50 to-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 animate-spin" />
                <p className="text-xs sm:text-sm font-medium text-slate-600">Cargando detalles del intento...</p>
              </div>
            </div>
          ) : reviewData && Array.isArray(preguntas) && preguntas.length > 0 ? (
            <div className="space-y-4 sm:space-y-5">
              {/* Analizador de fallos repetidos */}
              {estudiante?.totalIntentos >= 2 && (
                <AnalizadorFallosRepetidos
                  tipo={tipo}
                  id={idEvaluacion}
                  idEstudiante={estudiante?.id}
                  totalIntentos={estudiante?.totalIntentos}
                />
              )}
              
              {/* Preguntas de opción múltiple */}
              {preguntasOpcionMultiple.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2 sm:mb-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 flex-shrink-0" />
                    <span>Preguntas de Opción Múltiple ({preguntasOpcionMultiple.length})</span>
                  </h4>
                  {preguntasOpcionMultiple.map((p, idx) => {
                    const sel = new Set(p.seleccionadas || []);
                    const corr = !!p.correcta;
                    return (
                      <div 
                        key={p.id || idx} 
                        className={`rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 shadow-sm transition-all hover:shadow-md ${
                          corr 
                            ? 'bg-gradient-to-br from-emerald-50/50 to-green-50/30 border-emerald-200' 
                            : 'bg-gradient-to-br from-rose-50/50 to-red-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm flex-shrink-0">
                                {p.orden || (idx + 1)}
                              </span>
                              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold border-2 ${
                                corr 
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}>
                                {corr ? '✓ Correcta' : '✗ Incorrecta'}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                              <MathText text={p.enunciado || ''} />
                            </div>
                          </div>
                        </div>
                        <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                          {(p.opciones || []).map((o) => {
                            const isSel = sel.has(o.id);
                            const isOk = o.es_correcta === 1;
                            const cl = isSel && isOk 
                              ? 'bg-emerald-100 border-2 border-emerald-400 shadow-sm' 
                              : isSel && !isOk 
                                ? 'bg-rose-100 border-2 border-rose-400 shadow-sm' 
                                : !isSel && isOk 
                                  ? 'bg-green-50 border-2 border-green-300' 
                                  : 'bg-slate-50 border-2 border-slate-200';
                            return (
                              <li key={o.id} className={`rounded-md sm:rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between transition-all ${cl}`}>
                                <span className="text-xs sm:text-sm text-slate-800 flex-1 min-w-0">
                                  <MathText text={o.texto || ''} />
                                </span>
                                <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-3 flex-shrink-0">
                                  {isSel && (
                                    <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded ${
                                      isOk ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                                    }`}>
                                      Seleccionada
                                    </span>
                                  )}
                                  {isOk && (
                                    <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded bg-green-200 text-green-800">
                                      Correcta
                                    </span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sección de Respuestas Cortas para Revisión Manual */}
              {respuestasCortas.length > 0 && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                    <span>📝</span>
                    <span>Respuestas Cortas para Revisión</span>
                    {respuestasCortas.filter(p => {
                      const requiereRevision = p.calificacion_confianza < 70 || p.calificacion_status === 'manual_review';
                      return requiereRevision;
                    }).length > 0 && (
                      <span className="px-2 py-1 text-[10px] sm:text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        {respuestasCortas.filter(p => {
                          const requiereRevision = p.calificacion_confianza < 70 || p.calificacion_status === 'manual_review';
                          return requiereRevision;
                        }).length} requieren revisión
                      </span>
                    )}
                  </h4>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {respuestasCortas.map((pregunta) => {
                      const respuestaEsperada = pregunta.opciones?.find(o => o.es_correcta === 1)?.texto;
                      
                      if (!respuestaEsperada) return null;
                      
                      // Para simulaciones: correcta se determina desde calificacion_confianza cuando es manual
                      const correctaValue = tipo === 'simulacion' && pregunta.calificacion_metodo === 'manual' && pregunta.calificacion_confianza != null
                        ? (pregunta.calificacion_confianza === 100 ? 1 : 0)
                        : (pregunta.correcta ? 1 : 0);
                      
                      if (!pregunta.id_respuesta) {
                        return (
                          <div key={pregunta.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Esta respuesta aún no está disponible para revisión manual. 
                              La respuesta se está procesando automáticamente.
                            </p>
                          </div>
                        );
                      }
                      
                      const respuestaObj = {
                        id: pregunta.id_respuesta,
                        valor_texto: pregunta.valor_texto || null,
                        texto_libre: pregunta.valor_texto || null,
                        correcta: correctaValue,
                        calificacion_status: pregunta.calificacion_status || 'pending',
                        calificacion_metodo: pregunta.calificacion_metodo || null,
                        calificacion_confianza: pregunta.calificacion_confianza != null ? Number(pregunta.calificacion_confianza) : null,
                        revisada_por: pregunta.revisada_por || null,
                        notas_revision: pregunta.notas_revision || null
                      };
                      
                      return (
                        <ManualReviewShortAnswer
                          key={pregunta.id}
                          respuesta={respuestaObj}
                          pregunta={pregunta.enunciado}
                          respuestaEsperada={respuestaEsperada}
                          tipo={tipo}
                          preguntaRenderizada={<MathText text={pregunta.enunciado || ''} />}
                          respuestaEsperadaRenderizada={<MathText text={respuestaEsperada || ''} />}
                          onReviewComplete={handleReviewComplete}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                <p className="text-xs sm:text-sm font-medium text-slate-600 text-center px-4">No se pudo cargar el detalle del intento.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/60 flex-shrink-0">
          <div className="text-xs sm:text-sm text-slate-600">
            {reviewData && Array.isArray(preguntas) && preguntas.length > 0 && (
              <span className="font-medium">
                {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-violet-700 transition-all hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
