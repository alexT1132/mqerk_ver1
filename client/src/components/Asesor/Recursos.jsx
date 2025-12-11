import React, { useState, useEffect, useMemo } from 'react';
import { Download, Eye, Trash2, UploadCloud, Search, FileText, File, Video, Image, Archive, FileEdit, X, Save, Loader2, Tag, Plus, CheckCircle, GraduationCap, Shield } from 'lucide-react';
import { 
  listRecursos, createRecurso, updateRecurso, deleteRecurso, downloadRecurso,
  listRecursosAdmin, downloadRecursoAdmin
} from '../../api/recursos.js';
import { buildStaticUrl } from '../../utils/url.js';
import ConfirmModal from '../shared/ConfirmModal.jsx';

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
  // Usar file_url si está disponible (ya viene construida del backend)
  if (resource.file_url) {
    return resource.file_url;
  }

  const path = resource.file_path;
  if (!path) return '';

  // Si ya es URL completa, usarla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Normalizar la ruta
  let normalized = path.replace(/\\/g, '/');

  // Extraer solo el nombre del archivo si contiene la ruta completa
  const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
  if (match) {
    return `/uploads/recursos-educativos/${match[1]}`;
  }

  // Si ya es una ruta relativa que empieza con /uploads/
  if (normalized.startsWith('/uploads/recursos-educativos/')) {
    return normalized;
  }

  // Si solo tiene el nombre del archivo, agregar la ruta base
  if (!normalized.includes('/')) {
    return `/uploads/recursos-educativos/${normalized}`;
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

export default function Recursos() {
  const [activeTab, setActiveTab] = useState('asesor'); // 'asesor' | 'admin'
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selected, setSelected] = useState(new Set());
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: [] });
  const [newTag, setNewTag] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' });
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar recursos según el tab activo
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      setSelected(new Set()); // Limpiar selección al cambiar de tab
      try {
        let data;
        if (activeTab === 'asesor') {
          const res = await listRecursos();
          data = res.data?.data || [];
        } else if (activeTab === 'admin') {
          const res = await listRecursosAdmin();
          data = res.data?.data || [];
        }
        if (!alive) return;
        setResources(data || []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando recursos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [activeTab]);

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

  // Toggle selección
  const toggleSelect = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  // Seleccionar todos
  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r.id)));
    }
  };

  // Subir archivo
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB en bytes
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: 100MB`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', '');
      formData.append('tags', JSON.stringify([]));

      // Solo se puede subir en "Mis Recursos" (asesor)
      if (activeTab !== 'asesor') {
        setError('Solo puedes subir archivos en "Mis Recursos"');
        e.target.value = '';
        setUploading(false);
        return;
      }

      const response = await createRecurso(formData);

      setResources(prev => [response.data.data, ...prev]);
      setSuccessMessage(`Archivo "${file.name}" subido correctamente`);

      // Reset input
      e.target.value = '';
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error subiendo archivo');
    } finally {
      setUploading(false);
    }
  };

  // Eliminar recurso
  const handleDelete = async (id) => {
    const resource = resources.find(r => r.id === id);
    
    // Los recursos del admin no se pueden eliminar desde aquí (solo el admin puede)
    if (activeTab === 'admin') {
      setError('No tienes permiso para eliminar recursos del administrador');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      message: '¿Estás seguro de eliminar este recurso?',
      details: resource ? `Se eliminará "${resource.title}" permanentemente.` : '',
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteRecurso(id);
          setResources(prev => prev.filter(r => r.id !== id));
          const s = new Set(selected);
          s.delete(id);
          setSelected(s);
          setSuccessMessage('Recurso eliminado correctamente');
          setTimeout(() => setSuccessMessage(''), 3000);
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' });
        } catch (err) {
          setError(err?.response?.data?.message || 'Error eliminando recurso');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' });
        }
      },
      onCancel: () => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' })
    });
  };

  // Eliminación masiva
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    
    // Los recursos del admin no se pueden eliminar desde aquí
    if (activeTab === 'admin') {
      setError('No tienes permiso para eliminar recursos del administrador');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      message: `¿Estás seguro de eliminar ${selected.size} recurso(s)?`,
      details: 'Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmText: 'Eliminar todos',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await Promise.all(Array.from(selected).map(id => deleteRecurso(id)));
          setResources(prev => prev.filter(r => !selected.has(r.id)));
          setSelected(new Set());
          setSuccessMessage(`${selected.size} recurso(s) eliminado(s) correctamente`);
          setTimeout(() => setSuccessMessage(''), 3000);
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' });
        } catch (err) {
          setError(err?.response?.data?.message || 'Error eliminando recursos');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' });
        }
      },
      onCancel: () => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' })
    });
  };

  // Descargar recurso
  const handleDownload = async (id, fileName) => {
    try {
      let response;
      if (activeTab === 'asesor') {
        response = await downloadRecurso(id);
      } else if (activeTab === 'admin') {
        response = await downloadRecursoAdmin(id);
      }
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

  // Iniciar edición
  const startEdit = (resource) => {
    setEditing(resource.id);
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      tags: Array.isArray(resource.tags) ? [...resource.tags] : []
    });
    setNewTag('');
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ title: '', description: '', tags: [] });
    setNewTag('');
  };

  // Guardar edición
  const saveEdit = async (id) => {
    try {
      // Los recursos del admin no se pueden editar desde aquí
      if (activeTab === 'admin') {
        setError('No tienes permiso para editar recursos del administrador');
        cancelEdit();
        return;
      }

      await updateRecurso(id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        tags: JSON.stringify(editForm.tags)
      });

      setResources(prev => prev.map(r =>
        r.id === id
          ? { ...r, title: editForm.title.trim(), description: editForm.description.trim() || null, tags: editForm.tags }
          : r
      ));
      setSuccessMessage('Recurso actualizado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error actualizando recurso');
    }
  };

  // Agregar tag
  const addTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim();
    if (editForm.tags.includes(tag)) return;
    setEditForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setNewTag('');
  };

  // Eliminar tag
  const removeTag = (tag) => {
    setEditForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
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
                  Recursos Educativos
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                {activeTab === 'asesor' && 'Recursos que subes para tus grupos y alumnos — organiza, visualiza y descarga tus materiales.'}
                {activeTab === 'admin' && 'Recursos que el administrador sube para ti — materiales proporcionados por la academia.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('asesor')}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'asesor'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-violet-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              <span>Mis Recursos</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-600 hover:text-violet-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="size-4" />
              <span>Recursos del Administrador</span>
            </div>
          </button>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Solo mostrar botón de subir en "Mis Recursos" */}
            {activeTab === 'asesor' && (
              <label className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-5" />
                    <span>Subir archivo</span>
                  </>
                )}
                <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            )}

            {selected.size > 0 && activeTab !== 'admin' && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Trash2 className="size-5" />
                Eliminar ({selected.size})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-sm text-slate-600 hover:text-slate-800 font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {selected.size === filtered.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
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

        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-700 flex items-center gap-3 shadow-md ring-2 ring-green-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <CheckCircle className="size-4" />
            </div>
            <span className="font-bold flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="p-1 hover:bg-green-100 rounded-lg transition-colors"
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
              {query || filterType !== 'ALL' ? 'No se encontraron recursos' : 'No tienes recursos aún'}
            </p>
            <p className="text-sm text-slate-500 font-medium">
              {query || filterType !== 'ALL'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Sube tu primer archivo para comenzar'}
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
                      {editing === r.id ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-2 py-1 text-sm font-semibold border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          placeholder="Título"
                        />
                      ) : (
                        <h3 className="font-semibold text-slate-800 truncate" title={r.title}>
                          {r.title}
                        </h3>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {r.file_type_display} • {r.file_size_mb} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                    <div className="flex gap-1.5">
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
                      {editing === r.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(r.id)}
                            className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Guardar"
                          >
                            <Save className="size-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Cancelar"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Solo mostrar editar/eliminar si no es recurso del admin */}
                          {activeTab !== 'admin' && (
                            <button
                              onClick={() => startEdit(r)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-600 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Editar"
                            >
                              <FileEdit className="size-4" />
                            </button>
                          )}
                          {activeTab !== 'admin' && (
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Eliminar"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {editing === r.id ? (
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción (opcional)"
                    className="w-full px-2 py-1.5 text-xs border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-3"
                    rows={2}
                  />
                ) : r.description ? (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{r.description}</p>
                ) : null}

                {/* Tags */}
                <div className="mb-3">
                  {editing === r.id ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {editForm.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 border border-violet-200"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-violet-900"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Agregar etiqueta"
                          className="flex-1 px-2 py-1 text-xs border-2 border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <button
                          onClick={addTag}
                          className="px-2 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex flex-col gap-1">
                    <span>Subido: {new Date(r.created_at).toLocaleDateString('es-ES')}</span>
                    {activeTab === 'admin' && r.admin_usuario && (
                      <span className="text-indigo-600 font-medium">
                        Por: {r.admin_usuario}
                      </span>
                    )}
                  </div>
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
                        // Si falla, intentar con diferentes variantes
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

        {/* Modal de confirmación */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          message={confirmModal.message}
          details={confirmModal.details}
          variant={confirmModal.variant}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {}, variant: 'default' })}
        />
      </div>
    </div>
  );
}
