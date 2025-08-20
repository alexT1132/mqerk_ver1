import NavLogin from "../../components/NavLogin";
import { useState, useEffect, useRef } from "react";
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
import { BtnForm } from "../../components/FormRegistroComp";
import { useForm } from "react-hook-form";
import { useAsesor } from "../../context/AsesorContext";
import { useNavigate, useLocation } from "react-router-dom";

// import SignatureCanvas from `react-signature-canvas`

export const FormularioAsesor = ({ debugBypass = false }) => {
  usePreventPageReload();

  const { handleSubmit, register, getValues, setValue, watch } = useForm();

  const { datos1, preregistroId, loadPreRegistro } = useAsesor();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isBypass =
    debugBypass ||
    searchParams.has("debug") ||
    searchParams.get("bypass") === "1";
  // Con tests eliminados, flujo siempre permitido tras preregistro
  const aprobadoFinal = true;
  const [finalizing, setFinalizing] = useState(false);
  const [creds, setCreds] = useState(null);
  const [finalError, setFinalError] = useState(null);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [perfilOk, setPerfilOk] = useState(false);
  const filesRef = useRef({});
  const [curpError, setCurpError] = useState("");
  const [rfcError, setRfcError] = useState("");
  const [preValidateError, setPreValidateError] = useState("");
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [adicional1, setAdicional1] = useState("");

  const handleTituloChange = (e) => {
    setTitulo(e.target.value);
  };

  const handleAdicional1Change = (e) => {
    setAdicional1(e.target.value);
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
  }, [datos1, preregistroId, isBypass]);

  const displayDatos =
    datos1 || (isBypass ? { nombres: "Debug", apellidos: "Bypass" } : null);
  if (!aprobadoFinal && !isBypass) {
    return <div className="p-10 text-center text-sm">Acceso no permitido.</div>;
  }
  if (!displayDatos) {
    return <div className="p-10 text-center">Cargando datos...</div>;
  }

  return (
    <>
      <NavLogin />
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
              className={`flex flex-wrap text-justify p-2 sm:text-md md:w-200`}
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

            <p className={`text-justify p-2 sm:text-md md:w-200`}>
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
                  await fetch(
                    `${
                      import.meta.env.VITE_API_URL || "http://localhost:1002"
                    }/api/asesores/preregistro/${preregistroId}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nombres,
                        apellidos,
                        correo,
                        telefono,
                        area,
                        estudios,
                      }),
                    }
                  );
                } catch (err) {
                  console.warn("No se pudo actualizar preregistro", err);
                }
              }
              nextStep();
            }}
            className="w-[70%] mx-auto p-6 bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre(s)
                </label>
                <input
                  type="text"
                  defaultValue={datos1?.nombres}
                  {...register("nombres")}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  required
                />
              </div>
              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  defaultValue={datos1?.apellidos}
                  {...register("apellidos")}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  required
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
                <select
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                  {...register("genero")}
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
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
              className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}
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
            className="w-[60%] mx-auto p-6 bg-white"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de estudios
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                defaultValue=""
                {...register("estudios")}
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
            </div>
            {/* Institución */}
            <div className="mb-4">
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título academico
              </label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                defaultValue=""
                onChange={handleTituloChange}
                {...register("titulo")}
                required
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="si">Si</option>
                <option value="no">No</option>
              </select>
            </div>

            {titulo === "si" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subir su titulo aqui
                </label>
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
                  onChange={(e) => {
                    filesRef.current["titulo_archivo"] =
                      e.target.files?.[0] || null;
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            )}

            {/* Año de graduación */}
            <div className="mb-4">
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificaciones o cursos adicionales
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["certificaciones_archivo"] =
                    e.target.files?.[0] || null;
                }}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>

            {/* Botón de enviar */}
            <div className="text-center flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Siguiente
              </button>
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
              className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}
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
            className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-8 p-4`}
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

            <FormGroup className={`w-full`} {...register("plataformas")}>
              <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>
                Conocimientos en plataformas educativas digitales
              </h2>
              <FormControlLabel
                control={<Checkbox />}
                label="Google classroom"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Microsoft Teams"
              />
              <FormControlLabel control={<Checkbox />} label="Zoom" />
              <FormControlLabel control={<Checkbox />} label="Moodle" />
              <FormControlLabel control={<Checkbox />} label="Edmodo" />
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
            className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-4 p-4`}
          >
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación oficial (INE, pasaporte, cartilla militar, etc.):
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_identificacion"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de domicilio reciente (no más de 3 meses de
                antiguedad):
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_comprobante_domicilio"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título o cédula profesional (en caso de aplicar):
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_titulo_cedula"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de certificaciones adicionales: (OPCIONAL)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_certificaciones"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carta de recomendación laboral: (OPCIONAL)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_carta_recomendacion"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currículum vitae actualizado:
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_curriculum"] =
                    e.target.files?.[0] || null;
                }}
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
            </div>
            <div className="mb-6 w-120">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotografía tamaño pasaporte FORMAL (PNG,JPG):
              </label>
              <input
                type="file"
                onChange={(e) => {
                  filesRef.current["doc_fotografia"] =
                    e.target.files?.[0] || null;
                }}
                accept=".png,.jpg,.jpeg"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
              />
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
            <p className={`p-2 w-fit`}>
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
              // Consentimiento obligatorio
              if (v.consentimiento_datos !== "y")
                errs.push("Debes autorizar el uso de datos para continuar.");
              // Firma mínima
              if (!v.firma || v.firma.trim().length < 5)
                errs.push("Firma (nombre completo) requerida.");
              // RFC básico (opcional: si se ingresó validar)
              if (v.rfc) {
                const rfc = v.rfc.toUpperCase().trim();
                const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
                if (!rfcRegex.test(rfc)) errs.push("RFC con formato inválido.");
              }
              // CURP si se ingresó, asegurar que no haya error previo
              if (v.curp && curpError) {
                errs.push("Corrige el CURP antes de continuar.");
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
                errs.push("Selecciona al menos un área de especialización.");
              // Mínimo una fuente y una motivación (recomendado)
              const fuenteKeys = Object.keys(v).filter(
                (k) => k.startsWith("fuente_") && v[k]
              );
              if (fuenteKeys.length === 0)
                errs.push(
                  "Selecciona al menos una fuente de cómo conociste la plataforma."
                );
              const motivoKeys = Object.keys(v).filter(
                (k) => k.startsWith("motivo_") && v[k]
              );
              if (motivoKeys.length === 0)
                errs.push("Selecciona al menos una motivación.");
              // Tamaño de archivos (<=5MB c/u)
              const maxMB = 5;
              const overs = Object.entries(filesRef.current).filter(
                ([_, file]) => file && file.size > maxMB * 1024 * 1024
              );
              if (overs.length) {
                errs.push(
                  `Archivo(s) exceden ${maxMB}MB: ${overs
                    .map((o) => o[0])
                    .join(", ")}`
                );
              }
              if (errs.length) {
                setPreValidateError(errs.join("\n"));
                return;
              } else {
                setPreValidateError("");
              }
              setFinalError(null);
              try {
                setSavingPerfil(true);
                // areaKeys ya definido arriba
                const areas = areaKeys.filter((k) => v[k]);
                const fuentes = Object.entries(v)
                  .filter(([k, val]) => k.startsWith("fuente_") && val === true)
                  .map(([k]) => k.replace("fuente_", ""));
                const motivaciones = Object.entries(v)
                  .filter(([k, val]) => k.startsWith("motivo_") && val === true)
                  .map(([k]) => k.replace("motivo_", ""));
                const payload = {
                  direccion: v.direccion,
                  municipio: v.municipio,
                  nacimiento: v.nacimiento,
                  nacionalidad: v.nacionalidad,
                  genero: v.genero,
                  rfc: v.rfc,
                  nivel_estudios: v.estudios,
                  institucion: v.institucion,
                  titulo_academico: v.titulo === "si" ? 1 : 0,
                  anio_graduacion: Number(v.graduacion),
                  experiencia_rango: v.experiencia || "",
                  areas_especializacion: areas,
                  empresa: v.empresa || "",
                  ultimo_puesto: v.ultimo_puesto || "",
                  funciones: v.funsiones || "",
                  plataformas: [],
                  dispuesto_capacitacion:
                    v.dispuesto_capacitacion === "y" ? 1 : 0,
                  consentimiento_datos: v.consentimiento_datos === "y" ? 1 : 0,
                  firma_texto: v.firma || "",
                  fuente_conociste: fuentes,
                  motivaciones,
                  curp: v.curp || null,
                  entidad_curp: v.entidad_curp || null,
                };
                const perfilRes = await fetch(
                  `${
                    import.meta.env.VITE_API_URL || "http://localhost:1002"
                  }/api/asesores/perfil/${preregistroId}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }
                );
                if (!perfilRes.ok) {
                  const b = await perfilRes.json().catch(() => ({}));
                  throw new Error(b.message || "Error guardando perfil");
                }
                const fd = new FormData();
                Object.entries(filesRef.current).forEach(([k, f]) => {
                  if (f) fd.append(k, f);
                });
                if (Array.from(fd.keys()).length) {
                  const upRes = await fetch(
                    `${
                      import.meta.env.VITE_API_URL || "http://localhost:1002"
                    }/api/asesores/perfil/${preregistroId}/upload`,
                    { method: "POST", body: fd }
                  );
                  if (!upRes.ok) {
                    const ub = await upRes.json().catch(() => ({}));
                    throw new Error(ub.message || "Error subiendo documentos");
                  }
                }
              } catch (err) {
                setFinalError(err.message);
                return;
              } finally {
                setSavingPerfil(false);
              }
              try {
                setFinalizing(true);
                const res = await fetch(
                  `${
                    import.meta.env.VITE_API_URL || "http://localhost:1002"
                  }/api/asesores/finalizar/${preregistroId}`,
                  { method: "POST" }
                );
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setFinalError(body.message || "Error finalizando");
                } else if (body.ok && body.credenciales) {
                  setCreds(body.credenciales);
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
                setFinalError(err.message);
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

              <div className={`flex flex-col gap-2`}>
                <h2 className={`text-center`}>
                  Firma digital o nombre completo como confirmación de la
                  veracidad de los datos proporcionados.
                </h2>
                <div className={`flex items-center justify-center w-full`}>
                  <div className={`border-2 rounded-2xl p-2`}>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      {...register("firma")}
                      className="outline-none text-sm"
                    />
                  </div>
                </div>
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
                <p className="text-sm text-red-600 font-medium">{finalError}</p>
              )}
              {preValidateError && (
                <pre className="whitespace-pre-wrap text-xs text-red-700 border border-red-300 bg-red-50 p-2 rounded">
                  {preValidateError}
                </pre>
              )}
              {creds && (
                <div className="w-full max-w-md border rounded-lg p-4 bg-white shadow text-sm">
                  <h3 className="font-semibold mb-2">Credenciales generadas</h3>
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Usuario:</span>{" "}
                      {creds.usuario}
                    </div>
                    <div>
                      <span className="font-medium">Contraseña:</span>{" "}
                      {creds.password}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${creds.usuario} ${creds.password}`
                        )
                      }
                      className="mt-2 text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-black"
                    >
                      Copiar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-4 text-xs text-purple-700 underline"
                  >
                    Ir a inicio de sesión
                  </button>
                </div>
              )}
            </fieldset>
          </form>
        </div>
      )}
    </>
  );
};
