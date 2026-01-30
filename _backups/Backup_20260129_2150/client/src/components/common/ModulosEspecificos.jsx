import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SolicitudesModal from "./SolicitudesModal";

function IconBook({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14a1 1 0 0 1-1.447.894L14 18.118l-3.553 1.776A1 1 0 0 1 9 19.118V5H6a2 2 0 0 0-2 2v12a1 1 0 0 0 2 0V5Z" />
    </svg>
  );
}

function HeaderAct({ total, backTo }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur dark:bg-white/5 p-5 sm:p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {backTo && (
              <Link
                to={backTo}
                aria-label="Volver"
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white hover:bg-black/5 transition"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Módulos Específicos</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-800 pl-12">
            Accede a tus áreas permitidas o solicita acceso a nuevas.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10Zm-1-7h2v2h-2Zm0-8h2v6h-2Z" />
            </svg>
          </span>
          <span className="font-medium">{total} módulos disponibles</span>
        </div>
      </div>
    </div>
  );
}

function HeaderSim({ title, subtitle, total, onBack }) {
  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 px-5 sm:px-7 py-4 sm:py-5 shadow-lg ring-2 ring-slate-100/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Regresar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
              {title || 'Elige un módulo específico'}
            </h1>
            {subtitle && (
              <p className="text-slate-600 text-sm sm:text-base font-medium mt-1.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-slate-700 shadow-md">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12m-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0" />
            </svg>
          </div>
          <span className="text-sm font-bold">{total} módulos disponibles</span>
        </div>
      </div>
    </div>
  );
}

function CardAct({ item, onOpenSolicitudes, badgeCount, to, state }) {
  // Unificar estilo con CardSim: mismo contenedor, ícono, tipografía y acciones
  const { title, desc } = item;
  const gradient = item?.gradient || item?.color || "from-violet-500 to-fuchsia-600";
  return (
    <article className="group relative flex h-full min-h-[260px] flex-col rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-7 shadow-lg ring-2 ring-slate-100/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:ring-violet-200/50">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-50/0 to-indigo-50/0 group-hover:from-violet-50/30 group-hover:to-indigo-50/30 transition-all duration-300" />
      <div
        className={[
          "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-xl",
          "ring-4 ring-white/50",
          "bg-gradient-to-br",
          "group-hover:scale-110 transition-transform duration-300",
          gradient,
        ].join(" ")}
      >
        <IconBook className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2 mb-2">
        <span>{title}</span>
        {badgeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white border-2 border-white shadow-lg ring-2 ring-red-200">
            {badgeCount}
          </span>
        )}
      </h3>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onOpenSolicitudes}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          Solicitudes
        </button>
        <Link 
          to={to}
          state={state}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
        >
          <span>Acceder</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

function CardSim({ item, onOpenSolicitudes, badgeCount, to, state }) {
  // Aseguramos mismos estilos entre páginas: si no hay gradient, intentamos derivarlo de `color`
  const { title, desc, icon: Icon } = item;
  const gradient = item?.gradient || item?.color || "from-violet-500 to-fuchsia-600";
  return (
    <article className="group relative flex h-full min-h-[260px] flex-col rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-7 shadow-lg ring-2 ring-slate-100/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:ring-violet-200/50">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-50/0 to-indigo-50/0 group-hover:from-violet-50/30 group-hover:to-indigo-50/30 transition-all duration-300" />
      <div
        className={[
          "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-xl",
          "ring-4 ring-white/50",
          "bg-gradient-to-br",
          "group-hover:scale-110 transition-transform duration-300",
          gradient,
        ].join(" ")}
      >
        {Icon ? <Icon className="h-8 w-8" /> : <IconBook className="h-8 w-8" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2 mb-2">
        <span>{title}</span>
        {badgeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white border-2 border-white shadow-lg ring-2 ring-red-200">
            {badgeCount}
          </span>
        )}
      </h3>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed font-medium">{desc}</p>
      <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onOpenSolicitudes}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
        >
          Solicitudes
        </button>
        <Link 
          to={to}
          state={state}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
        >
          <span>Acceder</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14"/>
            <path d="M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </article>
  );
}

export default function ModulosEspecificos({
  items = [],
  areaType = 'actividad',
  variant = 'act', // 'act' | 'sim'
  header = {},
  buildAccessLink,
  getAreaKey,
}) {
  const [openSolicitudes, setOpenSolicitudes] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedAreaName, setSelectedAreaName] = useState(null);
  const [nameToArea, setNameToArea] = useState({});
  const [pendingCounts, setPendingCounts] = useState({});

  // Fetch catálogo para mapear nombres a IDs
  // Helper: fetch con intento de refresh de token si da 401
  const fetchWithRefresh = async (url, options = {}) => {
    const opts = { credentials: 'include', ...options };
    let res = await fetch(url, opts).catch(() => null);
    if (res && res.status !== 401) return res;
    // Si 401, intentamos refrescar y reintentar una vez
    try {
      const r = await fetch('/api/usuarios/token/refresh', { method: 'POST', credentials: 'include' });
      if (r.ok) {
        res = await fetch(url, opts).catch(() => null);
        return res;
      }
    } catch (_) {}
    return res; // puede ser null o 401; el llamador decidirá
  };

  // Fetch catálogo para mapear nombres a IDs
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetchWithRefresh('/api/areas/catalog');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const modulos = json?.data?.modulos || [];
        const map = {};
        for (const m of modulos) {
          if (m?.nombre) map[m.nombre.trim()] = { id: m.id, nombre: m.nombre };
        }
        if (!abort) setNameToArea(map);
      } catch (e) {
        console.warn('No se pudo cargar catálogo de áreas', e);
      }
    })();
    return () => { abort = true; };
  }, []);

  const refreshPendingCounts = async () => {
    try {
      const res = await fetchWithRefresh(`/api/advisor/area-requests?status=pending&area_type=${encodeURIComponent(areaType)}&limit=1000`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      const counts = {};
      for (const r of list) {
        const key = String(r.area_id);
        counts[key] = (counts[key] || 0) + 1;
      }
      setPendingCounts(counts);
    } catch (e) {
      // Silenciar 401 para no ensuciar la consola en roles no asesores o sin sesión
      if (String(e?.message || '').includes('HTTP 401')) return;
      console.warn('No se pudieron obtener conteos de solicitudes', e);
    }
  };

  useEffect(() => { refreshPendingCounts(); }, [nameToArea, areaType]);

  const areaIdToName = useMemo(() => {
    const m = {};
    for (const k of Object.keys(nameToArea)) {
      const v = nameToArea[k];
      if (v?.id) m[String(v.id)] = v.nombre;
    }
    return m;
  }, [nameToArea]);

  const _getAreaKey = (item) => {
    if (typeof getAreaKey === 'function') return getAreaKey(item);
    return item?.title?.trim?.() || item?.title || '';
  };

  const openAreaSolicitudes = (item) => {
    const key = _getAreaKey(item);
    const area = nameToArea[key];
    if (area?.id) {
      setSelectedAreaId(area.id);
      setSelectedAreaName(area.nombre);
    } else {
      setSelectedAreaId(null);
      setSelectedAreaName(key);
    }
    setOpenSolicitudes(true);
  };

  const getBadgeCount = (item) => {
    const key = _getAreaKey(item);
    const area = nameToArea[key];
    if (!area?.id) return 0;
    return pendingCounts[String(area.id)] || 0;
  };

  const _buildAccessLink = (item) => {
    if (typeof buildAccessLink === 'function') return buildAccessLink(item);
    // Defaults
      if (variant === 'sim') {
        const name = _getAreaKey(item);
        return { pathname: '/asesor/simuladores/area', search: `?area=${encodeURIComponent(name)}` };
      }
    return { pathname: '/asesor/actividades/modulo', state: { title: _getAreaKey(item) || item.title } };
  };

  // React Router v6: `state` NO va dentro de `to`, se pasa como prop separado.
  // Normalizamos para soportar objetos legacy { pathname, search, state }.
  const normalizeToState = (link) => {
    if (typeof link === "string") return { to: link, state: undefined };
    if (!link || typeof link !== "object") return { to: "/", state: undefined };
    if ("to" in link) {
      // Por si alguien ya regresa { to, state } en el futuro
      const { to, state } = link;
      return { to: to || "/", state };
    }
    // Legacy: { pathname, search, hash, state }
    const { state, ...to } = link;
    return { to, state };
  };

  return (
    <section className="pt-4 sm:pt-6 pb-8 sm:pb-10">
      {variant === 'sim' ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeaderSim
            title={header.title || 'Elige un módulo específico'}
            subtitle={header.subtitle || 'Selecciona un módulo para visualizar y/o crear un simulador.'}
            total={items.length}
            onBack={() => (header?.backTo ? null : window.history.back())}
          />
        </div>
      ) : (
        <HeaderAct total={items.length} backTo={header?.backTo || '/asesor/actividades'} />
      )}

      <div className="mx-auto mt-6 sm:mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={variant === 'sim' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6'}>
          {items.map((item, i) => {
            const link = _buildAccessLink(item);
            const { to, state } = normalizeToState(link);
            const badgeCount = getBadgeCount(item);
            const onOpen = () => openAreaSolicitudes(item);
            return variant === 'sim' ? (
              <CardSim key={i} item={item} to={to} state={state} badgeCount={badgeCount} onOpenSolicitudes={onOpen} />
            ) : (
              <CardAct key={i} item={item} to={to} state={state} badgeCount={badgeCount} onOpenSolicitudes={onOpen} />
            );
          })}
        </div>
      </div>

      <SolicitudesModal
        open={openSolicitudes}
        onClose={() => setOpenSolicitudes(false)}
        areaId={selectedAreaId}
        areaName={selectedAreaName}
        areaType={areaType}
        onRefreshCounts={refreshPendingCounts}
        areaNamesMap={areaIdToName}
      />
    </section>
  );
}
