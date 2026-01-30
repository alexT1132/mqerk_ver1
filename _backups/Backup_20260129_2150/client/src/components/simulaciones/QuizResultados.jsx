import React, { useEffect, useMemo, useState } from 'react';
import { getQuizIntentoReview } from '../../api/quizzes';
import InlineMath from '../Asesor/simGen/InlineMath.jsx';

// Componente para renderizar texto con fórmulas LaTeX (igual que en Quizz_Review.jsx)
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
      <span 
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }}
      />
    );
  }

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <span key={`math-${idx}`} className="inline-block">
            <InlineMath math={part.content} />
          </span>
        ) : (
          <span 
            key={`text-${idx}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }}
          />
        )
      )}
    </span>
  );
}

// Modal para mostrar resultados por intento, con detalle por pregunta
export default function QuizResultados({ open, onClose, quiz, estudianteId }) {
  const intentos = useMemo(() => Array.isArray(quiz?.intentos) ? quiz.intentos : [], [quiz]);
  const totalIntentos = quiz?.totalIntentos || intentos.length || 0;
  const mejorPuntaje = quiz?.mejorPuntaje || (intentos.length ? Math.max(...intentos.map(i => i.puntaje || 0)) : 0);
  const promedio = totalIntentos ? (intentos.reduce((s, x) => s + Number(x.puntaje || 0), 0) / totalIntentos) : 0;
  const [intentoSel, setIntentoSel] = useState(totalIntentos || null); // por defecto último
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [review, setReview] = useState(null); // { intento, resumen, preguntas: [] }

  useEffect(() => {
    if (!open) return;
    // Reset al abrir
    setError('');
    setReview(null);
    // Ajustar intento al último si no hay aún
    setIntentoSel(prev => (totalIntentos ? (prev || totalIntentos) : null));
  }, [open, totalIntentos]);

  useEffect(() => {
    if (!open || !quiz?.id || !estudianteId || !intentoSel) return; // Se añade !intentoSel para evitar llamadas innecesarias
    setLoading(true); setError('');
    getQuizIntentoReview(quiz.id, estudianteId, intentoSel)
      .then(resp => {
        setReview(resp?.data?.data || resp?.data || null);
      })
      .catch(() => {
        setError('No se pudo cargar el detalle del intento.');
      })
      .finally(() => setLoading(false));
  }, [open, quiz?.id, estudianteId, intentoSel]);

  // ==========[ INICIO DEL CAMBIO IMPORTANTE ]==========
  // Se corrige la función para que llame a la prop `onClose`
  // en lugar de forzar una recarga de la página.
  const handleClose = () => {
    onClose();
  };
  // ==========[ FIN DEL CAMBIO IMPORTANTE ]==========

  if (!open || !quiz) return null;

  const puntajeIntento = review?.resumen?.puntaje ?? (intentos.find(i => (i.numero || i.intent_number) === review?.intento)?.puntaje) ?? null;
  const tiempoIntento = review?.resumen?.tiempo_segundos ?? (intentos.find(i => (i.numero || i.intent_number) === review?.intento)?.tiempoEmpleado) ?? null;

  const renderAttemptSelector = () => {
    if (!totalIntentos || totalIntentos <= 1) return null;
    const options = Array.from({ length: totalIntentos }, (_, i) => i + 1);
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-700">Intento:</span>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={intentoSel || totalIntentos}
          onChange={(e) => setIntentoSel(Number(e.target.value))}
        >
          {options.map(n => (
            <option key={n} value={n}>#{n}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderPregunta = (p, idx) => {
    const selected = new Set(p.seleccionadas || []);
    const isCorrect = !!p.correcta;
    return (
      <div key={p.id || idx} className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Pregunta {p.orden ?? (idx + 1)}</div>
            <div className="font-medium text-gray-900">
              <MathText text={p.enunciado || p.pregunta || `Pregunta ${idx + 1}`} />
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md ${isCorrect ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {isCorrect ? 'Correcta' : 'Incorrecta'}
          </span>
        </div>
        <ul className="mt-2 space-y-2">
          {(p.opciones || []).map((o) => {
            const sel = selected.has(o.id);
            const corr = o.es_correcta === 1;
            const cl = sel && corr
              ? 'bg-green-50 border-green-400'
              : sel && !corr
              ? 'bg-red-50 border-red-400'
              : !sel && corr
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-gray-50 border-gray-200';
            return (
              <li key={o.id} className={`text-sm rounded-md border px-3 py-2 ${cl} flex items-center justify-between`}>
                <span>{o.texto}</span>
                <div className="flex items-center gap-2 text-xs">
                  {corr && <span className="text-emerald-700">Correcta</span>}
                  {sel && <span className="text-blue-700">Marcada</span>}
                </div>
              </li>
            );
          })}
        </ul>
        {p.valor_texto && (
          <div className="mt-2 text-sm text-gray-700">
            Respuesta escrita: <span className="font-medium"><MathText text={p.valor_texto} /></span>
          </div>
        )}
        {p.tiempo_ms ? (
          <div className="mt-2 text-xs text-gray-500">Tiempo en esta pregunta: {Math.round(p.tiempo_ms / 1000)}s</div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[88vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5">
          <h2 className="text-xl font-bold text-center">Resultados del Quiz</h2>
          <div className="text-center text-sm md:text-base mt-0.5 opacity-95">{quiz?.nombre || quiz?.titulo || 'Quiz'}</div>
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-5 flex flex-col gap-4 h-[calc(88vh-7rem)]">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap gap-4">
              <div><span className="font-semibold">Intentos:</span> {totalIntentos || 0}</div>
              <div><span className="font-semibold">Mejor puntaje:</span> {Number(mejorPuntaje || 0)}%</div>
              <div><span className="font-semibold">Promedio:</span> {Number.isFinite(promedio) ? promedio.toFixed(1) : '0.0'}%</div>
              <div><span className="font-semibold">Puntaje intento:</span> {puntajeIntento != null ? `${puntajeIntento}%` : '—'}</div>
              <div><span className="font-semibold">Tiempo intento:</span> {tiempoIntento != null ? `${Math.round(tiempoIntento)}s` : '—'}</div>
            </div>
            {renderAttemptSelector()}
          </div>

          {/* Estado de carga / error */}
          {loading && (
            <div className="flex-1 grid place-items-center text-gray-500 text-sm">Cargando detalle del intento…</div>
          )}
          {!loading && error && (
            <div className="flex-1 grid place-items-center text-red-600 text-sm">{error}</div>
          )}

          {!loading && !error && review && Array.isArray(review.preguntas) && (
            <div className="flex-1 overflow-auto pr-1 space-y-3">
              {review.preguntas.map((p, idx) => renderPregunta(p, idx))}
            </div>
          )}

          {!loading && !error && (!review || !Array.isArray(review.preguntas)) && (
            <div className="flex-1 grid place-items-center text-gray-500 text-sm">No hay detalles disponibles para este intento.</div>
          )}
        </div>

        <div className="px-4 md:px-5 pb-4 flex justify-end">
          <button onClick={handleClose} className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium">Volver</button>
        </div>
      </div>
    </div>
  );
}