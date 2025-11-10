import React from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// Intento de worker opcional (evitar fallos en bundlers). Si no está disponible, desactivamos worker.
let __pdfWorkerInstance = null;
try {
  // Vite puede no resolver ?worker para dependencias; envolvemos en try dinámico.
  // eslint-disable-next-line no-undef
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
    <div className="w-full flex flex-col items-stretch">
      <div ref={containerRef} className="w-full bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Cargando PDF…</div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="w-full overflow-auto" style={{ maxHeight: '60vh' }}>
            <canvas ref={canvasRef} className="block mx-auto" style={{ background: 'white' }} />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button onClick={prev} disabled={page <= 1} className={`px-3 py-1 rounded-md text-xs border ${page <= 1 ? 'text-gray-400 border-gray-200' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}>Anterior</button>
          <button onClick={next} disabled={page >= (numPages||1)} className={`px-3 py-1 rounded-md text-xs border ${(page >= (numPages||1)) ? 'text-gray-400 border-gray-200' : 'text-purple-700 border-purple-300 hover:bg-purple-50'}`}>Siguiente</button>
        </div>
        <div className="text-[11px] text-gray-600">Página {page} de {numPages || 1}</div>
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="px-2 py-1 rounded-md text-xs border text-purple-700 border-purple-300 hover:bg-purple-50">-</button>
          <button onClick={zoomIn} className="px-2 py-1 rounded-md text-xs border text-purple-700 border-purple-300 hover:bg-purple-50">+</button>
        </div>
      </div>
    </div>
  );
}
