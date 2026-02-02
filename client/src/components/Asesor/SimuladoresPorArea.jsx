import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SimuladoresGen from './SimuladoresGen.jsx';

export default function SimuladoresPorArea() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const areaQuery = (search.get('area') || '').trim();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const [areaName, setAreaName] = useState(areaQuery);

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        // Cargar todas las áreas para resolver nombre -> id
        const res = await fetch('/api/areas', { credentials: 'include' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const allAreas = Array.isArray(json?.data) ? json.data : [];

        const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

        const findMatch = (list, title) => {
          if (!list || !title) return null;
          const nTitle = norm(title);

          // 1. Exact match
          let m = list.find(a => norm(a.nombre) === nTitle);
          if (m) return m;

          // Prepare search parts
          const hasColon = title.includes(':');
          const searchSuffix = hasColon ? norm(title.split(':').pop()) : null;

          return list.find(a => {
            const nDb = norm(a.nombre);
            // Bidirectional inclusion
            if (nDb.includes(nTitle)) return true;
            if (nTitle.includes(nDb)) return true; // Less likely but possible

            // Suffix checks
            if (searchSuffix) {
              // If DB name ends with the search suffix (e.g. "Módulo ... : Análisis")
              if (nDb.endsWith(searchSuffix)) return true;
              if (nDb.includes(searchSuffix)) return true;
            }

            // DB colon check
            if (a.nombre && a.nombre.includes(':')) {
              const dbSuffix = norm(a.nombre.split(':').pop());
              if (dbSuffix === nTitle) return true;
              if (searchSuffix && dbSuffix === searchSuffix) return true;
            }
            return false;
          });
        };

        const match = findMatch(allAreas, areaQuery);

        if (match?.id) {
          if (!abort) { setAreaId(match.id); setAreaName(match.nombre || areaQuery); }
        } else {
          // Si no se encuentra por nombre, y es un número, úsalo como id directo
          const asNum = Number(areaQuery);
          if (!Number.isNaN(asNum) && asNum > 0) {
            if (!abort) { setAreaId(asNum); setAreaName(String(areaQuery)); }
          } else {
            if (!abort) setError('No se reconoce el área seleccionada');
          }
        }
      } catch (e) {
        if (!abort) setError(e?.message || 'No se pudo cargar el catálogo de áreas');
      } finally { if (!abort) setLoading(false); }
    })();
    return () => { abort = true; };
  }, [areaQuery]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Cargando área…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">Volver</button>
          <div className="text-sm text-slate-500">{areaQuery ? `Área: ${areaQuery}` : ''}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

  return (
    <SimuladoresGen title={`SIMULACIONES ESPECÍFICAS — ${areaName || ''}`} areaId={areaId} areaTitle={areaName} />
  );
}
