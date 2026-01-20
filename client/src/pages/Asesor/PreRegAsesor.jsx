import Navbar from "../../components/common/auth/NavLogin.jsx";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ActionSheetSelect from "../../components/ui/ActionSheetSelect.jsx";
import { useAsesor } from "../../context/AsesorContext.jsx";
import { useNavigate } from "react-router-dom";

export function PreRegAsesor() {
  // Opciones reutilizables
  const areaOptions = [
    { value: "", label: "Selecciona una opción" },
    { value: "Ciencias Exactas", label: "Ciencias Exactas" },
    { value: "Ciencias de la Salud", label: "Ciencias de la Salud" },
    { value: "Ciencias Económico - Administrativo", label: "Ciencias Económico - Administrativo" },
    { value: "Ingeniería", label: "Ingeniería" },
    { value: "Tecnología", label: "Tecnología" },
    { value: "Ciencias Químico - Biológico", label: "Ciencias Químico - Biológico" },
    { value: "Ciencias Sociales y humanidades", label: "Ciencias Sociales y humanidades" },
  ];
  const estudioOptions = [
    { value: "", label: "Selecciona una opción" },
    { value: "Licenciatura", label: "Licenciatura" },
    { value: "Maestría", label: "Maestría" },
    { value: "Técnico", label: "Técnico" },
    { value: "Especialista", label: "Especialista" },
  ];

  // Componente de Select personalizado (solo móvil)
  function MobileSelect({ control, name, id, placeholder, options, rules, error }) {
    const [open, setOpen] = useState(false);
    const boxRef = useRef(null);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [placement, setPlacement] = useState('bottom');

    const computePlacement = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const margin = 8;
      const desired = 240; // px target height
      const gap = 6;
      const spaceBelow = viewportH - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const place = (spaceBelow < 160 && spaceAbove > spaceBelow) ? 'top' : 'bottom';
      const maxHeight = place === 'bottom' ? Math.max(120, spaceBelow) : Math.max(120, spaceAbove);
      const used = Math.min(desired, maxHeight);
      const top = place === 'bottom' ? rect.bottom + gap : Math.max(margin, rect.top - used - gap);
      const style = {
        position: 'fixed',
        top,
        left: Math.max(margin, rect.left),
        width: rect.width,
        maxHeight: place === 'bottom' ? Math.min(desired, viewportH - (rect.bottom + gap) - margin) : Math.min(desired, rect.top - margin - gap),
        overflowY: 'auto',
        background: 'white',
        zIndex: 9999,
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        border: '1px solid rgb(229 231 235)'
      };
      setPlacement(place);
      setDropdownStyle(style);
    };

    useEffect(() => {
      const onDoc = (e) => {
        const inBox = boxRef.current && boxRef.current.contains(e.target);
        const inDrop = dropdownRef.current && dropdownRef.current.contains(e.target);
        if (!inBox && !inDrop) setOpen(false);
      };
      const onResize = () => { if (open) computePlacement(); };
      document.addEventListener('click', onDoc);
      window.addEventListener('resize', onResize);
      window.addEventListener('scroll', onResize, true);
      return () => {
        document.removeEventListener('click', onDoc);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onResize, true);
      };
    }, [open]);

    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange } }) => {
          const selected = options.find(o => o.value === value);
          return (
            <div ref={boxRef} className="relative mt-2">
              <button
                type="button"
                id={id}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => { setOpen(o => { const n = !o; if (n) computePlacement(); return n; }); }}
                ref={buttonRef}
                className="p-3 w-full border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                  {selected?.label || placeholder}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
              {open && createPortal(
                <ul
                  ref={dropdownRef}
                  role="listbox"
                  style={dropdownStyle}
                  className="max-h-60 overflow-auto bg-white rounded-lg shadow-lg border border-gray-200"
                >
                  {options.map((opt) => (
                    <li
                      key={opt.value + opt.label}
                      role="option"
                      aria-selected={opt.value === value}
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${opt.value === value ? 'bg-blue-100 text-blue-700' : 'text-gray-800'}`}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>,
                document.body
              )}
              {error && (
                <p className="text-red-600 text-xs mt-1">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    );
  }

  // Componente de Radio List para móvil (opción recomendada en móvil)
  function MobileRadioGroup({ control, name, options, rules, error, id, pills=false }){
    const renderOption = (opt, selected, onChange) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={
          pills
            ? `px-3 py-2 rounded-full border ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'} hover:border-blue-500 hover:text-blue-600`
            : `w-full text-left px-3 py-2 rounded-md border ${selected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-800'} hover:bg-blue-50`
        }
      >
        {opt.label}
      </button>
    );
    const visibleOptions = options.filter(o => o.value !== "");
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange } }) => (
          <div className="mt-2">
            {pills ? (
              <div id={id} className="flex flex-wrap gap-2">
                {visibleOptions.map(opt => renderOption(opt, value === opt.value, onChange))}
              </div>
            ) : (
              <div id={id} className="rounded-lg border border-gray-200 max-h-64 overflow-auto divide-y divide-gray-100">
                {visibleOptions.map(opt => (
                  <div key={opt.value} className="p-1">
                    {renderOption(opt, value === opt.value, onChange)}
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-red-600 text-xs mt-1">{error.message}</p>}
          </div>
        )}
      />
    );
  }

  // Eliminado: MobileActionSheetSelect ahora es reusable en components/ActionSheetSelect.jsx
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      area: "",
      estudios: "",
    },
  });
  const { preSignup, loading, error, datos1 } = useAsesor();
  const navigate = useNavigate();

  const onSubmite = handleSubmit(async (values) => {
    try {
      const preregistro = await preSignup(values); // Capture the response to get preregistroId
      // Navegar con el ID devuelto inmediatamente
      navigate(`/test?preregistroId=${preregistro.id}`);
    } catch (e) {
      // error already stored in context
    }
  });

  return (
    <div className="h-screen">
      <Navbar />
      <div className="flex justify-center items-start md:items-center">
        {/* <!-- Tarjeta para móviles --> */}
  <div className="w-full max-w-md p-6 rounded-3xl md:hidden mb-5">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Registro previo de los datos generales
          </h2>
          <p className="mb-8 text-justify">
            Este es un pre-registro del proceso de reclutamiento para dar
            espacio a que realices las pruebas y test psicológicos que
            MQerKAcademy aplica a sus futuros asesores.
          </p>

          {error && (
            <div className="text-red-600 mb-4 text-center">{error}</div>
          )}
          {datos1 && (
            <div className="text-green-600 text-center mb-4">
              Preregistro guardado (ID {datos1.id})
            </div>
          )}
          <form onSubmit={onSubmite}>
            <div className="mb-6">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-900"
              >
                Nombre(s)
              </label>
              <input
                type="text"
                {...register("nombres", { required: "Nombre obligatorio" })}
                id="nombre"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu nombre"
                required
              />
              {errors.nombres && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.nombres.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="apellidos"
                className="block text-sm font-medium text-gray-900"
              >
                Apellidos
              </label>
              <input
                type="text"
                {...register("apellidos", {
                  required: "Apellidos obligatorios",
                })}
                id="apellidos"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tus apellidos"
                required
              />
              {errors.apellidos && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.apellidos.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-900"
              >
                Correo
              </label>
              <input
                type="email"
                {...register("correo", {
                  required: "Correo obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de correo inválido",
                  },
                })}
                id="correo"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo"
                required
              />
              {errors.correo && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.correo.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-900"
              >
                Numero de telefono
              </label>
              <input
                type="tel"
                {...register("telefono", {
                  required: "Teléfono obligatorio",
                  pattern: {
                    value: /^[0-9+\-()\s]{8,20}$/,
                    message: "Teléfono inválido",
                  },
                })}
                id="telefono"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu numero de telefono"
                required
              />
              {errors.telefono && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="area"
                className="block text-sm font-medium text-gray-900"
              >
                Area de especialización
              </label>
              <Controller
                control={control}
                name="area"
                rules={{ required: "Área obligatoria" }}
                render={({ field }) => (
                  <div>
                    <ActionSheetSelect
                      id="area"
                      value={field.value}
                      onChange={field.onChange}
                      options={areaOptions}
                      placeholder="Selecciona una opción"
                    />
                    {errors.area && (
                      <p className="text-red-600 text-xs mt-1">{errors.area.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="estudios"
                className="block text-sm font-medium text-gray-900"
              >
                Grado de estudio
              </label>
              <Controller
                control={control}
                name="estudios"
                rules={{ required: "Grado de estudios obligatorio" }}
                render={({ field }) => (
                  <div>
                    <ActionSheetSelect
                      id="estudios"
                      value={field.value}
                      onChange={field.onChange}
                      options={estudioOptions}
                      placeholder="Selecciona una opción"
                    />
                    {errors.estudios && (
                      <p className="text-red-600 text-xs mt-1">{errors.estudios.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>

        {/* <!-- Tarjeta para computadoras --> */}
  <div className="hidden md:flex w-260 p-8 rounded-3xl d-flex flex-col">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-10">
            Registro previo de los datos generales
          </h2>
          <p className="text-center mb-10">
            Este es un pre-registro del proceso de reclutamiento para dar
            espacio a que realices las pruebas y test psicológicos que
            MQerKAcademy aplica a sus futuros asesores.
          </p>
          {error && (
            <div className="text-red-600 mb-4 text-center w-full">{error}</div>
          )}
          {datos1 && (
            <div className="text-green-600 text-center mb-4 w-full">
              Preregistro guardado (ID {datos1.id})
            </div>
          )}
          <form onSubmit={onSubmite}>
            <div className="hidden md:flex space-x-20 mb-6">
              {/* Campo Nombre (izquierda) */}
              <div className="flex-1">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-900"
                >
                  Nombre(s)
                </label>
                <input
                  type="text"
                  {...register("nombres", { required: "Nombre obligatorio" })}
                  id="nombre"
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu nombre"
                  required
                />
                {errors.nombres && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.nombres.message}
                  </p>
                )}
              </div>

              {/* Campo Apellidos (derecha) */}
              <div className="flex-1">
                <label
                  htmlFor="apellidos"
                  className="block text-sm font-medium text-gray-600"
                >
                  Apellidos
                </label>
                <input
                  type="text"
                  {...register("apellidos", {
                    required: "Apellidos obligatorios",
                  })}
                  id="apellidos"
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tus apellidos"
                  required
                />
                {errors.apellidos && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex space-x-20 mb-6">
              {/* Campo Nombre (izquierda) */}
              <div className="flex-1">
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-gray-900"
                >
                  Correo
                </label>
                <input
                  type="email"
                  {...register("correo", {
                    required: "Correo obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de correo inválido",
                    },
                  })}
                  id="correo"
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu correo"
                  required
                />
                {errors.correo && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Campo Apellidos (derecha) */}
              <div className="flex-1">
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-600"
                >
                  Numero de telefono
                </label>
                <input
                  type="tel"
                  {...register("telefono", {
                    required: "Teléfono obligatorio",
                    pattern: {
                      value: /^[0-9+\-()\s]{8,20}$/,
                      message: "Teléfono inválido",
                    },
                  })}
                  id="telefono"
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu numero de telefono"
                  required
                />
                {errors.telefono && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.telefono.message}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex space-x-20 mb-6">
              <div className="flex-1">
                <label
                  htmlFor="area"
                  className="block text-sm font-medium text-gray-600"
                >
                  Area de especialización
                </label>
                <MobileSelect
                  control={control}
                  name="area"
                  id="area"
                  placeholder="Selecciona una opción"
                  options={areaOptions}
                  rules={{ required: "Área obligatoria" }}
                  error={errors.area}
                />
                {errors.area && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.area.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="estudios"
                  className="block text-sm font-medium text-gray-600"
                >
                  Grado de estudio
                </label>
                <MobileSelect
                  control={control}
                  name="estudios"
                  id="estudios"
                  placeholder="Selecciona una opción"
                  options={estudioOptions}
                  rules={{ required: "Grado de estudios obligatorio" }}
                  error={errors.estudios}
                />
                {errors.estudios && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.estudios.message}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex justify-end mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-40 py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
