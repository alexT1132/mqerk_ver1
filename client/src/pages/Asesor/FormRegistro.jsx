//ruta: http://192.168.1.20:PORT/colab-info-pers
//App.jsx line 49

import NavLogin from '../../components/NavLogin'
import React, {useState, useRef} from 'react';

import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { Checkbox, FormGroup } from '@mui/material';      //Nuevo componente para listas
import { TextField, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup, Box, Autocomplete, Button, styled } from "@mui/material";


import { BtnForm, BtnSubirArchivo, LabelSubirArchivo } from '../../components/FormRegistroComp';


import Signature from '@uiw/react-signature';


export const FormularioAsesor=()=>{
const [dir, setDir] = useState('');
const [mun, setMun] = useState('');
const [nac, setNac] = useState(``);
const [nacion, setNacion] = useState('');
const [gen, setGen] = useState('');
const [rfc, setRfc] = useState('');

    
    function RFCInput() {
    const [value, setValue] = useState('');
    const [error, setError] = useState(false);
      
        // Expresión regular para validar el RFC
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2}[A\d]$/i;
    
    const handleChange = (event) => {
    const newValue = event.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
    setValue(newValue);
      
        // Validar el valor actual con la expresión regular
        if (!rfcRegex.test(newValue)) {
        setError(true);
        } else{
        setError(false);
        }
        };

      return {value, error, handleChange};
    }

    const {value, error, handleChange}=RFCInput();

        const [step, setStep] = useState(0);
    
        const nextStep = () => {
            setStep(step + 1);
          };
        
          const prevStep = () => {
            setStep(step - 1);
          };
    

        const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 0,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 0,
      });


    const [inputsVisibility, setInputsVisibility] = useState({
    departamento: false,
    area: false,
    idioma: false,
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

    const $svg = useRef(null);
    const handle = () => $svg.current?.clear();
    
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

            <form onSubmit={nextStep} className={`flex flex-col items-center flex-wrap gap-8 p-4`}>

                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                {/* Direccion */}
                <TextField
                fullWidth
                helperText={`Ingrese su dirección`}
                      id="outlined-basic" 
                      label="Dirección:" 
                      variant="outlined" 
                      name='direccion'
                      onChange={(e) => setDir(e.target.value)} 
                      value={dir}
                      required
                  />

                {/* Municipio */}
                <TextField
                fullWidth
                helperText={`Municipio/Localidad`}
                    id="outlined-basic" 
                    label="Municipio:" 
                    variant="outlined" 
                    name='municipio'
                    onChange={(e) => setMun(e.target.value)} 
                    value={mun}
                    required
                />
                </div>


                <div className={`flex flex-row gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                {/* Fecha de nacimiento */}

                <div className={`w-full`}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                onChange={(e)=> setNac(e.target.value)}
                // value={dayjs(nac, `DD/MM/YYYY`)}
                helperText={`Fecha de nacimiento`}
                fullWidth
                disableFuture
                timezone={`system`}
                format={`DD/MM/YYYY`}/>
                </LocalizationProvider>
                </div>

                {console.log(dayjs)}


                <TextField
                helperText={`Nacionalidad`}
                    fullWidth
                    id="outlined-basic" 
                    label="Nacionalidad:" 
                    variant="outlined" 
                    name='Nacion'
                    onChange={(e) => setNacion(e.target.value)} 
                    value={nacion}
                    required
                />
                </div>


                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>

                {/* Genero */}
                <FormControl
                fullWidth>
                    <FormLabel id="radio-buttons-group-label">Género</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="radio-buttons-group-label"
                        name="radio-buttons-group"
                        onChange={(e)=> setGen(e.target.value)}
                        required
                        >
                
                            <FormControlLabel value="f" control={<Radio />} label="Femenino" />
                            <FormControlLabel value="m" control={<Radio />} label="Masculino" />
                            <FormControlLabel value="otro" control={<Radio onChange={()=>{<p>hola</p>}} />} label="Otro" />
                        
                    </RadioGroup>
                    </FormControl>
                

                {/* RFC */}
                <TextField
                fullWidth
                helperText={`Ingrese su RFC`}
                    id="outlined-basic" 
                    label="RFC:" 
                    variant="outlined" 
                    name='RFC'
                    onChange={(e) => setRfc(e.target.value)} 
                    value={rfc}
                    required
                />
                </div>
                
            <div className={`flex w-full justify-end`}>

                <BtnForm TextoBtn={`Continuar`} type={`submit`}/>

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
            
            <form onSubmit={nextStep} className={`flex flex-col justify-around items-center w-full gap-8 p-4`}>
            
            <div className={`flex flex-col items-center gap-10 w-full sm:w-160 lg:w-200 lg:p-2`}>
            <FormControl
            className={`w-full`}
            required>
            <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Nivel de estudios</h2>
            <RadioGroup
            
            aria-labelledby="radio-buttons-group-label"
            name="radio-buttons-group"
            >
            <FormControlLabel value="n1" control={<Radio />} label="Secundaria" />
            <FormControlLabel value="n2" control={<Radio />} label="Bachillerato" />
            <FormControlLabel value="n3" control={<Radio />} label="Licenciatura" />
            <FormControlLabel value="n4" control={<Radio />} label="Maestría" />
            <FormControlLabel value="n5" control={<Radio />} label="Doctorado" />
            <FormControlLabel value="otro" control={<Radio />} label="Otro" />  
            </RadioGroup>
            </FormControl>
            
            <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={["Insituto Tecnológico de Tuxtepec",""]}
                renderInput={(params) => <TextField {...params} label="Institución" />}
                noOptionsText='Opción inválida'
                autoSelect
            />

            <TextField
            className={`w-full`}
                required
                margin="normal"
                id="oulined-basic"
                label='Titulo académico'
                helperText='Ejemplo: Ing. Sistemas Computacionales'
            />

            <div className={`w-full flex flex-col items-center`}>
                <BtnSubirArchivo helperText={`Adjunte su título académico`}/>
            </div>

            <div className={`w-full`}>
            <LocalizationProvider className={`w-full`} dateAdapter={AdapterDayjs}>
                <DateField
                fullWidth
                helperText={`Año en que se graduó`}
                disableFuture
                timezone={`system`}
                format={`DD/MM/YYYY`}/>
            </LocalizationProvider>
            </div>

            <div className={`w-full`}>
                <TextField
                fullWidth
                required
                className={`w-full`}
                margin="normal"
                id="oulined-basic"
                label='Certificación o curso(s) adicionales'
                />
            </div>
            

            <div className={`w-full flex flex-col items-center`}>
                <BtnSubirArchivo helperText={`Adjunte su(s) certificado(s)`}/>
            </div>

            
            
            

            <FormGroup className={`w-full`}>
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Seleccione el/los idioma(s) los cuales conozca y/o domine</h2>
                        <FormControlLabel control={<Checkbox />} label="Español" />
                        <FormControlLabel control={<Checkbox />} label="Inglés" />
                        <FormControlLabel control={<Checkbox/>} label="Francés" />
                        <FormControlLabel control={<Checkbox />} label="Italiano" />
                        <FormControlLabel control={<Checkbox/>} label="Alemán" />
                        <FormControlLabel control={<Checkbox/>} label="Portugués" />
                        <FormControlLabel control={<Checkbox/>} label="Catalán" />
                        <FormControlLabel control={
                            <Checkbox  
                            name="idioma"
                            checked={inputsVisibility.idioma}
                            onChange={mostrarCampoDeTexto}/>}
                            label="Otra/s (especificar)" />
                            {inputsVisibility.idioma && <TextField maxRows={5} multiline label="Mencione cual(es)" variant="outlined" />}
                </FormGroup>

            
            <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
                <BtnForm type={`submit`} TextoBtn={`Siguiente`}/>
            </div>
            
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
            onSubmit={nextStep}
            className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-8 p-4`}>
                {/* Área de interés o departamento al que aplicas:
                    */}

                <FormControl className='w-full'>
                    <FormLabel
                        id="radio-buttons-group-label">
                    </FormLabel>
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Experiencia laboral</h2>
                        <RadioGroup
                            aria-labelledby="radio-buttons-group-label"
                            name="radio-buttons-group"
                            required
                            >
                    
                                <FormControlLabel value="xp1" control={<Radio />} label="Menos de 1 año" />
                                <FormControlLabel value="xp2" control={<Radio />} label="1-2 años" />
                                <FormControlLabel value="xp3" control={<Radio />} label="3-5 años" />
                                <FormControlLabel value="xp4" control={<Radio />} label="Más de 5 años" />
                                
                        </RadioGroup>
                </FormControl>

                <FormGroup className={`w-full`}>
                        <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Áreas de especialización</h2>
                        <FormControlLabel control={<Checkbox />} label="Ciencias exactas" />
                        <FormControlLabel control={<Checkbox />} label="Ciencias sociales" />
                        <FormControlLabel control={<Checkbox/>} label="Educación" />
                        <FormControlLabel control={<Checkbox />} label="Ingeniería y tecnología" />
                        <FormControlLabel control={<Checkbox/>} label="Medicina y salud" />
                        <FormControlLabel control={<Checkbox/>} label="Arte y humanidades" />
                        <FormControlLabel control={<Checkbox/>} label="Negocios y administración" />
                        <FormControlLabel control={
                            <Checkbox  
                            name="area"
                            checked={inputsVisibility.area}
                            onChange={mostrarCampoDeTexto}/>}
                            label="Otra/s (especificar)" />
                            {inputsVisibility.area && <TextField maxRows={5} multiline label="Especifique otra/s áreas de especialización" variant="outlined" />}
                </FormGroup>

                <FormControl className={`w-full`}>
                <FormLabel id="radio-buttons-group-label"></FormLabel>
                    <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>¿Ha tenido experiencia previa en asesorías o tutorías educativas?</h2>
                <RadioGroup
                    className={`justify-around`}
                    row
                    required>
                        <FormControlLabel className={`flex content-center`} value="y" control={<Radio />} label="Sí" />
                        <FormControlLabel className={`flex content-center`} value="med" control={<Radio />} label="Medianamente" />
                        <FormControlLabel className={`flex content-center`} value="n" control={<Radio />} label="No" />
                        
                    </RadioGroup>
                </FormControl>          

                
                <fieldset className={`w-full flex flex-col gap-4`}>
                    <h2 className={`border-b-2 border-[#5215bb]/50 text-[#5215bb]`}>Informacion sobre institución/empresa</h2>

                    
                    <div className={`flex flex-col gap-5`}>
                    <TextField
                        required
                        label="Empresa"
                        variant="outlined"
                        helperText='ej. GEGSA, Login360.'
                        multiline
                        fullWidth
                    />

                    <TextField
                        required
                        label="Actual/último puesto de trabajo"
                        variant="outlined"
                        helperText='ej. Gerente general'
                        multiline
                        fullWidth
                    />
                    
                    
                    {/* Funciones y responsabilidades en el puesto anterior: */}
                    <TextField
                        required
                        label="Funiones/responsabilidades"
                        variant="outlined"
                        helperText='Explica de forma detallada las funciones que realizabas en tu anterios puesto.'
                        multiline
                        rows={4}
                        fullWidth
                    />
                    </div>

                </fieldset>

                
                
                <FormGroup className={`w-full`}>
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
                        {inputsVisibility.plataforma && <TextField maxRows={5} multiline label="Especifique las plataformas" variant="outlined" />}
                        
                </FormGroup>
                
                <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
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

            <form className={`flex flex-col justify-around items-center w-full md:w-170 lg:w-200 gap-4 p-4`}>


                <LabelSubirArchivo
                Label={`Identificación oficial (INE, pasaporte, cartilla militar, etc.):`}
                />


                <LabelSubirArchivo
                Label={`Comprobante de domicilio reciente (no más de 3 meses de antiguedad):`}
                />

                <LabelSubirArchivo
                Label={`Título o cédula profesional (en caso de aplicar):`}
                />

                <LabelSubirArchivo
                Label={`Comprobante de certificaciones adicionales: (OPCIONAL)`}
                />

                <LabelSubirArchivo
                Label={`Carta de recomendación laboral: (OPCIONAL)`}
                />

                <LabelSubirArchivo
                Label={`Currículum vitae actualizado:`}
                />

                <LabelSubirArchivo
                Label={`Fotografía tamaño pasaporte FORMAL (PNG,JPG):`}
                />

                <LabelSubirArchivo
                Label={`Identificación oficial (INE, pasaporte, cartilla militar, etc.):`}
                />

                <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
                <BtnForm onClick={nextStep} TextoBtn={`Siguiente`}/>
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
                                name="option1"
                                checked={inputsVisibility.option1}
                                onChange={handleChange}
                                />} label="Otro (especificar)" />
                                {inputsVisibility.option1 && <TextField multiline maxRows={5} label="¿Dónde escuchaste de nosotros?" variant="outlined" />}
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
                            onChange={handleChange}
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
                            <div className={`flex flex-col gap-y-1 items-center justify-center w-full`}>
                                <div className={`border-2`}>
                            <Signature ref={$svg}/>
                            
                            </div>
                            <button className={`bg-[#1f1f1f] rounded-2xl w-20`} onClick={handle}>
                                <p className={`text-white`}>
                                    Limpiar
                                </p>
                            </button>
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