import React, { useState, useEffect, useMemo } from 'react';
import { Download, Eye, Search, FileText, File, Video, Image, Archive, X, Loader2, GraduationCap, Link as LinkIcon, Presentation, FileType } from 'lucide-react';
import { listRecursosAsesor, downloadRecursoAsesor } from '../../api/recursos.js';
import { buildStaticUrl } from '../../utils/url.js';

// Iconos según tipo de archivo - Tamaños responsivos
const getFileIcon = (type) => {
  if (type === 'PDF') return <FileText className="size-7 sm:size-8 text-red-500" />;
  if (type === 'VIDEO') return <Video className="size-7 sm:size-8 text-purple-500" />;
  if (type === 'IMAGE') return <Image className="size-7 sm:size-8 text-green-500" />;
  if (type === 'ZIP') return <Archive className="size-7 sm:size-8 text-amber-500" />;
  if (type === 'DOC') return <FileType className="size-7 sm:size-8 text-blue-500" />;
  if (type === 'PPT') return <Presentation className="size-7 sm:size-8 text-orange-500" />;
  if (type === 'XLS') return <FileText className="size-7 sm:size-8 text-green-600" />;
  if (type === 'LINK') return <LinkIcon className="size-7 sm:size-8 text-indigo-500" />;
  return <File className="size-7 sm:size-8 text-slate-500" />;
};

// Colores según tipo - solo bordes, fondo siempre blanco
const getFileBorderColor = (type) => {
  if (type === 'PDF') return 'border-red-300';
  if (type === 'VIDEO') return 'border-purple-300';
  if (type === 'IMAGE') return 'border-green-300';
  if (type === 'ZIP') return 'border-amber-300';
  if (type === 'DOC') return 'border-blue-300';
  if (type === 'PPT') return 'border-orange-300';
  if (type === 'XLS') return 'border-green-400';
  if (type === 'LINK') return 'border-indigo-300';
  return 'border-slate-300';
};

// Helper para construir URL de archivo
const buildFileUrl = (resource) => {
  if (resource.file_url) {
    return resource.file_url;
  }

  const path = resource.file_path;
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  let normalized = path.replace(/\\/g, '/');
  const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
  if (match) {
    return `/uploads/recursos-educativos/${match[1]}`;
  }

  if (normalized.startsWith('/uploads/recursos-educativos/')) {
    return normalized;
  }

  if (!normalized.includes('/')) {
    return `/uploads/recursos-educativos/${normalized}`;
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

// Helper para extraer ID de video de YouTube
const getYouTubeVideoId = (url) => {
  if (!url) return null;

  // Diferentes formatos de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Helper para verificar si es un enlace de YouTube
const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
};

export default function Recursos_Alumno_comp() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [preview, setPreview] = useState(null);

  // Cargar recursos del asesor
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await listRecursosAsesor();
        if (!alive) return;
        setResources(data?.data || []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando recursos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Filtrar recursos
  const filtered = useMemo(() => {
    let list = resources;

    // Filtro por texto
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r => {
        const title = (r.title || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const tags = (r.tags || []).join(' ').toLowerCase();
        return title.includes(q) || desc.includes(q) || tags.includes(q);
      });
    }

    // Filtro por tipo
    if (filterType !== 'ALL') {
      list = list.filter(r => r.file_type_display === filterType);
    }

    return list;
  }, [resources, query, filterType]);

  // Descargar recurso o abrir enlace
  const handleDownload = async (id, fileName, resourceType, linkUrl) => {
    try {
      // Si es un enlace, abrirlo en nueva pestaña
      if (resourceType === 'link' && linkUrl) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Si es un archivo, descargarlo
      const response = await downloadRecursoAsesor(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error descargando archivo');
    }
  };

  // Abrir preview
  const openPreview = (resource) => {
    setPreview(resource);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Header - Optimizado para móviles */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg sm:shadow-xl ring-2 ring-violet-200 shrink-0">
              <GraduationCap className="size-6 sm:size-8 md:size-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '2px' }}>
                  Recursos del Asesor
                </span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium hidden sm:block">
                Materiales educativos compartidos por tu asesor — visualiza y descarga los recursos disponibles.
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-3 shadow-md ring-2 ring-red-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
              <X className="size-4" />
            </div>
            <span className="font-bold flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Buscador y filtros - Optimizado para móviles */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Buscador */}
            <div className="flex items-center gap-2 sm:gap-3 w-full border-2 border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/30 transition-all shadow-sm">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shrink-0">
                <Search className="size-4 sm:size-5" />
              </div>
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none text-sm sm:text-base text-slate-700 placeholder-slate-400 font-medium min-w-0"
              />
            </div>

            {/* Filtros y contador en fila para móviles */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-slate-200 bg-white text-sm sm:text-base text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm font-medium"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="PDF">PDF</option>
                <option value="DOC">Word</option>
                <option value="PPT">PowerPoint</option>
                <option value="XLS">Excel</option>
                <option value="VIDEO">Video</option>
                <option value="IMAGE">Imagen</option>
                <option value="ZIP">Archivo comprimido</option>
                <option value="LINK">Enlace</option>
                <option value="FILE">Otros</option>
              </select>

              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-md ring-2 ring-violet-200 text-center sm:text-left">
                {filtered.length} {filtered.length === 1 ? 'recurso' : 'recursos'}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de recursos */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50 px-4">
            <div className="inline-flex p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-violet-200 mb-3 sm:mb-4">
              <FileText className="size-12 sm:size-16" />
            </div>
            <p className="text-slate-600 font-bold text-base sm:text-lg mb-2">
              {query || filterType !== 'ALL' ? 'No se encontraron recursos' : 'No hay recursos disponibles'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {query || filterType !== 'ALL'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Tu asesor aún no ha compartido recursos contigo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filtered.map(r => (
              <div
                key={r.id}
                className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-200 border-2 ${getFileBorderColor(r.file_type_display)} active:scale-[0.98] sm:hover:-translate-y-1 ring-2 ring-slate-100/50`}
              >
                {/* Header de la tarjeta - Optimizado para móviles */}
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Icono más grande en móviles */}
                  <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white flex items-center justify-center border-2 ${getFileBorderColor(r.file_type_display)}`}>
                    {getFileIcon(r.file_type_display)}
                  </div>

                  {/* Título y tipo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold sm:font-semibold text-sm sm:text-base text-slate-800 line-clamp-2 mb-1" title={r.title}>
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {r.file_type_display} {r.file_size_mb ? `• ${r.file_size_mb} MB` : r.resource_type === 'link' ? '• Enlace externo' : ''}
                    </p>
                  </div>
                </div>

                {/* Descripción - Solo en pantallas más grandes */}
                {r.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mb-3 line-clamp-2 hidden sm:block">{r.description}</p>
                )}

                {/* Tags - Optimizado para móviles */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags && r.tags.length > 0 ? (
                      r.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700 border border-violet-200 font-medium"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin etiquetas</span>
                    )}
                  </div>
                </div>

                {/* Botones de acción - Más grandes y accesibles en móviles */}
                <div className="flex gap-2 sm:gap-2.5 mb-3 sm:mb-0">
                  <button
                    onClick={() => openPreview(r)}
                    className="flex-1 sm:flex-none px-4 sm:px-3 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-violet-50 hover:bg-violet-100 active:bg-violet-200 text-violet-700 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 sm:gap-1.5"
                    title="Vista previa"
                  >
                    <Eye className="size-4 sm:size-4" />
                    <span className="sm:hidden">Vista previa</span>
                  </button>
                  <button
                    onClick={() => handleDownload(r.id, r.file_name, r.resource_type, r.link_url)}
                    className="flex-1 sm:flex-none px-4 sm:px-3 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 sm:gap-1.5"
                    title={r.resource_type === 'link' ? 'Abrir enlace' : 'Descargar'}
                  >
                    {r.resource_type === 'link' ? (
                      <>
                        <LinkIcon className="size-4 sm:size-4" />
                        <span className="sm:hidden">Abrir</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-4 sm:size-4" />
                        <span className="sm:hidden">Descargar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer - Más compacto en móviles */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate mr-2">{new Date(r.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  <span className="shrink-0">#{r.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de preview - Compacto y optimizado */}
        {preview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreview(null)}>
            <div className="bg-white rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-xl sm:max-h-[80vh] sm:mt-12 shadow-2xl flex flex-col border-0 sm:border-2 border-slate-200 ring-0 sm:ring-2 ring-violet-100 animate-in zoom-in-95 duration-200 relative overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Botón de cerrar adicional - Solo visible en móvil */}
              <button
                onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                className="fixed top-3 left-3 sm:hidden z-[9999] rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-white"
                aria-label="Cerrar modal"
                title="Cerrar"
                style={{
                  width: '56px',
                  height: '56px',
                  minWidth: '56px',
                  minHeight: '56px',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.9)'
                }}
              >
                <X className="size-10 font-extrabold" strokeWidth={4} />
              </button>
              {/* Header del modal - Compacto */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shrink-0 shadow-md">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm sm:text-base font-bold truncate">{preview.title}</h3>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {preview.file_type_display} {preview.file_size_mb ? `• ${preview.file_size_mb} MB` : preview.resource_type === 'link' ? '• Enlace externo' : ''}
                  </p>
                </div>

                {/* Botón de cerrar - Estilo transparente limpio */}
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                  className="p-2.5 sm:p-2 rounded-xl sm:rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm text-white transition-all duration-200 shrink-0 ml-2 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center border border-white/20"
                  aria-label="Cerrar"
                  title="Cerrar"
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <X className="size-6 sm:size-5 font-bold" strokeWidth={2.5} />
                </button>
              </div>

              {/* Contenido del preview - Compacto */}
              <div className="flex-1 overflow-y-auto px-0 sm:px-4 py-3 sm:py-4 bg-white">
                {preview.resource_type === 'link' ? (
                  isYouTubeUrl(preview.link_url) ? (
                    <div className="w-full max-w-full flex flex-col items-center">
                      {/* Contenedor del video con aspect ratio 16:9 */}
                      <div className="relative w-full bg-black rounded-none sm:rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(preview.link_url)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                          title={preview.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox"
                          className="absolute top-0 left-0 w-full h-full border-0"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      {/* Mensaje de ayuda si el video no carga */}
                      <div className="mt-2 px-3 sm:px-0 text-center">
                        <p className="text-xs text-slate-500">
                          ¿No se reproduce el video? Usa el botón "Ver en YouTube" abajo
                        </p>
                      </div>
                      {/* Botones de acción - Más compactos en móvil */}
                      <div className="mt-2 sm:mt-4 px-3 sm:px-0 pb-2 sm:pb-0 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-center w-full sm:w-auto">
                        {/* Botón para abrir en YouTube */}
                        <a
                          href={preview.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span>Ver en YouTube</span>
                        </a>
                        {/* Botón de descargar/abrir */}
                        <button
                          onClick={() => handleDownload(preview.id, preview.file_name, preview.resource_type, preview.link_url)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                        >
                          {preview.resource_type === 'link' ? (
                            <>
                              <LinkIcon className="size-3.5 sm:size-4" />
                              <span>Abrir enlace</span>
                            </>
                          ) : (
                            <>
                              <Download className="size-3.5 sm:size-4" />
                              <span>Descargar</span>
                            </>
                          )}
                        </button>
                      </div>
                      {/* Botón de cerrar - Más pequeño y discreto en móvil */}
                      <div className="mt-2 sm:hidden px-3 pb-2 flex justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md active:scale-95"
                          aria-label="Cerrar modal"
                          title="Cerrar"
                        >
                          <X className="size-3.5" strokeWidth={2.5} />
                          <span>CERRAR</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                      <LinkIcon className="size-12 mb-3 text-indigo-500" />
                      <p className="text-base font-medium mb-2">Enlace externo</p>
                      <a
                        href={preview.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline break-all text-sm max-w-full px-4 text-center"
                      >
                        {preview.link_url}
                      </a>
                      <button
                        onClick={() => window.open(preview.link_url, '_blank', 'noopener,noreferrer')}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Abrir enlace
                      </button>
                    </div>
                  )
                ) : preview.file_type_display === 'PDF' ? (
                  <div className="flex flex-col items-center">
                    <iframe
                      src={buildFileUrl(preview)}
                      className="w-full h-full min-h-[300px] sm:min-h-[400px] max-h-[50vh] sm:max-h-[60vh] rounded-lg border-2 border-slate-200"
                      title={preview.title}
                    />
                    <div className="mt-3 text-center">
                      <p className="text-xs text-slate-500 mb-2">
                        ¿No se visualiza el PDF? Descárgalo o ábrelo en una nueva pestaña
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDownload(preview.id, preview.file_name, preview.resource_type, preview.link_url)}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Descargar PDF
                        </button>
                        <a
                          href={buildFileUrl(preview)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Abrir en nueva pestaña
                        </a>
                      </div>
                    </div>
                  </div>
                ) : preview.file_type_display === 'VIDEO' ? (
                  <video
                    src={buildFileUrl(preview)}
                    controls
                    className="w-full max-h-[50vh] sm:max-h-[60vh] rounded-lg border-2 border-slate-200"
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : preview.file_type_display === 'IMAGE' ? (
                  <div className="flex items-center justify-center max-h-[50vh] sm:max-h-[60vh] overflow-auto">
                    <img
                      src={buildFileUrl(preview)}
                      alt={preview.title}
                      className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg border-2 border-slate-200 shadow-lg"
                      onError={(e) => {
                        const path = preview.file_path;
                        if (!path) return;

                        const normalizedPath = path.replace(/\\/g, '/');
                        const fileNameMatch = normalizedPath.match(/([^\/]+)$/);
                        const fileName = fileNameMatch ? fileNameMatch[1] : null;

                        const variants = [
                          fileName ? `/uploads/recursos-educativos/${fileName}` : null,
                          normalizedPath.includes('recursos-educativos')
                            ? `/uploads/recursos-educativos/${normalizedPath.split('recursos-educativos/').pop()}`
                            : null,
                          buildStaticUrl(normalizedPath),
                          normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`,
                        ].filter(Boolean);

                        for (const variant of variants) {
                          if (variant && variant !== e.target.src) {
                            e.target.src = variant;
                            break;
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <FileText className="size-12 mb-3" />
                    <p className="text-base font-medium">Vista previa no disponible</p>
                    <p className="text-sm">Descarga el archivo para verlo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

