import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";
import loginIllustration from "../../../assets/2-removebg-preview.png";

/* ─── Typewriter hook ───────────────────────────────────────────── */
function useTypewriter(text, { typeSpeed=80, deleteSpeed=40, startDelay=300, pauseAfterWrite=1300, pauseAfterDelete=600, loop=true } = {}) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [caretOn, setCaretOn] = useState(true);
  useEffect(() => { const iv = setInterval(() => setCaretOn(v=>!v), 520); return () => clearInterval(iv); }, []);
  useEffect(() => {
    let t;
    if (phase==="idle") { t=setTimeout(()=>setPhase("typing"),startDelay); return ()=>clearTimeout(t); }
    if (phase==="typing") {
      if (idx<text.length) { const isPause=" .,".includes(text[idx]); t=setTimeout(()=>setIdx(idx+1),isPause?typeSpeed*1.9:typeSpeed); }
      else t=setTimeout(()=>setPhase("pausingAfterWrite"),pauseAfterWrite);
      return ()=>clearTimeout(t);
    }
    if (phase==="pausingAfterWrite") { t=setTimeout(()=>{ if(loop) setPhase("deleting"); },0); return ()=>clearTimeout(t); }
    if (phase==="deleting") {
      if (idx>0) t=setTimeout(()=>setIdx(idx-1),deleteSpeed);
      else t=setTimeout(()=>setPhase("pausingAfterDelete"),pauseAfterDelete);
      return ()=>clearTimeout(t);
    }
    if (phase==="pausingAfterDelete") { t=setTimeout(()=>setPhase("typing"),0); return ()=>clearTimeout(t); }
  }, [text,idx,phase,typeSpeed,deleteSpeed,startDelay,pauseAfterWrite,pauseAfterDelete,loop]);
  return { text: text.slice(0,idx), caretOn };
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function LoginResponsive() {
  const { register, handleSubmit, setValue } = useForm({ defaultValues: { rememberMe: true } });
  const { signin, isAuthenticated, user, errors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [focused, setFocused] = useState(null);
  const justLoggedInRef = useRef(false);

  const typew = useTypewriter("Bienvenido a MQerkAcademy", { typeSpeed:110, deleteSpeed:55, pauseAfterWrite:1600, pauseAfterDelete:500 });

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('reason')==='timeout') { setShowTimeoutMessage(true); navigate('/login',{replace:true}); }
  }, [location.search, navigate]);

  useEffect(() => {
    try { const s=localStorage.getItem('rememberedUsername'); if(s) setValue('usuario',s); } catch {}
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (submitting) return;
    setSubmitting(true); justLoggedInRef.current=false;
    try {
      if(data.rememberMe) localStorage.setItem('rememberedUsername',(data.usuario||'').trim());
      else localStorage.removeItem('rememberedUsername');
      await signin({ ...data, usuario:(data.usuario||"").trim(), contraseña:(data.contraseña||"").trim(), rememberMe:Boolean(data.rememberMe) });
      justLoggedInRef.current=true;
    } catch { justLoggedInRef.current=false; } finally { setSubmitting(false); }
  });

  useEffect(() => {
    if (!isAuthenticated||!user||location.pathname!=='/login'||!justLoggedInRef.current) return;
    setLoginSuccess(true); justLoggedInRef.current=false;
    const timer=setTimeout(()=>{
      const role=(user?.role||"").toLowerCase();
      if(["admin","administrador","administrativo"].includes(role)) return navigate("/administrativo",{replace:true});
      if(role==="estudiante") return navigate("/alumno",{replace:true});
      if(role==="asesor") { try{localStorage.removeItem("cursoSeleccionado")}catch{} return navigate("/asesor/inicio",{replace:true}); }
      navigate("/",{replace:true});
    },1200);
    return ()=>clearTimeout(timer);
  }, [isAuthenticated,user,navigate,location.pathname]);

  useEffect(() => {
    if(!loginSuccess) return;
    const t=setTimeout(()=>setLoginSuccess(false),1200);
    return ()=>clearTimeout(t);
  }, [loginSuccess]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          background: #2d1b5e;
          min-height: 100svh;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Animated gradient orbs — pastel, escalan por viewport */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.55;
          pointer-events: none;
          animation: orb-drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: min(650px, 95vw); height: min(650px, 95vw); background: radial-gradient(circle, #ec4899, transparent 70%); top:-15%; left:-10%; animation-delay:0s; opacity:0.4; }
        .orb-2 { width: min(550px, 85vw); height: min(550px, 85vw); background: radial-gradient(circle, #2563eb, transparent 70%); bottom:-10%; right:-10%; animation-delay:-5s; opacity:0.38; }
        .orb-3 { width: min(450px, 75vw); height: min(450px, 75vw); background: radial-gradient(circle, #7c3aed, transparent 70%); top:40%; left:30%; animation-delay:-9s; opacity:0.35; }

        @keyframes orb-drift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px,-20px) scale(1.05); }
          100% { transform: translate(-20px,30px) scale(0.97); }
        }

        /* Grid overlay — más suave en móvil */
        .grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        @media (min-width: 768px) { .grid-overlay { background-size: 60px 60px; } }

        /* Card — mobile first */
        .card-shell {
          position: relative; z-index:10;
          width: 100%; max-width: min(440px, calc(100vw - 2rem));
          margin: 1rem;
          padding: 2px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(236,72,153,0.5) 0%, rgba(124,58,237,0.3) 50%, rgba(37,99,235,0.45) 100%);
        }
        .card-body {
          background: rgba(18,12,42,0.8);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-radius: 19px;
          padding: 1.5rem 1.25rem;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .card-shell { margin: 1.5rem; border-radius: 24px; }
          .card-body { border-radius: 23px; padding: 2rem 1.75rem; }
        }
        @media (min-width: 768px) {
          .card-shell { margin: 2rem; }
          .card-body { padding: 2.5rem 2.25rem; }
        }
        .card-body::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(236,72,153,0.15), transparent);
          pointer-events:none;
        }

        /* Brand badge */
        .brand-badge {
          display: inline-flex; align-items:center; gap:8px;
          background: rgba(167,139,250,0.1);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 999px;
          padding: 6px 14px 6px 8px;
          margin-bottom: 1.5rem;
        }
        .brand-dot {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #7c3aed, #2563eb);
          display:flex; align-items:center; justify-content:center;
        }
        .brand-dot svg { width:14px; height:14px; color:#fff; }
        .brand-text { font-family:'Syne',sans-serif; font-size:0.78rem; font-weight:600; color:rgba(249,168,212,0.8); letter-spacing:.08em; text-transform:uppercase; }

        /* Heading — en móvil más pequeño para que no domine */
        .heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          color: #fdf2f8;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
          height: 2.4rem;
          white-space: nowrap;
          overflow: hidden;
        }
        @media (max-width: 1023px) {
          .heading { font-size: clamp(1rem, 3.2vw, 1.35rem); height: 1.75rem; min-height: 1.75rem; }
        }
        .heading-caret { color: #f472b6; animation: blink .9s step-end infinite; }
        @keyframes blink { 50% { opacity:0; } }

        .subheading { font-size: clamp(0.8rem, 2vw, 0.88rem); color:rgba(196,181,253,0.55); margin-bottom: clamp(1.25rem, 4vw, 2rem); font-weight:300; }

        /* Inputs */
        .field { margin-bottom: 1.1rem; }
        .field-label { display:block; font-size: clamp(0.72rem, 1.8vw, 0.78rem); font-weight:500; color:rgba(196,181,253,0.6); letter-spacing:.05em; text-transform:uppercase; margin-bottom:.5rem; }
        .field-wrap { position:relative; }
        .field-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(167,139,250,0.45); transition:color .2s; pointer-events:none; }
        .field-wrap.focused .field-icon { color:#c084fc; }
        .field-input {
          width:100%; box-sizing:border-box;
          min-height: 44px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(167,139,250,0.2);
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          color: #fdf2f8;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(0.9rem, 2.2vw, 0.95rem);
          font-weight: 400;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .field-input::placeholder { color:rgba(167,139,250,0.3); }
        .field-input:focus {
          border-color: rgba(192,132,252,0.7);
          background: rgba(124,58,237,0.08);
          box-shadow: 0 0 0 4px rgba(168,85,247,0.12);
        }
        .field-input.has-toggle { padding-right: 44px; }

        .pwd-toggle { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(167,139,250,0.4); padding:10px; border-radius:8px; display:flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; transition:color .2s; }
        .pwd-toggle:hover { color:#c4b5fd; }

        /* Checkbox row — en pantallas muy pequeñas se apila */
        .options-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:1.5rem; }
        @media (max-width: 380px) { .options-row { flex-direction:column; align-items:flex-start; } }
        .remember-label { display:flex; align-items:center; gap:8px; font-size:0.83rem; color:rgba(196,181,253,0.5); cursor:pointer; user-select:none; }
        .remember-label input[type=checkbox] { accent-color:#7c3aed; width:15px; height:15px; border-radius:4px; }
        .forgot-link { font-size:0.83rem; color:rgba(216,180,254,0.8); text-decoration:none; transition:color .2s; font-weight:500; }
        .forgot-link:hover { color:#f9a8d4; }

        /* Submit — área táctil mínima 44px */
        .submit-btn {
          width:100%; min-height: 44px; padding: 13px 16px;
          border:none; border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(0.9rem, 2.2vw, 0.95rem); font-weight: 700;
          letter-spacing: .04em;
          color:#fff;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 24px rgba(139,92,246,0.4), 0 1px 4px rgba(236,72,153,0.2);
          position: relative; overflow: hidden;
        }
        .submit-btn::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events:none;
        }
        .submit-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); box-shadow:0 8px 32px rgba(139,92,246,0.5); }
        .submit-btn:active:not(:disabled) { transform:translateY(0) scale(.99); }
        .submit-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* Alerts */
        .alert-timeout {
          display:flex; align-items:center; gap:8px;
          background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.4);
          border-radius:10px; padding:10px 12px; margin-bottom:1rem;
          font-size:0.83rem; color:rgba(251,191,36,0.9);
        }
        .alert-error {
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25);
          border-radius:10px; padding:10px 12px; margin-bottom:.6rem;
          font-size:0.83rem; color:rgba(252,129,129,0.95);
        }

        /* Success overlay */
        .success-overlay {
          position:fixed; inset:0; z-index:100;
          display:flex; align-items:center; justify-content:center;
          background:rgba(10,5,25,0.7); backdrop-filter:blur(8px);
          animation: fade-in .3s ease;
          pointer-events:none;
        }
        .success-card {
          background:rgba(18,10,40,0.97);
          border:1px solid rgba(167,139,250,0.2);
          border-radius: 20px;
          padding: clamp(1.5rem, 5vw, 2.5rem) clamp(1.5rem, 6vw, 3rem);
          text-align:center;
          box-shadow:0 20px 60px rgba(0,0,0,0.4);
          animation: pop-in .4s cubic-bezier(.175,.885,.32,1.275);
          max-width: min(360px, calc(100vw - 2rem));
        }
        .success-icon {
          width: clamp(48px, 12vw, 64px); height: clamp(48px, 12vw, 64px); border-radius:50%;
          background:linear-gradient(135deg,#22c55e,#16a34a);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 1rem;
          box-shadow:0 0 30px rgba(34,197,94,0.35);
        }
        .success-title { font-family:'Syne',sans-serif; font-size: clamp(1.1rem, 3vw, 1.3rem); font-weight:700; color:#ede9fe; margin-bottom:.4rem; }
        .success-sub { font-size: clamp(0.8rem, 2vw, 0.85rem); color:rgba(196,181,253,0.5); }
        .progress-track { height:3px; background:rgba(167,139,250,0.2); border-radius:99px; margin-top:1.5rem; overflow:hidden; }
        .progress-bar { height:100%; background:linear-gradient(90deg,#22c55e,#4ade80); border-radius:99px; animation:progress 1.1s ease-out forwards; }
        @keyframes progress { from{width:0} to{width:100%} }

        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes pop-in { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile layout — centrado en todos los viewports móviles */
        .mobile-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100svh;
          min-height: 100dvh;
          padding: 1rem 0.75rem;
          box-sizing: border-box;
        }
        @media (min-width: 480px) { .mobile-layout { padding: 1.5rem 1rem; } }
        @media (min-width: 768px) { .mobile-layout { padding: 2rem; } }

        /* Desktop split — a partir de lg (1024px) */
        .desktop-layout {
          display: none;
        }

        @media (min-width: 1024px) {
          .mobile-layout { display:none !important; }
          .desktop-layout {
            display:flex; min-height:100dvh; width:100%; max-width:100vw;
            position:relative; z-index:10;
          }
          .desktop-left {
            flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
            padding: 2rem 1.5rem;
            position:relative;
          }
          .desktop-left::after {
            content:''; position:absolute; right:0; top:10%; bottom:10%;
            width:1px;
            background:linear-gradient(to bottom, transparent, rgba(192,132,252,0.18) 30%, rgba(192,132,252,0.18) 70%, transparent);
          }
          .illus-heading {
            text-align: center;
            margin-bottom: 1.25rem;
            font-size: clamp(1.1rem, 1.8vw, 1.5rem);
            white-space: nowrap;
            overflow: hidden;
            color: #fdf2f8;
          }
          .illus-wrap { position:relative; width: 100%; max-width: 100%; display: flex; justify-content: center; align-items: center; }
          .illus-wrap img { max-height: 40vh; width: 100%; max-width: 100%; object-fit: contain; object-position: center; filter: drop-shadow(0 0 60px rgba(168,85,247,0.3)) drop-shadow(0 0 20px rgba(236,72,153,0.2)); }
          .illus-ring {
            position:absolute; inset:-40px; border-radius:50%;
            border:1px solid rgba(192,132,252,0.12);
            pointer-events:none;
            animation:ring-pulse 4s ease-in-out infinite;
          }
          .illus-ring-2 { inset:-80px; animation-delay:-2s; border-color:rgba(236,72,153,0.1); }
          @keyframes ring-pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
          .desktop-tagline { margin-top: 1.5rem; text-align: center; }
          .desktop-tagline p { font-size: clamp(0.7rem, 1vw, 0.8rem); color: rgba(249,168,212,0.35); letter-spacing: .12em; text-transform: uppercase; }
          .desktop-tagline strong { color: rgba(216,180,254,0.7); font-weight: 500; }

          .desktop-right {
            flex:1; display:flex; align-items:center; justify-content:center; padding: 2rem 1.5rem;
          }
          .desktop-right .card-shell { margin: 0; max-width: 400px; }
          .desktop-right .card-body { padding: 2.5rem 2rem; }
        }

        @media (min-width: 1280px) {
          .desktop-left { padding: 3rem 2rem; }
          .desktop-right { padding: 3rem 2rem; }
          .desktop-right .card-shell { max-width: 420px; }
          .desktop-right .card-body { padding: 3rem 2.75rem; }
          .illus-wrap img { max-height: 60vh; width: 100%; max-width: 100%; }
        }

        @media (min-width: 1536px) {
          .desktop-layout { max-width: 1536px; margin: 0 auto; }
          .desktop-left { padding: 3rem 2.5rem; }
          .desktop-right { padding: 3rem 2.5rem; }
          .desktop-right .card-shell { max-width: 440px; }
          .desktop-right .card-body { padding: 3rem 2.75rem; }
          .illus-wrap img { max-height: 72vh; width: 100%; max-width: 100%; }
        }
      `}</style>

      <div className="login-root">
        {/* Background blobs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        {/* Success overlay */}
        {loginSuccess && (
          <div className="success-overlay">
            <div className="success-card">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div className="success-title">¡Login exitoso!</div>
              <div className="success-sub">Redirigiendo a tu panel…</div>
              <div className="progress-track"><div className="progress-bar" /></div>
            </div>
          </div>
        )}

        {/* MOBILE */}
        <div className="mobile-layout" style={{position:'relative',zIndex:10,width:'100%',alignItems:'center',justifyContent:'center'}}>
          <h1 className="heading" aria-live="polite" style={{textAlign:'center',marginBottom:'0.5rem',color:'#fdf2f8'}}>
            {typew.text || <span>&nbsp;</span>}
            <span className="heading-caret" style={{opacity: typew.caretOn ? 1 : 0}}>|</span>
          </h1>
          <p className="subheading" style={{textAlign:'center',marginBottom:'1.25rem',color:'rgba(196,181,253,0.55)'}}>Inicia sesión para continuar</p>
          <FormCard {...{register,onSubmit,submitting,showPwd,setShowPwd,showTimeoutMessage,errors,focused,setFocused}} />
        </div>

        {/* DESKTOP */}
        <div className="desktop-layout">
          <div className="desktop-left">
            <h1 className="heading illus-heading" aria-live="polite">
              {typew.text || <span>&nbsp;</span>}
              <span className="heading-caret" style={{opacity: typew.caretOn ? 1 : 0}}>|</span>
            </h1>
            <div className="illus-wrap">
              <div className="illus-ring" />
              <div className="illus-ring illus-ring-2" />
              <img src={loginIllustration} alt="MQerk Academia" />
            </div>
            <div className="desktop-tagline">
              <p><strong>MQerkAcademy</strong> · Plataforma educativa</p>
            </div>
          </div>
          <div className="desktop-right">
            <FormCard {...{register,onSubmit,submitting,showPwd,setShowPwd,showTimeoutMessage,errors,focused,setFocused}} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Form Card (shared) ──────────────────────────────────────── */
function FormCard({register,onSubmit,submitting,showPwd,setShowPwd,showTimeoutMessage,errors,focused,setFocused}) {
  return (
    <div className="card-shell">
      <div className="card-body">
        {/* Brand */}
        <div className="brand-badge">
          <div className="brand-dot">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span className="brand-text">MQerkAcademy</span>
        </div>

        {/* Timeout */}
        {showTimeoutMessage && (
          <div className="alert-timeout">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Tu sesión expiró por inactividad.
          </div>
        )}

        {/* Errors */}
        {Array.isArray(errors) && errors.map((err,i)=>(
          <div key={i} className="alert-error">{err}</div>
        ))}

        {/* Form */}
        <form onSubmit={onSubmit}>
          {/* Usuario */}
          <div className="field">
            <label className="field-label" htmlFor="login-usuario">Usuario</label>
            <div className={`field-wrap ${focused==='usuario'?'focused':''}`}>
              <span className="field-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input id="login-usuario" type="text" autoComplete="username" autoCapitalize="none" autoCorrect="off"
                className="field-input"
                placeholder="tu.usuario"
                onFocus={()=>setFocused('usuario')}
                onBlur={()=>setFocused(null)}
                {...register("usuario",{required:true})}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="field">
            <label className="field-label" htmlFor="login-password">Contraseña</label>
            <div className={`field-wrap ${focused==='pwd'?'focused':''}`}>
              <span className="field-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input id="login-password" type={showPwd?"text":"password"} autoComplete="current-password" autoCapitalize="none"
                className="field-input has-toggle"
                placeholder="••••••••"
                onFocus={()=>setFocused('pwd')}
                onBlur={()=>setFocused(null)}
                {...register("contraseña",{required:true})}
              />
              <button type="button" className="pwd-toggle" onClick={()=>setShowPwd(v=>!v)} aria-label={showPwd?"Ocultar":"Mostrar"}>
                {showPwd
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.04-2.71 2.98-4.94 5.41-6.31"/><path d="M1 1l22 22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M6.1 6.1A10.94 10.94 0 0 1 12 4c5 0 9.27 3 11 8-.64 1.67-1.64 3.16-2.87 4.35"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="options-row">
            <label className="remember-label">
              <input type="checkbox" {...register("rememberMe")} /> Recuérdame
            </label>
            <Link to="/recuperar" className="forgot-link">¿Olvidaste tu contraseña?</Link>
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={submitting} aria-busy={submitting}>
            {submitting
              ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Iniciando sesión…
                </span>
              : "Iniciar sesión →"}
          </button>
        </form>
      </div>
    </div>
  );
}