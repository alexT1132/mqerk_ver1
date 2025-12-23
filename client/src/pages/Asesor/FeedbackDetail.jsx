import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";
import FeedbackReview from "../../components/Asesor/FeedbackReview.jsx";
import { getEstudianteByIdRequest } from "../../api/estudiantes.js";
import { ArrowLeft, Loader2, UserRound, X } from "lucide-react";
import { buildStaticUrl } from "../../utils/url.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FeedbackDetail({ embedded = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { logout } = useAuth();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const { data } = await getEstudianteByIdRequest(studentId);
        if (!alive) return;
        // API can return { data: {...} } or the object directly
        const est = data?.data ?? data ?? null;
        setAlumno(est);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "No se pudo cargar el alumno");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [studentId]);

  const nombreCompleto = useMemo(() => {
    const n = alumno?.nombres || alumno?.nombre || "";
    const a = alumno?.apellidos || alumno?.apellido || "";
    return `${n} ${a}`.trim() || "Alumno";
  }, [alumno]);

  const getInitials = (name) => {
    if (!name) return "AL";
    return name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const content = (
    <div className="w-full min-h-screen bg-transparent overflow-x-hidden">
      {/* Header band - Ocupa todo el ancho correctamente sin márgenes negativos */}
      <header className="relative isolate overflow-hidden bg-white border-b border-slate-200 shadow-sm w-full">
        {/* Contenedor interno con padding para el contenido */}
        <div className="relative w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-10 sm:py-12">
          <button
            onClick={() => navigate('/asesor/feedback')}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
            aria-label="Regresar"
          >
            <ArrowLeft className="size-4" /> Volver
          </button>
          
          {/* Avatar + title */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {!avatarError && alumno?.foto ? (
                <img
                  src={buildStaticUrl(alumno.foto)}
                  alt={nombreCompleto}
                  onError={() => setAvatarError(true)}
                  onClick={() => setShowPhotoModal(true)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-slate-200 shadow-xl cursor-zoom-in"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xl ring-4 ring-slate-200">
                  {getInitials(nombreCompleto)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 leading-tight">{nombreCompleto}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium">Folio: {alumno?.folio_formateado || alumno?.folio || '—'}</span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium">Grupo: {alumno?.grupo || '—'}</span>
                {alumno?.curso && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-sm font-medium">Curso: {alumno.curso}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal - Ocupa todo el ancho con padding adecuado */}
      <main className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-6 sm:py-8" aria-labelledby="feedback-title">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-white rounded-xl p-4 shadow-sm">
              <Loader2 className="size-4 animate-spin" /> Cargando alumno…
            </div>
          )}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
              {error}
            </div>
          )}
          {!loading && !error && (
            <FeedbackReview studentId={studentId} />
          )}
        </div>
      </main>
    </div>
  );

  if (embedded) {
    return (
      <>
        {content}
        {showPhotoModal && alumno?.foto && (
          <PhotoModal
            src={buildStaticUrl(alumno.foto)}
            alt={nombreCompleto}
            onClose={()=> setShowPhotoModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="feedback"
        onLogout={handleLogout}
      />

      {/* Contenido: compensado para topbar y sidebar fijos */}
      <div className="w-full pt-14 md:pl-24">
        <div className="flex">
          <SidebarIconOnly active="feedback" onLogout={handleLogout} />

          <main className="flex-1 min-h-[calc(100vh-3.5rem)] px-0 pt-0 pb-0 overflow-x-hidden">
            {content}
          </main>
        </div>
      </div>

      {showPhotoModal && alumno?.foto && (
        <PhotoModal
          src={buildStaticUrl(alumno.foto)}
          alt={nombreCompleto}
          onClose={()=> setShowPhotoModal(false)}
        />
      )}
    </div>
  );
}

function PhotoModal({ src, alt, onClose }){
  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Simple, no extra actions

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
  <div className="relative bg-white rounded-2xl shadow-2xl w-[92vw] sm:w-[88vw] max-w-2xl h-[72vh] overflow-hidden z-[71]" onClick={(e)=> e.stopPropagation()}>
        <div className="px-3 sm:px-4 py-2 bg-[#3d18c3] text-white flex items-center justify-between h-12">
          <div className="font-semibold text-xs sm:text-sm truncate">MQerk Academy · Foto de {alt}</div>
          <div>
            <button onClick={onClose} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs">
              <X className="size-3.5"/> Cerrar
            </button>
          </div>
        </div>
        <div className="h-[calc(72vh-48px)] bg-slate-50 p-3 sm:p-4 overflow-auto flex items-center justify-center">
          <img src={src} alt={alt} className="max-h-full max-w-full rounded-xl shadow-lg object-contain" />
        </div>
      </div>
    </div>
  );
}

