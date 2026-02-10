// CourseDetail.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../../../components/mqerk/Navbar";
import Footer from "../../../components/footer";
import Footer from "../../../components/layout/footer";
// TODO: Agregar imagen del curso cuando esté disponible
import Curso2 from "../../../assets/mqerk/preview/curso1/3.png";
import Curso2 from "../../../assets/mqerk/cursos/CURSO 1.webp";

// --- Ajusta este número (sin +, ni espacios). Ejemplo MX: 5215555555555
const WHATSAPP_PHONE = "522871515760";

const buildWaLink = (title, planLabel) => {
  const msg = `Hola, quiero inscribirme al curso "${title}"${planLabel ? ` con el plan "${planLabel}"` : ""
    }. ¿Me comparten más información?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
};

// --- Iconos inline (sin dependencias)
const IconCalendar = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" /><path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" /></svg>
);
const IconClock = (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" /><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" /></svg>);
const IconBook = (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3-3V4z" stroke="currentColor" /><path d="M7 17h10" stroke="currentColor" /></svg>);
const IconBolt = (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke="currentColor" /></svg>);
const IconStar = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 17.27 6.18 3.73-1.64-7.03L21 9.24l-7.19-.61L12 2 10.19 8.63 3 9.24l4.46 4.73L5.82 21z" /></svg>);
const IconShare = (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" strokeWidth="1.5" /></svg>);
const IconPlay = (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7-11-7Z" /></svg>);

// --- DEMO DATA (ajústalo a tu backend)
const COURSE = {
  title: "Entrenamiento para el Examen de Admisión a la Universidad",
  tagline: "Despierta todo tu potencial.",
  modalidad: "Presencial",
  clases: "+ 130 clases",
  horasDia: "2 h al dia",
  duracion: "8 meses",
  meta: "Rendimiento",
  rating: 4.5,
  likes: 350,
  videoThumb: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
  description:
    `Prepárate para tu examen de admisión con un curso diferente: olvida la memorización y enfócate en entender, aplicar y destacar. Con el método MQ+Disruptivo, recibirás acompañamiento personalizado, herramientas digitales, simuladores y estrategias que activan tu mente y refuerzan tu seguridad. Este no es un curso más: es una guía integral para ingresar a las mejores universidades pensando, resolviendo y avanzando con propósito.`,
  aprenderas: [
    "Técnicas para resolver reactivos de opción múltiple de forma eficiente.",
    "Estrategias de lectura y análisis de textos complejos.",
    "Fundamentos esenciales de ciencias naturales (física, química y biología).",
    "Habilidades para organizar el tiempo de estudio y mejorar la concentración.",
    "Seguridad, confianza y control del estrés antes y durante el examen.",
    "Uso de herramientas digitales para reforzar el aprendizaje.",
  ],
  areas: [
    "Entorno Social.",
    "Habilidades  cognitivas.",
    "Habilidades lógicas.",
    "Español y comprensión lectora.",
    "Redacción indirecta.",
    "Orientación Académica.",
    "Matemáticas.",
    "Ciencias exactas.",
    "Civica y Etica.",
    "Psicoeducación.",
    "Inglés.",
  ],
  precio: { label: "Mensual", actual: 1500, anterior: 2000, descuento: 25 },
  incluye: [
    "Guías digitales con ejercicios tipo examen",
    "Libros electrónicos en PDF",
    "Simuladores en línea",
    "Conferencias con expertos",
    "Acceso a nuestra plataforma educativa",
    "Orientación psicoeducativa",
  ],
  asesores: [
    { name: "Kelvin Ramírez", role: "Asesor CientTec" },
  ],
  otrosCursos: [
    { title: "Entrenamiento para el examen (prepa)", thumb: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1000&auto=format&fit=crop" },
  ],
};

// --- PLANES para el modal (ajusta montos / textos)
const PLANS = [
  {
    id: "mensual",
    name: "Mensual",
    badge: "Pago mes a mes",
    priceText: "$1,500 MXN",
    note: "Durante todo el curso",
    features: [
      "Acceso a plataforma educativa",
      "Guías con ejercicios tipo examen",
      "Libros electrónicos en PDF",
      "Simuladores en línea",
    ],
  },
  {
    id: "start",
    name: "Start",
    badge: "2 exhibiciones",
    priceText: "2 pagos de $5,500",
    note: "Inicio y mitad del curso",
    features: [
      "Acceso a plataforma educativa",
      "Guías con ejercicios tipo examen",
      "Libros electrónicos en PDF",
      "Simuladores en línea",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Pago único",
    priceText: "$10,500 MXN",
    note: "Mejor precio",
    features: [
      "Acceso a plataforma educativa",
      "Guías con ejercicios tipo examen",
      "Libros electrónicos en PDF",
      "Simuladores en línea",
    ],
  },
];

export default function CourseDetail() {
  const [tab, setTab] = useState("desc");
  const [showPlans, setShowPlans] = useState(false);

  const infoItems = useMemo(
    () => [
      { icon: IconCalendar, text: COURSE.modalidad },
      { icon: IconBook, text: COURSE.clases },
      { icon: IconClock, text: COURSE.horasDia },
      { icon: IconClock, text: COURSE.duracion },
      { icon: IconBolt, text: COURSE.meta },
    ],
    []
  );

  // Bloquea scroll cuando el modal está abierto + ESC para cerrar
  useEffect(() => {
    if (showPlans) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    const onKey = (e) => e.key === "Escape" && setShowPlans(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPlans]);

  const openPlans = useCallback(() => setShowPlans(true), []);
  const closePlans = useCallback(() => setShowPlans(false), []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-white">
            <div className="grid lg:grid-cols-2 items-center gap-10">
              <div>
                <p className="inline-flex items-center gap-2 text-sm/5 font-medium bg-white/10 px-3 py-1 rounded-full">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
                  {COURSE.tagline}
                </p>
                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                  {COURSE.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={buildWaLink(COURSE.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 font-semibold px-5 py-2.5 hover:bg-violet-50 transition"
                  >
                    Empieza ya
                  </a>
                </div>
              </div>

              {/* Imagen lateral */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm" />
                <img
                  src={Curso2}
                  alt="Curso"
                  className="absolute inset-0 h-full w-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Ola inferior minimal */}
          <div className="h-10 bg-white rounded-t-[2rem] -mt-6" />
        </section>

        {/* INFO STRIP */}
        <section id="info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-900">Información del curso</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {infoItems.map((it, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-3 shadow-sm">
                <it.icon className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">{it.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: media + tabs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video */}
              <div className="relative group">
                <div className="aspect-video rounded-2xl bg-gray-100 overflow-hidden shadow-sm">
                  <img
                    src={COURSE.videoThumb}
                    alt="Demo del curso"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <button
                  type="button"
                  className="absolute inset-0 m-auto h-14 w-14 grid place-items-center rounded-full bg-white/90 text-indigo-700 shadow-lg backdrop-blur border border-white/80 group-hover:scale-105 transition"
                  aria-label="Reproducir video"
                  onClick={() => window.alert("Tenemos dificultades al reproducir el video en este momento.")}
                >
                  <IconPlay className="w-6 h-6" />
                </button>
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">

                  <span className="ml-auto inline-flex items-center gap-1">
                    <IconShare className="w-4 h-4 text-gray-500" /> Compartir
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-gray-500">♥</span> {COURSE.likes}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="flex flex-wrap gap-2">
                  <TabBtn label="Descripción" active={tab === "desc"} onClick={() => setTab("desc")} />
                  <TabBtn label="Aprenderás" active={tab === "learn"} onClick={() => setTab("learn")} />
                  <TabBtn label="Áreas de enseñanza" active={tab === "areas"} onClick={() => setTab("areas")} />
                </div>
                <div className="mt-4 text-gray-700 leading-relaxed">
                  {tab === "desc" && <p className="whitespace-pre-line">{COURSE.description}</p>}
                  {tab === "learn" && (
                    <ul className="list-disc pl-5 space-y-2">
                      {COURSE.aprenderas.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  )}
                  {tab === "areas" && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {COURSE.areas.map((a) => (
                        <div key={a} className="rounded-lg border border-slate-200 px-3 py-2">{a}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Precio / Planes */}
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="text-xs font-medium text-indigo-700 uppercase tracking-wide">
                  {COURSE.precio.label}
                </div>
                <div className="mt-1 flex items-end gap-2">
                  <div className="text-3xl font-extrabold text-indigo-900">
                    ${COURSE.precio.actual.toLocaleString()} MXN
                  </div>
                  <div className="text-sm line-through text-gray-400">
                    ${COURSE.precio.anterior.toLocaleString()}
                  </div>
                  <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -{COURSE.precio.descuento}%
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {COURSE.incluye.map((s) => (
                    <div key={s} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href={buildWaLink(COURSE.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center rounded-xl bg-indigo-600 text-white font-semibold px-4 py-2.5 hover:bg-indigo-700 transition"
                  >
                    Inscribirme por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={openPlans}
                    className="rounded-xl border border-indigo-200 text-indigo-700 font-semibold px-4 py-2.5 hover:bg-indigo-50 transition"
                  >
                    Ver más planes
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Valoración</span>
                  <div className="ml-auto flex items-center gap-1" aria-label={`Rating ${COURSE.rating}`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} className={`w-5 h-5 ${i < Math.round(COURSE.rating) ? "text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{COURSE.rating}</span>
                </div>
              </div>

              {/* Asesores */}
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="font-semibold text-gray-900 mb-3">Asesores</div>
                <div className="space-y-3">
                  {COURSE.asesores.map((a) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100" />
                      <div>
                        <div className="font-medium text-gray-900">{a.name}</div>
                        <div className="text-xs text-gray-600">{a.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Otros cursos */}
              {/* <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                <div className="font-semibold text-gray-900 mb-3">Otros cursos</div>
                <div className="space-y-4">
                  {COURSE.otrosCursos.map((oc) => (
                    <a key={oc.title} href="#" className="flex items-center gap-3 group">
                      <img src={oc.thumb} alt={oc.title} className="h-16 w-24 object-cover rounded-xl border border-slate-200" />
                      <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{oc.title}</div>
                    </a>
                  ))}
                </div>
              </div> */}
            </aside>
          </div>
        </main>
      </div>

      {/* MODAL DE PLANES */}
      {showPlans && (
        <PlansModal
          title={COURSE.title}
          onClose={closePlans}
        />
      )}

      <Footer />
    </>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition
        ${active ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
    >
      {label}
    </button>
  );
}

/* ---------- Modal: minimal + responsive ---------- */
function PlansModal({ title, onClose }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-5xl">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-90 blur-md" aria-hidden />
        <div className="relative rounded-3xl bg-white/90 p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-900">Elige un plan a tu medida</h3>
              <p className="text-sm text-slate-600 mt-1">Selecciona la opción que mejor se adapte a tu forma de pago.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-auto h-10 w-10 rounded-full bg-white text-slate-600 shadow hover:bg-slate-50 grid place-items-center border border-slate-200"
            >
              ×
            </button>
          </div>

          {/* Grid de planes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={[
                  "rounded-2xl border bg-white/95 p-5 shadow-sm flex flex-col",
                  p.highlighted ? "border-indigo-300 ring-2 ring-indigo-200" : "border-slate-200"
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.highlighted ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                    }`}>
                    {p.badge}
                  </span>
                </div>

                <h4 className="mt-3 text-lg font-bold text-slate-900">{p.name}</h4>
                <div className="mt-1 text-2xl font-extrabold text-indigo-700">{p.priceText}</div>
                {p.note && <div className="text-xs text-slate-500">{p.note}</div>}

                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={buildWaLink(title, p.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    "mt-5 inline-flex justify-center items-center rounded-xl px-4 py-2.5 font-semibold transition",
                    p.highlighted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  ].join(" ")}
                >
                  Adquirir
                </a>
              </div>
            ))}
          </div>

          {/* Nota */}
          <p className="mt-5 text-xs text-slate-500">
            Nota: El proceso de pago se realiza una vez finalizado el registro en el formulario de MQerKAcademy.
            Los detalles correspondientes estarán en el panel principal (dashboard) de la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
