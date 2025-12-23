import { useEffect, useMemo, useRef, useState } from 'react';
import { buildApiUrl } from '../../utils/url.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAsesor } from '../../context/AsesorContext.jsx';
import NavLogin from '../../components/NavLogin.jsx';
import { CheckCircle2, XCircle } from 'lucide-react';

// Resultados del Test del Asesor
// Reglas solicitadas:
// - Repercuten en resultados finales (obligatorios backend ACTUAL): WAIS, Prueba académica, Zavic
//   (y Prueba matemática cuando exista). El backend HOY NO valida Bar-On.
// - No repercuten: Big Five, DASS-21, Bar-On (mientras no se incluya en backend) 
// Si en el futuro se decide incluir Bar-On como gating, actualizar también controlador finalizarProcesoAsesor.

export function Resultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: idParam } = useParams();
  const { preregistroId, datos1 } = useAsesor();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [finalize, setFinalize] = useState({ running: false, message: null, aprobado: null, creds: null });
  // Modal de celebración al aprobar
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successModalShownFlag = 'asesor_success_modal_seen_v1';
  const confettiCanvasRef = useRef(null);
  const confettiStartedRef = useRef(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [asesorName, setAsesorName] = useState('');

  // Preferir resultados pasados por navegación desde Test.jsx; si no, consultar API
  useEffect(() => {
    const state = location.state || {};
    // Normalizar estructura similar a la de la API para simplificar vista
    if (state && (state.ResultadoWais != null || state.ResultadoAcademica != null || state.ResultadoZavic != null)) {
      setResults({
        bigfive_total: Number(state.ResultadoBigFive || 0),
        dass21_total: Number(state.ResultadoDASS || 0),
        zavic_total: Number(state.ResultadoZavic || 0),
        baron_total: Number(state.ResultadoBarOn || 0),
        wais_total: Number(state.ResultadoWais || 0),
        academica_total: Number(state.ResultadoAcademica || 0),
        // opcionales enriquecidos
        dass21_subescalas: state.dassDep != null ? {
          depresion: state.dassDep, ansiedad: state.dassAnx, estres: state.dassStr,
          dep_cat: state.dassDepCat, anx_cat: state.dassAnxCat, str_cat: state.dassStrCat
        } : null,
        bigfive_dimensiones: state.bigFiveDim || null,
      });
      return;
    }

    // Si no hubo state, cargar desde API usando id de ruta (si existe) o preregistroId
    const load = async () => {
      const targetId = idParam ? Number(idParam) : preregistroId;
      if (!targetId) {
        // Sin id en ruta ni en contexto -> regresar al inicio del flujo
        navigate('/pre_registro');
        return;
      }
      setLoading(true); setError(null);
      try {
        const base = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:1002` : 'http://localhost:1002');
        const res = await fetch(`${base}/api/asesores/tests/${targetId}`, { credentials: 'include' });
        if (res.status === 404) {
          setResults(null);
        } else if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Error cargando resultados');
        } else {
          const body = await res.json();
          setResults(body.resultados || null);
          // Obtener nombre del preregistro para el mensaje de WhatsApp
          try {
            if (datos1 && Number(datos1.id) === Number(targetId)) {
              const full = `${datos1.nombres || ''} ${datos1.apellidos || ''}`.trim();
              if (full) setAsesorName(full);
            } else {
              const pr = await fetch(`${base}/api/asesores/preregistro/${targetId}`, { credentials: 'include' });
              if (pr.ok) {
                const pb = await pr.json().catch(() => ({}));
                const prr = pb.preregistro;
                const full = `${prr?.nombres || ''} ${prr?.apellidos || ''}`.trim();
                if (full) setAsesorName(full);
              }
            }
          } catch (_e) { /* optional */ }
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [location.state, preregistroId, idParam, navigate]);

  // Si pasó todas las obligatorias, armar redirección automática a Formulario de Registro
  useEffect(() => {
    if (!results) return;
    // computed se recalcula abajo; proteger contra acceso antes de tiempo
    // Usamos un pequeño truco: si redirect ya estaba armado, no rearmar.
    // El efecto principal se dispara más abajo tras definir 'computed' por dependencias.
  }, [results]);

  const thresholds = {
    wais: 150,          // >= 150
    academica: 160,     // >= 160 (frontend antes usaba > 160, corregido para alinear backend)
    zavic: 80,          // > 80
    baron: 90,          // Referencial (no gating backend todavía)
    matematica: 60      // >= 60 cuando exista
  };

  const computed = useMemo(() => {
    const r = results || {};
    const wais = Number(r.wais_total || 0);
    const aca = Number(r.academica_total || 0);
    const zav = Number(r.zavic_total || 0);
    const mat = r.matematica_total != null ? Number(r.matematica_total) : null; // aún no existe
    const big = Number(r.bigfive_total || 0);
    const dass = Number(r.dass21_total || 0);
    const bar = Number(r.baron_total || 0);
    const dassSub = r.dass21_subescalas || null;
    const bigDim = r.bigfive_dimensiones || null;

    // Solo suman a resultados finales: WAIS, Académica, Zavic, Bar-On y (cuando exista) Matemática
    const totalFinal = (wais || 0) + (aca || 0) + (zav || 0) + (bar || 0) + (mat || 0);
    const cumple = {
      wais: wais >= thresholds.wais,
      academica: aca >= thresholds.academica, // corregido (antes >)
      zavic: zav > thresholds.zavic,
      baron: bar > thresholds.baron, // sólo informativo actualmente
      matematica: mat == null ? undefined : (mat >= thresholds.matematica)
    };
    // Frases amigables para requisitos (evitar símbolos como ≥ o > en UI)
    const req = {
      wais: `al menos ${thresholds.wais} puntos`,
      academica: `al menos ${thresholds.academica} puntos`,
      baron: `más de ${thresholds.baron} puntos (referencial)`,
      matematica: `al menos ${thresholds.matematica} puntos`,
      zavic: `más de ${thresholds.zavic} puntos`,
    };
    // Localización de categorías DASS a ES
    const mapDassCatES = (en) => ({
      'Normal': 'Normal', 'Mild': 'Leve', 'Moderate': 'Moderado', 'Severe': 'Severo', 'Extremely Severe': 'Extremadamente severo'
    })[en] || en || '—';
    const dassDetails = (dassSub && typeof dassSub === 'object') ? {
      dep: { score: dassSub.depresion, catEN: dassSub.dep_cat, catES: mapDassCatES(dassSub.dep_cat) },
      anx: { score: dassSub.ansiedad, catEN: dassSub.anx_cat, catES: mapDassCatES(dassSub.anx_cat) },
      str: { score: dassSub.estres, catEN: dassSub.str_cat, catES: mapDassCatES(dassSub.str_cat) }
    } : null;

    // Mensajes informativos (no afectan acreditación)
    const advisories = [];
    // DASS-21: usar subescalas si existen; si no, umbral simple por total
    if (dassDetails) {
      const severe = (c) => ['Severe', 'Extremely Severe'].includes(c);
      const moderate = (c) => c === 'Moderate';
      if (severe(dassDetails.dep.catEN)) advisories.push('DASS‑21 (Depresión): indicadores elevados. Considera buscar apoyo psicológico profesional. Activar red de apoyo y hábitos de sueño/alimentación pueden ayudar.');
      if (severe(dassDetails.anx.catEN)) advisories.push('DASS‑21 (Ansiedad): indicadores elevados. Practica respiración diafragmática y relajación; considera orientación psicológica.');
      if (severe(dassDetails.str.catEN)) advisories.push('DASS‑21 (Estrés): indicadores elevados. Ajusta cargas, agenda pausas activas y evalúa apoyo profesional.');
      const mods = [];
      if (moderate(dassDetails.dep.catEN)) mods.push('depresión');
      if (moderate(dassDetails.anx.catEN)) mods.push('ansiedad');
      if (moderate(dassDetails.str.catEN)) mods.push('estrés');
      if (mods.length) advisories.push(`DASS‑21: niveles moderados de ${mods.join(', ')}. Refuerza autocuidado (sueño, ejercicio, desconexión digital) y consulta si persisten.`);
    } else if (dass >= 50) {
      // Fallback cuando no hay subescalas (heurística basada en regla previa)
      advisories.push('DASS‑21: resultado global elevado. Te sugerimos orientación psicológica y hábitos de autocuidado.');
    }
    // Big Five: revisar dimensiones si están disponibles
    if (bigDim && bigDim.categories) {
      const cat = bigDim.categories;
      // Neuroticismo alto
      if (cat.N === 'Alto') advisories.push('Big Five (Neuroticismo alto): trabaja regulación emocional (respiración, journaling), higiene de sueño y límites de carga.');
      // Responsabilidad baja
      if (cat.C === 'Bajo') advisories.push('Big Five (Responsabilidad baja): usa planificación semanal, listas, técnica Pomodoro y metas SMART.');
      // Extraversión baja
      if (cat.E === 'Bajo') advisories.push('Big Five (Extraversión baja): si tu rol lo requiere, practica habilidades sociales y exposición gradual a interacciones.');
      // Amabilidad baja
      if (cat.A === 'Bajo') advisories.push('Big Five (Amabilidad baja): entrena escucha activa, validación emocional y negociación colaborativa.');
    }
    // Big Five total bajo: sugerencias generales
    if (big <= 50) {
      advisories.push('Big Five: índice global bajo. Refuerza hábitos de productividad (rutinas, metas SMART), técnicas de organización y busca retroalimentación o mentoría.');
    }
    // Feedback de pruebas obligatorias (éxitos y áreas de mejora)
    // 'mandatory' incluye todos para mostrar; 'gatingKeys' define cuáles realmente condicionan aprobación hoy.
    const mandatory = [
      { key: 'wais', label: 'WAIS', value: wais, ok: cumple.wais, requirementLabel: req.wais, gating: true },
      { key: 'academica', label: 'Prueba académica', value: aca, ok: cumple.academica, requirementLabel: req.academica, gating: true },
      { key: 'baron', label: 'Bar-On (Inteligencia emocional)', value: bar, ok: cumple.baron, requirementLabel: req.baron, gating: false },
      { key: 'matematica', label: 'Prueba matemática', value: mat, ok: cumple.matematica, requirementLabel: req.matematica, exists: mat != null, gating: true },
      { key: 'zavic', label: 'Zavic', value: zav, ok: cumple.zavic, requirementLabel: req.zavic, gating: true },
    ];
    const activeMandatory = mandatory.filter(m => (m.key !== 'matematica' ? true : m.exists));
    const gatingItems = activeMandatory.filter(m => m.gating);

    const tipsByKey = {
      wais: [
        'Practica razonamiento lógico y patrones (matrices, series, analogías).',
        'Refuerza aritmética mental y problemas de cifras.',
        'Usa temporizadores para mejorar gestión del tiempo en reactivos.'
      ],
      academica: [
        'Repasa los temas del plan académico que se evalúan con mayor peso.',
        'Realiza simuladores y preguntas de opción múltiple para ganar velocidad.',
        'Mejora comprensión lectora: identifica ideas clave y palabras trampa.'
      ],
      matematica: [
        'Refuerza fundamentos (fracciones, álgebra básica, proporciones).',
        'Resuelve ejercicios paso a paso; prioriza exactitud antes que velocidad.',
        'Aprende patrones típicos de problemas y practica diariamente.'
      ],
      zavic: [
        'Reflexiona sobre tus motivadores y valores profesionales (normas, logro, afiliación, poder).',
        'Trabaja casos éticos y dilemas prácticos para fortalecer criterios.',
        'Mantén consistencia en respuestas, alineando conducta con valores declarados.'
      ],
      baron: [
        'Practica regulación emocional (respiración diafragmática, pausa consciente y journaling).',
        'Refuerza empatía y escucha activa en conversaciones difíciles.',
        'Trabaja manejo de estrés: higiene del sueño, pausas activas y límites saludables.'
      ]
    };

    const passList = gatingItems.filter(m => m.ok).map(m => m.label);
    const failList = gatingItems.filter(m => m.ok === false).map(m => ({ label: m.label, key: m.key, value: m.value, requirement: m.requirementLabel, tips: tipsByKey[m.key] || [] }));
    const allMandatoryOk = gatingItems.length > 0 && failList.length === 0;

    // Señal de apoyo urgente si Big Five o DASS están bajos según total, o si hay categorías severas en DASS
    const anySevere = !!(dassDetails && (
      ['Severe', 'Extremely Severe'].includes(dassDetails.dep?.catEN) ||
      ['Severe', 'Extremely Severe'].includes(dassDetails.anx?.catEN) ||
      ['Severe', 'Extremely Severe'].includes(dassDetails.str?.catEN)
    ));
    const bigIsLow = big <= 50;
    const dassIsLow = dass <= 50;
    const needsUrgentSupport = bigIsLow || dassIsLow || anySevere;

    return { wais, aca, zav, mat, big, dass, bar, totalFinal, cumple, advisories, dassDetails, bigDim, mandatory, activeMandatory, passList, failList, allMandatoryOk, req, needsUrgentSupport, bigIsLow, dassIsLow, anySevere };
  }, [results]);

  // Construir link de WhatsApp con mensaje personalizado
  const whatsUrl = useMemo(() => {
    const phone = '52871515760';
    const name = (asesorName || 'asesor/a').trim();

    const detailParts = [];

    // 1) Resumen de no aprobación en pruebas obligatorias
    const notApproved = computed?.allMandatoryOk === false;
    const failingLabels = (computed?.failList || []).map(f => f.label);
    const academicFails = (computed?.failList || []).some(f => ['wais', 'academica', 'matematica'].includes(f.key));

    if (notApproved && failingLabels.length) {
      detailParts.push(`No cumplí requisitos en: ${failingLabels.join(', ')}`);
    }

    // 2) DASS‑21 específico por subescala
    if (computed?.dassDetails) {
      const highCats = ['Moderate', 'Severe', 'Extremely Severe'];
      const subFlags = [];
      if (highCats.includes(computed.dassDetails.dep?.catEN)) subFlags.push('Depresión');
      if (highCats.includes(computed.dassDetails.anx?.catEN)) subFlags.push('Ansiedad');
      if (highCats.includes(computed.dassDetails.str?.catEN)) subFlags.push('Estrés');
      if (subFlags.length) detailParts.push(`DASS‑21 elevado en ${subFlags.join(' y ')}`);
    } else if (computed?.dassIsLow) {
      detailParts.push('DASS‑21 alto');
    }

    // 3) Big Five: dimensiones bajas o global bajo
    if (computed?.bigDim && computed.bigDim.categories) {
      const lows = Object.entries(computed.bigDim.categories)
        .filter(([_, v]) => v === 'Bajo')
        .map(([k]) => dimLabelES(k));
      if (lows.length) detailParts.push(`Big Five bajo en ${lows.join(', ')}`);
    } else if (computed?.bigIsLow) {
      detailParts.push('Big Five global bajo');
    }

    // 4) Determinar tipo de apoyo solicitado según resultados
    const baronLow = typeof computed?.bar === 'number' ? (computed.bar <= (thresholds?.baron ?? 90)) : false;
    const wantsAcademicSupport = notApproved && academicFails;
    const wantsPsychSupport = baronLow || computed?.anySevere || computed?.dassIsLow;

    const summary = detailParts.length
      ? `Según mi reporte: ${detailParts.join('; ')}.`
      : 'Deseo orientación a partir de mis resultados.';

    let ask = 'Solicito información sobre sus servicios orientados a esta evaluación laboral (modalidades, horarios, disponibilidad y costos), y el proceso para agendar.';
    if (wantsAcademicSupport && wantsPsychSupport) {
      ask = 'Solicito información sobre sus servicios de fortalecimiento de competencias laborales/docentes (capacitaciones, entrenamiento cognitivo, simuladores de evaluación) y sobre el apoyo psicológico/bienestar (orientación, sesiones). ¿Podrían indicarme modalidades, horarios, disponibilidad y costos, así como el proceso para agendar?';
    } else if (wantsAcademicSupport) {
      ask = 'Solicito información sobre sus servicios de fortalecimiento de competencias laborales/docentes (capacitaciones, entrenamiento cognitivo, simuladores de evaluación). ¿Podrían indicarme modalidades, horarios, disponibilidad y costos, y el proceso para agendar?';
    } else if (wantsPsychSupport) {
      ask = 'Solicito información sobre sus servicios de apoyo psicológico y bienestar (orientación, sesiones). ¿Podrían indicarme modalidades, horarios, disponibilidad y costos, y el proceso para agendar?';
    }

    const text = [
      `Hola, mi nombre es ${name}. Realicé la evaluación laboral para postularme como docente/asesor(a) en MqerkAcademy.`,
      summary,
      ask,
      'Quedo atento(a) a su respuesta. Muchas gracias.'
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [asesorName, computed?.allMandatoryOk, computed?.failList, computed?.dassDetails, computed?.dassIsLow, computed?.bigDim, computed?.bigIsLow, computed?.bar, computed?.anySevere]);

  // Mostrar modal (solo celebratoria) al aprobar. No finaliza todavía.
  useEffect(() => {
    if (!computed?.allMandatoryOk) return;
    const seen = localStorage.getItem(successModalShownFlag);
    if (!seen) {
      setShowSuccessModal(true);
      localStorage.setItem(successModalShownFlag, '1');
    } else {
      // Si ya lo vio antes en esta sesión, aún así se lo mostramos para feedback inmediato
      setShowSuccessModal(true);
    }
  }, [computed?.allMandatoryOk]);

  // Confeti ligero al abrir modal de éxito
  useEffect(() => {
    if (!showSuccessModal) return;
    if (confettiStartedRef.current) return;
    confettiStartedRef.current = true;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: 6 + Math.random() * 8,
      c: `hsl(${Math.random() * 360},80%,60%)`,
      vy: 2 + Math.random() * 4,
      vx: -2 + Math.random() * 4,
      spin: Math.random() * Math.PI,
      vr: -0.1 + Math.random() * 0.2
    }));
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    let frame = 0, running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.spin += p.vr;
        if (p.y - p.r > H) { p.y = -p.r; p.x = Math.random() * W; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        ctx.restore();
      });
      frame++;
      if (frame < 600) requestAnimationFrame(draw); else running = false;
    };
    draw();
    return () => { running = false; window.removeEventListener('resize', resize); };
  }, [showSuccessModal]);

  const handleFinalizar = async () => {
    if (!preregistroId) {
      navigate('/pre_registro');
      return;
    }
    setFinalize({ running: true, message: null, aprobado: null, creds: null });
    try {
      const res = await fetch(buildApiUrl(`/asesores/finalizar/${preregistroId}`), { method: 'POST', credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'No se pudo finalizar');
      }
      setFinalize({ running: false, message: body.message || null, aprobado: body.aprobado, creds: body.credenciales || null });
      // Navegar a Gracias si se generaron credenciales o ya estaba finalizado
      if (body.aprobado && body.credenciales) {
        navigate('/gracias', { state: { creds: body.credenciales } });
      } else if (body.aprobado === false) {
        // Mostrar modal de intento fallido
        setShowRejectModal(true);
      }
    } catch (e) {
      setFinalize(f => ({ ...f, running: false, message: e.message || 'Error al finalizar' }));
    }
  };

  return (
    <>
      <NavLogin />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-semibold mb-4">Resultados de tu evaluación</h1>
        {loading && <div className="text-sm text-gray-700">Cargando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {results && (
          <div className="w-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium">Resultados principales</div>
                <div className="divide-y">
                  <Row label="WAIS" value={computed.wais} requirement={computed.req.wais} ok={computed.cumple.wais} />
                  <Row label="Prueba académica" value={computed.aca} requirement={computed.req.academica} ok={computed.cumple.academica} />
                  {/* Bar-On mostrado solo como valor informativo, sin indicador de aprobación para no revelar obligatoriedad */}
                  <Row label="Bar-On (Inteligencia emocional)" value={computed.bar} />
                  {computed.mat != null && (
                    <Row label="Prueba matemática" value={computed.mat} requirement={computed.req.matematica} ok={computed.cumple.matematica} />
                  )}
                  <Row label="Zavic" value={computed.zav} requirement={computed.req.zavic} ok={computed.cumple.zavic} />
                </div>
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <div className="font-semibold">Total</div>
                  <div className="text-lg font-bold">{computed.totalFinal}</div>
                </div>
                {/* Éxitos / mejoras en obligatorias */}
                {computed.passList.length > 0 && (
                  <div className="px-4 py-3 border-t bg-green-50 text-green-800 text-sm">
                    <div className="font-medium">¡Buen trabajo!</div>
                    <div>Has cumplido los criterios en: {computed.passList.join(', ')}.</div>
                  </div>
                )}
                {computed.failList.length > 0 && (
                  <div className="px-4 py-3 border-t bg-red-50 text-red-800 text-sm">
                    <div className="font-medium mb-1">Aún no cumples los requisitos en estas pruebas:</div>
                    <ul className="list-disc pl-5 space-y-2">
                      {computed.failList.map((f, idx) => (
                        <li key={idx}>
                          <div className="font-medium">{f.label} — tu puntaje: {f.value ?? '—'} (requisito: {f.requirement})</div>
                          {f.tips && f.tips.length > 0 && (
                            <ul className="list-disc pl-5 mt-1 text-red-900">
                              {f.tips.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-red-900">No te desanimes: con práctica enfocada y estos consejos, puedes mejorar notablemente en poco tiempo.</div>
                    {/* Nota de Bar-On eliminada para no exponer qué pruebas son obligatorias u opcionales */}
                  </div>
                )}
                {/* Banner de éxito eliminado: ahora usamos modal de celebración */}
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 font-medium">Resultados complementarios</div>
                <div className="divide-y">
                  <Row label="Big Five (Personalidad)" value={computed.big} />
                  <Row label="DASS-21 (Estrés/Ansiedad)" value={computed.dass} />
                </div>
                {(computed.dassDetails || (computed.bigDim && computed.bigDim.categories)) && (
                  <div className="px-4 py-3 border-t text-sm text-gray-700 space-y-1">
                    {computed.dassDetails && (
                      <div>
                        <div className="font-medium mb-0.5">DASS‑21 subescalas (orientativo):</div>
                        <ul className="list-disc pl-5">
                          <li>Depresión: {computed.dassDetails.dep.catES}{computed.dassDetails.dep.score != null ? ` (puntaje: ${computed.dassDetails.dep.score})` : ''}</li>
                          <li>Ansiedad: {computed.dassDetails.anx.catES}{computed.dassDetails.anx.score != null ? ` (puntaje: ${computed.dassDetails.anx.score})` : ''}</li>
                          <li>Estrés: {computed.dassDetails.str.catES}{computed.dassDetails.str.score != null ? ` (puntaje: ${computed.dassDetails.str.score})` : ''}</li>
                        </ul>
                      </div>
                    )}
                    {computed.bigDim && computed.bigDim.categories && (
                      <div>
                        <div className="font-medium mb-0.5">Big Five (categorías):</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {Object.entries(computed.bigDim.categories).map(([k, v]) => (
                            <div key={k} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                              <span>{dimLabelES(k)}:</span>
                              <span className="font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {computed.advisories && computed.advisories.length > 0 && (
                  <div className="px-4 py-3 bg-amber-50 text-amber-800 border-t border-amber-200 text-sm">
                    <div className="font-medium mb-1">Sugerencias de bienestar:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {computed.advisories.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                    <div className="text-xs text-amber-700 mt-2">Estas recomendaciones son orientativas y no constituyen un diagnóstico clínico.</div>
                  </div>
                )}
              </div>
              {/* Alerta importante de apoyo */}
              {computed?.needsUrgentSupport && (
                <div className="border rounded-md overflow-hidden xl:col-span-2">
                  <div className="px-4 py-3 bg-red-50 text-red-800 text-sm">
                    <div className="font-semibold mb-1">Apoyo recomendado</div>
                    <p>Detectamos indicadores que sugieren que podrías beneficiarte de apoyo adicional. En MqerkAcademy podemos ayudarte.</p>
                    <p className="mt-1">Contáctanos: <a href={whatsUrl} target="_blank" rel="noreferrer" className="underline font-medium">WhatsApp/Tel: 287-151-5760</a></p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {!computed?.allMandatoryOk && (
                <>
                  <button
                    className="px-4 py-2 rounded bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-60"
                    disabled={finalize.running}
                    onClick={handleFinalizar}
                  >{finalize.running ? 'Finalizando…' : 'Finalizar proceso'}</button>
                  {finalize.message && (
                    <div className="text-sm text-gray-700 self-center">{finalize.message}</div>
                  )}
                </>
              )}
              {computed?.allMandatoryOk && (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="text-sm text-emerald-700 font-medium">Procede a completar tu registro para obtener tus credenciales.</div>
                  <button
                    onClick={() => { navigate('/registro_asesor', { state: { aprobadoFinal: true } }); }}
                    className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                  >Ir al registro</button>
                </div>
              )}
            </div>
            {showRejectModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowRejectModal(false)} />
                <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 animate-fade-in">
                  <h2 className="text-xl font-bold text-gray-900">Test finalizado</h2>
                  <p className="text-gray-700">Lamentablemente tu perfil aún no cumple con los requisitos mínimos para continuar.</p>
                  {computed && computed.failList && computed.failList.length > 0 && (
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1 max-h-40 overflow-auto">
                      {computed.failList.map(f => (
                        <li key={f.key}>{f.label}: {f.value ?? '—'} (requisito {f.requirement})</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-sm text-gray-600">Refuerza esas áreas y vuelve a intentarlo más adelante. Tus intentos quedan registrados.</p>
                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => { setShowRejectModal(false); navigate('/pre_registro'); }} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium">Cerrar</button>
                    <button onClick={() => { setShowRejectModal(false); navigate('/pre_registro'); }} className="px-3 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium">Intentar nuevamente</button>
                  </div>
                </div>
              </div>
            )}

            {showSuccessModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccessModal(false)} />
                <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-5 animate-fade-in">
                  <canvas ref={confettiCanvasRef} className="pointer-events-none fixed inset-0 w-full h-full" style={{ zIndex: -1 }} />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="text-4xl" aria-hidden="true">🎉</div>
                    <h2 className="text-xl font-bold text-emerald-700">¡Felicidades!</h2>
                    <p className="text-sm text-gray-700">Aprobaste la evaluación inicial. Completa tu registro para generar tus credenciales de acceso.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full sm:w-auto px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
                    >Ver resultados</button>
                    <button
                      onClick={() => { navigate('/registro_asesor', { state: { aprobadoFinal: true } }); }}
                      className="w-full sm:w-auto px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
                    >Ir al registro</button>
                  </div>
                  <div className="text-[11px] text-gray-400 text-center">Si cierras este mensaje puedes volver a abrir el registro desde aquí en cualquier momento.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !results && !error && (
          <div className="text-sm text-gray-600">No se encontraron resultados aún. Vuelve al test para completarlo.</div>
        )}
      </div>
    </>
  );
}

function dimLabelES(k) {
  switch (String(k)) {
    case 'O': return 'Apertura';
    case 'C': return 'Responsabilidad';
    case 'E': return 'Extraversión';
    case 'A': return 'Amabilidad';
    case 'N': return 'Neuroticismo';
    default: return String(k).toUpperCase();
  }
}

function Row({ label, value, requirement, ok }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {requirement && <div className="text-xs text-gray-500">Requisito: {requirement}</div>}
      </div>
      <div className="flex items-center gap-3">
        {ok !== undefined && (
          ok
            ? <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Cumple" title="Cumple" />
            : <XCircle className="h-5 w-5 text-red-600" aria-label="No cumple" title="No cumple" />
        )}
        <div className="text-base font-semibold">{value}</div>
      </div>
    </div>
  );
}

export default Resultado;
