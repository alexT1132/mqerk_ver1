import React, { useState, useEffect, useMemo } from 'react';
import { Download, Eye, Search, FileText, File, Video, Image, Archive, X, Loader2, GraduationCap } from 'lucide-react';
import { listRecursosAsesor, downloadRecursoAsesor } from '../../api/recursos.js';
import { buildStaticUrl } from '../../utils/url.js';

// Iconos según tipo de archivo
const getFileIcon = (type) => {
  if (type === 'PDF') return <FileText className="size-8 text-red-500" />;
  if (type === 'VIDEO') return <Video className="size-8 text-purple-500" />;
  if (type === 'IMAGE') return <Image className="size-8 text-green-500" />;
  if (type === 'ZIP') return <Archive className="size-8 text-amber-500" />;
  return <File className="size-8 text-slate-500" />;
};

// Colores según tipo - solo bordes, fondo siempre blanco
const getFileBorderColor = (type) => {
  if (type === 'PDF') return 'border-red-300';
  if (type === 'VIDEO') return 'border-purple-300';
  if (type === 'IMAGE') return 'border-green-300';
  if (type === 'ZIP') return 'border-amber-300';
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

  // Descargar recurso
  const handleDownload = async (id, fileName) => {
    try {
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
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <GraduationCap className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '2px' }}>
                  Recursos del Asesor
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
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

        {/* Buscador y filtros */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-3 flex-1 w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/30 transition-all shadow-sm hover:shadow-md">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                <Search className="size-4" />
              </div>
              <input
                type="text"
                placeholder="Buscar por título, etiqueta o palabra clave"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none text-slate-700 placeholder-slate-400 font-medium"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium"
            >
              <option value="ALL">Todos</option>
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE">Imagen</option>
              <option value="ZIP">Archivo comprimido</option>
              <option value="FILE">Otros</option>
            </select>

            <div className="px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md ring-2 ring-violet-200">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </div>
          </div>
        </div>

        {/* Grid de recursos */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-violet-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50">
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-violet-200 mb-4">
              <FileText className="size-16" />
            </div>
            <p className="text-slate-600 font-bold text-lg mb-2">
              {query || filterType !== 'ALL' ? 'No se encontraron recursos' : 'No hay recursos disponibles'}
            </p>
            <p className="text-sm text-slate-500 font-medium">
              {query || filterType !== 'ALL'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Tu asesor aún no ha compartido recursos contigo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map(r => (
              <div
                key={r.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${getFileBorderColor(r.file_type_display)} hover:-translate-y-1 ring-2 ring-slate-100/50 hover:ring-slate-200`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`shrink-0 w-16 h-16 rounded-xl bg-white flex items-center justify-center border-2 ${getFileBorderColor(r.file_type_display)}`}>
                      {getFileIcon(r.file_type_display)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate" title={r.title}>
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {r.file_type_display} • {r.file_size_mb} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openPreview(r)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Vista previa"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(r.id, r.file_name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Descargar"
                    >
                      <Download className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Descripción */}
                {r.description && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{r.description}</p>
                )}

                {/* Tags */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags && r.tags.length > 0 ? (
                      r.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin etiquetas</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                  <span>Subido: {new Date(r.created_at).toLocaleDateString('es-ES')}</span>
                  <span>ID: {r.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de preview */}
        {preview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)}>
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border-2 border-slate-200 ring-4 ring-violet-100" onClick={e => e.stopPropagation()}>
              {/* Header del modal */}
              <div className="px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shrink-0 shadow-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">{preview.title}</h3>
                  <p className="text-xs text-white/90 font-medium mt-1">{preview.file_type_display} • {preview.file_size_mb} MB</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleDownload(preview.id, preview.file_name)}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg"
                  >
                    <Download className="size-4" />
                    Descargar
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 ring-2 ring-white/20 hover:ring-white/40"
                  >
                    <X className="size-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Contenido del preview */}
              <div className="flex-1 overflow-auto p-4 bg-white">
                {preview.file_type_display === 'PDF' ? (
                  <iframe
                    allowFullScreen
                    src={buildFileUrl(preview)}
                    className="w-full h-full min-h-[400px] max-h-[60vh] rounded-lg border-2 border-slate-200"
                    title={preview.title}
                  />
                ) : preview.file_type_display === 'VIDEO' ? (
                  <video
                    src={buildFileUrl(preview)}
                    controls
                    className="w-full max-h-[60vh] rounded-lg border-2 border-slate-200"
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : preview.file_type_display === 'IMAGE' ? (
                  <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
                    <img
                      src={buildFileUrl(preview)}
                      alt={preview.title}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg border-2 border-slate-200 shadow-lg"
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

