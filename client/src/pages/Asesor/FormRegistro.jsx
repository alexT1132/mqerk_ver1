//ruta: http://192.168.1.20:PORT/colab-info-pers
//App.jsx line 49

import NavLogin from '../../components/NavLogin'
import React, {useState} from 'react';

import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { Checkbox, FormGroup } from '@mui/material';      //Nuevo componente para listas
import { TextField, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup, Box, Autocomplete, Button, styled } from "@mui/material";


import { BtnForm, BtnSubirArchivo } from '../../components/FormRegistroComp';


export const FormularioAsesor=()=>{
const [dir, setDir] = useState('');
const [mun, setMun] = useState('');
const [nac, setNac] = useState('');
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

        const [step, setStep] = useState(2);
    
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
        crm: false,
        softwarecontabilidad: false,
        plataforma: false,
      });

      const handleChange2 = (event) => {
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

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                helperText={`Fecha de nacimiento`}
                fullWidth
                disableFuture
                timezone={`system`}
                format={`DD/MM/YYYY`}/>
                </LocalizationProvider>


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
            
            <form className={`flex flex-col justify-around items-center w-full flex-wrap gap-8 p-4`}>
            
            <div className={`flex flex-col items-center gap-10 w-full sm:w-160 lg:w-200 lg:p-2`}>
            <FormControl
            className={`w-full`}
            required>
            <FormLabel id="radio-buttons-group-label">Nivel de estudios</FormLabel>
            <RadioGroup
            
            aria-labelledby="radio-buttons-group-label"
            name="radio-buttons-group"
            >
            <FormControlLabel value="n1" control={<Radio />} label="Secundaria" />
            <FormControlLabel value="n2" control={<Radio />} label="Bachillerato" />
            <FormControlLabel value="n3" control={<Radio />} label="Licenciatura" />
            <FormControlLabel value="n4" control={<Radio />} label="Maestría" />
            <FormControlLabel value="n5" control={<Radio />} label="Doctorado" />
            {/* Falta agregar una manera de especificar el nivel de estudios */}
            <FormControlLabel value="otro" control={<Radio />} label="Otro" />  
            </RadioGroup>
            </FormControl>
            
            <Autocomplete
                className={`flex flex-wrap w-full`}
                disablePortal
                options={``}
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
                <BtnSubirArchivo/>
            </div>

            
            <LocalizationProvider className={`w-full`} dateAdapter={AdapterDayjs}>
                <DateField
                className={`w-full`}
                helperText={`Año en que se graduó`}
                disableFuture
                timezone={`system`}
                format={`DD/MM/YYYY`}/>
            </LocalizationProvider>
            
            {/* Certificaciones o cursos adicionales
                la idea es que el colaborador pueda
                subir su certificado */}
            <div>

            </div>
            

            <div className={`w-full flex flex-col items-center`}>
                <BtnSubirArchivo/>
            </div>

            
            
            

            {/* Se va a añadir un checkbox para seleccionar el idioma
                que dominen */}

            <TextField
            required
            className={`w-full`}
            margin="normal"
            id="oulined-basic"
            label='Especialización o área de estudios'
            helperText='Ejemplo: Ing. Sistemas Computacionales'
            />

            
            <div className={`flex flex-wrap w-full justify-end`}>
                <BtnForm TextoBtn={`Siguiente`}/>
            </div>
            
            </div>
            </form>

            
            </div>
            )}

            {step===2 &&(
                <main className="vertical" id="responsive">
            <article>          
                <h1 className="instrucciones-reg">3. Información profesional</h1>
            

            
                <p className="parrafo-reg">
                Ingresa la información relacionada con tu experiencia profesional, incluyendo roles previos,
                instituciones donde has trabajado, y áreas de especialización.
                Esta información nos ayudará a evaluar mejor tu perfil como colaborador.
                </p>
            </article>

            <form
                style={{
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'stretch'
                    }}>
                {/* Área de interés o departamento al que aplicas:
                    */}

                <FormControl style={{marginBlock:'5%'}}>
                    <FormLabel
                        id="radio-buttons-group-label">
                    </FormLabel>
                        <h2>Experiencia laboral</h2>
                        <hr />
                        <RadioGroup
                            row
                            aria-labelledby="radio-buttons-group-label"
                            name="radio-buttons-group"
                            required
                            style={{display:'flex', flexDirection:'column'}}
                            >
                    
                                <FormControlLabel value="xp1" control={<Radio />} label="Menos de 1 año" />
                                <FormControlLabel value="xp2" control={<Radio />} label="1-2 años" />
                                <FormControlLabel value="xp3" control={<Radio />} label="3-5 años" />
                                <FormControlLabel value="xp4" control={<Radio />} label="Más de 5 años" />
                                
                        </RadioGroup>
                </FormControl>

                <FormGroup
                style={{
                    'textAlign':'justify',
                    'fontFamily':"Roboto,Helvetica,Arial,sans-serif",
                    marginBlock:'5%'
                    
                    }}>
                        <h2>Áreas de especialización</h2>
                        <hr />
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
                            onChange={handleChange2}/>}
                            label="Otra/s (especificar)" />
                            {inputsVisibility.area && <TextField maxRows={5} multiline label="Especifique otra/s áreas de especialización" variant="outlined" />}
                </FormGroup>

                <FormControl style={{width:'100%'}}>
                <FormLabel id="radio-buttons-group-label"></FormLabel>
                    <h2>¿Ha tenido experiencia previa en asesorías o tutorías educativas?</h2>
                    <hr />
                <RadioGroup
                    style={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"
                    required>
                        <FormControlLabel value="y" control={<Radio />} label="Sí" />
                        <FormControlLabel value="med" control={<Radio />} label="Medianamente" />
                        <FormControlLabel value="n" control={<Radio />} label="No" />
                        
                    </RadioGroup>
                </FormControl>          

                
                <fieldset style={{marginBlock:'5%'}}>
                    <h2>Informacion sobre institución/empresa</h2>
                    <hr />

                    <TextField
                        required
                        label="Empresa"
                        variant="outlined"
                        helperText='ej. GEGSA, Login360.'
                        multiline
                        fullWidth
                        style={{
                            'marginBottom':'25px'
                        }}
                    />

                    <TextField
                        required
                        label="Actual/último puesto de trabajo"
                        variant="outlined"
                        helperText='ej. Gerente general'
                        multiline
                        fullWidth
                        style={{
                            'marginTop':'15px',
                            'marginBottom':'25px'
                        }}
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

                </fieldset>

                
                
                <FormGroup
                    style={{
                    'fontFamily':"Roboto,Helvetica,Arial,sans-serif", marginBlock:'5%'
                    }}>
                        <h2>Conocimientos en plataformas educativas digitales</h2>
                        <hr />
                        <FormControlLabel control={<Checkbox />} label="Google classroom" />
                        <FormControlLabel control={<Checkbox />} label="Microsoft Teams" />
                        <FormControlLabel control={<Checkbox />} label="Zoom" />
                        <FormControlLabel control={<Checkbox />} label="Moodle" />
                        <FormControlLabel control={<Checkbox />} label="Edmodo" />
                        <FormControlLabel control={
                        <Checkbox
                        name="plataforma"
                        checked={inputsVisibility.plataforma}
                        onChange={handleChange}
                        />} label="Otra (especificar)" />
                        {inputsVisibility.plataforma && <TextField maxRows={5} multiline label="Especifique las plataformas" variant="outlined" />}
                        
                </FormGroup>
                
                <div style={{width:'100%', marginBottom:'15px'}}>
                <button
                className="btn-cont-reg">Siguiente</button>
                </div>

                </form>
                </main>
            )}
            
            {step===3 &&(
                <></>
            )}

            {step===4 &&(
                <></>
            )}
        </>


)
}