import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../../components/ParticlesBackground.jsx";

function Register() {
    const { signup, isVerde, errors } = useAuth();
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const datosRegistro = JSON.parse(localStorage.getItem('datosRegistro'));
    const datosRole = JSON.parse(localStorage.getItem('role')); 

    const onsubmite = handleSubmit(async (data) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const datosCompletos = {
                ...data,
                role: datosRole,
                id_estudiante: datosRegistro?.id,
            };
            await signup(datosCompletos);
        } finally {
            setSubmitting(false);
        }
    });

    useEffect(() => {
        if(isVerde){
            navigate('/login'); // Redirige al login después del registro
        }
    }, [isVerde, navigate]);

    // Título con efecto máquina de escribir (loop) + cursor que parpadea de forma real
    const useTypewriter = (
        text,
        {
            typeSpeed = 80,
            deleteSpeed = 40,
            startDelay = 300,
            pauseAfterWrite = 1100,
            pauseAfterDelete = 450,
            loop = true,
        } = {}
    ) => {
        const [idx, setIdx] = useState(0);
        const [phase, setPhase] = useState("idle"); // idle | typing | pausingAfterWrite | deleting | pausingAfterDelete
        const [caretOn, setCaretOn] = useState(true);

        // Parpadeo del cursor independiente del texto
        useEffect(() => {
            const iv = setInterval(() => setCaretOn((v) => !v), 520);
            return () => clearInterval(iv);
        }, []);

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
        }, [
            text,
            idx,
            phase,
            typeSpeed,
            deleteSpeed,
            startDelay,
            pauseAfterWrite,
            pauseAfterDelete,
            loop,
        ]);

        return { text: text.slice(0, idx), caretOn, phase };
    };
    
    const typew = useTypewriter("Crea tu cuenta en MQerkAcademy", {
        typeSpeed: 120,
        deleteSpeed: 60,
        startDelay: 300,
        pauseAfterWrite: 1300,
        pauseAfterDelete: 600,
        loop: true,
    });

    return (
        <div className="relative min-h-[100svh] md:min-h-[100dvh] w-full bg-gradient-to-br from-blue-900 via-indigo-700 to-purple-700 overflow-hidden">
            {/* Fondo con partículas (opcional) */}
            <ParticlesBackground className="opacity-40" color="255,255,255" linkDistance={140} density={12000} minCount={70} minCountMobile={40} maxSpeed={0.5} />

            {/* Contenedor */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[100svh] md:min-h-[100dvh] flex flex-col items-center justify-center gap-4 sm:gap-6 py-8">
                {/* Título pequeño con typewriter, sin sombras */}
                <h1 className="-mt-10 sm:-mt-12 text-center text-white/95 dark:text-white text-[clamp(1rem,3.5vw,1.6rem)] font-semibold tracking-tight" aria-live="polite" aria-atomic="true">
                    {typew.text}
                    <span className="ml-1 inline-block w-[1ch] align-baseline text-white/90" style={{ opacity: typew.caretOn ? 1 : 0 }}>|</span>
                </h1>
                
                {/* Tarjeta centrada */}
                <div className="w-full max-w-[24rem] sm:max-w-[28rem] md:max-w-[32rem]">
                    {/* Borde con degradado sutil */}
                    <div className="p-[1px] rounded-2xl bg-gradient-to-br from-white/70 via-white/20 to-transparent dark:from-zinc-700 dark:via-zinc-700/30 dark:to-transparent">
                        <div className="rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/70 dark:bg-zinc-900/70 dark:border-zinc-800">
                            <div className="px-6 py-6 sm:px-7 sm:py-7">
                                <div className="mb-5 text-center">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300">Crea tu usuario para continuar.</p>
                                </div>

                                {/* Errores */}
                                {Array.isArray(errors) && errors.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {errors.map((error, i) => (
                                            <div key={i} className="rounded-lg bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm dark:bg-red-900/30 dark:text-red-200 dark:border-red-800">
                                                {error}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={onsubmite} className="space-y-4">
                                    {/* Usuario */}
                                    <div>
                                        <label htmlFor="register-usuario" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Usuario</label>
                                        <div className="mt-2 relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400 dark:text-zinc-500">
                                                {/* user icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                                            </span>
                                            <input 
                                                id="register-usuario" 
                                                type="text" 
                                                autoComplete="username" 
                                                inputMode="text" 
                                                autoCapitalize="none" 
                                                autoCorrect="off"
                                                className="block w-full rounded-xl border border-zinc-300/80 bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-[#7a24d8] focus:border-[#7a24d8] pl-10 pr-3 py-2.5 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500 dark:border-zinc-700"
                                                placeholder="tu.usuario" 
                                                {...register("usuario", { required: true })} 
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <label htmlFor="register-password" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">Contraseña</label>
                                        <div className="mt-2 relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400 dark:text-zinc-500">
                                                {/* lock icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                            </span>
                                            <input 
                                                id="register-password" 
                                                type={showPwd ? "text" : "password"} 
                                                autoComplete="new-password" 
                                                autoCapitalize="none" 
                                                autoCorrect="off"
                                                className="block w-full rounded-xl border border-zinc-300/80 bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-[#7a24d8] focus:border-[#7a24d8] pl-10 pr-10 py-2.5 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500 dark:border-zinc-700"
                                                placeholder="••••••••" 
                                                {...register("contraseña", { required: true })} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPwd((v) => !v)} 
                                                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"} 
                                                className="absolute inset-y-0 right-2 inline-flex items-center px-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            >
                                                {showPwd ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.04-2.71 2.98-4.94 5.41-6.31"/><path d="M1 1l22 22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M6.1 6.1A10.94 10.94 0 0 1 12 4c5 0 9.27 3 11 8-.64 1.67-1.64 3.16-2.87 4.35"/></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Botón */}
                                    <button 
                                        type="submit" 
                                        disabled={submitting} 
                                        aria-busy={submitting}
                                        className={`w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-[#5115bc] to-[#E6007E] text-white px-5 py-3 text-base font-semibold shadow-lg shadow-fuchsia-600/20 dark:shadow-none transition ${submitting ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 active:scale-[.99]"}`}
                                    >
                                        {submitting ? "Creando…" : "Continuar →"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;