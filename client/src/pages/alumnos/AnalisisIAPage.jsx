import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, Share2, Printer, ClipboardCopy, Download, ArrowLeft, Flag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'https://esm.sh/remark-gfm';
import { useAuth } from '../../context/AuthContext';

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
  const [aiUsage, setAiUsage] = useState({ count: 0, limit: 5, remaining: 5 });
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
  const AI_USAGE_KEY = 'ai_analysis_usage';
  const DAILY_LIMIT = userRole === 'asesor' || userRole === 'admin' ? 20 : 5;

  const getUsageToday = () => {
    try {
      const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
      const today = new Date().toISOString().split('T')[0];
      if (data.date !== today) {
        return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
      }
      return {
        count: data.count || 0,
        limit: DAILY_LIMIT,
        remaining: Math.max(0, DAILY_LIMIT - (data.count || 0))
      };
    } catch {
      return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
    }
  };

  const incrementUsage = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
      if (data.date !== today) {
        localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT }));
      } else {
        data.count = (data.count || 0) + 1;
        localStorage.setItem(AI_USAGE_KEY, JSON.stringify(data));
      }
      setAiUsage(getUsageToday());
    } catch (e) {
      console.error('Error incrementando uso de IA:', e);
    }
  };

  useEffect(() => {
    setAiUsage(getUsageToday());
  }, []);

  // Detectar fuente del análisis y limpiar marcadores ocultos (debe estar antes de los useEffect que lo usan)
  const sourceMatch = analysisTextState ? analysisTextState.match(/<<<AI_SOURCE:(\w+)>>>/) : null;
  const analysisSource = sourceMatch?.[1] || null;
  const cleanedAnalysisText = analysisTextState ? analysisTextState.replace(/\n*<<<AI_SOURCE:\w+>>>\s*$/, '') : analysisTextState;

  // Incrementar uso cuando se muestra un análisis exitoso de Gemini
  useEffect(() => {
    if (cleanedAnalysisText && !isLoading && !error) {
      if (analysisSource === 'GEMINI') {
        // Solo incrementar si es un análisis de Gemini (no fallback)
        incrementUsage();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanedAnalysisText, isLoading, error, analysisSource]);

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
  useEffect(() => {
    if (!cleanedAnalysisText) { setHeadings([]); return; }
    try {
      const lines = String(cleanedAnalysisText).split(/\r?\n/);
      const hs = [];
      for (const line of lines) {
        const m3 = line.match(/^###\s+(.+)/);
        if (m3) {
          const text = stripMd(m3[1]);
          hs.push({ id: slugify(text), text });
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
        <div className="bg-slate-50/60 rounded-xl animate-fade-in w-full">
          {Boolean(analysisMetaState) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5 text-[11px] sm:text-xs text-slate-700">
              <div className="bg-white border border-slate-200/80 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                <div className="font-semibold text-slate-900 mb-0.5">Intentos</div>
                <div className="leading-snug">{meta.totalIntentos ?? 'N/D'} • mejor {meta.mejorPuntaje ?? 'N/D'}% • prom {meta.promedio ?? 'N/D'}%</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                <div className="font-semibold text-slate-900 mb-0.5">Progreso</div>
                <div className="leading-snug">
                  último {meta.ultimoPuntaje ?? 'N/D'}%
                  <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold ${dLastPrev == null ? 'bg-slate-100 text-slate-500' : dLastPrev > 0 ? 'bg-emerald-100 text-emerald-700' : dLastPrev < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {dLastPrev != null ? (dLastPrev >= 0 ? '+' : '') + dLastPrev : 'N/D'} vs ant
                  </span>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                <div className="font-semibold text-slate-900 mb-0.5">Oficial</div>
                <div className="leading-snug">
                  Δ último <span className={`font-semibold ${dLastOff == null ? 'text-slate-500' : dLastOff > 0 ? 'text-emerald-700' : dLastOff < 0 ? 'text-red-700' : 'text-slate-700'}`}>{dLastOff != null ? (dLastOff >= 0 ? '+' : '') + dLastOff : 'N/D'}</span> pts • Δ mejor <span className={`font-semibold ${dBestOff == null ? 'text-slate-500' : dBestOff > 0 ? 'text-emerald-700' : dBestOff < 0 ? 'text-red-700' : 'text-slate-700'}`}>{dBestOff != null ? (dBestOff >= 0 ? '+' : '') + dBestOff : 'N/D'}</span> pts
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                <div className="font-semibold text-slate-900 mb-0.5">Señales</div>
                <div className="leading-snug">{trendLabel} • {effLabel}</div>
              </div>
            </div>
          )}
          {headings && headings.length > 0 && (
            <div className="mb-5 sm:mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Ir a sección</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
          )}
          <div
            ref={contentRef}
            className="markdown-body text-sm sm:text-base text-slate-800 pt-1"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                h3: ({ node, children, ...rest }) => {
                  try {
                    const raw = Array.isArray(children) ? children.map((c) => (typeof c === 'string' ? c : '')).join(' ') : String(children || '');
                    const id = slugify(stripMd(raw));
                    return <h3 id={id} {...rest}>{children}</h3>;
                  } catch {
                    return <h3 {...rest}>{children}</h3>;
                  }
                }
              }}
            >
              {cleanedAnalysisText}
            </ReactMarkdown>
          </div>
        </div>
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
    <div className="flex flex-col w-full min-h-full pt-14 sm:pt-16">
      {/* Barra de página: sticky debajo del header principal */}
      <header className="sticky z-20 flex-shrink-0 w-full bg-white/97 backdrop-blur-md border-b border-slate-200/80 shadow-sm" style={{ top: '3.5rem' }}>
        <div className="w-full mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between">
            {/* Izq: volver + título + meta en una línea compacta en desktop; apilado en móvil */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-1 sm:ml-0 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors flex-shrink-0 text-slate-600"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />
                  <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">Análisis con IA</h1>
                  {analysisSource === 'GEMINI' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200/80">IA activa</span>
                  )}
                  {analysisSource === 'FALLBACK' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200/80">Analizador local</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">{itemNameState || 'Evaluación'}</p>
                <div className="mt-1.5 sm:mt-1 flex items-center gap-2">
                  <span className={`text-[11px] sm:text-xs font-medium ${aiUsage.remaining <= 1 ? 'text-red-600' : aiUsage.remaining <= 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                    Análisis hoy: {aiUsage.remaining}/{aiUsage.limit}
                  </span>
                </div>
              </div>
            </div>
            {/* Der: acciones — siempre en una fila, scroll horizontal en móvil si hace falta */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 overflow-x-auto no-scrollbar py-1 sm:py-0">
              {canExport && (
                <>
                  {headings?.some(h => h.text.toLowerCase().startsWith('errores recurrentes')) && (
                    <button
                      onClick={() => scrollToId(headings.find(h => h.text.toLowerCase().startsWith('errores recurrentes')).id)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Ir a Errores recurrentes"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Errores recurrentes
                    </button>
                  )}
                  <button onClick={handleCopy} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors" title="Copiar"><ClipboardCopy className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                  <button onClick={handleDownload} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors" title="Descargar"><Download className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                  <button onClick={handlePrintPdf} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors" title="Imprimir"><Printer className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                  <button onClick={handleShareWhatsapp} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors" title="Compartir"><Share2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido: ancho completo del área útil, máx. 6xl para legibilidad */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-slate-200/60 p-4 sm:p-5 md:p-6 lg:p-8 w-full">
          {renderContent()}
        </div>
      </div>

      {/* Footer discreto */}
      <footer className="flex-shrink-0 w-full border-t border-slate-200/80 bg-slate-50/80">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4">
          <p className="text-[11px] sm:text-xs text-slate-500 text-center">
            {analysisSource === 'GEMINI' && 'Fuente: IA (Gemini) – contenido orientativo'}
            {analysisSource === 'FALLBACK' && 'Fuente: Analizador local – contenido orientativo'}
            {(!analysisSource) && 'Generado – contenido orientativo'}
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* AJUSTE 2: Estilos mejorados para Markdown - IGUALES A LA MODAL ORIGINAL
         - Se han añadido estilos más detallados para los elementos comunes de Markdown.
         - Se mejora la legibilidad con espaciado, tamaños de fuente y pesos adecuados.
        */
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
            font-weight: 700;
            margin-top: 1.25em;
            margin-bottom: 0.5em;
            color: #374151;
        }
        .markdown-body h2 {
            font-size: 1.2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #e5e7eb;
        }
        .markdown-body h3 {
            font-size: 1.1em;
        }
        .markdown-body p { 
            margin-bottom: 0.75rem; 
            line-height: 1.6;
        }
        .markdown-body p:last-child {
            margin-bottom: 0;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
          list-style-position: inside;
        }
        .markdown-body ul {
          list-style-type: disc;
        }
        .markdown-body ol {
          list-style-type: decimal;
        }
        .markdown-body li {
          margin-bottom: 0.5rem;
          padding-left: 0.2em;
        }
        .markdown-body strong {
          font-weight: 700;
          color: #6d28d9;
          background: #ede9fe;
          padding: 0 2px;
          border-radius: 2px;
        }
        .markdown-body em { 
            font-style: italic; 
        }
        .markdown-body a {
          color: #4f46e5;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .markdown-body a:hover {
          color: #4338ca;
        }
        .markdown-body code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 85%;
          font-family: 'Courier New', monospace;
        }
        .markdown-body pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .markdown-body pre code {
          background-color: transparent;
          padding: 0;
        }
        .markdown-body blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        .markdown-body th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .markdown-body hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        /* Pulse highlight when jumping to a section */
        .pulse-highlight { 
          box-shadow: 0 0 0 0 rgba(79,70,229,0.6); 
          animation: pulse 1.2s ease-out 1; 
          border-radius: 6px; 
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.6); background: rgba(99,102,241,0.08); }
          70% { box-shadow: 0 0 0 12px rgba(79,70,229,0); background: rgba(99,102,241,0.04); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); background: transparent; }
        }
      `}</style>
    </div>
  );
}
