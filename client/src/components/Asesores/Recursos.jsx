import React, { useState } from 'react';
import { Download, Eye, Trash2, UploadCloud, Search, FileText } from 'lucide-react';

// Diseño minimalista y colores claros con TailwindCSS

const mockResources = [
  {
    id: 1,
    title: 'Guía de Física Básica',
    type: 'PDF',
    size: '2.1 MB',
    tags: ['Física', 'Secundaria'],
    date: '2025-08-12',
    thumbnail: null,
  },
  {
    id: 2,
    title: 'Video: Resolución de problemas',
    type: 'VIDEO',
    size: '45 MB',
    tags: ['Matemáticas', 'Técnicas'],
    date: '2025-09-01',
    thumbnail: null,
  },
  {
    id: 3,
    title: 'Colección de ejercicios - Algebra',
    type: 'ZIP',
    size: '8.3 MB',
    tags: ['Álgebra', 'Prepa'],
    date: '2025-07-22',
    thumbnail: null,
  },
];

export default function RecursosEducativosMockup() {
  const [resources, setResources] = useState(mockResources);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selected, setSelected] = useState(new Set());
  const [preview, setPreview] = useState(null);

  const filtered = resources.filter(r => {
    const matchQuery = r.title.toLowerCase().includes(query.toLowerCase());
    const matchType = filterType === 'ALL' || r.type === filterType;
    return matchQuery && matchType;
  });

  function toggleSelect(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  }

  function handleDelete(id) {
    setResources(prev => prev.filter(r => r.id !== id));
    const s = new Set(selected); s.delete(id); setSelected(s);
  }

  function handleBulkDelete() {
    setResources(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const newR = {
      id: Date.now(),
      title: file.name,
      type: file.type.includes('video') ? 'VIDEO' : (file.type.includes('pdf') ? 'PDF' : 'FILE'),
      size: `${(file.size / (1024*1024)).toFixed(2)} MB`,
      tags: [],
      date: new Date().toISOString().slice(0,10),
    };
    setResources(prev => [newR, ...prev]);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Recursos Educativos</h2>
          <p className="text-sm text-gray-500">Biblioteca personal del asesor — sube, organiza, visualiza y descarga tus materiales.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:shadow bg-white">
            <UploadCloud size={16} />
            <span className="text-sm">Subir archivo</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>

          <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50" disabled={selected.size===0}>
            Eliminar ({selected.size})
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 border-b border-gray-300 pb-1">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Buscar por título, etiqueta o palabra clave"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full outline-none text-gray-700"
            />
          </div>

          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border px-3 py-2 rounded-lg bg-white text-gray-700">
            <option value="ALL">Todos</option>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Video</option>
            <option value="FILE">Otros</option>
          </select>

          <div className="text-sm text-gray-500">{filtered.length} resultados</div>
        </div>
      </div>

      {/* Main area: Grid de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow hover:shadow-md transition flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                  <FileText size={28} className="text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.type} • {r.size}</div>
                  <div className="mt-2 text-xs">
                    {r.tags.map(t => (
                      <span key={t} className="inline-block mr-1 px-2 py-0.5 text-xs border rounded-full text-gray-600 bg-gray-50">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
                <div className="flex gap-2">
                  <button onClick={() => setPreview(r)} className="p-2 rounded-md hover:bg-gray-100"><Eye size={16} className="text-gray-600" /></button>
                  <button className="p-2 rounded-md hover:bg-gray-100"><Download size={16} className="text-gray-600" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 rounded-md hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400 flex justify-between">
              <div>Subido: {r.date}</div>
              <div>ID: {r.id}</div>
            </div>

          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Vista previa — {preview.title}</h3>
                <div className="text-sm text-gray-500">Tipo: {preview.type} • Tamaño: {preview.size}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { /* descargar */ }} className="px-3 py-1 border rounded bg-white text-gray-700">Descargar</button>
                <button onClick={() => setPreview(null)} className="px-3 py-1 bg-gray-100 rounded text-gray-700">Cerrar</button>
              </div>
            </div>

            <div className="h-64 rounded border flex items-center justify-center text-gray-400">
              Aquí iría el visor (PDF / Video / Imagen) — mock preview.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
