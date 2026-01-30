import React from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// Intento de worker opcional (evitar fallos en bundlers). Si no está disponible, desactivamos worker.
let __pdfWorkerInstance = null;
try {
  // Vite puede no resolver ?worker para dependencias; envolvemos en try dinámico.
   
  const WorkerCtor = null; // placeholder para evitar bundling de import fallido
  if (WorkerCtor) {
    __pdfWorkerInstance = new WorkerCtor();
    GlobalWorkerOptions.workerPort = __pdfWorkerInstance;
  }
} catch {}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function PdfMobileViewer({ url, initialPage = 1, enableGestures = false }) {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const docRef = React.useRef(null);
  const [doc, setDoc] = React.useState(null);
  const [page, setPage] = React.useState(initialPage);
  const [numPages, setNumPages] = React.useState(0);
  const [scale, setScale] = React.useState(1.1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Cargar documento
  React.useEffect(() => {
    if (!url) { setDoc(null); setNumPages(0); return; }
    let cancelled = false;
    let localTask = null;
    (async () => {
      try {
        // Destruir doc anterior antes de cargar uno nuevo
        if (docRef.current) {
          try { await docRef.current.destroy(); } catch {}
          if (cancelled) return;
          docRef.current = null;
          setDoc(null);
        }
        setLoading(true); setError('');
        const opts = { url };
        if (!__pdfWorkerInstance) opts.disableWorker = true;
        localTask = getDocument(opts);
        const pdf = await localTask.promise;
        if (cancelled) return;
        docRef.current = pdf;
        setDoc(pdf);
        setNumPages(pdf.numPages || 0);
        setPage(clamp(initialPage, 1, pdf.numPages || 1));
      } catch (e) {
        if (!cancelled) setError('No se pudo cargar el PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      try { localTask?.destroy?.(); } catch {}
    };
  }, [url]);

  // Renderizar página
  const renderPage = React.useCallback(async () => {
    try {
      if (!doc || !canvasRef.current) return;
      const p = await doc.getPage(page);
      const viewport = p.getViewport({ scale: clamp(scale, 0.5, 3) });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      // Limpiar
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const renderTask = p.render({ canvasContext: ctx, viewport });
      await renderTask.promise;
    } catch (e) {
      // Silencioso; mostramos error general si cargar falla
    }
  }, [doc, page, scale]);

  React.useEffect(() => { renderPage(); }, [renderPage]);

  const zoomIn = () => setScale(s => clamp(Number(s) + 0.2, 0.5, 3));
  const zoomOut = () => setScale(s => clamp(Number(s) - 0.2, 0.5, 3));
  const prev = () => setPage(p => clamp(p - 1, 1, numPages || 1));
  const next = () => setPage(p => clamp(p + 1, 1, numPages || 1));

  // Gestos táctiles (swipe izquierda/derecha para navegar)
  React.useEffect(() => {
    if (!enableGestures) return;
    const el = containerRef.current;
    if (!el) return;
    let startX = 0, startY = 0, moved = false;
    const onStart = (e) => { const t = e.touches?.[0]; if (!t) return; startX = t.clientX; startY = t.clientY; moved = false; };
    const onMove = (e) => { moved = true; };
    const onEnd = (e) => {
      if (!moved) return;
      const t = e.changedTouches?.[0]; if (!t) return;
      const dx = t.clientX - startX; const dy = t.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 40) {
        if (dx < 0) next(); else prev();
      }
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [enableGestures, next, prev]);

  return (
    <div className="w-full h-full flex flex-col items-stretch flex-1 min-h-0">
      <div ref={containerRef} className="w-full flex-1 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Cargando PDF…</div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm font-medium">{error}</div>
        ) : (
          <div className="flex-1 w-full overflow-auto min-h-0" style={{ maxHeight: 'none' }}>
            <canvas ref={canvasRef} className="block mx-auto" style={{ background: 'white', maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap px-1">
        <div className="flex items-center gap-1">
          <button 
            onClick={prev} 
            disabled={page <= 1} 
            className={`p-2 rounded-md border transition-colors flex items-center justify-center ${page <= 1 ? 'text-gray-400 border-gray-200 bg-gray-50' : 'text-purple-700 border-purple-300 hover:bg-purple-50 bg-white'}`}
            aria-label="Página anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={next} 
            disabled={page >= (numPages||1)} 
            className={`p-2 rounded-md border transition-colors flex items-center justify-center ${(page >= (numPages||1)) ? 'text-gray-400 border-gray-200 bg-gray-50' : 'text-purple-700 border-purple-300 hover:bg-purple-50 bg-white'}`}
            aria-label="Página siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="text-xs text-gray-600 font-medium">Página {page} de {numPages || 1}</div>
        <div className="flex items-center gap-1">
          <button 
            onClick={zoomOut} 
            className="p-2 rounded-md border text-purple-700 border-purple-300 hover:bg-purple-50 bg-white transition-colors flex items-center justify-center"
            aria-label="Alejar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button 
            onClick={zoomIn} 
            className="p-2 rounded-md border text-purple-700 border-purple-300 hover:bg-purple-50 bg-white transition-colors flex items-center justify-center"
            aria-label="Acercar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
