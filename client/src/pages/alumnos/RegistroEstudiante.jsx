import { useState, useEffect } from "react";
import NavLogin from "../../components/NavLogin.jsx";
import { BtnForm } from "../../components/FormRegistroComp.jsx";
import { TextField, } from "@mui/material";
import SelectField from "../../components/shared/SelectField.jsx";
import { useEstudiantes } from "../../context/EstudiantesContext.jsx";
import { useNavigate } from "react-router-dom";

const RegistroEstudiante=()=>{

    const [step, setStep] = useState(0);

    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [perfil, setPerfil] = useState({ foto: null });
    const [grupo, setGrupo] = useState('');
    const [comunidad1, setComunidad1] = useState([]);
    const [comunidad2, setComunidad2] = useState('');
    const [telefono, setTelefono] = useState('');
    const [nombre_tutor, setTutor] = useState('');
    const [tel_tutor, setTel_tutor] = useState('');
    const [academico1, setAcademico1] = useState([]);
    const [academico2, setAcademico2] = useState('');
    const [semestre, setSemestre] = useState('');
    const [alergia, setAlergia] = useState('');
    const [alergia2, setAlergia2] = useState('');
    const [discapacidad1, setDiscapacidad1] = useState('');
    const [discapacidad2, setDiscapacidad2] = useState('');
    const [orientacion, setOrientacion] = useState('');
    const [universidades1, setUniversidades1] = useState([]);
    const [universidades2, setUniversidades2] = useState('');
    const [postulacion, setPostulacion] = useState('');
    const [comentario1, setComentario1] = useState('');
    const [comentario2, setComentario2] = useState('');
    const [asesor, setAsesor] = useState('Kélvil Valentín Gómez Ramírez');
    const [academia, setAcademia] = useState('MQerKAcademy');

    // errores por paso
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState("");
    const [saving, setSaving] = useState(false);
    const [showErrors0, setShowErrors0] = useState(false);
    const [showErrors1, setShowErrors1] = useState(false);

    const { crearEstudiante, getFolio, folioObtenido, folioFormateado } = useEstudiantes();

    const navigate = useNavigate();

    const validateStep0 = () => {
        const errs = {};
        if (!nombre.trim()) errs.nombre = 'Campo obligatorio';
        if (!apellidos.trim()) errs.apellidos = 'Campo obligatorio';
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Correo inválido';
        if (!perfil.foto) errs.foto = 'Debes subir una foto';
        if (comunidad1.length === 0 && !comunidad2.trim()) errs.comunidad = 'Selecciona al menos una opción u “Otra”';
        if (!telefono.trim()) errs.telefono = 'Campo obligatorio';
        if (!grupo) errs.grupo = 'Selecciona un grupo';
        if (!nombre_tutor.trim()) errs.nombre_tutor = 'Campo obligatorio';
        if (!tel_tutor.trim()) errs.tel_tutor = 'Campo obligatorio';
        setErrors(errs);
        setGlobalError(Object.keys(errs).length ? 'Completa los campos obligatorios marcados con *.' : '');
        return Object.keys(errs).length === 0;
    };

    const validateStep1 = () => {
        const errs = {};
        if (academico1.length === 0 && !academico2.trim()) errs.academico = 'Selecciona al menos una opción u “Otra”';
        if (!semestre) errs.semestre = 'Selecciona un semestre';
        if (orientacion === 'No' && universidades1.length === 0 && !universidades2.trim()) {
            errs.universidades = 'Selecciona al menos una universidad u “Otra”';
        }
        setErrors(errs);
        setGlobalError(Object.keys(errs).length ? 'Completa los campos obligatorios marcados con *.' : '');
        return Object.keys(errs).length === 0;
    };

    const nextStep = (e) => {
        e.preventDefault();
        const isValid = step === 0 ? validateStep0() : step === 1 ? validateStep1() : true;
        if (!isValid) {
            if (step === 0) setShowErrors0(true);
            if (step === 1) setShowErrors1(true);
            return;
        }
        // avanzar y limpiar mensaje global
        setGlobalError("");
        setStep(step + 1);
        };
    
        const prevStep = (e) => {
        setStep(step - 1);
        e.preventDefault();
        };

        localStorage.setItem('role', JSON.stringify('estudiante'));

        const datos = JSON.parse(localStorage.getItem('datos'));

    const numero = folioObtenido ? Number(folioObtenido) : 1;
    const numeroFormateado = numero.toString().padStart(4, '0');


        const Municipios=[`SAN JUAN BAUTISTA TUXTEPEC`,`SAN JOSÉ CHILTEPEC`,`SANTA MARÍA JACATEPEC`,`AYOTZINTEPEC`,`LOMA BONITA`,`SAN LUCAS OJITLÁN`,`SAN JUAN BAUTISTA VALLE NACIONAL`];

        const Preparatorias=[`CBTis`, `COBAO`, `CONALEP`, `CBTF`, `CBTA`,`CECYTE`, `IEBO`, `COLEGIO AMÉRICA`, `COLEGIO TUXTEPEC`];

        const Universidades=[`UNAM`, `IPN`, `UV` ,`BUAP`, `NAVAL`, `UDG`, `UNPA`, `ITTUX`, `TECNM`, `ANAHUAC`, `UAQ`, `UDLAP`, `NORMAL SUPERIOR`];

        const [ultimosDosDigitos, setUltimosDosDigitos] = useState(null);

        const handleChange = (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                setPerfil((prev) => ({
                    ...prev,
                    foto: archivo
                }));
            }
        };

        const opciones = ["V1", "V2", "V3", "M1", "M2", "S1"];


        const toggleComunidad = (comunidad) => {
            // Permitir solo una selección: si se hace clic en la ya seleccionada, se desmarca
            setComunidad1((prev) => (prev.includes(comunidad) ? [] : [comunidad]));
        };

        const toggleAcademico = (academico) => {
            // Permitir solo una selección (si se vuelve a hacer clic se desmarca)
            setAcademico1((prev) => (prev.includes(academico) ? [] : [academico]));
        };

        const toggleUniversidad = (universidad) => {
            setUniversidades1((prev) =>
            prev.includes(universidad)
                ? prev.filter((c) => c !== universidad)
                : [...prev, universidad]
            );
        };

        const foto = perfil.foto;

        const onSubmit = async (e) => {
            e.preventDefault();
            setGlobalError("");
            // Validación simple final
            if (!comentario1.trim() || !comentario2.trim()) {
                setGlobalError('Completa los comentarios requeridos.');
                return;
            }
            try {
                setSaving(true);
                const formData = new FormData();
                formData.append("nombre", nombre);
                formData.append("apellidos", apellidos);
                formData.append("email", email);
                formData.append("foto", foto);
                formData.append("comunidad1", comunidad1 ?? '');
                formData.append("comunidad2", comunidad2 ?? '');
                formData.append("telefono", telefono);
                formData.append("grupo", grupo);
                formData.append("nombre_tutor", nombre_tutor);
                formData.append("tel_tutor", tel_tutor);
                formData.append("academico1", academico1 ?? '');
                formData.append("academico2", academico2 ?? '');
                formData.append("semestre", semestre);
                formData.append("alergia", alergia);
                formData.append("alergia2", alergia2 ?? '');
                formData.append("discapacidad1", discapacidad1);
                formData.append("discapacidad2", discapacidad2 ?? '');
                formData.append("orientacion", orientacion);
                formData.append("universidades1", universidades1 ?? '');
                formData.append("universidades2", universidades2 ?? '');
                formData.append("postulacion", postulacion ?? '');
                formData.append("comentario1", comentario1 ?? '');
                formData.append("comentario2", comentario2 ?? '');
                formData.append("curso", datos?.curso ?? '');
                formData.append("plan", datos?.planMensual ?? '');
                formData.append("anio", ultimosDosDigitos ?? '');
                formData.append("academia", academia || 'MQerKAcademy');
                formData.append("asesor", asesor || 'Kélvil Valentín Gómez Ramírez');
                // ya no enviamos folio; el servidor asigna secuencialmente

                const saved = await crearEstudiante(formData);
                if (saved?.id) {
                    navigate('/usuario_alumno');
                } else {
                    setGlobalError('No se pudo guardar el registro.');
                }
            } catch (error) {
                const msg = error?.response?.data?.message || 'No se pudo guardar el registro.';
                setGlobalError(msg);
            } finally {
                setSaving(false);
            }
        };

        useEffect(() => {
            fetch("https://worldtimeapi.org/api/timezone/America/Mexico_City")
            .then((res) => res.json())
            .then((data) => {
                const year = data.datetime.slice(0, 4);   
                setUltimosDosDigitos(year.slice(-2));     
            })
            .catch((err) => {
                console.error("Error al obtener el año:", err);
            });
        }, []);

        useEffect(() => {
            if (datos?.curso && ultimosDosDigitos) {
                getFolio(datos.curso, ultimosDosDigitos);
            }
        }, [datos?.curso, ultimosDosDigitos]);

        useEffect(() => {
            if(!datos){
                navigate('/')
            }
        }, []);
    
    return(
        <>
        <NavLogin/>

        <div className={`flex w-full justify-end px-1 sm:px-4`}>
            {folioFormateado ? (
                <h1 className="text-[#53289f] text-end text-xs sm:text-base uppercase font-semibold">Folio: {folioFormateado}</h1>
            ) : (
        (() => { const displayAnio = ultimosDosDigitos ? String((Number(ultimosDosDigitos) + 1) % 100).padStart(2,'0') : ''; return (
            <h1 className="text-[#53289f] text-end text-xs sm:text-base uppercase font-semibold">Folio: {`M${(datos?.curso || 'EEAU').slice(0,4).toUpperCase()}${displayAnio}`} - {numeroFormateado}</h1>
                ); })()
            )}
        </div>

        {/* <div className={`flex flex-col mt-3`}> */}

        {step === 0 &&
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-6">DATOS PERSONALES</h2>
                </div>

                {showErrors0 && globalError && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                        {globalError}
                    </div>
                )}

                <form onSubmit={nextStep} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre y Apellidos */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre(s): *</label>
                    <input
                        type="text"
                        placeholder="Ingrese su nombre"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoComplete="off"
                    />
                    {showErrors0 && errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido(s): *</label>
                    <input
                        type="text"
                        placeholder="Ingrese sus apellidos"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        autoComplete="off"
                    />
                    {showErrors0 && errors.apellidos && <p className="text-red-600 text-xs mt-1">{errors.apellidos}</p>}
                    </div>

                    {/* Email y Foto */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
                    <input
                        type="email"
                        placeholder="ejemplo@ejemplo.com"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                    />
                    {showErrors0 && errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
                        <input
                            id="foto"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            name="foto"
                            onChange={handleChange} 
                        />
                        <label
                            htmlFor="foto"
                            className={perfil.foto === null ? "cursor-pointer bg-blue-500 text-white w-full px-4 py-2 rounded-md inline-block text-center" : "cursor-pointer bg-green-600 text-white w-full px-4 py-2 rounded-md inline-block text-center"}
                        >
                            {perfil.foto === null ? 'Sube tu foto de perfil' : 'Foto cargada exitosamente'}
                        </label>
                        {showErrors0 && errors.foto && <p className="text-red-600 text-xs mt-1">{errors.foto}</p>}
                    </div>

                    {/* Comunidad y Teléfono */}
                    <div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Municipio/Comunidad*
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-6">
                                {Municipios.map((comunidad) => (
                                <label key={comunidad} className="flex items-center space-x-2">
                                    <input
                                    type="checkbox"
                                    checked={comunidad1.includes(comunidad)}
                                    onChange={() => toggleComunidad(comunidad)}
                                    className="text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">{comunidad}</span>
                                </label>
                                ))}
                            </div>

                            <div className="flex items-center gap-5 mt-5">
                                <label className="block text-sm font-medium text-gray-700">Otra:</label>
                                <input
                                    type="text"
                                    value={comunidad2}
                                    onChange={(e) => setComunidad2(e.target.value)}
                                    placeholder="Especifica"
                                    className="mt-1 block border w-full border-gray-300 rounded-md p-2"
                                />
                            </div>
                            {showErrors0 && errors.comunidad && <p className="text-red-600 text-xs mt-1">{errors.comunidad}</p>}
                        </div>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número de teléfono: *</label>
                            <input
                                type="tel"
                                placeholder="Ingrese su número de teléfono"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                            {showErrors0 && errors.telefono && (
                                <p className="text-red-600 text-xs mt-1">{errors.telefono}</p>
                            )}
                        </div>

                        <div>
                            <SelectField
                                label="Selecciona tu grupo *"
                                value={grupo}
                                onChange={(e) => setGrupo(e.target.value)}
                                options={opciones.map((o) => ({ label: o, value: o }))}
                                placeholder="Selecciona una opción"
                                error={showErrors0 && !!errors.grupo}
                                helperText={showErrors0 && errors.grupo ? errors.grupo : ""}
                            />
                        </div>

                        {/* Tutor */}
                        <div className="text-center pt-2">
                            <h2 className="text-2xl font-bold text-purple-800 mb-6">DATOS DEL TUTOR</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre completo del tutor *</label>
                            <input
                                type="text"
                                placeholder="Ingrese el nombre completo de su tutor"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={nombre_tutor}
                                onChange={(e) => setTutor(e.target.value)}
                            />
                            {showErrors0 && errors.nombre_tutor && (
                                <p className="text-red-600 text-xs mt-1">{errors.nombre_tutor}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número de teléfono del tutor *</label>
                            <input
                                type="tel"
                                placeholder="Ingrese el número de teléfono del tutor"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                value={tel_tutor}
                                onChange={(e) => setTel_tutor(e.target.value)}
                            />
                            {showErrors0 && errors.tel_tutor && (
                                <p className="text-red-600 text-xs mt-1">{errors.tel_tutor}</p>
                            )}
                        </div>

                        {/* Botón */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        }

        {step===1 &&
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-800 mb-6">DATOS ACADÉMICOS</h2>
                </div>

                {showErrors1 && globalError && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                        {globalError}
                    </div>
                )}

                <form onSubmit={nextStep} className="gap-6">
                    {/* Comunidad y Teléfono */}
                    <div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel académico actual o cursado *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
                                {Preparatorias.map((prepa) => (
                                <label key={prepa} className="flex items-center space-x-2">
                                    <input
                                    type="checkbox"
                                    checked={academico1.includes(prepa)}
                                    onChange={() => toggleAcademico(prepa)}
                                    className="text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">{prepa}</span>
                                </label>
                                ))}
                            </div>
                            <div className="flex items-center gap-5 mt-4">
                                <label className="block text-sm font-medium text-gray-700">Otra:</label>
                                <input
                                    type="text"
                                    placeholder="Especifica"
                                    className="mt-1 block border w-full border-gray-300 rounded-md p-2"
                                    value={academico2}
                                    onChange={(e) => setAcademico2(e.target.value)}
                                />
                            </div>
                            {showErrors1 && errors.academico && <p className="text-red-600 text-xs mt-1">{errors.academico}</p>}
                        </div>
                    </div>
            <div className="mt-6">
                        <SelectField
                label="Selecciona un Semestre *"
                            value={semestre}
                            onChange={(e)=>setSemestre(e.target.value)}
                            options={[
                                {label:'5° semestre', value:'5° semestre'},
                                {label:'6° semestre', value:'6° semestre'},
                                {label:'Concluido', value:'Concluido'},
                            ]}
                            placeholder="Selecciona una opción"
                            error={showErrors1 && !!errors.semestre}
                            helperText={showErrors1 && errors.semestre ? errors.semestre : ""}
                        />
                    </div>
            <div className="mt-6">
                        <SelectField
                            label="¿Cuentas con alguna alergia en especial?"
                            value={alergia}
                            onChange={(e)=>setAlergia(e.target.value)}
                            options={[{label:'Si', value:'Si'},{label:'No', value:'No'}]}
                            placeholder="Selecciona una opción"
                        />
                    </div>

                    {alergia === 'Si' && (
                        <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Especifica el tipo de alergia
                        </label>
                        <input
                            type="text"
                            value={alergia2}
                            onChange={(e) => setAlergia2(e.target.value)}
                            placeholder="Escribe tu respuesta"
                            className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>
                    )}

            <div className="mt-6">
                        <SelectField
                label="¿Cuenta con alguna condición, discapacidad o trastorno especifico de apoyo?"
                            value={discapacidad1}
                            onChange={(e)=>setDiscapacidad1(e.target.value)}
                            options={[{label:'Si', value:'Si'},{label:'No', value:'No'}]}
                            placeholder="Selecciona una opción"
                        />
                    </div>

                    {discapacidad1 === 'Si' && (
                        <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Por favor especifique
                        </label>
                        <input
                            type="text"
                            name="discapacidad2"
                            value={discapacidad2}
                            onChange={(e) => setDiscapacidad2(e.target.value)}
                            placeholder="Escribe tu respuesta"
                            className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>
                    )}

            <div className="mt-4">
                        <SelectField
                label="¿Ocupas orientación vocacional para determinar a qué universidad y/o licenciatura elegir?"
                            value={orientacion}
                            onChange={(e)=>setOrientacion(e.target.value)}
                            options={[{label:'Si', value:'Si'},{label:'No', value:'No'}]}
                            placeholder="Selecciona una opción"
                        />
                    </div>

                    {orientacion === 'No' && (
                        <div>
                            <div className="mt-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Selecciona la(s) universidades a postularte *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-4">
                                        {Universidades.map((universidad) => (
                                        <label key={universidad} className="flex items-center space-x-2">
                                            <input
                                            type="checkbox"
                                            checked={universidades1.includes(universidad)}
                                            onChange={() => toggleUniversidad(universidad)}
                                            className="text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 text-sm">{universidad}</span>
                                        </label>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-5 mt-6">
                                        <label className="block text-sm font-medium text-gray-700">Otra:</label>
                                        <input
                                            type="text"
                                            placeholder="Especifica"
                                            value={universidades2}
                                            onChange={(e) => setUniversidades2(e.target.value)}
                                            className="mt-1 block border w-full border-gray-300 rounded-md p-2"
                                        />
                                    </div>
                                    {showErrors1 && errors.universidades && <p className="text-red-600 text-xs mt-1">{errors.universidades}</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Escribe la carrera o licenciatura a la que te postularas
                                </label>
                                <input
                                    type="text"
                                    placeholder="Escribe tu respuesta"
                                    value={postulacion}
                                    onChange={(e) => setPostulacion(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                    {/* Botón */}
                    <div className="flex justify-between mt-8">
                        <button onClick={prevStep} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                            Anterior
                        </button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        }
        

        {step===2 &&
            <div className={`flex flex-col gap-10 justify-center items-center`}>
            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>Datos del curso</h1>
            
            <form onSubmit={onSubmit} className={`flex flex-col gap-2 sm:w-150 items-center flex-wrap sm:gap-8 p-4`}>

            {globalError && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm w-full max-w-3xl">
                    {globalError}
                </div>
            )}

            <div className={`w-full flex gap-x-3 flex-col items-center justify-center`}>

            <h3 className={`sm:w-100 sm:text-justify`}>¿Qué cambio quieres lograr en tu país con una acción de acuerdo al finalizar tu carrera profesional? </h3>
            <TextField
            fullWidth
            id="outlined-multiline-static"
            multiline
            name="comentario1"
            value={comentario1}
            onChange={(e) => setComentario1(e.target.value)}
            rows={4}
            required
            />

            </div>

            <div className={`w-full flex gap-x-3 flex-col items-center justify-center`}>

            <h3 className={`sm:w-100 sm:text-justify`}>Agrega un comentario de lo que esperas de nosotros</h3>
            <TextField
            fullWidth
            id="outlined-multiline-static"
            multiline
            value={comentario2}
            onChange={(e) => setComentario2(e.target.value)}
            rows={4}
            required
            />

            </div>


            <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
                <BtnForm type={`submit`} TextoBtn={saving ? `Guardando...` : `Finalizar`} disabled={saving}/>
            </div>
                        <div className="hidden">
                                <label className="block text-sm font-medium text-gray-700">Asesor asignado</label>
                                <input
                                    type="text"
                                    value={asesor}
                                    onChange={(e)=>setAsesor(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    readOnly
                                />
                        </div>
                                    <div className="hidden">
                                            <label className="block text-sm font-medium text-gray-700">Academia</label>
                                            <input
                                                type="text"
                                                value={academia}
                                                onChange={(e)=>setAcademia(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                                readOnly
                                            />
                                    </div>
            </form>
            
            </div>
        }

        </>
    )
}
export default RegistroEstudiante;