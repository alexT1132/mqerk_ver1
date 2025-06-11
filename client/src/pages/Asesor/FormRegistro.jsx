//ruta: http://192.168.1.20:PORT/colab-info-pers
//App.jsx line 49

import NavLogin from '../../components/NavLogin'
import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";       // .

import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {InputLabel, Select} from '@mui/material';      //Nuevo componente para listas
import { TextField, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup, Box, Autocomplete, Button, styled } from "@mui/material";

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { BtnForm, BtnSubirArchivo } from '../../components/FormRegistroComp';


export const InfoPer=()=>{
const [dir, setDir] = useState('');
const [mun, setMun] = useState('');
const [nac, setNac] = useState('');
const [nacion, setNacion] = useState('');
const [gen, setGen] = useState('');
const [rfc, setRfc] = useState('');

const navigate = useNavigate();

const handleSubmit = (event) => {
event.preventDefault();

        const previo = {
            dir,
            mun,
            nac,
            nacion,
            gen,
            rfc
        }

        navigate('/colab-info-pers', { state: previo });

}

    
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

        const [step, setStep] = useState(1);
    
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

            <form onSubmit={handleSubmit} className={`flex flex-col items-center flex-wrap gap-8 p-4`}>

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

                <BtnForm type={`submit`}/>

            </div>
            </form>
            </div>
            )}

            {step===1 &&(
            <div className={`flex flex-col py-5 px-5 items-center`}>

            <div className={`flex flex-col items-center`}>

            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>2. Información académica</h1>
        

        
            <p className={`text-justify p-2 sm:text-md md:w-200`}>
            Proporciona los detalles de tu formación académica y certificaciones adicionales.
            Incluye información completa y específica sobre tu nivel de estudios, títulos obtenidos,
            idiomas que dominas y cualquier curso relevante que respalde tu experiencia profesional.
            </p>
            </div>
            
            <form className={`flex items-center justify-around flex-wrap gap-8 p-4`}>

            <div className={`flex w-full`}>
            <FormControl
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
            </div>
            <div className='flex flex-col gap-5 w-full'>

                <Autocomplete
                    disablePortal
                    options={``}
                    renderInput={(params) => <TextField {...params} label="Institución" />}
                    noOptionsText='Opción inválida'
                    autoSelect
                    />
                <TextField
                    required
                    fullWidth
                    margin="normal"
                    id="oulined-basic"
                    label='Titulo académico'
                    helperText='Ejemplo: Ing. Sistemas Computacionales'
                    />

                <BtnSubirArchivo/>
                

                
            </div>
            
            <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField
                helperText={`Fecha de nacimiento`}
                fullWidth
                disableFuture
                timezone={`system`}
                format={`DD/MM/YYYY`}/>
                </LocalizationProvider>
            </div>
            
            

            

            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                openTo="year"
                format="YYYY"
                minDate={new Date('21-01-1900')}
                label="Año en que se graduó" />
                </LocalizationProvider> */}

            {/* Especialidad o area de estudios */}

            {/* Certificaciones o cursos adicionales
                la idea es que el colaborador pueda
                subir su certificado */}

            {/* Se va a añadir un checkbox para seleccionar el idioma
                que dominen */}
            
                
            </form>

            <div className={`w-full flex justify-end`}>
            <BtnForm TextoBtn={`Siguiente`}/>
            </div>
            </div>
            )}
            
        </>


)
}