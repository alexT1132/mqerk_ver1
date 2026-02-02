import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Share2, Printer, ClipboardCopy, Download, ArrowLeft, Sparkles, AlertTriangle, Bot, Brain, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import ChatTutor from '../../components/simulaciones/ChatTutor'; // ✅ Importar ChatTutor compartido
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'https://esm.sh/remark-gfm';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import AlertDialog from '../../components/ui/AlertDialog';

/**
 * Página completa para mostrar el análisis de rendimiento generado por la IA de Gemini.
 * Recibe los datos a través de location.state
 */
export default function AnalisisIAPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const userRole = user?.rol || user?.role || 'estudiante';

  // Obtener datos del estado de navegación
  const {
    analysisText,
    itemName,
    analysisMeta,
    isLoading: isLoadingProp,
    error: errorProp,
    itemId,
    estudianteId
  } = location.state || {};

  const [isLoading, setIsLoading] = useState(isLoadingProp || false);
  const [error, setError] = useState(errorProp || null);
  const [analysisTextState, setAnalysisTextState] = useState(analysisText || '');
  const [analysisMetaState, setAnalysisMetaState] = useState(analysisMeta || null);
  const [itemNameState, setItemNameState] = useState(itemName || '');
  const [headings, setHeadings] = useState([]);
  const [justHighlightedId, setJustHighlightedId] = useState(null);
  const [aiUsage, setAiUsage] = useState({
    quizCount: 0, simuladorCount: 0, tutorCount: 0,
    quizLimit: 5, simuladorLimit: 5, tutorLimit: 10,
    remainingQuiz: 5, remainingSimulador: 5, remainingTutor: 10
  });

  // Custom Hook or just state for Chat visibility
  const [showChat, setShowChat] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false); // Nuevo estado para el modal de cuota
  const [cooldownIA, setCooldownIA] = useState(0); // THROTTLING: Cooldown de seguridad

  // Effect para manejar el countdown del Throttling
  useEffect(() => {
    let interval;
    if (cooldownIA > 0) {
      interval = setInterval(() => {
        setCooldownIA((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownIA]);

  const contentRef = useRef(null);

  // Si no hay datos en el state, redirigir a la página anterior
  useEffect(() => {
    if (!location.state) {
      navigate(-1);
    }
  }, [location.state, navigate]);

  // Actualizar estado cuando location.state cambia (cuando navegamos con nuevos datos)
  useEffect(() => {
    if (location.state) {
      setIsLoading(location.state.isLoading || false);
      setError(location.state.error || null);
      if (location.state.analysisText !== undefined) {
        setAnalysisTextState(location.state.analysisText || '');
      }
      if (location.state.analysisMeta !== undefined) {
        setAnalysisMetaState(location.state.analysisMeta || null);
      }
      if (location.state.itemName !== undefined) {
        setItemNameState(location.state.itemName || '');
      }
    }
  }, [location.state]);

  // Helpers para tracking de uso de IA
  const DAILY_LIMIT = userRole === 'asesor' || userRole === 'admin' ? 20 : 5;

  // Detectar fuente del análisis y limpiar marcadores ocultos (debe estar antes de los useEffect que lo usan)
  const sourceMatch = analysisTextState ? analysisTextState.match(/<<<AI_SOURCE:([\w_]+)>>>/) : null;
  const analysisSource = sourceMatch?.[1] || null;
  const cleanedAnalysisText = analysisTextState ? analysisTextState.replace(/\n*<<<AI_SOURCE:[\w_]+>>>\s*$/, '') : analysisTextState;

  // Función para obtener y actualizar el uso de IA
  // Ahora acepta currentAnalysisSource como parámetro para evitar ReferenceError
  const refreshAiUsage = async (currentAnalysisSource) => {
    const studentId = estudianteId || user?.id;
    if (!studentId) {
      console.warn('⚠️ No se pudo obtener ID de estudiante para tracking de IA');
      return;
    }

    try {
      const qUsageResponse = await api.get(`/ai-usage/${studentId}/quiz`);
      const sUsageResponse = await api.get(`/ai-usage/${studentId}/simulacion`);
      const tUsageResponse = await api.get(`/ai-usage/${studentId}/tutor`); // ✅ Fetch Tutor usage

      const qUsage = qUsageResponse.data.data;
      const sUsage = sUsageResponse.data.data;
      const tUsage = tUsageResponse.data.data;

      const remainingQuiz = qUsage.limit - qUsage.count;
      const remainingSimulador = sUsage.limit - sUsage.count;
      const remainingTutor = tUsage.limit - tUsage.count;
      const totalRemaining = remainingQuiz + remainingSimulador;

      setAiUsage(prev => ({
        ...prev,
        quizCount: qUsage.count,
        quizLimit: qUsage.limit,
        simuladorCount: sUsage.count,
        simuladorLimit: sUsage.limit,
        tutorCount: tUsage.count,
        tutorLimit: tUsage.limit,
        remainingQuiz: remainingQuiz,
        remainingSimulador: remainingSimulador,
        remainingTutor: remainingTutor,
        totalRemaining: totalRemaining
      }));

      // Determinar si el modal de cuota debe mostrarse
      // ✅ FIX: Solo mostrar modal si la cuota de QUIZ está agotada (estamos en contexto de Quizzes)
      // No bloquear por simuladores aquí.
      const isQuotaExhausted = (remainingQuiz <= 0);
      const isFallbackActive = (currentAnalysisSource && currentAnalysisSource.includes('FALLBACK'));
      setShowQuotaModal(isQuotaExhausted || isFallbackActive);

    } catch (error) {
      console.error(`❌ Error obteniendo uso de IA desde BD:`, error);
      // En caso de error, asegurar que el modal no se muestre por error
      setShowQuotaModal(false);
    }
  };

  // ✅ Cargar contador de uso de IA desde base de datos al montar el componente
  // y re-evaluar cuando cambie la fuente del análisis (ej. a FALLBACK)
  useEffect(() => {
    refreshAiUsage(analysisSource); // Pasar analysisSource como argumento
  }, [estudianteId, user?.id, analysisSource]);

  // Notificar si se está usando fallback por error
  useEffect(() => {
    if (analysisSource === 'FALLBACK_ON_ERROR') {
      // Usar setTimeout para evitar conflictos con renderizado inicial
      setTimeout(() => {
        // Si tienes un toast/notification system global, úsalo aquí. 
        // Como no veo importado 'showNotification', usaré logs o alertas visuales locales si es necesario.
        // Pero dado que el componente ya maneja 'error', aquí solo es informativo.
        console.warn('⚠️ Mostrando análisis local debido a fallo de API.');
      }, 500);
    }
  }, [analysisSource]);

  // Helpers para procesar markdown
  const stripMd = (s) => String(s || '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_|~~/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/>\s?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const slugify = (s) => String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const extractHeadings = (md) => {
    const lines = String(md || '').split(/\r?\n/);
    const hs = [];
    for (const line of lines) {
      const m2 = line.match(/^##\s+(.+)/);
      const m3 = line.match(/^###\s+(.+)/);
      if (m2) hs.push({ level: 2, text: stripMd(m2[1]) });
      else if (m3) hs.push({ level: 3, text: stripMd(m3[1]) });
    }
    return hs;
  };

  const buildTOC = (md) => {
    const hs = extractHeadings(md);
    if (!hs.length) return '- [Análisis](#análisis)\n- [Notas y advertencias](#notas-y-advertencias)';
    return hs.map(h => `${h.level === 3 ? '  ' : ''}- [${h.text}](#${slugify(h.text)})`).join('\n');
  };

  const buildTechSheet = (meta) => {
    if (!meta) return '';
    const val = (v, suf = '') => (v == null || Number.isNaN(v)) ? 'N/D' : `${v}${suf}`;
    const rows = [
      ['Total intentos', val(meta.totalIntentos)],
      ['Mejor puntaje', val(meta.mejorPuntaje, '%')],
      ['Promedio', val(meta.promedio, '%')],
      ['Último puntaje', val(meta.ultimoPuntaje, '%')],
      ['Pendiente tendencia', meta.pendienteTendencia == null ? 'N/D' : meta.pendienteTendencia.toFixed(3)],
      ['Variabilidad (DE)', meta.desviacionPuntaje == null ? 'N/D' : meta.desviacionPuntaje.toFixed(2)],
      ['Tiempo prom. intento', val(meta.promedioDuracion, 's')],
      ['Mejor tiempo', val(meta.mejorDuracion, 's')],
      ['Peor tiempo', val(meta.peorDuracion, 's')],
      ['Intento analizado', val(meta.intentoNumero)],
      ['Preguntas total', val(meta.totalPreguntasIntento)],
      ['Correctas', val(meta.correctasIntento)],
      ['Incorrectas', val(meta.incorrectasIntento)],
      ['Omitidas', val(meta.omitidasIntento)],
      ['Tiempo total intento', val(meta.totalTiempoIntento, 's')],
      ['Tiempo prom. pregunta', val(meta.promedioTiempoPregunta, 's')],
    ];
    const header = '| Métrica | Valor |\n|---|---|';
    const body = rows.map(r => `| ${r[0]} | ${r[1]} |`).join('\n');
    return `\n## Ficha técnica\n\n${header}\n${body}\n`;
  };

  // Extraer headings para navegación
  // Extraer headings para navegación
  useEffect(() => {
    if (!cleanedAnalysisText) { setHeadings([]); return; }
    try {
      const lines = String(cleanedAnalysisText).split(/\r?\n/);
      const hs = [];
      for (const line of lines) {
        // Capturar h2 (##) o h3 (###)
        const mHeadline = line.match(/^(#{2,3})\s+(.+)/);
        if (mHeadline) {
          const rawText = stripMd(mHeadline[2]);
          const isReincidente = rawText.includes('REINCIDENTE') || rawText.includes('@FLAG');
          // Limpieza idéntica al renderizado
          const displayText = rawText.replace(/@FLAG_?REINCIDENCIA/g, '').replace(/⚠️ ERROR REINCIDENTE/g, '').replace(/⚠️/g, '').replace(/[@⚠️]/g, '').trim();

          if (displayText) {
            hs.push({
              id: slugify(displayText),
              text: displayText,
              isReincidente
            });
          }
        }
      }
      setHeadings(hs);
    } catch {
      setHeadings([]);
    }
  }, [cleanedAnalysisText]);

  const scrollToId = (id) => {
    try {
      const container = contentRef.current;
      if (!container) return;
      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (!el) return;
      const top = el.offsetTop - 8;
      container.scrollTo({ top, behavior: 'smooth' });
      el.classList.add('pulse-highlight');
      setJustHighlightedId(id);
      setTimeout(() => { el.classList.remove('pulse-highlight'); setJustHighlightedId(null); }, 1200);
    } catch { }
  };

  const buildExportMarkdown = (md, name, meta) => {
    const finalName = name || itemNameState;
    const finalMeta = meta || analysisMetaState;
    const now = new Date();
    const iso = now.toISOString();
    const human = now.toLocaleString('es-ES');
    const safeName = stripMd(name || 'Evaluación');
    const toc = buildTOC(md);
    const fm = `---\n` +
      `title: "Informe de rendimiento – ${safeName}"\n` +
      `generated_at: "${iso}"\n` +
      `app: "MQerk Academy"\n` +
      `format_version: 1\n` +
      `---`;
    const header = `# Informe de rendimiento: ${safeName}\n\n` +
      `- Generado: ${human}\n` +
      `- Fuente: Análisis con IA (Gemini)\n`;
    const index = `\n## Índice\n\n${toc}\n`;
    const ficha = buildTechSheet(meta);
    const body = `\n## Análisis\n\n${md?.trim() || '_Sin contenido_'}\n`;
    const footer = `\n---\n\n## Notas y advertencias\n\n- Este informe es orientativo y puede contener imprecisiones.\n- Revisa los resultados del intento para mayor contexto.\n- Si una sección no aparece en el índice, es porque la IA no la generó para este intento.`;
    return [fm, '', header, index, ficha, body, footer].join('\n');
  };

  const buildShareSummary = (name, meta) => {
    const title = `Diagnóstico: ${name || 'Evaluación'}`;
    if (!meta) {
      return `${title}\nResumen: análisis de rendimiento disponible en MQerk Academy.`;
    }
    const v = (x, suf = '') => (x == null || Number.isNaN(x)) ? 'N/D' : `${x}${suf}`;
    const partes = [
      title,
      `Intentos: ${v(meta.totalIntentos)}`,
      `Mejor: ${v(meta.mejorPuntaje, '%')} | Promedio: ${v(meta.promedio, '%')}`,
      meta.ultimoPuntaje != null ? `Último: ${v(meta.ultimoPuntaje, '%')}` : null,
      meta.pendienteTendencia != null ? `Tendencia: ${meta.pendienteTendencia.toFixed(3)}` : null,
      meta.desviacionPuntaje != null ? `Variabilidad (DE): ${meta.desviacionPuntaje.toFixed(2)}` : null,
    ].filter(Boolean);
    partes.push('Consejos completos en el informe.');
    return partes.join('\n');
  };

  const handleCopy = async () => {
    try {
      if (!cleanedAnalysisText) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemNameState, analysisMetaState);
      await navigator.clipboard.writeText(enriched);
    } catch (e) {
      console.warn('No se pudo copiar:', e);
    }
  };

  const handleDownload = () => {
    try {
      if (!cleanedAnalysisText) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemNameState, analysisMetaState);
      const blob = new Blob([enriched], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (itemNameState || 'analisis').replace(/[^\w\-]+/g, '_').slice(0, 48);
      const ts = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const stamp = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}`;
      a.download = `${safeName || 'analisis'}-${stamp}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('No se pudo descargar:', e);
    }
  };

  const handlePrintPdf = () => {
    try {
      if (!cleanedAnalysisText) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemNameState, analysisMetaState);
      const w = window.open('', '_blank');
      if (!w) return;
      const now = new Date().toLocaleString('es-ES');
      const mdSerialized = JSON.stringify(enriched);
      w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informe - ${itemNameState || 'Evaluación'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown-light.min.css" />
  <style>
    @page { margin: 18mm; }
    html, body { height: 100%; }
    body { margin: 0; font: 14px/1.55 system-ui, -apple-system, Segoe UI, Roboto, Arial; color: #111827; }
    .header { display:flex; align-items:baseline; justify-content:space-between; margin: 16px 0 12px 0; }
    .header h1 { font-size: 20px; margin: 0; }
    .header .meta { color:#6b7280; font-size:12px; }
    .markdown-body { box-sizing: border-box; min-height: calc(100vh - 100px); padding: 16px 0 32px 0; }
    .markdown-body h1 { font-size: 1.4rem; }
    .markdown-body h2 { font-size: 1.2rem; }
    .markdown-body h3 { font-size: 1.05rem; }
    .markdown-body a { color:#4f46e5; text-decoration: underline; text-underline-offset:2px; }
    .markdown-body a:hover { color:#4338ca; }
    .container { max-width: 820px; margin: 0 auto; padding: 0 12px; }
    h2, h3 { break-after: avoid-page; }
    table, pre, blockquote { break-inside: avoid; }
    @media print {
      a[href^="http"]::after { content: " (" attr(href) ")"; color:#6b7280; font-size: 0.85em; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    window.addEventListener('load', () => {
      try {
        const md = ${mdSerialized}.replace(/^---[\s\S]*?---\s*/,'');
        marked.use({ gfm: true, breaks: false });
        const html = DOMPurify.sanitize(marked.parse(md));
        const root = document.getElementById('md-root');
        root.innerHTML = html;
        setTimeout(() => window.print(), 250);
      } catch (e) { console.error(e); }
    });
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Informe de rendimiento</h1>
      <div class="meta">MQerk Academy • ${now}</div>
    </div>
    <article id="md-root" class="markdown-body"></article>
  </div>
</body>
</html>`);
      w.document.close();
    } catch (e) {
      console.warn('No se pudo preparar la impresión:', e);
    }
  };

  const handleShareWhatsapp = () => {
    try {
      if (!cleanedAnalysisText) return;
      const resumen = buildShareSummary(itemNameState, analysisMetaState);
      const url = `https://wa.me/?text=${encodeURIComponent(resumen)}`;
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      console.warn('No se pudo abrir WhatsApp:', e);
    }
  };

  const handleRetry = () => {
    // Navegar de vuelta al historial para regenerar el análisis
    navigate(-1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16 sm:py-20 flex flex-col items-center justify-center text-slate-600 min-h-[240px] sm:min-h-[280px] px-4">
          <svg className="animate-spin h-12 w-12 text-indigo-500 mb-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold text-base sm:text-lg">Analizando tu rendimiento...</p>
          <p className="text-sm text-slate-500 mt-1">La IA está preparando tus consejos.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-16 sm:py-20 flex flex-col items-center justify-center text-red-700 bg-red-50/80 rounded-xl min-h-[240px] sm:min-h-[280px] px-4 border border-red-100">
          <AlertTriangle className="h-12 w-12 mb-5 text-red-500" />
          <p className="font-semibold text-base sm:text-lg">Error al generar el análisis</p>
          <p className="text-sm text-red-600 mt-2 mb-6 max-w-md">{error}</p>
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    if (cleanedAnalysisText) {
      const meta = analysisMetaState || {};
      const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
      const trendLabel = (() => {
        const p = typeof meta.pendienteTendencia === 'number' ? meta.pendienteTendencia : null;
        if (p == null) return 'tendencia: N/D';
        if (p > 0.2) return 'tendencia: mejora';
        if (p < -0.2) return 'tendencia: descenso';
        return 'tendencia: estable';
      })();
      const dLastPrev = meta.deltaUltimoVsAnterior != null ? meta.deltaUltimoVsAnterior : (toNum(meta.ultimoPuntaje) != null && toNum(meta.previoPuntaje) != null ? toNum(meta.ultimoPuntaje) - toNum(meta.previoPuntaje) : null);
      const dLastOff = meta.deltaUltimoVsOficial != null ? meta.deltaUltimoVsOficial : (toNum(meta.ultimoPuntaje) != null && toNum(meta.oficialPuntaje) != null ? toNum(meta.ultimoPuntaje) - toNum(meta.oficialPuntaje) : null);
      const dBestOff = meta.deltaMejorVsOficial != null ? meta.deltaMejorVsOficial : (toNum(meta.mejorPuntaje) != null && toNum(meta.oficialPuntaje) != null ? toNum(meta.mejorPuntaje) - toNum(meta.oficialPuntaje) : null);
      const effLabel = (() => {
        const best = dBestOff;
        if (best == null || (meta.practiceCount ?? 0) === 0) return 'práctica: —';
        if (best >= 15) return 'práctica: Alta';
        if (best >= 7) return 'práctica: Media';
        if (best >= 3) return 'práctica: Ligera';
        if (best >= 0) return 'práctica: Neutral';
        return 'práctica: Baja';
      })();
      return (
        <>
          {Boolean(analysisMetaState) && (
            <div className="p-4 sm:p-5 mb-6">
              {/* Tarjeta principal de calificación */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 mb-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium opacity-90 mb-1">Último intento</div>
                    <div className="text-5xl font-bold">{meta.ultimoPuntaje ?? 'N/D'}%</div>
                    {dLastPrev != null && (
                      <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${dLastPrev > 0 ? 'bg-emerald-400/30 text-emerald-100' : dLastPrev < 0 ? 'bg-red-400/30 text-red-100' : 'bg-white/20 text-white'}`}>
                        {dLastPrev >= 0 ? '↑' : '↓'} {Math.abs(dLastPrev)} pts vs anterior
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Mejor puntaje</div>
                    <div className="text-3xl font-bold">{meta.mejorPuntaje ?? 'N/D'}%</div>
                    <div className="text-xs opacity-75 mt-1">{meta.totalIntentos ?? 0} intentos</div>
                  </div>
                </div>
              </div>

            </div>
          )}
          {
            headings && headings.length > 0 && (
              <div className="mb-5 px-4 sm:px-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ir a sección</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {headings.map(h => (
                    <button
                      key={h.id}
                      onClick={() => scrollToId(h.id)}
                      className={`px-4 py-2.5 sm:py-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all duration-200 whitespace-normal ${justHighlightedId === h.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200/50' : 'bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 border-slate-200/90 shadow-sm'}`}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
          <div
            ref={contentRef}
            className="w-full min-h-[500px] prose prose-indigo max-w-none"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-8 mb-6 break-words tracking-tight border-b-2 border-slate-100 pb-4" {...props} />
                ),
                h2: ({ node, children, ...props }) => {
                  const raw = Array.isArray(children) ? children.map(c => typeof c === 'string' ? c : '').join('') : String(children || '');
                  const cleanText = raw.replace(/[@⚠️]/g, '').trim();
                  const id = slugify(cleanText);
                  return (
                    <div className="mt-10 mb-5 pt-4">
                      <h2 id={id} className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 bg-indigo-50 border-l-4 border-indigo-500 py-3 px-4 rounded-r-lg flex items-center gap-3 break-words shadow-sm" {...props}>
                        {children}
                      </h2>
                    </div>
                  );
                },
                h3: ({ node, children, ...props }) => {
                  const raw = Array.isArray(children) ? children.map(c => typeof c === 'string' ? c : '').join('') : String(children || '');
                  const isInestable = raw.includes('CONOCIMIENTO INESTABLE') || raw.includes('INESTABLE');
                  const isReincidente = raw.includes('REINCIDENTE') || raw.includes('@FLAG');
                  const displayText = raw
                    .replace(/@FLAG_?REINCIDENCIA/g, '')
                    .replace(/🚨 CONOCIMIENTO INESTABLE/g, '')
                    .replace(/⚠️ ERROR REINCIDENTE/g, '')
                    .replace(/[🚨⚠️@]/g, '')
                    .trim();
                  const id = slugify(displayText);

                  // Conocimiento inestable (MÁS CRÍTICO)
                  if (isInestable) {
                    return (
                      <div className="mt-8 mb-4">
                        <h3 id={id} className="text-base sm:text-lg md:text-xl font-bold text-red-900 bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-600 py-4 px-4 rounded-r-lg flex flex-wrap items-center gap-2 break-words shadow-md scroll-mt-24" {...props}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black bg-red-600 text-white uppercase tracking-wider shadow-sm flex-shrink-0 animate-pulse">
                            🚨 CONOCIMIENTO INESTABLE
                          </span>
                          <span>{displayText}</span>
                        </h3>
                      </div>
                    );
                  }

                  // Error reincidente (ALTA PRIORIDAD)
                  if (isReincidente) {
                    return (
                      <div className="mt-8 mb-4">
                        <h3 id={id} className="text-base sm:text-lg md:text-xl font-bold text-orange-800 bg-orange-50 border-l-4 border-orange-500 py-3 px-4 rounded-r-lg flex flex-wrap items-center gap-2 break-words shadow-sm scroll-mt-24" {...props}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-white text-orange-600 border border-orange-100 uppercase tracking-wider shadow-sm flex-shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Reincidente
                          </span>
                          <span>{displayText}</span>
                        </h3>
                      </div>
                    );
                  }

                  // Error normal
                  return (
                    <h3 id={id} className="text-base sm:text-lg md:text-xl font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2 break-words scroll-mt-20 border-b border-slate-100 pb-2" {...props}>
                      <span className="text-indigo-400 text-xl leading-none select-none">•</span>
                      {displayText}
                    </h3>
                  );
                },
                p: ({ node, ...props }) => <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 break-words" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 sm:ml-6 mb-4 space-y-1 text-slate-700 text-sm sm:text-base" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 sm:ml-6 mb-4 space-y-1 text-slate-700 text-sm sm:text-base" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1 mb-1 break-words" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-3 sm:pl-4 py-2 my-4 sm:my-6 bg-slate-50 text-slate-700 italic rounded-r shadow-sm text-sm sm:text-base" {...props} />,
                code: ({ node, inline, ...props }) => (
                  inline
                    ? <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-xs sm:text-sm font-mono border border-slate-200 break-all" {...props} />
                    : <pre className="bg-slate-900 text-slate-50 p-3 sm:p-4 rounded-lg overflow-x-auto my-4 sm:my-6 text-xs sm:text-sm font-mono leading-relaxed shadow-lg w-full max-w-full"><code {...props} /></pre>
                ),
                table: ({ node, ...props }) => <div className="overflow-x-auto w-full block my-6 rounded-lg border border-slate-200 shadow-sm"><table className="min-w-full divide-y divide-slate-200" {...props} /></div>,
                thead: ({ node, ...props }) => <thead className="bg-slate-50" {...props} />,
                tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-slate-200" {...props} />,
                tr: ({ node, ...props }) => <tr className="" {...props} />,
                th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap" {...props} />,
                td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-slate-700 whitespace-normal min-w-[120px]" {...props} />,
                hr: ({ node, ...props }) => <span className="hidden" aria-hidden="true" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 bg-indigo-50/80 px-0.5 rounded" {...props} />,
              }}
            >
              {cleanedAnalysisText}
            </ReactMarkdown>
          </div>

          {/* Sección de Metacognición (Estrategia de Examen) */}
          {analysisMetaState?.estrategia && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 mt-8">
              <div className="flex items-center mb-6">
                <Brain className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Análisis de Estrategia de Examen</h3>
                  <p className="text-sm text-slate-500">Diagnóstico de tu comportamiento durante la prueba (Metacognición)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Impulsividad */}
                <div className={`p-4 rounded-xl border ${analysisMetaState.estrategia.impulsivas?.length > 0
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-green-50 border-green-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {analysisMetaState.estrategia.impulsivas?.length > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    <h4 className={`font-bold ${analysisMetaState.estrategia.impulsivas?.length > 0 ? 'text-orange-800' : 'text-green-800'
                      }`}>Control de Impulsividad</h4>
                  </div>

                  {analysisMetaState.estrategia.impulsivas?.length > 0 ? (
                    <>
                      <p className="text-sm text-orange-700 mb-2">
                        Detectamos <strong>{analysisMetaState.estrategia.impulsivas.length} respuestas impulsivas</strong> (respondidas incorrectamente en menos de 10s).
                      </p>
                      <ul className="text-xs text-orange-600 space-y-1 pl-4 list-disc">
                        {analysisMetaState.estrategia.impulsivas.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="line-clamp-2">"{item.pregunta}" ({item.tiempoSeg}s)</li>
                        ))}
                      </ul>
                      <p className="text-xs font-semibold text-orange-800 mt-2">💡 Consejo: Lee la pregunta completa antes de responder.</p>
                    </>
                  ) : (
                    <p className="text-sm text-green-700">
                      ¡Excelente! No detectamos respuestas impulsivas. Te tomas el tiempo necesario para leer.
                    </p>
                  )}
                </div>

                {/* 2. Gestión del Tiempo (Bloqueos) */}
                <div className={`p-4 rounded-xl border ${analysisMetaState.estrategia.bloqueos?.length > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className={`w-5 h-5 ${analysisMetaState.estrategia.bloqueos?.length > 0 ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    <h4 className={`font-bold ${analysisMetaState.estrategia.bloqueos?.length > 0 ? 'text-yellow-800' : 'text-blue-800'
                      }`}>Gestión del Tiempo</h4>
                  </div>

                  {analysisMetaState.estrategia.bloqueos?.length > 0 ? (
                    <>
                      <p className="text-sm text-yellow-700 mb-2">
                        Detectamos <strong>{analysisMetaState.estrategia.bloqueos.length} bloqueos</strong> (tardaste más de 2min en una pregunta).
                      </p>
                      <ul className="text-xs text-yellow-600 space-y-1 pl-4 list-disc">
                        {analysisMetaState.estrategia.bloqueos.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="line-clamp-2">"{item.pregunta}" ({Math.round(item.tiempoSeg / 60)}m {item.tiempoSeg % 60}s)</li>
                        ))}
                      </ul>
                      <p className="text-xs font-semibold text-yellow-800 mt-2">💡 Consejo: Si te trabas, marca la pregunta y regresa después.</p>
                    </>
                  ) : (
                    <p className="text-sm text-blue-700">
                      Buenos tiempos de respuesta. Mantuviste un ritmo fluido sin quedarte atascado.
                    </p>
                  )}
                </div>

                {/* 3. Resistencia Mental (Fatiga) */}
                <div className={`p-4 rounded-xl border ${analysisMetaState.estrategia.fatiga?.detectada
                  ? 'bg-red-50 border-red-200'
                  : 'bg-indigo-50 border-indigo-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className={`w-5 h-5 ${analysisMetaState.estrategia.fatiga?.detectada ? 'text-red-600' : 'text-indigo-600'
                      }`} />
                    <h4 className={`font-bold ${analysisMetaState.estrategia.fatiga?.detectada ? 'text-red-800' : 'text-indigo-800'
                      }`}>Resistencia Mental</h4>
                  </div>

                  {analysisMetaState.estrategia.fatiga?.detectada ? (
                    <>
                      <p className="text-sm text-red-700 mb-2">
                        ⚠️ <strong>Fatiga detectada</strong>. Tu rendimiento cayó un <strong>{analysisMetaState.estrategia.fatiga.caida}%</strong> en la segunda mitad del examen.
                      </p>
                      <p className="text-xs font-semibold text-red-800 mt-2">💡 Consejo: Practica simulaciones más largas para mejorar tu resistencia.</p>
                    </>
                  ) : (
                    <p className="text-sm text-indigo-700">
                      Rendimiento sostenido. Mantuviste la concentración durante todo el examen. ¡Bien hecho!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección Chat Tutor */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" />
                Tutor IA Personal
              </h3>
              <button
                onClick={() => setShowChat(!showChat)}
                // Deshabilitar solo si es fallback local y no hay red
                disabled={(analysisSource && analysisSource.includes('FALLBACK'))}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${(analysisSource && analysisSource.includes('FALLBACK'))
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
              >
                <Bot className="w-4 h-4" />
                {showChat ? 'Ocultar Tutor' : 'Consultar Tutor'}
              </button>
            </div>

            {showChat && (
              <ChatTutor
                analysisContext={cleanedAnalysisText}
                studentName={user?.nombre}
                onClose={() => setShowChat(false)}
                onUsageUpdate={() => refreshAiUsage(analysisSource)}
                aiUsage={{ remaining: aiUsage.remainingTutor }}
                isFallback={(analysisSource === 'FALLBACK' || analysisSource === 'FALLBACK_LOCAL' || analysisSource === 'FALLBACK_ON_ERROR')}
                analysisSource={analysisSource}
              />
            )}
          </div>
        </>
      );
    }
    return (
      <div className="text-center py-16 sm:py-20 text-slate-500 min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-base sm:text-lg font-medium">No hay análisis disponible</p>
      </div>
    );
  };

  const canExport = !!cleanedAnalysisText && !isLoading && !error;

  return (
    <div className="flex flex-col w-full min-h-full pt-14 sm:pt-16 bg-slate-50">
      {/* Barra de página: sticky debajo del header principal */}
      <header className="sticky z-20 flex-shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm" style={{ top: '3.5rem' }}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h1 className="text-lg font-bold text-slate-900 truncate">Análisis con IA</h1>
                  {analysisSource === 'GEMINI' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">GEMINI PRO</span>
                  )}
                  {analysisSource === 'GROQ' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">GROQ LLAMA</span>
                  )}
                  {(analysisSource === 'FALLBACK' || analysisSource === 'FALLBACK_LOCAL' || analysisSource === 'FALLBACK_ON_ERROR') && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ANALIZADOR LOCAL
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{itemNameState || 'Evaluación'}</p>
              </div>
            </div>

            {/* Contador de uso */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">
                  {aiUsage.remainingQuiz} quizzes
                </span>
                <span className="text-slate-400 mx-1">+</span>
                <span className="font-semibold text-slate-700">
                  {aiUsage.remainingSimulador} simuladores
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {canExport && (
              <>
                {headings?.some(h => h.text.toLowerCase().includes('reincidente')) && (
                  <button
                    onClick={() => {
                      const h = headings.find(h => h.text.toLowerCase().includes('reincidente'));
                      if (h) scrollToId(h.id);
                    }}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100/80 hover:bg-red-200 rounded-lg transition-colors border border-red-200"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Ver errores graves
                  </button>
                )}
                <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>
                <button onClick={handleCopy} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors" title="Copiar"><ClipboardCopy className="w-5 h-5" /></button>
                <button onClick={handleDownload} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors" title="Descargar MD"><Download className="w-5 h-5" /></button>
                <button onClick={handlePrintPdf} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors" title="Imprimir PDF"><Printer className="w-5 h-5" /></button>
                <button onClick={handleShareWhatsapp} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-colors" title="WhatsApp"><Share2 className="w-5 h-5" /></button>
              </>
            )}
          </div>
        </div>
      </header>


      <div className="flex-1 w-full max-w-[99%] mx-auto px-1 sm:px-2 md:px-3 lg:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8 w-full min-h-[calc(100vh-14rem)] overflow-hidden">
          {renderContent()}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pulse-highlight { 
          animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); background-color: rgba(79, 70, 229, 0.1); }
          70% { box-shadow: 0 0 0 10px rgba(79, 70, 229, 0); background-color: rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); background-color: transparent; }
        }
      `}</style>

      <AlertDialog
        open={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        title="Cuota de IA Agotada"
        message="Has agotado tu cuota diaria de análisis con IA. Ahora se utilizará el analizador local."
        type="warning"
        confirmText="Entendido"
      />
    </div >
  );
}
