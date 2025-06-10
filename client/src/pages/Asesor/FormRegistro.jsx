//ruta: http://192.168.1.20:PORT/colab-info-pers
//App.jsx line 49

import NavLogin from '../../components/NavLogin'
import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";       // .

import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {InputLabel, Select} from '@mui/material';      //Nuevo componente para listas
import { TextField, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup } from "@mui/material";


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
    
    return(


        <>
           
            <NavLogin/>
            
            <div className={`flex flex-col py-5 px-5 items-center`}>

            <div>
                <h1 className={`text-center font-bold uppercase text-[17px]`}>Bienvenid@: Nombre de usuario</h1>      {/*Falta agregar la constante del usuario*/}
            


            
                <p className={`text-center m-2`}>
                Como parte de nuestro proceso de reclutamiento de asesores, es fundamental llevar un registro detallado.
                Por ello, te invitamos a completar cuidadosamente el formulario siguiendo las instrucciones proporcionadas.
                </p>
            

            
                <h2 className={`text-[#53289f] text-center font-bold uppercase text-[15px]`}>1. Información personal</h2>
            

            
                <p className={`text-center m-2`}>
                Por favor, completa cada campo de esta sección con tus datos personales de manera precisa y actualizada.
                Asegúrate de verificar la información antes de enviarla.
                </p>
                
            </div>

            <form onSubmit={handleSubmit} className={`flex flex-col items-center flex-wrap gap-8 p-4`}>

                <div className={`flex gap-x-20 gap-y-5 flex-wrap w-full justify-center sm:justify-between`}>
                {/* Direccion */}
                <TextField 
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
                    id="outlined-basic" 
                    label="Municipio:" 
                    variant="outlined" 
                    name='municipio'
                    onChange={(e) => setMun(e.target.value)} 
                    value={mun}
                    required
                />
                </div>


                <div className={`flex gap-x-20 gap-y-5 flex-wrap w-full justify-center sm:justify-between`}>
                {/* Fecha de nacimiento */}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateField/>
                </LocalizationProvider>

                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                format="DD - MM - YYYY"
                timezone="system"
                label="Fecha de nacimiento"
                onChange={(e)=>setNac(e.target.value)}
                required/>
                </LocalizationProvider> */}

                {/* Nacionalidad */}
                <TextField 
                    id="outlined-basic" 
                    label="Nacionalidad:" 
                    variant="outlined" 
                    name='Nacion'
                    onChange={(e) => setNacion(e.target.value)} 
                    value={nacion}
                    required
                />
                </div>


                <div className={`flex gap-x-20 gap-y-5 flex-wrap w-full justify-center sm:justify-between`}>

                {/* Genero */}
                <FormControl>
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
                            <FormControlLabel value="otro" control={<Radio />} label="Otro" />
                        
                    </RadioGroup>
                    </FormControl>
                

                {/* RFC */}
                <TextField 
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
            <button type='submit' className={`bg-[#0064fb] rounded-[10px] p-3`}>
                <p className={`text-white`}>
                Continuar
                </p>
            </button>
            </div>
            </form>
            </div>
        </>


)
}