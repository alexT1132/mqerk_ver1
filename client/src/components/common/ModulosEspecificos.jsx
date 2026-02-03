import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SolicitudesModal from "./SolicitudesModal";
import {
  ArrowRight,
  GraduationCap,
  Layers,
  MessageSquare,
  ChevronLeft,
  RefreshCw
} from "lucide-react";

/* --- Réplica del Icono de Libro --- */
function IconBook({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14a1 1 0 0 1-1.447.894L14 18.118l-3.553 1.776A1 1 0 0 1 9 19.118V5H6a2 2 0 0 0-2 2v12a1 1 0 0 0 2 0V5Z" />
    </svg>
  );
}

/* --- SectionBadge: Réplica exacta del header de Actividades.jsx --- */
function SectionBadge({ title, subtitle, onBack, total, onRefresh, isRefreshing }) {
  return (
    <div className="relative mx-auto max-w-8xl overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-6 sm:p-8 shadow-xl ring-2 ring-slate-100/50 mb-8">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative z-10 flex items-center gap-5">
        {/* Botón Volver Sutil */}
        <button
          onClick={onBack}
          className="group/back flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/30 backdrop-blur-md text-violet-700 hover:bg-white hover:border-white transition-all duration-200 shadow-sm active:scale-90"
          aria-label="Volver"
        >
          <ChevronLeft className="size-6 transition-transform group-hover/back:-translate-x-0.5" strokeWidth={3} />
        </button>

        {/* ícono */}
        <div className="relative hidden xs:grid size-16 sm:size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-white/50">
          <GraduationCap className="size-8 sm:size-10 text-white" />
          <div className="absolute -top-1 -right-1 inline-grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-white shadow-md">
            <span className="text-[10px] font-bold">★</span>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 uppercase">
            {title || "Módulos específicos"}
          </h2>
          <div className="mt-2 flex gap-2">
            <span className="h-1.5 w-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
            <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
          </div>
        </div>

        {/* Contador de Módulos + Botón Refrescar */}
        <div className="hidden md:flex ml-auto items-center gap-3">
          {/* Botón de Refrescar */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/30 backdrop-blur-md text-violet-700 hover:bg-white hover:border-white transition-all duration-200 shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refrescar solicitudes"
            >
              <RefreshCw className={`size-5 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} strokeWidth={2.5} />
            </button>
          )}

          {/* Contador */}
          {total > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md px-5 py-3 border border-white/50 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                <Layers className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-800 leading-none">{total}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Módulos</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- AreaCard: Réplica exacta de la tarjeta de Actividades.jsx con borde negro --- */
function AreaCard({ item, onOpenSolicitudes, badgeCount, to, state }) {
  const { title, desc, icon: Icon } = item;

  // CORRECCIÓN: Usar directamente 'color' si existe (ej: "from-sky-500 to-cyan-600")
  // Sino, construir it usando from/to. Fallback a violeta.
  const gradientClasses = item.color || (item.from && item.to ? `${item.from} ${item.to}` : "from-violet-500 to-indigo-600");
  const tintColor = item.tint || "bg-violet-50";

  return (
    <article
      className="group relative overflow-hidden rounded-[2.5rem] p-7 sm:p-8 shadow-lg bg-white border-2 border-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
    >
      {/* Tint de fondo */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${tintColor} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

      {/* Overlay sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-300" />

      {/* Contenedor del Icono con Glow */}
      <div className="relative w-16 h-16 mb-6">
        <div className={`absolute inset-0 blur-2xl opacity-60 bg-gradient-to-br ${gradientClasses} rounded-3xl group-hover:opacity-80 transition-opacity duration-300`} />
        <div className={`relative w-16 h-16 rounded-3xl grid place-items-center text-white shadow-xl ring-4 ring-white/50 bg-gradient-to-br ${gradientClasses}`}>
          <div className="scale-125">
            {Icon ? (
              React.isValidElement(Icon) ? Icon : <Icon className="w-6 h-6" />
            ) : (
              <IconBook className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Badge de solicitudes */}
        {badgeCount > 0 && (
          <div className="absolute -top-3 -right-3 z-20 flex min-h-[1.5rem] min-w-[1.5rem] w-auto items-center justify-center rounded-full bg-rose-500 border-2 border-white px-1.5 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {badgeCount > 99 ? '99+' : badgeCount}
          </div>
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900 min-h-[3rem]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2">
        {desc}
      </p>

      <div className="mt-auto flex items-center gap-3">
        <Link
          to={to}
          state={state}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
        >
          Explorar área
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Botón de solicitudes integrado discretamente */}
        <button
          onClick={onOpenSolicitudes}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all duration-200 active:scale-95 shadow-sm"
          title="Ver solicitudes"
        >
          <MessageSquare className="size-5" />
          {badgeCount > 0 && (
            <div className="absolute -top-3 -right-3 z-20 flex min-h-[1.5rem] min-w-[1.5rem] w-auto items-center justify-center rounded-full bg-rose-500 border-2 border-white px-1.5 text-[10px] font-bold text-white shadow-lg animate-pulse">
              {badgeCount > 99 ? '99+' : badgeCount}
            </div>
          )}
        </button>
      </div>
    </article>
  );
}

export default function ModulosEspecificos({
  items = [],
  areaType = 'actividad',
  variant = 'act',
  header = {},
  buildAccessLink,
  getAreaKey,
}) {
  const navigate = useNavigate();
  const [openSolicitudes, setOpenSolicitudes] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedAreaName, setSelectedAreaName] = useState(null);
  const [nameToArea, setNameToArea] = useState({});
  const [pendingCounts, setPendingCounts] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWithRefresh = async (url, options = {}) => {
    const opts = { credentials: 'include', ...options };
    let res = await fetch(url, opts).catch(() => null);
    if (res && res.status !== 401) return res;
    try {
      const r = await fetch('/api/usuarios/token/refresh', { method: 'POST', credentials: 'include' });
      if (r.ok) {
        res = await fetch(url, opts).catch(() => null);
        return res;
      }
    } catch (_) { }
    return res;
  };

  /* Helper para normalizar textos (quitar acentos, minúsculas) */
  const normalize = (str) => {
    return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetchWithRefresh('/api/areas/catalog');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const modulos = json?.data?.modulos || [];
        const generales = json?.data?.generales || [];
        const allAreas = [...modulos, ...generales];

        const map = {};
        for (const m of allAreas) {
          if (m?.nombre) {
            // Guardamos tanto la versión normalizada como la original minúscula por compatibilidad
            map[normalize(m.nombre)] = { id: m.id, nombre: m.nombre };
            map[m.nombre.trim().toLowerCase()] = { id: m.id, nombre: m.nombre };
          }
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
      const countsByName = {}; // Nuevo: contar también por nombre

      for (const r of list) {


        // Contar por area_id (como antes)
        if (r.area_id) {
          const key = String(r.area_id);
          counts[key] = (counts[key] || 0) + 1;
        }

        // Contar también por area_name (normalizado)
        // Si no tiene area_name, intentar obtenerlo del mapa areaIdToName
        let areaName = r.area_name;
        if (!areaName && r.area_id && areaIdToName) {
          areaName = areaIdToName[String(r.area_id)];

        }

        if (areaName) {
          try {
            const normalizedName = normalize(areaName);

            countsByName[normalizedName] = (countsByName[normalizedName] || 0) + 1;
          } catch (err) {
            console.error('Error normalizing area_name:', err, areaName);
          }
        } else {

        }
      }



      setPendingCounts({ byId: counts, byName: countsByName });
    } catch (e) {
      if (String(e?.message || '').includes('HTTP 401')) return;
      console.warn('No se pudieron obtener conteos de solicitudes', e);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPendingCounts();
    setIsRefreshing(false);
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

  const _findArea = (item) => {
    const rawTitle = _getAreaKey(item);
    const normalizedTitle = normalize(rawTitle);

    // 1. Intento directo con normalización
    // 1. Intento directo con normalización
    if (nameToArea[normalizedTitle]) return nameToArea[normalizedTitle];
    // 2. Intento directo sin normalización (legacy)
    const lowerTitle = rawTitle.toLowerCase().trim();
    if (nameToArea[lowerTitle]) return nameToArea[lowerTitle];

    // 3. Si tiene ": ", probamos con la parte derecha
    if (rawTitle.includes(':')) {
      const parts = rawTitle.split(':');
      const subPart = parts[parts.length - 1];

      const normSub = normalize(subPart);
      if (nameToArea[normSub]) return nameToArea[normSub];

      const lowerSub = subPart.toLowerCase().trim();
      if (nameToArea[lowerSub]) return nameToArea[lowerSub];
    }

    // 4. Fallback: búsqueda difusa (si el título contiene la clave del área)
    // Esto ayuda si el título es "Transversal: Análisis Psicométrico" y la clave es "análisis psicométrico"
    // Iteramos las claves y vemos si alguna está contenida en el título normalizado
    const keys = Object.keys(nameToArea);
    for (const key of keys) {
      if (key.length > 4 && normalizedTitle.includes(key)) { // >4 para evitar falsos positivos cortos
        return nameToArea[key];
      }
    }

    return null;
  };

  const openAreaSolicitudes = (item) => {
    const area = _findArea(item);

    if (area?.id) {
      setSelectedAreaId(area.id);
      setSelectedAreaName(area.nombre);
    } else {

      setSelectedAreaId(null);
      setSelectedAreaName(_getAreaKey(item));
    }
    setOpenSolicitudes(true);
  };

  const getBadgeCount = (item) => {
    const area = _findArea(item);
    const itemTitle = _getAreaKey(item);



    // Intentar primero por area_id
    if (area?.id && pendingCounts?.byId) {
      const count = pendingCounts.byId[String(area.id)] || 0;
      if (count > 0) {

        return count;
      }
    }

    // Si no hay area_id o no hay conteo, intentar por nombre
    if (pendingCounts?.byName) {
      const normalizedTitle = normalize(itemTitle);



      // Buscar coincidencia exacta primero
      if (pendingCounts.byName[normalizedTitle]) {
        const count = pendingCounts.byName[normalizedTitle];

        return count;
      }

      // Buscar coincidencia parcial (contiene)
      for (const [areaName, count] of Object.entries(pendingCounts.byName)) {
        if (areaName.includes(normalizedTitle) || normalizedTitle.includes(areaName)) {

          return count;
        }
      }


    }

    return 0;
  };

  const _buildAccessLink = (item) => {
    if (typeof buildAccessLink === 'function') return buildAccessLink(item);
    if (variant === 'sim') {
      const name = _getAreaKey(item);
      return { pathname: '/asesor/simuladores/area', search: `?area=${encodeURIComponent(name)}` };
    }
    return { pathname: '/asesor/actividades/modulo', state: { title: _getAreaKey(item) || item.title } };
  };

  const normalizeToState = (link) => {
    if (typeof link === "string") return { to: link, state: undefined };
    if (!link || typeof link !== "object") return { to: "/", state: undefined };
    if ("to" in link) {
      const { to, state } = link;
      return { to: to || "/", state };
    }
    const { state, ...to } = link;
    return { to, state };
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-32">
      <SectionBadge
        title={header.title}
        subtitle={header.subtitle}
        onBack={() => (header?.backTo ? navigate(header.backTo) : navigate(-1))}
        total={items.length}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="mx-auto max-w-8xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {items.map((item, i) => {
          const link = _buildAccessLink(item);
          const { to, state } = normalizeToState(link);
          const badgeCount = getBadgeCount(item);

          return (
            <AreaCard
              key={i}
              item={item}
              to={to}
              state={state}
              badgeCount={badgeCount}
              onOpenSolicitudes={() => openAreaSolicitudes(item)}
            />
          );
        })}
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
