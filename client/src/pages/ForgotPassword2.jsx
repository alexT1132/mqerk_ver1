import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavLogin from '../components/common/auth/NavLogin.jsx';
import ParticlesBackground from '../components/common/ParticlesBackground.jsx';
import axios from '../api/axios.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Typewriter minimal (igual que Login): loop escribir/borrar + cursor real
  function useTypewriter(full = '', { typeMs = 85, delMs = 55, pauseMs = 1000 } = {}) {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState('typing'); // typing | pausing | deleting
    const [caretOn, setCaretOn] = useState(true);

    // Caret blink
    useEffect(() => {
      const iv = setInterval(() => setCaretOn(v => !v), 520);
      return () => clearInterval(iv);
    }, []);

    // Typing loop
    useEffect(() => {
      if (!full) return;
      if (phase === 'typing') {
        if (idx < full.length) {
          const t = setTimeout(() => setIdx(idx + 1), typeMs);
          return () => clearTimeout(t);
        } else {
          const t = setTimeout(() => setPhase('pausing'), pauseMs);
          return () => clearTimeout(t);
        }
      }
      if (phase === 'pausing') {
        const t = setTimeout(() => setPhase('deleting'), pauseMs);
        return () => clearTimeout(t);
      }
      if (phase === 'deleting') {
        if (idx > 0) {
          const t = setTimeout(() => setIdx(idx - 1), delMs);
          return () => clearTimeout(t);
        } else {
          setPhase('typing');
        }
      }
    }, [idx, phase, full, typeMs, delMs, pauseMs]);

    return { text: full.slice(0, idx), caretOn };
  }

  const typew = useTypewriter('RECUPERAR ACCESO', { typeMs: 85, delMs: 55, pauseMs: 950 });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!value.trim()) return setError('Ingresa tu usuario o correo');
    try {
      await axios.post('/password/forgot', { usuarioOrEmail: value.trim() });
      setSent(true);
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="overflow-hidden min-h-screen">
      <NavLogin />
      <div className="relative min-h-[100svh] md:min-h-[100dvh] w-full bg-gradient-to-br from-blue-900 via-indigo-700 to-purple-700 overflow-hidden">
        <ParticlesBackground className="opacity-40" color="255,255,255" linkDistance={140} density={12000} minCount={70} minCountMobile={40} maxSpeed={0.5} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[100svh] md:min-h-[100dvh] flex items-center justify-center py-10">
          <div className="w-full max-w-md">
            {/* Título pequeño con efecto máquina, sin sombras (igual que Login) */}
            <div className="-mt-16 sm:-mt-20 mb-2 text-center select-none">
              <span className="text-sm sm:text-base text-white/90 tracking-wide uppercase">
                {typew.text}
              </span>
              <span className="ml-1 inline-block w-[1ch] align-baseline text-white/90" style={{ opacity: typew.caretOn ? 1 : 0 }}>|</span>
            </div>
            <div className="p-[1px] rounded-2xl bg-gradient-to-br from-white/70 via-white/20 to-transparent">
              <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/70">
                <div className="px-6 py-6 sm:px-7 sm:py-7">
                  <header className="mb-4 text-center">
                    <h1 className="text-lg font-semibold text-zinc-900">¿Olvidaste tu contraseña?</h1>
                    <p className="mt-1 text-sm text-zinc-600">Te ayudamos a recuperarla.</p>
                  </header>

                  {!sent ? (
                    <form onSubmit={onSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-800" htmlFor="fp-valor">Usuario o correo</label>
                        <input id="fp-valor" value={value} onChange={(e)=>setValue(e.target.value)} placeholder="tu.usuario o correo@dominio.com"
                          className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3.5 py-2.5" />
                      </div>
                      {error && <div className="text-sm text-red-600">{error}</div>}
                      <button type="submit" className="w-full inline-flex justify-center items-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-5 py-3 text-base font-semibold shadow-lg transition hover:brightness-110 active:scale-[.99]">Enviar solicitud</button>
                      <button type="button" onClick={()=>navigate('/login')} className="w-full text-sm text-indigo-700 hover:text-indigo-900 font-medium">Volver al login</button>
                    </form>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="text-sm text-zinc-700">
                        Si existe una cuenta asociada, recibirás un correo con instrucciones para restablecer tu contraseña.
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={()=>navigate('/login')} className="text-sm text-indigo-700 hover:text-indigo-900 font-medium">Volver al inicio de sesión</button>
                        <Link to="/" className="text-sm text-zinc-600 hover:text-zinc-800">Ir al inicio</Link>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
