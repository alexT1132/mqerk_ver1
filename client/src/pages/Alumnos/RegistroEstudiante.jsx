import React from "react";
import { useState } from "react";
import NavLogin from "../../components/NavLogin.jsx";
import { BtnForm, BtnSubirArchivo } from "../../components/FormRegistroComp.jsx";
import { TextField, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel, Autocomplete } from "@mui/material";
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const RegistroEstudiante=()=>{

    const [step, setStep] = useState(0);
        
    const nextStep = () => {
        setStep(step + 1);
        };
    
        const prevStep = () => {
        setStep(step - 1);
        };

        const Municipios=[`SAN JUAN BAUTISTA TUXTEPEC`,`SAN JOSÉ CHILTEPEC`,`SANTA MARÍA JACATEPEC`,`AYOTZINTEPEC`,`LOMA BONITA`,`SAN LUCAS OJITLÁN`,`SAN JUAN BAUTISTA VALLE NACIONAL`,`OTRA`]

        const Preparatorias=[`CBTis`, `COBAO`, `CONALEP`, `CBTF`, `CBTA`,`CECYTE`, `IEBO`, `COLEGIO AMÉRICA`, `COLEGIO TUXTEPEC`, `OTRA`]

        const Disc=[`NINGUNA`, `TRASTORNOS DEL APRENDIZAJE (DISLEXIA)`, `TRASTORNO POR DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDAH)`, `TRASTORNOS DEL ESPECTRO AUTISTA (TEA)`, `TRASTORNOS DE ANSIEDAD`, `TRASTORNOS DEL ESTADO DE ÁNIMO`, `TRASTORNOS DE LA CONDUCTA`, `TRASTORNOS DEL PROCESAMIENTO SENSORIAL`, `DIFICULTADES DE COMUNICACIÓN`, `DISCAPACIDAD FÍSICA`, `OTRO`]

        const Universidades=[`UNAM`, `IPN`, `UV` ,`BUAP`, `NAVAL`, `UDG`, `UNPA`, `ITTUX`, `TECNM`, `ANAHUAC`, `UAQ`, `UDLAP`, `NORMAL SUPERIOR`, `OTRA`]

        const [desp, setDesp]=useState(null)

        const [alergia, setAlergia]=useState(null)

    return(
        <>
        <NavLogin/>

        <div className={`flex flex-col mt-3`}>

        {step===0 &&
        <div className={`flex flex-col gap-10 justify-center items-center`}>
        <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>Datos personales</h1>

        <form onSubmit={nextStep} className={`flex flex-col items-center flex-wrap gap-8 p-4`}>

                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                
                
                
                <TextField
                fullWidth
                helperText={`Ingrese su nombre`}
                      id="outlined-basic" 
                      label="Nombre(s):" 
                      variant="outlined" 
                      name='nombre'
                      
                  />

                <TextField
                fullWidth
                helperText={`Ingrese su(s) apellido(s)`}
                    id="outlined-basic" 
                    label="Apellido(s):" 
                    variant="outlined" 
                    name='Apellidos'
                    
                />


                
                </div>


                <div className={`flex flex-row gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                {/* Fecha de nacimiento */}

               <TextField
                fullWidth
                helperText={`Ingrese su correo electronico`}
                    id="outlined-basic" 
                    label="ejemplo@ejemplo.com" 
                    variant="outlined" 
                    name='municipio'
                    
                />

                <div className={`w-full flex items-center justify-center`}>
                <BtnSubirArchivo helperText={`Adjunte su foto de perfil*`}/>
                </div>

                </div>


                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>

                <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={Municipios}
                defaultChecked={Municipios[0]}
                renderInput={(params) => <TextField {...params} helperText={`Ingrese su municipio`} label="Municipio/Comunidad" />}
                noOptionsText='Opción inválida'
                autoSelect
                />


                <TextField
                fullWidth
                helperText={`Ingrese su numero de telefono`}
                    id="outlined-basic" 
                    label="Numero de telefono:" 
                    variant="outlined" 
                    name='Telefono'
                    
                />


                </div>

                <h2 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-xl`}>Datos del tutor</h2>

                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>

                <TextField
                fullWidth
                helperText={`Ingrese el nombre completo de su tutor`}
                    id="outlined-basic" 
                    label="Nombre completo del tutor" 
                    variant="outlined" 
                    name='Tutor'
                    
                />


                <TextField
                fullWidth
                helperText={`Ingrese el numero de telefono del tutor`}
                    id="outlined-basic" 
                    label="Numero de telefono del tutor" 
                    variant="outlined" 
                    name='Telefono tutor'
                    
                />


                </div>
                
            <div className={`flex w-full justify-end`}>

                <BtnForm TextoBtn={`Continuar`} type={`submit`}/>

            </div>
            </form>
        </div>
        }

        {step===1 &&
        <div className={`flex flex-col gap-10 justify-center items-center`}>
            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>Datos academicos</h1>

            <form onSubmit={nextStep} className={`flex flex-col gap-2 sm:w-150 items-center flex-wrap sm:gap-8 p-4`}>

                <div className={`flex gap-x-20 gap-y-2 sm:gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={Preparatorias}
                defaultValue={Preparatorias[0]}
                renderInput={(params) => <TextField {...params} helperText={`CBTis, COBAO, CBTA...`} label="Nivel academico actual o cursado" />}
                noOptionsText='Opción inválida'
                autoSelect
                />

                <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={[`5to semestre`, `6to semestre`, `Concluido`]}
                renderInput={(params) => <TextField {...params} helperText={`Semestre actualmente cursando`} label="Grado o semestre" />}
                noOptionsText='Opción inválida'
                autoSelect
                />
                
                </div>

                <div className={`flex gap-x-20 gap-y-2 sm:gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                
                <div className={`flex flex-col w-full`}>
                <FormControl
                className={`w-full`}
                fullWidth
                required>
                <h2 className={`text-center`}>¿Cuenta con alergias?</h2>
                    <RadioGroup
                    style={{display:`flex`, justifyContent:`center`}}
                    className="gap-x-10"
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"

                    onChange={(opc) => {
                        
                        if (opc.target.value === "no") {
                        setAlergia(false);
                
                        } else {
                        // No hacer nada o resetear si quieres
                        setAlergia(true);
                        }
                        console.log(value)
                    }}
                    
                    >
                        <FormControlLabel value={`si`} control={<Radio />} label="Si" />
                        <FormControlLabel value={`no`}  control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                {alergia && <TextField fullWidth label={`Indique su/s alergias`}/>}
                </div>
                
                <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={Disc}
                renderInput={(params) => <TextField {...params} helperText={`Indique si cuenta con alguno`} label="¿Trastorno o discapacidad?" />}
                noOptionsText='Opción inválida'
                autoSelect
                />

                

                </div>

                <FormControl
                className={`w-full`}
                fullWidth
                required>
                <h2 className={`text-center`}>¿Ocupas orientación vocacional para determinar a qué universidad y/o licenciatura elegir?</h2>
                    <RadioGroup
                    style={{display:`flex`, justifyContent:`center`}}
                    className="gap-x-10"
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"

                    onChange={(opc) => {
                        
                        if (opc.target.value === "si") {
                        setDesp(false);
                
                        } else {
                        // No hacer nada o resetear si quieres
                        setDesp(true);
                        }
                        console.log(value)
                    }}
                    
                    >
                        <FormControlLabel value={`si`} control={<Radio />} label="Si" />
                        <FormControlLabel value={`no`}  control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
                {desp &&
                <>
                <div className={`flex gap-x-20 gap-y-2 sm:gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                <Autocomplete
                className={`flex w-full`}
                disablePortal
                options={Universidades}
                defaultChecked={Universidades[0]}
                renderInput={(params) => <TextField {...params} helperText={`UNAM, IPN, UV, BUAP...`} label="Universidad a la cual se postula" />}
                noOptionsText='Opción inválida'
                autoSelect
                />

                <TextField
                fullWidth
                helperText={`Ingenieria, Licenciatura...`}
                      id="outlined-basic" 
                      label="Postulación:" 
                      variant="outlined" 
                      name='nombre'
                />
                
                </div>


                

                </>
                }


            
            <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
                <BtnForm type={nextStep} TextoBtn={`Siguiente`}/>
            </div>
            
            
            </form>

        </div>
        
        }
        

        {step===2 &&
            <div className={`flex flex-col gap-10 justify-center items-center`}>
            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>Datos del curso</h1>
            
            <form onSubmit={nextStep} className={`flex flex-col gap-2 sm:w-150 items-center flex-wrap sm:gap-8 p-4`}>


            <div className={`w-full flex gap-x-3 flex-col sm:flex-row items-center justify-center`}>

            <h3 className={`sm:w-100 sm:text-justify`}>¿Qué cambio quieres lograr en tu país con una acción de acuerdo al finalizar tu carrera profesional? </h3>
            <TextField
            fullWidth
            id="outlined-multiline-static"
            multiline
            rows={4}
            />

            </div>

            <div className={`w-full flex gap-x-3 flex-col sm:flex-row items-center justify-center`}>

            <h3 className={`sm:w-100 sm:text-justify`}>Agrega un comentario de lo que esperas de nosotros</h3>
            <TextField
            fullWidth
            id="outlined-multiline-static"
            multiline
            rows={4}
            />

            </div>


            <div className={`flex flex-wrap w-full gap-2 justify-between`}>
                <BtnForm onClick={prevStep} TextoBtn={`Anterior`}/>
                <BtnForm type={nextStep} TextoBtn={`Finalizar`}/>
            </div>
            </form>
            
            </div>
        }

        </div>
        </>
    )
}
export default RegistroEstudiante;