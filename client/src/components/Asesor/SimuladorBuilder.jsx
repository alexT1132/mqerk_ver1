import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulacion, getSimulacionFull, listPreguntasSimulacion, updateSimulacion } from '../../api/simulaciones';
import { generarPreguntasIA } from '../../service/simuladoresAI.js';
import { getAreasCatalog } from '../../api/areas.js';
import RichTextEditor from './simGen/RichTextEditor.jsx';

// Mapeos de tipos
const mapDbToUiType = (tipo) => {
  if (tipo === 'verdadero_falso') return 'tf';
  if (tipo === 'respuesta_corta') return 'short';
  return 'multi';
};
const mapUiToDbType = (type) => {
  if (type === 'tf') return 'verdadero_falso';
  if (type === 'short') return 'respuesta_corta';
  return 'opcion_multiple';
};

export default function SimuladorBuilder() {
  const { simId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sim, setSim] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [iaBusy, setIaBusy] = useState(false);
  const [iaErr, setIaErr] = useState('');
  const [iaCount, setIaCount] = useState(10);
  const [iaNivel, setIaNivel] = useState('intermedio');
  const [iaIdioma, setIaIdioma] = useState('auto'); // auto | es | en | mix
  const [iaTopic, setIaTopic] = useState('');
  const [iaModo, setIaModo] = useState('general'); // 'general' | 'temas'
  const [iaTemasText, setIaTemasText] = useState(''); // coma-separado
  const [areaName, setAreaName] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const [descripcion, setDescripcion] = useState(''); // Estado para descripción editable

  // Cargar simulación y preguntas
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(''); setMsg('');
      try {
        const res = await getSimulacionFull(simId).catch(() => null) || await getSimulacion(simId);
        const data = res?.data?.data || res?.data || null;

        // ✅ Log crítico: solo si no hay descripción
        if (!data?.descripcion || data.descripcion.length === 0) {
          console.warn('[SimuladorBuilder] ⚠️ Simulador sin descripción al cargar:', { simId });
        }

        if (alive) {
          setSim(data);
          // ✅ Inicializar descripción editable
          const descripcionInicial = data?.descripcion || data?.instrucciones || '';
          setDescripcion(descripcionInicial);
          // ✅ Log para verificar que se carga
          if (descripcionInicial) {
            console.log('[SimuladorBuilder] Descripción cargada:', descripcionInicial.substring(0, 50));
          } else {
            console.warn('[SimuladorBuilder] ⚠️ No hay descripción para mostrar');
          }
        }
        // Resolver nombre de área si aplica
        try {
          if (data?.id_area) {
            const { data: catalog } = await getAreasCatalog();
            const arr = Array.isArray(catalog?.data) ? catalog.data : (Array.isArray(catalog) ? catalog : []);
            const match = arr.find(a => Number(a.id) === Number(data.id_area));
            if (alive && match?.nombre) setAreaName(match.nombre);
          }
        } catch { }
        let qs = Array.isArray(data?.preguntas) ? data.preguntas : null;
        if (!qs) {
          const pr = await listPreguntasSimulacion(simId).catch(() => null);
          qs = pr?.data?.data || pr?.data || [];
        }
        const mapped = (qs || []).map((p, idx) => {
          const type = mapDbToUiType(p.tipo);
          if (type === 'multi') {
            const options = (p.opciones || []).map(o => ({ text: o.texto || '', correct: o.es_correcta == 1 }));
            return { id: p.id, order: p.orden || (idx + 1), text: p.enunciado || '', type, points: p.puntos || 1, options: options.length ? options : [{ text: 'Opción 1', correct: true }, { text: 'Opción 2', correct: false }] };
          } else if (type === 'tf') {
            // Inferir desde opciones
            const opt = (p.opciones || []).find(o => o.es_correcta == 1);
            const answer = (opt && (opt.texto || '').toLowerCase().startsWith('v')) ? 'true' : 'false';
            return { id: p.id, order: p.orden || (idx + 1), text: p.enunciado || '', type, points: p.puntos || 1, answer };
          } else {
            const opt = (p.opciones || []).find(o => o.es_correcta == 1);
            return { id: p.id, order: p.orden || (idx + 1), text: p.enunciado || '', type, points: p.puntos || 1, answer: opt?.texto || '' };
          }
        });
        if (alive) setQuestions(mapped);
      } catch (e) { if (alive) setError('No se pudo cargar la simulación'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [simId]);

  const addQuestion = (type = 'multi') => {
    setQuestions(prev => [
      ...prev,
      type === 'multi'
        ? { order: prev.length + 1, text: '', type: 'multi', points: 1, options: [{ text: 'Opción 1', correct: true }, { text: 'Opción 2', correct: false }] }
        : type === 'tf'
          ? { order: prev.length + 1, text: '', type: 'tf', points: 1, answer: 'true' }
          : { order: prev.length + 1, text: '', type: 'short', points: 1, answer: '' }
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i + 1 })));
  };

  const moveQuestion = (idx, dir) => {
    setQuestions(prev => {
      const arr = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return arr.map((q, i) => ({ ...q, order: i + 1 }));
    });
  };

  const setQuestionField = (idx, key, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [key]: value } : q));
  };

  const addOption = (qi) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = Array.isArray(q.options) ? q.options.slice() : [];
      opts.push({ text: `Opción ${opts.length + 1}`, correct: false });
      return { ...q, options: opts };
    }));
  };

  const setOptionText = (qi, oi, text) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = q.options.slice();
      opts[oi] = { ...opts[oi], text };
      return { ...q, options: opts };
    }));
  };

  const setOptionCorrect = (qi, oi) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = (q.options || []).map((o, idx) => ({ ...o, correct: idx === oi }));
      return { ...q, options: opts };
    }));
  };

  const removeOption = (qi, oi) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const opts = (q.options || []).filter((_, idx) => idx !== oi);
      if (!opts.length) opts.push({ text: 'Opción 1', correct: true });
      return { ...q, options: opts };
    }));
  };

  const onSaveAll = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      // Mapear al contrato del backend (replacePreguntas)
      const payloadPreguntas = questions.map((q, i) => {
        if (q.type === 'multi') {
          const opciones = (q.options || []).map(o => ({ texto: o.text, es_correcta: !!o.correct }));
          // Si ninguna marcada, marcar la primera
          if (!opciones.some(o => o.es_correcta) && opciones.length) opciones[0].es_correcta = true;
          // Usar 'tipo' explícito para que el backend lo guarde como opcion_multiple (selección única)
          return { orden: i + 1, text: q.text, tipo: 'opcion_multiple', puntos: Number(q.points || 1), opciones };
        } else if (q.type === 'tf') {
          return { orden: i + 1, text: q.text, type: 'tf', puntos: Number(q.points || 1), answer: q.answer === 'false' ? 'false' : 'true' };
        } else {
          return { orden: i + 1, text: q.text, type: 'short', puntos: Number(q.points || 1), answer: q.answer || '' };
        }
      });
      // ✅ CRÍTICO: Incluir id_area y descripcion para preservarlos cuando se guardan solo las preguntas
      // Usar la descripción del estado editable, no solo la del sim
      const areaPayload = (sim && (sim.id_area != null)) ? { id_area: sim.id_area } : {};
      // ✅ Usar descripcion del estado editable (puede haber sido modificada por el usuario)
      const descripcionPayload = descripcion && descripcion.trim().length > 0 ? { descripcion: descripcion.trim() } : {};

      await updateSimulacion(simId, { preguntas: payloadPreguntas, ...areaPayload, ...descripcionPayload });
      setMsg('Preguntas guardadas');
      setShowSaveReminder(false);
      // ✅ Actualizar el estado sim con la descripción guardada
      if (descripcionPayload.descripcion) {
        setSim(prev => prev ? { ...prev, descripcion: descripcionPayload.descripcion } : prev);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo guardar');
    } finally { setSaving(false); }
  };

  // (Se eliminó el generador prefijado para que solo se use IA)

  const onGenerateIA = async () => {
    // Validaciones según modo
    if (iaModo === 'temas') {
      const hasTemas = iaTemasText && iaTemasText.split(',').map(s => s.trim()).filter(Boolean).length > 0;
      if (!hasTemas && !iaTopic && !sim?.titulo && !areaName) {
        setIaErr('Especifica al menos uno: temas (coma-separados), un tema general o un área.');
        return;
      }
    } else {
      if (!sim?.titulo && !areaName && !iaTopic) {
        setIaErr('No se encontró tema/área para generar. Añade un título a la simulación.');
        return;
      }
    }
    if (questions?.length) {
      const ok = window.confirm(`Esto reemplazará ${questions.length} preguntas por un banco IA de ${iaCount}. ¿Continuar?`);
      if (!ok) return;
    }
    setIaBusy(true); setIaErr(''); setMsg('');
    try {
      const tema = iaTopic?.trim() || sim?.titulo || areaName || 'Simulación';
      const cantidad = Number(iaCount) || 10;
      const opts = { tema, cantidad, area: areaName || undefined, nivel: iaNivel, idioma: iaIdioma };

      if (iaModo === 'temas') {
        const temasList = iaTemasText.split(',').map(s => s.trim()).filter(Boolean);
        if (temasList.length) {
          opts.modo = 'temas';
          opts.temas = temasList;

          // ✅ Validación: Advertencia si hay más temas que preguntas
          if (temasList.length > cantidad) {
            const temasTexto = temasList.join(', ');
            const advertencia = `⚠️ Advertencia: Has especificado ${temasList.length} tema${temasList.length > 1 ? 's' : ''} (${temasTexto}), ` +
              `pero solo se generarán ${cantidad} pregunta${cantidad > 1 ? 's' : ''}. ` +
              `Algunos temas no tendrán preguntas. ¿Deseas continuar de todas formas?`;

            const continuar = window.confirm(advertencia);
            if (!continuar) {
              setIaBusy(false);
              return;
            }
          }
        } else {
          opts.modo = 'general';
        }
      } else {
        opts.modo = 'general';
      }

      const bank = await generarPreguntasIA(opts);
      setQuestions(bank);
      setMsg(`Se generaron ${bank.length} preguntas con IA. Revisa y guarda.`);
      setShowSaveReminder(true);
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase();
      // Detectar error de API key bloqueada (leaked)
      if (e?.code === 'API_KEY_LEAKED' || msg.includes('leaked') || msg.includes('reported as leaked') || msg.includes('bloqueada porque fue expuesta')) {
        setIaErr(
          '⚠️ La API key de Gemini fue bloqueada por Google porque fue expuesta públicamente. ' +
          'Por favor, contacta al administrador del sistema para obtener una nueva API key.'
        );
      } else if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setIaErr('La IA alcanzó el límite de cuota (429). Intenta de nuevo en unos minutos.');
      } else {
        setIaErr(e?.message || 'No se pudieron generar preguntas con IA');
      }
    } finally { setIaBusy(false); }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900">Constructor de Simulación</h1>
          <button onClick={() => navigate('/asesor/simuladores/generales')} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">Regresar</button>
        </div>
        {loading && <div className="text-sm text-slate-600">Cargando…</div>}
        {error && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 mb-2">{error}</div>}
        {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 mb-2">{msg}</div>}
        {(!loading && sim) && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-extrabold text-violet-700 uppercase tracking-widest">Simulación</div>
              <div className="text-lg font-semibold text-slate-900">{sim.titulo || `ID ${simId}`}</div>

              {/* ✅ Campo editable para descripción/instrucciones - SIEMPRE visible */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Descripción / Instrucciones
                </label>
                <RichTextEditor
                  value={descripcion || ''}
                  onChange={(newValue) => {
                    setDescripcion(newValue);
                    // Actualizar también el estado sim para mantener consistencia
                    setSim(prev => prev ? { ...prev, descripcion: newValue } : prev);
                  }}
                  placeholder="Describe el simulador y proporciona instrucciones para los estudiantes. Este texto aparecerá en la lista de simuladores y cuando los estudiantes vean el simulador."
                />
                {!descripcion && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠️ No hay descripción. Agrega una descripción para que los estudiantes sepan de qué trata este simulador.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-800">Preguntas</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative inline-block">
                    <button onClick={() => addQuestion('multi')} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Añadir (opción múltiple)</button>
                  </div>
                  <button onClick={() => addQuestion('tf')} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50">Añadir (V/F)</button>
                  <button onClick={() => addQuestion('short')} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50">Añadir (respuesta corta)</button>
                  {false && (
                    <button className="px-3 py-1.5 text-sm rounded-lg border border-indigo-300 text-indigo-700 bg-white hover:bg-indigo-50">Auto-generar (Ciencias Exactas)</button>
                  )}
                  {/* IA controls */}
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-xs text-slate-600">IA:</span>
                    <select value={iaModo} onChange={e => setIaModo(e.target.value)} className="text-xs border rounded px-1 py-0.5">
                      <option value="general">General (área/tema)</option>
                      <option value="temas">Por temas específicos</option>
                    </select>
                    {iaModo === 'temas' ? (
                      <input value={iaTemasText} onChange={e => setIaTemasText(e.target.value)} className="text-xs border rounded px-2 py-0.5 w-48" placeholder="Temas: álgebra, ecuaciones, ..." />
                    ) : (
                      <input value={iaTopic} onChange={e => setIaTopic(e.target.value)} className="text-xs border rounded px-2 py-0.5 w-40" placeholder="Tema (opcional)" />
                    )}
                    <select value={iaCount} onChange={e => setIaCount(Number(e.target.value))} className="text-xs border rounded px-1 py-0.5">
                      {[10, 30, 50, 100].map(n => <option key={n} value={n}>{n} preg.</option>)}
                    </select>
                    <select value={iaNivel} onChange={e => setIaNivel(e.target.value)} className="text-xs border rounded px-1 py-0.5">
                      <option value="basico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                    <select value={iaIdioma} onChange={e => setIaIdioma(e.target.value)} className="text-xs border rounded px-1 py-0.5" title="Idioma de salida IA">
                      <option value="auto">Idioma: Auto</option>
                      <option value="es">Idioma: ES</option>
                      <option value="en">Idioma: EN</option>
                      <option value="mix">Idioma: Mixto</option>
                    </select>
                    <button disabled={iaBusy} onClick={onGenerateIA} className="text-xs px-2 py-1 rounded bg-fuchsia-600 text-white hover:bg-fuchsia-500 disabled:opacity-50">{iaBusy ? 'Generando…' : 'Generar con IA'}</button>
                  </div>
                  <button disabled={saving} onClick={onSaveAll} className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
                </div>
              </div>
              {(iaErr) && <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{iaErr}</div>}
              {showSaveReminder && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg shadow-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-amber-700 text-sm">
                      Se generó un nuevo banco de preguntas. Recuerda presionar "Guardar cambios" para persistirlo.
                    </div>
                    <button onClick={() => setShowSaveReminder(false)} className="ml-2 text-amber-700/70 hover:text-amber-800 text-xs">✕</button>
                  </div>
                </div>
              )}
              <div className="mt-3 space-y-4">
                {questions.length === 0 && <div className="text-sm text-slate-500">Aún no hay preguntas. Usa los botones de arriba para añadir.</div>}
                {questions.map((q, qi) => (
                  <div key={qi} className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-lg ring-2 ring-slate-100/50 hover:ring-violet-200/50 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">#{q.order}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveQuestion(qi, -1)} className="text-xs px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50">↑</button>
                        <button onClick={() => moveQuestion(qi, +1)} className="text-xs px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50">↓</button>
                        <button onClick={() => removeQuestion(qi)} className="text-xs px-2 py-1 rounded border border-rose-300 text-rose-700">Eliminar</button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-start">
                      <div className="md:col-span-4">
                        <RichTextEditor
                          value={q.text}
                          onChange={(newText) => setQuestionField(qi, 'text', newText)}
                          label="Enunciado de la pregunta"
                          required
                          placeholder="Escribe la consigna… Puedes insertar fórmulas con los botones."
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Tipo</label>
                        <select value={q.type} onChange={e => setQuestionField(qi, 'type', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                          <option value="multi">Opción múltiple</option>
                          <option value="tf">Verdadero/Falso</option>
                          <option value="short">Respuesta corta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Puntos</label>
                        <input value={q.points} onChange={e => setQuestionField(qi, 'points', e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500" />
                      </div>
                    </div>

                    {/* Opciones / respuesta según tipo */}
                    {q.type === 'multi' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-slate-700">Opciones</div>
                          <button onClick={() => addOption(qi)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50">Añadir opción</button>
                        </div>
                        <div className="space-y-2">
                          {(q.options || []).map((opt, oi) => (
                            <div key={oi} className="rounded-2xl border border-slate-200 bg-white p-3">
                              <div className="flex items-center gap-3">
                                <input type="radio" name={`correct-${qi}`} checked={!!opt.correct} onChange={() => setOptionCorrect(qi, oi)} />
                                <div className="flex-1">
                                  <RichTextEditor
                                    value={opt.text}
                                    onChange={(newText) => setOptionText(qi, oi, newText)}
                                    placeholder={`Opción ${oi + 1}… (puedes insertar fórmulas)`}
                                    className="mb-0"
                                  />
                                </div>
                                <button onClick={() => removeOption(qi, oi)} className="text-xs px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50">Quitar</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {q.type === 'tf' && (
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Respuesta correcta</div>
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <input type="radio" name={`tf-${qi}`} checked={q.answer === 'true'} onChange={() => setQuestionField(qi, 'answer', 'true')} /> Verdadero
                          </label>
                          <label className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <input type="radio" name={`tf-${qi}`} checked={q.answer === 'false'} onChange={() => setQuestionField(qi, 'answer', 'false')} /> Falso
                          </label>
                        </div>
                      </div>
                    )}
                    {q.type === 'short' && (
                      <div className="mt-3">
                        <label className="block text-[11px] text-gray-600 mb-1">Respuesta esperada</label>
                        <input value={q.answer || ''} onChange={e => setQuestionField(qi, 'answer', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Texto de la respuesta" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
