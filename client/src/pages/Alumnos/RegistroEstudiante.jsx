import { useState, useEffect } from "react";
import NavLogin from "../../components/NavLogin.jsx";
import { BtnForm, BtnSubirArchivo } from "../../components/FormRegistroComp.jsx";
import { TextField, FormControl, FormLabel, Radio, RadioGroup, FormControlLabel, Autocomplete } from "@mui/material";
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const RegistroEstudiante=()=>{

    const [step, setStep] = useState(0);
        
    const nextStep = (e) => {
        setStep(step + 1);
        e.preventDefault();
        };
    
        const prevStep = (e) => {
        setStep(step - 1);
        e.preventDefault();
        };

        const Municipios=[`SAN JUAN BAUTISTA TUXTEPEC`,`SAN JOSÉ CHILTEPEC`,`SANTA MARÍA JACATEPEC`,`AYOTZINTEPEC`,`LOMA BONITA`,`SAN LUCAS OJITLÁN`,`SAN JUAN BAUTISTA VALLE NACIONAL`,`OTRA`];

        const Preparatorias=[`CBTis`, `COBAO`, `CONALEP`, `CBTF`, `CBTA`,`CECYTE`, `IEBO`, `COLEGIO AMÉRICA`, `COLEGIO TUXTEPEC`, `OTRA`];

        const Disc=[`TRASTORNOS DEL APRENDIZAJE (DISLEXIA)`, `TRASTORNO POR DÉFICIT DE ATENCIÓN E HIPERACTIVIDAD (TDAH)`, `TRASTORNOS DEL ESPECTRO AUTISTA (TEA)`, `TRASTORNOS DE ANSIEDAD`, `TRASTORNOS DEL ESTADO DE ÁNIMO`, `TRASTORNOS DE LA CONDUCTA`, `TRASTORNOS DEL PROCESAMIENTO SENSORIAL`, `DIFICULTADES DE COMUNICACIÓN`, `DISCAPACIDAD FÍSICA`, `OTRO`];

        const Universidades=[`UNAM`, `IPN`, `UV` ,`BUAP`, `NAVAL`, `UDG`, `UNPA`, `ITTUX`, `TECNM`, `ANAHUAC`, `UAQ`, `UDLAP`, `NORMAL SUPERIOR`, `OTRA`];

        const [desp, setDesp]=useState(null);

        const [alergia, setAlergia]=useState(null);

        const [disc, setDisc]=useState(null);

        const [ultimosDosDigitos, setUltimosDosDigitos] = useState(null);

        useEffect(() => {
            fetch("https://worldtimeapi.org/api/timezone/America/Mexico_City")
            .then((res) => res.json())
            .then((data) => {
                const year = data.datetime.slice(0, 4);   // "2025"
                setUltimosDosDigitos(year.slice(-2));     // "25"
            })
            .catch((err) => {
                console.error("Error al obtener el año:", err);
            });
        }, []);


        const [formData, setFormData] = useState(() => {
        // Intenta cargar del localStorage al iniciar
        const saved = sessionStorage.getItem("registroEstudianteForm");
        return saved ? JSON.parse(saved) : {
            nombre: "",
            apellidos: "",
            email: "",
            municipio: "",
            telefono: "",
            tutor: "",
            telefonoTutor: "",
            // agrega más campos según necesites
        };
    });

    // Guarda en localStorage cada vez que formData cambie
    useEffect(() => {
        sessionStorage.setItem("registroEstudianteForm", JSON.stringify(formData));
    }, [formData]);

    // Maneja cambios en los campos
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    return(
        <>
        <NavLogin/>

        <div className={`flex w-full justify-end px-1 sm:px-4`}>
        <h1 className="text-[#53289f] text-end text-xs sm:text-base uppercase font-semibold">Folio: meeau{ultimosDosDigitos}-0000</h1>
        </div>

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
                      value={formData.nombre}
                      onChange={handleInputChange}
                      
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
                helperText={`Ingrese su correo electrónico`}
                    id="outlined-basic" 
                    inputmode="email"
                    label="ejemplo@ejemplo.com" 
                    variant="outlined" 
                    name='municipio'
                    
                />

                <div className={`w-full flex items-center overflow-auto justify-center`}>
                <BtnSubirArchivo helperText={`Adjunte su foto de perfil*`}/>
                </div>

                </div>


                <div className={`flex gap-x-20 gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>

                <Autocomplete
                freeSolo
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
                helperText={`Ingrese su número de telefono`}
                    id="outlined-basic" 
                    label="Número de telefono:" 
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
                helperText={`Ingrese el número de telefono del tutor`}
                    id="outlined-basic" 
                    label="Número de telefono del tutor" 
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
                freeSolo
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
                <h2 className={`text-center`}>¿Cuenta con alguna alérgia en especial?</h2>
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
                    }}
                    
                    >
                        <FormControlLabel value={`si`} control={<Radio />} label="Si" />
                        <FormControlLabel value={`no`}  control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                {alergia && <TextField fullWidth label={`Indique su/s alergias`}/>}
                </div>

                <div className={`flex flex-col w-full`}>
                <FormControl
                className={`w-full`}
                fullWidth
                required>
                <h2 className={`text-center`}>¿Sufres de alguna discapacidad o trastorno?</h2>
                    <RadioGroup
                    style={{display:`flex`, justifyContent:`center`}}
                    className="gap-x-10"
                    row
                    aria-labelledby="radio-buttons-group-label"
                    name="radio-buttons-group"

                    onChange={(opc) => {
                        
                        if (opc.target.value === "no") {
                        setDisc(false);
                
                        } else {
                        // No hacer nada o resetear si quieres
                        setDisc(true);
                        }
                    }}
                    
                    >
                        <FormControlLabel value={`si`} control={<Radio />} label="Si" />
                        <FormControlLabel value={`no`}  control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>

                {disc &&
                <Autocomplete
                freeSolo
                className={`flex w-full`}
                disablePortal
                options={Disc}
                renderInput={(params) => <TextField {...params} label={`Indique cuál`} />}
                noOptionsText='Opción inválida'
                autoSelect
                />}
                </div>
                
                

                

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
                    }}
                    
                    >
                        <FormControlLabel value={`si`} control={<Radio />} label="Sí" />
                        <FormControlLabel value={`no`}  control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
                {desp &&
                <>
                <div className={`flex gap-x-20 gap-y-2 sm:gap-y-5 flex-wrap md:flex-nowrap w-full justify-center sm:justify-between`}>
                <Autocomplete
                freeSolo
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
                <BtnForm type={`submit`} TextoBtn={`Siguiente`}/>
            </div>
            
            
            </form>

        </div>
        
        }
        

        {step===2 &&
            <div className={`flex flex-col gap-10 justify-center items-center`}>
            <h1 className={`text-[#53289f] text-center font-bold uppercase text-[15px] sm:text-2xl`}>Datos del curso</h1>
            
            <form onSubmit={nextStep} className={`flex flex-col gap-2 sm:w-150 items-center flex-wrap sm:gap-8 p-4`}>


            <div className={`w-full flex gap-x-3 flex-col items-center justify-center`}>

            <h3 className={`sm:w-100 sm:text-justify`}>¿Qué cambio quieres lograr en tu país con una acción de acuerdo al finalizar tu carrera profesional? </h3>
            <TextField
            fullWidth
            id="outlined-multiline-static"
            multiline
            rows={4}
            />

            </div>

            <div className={`w-full flex gap-x-3 flex-col items-center justify-center`}>

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
                <BtnForm type={`submit`} TextoBtn={`Finalizar`}/>
            </div>
            </form>
            
            </div>
        }

        </div>
        </>
    )
}
export default RegistroEstudiante;