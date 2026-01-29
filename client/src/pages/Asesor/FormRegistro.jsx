import NavLogin from "../../components/common/auth/NavLogin";
import { useState, useEffect, useRef } from "react";
import { buildApiUrl } from '../../utils/url.js';
import { usePreventPageReload } from "../../NoReload";
import {
  TextField,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { BtnForm } from "../../components/common/forms/FormRegistroComp";
import SignatureField from "../../components/common/forms/SignatureField.jsx";
import { useForm, Controller } from "react-hook-form";
import ActionSheetSelect from "../../components/ui/ActionSheetSelect.jsx";
import { useAsesor } from "../../context/AsesorContext";
import { useNavigate, useLocation } from "react-router-dom";

// import SignatureCanvas from `react-signature-canvas`

export const FormularioAsesor = ({ debugBypass = false }) => {
  usePreventPageReload();

  const { handleSubmit, register, getValues, setValue, watch, control } = useForm();

  const { datos1, preregistroId, loadPreRegistro } = useAsesor();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isBypass =
    debugBypass ||
    searchParams.has("debug") ||
    searchParams.get("bypass") === "1";
  // Gating: permitir acceso si viene aprobado desde resultados o si debugBypass
  const aprobadoFinal = (location.state && location.state.aprobadoFinal === true) || debugBypass || false;
  const [finalizing, setFinalizing] = useState(false);
  const [creds, setCreds] = useState(null);
  const [finalError, setFinalError] = useState(null);
  const [savingPerfil, setSavingPerfil] = useState(false);
  // const [perfilOk, setPerfilOk] = useState(false); // (no se usa, removido)
  const filesRef = useRef({});
  const confettiCanvasRef = useRef(null);
  const confettiStartedRef = useRef(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [curpError, setCurpError] = useState("");
  const [rfcError, setRfcError] = useState("");
  const [preValidateError, setPreValidateError] = useState("");
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [adicional1, setAdicional1] = useState("");
  const [fileErrors, setFileErrors] = useState({});
  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
  };

  const handleAdicional1Change = (e) => {
    setAdicional1(e.target.value);
  };

  // Try to compress images client-side to be below MAX_FILE_BYTES
  const compressImageBelowLimit = async (file, maxBytes = MAX_FILE_BYTES) => {
    if (!file || !file.type?.startsWith("image/")) return file;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let { width, height } = img;
      // Start with original size; we will reduce quality and, if needed, scale down
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.9;
      let blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
      // If still too big, iteratively reduce quality and scale
      let scale = 1.0;
      for (let iter = 0; blob && blob.size > maxBytes && iter < 10; iter++) {
        if (quality > 0.4) {
          quality -= 0.1;
        } else {
          // reduce dimensions by 10% when quality is already low
          scale *= 0.9;
          const newW = Math.max(300, Math.round(width * scale));
          const newH = Math.max(300, Math.round(height * scale));
          if (newW !== canvas.width || newH !== canvas.height) {
            canvas.width = newW;
            canvas.height = newH;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
      }
      if (blob && blob.size < file.size) {
        const compressed = new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, "-compressed.jpg"), {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        return compressed;
      }
      return file;
    } catch (e) {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleFileInput = (key) => async (e) => {
    const file = e.target.files?.[0] || null;
    setFileErrors((prev) => ({ ...prev, [key]: "" }));
    if (!file) {
      filesRef.current[key] = null;
      return;
    }
    if (file.size <= MAX_FILE_BYTES) {
      filesRef.current[key] = file;
      return;
    }
    if (file.type?.startsWith("image/")) {
      // try compressing
      const compressed = await compressImageBelowLimit(file);
      if (compressed && compressed.size <= MAX_FILE_BYTES) {
        filesRef.current[key] = compressed;
        setFileErrors((prev) => ({
          ...prev,
          [key]: `Se comprimió la imagen automáticamente (nuevo tamaño ${(compressed.size / (1024 * 1024)).toFixed(2)} MB).`,
        }));
        return;
      } else {
        filesRef.current[key] = null;
        e.target.value = "";
        setFileErrors((prev) => ({
          ...prev,
          [key]: "La imagen excede 5 MB y no pudo comprimirse lo suficiente. Reduce la resolución o usa un compresor antes de subirla.",
        }));
        return;
      }
    }
    // Non-image (PDF u otros): no se comprime en el navegador
    filesRef.current[key] = null;
    e.target.value = "";
    setFileErrors((prev) => ({
      ...prev,
      [key]: "El archivo excede 5 MB. Usa un compresor (p. ej., PDF: reduce resolución o compresión con una herramienta online) y vuelve a intentarlo.",
    }));
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const onSubmit = handleSubmit((data) => {
    const seleccionados = Object.entries(data)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  });

  const [inputsVisibility, setInputsVisibility] = useState({
    departamento: false,
    area: false,
    crm: false,
    softwarecontabilidad: false,
    plataforma: false,
  });

  const mostrarCampoDeTexto = (event) => {
    const { name, checked } = event.target;
    setInputsVisibility((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (!datos1 && preregistroId) {
      loadPreRegistro();
    }
    if (!datos1 && !preregistroId && !isBypass) {
      navigate("/pre_registro");
    }
    // Si no está aprobado y no estamos en bypass, pedir volver a resultados
    if (!aprobadoFinal && !isBypass) {
      navigate('/resultados');
    }
  }, [datos1, preregistroId, isBypass, aprobadoFinal]);

  // Confeti al mostrar credenciales
  useEffect(()=>{
    if(!showCredsModal || !creds || !confettiCanvasRef.current || confettiStartedRef.current) return;
    confettiStartedRef.current = true;
    const canvas = confettiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pieces = Array.from({length: 150}).map(()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*-window.innerHeight,
      r: 5+Math.random()*8,
      c: `hsl(${Math.random()*360},80%,60%)`,
      vx: (Math.random()-0.5)*1.2,
      vy: 2+Math.random()*3,
      rot: Math.random()*Math.PI,
      vr: (Math.random()-0.5)*0.2
    }));
    let animId;
    const resize = ()=>{
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const step = ()=>{
      ctx.clearRect(0,0,canvas.width, canvas.height);
      pieces.forEach(p=>{
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if(p.y - p.r > canvas.height) { p.y = -10; p.x = Math.random()*canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
        ctx.restore();
      });
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    // detener después de 6s
    const timeout = setTimeout(()=>{ cancelAnimationFrame(animId); }, 6000);
    return ()=>{
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      clearTimeout(timeout);
      confettiStartedRef.current = false;
    };
  }, [showCredsModal, creds]);

  const displayDatos =
    datos1 || (isBypass ? { nombres: "Debug", apellidos: "Bypass" } : null);
  if (!aprobadoFinal && !isBypass) {
    return <div className="p-10 text-center text-sm">Redirigiendo a resultados...</div>;
  }
  if (!displayDatos) {
    return <div className="p-10 text-center">Cargando datos...</div>;
  }

  return (
    <>
      <NavLogin />
      {/* Modal de credenciales con confeti */}
      {showCredsModal && creds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=> setShowCredsModal(false)} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-5 animate-fade-in overflow-hidden">
            <canvas ref={confettiCanvasRef} className="pointer-events-none absolute inset-0 w-full h-full" />
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-4xl" aria-hidden="true">🎉</div>
              <h2 className="text-xl font-bold text-emerald-700">Registro completado</h2>
              <p className="text-sm text-gray-700">Estas son tus credenciales de acceso. Guárdalas en un lugar seguro.</p>
            </div>
            <div className="w-full border rounded-lg p-3 bg-emerald-50 border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div><span className="font-semibold">Usuario:</span> {creds.usuario}</div>
              <div><span className="font-semibold">Contraseña:</span> {creds.password}</div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${creds.usuario} ${creds.password}`)}
                className="mt-1 inline-block px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
              >Copiar</button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const contenido = `Credenciales MQerKAcademy\n\nUsuario: ${creds.usuario}\nContraseña: ${creds.password}\n\nGuárdalas en un lugar seguro.`;
                    const blob = new Blob([contenido], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `credenciales_mqerk_${creds.usuario}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
                  } catch(_e) {}
                }}
                className="mt-1 inline-block px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white"
              >Descargar .txt</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={()=> setShowCredsModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
              >Cerrar</button>
              <button
                onClick={()=> navigate('/login')}
                className="w-full sm:w-auto px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
              >Ir a inicio de sesión</button>
            </div>
            <div className="text-[11px] text-gray-400 text-center">Puedes volver a copiar tus credenciales mientras permanezcas en esta página.</div>
          </div>
        </div>
      )}
      {step === 0 && (
        <div className={`flex flex-col py-5 px-5 items-center`}>
          <div className={`flex flex-col items-center justify-center`}>
            <h1
              className={`text-center font-bold uppercase text-[17px] sm:text-3xl`}
            >
              Bienvenid@:{" "}
              {displayDatos
                ? `${displayDatos.nombres} ${displayDatos.apellidos}`
                : "..."}
            </h1>

            <p
              className={`flex flex-wrap text-justify p-3 w-full max-w-[640px] md:max-w-[800px] lg:max-w-[920px] sm:text-md leading-relaxed md:leading-loose md:px-2`}
            >
              Como parte de nuestro proceso de reclutamiento de asesores, es
              fundamental llevar un registro detallado. Por ello, te invitamos a
              completar cuidadosamente el formulario siguiendo las instrucciones
              proporcionadas.
            </p>

            <h2
              className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
            >
              1. Información personal
            </h2>

            <p className={`text-justify p-3 w-full max-w-[640px] md:max-w-[800px] lg:max-w-[920px] sm:text-md leading-relaxed md:leading-loose md:px-2`}>
              Por favor, completa cada campo de esta sección con tus datos
              personales de manera precisa y actualizada. Asegúrate de verificar
              la información antes de enviarla.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              // Si hay preregistroId y cambios en datos básicos, actualizar
              if (preregistroId) {
                try {
                  const nombres = getValues("nombres");
                  const apellidos = getValues("apellidos");
                  const correo = getValues("correo");
                  const telefono = getValues("telefono");
                  const area = datos1?.area; // no editable aquí (opcional luego)
                  const estudios = datos1?.estudios;
                  await fetch(buildApiUrl(`/asesores/preregistro/${preregistroId}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombres, apellidos, correo, telefono, area, estudios })
                  });
                } catch (err) {
                  console.warn("No se pudo actualizar preregistro", err);
                }
              }
              nextStep();
            }}
            className="w-full max-w-[640px] md:max-w-[880px] lg:max-w-[960px] mx-auto p-4 sm:p-6 md:p-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow md:shadow-none"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre(s)
                </label>
                <Controller
                  control={control}
                  name="nombres"
                  defaultValue={datos1?.nombres || ""}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur, ref } }) => (
                    <input
                      type="text"
                      ref={ref}
                      value={value || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        onChange(e.target.value);
                      }}
                      onBlur={onBlur}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                      required
                      autoComplete="off"
                    />
                  )}
                />
              </div>
              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <Controller
                  control={control}
                  name="apellidos"
                  defaultValue={datos1?.apellidos || ""}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur, ref } }) => (
                    <input
                      type="text"
                      ref={ref}
                      value={value || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        onChange(e.target.value);
                      }}
                      onBlur={onBlur}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                      required
                      autoComplete="off"
                    />
                  )}
                />
              </div>
              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  defaultValue={datos1?.correo}
                  {...register("correo")}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  required
                />
              </div>
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  defaultValue={datos1?.telefono}
                  {...register("telefono")}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  required
                />
              </div>
              {/* CURP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CURP (opcional para autocompletar)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  {...register("curp")}
                  onChange={(e) => {
                    const raw = (e.target.value || "").toUpperCase();
                    setValue("curp", raw);
                    if (raw.length < 18) {
                      setCurpError("");
                      return;
                    }
                    const curp = raw;
                    const regex =
                      /^([A-ZÑ]{4})(\d{2})(\d{2})(\d{2})([HM])(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)([B-DF-HJ-NP-TV-Z]{3})([0-9A-Z])(\d)$/;
                    if (!regex.test(curp)) {
                      setCurpError("Formato CURP inválido");
                      return;
                    }
                    // Si válido se limpia error pero derivaciones se harán en blur para evitar sobrescribir mientras escribe.
                    setCurpError("");
                  }}
                  onBlur={() => {
                    const raw = getValues("curp");
                    if (!raw) {
                      setCurpError("");
                      return;
                    }
                    const curp = raw.toUpperCase();
                    const regex =
                      /^([A-ZÑ]{4})(\d{2})(\d{2})(\d{2})([HM])(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TL|TS|VZ|YN|ZS|NE)([B-DF-HJ-NP-TV-Z]{3})([0-9A-Z])(\d)$/;
                    if (!regex.test(curp)) {
                      setCurpError("Formato CURP inválido");
                      return;
                    }
                    const parts = curp.match(regex);
                    if (!parts) {
                      setCurpError("Formato CURP inválido");
                      return;
                    }
                    const yy = parts[2];
                    const mm = parts[3];
                    const dd = parts[4];
                    const year = Number(yy) <= 30 ? "20" + yy : "19" + yy; // rango simple
                    const iso = `${year}-${mm}-${dd}`;
                    const dateObj = new Date(iso);
                    if (
                      isNaN(dateObj.getTime()) ||
                      mm < "01" ||
                      mm > "12" ||
                      dd < "01" ||
                      dd > "31"
                    ) {
                      setCurpError("Fecha inválida en CURP");
                      return;
                    }
                    const sexo = parts[5] === "H" ? "masculino" : "femenino";
                    const estado = parts[6];
                    const estadoMap = {
                      AS: "Aguascalientes",
                      BC: "Baja California",
                      BS: "Baja California Sur",
                      CC: "Campeche",
                      CL: "Coahuila",
                      CM: "Colima",
                      CS: "Chiapas",
                      CH: "Chihuahua",
                      DF: "Ciudad de México",
                      DG: "Durango",
                      GT: "Guanajuato",
                      GR: "Guerrero",
                      HG: "Hidalgo",
                      JC: "Jalisco",
                      MC: "Estado de México",
                      MN: "Michoacán",
                      MS: "Morelos",
                      NT: "Nayarit",
                      NL: "Nuevo León",
                      OC: "Oaxaca",
                      PL: "Puebla",
                      QT: "Querétaro",
                      QR: "Quintana Roo",
                      SP: "San Luis Potosí",
                      SL: "Sinaloa",
                      SR: "Sonora",
                      TC: "Tabasco",
                      TL: "Tlaxcala",
                      TS: "Tamaulipas",
                      VZ: "Veracruz",
                      YN: "Yucatán",
                      ZS: "Zacatecas",
                      NE: "Nacido en el Extranjero",
                    };
                    if (!getValues("nacimiento")) setValue("nacimiento", iso);
                    if (!getValues("genero")) setValue("genero", sexo);
                    if (!getValues("entidad_curp"))
                      setValue("entidad_curp", estadoMap[estado] || estado);
                    if (!getValues("nacionalidad") && estado !== "NE")
                      setValue("nacionalidad", "Mexicana");
                    // Autocompletar prefijo RFC (primeros 10 chars: 4 letras + fecha YYMMDD)
                    const rfcActual = (getValues("rfc") || "").toUpperCase();
                    const rfcPrefijo = curp.slice(0, 10); // Ej: ABCD010101
                    if (
                      !rfcActual ||
                      rfcActual.length < 10 ||
                      !rfcActual.startsWith(rfcPrefijo)
                    ) {
                      setValue("rfc", rfcPrefijo); // El usuario añadirá homoclave (3) manualmente
                    }
                    setCurpError("");
                  }}
                  className={`w-full uppercase border rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f] ${
                    curpError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="INGC010101HDFRRN09"
                />
                {curpError && (
                  <p className="text-xs text-red-600 mt-1">{curpError}</p>
                )}
              </div>
              {/* Entidad derivada de CURP (solo lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entidad (derivada CURP)
                </label>
                <input
                  type="text"
                  readOnly
                  {...register("entidad_curp")}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-600"
                  placeholder="—"
                />
              </div>
              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  {...register("direccion")}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  placeholder="Calle, número, colonia..."
                  required
                />
              </div>

              {/* Municipio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Municipio
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  placeholder="Tu municipio"
                  {...register("municipio")}
                  required
                />
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  {...register("nacimiento")}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                />
              </div>

              {/* Nacionalidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  placeholder="Mexicana, etc."
                  {...register("nacionalidad")}
                  required
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <Controller
                  control={control}
                  name="genero"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <>
                      {/* Móvil: ActionSheetSelect */}
                      <div className="md:hidden">
                        <ActionSheetSelect
                          id="genero"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Selecciona"
                          options={[
                            { value: "", label: "Selecciona" },
                            { value: "masculino", label: "Masculino" },
                            { value: "femenino", label: "Femenino" },
                            { value: "otro", label: "Otro" },
                          ]}
                        />
                      </div>
                      {/* Escritorio: select nativo controlado */}
                      <select
                        className="hidden md:block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Selecciona
                        </option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </>
                  )}
                />
              </div>

              {/* RFC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f] tracking-wider uppercase ${
                    rfcError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ABCD010101XXX"
                  maxLength={13}
                  {...register("rfc")}
                  onChange={(e) => {
                    const val = (e.target.value || "").toUpperCase();
                    setValue("rfc", val);
                    if (!val) {
                      setRfcError("");
                      return;
                    }
                    const fullRegex = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;
                    if (val.length < 13) {
                      // Validar prefijo si hay CURP válido
                      const curp = (getValues("curp") || "").toUpperCase();
                      if (
                        curp.length === 18 &&
                        !val.startsWith(curp.slice(0, 10))
                      ) {
                        setRfcError("Prefijo no coincide con CURP");
                      } else setRfcError("RFC incompleto");
                      return;
                    }
                    if (!fullRegex.test(val)) {
                      setRfcError("Formato RFC inválido");
                      return;
                    }
                    const curp = (getValues("curp") || "").toUpperCase();
                    if (
                      curp.length === 18 &&
                      !val.startsWith(curp.slice(0, 10))
                    ) {
                      setRfcError("Prefijo no coincide con CURP");
                      return;
                    }
                    setRfcError("");
                  }}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se autocompleta el prefijo (10 caracteres). Ingresa la
                  homoclave final (3).{" "}
                  {rfcError && <span className="text-red-600">{rfcError}</span>}
                </p>
              </div>
            </div>

            <div className="mt-6 text-center flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Siguiente
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 1 && (
        <div
          className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}
        >
          <div className={`flex flex-col items-center`}>
            <h1
              className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
            >
              2. Información académica
            </h1>

            <p
              className={`text-justify p-3 w-full max-w-[640px] md:max-w-[800px] lg:max-w-[920px] sm:text-md leading-relaxed md:leading-loose md:px-2`}
            >
              Proporciona los detalles de tu formación académica y
              certificaciones adicionales. Incluye información completa y
              específica sobre tu nivel de estudios, títulos obtenidos, idiomas
              que dominas y cualquier curso relevante que respalde tu
              experiencia profesional.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
            className="w-full max-w-[640px] md:max-w-[880px] lg:max-w-[960px] mx-auto p-4 sm:p-6 md:p-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow md:shadow-none"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de estudios
                </label>
                <Controller
                  control={control}
                  name="estudios"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <>
                      {/* Móvil */}
                      <div className="md:hidden">
                        <ActionSheetSelect
                          id="nivel_estudios"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Selecciona una opción"
                          options={[
                            { value: "", label: "Selecciona una opción" },
                            { value: "secundaria", label: "Secundaria" },
                            { value: "preparatoria", label: "Preparatoria" },
                            { value: "licenciatura", label: "Licenciatura" },
                            { value: "maestria", label: "Maestría" },
                            { value: "doctorado", label: "Doctorado" },
                          ]}
                        />
                      </div>
                      {/* Escritorio */}
                      <select
                        className="hidden md:block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Selecciona una opción
                        </option>
                        <option value="secundaria">Secundaria</option>
                        <option value="preparatoria">Preparatoria</option>
                        <option value="licenciatura">Licenciatura</option>
                        <option value="maestria">Maestría</option>
                        <option value="doctorado">Doctorado</option>
                      </select>
                    </>
                  )}
                />
              </div>
            {/* Institución */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institución
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                placeholder="Nombre de la universidad o escuela"
                {...register("institucion")}
                required
              />
            </div>

            {/* Título académico */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título academico
              </label>
              <Controller
                control={control}
                name="titulo"
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    {/* Móvil */}
                    <div className="md:hidden">
                      <ActionSheetSelect
                        id="titulo_academico"
                        value={field.value ?? ""}
                        onChange={(val) => {
                          field.onChange(val);
                          setTitulo(val);
                        }}
                        placeholder="Selecciona una opción"
                        options={[
                          { value: "", label: "Selecciona una opción" },
                          { value: "si", label: "Si" },
                          { value: "no", label: "No" },
                        ]}
                      />
                    </div>
                    {/* Escritorio */}
                    <select
                      className="hidden md:block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setTitulo(e.target.value);
                      }}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      <option value="si">Si</option>
                      <option value="no">No</option>
                    </select>
                  </>
                )}
              />
            </div>

            {titulo === "si" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subir su titulo aqui
                </label>
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
                  onChange={handleFileInput("titulo_archivo")}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 5 MB. Las imágenes se comprimen automáticamente si es posible.</p>
                {fileErrors["titulo_archivo"] && (
                  <p className="text-xs text-red-600 mt-1">{fileErrors["titulo_archivo"]}</p>
                )}
              </div>
            )}

            {/* Año de graduación */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año de graduación
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                placeholder="Ej. 2020"
                {...register("graduacion")}
                required
                min="1900"
                max="2099"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificaciones o cursos adicionales
              </label>
              <input
                type="file"
                onChange={handleFileInput("certificaciones_archivo")}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["certificaciones_archivo"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["certificaciones_archivo"]}</p>
              )}
            </div>

            {/* Botón de enviar */}
            <div className="sm:col-span-2 text-center flex justify-end mt-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div
          className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}
        >
          <article className="flex flex-col items-center">
            <h1
              className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
            >
              3. Información profesional
            </h1>

            <p
              className={`text-justify p-3 w-full max-w-[640px] md:max-w-[800px] lg:max-w-[920px] sm:text-md leading-relaxed md:leading-loose md:px-2`}
            >
              Ingresa la información relacionada con tu experiencia profesional,
              incluyendo roles previos, instituciones donde has trabajado, y
              áreas de especialización. Esta información nos ayudará a evaluar
              mejor tu perfil como colaborador.
            </p>
          </article>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(e);
              nextStep();
            }}
            className={`w-full max-w-[640px] md:max-w-[880px] lg:max-w-[960px] mx-auto flex flex-col gap-6 p-4 sm:p-6 md:p-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow md:shadow-none`}
          >
            {/* Área de interés o departamento al que aplicas:
             */}

            <FormControl className="w-full">
              <FormLabel id="radio-buttons-group-label"></FormLabel>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                Experiencia laboral
              </h2>
              <div className="space-y-4 text-gray-800 mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="menos1 años"
                    {...register("experiencia")}
                    className="accent-purple-600"
                  />
                  Menos de 1 año
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="1-2 años"
                    {...register("experiencia")}
                    className="accent-purple-600"
                  />
                  1-2 años
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="3-5 años"
                    {...register("experiencia")}
                    className="accent-purple-600"
                  />
                  3-5 años
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="mas5 años"
                    {...register("experiencia")}
                    className="accent-purple-600"
                  />
                  Más de 5 años
                </label>
              </div>
            </FormControl>

            <FormGroup className={`w-full`}>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                Áreas de especialización
              </h2>
              <div className="space-y-4 text-gray-800">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Ciencias exactas")}
                    className="accent-purple-600"
                  />
                  Ciencias exactas
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Ciencias sociales")}
                    className="accent-purple-600"
                  />
                  Ciencias sociales
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Educación")}
                    className="accent-purple-600"
                  />
                  Educación
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Ingeniería y tecnologia")}
                    className="accent-purple-600"
                  />
                  Ingeniería y tecnologia
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Medicina y salud")}
                    className="accent-purple-600"
                  />
                  Medicina y salud
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Arte y humanidades")}
                    className="accent-purple-600"
                  />
                  Arte y humanidades
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("Negocios y administración")}
                    className="accent-purple-600"
                  />
                  Negocios y administración
                </label>

                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                    placeholder="Otra/s (especifica)"
                    {...register("otra")}
                  />
                </div>
              </div>
            </FormGroup>

            <FormControl className={`w-full`}>
              <FormLabel id="radio-buttons-group-label"></FormLabel>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                ¿Ha tenido experiencia previa en asesorías o tutorías
                educativas?
              </h2>
              <RadioGroup
                className={`justify-around`}
                row
                aria-labelledby="radio-buttons-group-label"
                name="radio-buttons-group"
                {...register("pregunta1")}
              >
                <FormControlLabel value="si" control={<Radio />} label="Sí" />
                <FormControlLabel
                  value="medianamente"
                  control={<Radio />}
                  label="Medianamente"
                />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <fieldset className={`w-full flex flex-col gap-4`}>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                Informacion sobre institución/empresa
              </h2>

              <div className={`flex flex-col gap-5`}>
                <TextField
                  label="Empresa"
                  variant="outlined"
                  helperText="ej. GEGSA, Login360."
                  multiline
                  {...register("empresa")}
                  fullWidth
                  required
                />

                <TextField
                  label="Actual/último puesto de trabajo"
                  variant="outlined"
                  helperText="ej. Gerente general"
                  multiline
                  {...register("ultimo_puesto")}
                  fullWidth
                  required
                />

                {/* Funciones y responsabilidades en el puesto anterior: */}
                <TextField
                  label="Funiones/responsabilidades"
                  variant="outlined"
                  helperText="Explica de forma detallada las funciones que realizabas en tu anterios puesto."
                  multiline
                  {...register("funsiones")}
                  rows={4}
                  fullWidth
                  required
                />
              </div>
            </fieldset>

            <FormGroup className={`w-full`}> 
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                Conocimientos en plataformas educativas digitales
              </h2>
              <FormControlLabel
                control={<Checkbox {...register("plat_google_classroom")} />}
                label="Google Classroom"
              />
              <FormControlLabel
                control={<Checkbox {...register("plat_microsoft_teams")} />}
                label="Microsoft Teams"
              />
              <FormControlLabel
                control={<Checkbox {...register("plat_zoom")} />}
                label="Zoom"
              />
              <FormControlLabel
                control={<Checkbox {...register("plat_moodle")} />}
                label="Moodle"
              />
              <FormControlLabel
                control={<Checkbox {...register("plat_edmodo")} />}
                label="Edmodo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="plataforma"
                    checked={inputsVisibility.plataforma}
                    onChange={mostrarCampoDeTexto}
                  />
                }
                label="Otra (especificar)"
              />
              {inputsVisibility.plataforma && (
                <TextField
                  {...register("plataformas2")}
                  maxRows={5}
                  multiline
                  label="Especifique las plataformas"
                  variant="outlined"
                />
              )}
            </FormGroup>

            <div className="w-full flex justify-end">
              <BtnForm type={`submit`} TextoBtn={`Siguiente`} />
            </div>
          </form>
        </div>
      )}

      {step === 3 && (
        <div
          className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}
        >
          <article className="flex flex-col items-center">
            <h1
              className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
            >
              4. Documentos personales y oficiales
            </h1>

            <p
              className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}
            >
              Adjunta en formato PDF los documentos personales y oficiales
              requeridos, que respalde tu registro. Asegúrate de que todos los
              archivos sean legibles y estén actualizados.
            </p>
          </article>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
            className={`w-full max-w-[640px] md:max-w-[880px] lg:max-w-[960px] mx-auto flex flex-col gap-6 p-4 sm:p-6 md:p-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow md:shadow-none`}
          >
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación oficial (INE, pasaporte, cartilla militar, etc.):
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_identificacion")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_identificacion"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_identificacion"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de domicilio reciente (no más de 3 meses de
                antiguedad):
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_comprobante_domicilio")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_comprobante_domicilio"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_comprobante_domicilio"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título o cédula profesional (en caso de aplicar):
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_titulo_cedula")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_titulo_cedula"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_titulo_cedula"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de certificaciones adicionales: (OPCIONAL)
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_certificaciones")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_certificaciones"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_certificaciones"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carta de recomendación laboral: (OPCIONAL)
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_carta_recomendacion")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_carta_recomendacion"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_carta_recomendacion"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currículum vitae actualizado:
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_curriculum")}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB.</p>
              {fileErrors["doc_curriculum"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_curriculum"]}</p>
              )}
            </div>
            <div className="mb-6 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotografía tamaño pasaporte FORMAL (PNG,JPG):
              </label>
              <input
                type="file"
                onChange={handleFileInput("doc_fotografia")}
                accept=".png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5 MB. Se intentará comprimir imágenes automáticamente.</p>
              {fileErrors["doc_fotografia"] && (
                <p className="text-xs text-red-600 mt-1">{fileErrors["doc_fotografia"]}</p>
              )}
            </div>

            <div className="w-full flex justify-end">
              <BtnForm type="submit" TextoBtn={`Siguiente`} />
            </div>
          </form>
        </div>
      )}

      {step === 4 && (
        <div
          className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}
        >
          <article className="flex flex-col items-center">
            <h1
              className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
            >
              {" "}
              5. Información adicional{" "}
            </h1>{" "}
            {/*Falta agregar la constante del usuario*/}
            <p className={`text-justify p-3 w-full max-w-[640px] md:max-w-[800px] lg:max-w-[920px] leading-relaxed md:leading-loose md:px-2`}>
              Incluye lo que no se haya solicitado en las secciones anteriores.
            </p>
          </article>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (finalizing || creds || savingPerfil) return;
              if (!preregistroId && !isBypass) {
                navigate("/pre_registro");
                return;
              }
              if (!preregistroId && isBypass) {
                setFinalError(
                  "Modo debug: no hay preregistroId real, no se enviará a la base de datos."
                );
                return;
              }
              // ===== Validaciones previas (seguros) =====
              const v = getValues();
              const errs = [];
              // Consentimiento obligatorio - ÚNICO que bloquea
              const warnings = [];
              if (v.consentimiento_datos !== "y") {
                errs.push("Debes autorizar el uso de datos para continuar.");
                setPreValidateError(errs.join("\n"));
                return;
              }
              // Firma opcional - ya no es requerida
              // if (!v.firma || v.firma.trim().length < 3)
              //   errs.push("Firma (nombre completo) requerida (mínimo 3 caracteres).");
              // RFC opcional: solo validar si está completo (>=13)
              if (v.rfc) {
                const rfc = v.rfc.toUpperCase().trim();
                const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
                if (rfc.length >= 13 && !rfcRegex.test(rfc)) {
                  warnings.push("RFC con formato inválido. Se guardará sin RFC.");
                }
              }
              // CURP si se ingresó, asegurar que no haya error previo
              if (v.curp && curpError) {
                warnings.push("CURP con error. Se guardará sin CURP.");
              }
              // Mínimo 1 área de especialización
              const areaKeys = [
                "Ciencias exactas",
                "Ciencias sociales",
                "Educación",
                "Ingeniería y tecnologia",
                "Medicina y salud",
                "Arte y humanidades",
                "Negocios y administración",
              ];
              if (!areaKeys.some((k) => v[k]))
                warnings.push("No se seleccionó área de especialización. Se guardará sin áreas.");
              // Mínimo una fuente y una motivación (recomendado)
              const fuenteKeys = Object.keys(v).filter(
                (k) => k.startsWith("fuente_") && v[k]
              );
              if (fuenteKeys.length === 0)
                warnings.push("No se seleccionó fuente. Se guardará sin fuente.");
              const motivoKeys = Object.keys(v).filter(
                (k) => k.startsWith("motivo_") && v[k]
              );
              if (motivoKeys.length === 0)
                warnings.push("No se seleccionó motivación. Se guardará sin motivación.");
              // Tamaño de archivos (<=5MB c/u)
              const maxMB = 5;
              const overs = Object.entries(filesRef.current).filter(
                ([_, file]) => file && file.size > maxMB * 1024 * 1024
              );
              if (overs.length) {
                warnings.push(
                  `Archivo(s) exceden ${maxMB}MB y no se subirán: ${overs
                    .map((o) => o[0])
                    .join(", ")}`
                );
              }
              // Mostrar advertencias pero continuar
              if (warnings.length > 0) {
                setPreValidateError("Advertencias:\n" + warnings.join("\n") + "\n\nSe guardarán los datos disponibles.");
              } else {
                setPreValidateError("");
              }
              setFinalError(null);
              try {
                setSavingPerfil(true);
                // areaKeys ya definido arriba
                const areas = areaKeys.filter((k) => v[k]) || [];
                const fuentes = Object.entries(v)
                  .filter(([k, val]) => k.startsWith("fuente_") && val === true)
                  .map(([k]) => k.replace("fuente_", "")) || [];
                const motivaciones = Object.entries(v)
                  .filter(([k, val]) => k.startsWith("motivo_") && val === true)
                  .map(([k]) => k.replace("motivo_", "")) || [];
                
                // Validar RFC antes de incluirlo
                let rfcValue = null;
                if (v.rfc) {
                  const rfc = v.rfc.toUpperCase().trim();
                  const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
                  if (rfc.length >= 13 && rfcRegex.test(rfc)) {
                    rfcValue = rfc;
                  }
                }
                
                // Validar CURP antes de incluirlo (solo si no hay error)
                let curpValue = null;
                let entidadCurpValue = null;
                if (v.curp && !curpError) {
                  curpValue = v.curp.toUpperCase().trim();
                  entidadCurpValue = v.entidad_curp || null;
                }
                
                const payload = {
                  direccion: v.direccion || "",
                  municipio: v.municipio || "",
                  nacimiento: v.nacimiento || "",
                  nacionalidad: v.nacionalidad || "",
                  genero: v.genero || "",
                  rfc: rfcValue,
                  nivel_estudios: v.estudios || "",
                  institucion: v.institucion || "",
                  titulo_academico: v.titulo === "si" ? 1 : 0,
                  anio_graduacion: v.graduacion ? Number(v.graduacion) : null,
                  experiencia_rango: v.experiencia || "",
                  areas_especializacion: areas,
                  empresa: v.empresa || "",
                  ultimo_puesto: v.ultimo_puesto || "",
                  funciones: v.funsiones || "",
                  plataformas: [
                    v.plat_google_classroom && 'google_classroom',
                    v.plat_microsoft_teams && 'microsoft_teams',
                    v.plat_zoom && 'zoom',
                    v.plat_moodle && 'moodle',
                    v.plat_edmodo && 'edmodo',
                    v.plataformas2 && v.plataformas2.trim() && v.plataformas2.trim()
                  ].filter(Boolean),
                  dispuesto_capacitacion:
                    v.dispuesto_capacitacion === "y" ? 1 : 0,
                  consentimiento_datos: v.consentimiento_datos === "y" ? 1 : 0,
                  firma_texto: v.firma || "",
                  fuente_conociste: fuentes,
                  motivaciones: motivaciones,
                  curp: curpValue,
                  entidad_curp: entidadCurpValue,
                };
                const perfilRes = await fetch(buildApiUrl(`/asesores/perfil/${preregistroId}`), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!perfilRes.ok) {
                  const b = await perfilRes.json().catch(() => ({}));
                  throw new Error(b.message || "Error guardando perfil");
                }
                const fd = new FormData();
                const maxMB = 5;
                // Solo subir archivos que no excedan el tamaño máximo
                Object.entries(filesRef.current).forEach(([k, f]) => {
                  if (f && f.size <= maxMB * 1024 * 1024) {
                    fd.append(k, f);
                  }
                });
                // Intentar subir archivos, pero no bloquear si falla
                if (Array.from(fd.keys()).length) {
                  try {
                    const upRes = await fetch(buildApiUrl(`/asesores/perfil/${preregistroId}/upload`), { method: 'POST', body: fd });
                    if (!upRes.ok) {
                      const ub = await upRes.json().catch(() => ({}));
                      warnings.push(`Algunos archivos no se pudieron subir: ${ub.message || "Error desconocido"}`);
                      if (warnings.length > 0) {
                        setPreValidateError("Advertencias:\n" + warnings.join("\n") + "\n\nLos datos principales se guardaron correctamente.");
                      }
                    }
                  } catch (uploadErr) {
                    warnings.push(`Error al subir archivos: ${uploadErr.message}`);
                    if (warnings.length > 0) {
                      setPreValidateError("Advertencias:\n" + warnings.join("\n") + "\n\nLos datos principales se guardaron correctamente.");
                    }
                  }
                }
              } catch (err) {
                // Si falla el guardado del perfil, no intentar finalizar
                console.error("Error guardando perfil:", err);
                setFinalError(`Error al guardar los datos: ${err.message}. Por favor, revisa los datos e intenta de nuevo.`);
                setSavingPerfil(false);
                return; // No continuar si no se guardó el perfil
              } finally {
                setSavingPerfil(false);
              }
              
              // Solo intentar finalizar si el perfil se guardó correctamente
              try {
                setFinalizing(true);
                const res = await fetch(buildApiUrl(`/asesores/finalizar/${preregistroId}`), { method: 'POST' });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  // Si falla la finalización, mostrar error pero los datos ya están guardados
                  const errorMsg = body.message || "Error finalizando";
                  setFinalError(`Los datos se guardaron correctamente en la base de datos, pero hubo un problema al finalizar: ${errorMsg}. Puedes intentar finalizar de nuevo más tarde.`);
                } else if (body.ok && body.credenciales) {
                  setCreds(body.credenciales);
                  setShowCredsModal(true);
                  setFinalError(null); // Limpiar errores si todo salió bien
                  setPreValidateError(""); // Limpiar advertencias
                } else if (body.ok && !body.credenciales) {
                  // Ya finalizado previamente
                  setFinalError(
                    body.message ||
                      "Este preregistro ya fue finalizado previamente."
                  );
                } else {
                  setFinalError(
                    body.message || "Respuesta inesperada del servidor"
                  );
                }
              } catch (err) {
                // Error al finalizar, pero los datos ya se guardaron en la BD
                setFinalError(`Los datos se guardaron correctamente en la base de datos, pero hubo un error al finalizar: ${err.message}. Puedes intentar finalizar de nuevo más tarde.`);
              } finally {
                setFinalizing(false);
              }
            }}
            className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-4 p-4`}
          >
            <FormGroup className="w-full">
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                ¿Cómo te enteraste de MQerKAcademy?
              </h2>
              <FormControlLabel
                control={<Checkbox {...register("fuente_redes")} />}
                label="Redes sociales (Facebook, Instagram, X, etc.)"
              />
              <FormControlLabel
                control={<Checkbox {...register("fuente_recomendacion")} />}
                label="Recomendación de un amigo/colega"
              />
              <FormControlLabel
                control={<Checkbox {...register("fuente_publicidad")} />}
                label="Publicidad en línea"
              />
              <FormControlLabel
                control={<Checkbox {...register("fuente_evento")} />}
                label="Evento o feria educativa"
              />
              <FormControlLabel
                control={<Checkbox {...register("fuente_web")} />}
                label="Página web"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={inputsVisibility.option1}
                    onChange={handleAdicional1Change}
                  />
                }
                label="Otro (especificar)"
              />
              {adicional1 === "otro" && (
                <TextField
                  multiline
                  maxRows={5}
                  label="¿Dónde escuchaste de nosotros?"
                  variant="outlined"
                />
              )}
            </FormGroup>

            <FormGroup className="w-full">
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                ¿Por qué te gustaría ser asesor en MQerKAcademy?
              </h2>
              <FormControlLabel
                control={<Checkbox {...register("motivo_contribuir")} />}
                label="Contribuir a la educación"
              />
              <FormControlLabel
                control={<Checkbox {...register("motivo_desarrollo")} />}
                label="Desarrollo profesional"
              />
              <FormControlLabel
                control={<Checkbox {...register("motivo_ciencias")} />}
                label="Interés en ciencias y tecnología"
              />
              <FormControlLabel
                control={<Checkbox {...register("motivo_flexibilidad")} />}
                label="Flexibilidad horaria"
              />
              <FormControlLabel
                control={
                  <Checkbox name="option2" checked={inputsVisibility.option2} />
                }
                label="Otro (especificar)"
              />
              {inputsVisibility.option2 && (
                <TextField
                  maxRows={5}
                  multiline
                  label="Mencione una razon por la cual asesor con nosotros"
                  variant="outlined"
                />
              )}
            </FormGroup>

            <FormControl className="w-full">
              <FormLabel id="radio-buttons-group-label"></FormLabel>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                ¿Estarías dispuesto a participar en formaciones continuas o
                capacitaciones internas?
              </h2>
              <RadioGroup
                row
                className="flex justify-around"
                {...register("dispuesto_capacitacion")}
              >
                <FormControlLabel value="y" control={<Radio />} label="Sí" />
                <FormControlLabel value="n" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <fieldset className="flex w-full flex-col items-center gap-10">
              <article className={`flex flex-col gap-2`}>
                <h1
                  className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}
                >
                  6. Confirmación y consentimiento
                </h1>

                <p className="text-justify">
                  Al completar este formulario, confirmas que la información
                  proporcionada es verídica y autorizas a MQerKAcademy a
                  utilizar estos datos únicamente para fines relacionados con el
                  proceso de reclutamiento y contratación, conforme a la
                  normativa de protección de datos aplicable. Por favor, firma
                  digitalmente o marca la casilla de consentimiento para
                  proceder
                </p>
              </article>

              <FormControl>
                <h2 className="text-center">
                  ¿Autorizas a MQerKAcademy para almacenar y procesar tus datos
                  personales de acuerdo con las políticas de privacidad?
                </h2>
                <FormLabel id="radio-buttons-group-label"></FormLabel>
                <RadioGroup
                  row
                  className="flex justify-around"
                  {...register("consentimiento_datos")}
                >
                  <FormControlLabel
                    value="y"
                    control={<Radio />}
                    label="Sí, autorizo el uso de mis datos"
                  />
                  <FormControlLabel
                    className="text-red-500"
                    value="n"
                    control={<Radio />}
                    label="No autorizo el uso de mis datos"
                  />
                </RadioGroup>
              </FormControl>

              <div className={`flex flex-col gap-2 mt-4`}>
                <h2 className={`text-center`}>
                  Firma digital o nombre completo como confirmación de la
                  veracidad de los datos proporcionados (opcional).
                </h2>
                <SignatureField
                  value={getValues("firma")}
                  onChange={(val) => setValue("firma", val, { shouldValidate: false })}
                  onImageChange={(file) => {
                    // guardamos la imagen de la firma como archivo opcional
                    filesRef.current["firma_imagen"] = file || null;
                  }}
                />
                <p className="text-xs text-gray-500 text-center">Puedes escribir tu nombre o dibujar tu firma (opcional).</p>
              </div>

              {!creds && (
                <BtnForm
                  TextoBtn={
                    savingPerfil
                      ? "Guardando perfil..."
                      : finalizing
                      ? "Procesando..."
                      : "Finalizar"
                  }
                />
              )}
              {finalError && (
                <div className="w-full max-w-md border border-red-300 bg-red-50 rounded p-3 text-xs text-red-700 space-y-2">
                  <p className="font-medium">{finalError}</p>
                  {/ya fue finalizado/i.test(finalError) && (
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="inline-block px-3 py-1 bg-purple-600 text-white rounded text-[11px] hover:bg-purple-700"
                    >Ir a inicio de sesión</button>
                  )}
                </div>
              )}
              {preValidateError && (
                <pre className="whitespace-pre-wrap text-xs text-red-700 border border-red-300 bg-red-50 p-2 rounded">
                  {preValidateError}
                </pre>
              )}
              {creds && !showCredsModal && (
                <div className="w-full max-w-md border rounded-lg p-4 bg-white shadow text-sm">
                  <h3 className="font-semibold mb-2">Credenciales generadas</h3>
                  <p className="text-xs text-gray-600 mb-2">Si cerraste el modal puedes copiarlas aquí.</p>
                  <div className="space-y-1">
                    <div><span className="font-medium">Usuario:</span> {creds.usuario}</div>
                    <div><span className="font-medium">Contraseña:</span> {creds.password}</div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${creds.usuario} ${creds.password}`)}
                      className="mt-2 text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-black"
                    >Copiar</button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const contenido = `Credenciales MQerKAcademy\n\nUsuario: ${creds.usuario}\nContraseña: ${creds.password}\n\nGuárdalas en un lugar seguro.`;
                          const blob = new Blob([contenido], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `credenciales_mqerk_${creds.usuario}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
                        } catch(_e) {}
                      }}
                      className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >Descargar .txt</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="mt-4 text-xs text-purple-700 underline"
                  >Ir a inicio de sesión</button>
                </div>
              )}
            </fieldset>
          </form>
        </div>
      )}
    </>
  );
};
