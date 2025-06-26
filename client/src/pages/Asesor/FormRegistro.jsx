import NavLogin from '../../components/NavLogin'
import {useState} from 'react';
import { usePreventPageReload } from "../../NoReload";
import { TextField, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup, Checkbox, FormGroup } from "@mui/material";
import { BtnForm } from '../../components/FormRegistroComp';
import { useForm } from "react-hook-form";

// import SignatureCanvas from `react-signature-canvas`

export const FormularioAsesor=()=>{

    usePreventPageReload();

        const { handleSubmit, register } = useForm();

        const [step, setStep] = useState(0);
        const [titulo, setTitulo] = useState("");
        const [adicional0, setAdicional0] = useState("")
        const [adicional1, setAdicional1] = useState("")

        const handleTituloChange = (e) => {
            setTitulo(e.target.value);
        };

        const handleAdicional0Change = (e) => {
            setAdicional0(e.target.value);
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
    
    return(
        <>
            <NavLogin/>  
            {step===0 &&(
            <div className={`flex flex-col py-5 px-5 items-center`}>

            <div className={`flex flex-col items-center justify-center`}>
                <h1 className={`text-center font-bold uppercase text-[17px] sm:text-3xl`}>Bienvenid@: Nombre de usuario</h1>      {/*Falta agregar la constante del usuario*/}
            


            
                <p className={`flex flex-wrap text-justify p-2 sm:text-md md:w-200`}>
                Como parte de nuestro proceso de reclutamiento de asesores, es fundamental llevar un registro detallado.
                Por ello, te invitamos a completar cuidadosamente el formulario siguiendo las instrucciones proporcionadas.
                </p>
            
                <h2 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>1. Información personal</h2>
            
                <p className={`text-justify p-2 sm:text-md md:w-200`}>
                Por favor, completa cada campo de esta sección con tus datos personales de manera precisa y actualizada.
                Asegúrate de verificar la información antes de enviarla.
                </p>
                
            </div>

            <form onSubmit={nextStep} className="w-[70%] mx-auto p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dirección */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input
                        type="date"
                        {...register("nacimiento")}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                    />
                    </div>

                    {/* Nacionalidad */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#53289f]"
                        placeholder="Tu RFC"
                        {...register("rfc")}
                        required
                    />
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

            {step===1 &&(
            <div className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}>

            <div className={`flex flex-col items-center`}>

            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>2. Información académica</h1>
        

        
            <p className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}>
            Proporciona los detalles de tu formación académica y certificaciones adicionales.
            Incluye información completa y específica sobre tu nivel de estudios, títulos obtenidos,
            idiomas que dominas y cualquier curso relevante que respalde tu experiencia profesional.
            </p>
            </div>
            
            <form onSubmit={nextStep} className="w-[60%] mx-auto p-6 bg-white">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de estudios</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                            defaultValue=""
                            {...register("estudios")}
                            required
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="secundaria">Secundaria</option>
                            <option value="preparatoria">Preparatoria</option>
                            <option value="licenciatura">Licenciatura</option>
                            <option value="maestria">Maestría</option>
                            <option value="doctorado">Doctorado</option>
                        </select>
                </div>
                    {/* Institución */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título academico</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300"
                            defaultValue=""
                            onChange={handleTituloChange}
                            {...register("titulo")}
                            required
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="si">Si</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    {titulo === "si" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subir su titulo aqui</label>
                            <input
                            type="file"
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
                            {...register("titulo2")}
                            />
                        </div>
                    )}

                    {/* Año de graduación */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año de graduación</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificaciones o cursos adicionales</label>
                            <input
                            type="file"
                            {...register("certificaciones")}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-200"
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

            {step===2 &&(
                <div className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}>
            <article className='flex flex-col items-center'>          
                <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>3. Información profesional</h1>
            
                <p className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}>
                Ingresa la información relacionada con tu experiencia profesional, incluyendo roles previos,
                instituciones donde has trabajado, y áreas de especialización.
                Esta información nos ayudará a evaluar mejor tu perfil como colaborador.
                </p>
            </article>

            <form
            onSubmit={onSubmit}
            className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-8 p-4`}>
                {/* Área de interés o departamento al que aplicas:
                    */}

                <FormControl className='w-full'>
                    <FormLabel
                        id="radio-buttons-group-label">
                    </FormLabel>
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Experiencia laboral</h2>
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

                <FormGroup className={`w-full`} >
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Áreas de especialización</h2>
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
                    <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>¿Ha tenido experiencia previa en asesorías o tutorías educativas?</h2>
                <RadioGroup
                    className={`justify-around`}
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"
                    {...register("pregunta1")}
                    >
                        <FormControlLabel value="si" control={<Radio />} label="Sí" />
                        <FormControlLabel value="medianamente" control={<Radio />} label="Medianamente" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>          

                
                <fieldset className={`w-full flex flex-col gap-4`}>
                    <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Informacion sobre institución/empresa</h2>

                    
                    <div className={`flex flex-col gap-5`}>
                    <TextField
                        label="Empresa"
                        variant="outlined"
                        helperText='ej. GEGSA, Login360.'
                        multiline
                        {...register("empresa")}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Actual/último puesto de trabajo"
                        variant="outlined"
                        helperText='ej. Gerente general'
                        multiline
                        {...register("ultimo_puesto")}
                        fullWidth
                        required
                    />
                    
                    
                    {/* Funciones y responsabilidades en el puesto anterior: */}
                    <TextField
                        label="Funiones/responsabilidades"
                        variant="outlined"
                        helperText='Explica de forma detallada las funciones que realizabas en tu anterios puesto.'
                        multiline
                        {...register("funsiones")}
                        rows={4}
                        fullWidth
                        required
                    />
                    </div>

                </fieldset>

                
                
                <FormGroup className={`w-full`} {...register("plataformas")}>
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Conocimientos en plataformas educativas digitales</h2>
                        <FormControlLabel control={<Checkbox />} label="Google classroom" />
                        <FormControlLabel control={<Checkbox />} label="Microsoft Teams" />
                        <FormControlLabel control={<Checkbox />} label="Zoom" />
                        <FormControlLabel control={<Checkbox />} label="Moodle" />
                        <FormControlLabel control={<Checkbox />} label="Edmodo" />
                        <FormControlLabel control={
                        <Checkbox
                        name="plataforma"
                        checked={inputsVisibility.plataforma}
                        onChange={mostrarCampoDeTexto}
                        />} label="Otra (especificar)" />
                        {inputsVisibility.plataforma && <TextField {...register("plataformas2")} maxRows={5} multiline label="Especifique las plataformas" variant="outlined" />}
                        
                </FormGroup>
                
                <div className='w-full flex justify-end'>
                <BtnForm type={`submit`} TextoBtn={`Siguiente`}/>
                </div>

                </form>
                </div>
            )}
            
            {step===3 &&(
                <div className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}>
            <article className='flex flex-col items-center'>            
                <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>4. Documentos personales y oficiales</h1>
            

            
                <p className={`text-justify p-2 w-fit sm:text-md sm:w-fit md:w-170 lg:w-200`}>
                Adjunta en formato PDF los documentos personales y oficiales requeridos,  que respalde tu registro.
                Asegúrate de que todos los archivos sean legibles y estén actualizados.
                </p>
            </article>

            <form onSubmit={nextStep} className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-4 p-4`}>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación oficial (INE, pasaporte, cartilla militar, etc.):
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comprobante de domicilio reciente (no más de 3 meses de antiguedad):
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título o cédula profesional (en caso de aplicar):
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comprobante de certificaciones adicionales: (OPCIONAL)
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carta de recomendación laboral: (OPCIONAL)
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currículum vitae actualizado:
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fotografía tamaño pasaporte FORMAL (PNG,JPG):
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>
                <div className="mb-6 w-120">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación oficial (INE, pasaporte, cartilla militar, etc.):
                    </label>
                    <input
                    type="file"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-purple-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                </div>

                <div className='w-full flex justify-end'>
                <BtnForm type={"submite"} TextoBtn={`Siguiente`}/>
                </div>

            </form>
            </div>
            )}

            {step===4 &&(
                <div className={`flex flex-col w-full flex-wrap py-5 px-5 items-center justify-center`}>
                    <article className='flex flex-col items-center'>
                        <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}> 5. Información adicional </h1>      {/*Falta agregar la constante del usuario*/}
                    
                        <p className={`p-2 w-fit`}>
                        Incluye lo que no se haya solicitado en las secciones anteriores.
                        </p>
                    </article>
                
                    <form className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-4 p-4`}>
                        <FormGroup className='w-full'>
                            <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>¿Cómo te enteraste de MQerKAcademy?</h2>
                            <FormControlLabel control={<Checkbox />} label="Redes sociales (Facebook, Instagram, X, etc.)" />
                            <FormControlLabel control={<Checkbox />} label="Recomendación de un amigo/colega" />
                            <FormControlLabel control={<Checkbox />} label="Publicidad en línea" />
                            <FormControlLabel control={<Checkbox />} label="Evento o feria educativa" />
                            <FormControlLabel control={<Checkbox />} label="Página web" />
                            <FormControlLabel control={
                                <Checkbox 
                                checked={inputsVisibility.option1}
                                onChange={handleAdicional1Change}
                                />} label="Otro (especificar)" />
                                {adicional1 === 'otro' && <TextField multiline maxRows={5} label="¿Dónde escuchaste de nosotros?" variant="outlined" />}
                        </FormGroup>

                        <FormGroup className='w-full'>
                            <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>¿Por qué te gustaría ser asesor en MQerKAcademy?</h2>
                            <FormControlLabel control={<Checkbox />} label="Contribuir a la educación" />
                            <FormControlLabel control={<Checkbox />} label="Desarrollo profesional" />
                            <FormControlLabel control={<Checkbox />} label="Interés en ciencias y tecnología" />
                            <FormControlLabel control={<Checkbox />} label="Flexibilidad horaria" />
                            <FormControlLabel control={
                            <Checkbox
                            name="option2"
                            checked={inputsVisibility.option2}
                            />} label="Otro (especificar)" />
                            {inputsVisibility.option2 && <TextField maxRows={5} multiline label="Mencione una razon por la cual asesor con nosotros" variant="outlined" />}    
                        </FormGroup>

                        <FormControl className='w-full'>
                            <FormLabel id="radio-buttons-group-label"></FormLabel>
                                <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>¿Estarías dispuesto a participar en formaciones continuas o capacitaciones internas?</h2>
                                <RadioGroup
                                className='flex justify-around'
                                row
                                aria-labelledby="radio-buttons-group-label"
                                name="radio-buttons-group"
                                onChange={(e)=> setGen(e.target.value)}
                                required>
                                    <FormControlLabel value="y" control={<Radio />} label="Sí" />
                                    <FormControlLabel value="n" control={<Radio />} label="No" />
                                    
                                </RadioGroup>
                        </FormControl>
                        

                    
                        
                    <fieldset className='flex w-full flex-col items-center gap-10'>
                    <article className={`flex flex-col gap-2`}>
                
                    <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>6. Confirmación y consentimiento</h1>
                

                
                    <p className='text-justify'>
                    Al completar este formulario, confirmas que la información proporcionada es verídica y autorizas a MQerKAcademy
                    a utilizar estos datos únicamente para fines relacionados con el proceso de reclutamiento y contratación, conforme
                    a la normativa de protección de datos aplicable. Por favor, firma digitalmente o marca la casilla de consentimiento
                    para proceder
                    </p>
                    </article>
                        
                        <FormControl>
                        <h2 className='text-center'>¿Autorizas a MQerKAcademy para almacenar y procesar tus datos personales de acuerdo con las políticas de privacidad?</h2>
                            <FormLabel id="radio-buttons-group-label"></FormLabel>
                                <RadioGroup
                                className='flex justify-around'
                                    row
                                    aria-labelledby="radio-buttons-group-label"
                                    name="radio-buttons-group"
                                    onChange={(e)=> setGen(e.target.value)}
                                    required
                                    >
                            
                                        <FormControlLabel value="y" control={<Radio />} label="Sí, autorizo el uso de mis datos" />
                                        <FormControlLabel className='text-red-500' value="n" control={<Radio />} label="No autorizo el uso de mis datos" />
                                        
                                </RadioGroup>
                        </FormControl>
                        
                        
                        <div className={`flex flex-col gap-2`}>
                            <h2 className={`text-center`}>Firma digital o nombre completo como confirmación de la veracidad de los datos proporcionados.</h2>
                            <div className={`flex items-center justify-center w-full`}>
                                <div className={`border-2 rounded-2xl`}>
                            {/* <SignatureCanvas
                            fullWidth
                            canvasProps={{ className: 'sigCanvas'}} /> */}
                            </div>
                            </div>
                        </div>

                        <BtnForm TextoBtn={`Finalizar`}/>

                        </fieldset>


                    </form>
                    
                
                
                    
            </div>
            )}
        </>


)
}