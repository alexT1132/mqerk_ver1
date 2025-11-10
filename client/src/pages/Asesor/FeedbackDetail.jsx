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
    <>
      {/* Header band */}
      <header className="w-full sticky top-20 sm:top-24 z-10 -ml-5 -mr-3 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 py-2 bg-white/80 supports-[backdrop-filter]:backdrop-blur border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate('/asesor/feedback')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-200/70 hover:bg-slate-300 text-slate-800 shrink-0"
            >
              <ArrowLeft className="size-4" /> Volver
            </button>
            {/* Avatar + title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                {!avatarError && alumno?.foto ? (
                  <img
                    src={buildStaticUrl(alumno.foto)}
                    alt={nombreCompleto}
                    onError={() => setAvatarError(true)}
                    onClick={() => setShowPhotoModal(true)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-white shadow-md cursor-zoom-in"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow-md">
                    {getInitials(nombreCompleto)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 truncate leading-tight">{nombreCompleto}</h1>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Folio: {alumno?.folio_formateado || alumno?.folio || '—'}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Grupo: {alumno?.grupo || '—'}</span>
                  {alumno?.curso && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Curso: {alumno.curso}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-transparent rounded-none shadow-none p-0 sm:p-0 border-0">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <Loader2 className="size-4 animate-spin" /> Cargando alumno…
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <FeedbackReview studentId={studentId} />
        )}
      </section>
    </>
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
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="feedback"
        onLogout={handleLogout}
      />

      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="feedback" onLogout={handleLogout} />

          <main className="flex-1 px-0 sm:px-3 pt-1 sm:pt-2 pb-6 space-y-3">
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

