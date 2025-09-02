import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "./ParticlesBackground.jsx";

// Formulario de acceso con diseño moderno y responsivo
export default function LoginResponsive() {
  const { register, handleSubmit } = useForm({ defaultValues: { rememberMe: true } });
  const { signin, isAuthenticated, user, errors } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signin({
        ...data,
        usuario: (data.usuario || "").trim(),
        contraseña: (data.contraseña || "").trim(),
        rememberMe: Boolean(data.rememberMe),
      });
    } finally {
      setSubmitting(false);
    }
  });

  // Redirección según rol tras autenticación
  useEffect(() => {
    if (!isAuthenticated) return;
    const role = (user?.role || "").toLowerCase();
    if (role === "admin" || role === "administrador" || role === "administrativo") {
      navigate("/administrativo", { replace: true });
      return;
    }
    if (role === "estudiante") {
      navigate("/alumno", { replace: true });
      return;
    }
    if (role === "asesor") {
      navigate("/asesor/dashboard", { replace: true });
      return;
    }
    navigate("/", { replace: true });
  }, [isAuthenticated, user, navigate]);

  // Efecto de "máquina de escribir" con loop (escribe, pausa, borra, pausa)
  const useTypewriter = (
    text,
    {
      typeSpeed = 95,        // ms por carácter al escribir
      deleteSpeed = 45,      // ms por carácter al borrar
      startDelay = 400,      // espera inicial antes de empezar
      pauseAfterWrite = 1200,// pausa al terminar de escribir
      pauseAfterDelete = 500,// pausa al terminar de borrar
      loop = true,
    } = {}
  ) => {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState("idle"); // idle | typing | pausingAfterWrite | deleting | pausingAfterDelete

    useEffect(() => {
      let t;
      if (phase === "idle") {
        t = setTimeout(() => setPhase("typing"), startDelay);
        return () => clearTimeout(t);
      }

      if (phase === "typing") {
        if (idx < text.length) {
          const ch = text[idx];
          const isPause = ch === " " || ch === "," || ch === ".";
          t = setTimeout(() => setIdx(idx + 1), isPause ? typeSpeed * 1.9 : typeSpeed);
        } else {
          t = setTimeout(() => setPhase("pausingAfterWrite"), pauseAfterWrite);
        }
        return () => clearTimeout(t);
      }

      if (phase === "pausingAfterWrite") {
        t = setTimeout(() => {
          if (loop) setPhase("deleting");
        }, 0);
        return () => clearTimeout(t);
      }

      if (phase === "deleting") {
        if (idx > 0) {
          t = setTimeout(() => setIdx(idx - 1), deleteSpeed);
        } else {
          t = setTimeout(() => setPhase("pausingAfterDelete"), pauseAfterDelete);
        }
        return () => clearTimeout(t);
      }

      if (phase === "pausingAfterDelete") {
        t = setTimeout(() => setPhase("typing"), 0);
        return () => clearTimeout(t);
      }
    }, [text, idx, phase, typeSpeed, deleteSpeed, startDelay, pauseAfterWrite, pauseAfterDelete, loop]);

    return text.slice(0, idx);
  };

  const title = "Bienvenido a MQerkAcademy";
  const typedTitle = useTypewriter(title, {
    typeSpeed: 95,
    deleteSpeed: 45,
    startDelay: 400,
    pauseAfterWrite: 1200,
    pauseAfterDelete: 500,
    loop: true,
  });

  return (
    <div className="relative min-h-[calc(100dvh-0px)] w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
      {/* Partículas al fondo (ligero y sin dependencias) */}
      <ParticlesBackground
        className="opacity-80"
        color="255,255,255"
        linkDistance={160}
        density={14000}
        minCount={80}
        minCountMobile={48}
        maxSpeed={0.55}
      />
      {/* Capa de patrón sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.35),transparent_45%)]" />

      {/* Contenido centrado */}
  <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Título principal con efecto de escritura */}
        <h1
          className="text-center text-white font-black tracking-tight leading-tight mb-6 sm:mb-8 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]
          text-[clamp(1.1rem,5.2vw,2.2rem)] sm:text-[clamp(1.7rem,5.5vw,4.2rem)] lg:text-[clamp(2.2rem,4.5vw,4.8rem)]
          h-[2.6rem] sm:h-[6.0rem] lg:h-[7.2rem]
          overflow-hidden text-ellipsis whitespace-nowrap sm:whitespace-normal sm:line-clamp-2"
          aria-label={title}
          style={{
            textShadow:
              "0 2px 0 rgba(0,0,0,0.25), 0 6px 14px rgba(0,0,0,0.55), 0 12px 30px rgba(0,0,0,0.55)",
            letterSpacing: '-0.02em',
          }}
        >
          <span aria-live="polite" aria-atomic="true">{typedTitle}</span>
          <span className="ml-1 inline-block w-[1ch] align-baseline text-white/80 animate-pulse">|</span>
        </h1>

  {/* Tarjeta del formulario (glassmorphism) */}
        <div className="relative mx-auto w-full max-w-lg">
          {/* Halo para separar la tarjeta del fondo */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-20 -top-24 h-56 rounded-full bg-white/30 blur-3xl opacity-80"></div>

          <div className="relative rounded-3xl p-5 sm:p-8 backdrop-blur-2xl backdrop-saturate-150 bg-white/35 border border-white/50 shadow-[inset_0_1px_10px_rgba(255,255,255,0.22),_0_28px_80px_rgba(0,0,0,0.40)] ring-1 ring-white/70">
            <header className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Iniciar sesión</h2>
              <p className="mt-1 text-white/80 text-sm">Usa tus credenciales para continuar.</p>
            </header>

            {/* Errores de autenticación */}
            {Array.isArray(errors) && errors.length > 0 && (
              <div className="mb-4 space-y-2">
                {errors.map((error, i) => (
                  <div key={i} className="rounded-lg bg-red-600/20 text-red-100 border border-red-400/30 px-3 py-2 text-sm">
                    {error}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-usuario" className="block text-sm font-medium text-white">
                  Usuario
                </label>
                <input
                  id="login-usuario"
                  type="text"
                  className="mt-2 block w-full rounded-lg border border-white/60 bg-white/30 text-white placeholder-white/90 shadow-sm focus:border-white/80 focus:ring-white/80 focus:bg-white/40 px-3 py-2.5"
                  placeholder="tu.usuario"
                  autoCapitalize="none"
                  autoCorrect="off"
                  inputMode="email"
                  autoComplete="username"
                  {...register("usuario", { required: true })}
                />
              </div>

              <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-white">
                  Contraseña
                </label>
                <div className="mt-2 relative">
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    className="block w-full rounded-lg border border-white/60 bg-white/30 text-white placeholder-white/90 shadow-sm focus:border-white/80 focus:ring-white/80 focus:bg-white/40 px-3 py-2.5 pr-12"
                    placeholder="••••••••"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="current-password"
                    {...register("contraseña", { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute inset-y-0 right-2 inline-flex items-center px-2 text-white/80 hover:text-white"
                  >
                    {showPwd ? (
                      // eye-off icon
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.04-2.71 2.98-4.94 5.41-6.31"/><path d="M1 1l22 22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M6.1 6.1A10.94 10.94 0 0 1 12 4c5 0 9.27 3 11 8-.64 1.67-1.64 3.16-2.87 4.35"/></svg>
                    ) : (
                      // eye icon
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="remember-me" className="inline-flex items-center gap-2 text-sm text-white/90 select-none">
                  <input id="remember-me" type="checkbox" className="accent-white" {...register("rememberMe")} />
                  Recuérdame
                </label>
                <a href="#" className="text-sm text-white/90 hover:text-white font-medium">¿Olvidaste tu contraseña?</a>
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={`w-full inline-flex justify-center items-center rounded-xl bg-white text-indigo-700 px-4 py-2.5 font-semibold shadow-lg ring-1 ring-white/80 transition
                  ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white/90 active:scale-[.99]'}
                `}
              >
                {submitting ? 'Iniciando…' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
