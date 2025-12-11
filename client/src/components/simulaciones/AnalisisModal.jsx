import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Sparkles, AlertTriangle, Share2, Printer, ClipboardCopy, Download, Flag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// CORRECCIÓN: Se importa remarkGfm desde una URL de CDN para resolver el error de importación.
import remarkGfm from 'https://esm.sh/remark-gfm';
import { useAuth } from '../../context/AuthContext';

/**
 * Modal para mostrar el análisis de rendimiento generado por la IA de Gemini.
 * Props:
 * - open: boolean para mostrar/ocultar
 * - onClose: () => void, para cerrar el modal
 * - isLoading: boolean, indica si el análisis se está cargando
 * - analysisText: string, el resultado del análisis
 * - error: string, mensaje de error si la llamada falla
 * - itemName: string, nombre de la evaluación que se está analizando
 * - onRetry: () => void, función para reintentar la llamada a la API
 */
export default function AnalisisModal({ open, onClose, isLoading, analysisText, error, itemName, onRetry, analysisMeta }) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const scrollLock = useRef(false);
  const contentRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [justHighlightedId, setJustHighlightedId] = useState(null);
  const [aiUsage, setAiUsage] = useState({ count: 0, limit: 5, remaining: 5 });

  // Obtener rol del usuario
  const { user } = useAuth() || {};
  const userRole = user?.rol || user?.role || 'estudiante';

  // Helpers para tracking de uso de IA (localStorage)
  const AI_USAGE_KEY = 'ai_analysis_usage';
  // Límites por rol: Asesores tienen más intentos porque generan preguntas y fórmulas
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


  // Helpers para exportar un Markdown 
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

  const buildExportMarkdown = (md, name, meta) => {
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

  // Construye un resumen breve y amigable para compartir en WhatsApp
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

  // Cargar uso al abrir el modal
  useEffect(() => {
    if (open) {
      setAiUsage(getUsageToday());
    }
  }, [open]);

  // Efecto para manejar el foco y el cierre con 'Escape'
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      previousFocusRef.current = document.activeElement;
      closeButtonRef.current?.focus();
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  // Bloquear el scroll del fondo mientras el modal está abierto
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

  // Incrementar uso cuando se muestra un análisis exitoso de Gemini
  useEffect(() => {
    if (open && analysisText && !isLoading && !error) {
      const sourceMatch = analysisText ? analysisText.match(/<<<AI_SOURCE:(\w+)>>>/) : null;
      const source = sourceMatch?.[1] || null;
      if (source === 'GEMINI') {
        // Solo incrementar si es un análisis de Gemini (no fallback)
        incrementUsage();
      }
    }
  }, [analysisText, isLoading, error]);


  // Detectar fuente del análisis y limpiar marcadores ocultos
  const sourceMatch = analysisText ? analysisText.match(/<<<AI_SOURCE:(\w+)>>>/) : null;
  const analysisSource = sourceMatch?.[1] || null; // 'GEMINI' | 'FALLBACK' | null
  const cleanedAnalysisText = analysisText ? analysisText.replace(/\n*<<<AI_SOURCE:\w+>>>\s*$/, '') : analysisText;

  const canExport = !!cleanedAnalysisText && !isLoading && !error;
  // Construir TOC de forma reactiva cuando cambia el contenido
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

  // Smooth scroll to section inside modal content
  const scrollToId = (id) => {
    try {
      const container = contentRef.current;
      if (!container) return;
      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (!el) return;
      const top = el.offsetTop - 8;
      container.scrollTo({ top, behavior: 'smooth' });
      // flash highlight
      el.classList.add('pulse-highlight');
      setJustHighlightedId(id);
      setTimeout(() => { el.classList.remove('pulse-highlight'); setJustHighlightedId(null); }, 1200);
    } catch { }
  };
  const handleCopy = async () => {
    try {
      if (!canExport) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemName, analysisMeta);
      await navigator.clipboard.writeText(enriched);
    } catch (e) {
      console.warn('No se pudo copiar el análisis al portapapeles:', e);
    }
  };
  const handleShareWhatsapp = () => {
    try {
      if (!canExport) return;
      const resumen = buildShareSummary(itemName, analysisMeta);
      const url = `https://wa.me/?text=${encodeURIComponent(resumen)}`;
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      console.warn('No se pudo abrir WhatsApp:', e);
    }
  };
  const handlePrintPdf = () => {
    try {
      if (!canExport) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemName, analysisMeta);
      const w = window.open('', '_blank');
      if (!w) return;
      const now = new Date().toLocaleString('es-ES');
      // Serializamos el Markdown para insertarlo seguro dentro del <script>
      const mdSerialized = JSON.stringify(enriched);
      // HTML con conversión Markdown -> HTML y estilos tipo GitHub
      w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informe - ${itemName || 'Evaluación'}</title>
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
    /* Evitar cortes feos */
    h2, h3 { break-after: avoid-page; }
    table, pre, blockquote { break-inside: avoid; }
    /* Mostrar URL tras enlaces al imprimir (útil en PDF) */
    @media print {
      a[href^="http"]::after { content: " (" attr(href) ")"; color:#6b7280; font-size: 0.85em; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    window.addEventListener('load', () => {
      try {
        const md = ${mdSerialized}.replace(/^---[\s\S]*?---\s*/,''); // remover front matter
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
      console.warn('No se pudo preparar la impresión/descarga PDF:', e);
    }
  };
  // Keyboard shortcuts while modal is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (!(e.ctrlKey && e.shiftKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'c') { e.preventDefault(); handleCopy(); }
      else if (k === 'd') { e.preventDefault(); handleDownload(); }
      else if (k === 'p') { e.preventDefault(); handlePrintPdf(); }
      else if (k === 'w') { e.preventDefault(); handleShareWhatsapp(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, canExport, cleanedAnalysisText, analysisMeta]);
  const handleDownload = () => {
    try {
      if (!canExport) return;
      const enriched = buildExportMarkdown(cleanedAnalysisText, itemName, analysisMeta);
      const blob = new Blob([enriched], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (itemName || 'analisis').replace(/[^\w\-]+/g, '_').slice(0, 48);
      const ts = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const stamp = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}`;
      a.download = `${safeName || 'analisis'}-${stamp}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('No se pudo descargar el análisis:', e);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12 flex flex-col items-center justify-center text-gray-600 min-h-[200px]">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold">Analizando tu rendimiento...</p>
          <p className="text-sm text-gray-500">La IA está preparando tus consejos.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-12 flex flex-col items-center justify-center text-red-700 bg-red-50 rounded-lg min-h-[200px]">
          <AlertTriangle className="h-10 w-10 mb-4" />
          <p className="font-semibold">Error al generar el análisis</p>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    if (cleanedAnalysisText) {
      const meta = analysisMeta || {};
      // Construir mini banda de métricas visible
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
        <div className="bg-purple-50/50 p-0 rounded-lg animate-fade-in">
          {Boolean(analysisMeta) && (
            <div className="mx-0 sm:mx-2 md:mx-4 mt-2 sm:mt-3 mb-1 grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-gray-700">
              <div className="bg-white/70 border border-gray-200 rounded-md px-2 py-1.5">
                <div className="font-semibold text-gray-900">Intentos</div>
                <div>{meta.totalIntentos ?? 'N/D'} • mejor {meta.mejorPuntaje ?? 'N/D'}% • prom {meta.promedio ?? 'N/D'}%</div>
              </div>
              <div className="bg-white/70 border border-gray-200 rounded-md px-2 py-1.5">
                <div className="font-semibold text-gray-900">Progreso</div>
                <div>
                  último {meta.ultimoPuntaje ?? 'N/D'}%
                  <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${dLastPrev == null ? 'bg-gray-100 text-gray-500' : dLastPrev > 0 ? 'bg-green-100 text-green-700' : dLastPrev < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {dLastPrev != null ? (dLastPrev >= 0 ? '+' : '') + dLastPrev : 'N/D'} vs ant
                  </span>
                </div>
              </div>
              <div className="bg-white/70 border border-gray-200 rounded-md px-2 py-1.5">
                <div className="font-semibold text-gray-900">Oficial</div>
                <div>
                  Δ último <span className={`${dLastOff == null ? 'text-gray-500' : dLastOff > 0 ? 'text-green-700' : dLastOff < 0 ? 'text-red-700' : 'text-gray-700'} font-semibold`}>{dLastOff != null ? (dLastOff >= 0 ? '+' : '') + dLastOff : 'N/D'}</span> pts •
                  {' '}Δ mejor <span className={`${dBestOff == null ? 'text-gray-500' : dBestOff > 0 ? 'text-green-700' : dBestOff < 0 ? 'text-red-700' : 'text-gray-700'} font-semibold`}>{dBestOff != null ? (dBestOff >= 0 ? '+' : '') + dBestOff : 'N/D'}</span> pts
                </div>
              </div>
              <div className="bg-white/70 border border-gray-200 rounded-md px-2 py-1.5">
                <div className="font-semibold text-gray-900">Señales</div>
                <div>{trendLabel} • {effLabel}</div>
              </div>
            </div>
          )}
          {/* Mini TOC chips */}
          {headings && headings.length > 0 && (
            <div className="px-0 sm:px-2 md:px-4 mt-1 mb-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-max">
                {headings.map(h => (
                  <button key={h.id} onClick={() => scrollToId(h.id)} className={`px-2 py-1 rounded-full text-[11px] border transition-colors whitespace-nowrap ${justHighlightedId === h.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-indigo-50 text-gray-700 border-gray-200'}`}>{h.text}</button>
                ))}
              </div>
            </div>
          )}
          {/* Contenido scrollable y con formato markdown */}
          <div
            ref={contentRef}
            className="markdown-body text-sm sm:text-base text-gray-800 px-0 sm:px-2 md:px-4 py-2 sm:py-3"
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
    return null;
  };

  // Importante: retorno temprano fuera de hooks para no romper su orden
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 pt-safe pb-safe overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analisis-modal-title"
    >
      {/* AJUSTE 1: Estructura de Modal con Flexbox para controlar el scroll.
        - `flex flex-col`: Convierte el modal en un contenedor de columna flexible.
        - `max-h-[90vh]`: Limita la altura máxima del modal al 90% de la altura de la ventana.
        - El encabezado y el pie de página tienen `flex-shrink-0` para mantener su tamaño.
        - El div del contenido (`overflow-y-auto`) crecerá para llenar el espacio y mostrará una barra de scroll cuando sea necesario.
      */}
      <div className="analisis-modal no-scrollbar bg-white/98 rounded-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl ring-1 ring-black/5 w-full h-full sm:h-auto sm:max-w-lg overflow-hidden transform transition-all animate-scale-in flex flex-col">
        {/* Encabezado del Modal */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center min-w-0">
            <Sparkles className="w-6 h-6 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <h2 id="analisis-modal-title" className="text-lg font-bold">Análisis con IA</h2>
              <p className="text-sm text-indigo-100 truncate flex items-center gap-2">
                <span className="truncate">{itemName}</span>
                {analysisSource === 'GEMINI' && (<span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-400/20 text-emerald-100 border border-emerald-300/40">IA activa</span>)}
                {analysisSource === 'FALLBACK' && (<span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-400/20 text-yellow-100 border border-yellow-300/40">Analizador local</span>)}
              </p>
              {/* Indicador de uso de IA */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
                  <span className="text-white/90">Análisis hoy:</span>
                  <span className={`font-bold ${aiUsage.remaining <= 1 ? 'text-red-300' : aiUsage.remaining <= 2 ? 'text-yellow-300' : 'text-emerald-300'}`}>
                    {aiUsage.remaining}/{aiUsage.limit}
                  </span>
                </div>
                {aiUsage.remaining === 0 && (
                  <span className="text-red-200 text-[10px] animate-pulse">
                    ⚠️ Límite alcanzado
                  </span>
                )}
                {aiUsage.remaining === 1 && (
                  <span className="text-yellow-200 text-[10px]">
                    ⚡ Último intento
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Cerrar modal de análisis"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Contenido del Modal (con scroll solo en el área de texto) */}
        <div className="am-content p-3 sm:p-4 md:p-6 flex-1 min-h-0 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Pie del Modal */}
        <div className="am-footer bg-gray-50 px-2 sm:px-3 py-2 flex items-center justify-between gap-1 sm:gap-2 border-t flex-shrink-0">
          <div className="text-[11px] text-gray-500 hidden sm:block">
            {analysisSource === 'GEMINI' && 'Fuente: IA (Gemini) – contenido orientativo'}
            {analysisSource === 'FALLBACK' && 'Fuente: Analizador local – contenido orientativo'}
            {(!analysisSource) && 'Generado – contenido orientativo'}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {headings.some(h => h.text.toLowerCase().startsWith('errores recurrentes')) && (
              <button
                onClick={() => scrollToId(headings.find(h => h.text.toLowerCase().startsWith('errores recurrentes')).id)}
                aria-label="Ir a Errores recurrentes"
                title="Ir a Errores recurrentes"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-purple-600/20 border border-purple-300/50 text-white rounded-full hover:bg-purple-600/30"
              >
                <Flag className="w-3.5 h-3.5" />
                Errores recurrentes
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!canExport}
              aria-label="Copiar resumen"
              title="Copiar resumen"
              className="w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ClipboardCopy className="w-4 h-4" />
              <span className="sr-only">Copiar resumen</span>
            </button>
            <button
              onClick={handleShareWhatsapp}
              disabled={!canExport}
              aria-label="Compartir por WhatsApp"
              title="Compartir por WhatsApp"
              className="w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
              <span className="sr-only">WhatsApp</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!canExport}
              aria-label="Descargar .md"
              title="Descargar .md"
              className="w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Download className="w-4 h-4" />
              <span className="sr-only">Descargar .md</span>
            </button>
            <button
              onClick={handlePrintPdf}
              disabled={!canExport}
              aria-label="Guardar PDF"
              title="Guardar PDF"
              className="w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Printer className="w-4 h-4" />
              <span className="sr-only">Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        /* Safe areas + dvh para altura confiable y estable (base móvil) */
        @media (min-width: 640px) {
          .analisis-modal { max-height: calc(86svh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); }
          @supports (height: 100dvh) {
            .analisis-modal { max-height: calc(86dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); }
          }
        }
        /* Scroll suave en el contenido y control de barras */
        .analisis-modal { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
        .am-content { -ms-overflow-style: none; scrollbar-width: none; }
        .am-content::-webkit-scrollbar { width: 0; height: 0; display: none; }
        @media (min-width: 640px) {
          .analisis-modal { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,.25) transparent; }
          .analisis-modal::-webkit-scrollbar { width: 8px; height: 8px; }
          .analisis-modal::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,.25); border-radius: 9999px; }
          .analisis-modal::-webkit-scrollbar-track { background: transparent; }
        }
        @media (max-width: 639.98px) {
          .analisis-modal { -ms-overflow-style: none; scrollbar-width: none; }
          .analisis-modal::-webkit-scrollbar { display: none; width: 0; height: 0; }
        }
        
        /* iPad / tablets: desplaza el modal hacia la derecha como en HistorialModal */
        @media (min-width: 640px) and (max-width: 900px) { /* iPad portrait */
          .analisis-modal { margin-left: clamp(48px, 8vw, 120px); }
        }
        @media (min-width: 901px) and (max-width: 1180px) { /* iPad landscape */
          .analisis-modal { margin-left: clamp(40px, 6vw, 100px); }
        }
        @media (max-width: 639.98px) { /* móviles: centrado y compacto */
          .analisis-modal { margin-left: 0; width: 100vw; max-width: 100vw; height: 100vh; max-height: 100vh; margin-top: 0; border-radius: 0; }
          .analisis-modal .markdown-body h2 { font-size: 1.05rem; }
          .analisis-modal .markdown-body h3 { font-size: 1rem; }
          .analisis-modal .markdown-body p { font-size: 0.95rem; }
        }
  /* Bajar el modal en tablets/desktop para alinearlo con HistorialModal */
  @media (min-width: 640px) { .analisis-modal { margin-top: clamp(20px, 5vh, 64px); } }
  @media (min-width: 1024px) { .analisis-modal { margin-top: clamp(28px, 7vh, 84px); } }
  @media (min-width: 1280px) { .analisis-modal { margin-top: clamp(36px, 8vh, 96px); } }
  @media (min-width: 1536px) { .analisis-modal { margin-top: clamp(44px, 10vh, 112px); } }

        /* Forzar que sea más corta en tablets y desktop: altura fija con scroll interno */
        @media (min-width: 640px) and (max-width: 1023.98px) {
          .analisis-modal { height: clamp(480px, 54svh, 660px); }
          @supports (height: 100dvh) { .analisis-modal { height: clamp(480px, 54dvh, 660px); } }
        }
        @media (min-width: 1024px) {
          .analisis-modal { height: clamp(460px, 52svh, 620px); }
          @supports (height: 100dvh) { .analisis-modal { height: clamp(460px, 52dvh, 620px); } }
        }

        /* AJUSTE 2: Estilos mejorados para Markdown.
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
        /* Pulse highlight when jumping to a section */
        .pulse-highlight { box-shadow: 0 0 0 0 rgba(79,70,229,0.6); animation: pulse 1.2s ease-out 1; border-radius: 6px; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.6); background: rgba(99,102,241,0.08); }
          70% { box-shadow: 0 0 0 12px rgba(79,70,229,0); background: rgba(99,102,241,0.04); }
          100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); background: transparent; }
        }
      `}</style>
    </div>
  );
}

