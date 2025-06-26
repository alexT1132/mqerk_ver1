import {useState, useEffect} from 'react'
import { useAsesor } from "../../context/AsesorContext.jsx";
import { usePreventPageReload } from "../../NoReload.jsx";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NavLogin.jsx";
import Veintiuno from "../../assets/21.png";
import R21_1 from "../../assets/21-R1.png";
import R21_2 from "../../assets/21-R2.png";
import R21_3 from "../../assets/21-R3.png";
import R21_4 from "../../assets/21-R4.png";
import Veintidos from "../../assets/22.png";
import R22_1 from "../../assets/22-R1.png";
import R22_2 from "../../assets/22-R2.png";
import R22_3 from "../../assets/22-R3.png";
import R22_4 from "../../assets/22-R4.png";
import Veintitres from "../../assets/23.png";
import R23_1 from "../../assets/23-R1.png";
import R23_2 from "../../assets/23-R2.png";
import R23_3 from "../../assets/23-R3.png";
import R23_4 from "../../assets/23-R4.png";
import Veinticuatro from "../../assets/24.png";
import R24_1 from "../../assets/24-R1.png";
import R24_2 from "../../assets/24-R2.png";
import R24_3 from "../../assets/24-R3.png";
import R24_4 from "../../assets/24-R4.png";
import Veinticinco from "../../assets/25.png";
import R25_1 from "../../assets/25-R1.png";
import R25_2 from "../../assets/25-R2.png";
import R25_3 from "../../assets/25-R3.png";
import R25_4 from "../../assets/25-R4.png";


export function Test() {

    usePreventPageReload();

    const [step, setStep] = useState(1);
    const [bigfive1, setBigfive1] = useState("");
    const [bigfive2, setBigfive2] = useState("");
    const [bigfive3, setBigfive3] = useState("");
    const [bigfive4, setBigfive4] = useState("")
    const [bigfive5, setBigfive5] = useState("")
    const [bigfive6, setBigfive6] = useState("")
    const [bigfive7, setBigfive7] = useState("")
    const [bigfive8, setBigfive8] = useState("")
    const [bigfive9, setBigfive9] = useState("")
    const [bigfive10, setBigfive10] = useState("")
    const [bigfive11, setBigfive11] = useState("")
    const [bigfive12, setBigfive12] = useState("")
    const [bigfive13, setBigfive13] = useState("")
    const [bigfive14, setBigfive14] = useState("")
    const [bigfive15, setBigfive15] = useState("")
    const [bigfive16, setBigfive16] = useState("")
    const [bigfive17, setBigfive17] = useState("")
    const [bigfive18, setBigfive18] = useState("")
    const [bigfive19, setBigfive19] = useState("")
    const [bigfive20, setBigfive20] = useState("")
    const [bigfive21, setBigfive21] = useState("")
    const [bigfive22, setBigfive22] = useState("")

    const [dass1, setDass1] = useState("");
    const [dass2, setDass2] = useState("");
    const [dass3, setDass3] = useState("");
    const [dass4, setDass4] = useState("");
    const [dass5, setDass5] = useState("");
    const [dass6, setDass6] = useState("");
    const [dass7, setDass7] = useState("");
    const [dass8, setDass8] = useState("");
    const [dass9, setDass9] = useState("");
    const [dass10, setDass10] = useState("");
    const [dass11, setDass11] = useState("");
    const [dass12, setDass12] = useState("");
    const [dass13, setDass13] = useState("");
    const [dass14, setDass14] = useState("");
    const [dass15, setDass15] = useState("");
    const [dass16, setDass16] = useState("");
    const [dass17, setDass17] = useState("");
    const [dass18, setDass18] = useState("");
    const [dass19, setDass19] = useState("");
    const [dass20, setDass20] = useState("");
    const [dass21, setDass21] = useState("");

        const [Zavic1, setZavic1] = useState('');
        const [Zavic2, setZavic2] = useState('');
        const [Zavic3, setZavic3] = useState('');
        const [Zavic4, setZavic4] = useState('');
        const [Zavic5, setZavic5] = useState('');
        const [Zavic6, setZavic6] = useState('');
        const [Zavic7, setZavic7] = useState('');
        const [Zavic8, setZavic8] = useState('');
        const [Zavic9, setZavic9] = useState('');
        const [Zavic10, setZavic10] = useState('');
        const [Zavic11, setZavic11] = useState('');
        const [Zavic12, setZavic12] = useState('');
        const [Zavic13, setZavic13] = useState('');
        const [Zavic14, setZavic14] = useState('');
        const [Zavic15, setZavic15] = useState('');
        const [Zavic16, setZavic16] = useState('');
        const [Zavic17, setZavic17] = useState('');
        const [Zavic18, setZavic18] = useState('');
        const [Zavic19, setZavic19] = useState('');
        const [Zavic20, setZavic20] = useState('');
        const [Zavic21, setZavic21] = useState('');
        const [Zavic22, setZavic22] = useState('');
        const [Zavic23, setZavic23] = useState('');
        const [Zavic24, setZavic24] = useState('');
        const [Zavic25, setZavic25] = useState('');
        const [Zavic26, setZavic26] = useState('');
        const [Zavic27, setZavic27] = useState('');
        const [Zavic28, setZavic28] = useState('');
        const [Zavic29, setZavic29] = useState('');
        const [Zavic30, setZavic30] = useState('');
        const [Zavic31, setZavic31] = useState('');
        const [Zavic32, setZavic32] = useState('');
        const [Zavic33, setZavic33] = useState('');
        const [Zavic34, setZavic34] = useState('');
        const [Zavic35, setZavic35] = useState('');
        const [Zavic36, setZavic36] = useState('');
        const [Zavic37, setZavic37] = useState('');
        const [Zavic38, setZavic38] = useState('');
        const [Zavic39, setZavic39] = useState('');
        const [Zavic40, setZavic40] = useState('');
        const [Zavic41, setZavic41] = useState('');
        const [Zavic42, setZavic42] = useState('');
        const [Zavic43, setZavic43] = useState('');
        const [Zavic44, setZavic44] = useState('');
        const [Zavic45, setZavic45] = useState('');
        const [Zavic46, setZavic46] = useState('');
        const [Zavic47, setZavic47] = useState('');
        const [Zavic48, setZavic48] = useState('');
        const [Zavic49, setZavic49] = useState('');
        const [Zavic50, setZavic50] = useState('');
        const [Zavic51, setZavic51] = useState('');
        const [Zavic52, setZavic52] = useState('');
        const [Zavic53, setZavic53] = useState('');
        const [Zavic54, setZavic54] = useState('');
        const [Zavic55, setZavic55] = useState('');
        const [Zavic56, setZavic56] = useState('');
        const [Zavic57, setZavic57] = useState('');
        const [Zavic58, setZavic58] = useState('');
        const [Zavic59, setZavic59] = useState('');
        const [Zavic60, setZavic60] = useState('');

    const [baron1, setBaron1] = useState("");
    const [baron2, setBaron2] = useState("");
    const [baron3, setBaron3] = useState("");
    const [baron4, setBaron4] = useState("");
    const [baron5, setBaron5] = useState("");
    const [baron6, setBaron6] = useState("");
    const [baron7, setBaron7] = useState("");
    const [baron8, setBaron8] = useState("");
    const [baron9, setBaron9] = useState("");
    const [baron10, setBaron10] = useState("");
    const [baron11, setBaron11] = useState("");
    const [baron12, setBaron12] = useState("");
    const [baron13, setBaron13] = useState("");
    const [baron14, setBaron14] = useState("");
    const [baron15, setBaron15] = useState("");
    const [baron16, setBaron16] = useState("");
    const [baron17, setBaron17] = useState("");
    const [baron18, setBaron18] = useState("");
    const [baron19, setBaron19] = useState("");
    const [baron20, setBaron20] = useState("");
    const [baron21, setBaron21] = useState("");
    const [baron22, setBaron22] = useState("");
    const [baron23, setBaron23] = useState("");
    const [baron24, setBaron24] = useState("");
    const [baron25, setBaron25] = useState("");

    const [Academica1, setAcademica1] = useState('');
         const [Academica2, setAcademica2] = useState('');
         const [Academica3, setAcademica3] = useState('');
         const [Academica4, setAcademica4] = useState('');
         const [Academica5, setAcademica5] = useState('');
         const [Academica6, setAcademica6] = useState('');
         const [Academica7, setAcademica7] = useState('');
         const [Academica8, setAcademica8] = useState('');
         const [Academica9, setAcademica9] = useState('');
         const [Academica10, setAcademica10] = useState('');
         const [Academica11, setAcademica11] = useState('');
         const [Academica12, setAcademica12] = useState('');
         const [Academica13, setAcademica13] = useState('');
         const [Academica14, setAcademica14] = useState('');
         const [Academica15, setAcademica15] = useState('');
         const [Academica16, setAcademica16] = useState('');
         const [Academica17, setAcademica17] = useState('');
         const [Academica18, setAcademica18] = useState('');
         const [Academica19, setAcademica19] = useState('');
         const [Academica20, setAcademica20] = useState('');
         const [ResultAcademica, setResultAcademica] = useState(0);

         useEffect(() => {
            let temResultAcademica = 0;

            if (Academica1 === 'Escuchar activamente al estudiante') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica2) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica3 === 'Proporcionarle recursos adicionales, como ejercicios prácticos') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica4) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica5 === 'Investigar las causas subyacentes y buscar soluciones con él') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica6) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica7 === 'Empático') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica8 === 'Observar su desempeño general y recopilar retroalimentación') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica9) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica10 === 'Escuchar con empatía y referirlo a un profesional si es necesario') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica11) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica12 === 'Ser constructivo y destacar áreas de mejora junto con logros') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica13) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica14 === 'Hablar con él en privado para entender la causa del comportamiento') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica15) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica16 === 'Priorizar casos según su urgencia y delegar tareas si es necesario') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica17) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica18 === 'Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal') {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica19) {
                temResultAcademica = temResultAcademica + 10;
            }

            if (Academica20) {
                temResultAcademica = temResultAcademica + 10;
            }

            setResultAcademica(temResultAcademica);

         })

    const [isCorrect, setIsCorrect] = useState(false);
         const [isCorrect2, setIsCorrect2] = useState(false);
         const [isCorrect3, setIsCorrect3] = useState(false);
         const [isCorrect4, setIsCorrect4] = useState(false);

        const keywords = [
            'práctico',
            'práctica', 
            'construir', 
            'construyendo',
            'entretenido',
            'entretenida',
            'creatividad',
            'creativo',
            'creativa',
            'relevancia',
            'relevante',
            'interactiva',
            'llamativa',
            'interesante'
        ];

        const keywords2 = [
            'Breve',
            'breve',
            'claro', 
            'conciso', 
            'positivo',
            'constructivo',
            'motivador',
            'específico',
            'claridad',
            'profesionalismo'
        ];

        const keywords3 = [
            'capacidad de persuasión',
            'persuasión', 
            'persuasiva', 
            'entusiasmo',
            'entusiasta'
        ];

        const keywords4 = [
            'Empatia',
            'empatia',
            'empatica',
            'Motivación',
            'motivación',
            'motivacional'
        ];

        const handleInputChange = (e) => {
            const value = e.target.value.toLowerCase();
            setWais10(value);


        // Check if any keyword is present in the input
            const containsKeyword = keywords.some(keyword => value.includes(keyword));
            setIsCorrect(containsKeyword);
        };

        const handleInputChange2 = (e) => {
            const value = e.target.value.toLowerCase();
            setWais12(value);


        // Check if any keyword is present in the input
            const containsKeyword2 = keywords2.some(keyword => value.includes(keyword));
            setIsCorrect2(containsKeyword2);
        };

        const handleInputChange3 = (e) => {
            const value = e.target.value.toLowerCase();
            setWais13(value);


        // Check if any keyword is present in the input
            const containsKeyword3 = keywords3.some(keyword => value.includes(keyword));
            setIsCorrect3(containsKeyword3);
        };

        const handleInputChange4 = (e) => {
            const value = e.target.value.toLowerCase();
            setWais15(value);


        // Check if any keyword is present in the input
            const containsKeyword4 = keywords4.some(keyword => value.includes(keyword));
            setIsCorrect4(containsKeyword4);
        };

         const [Wais1, setWais1] = useState('');
         const [Wais2, setWais2] = useState('');
         const [Wais3, setWais3] = useState('');
         const [Wais4, setWais4] = useState('');
         const [Wais5, setWais5] = useState('');
         const [Wais6, setWais6] = useState('');
         const [Wais7, setWais7] = useState('');
         const [Wais8, setWais8] = useState('');
         const [Wais9, setWais9] = useState('');
         const [Wais10, setWais10] = useState('');
         const [Wais11, setWais11] = useState('');
         const [Wais12, setWais12] = useState('');
         const [Wais13, setWais13] = useState('');
         const [Wais14, setWais14] = useState('');
         const [Wais15, setWais15] = useState('');
         const [Wais16, setWais16] = useState('');
         const [Wais17, setWais17] = useState('');
         const [Wais18, setWais18] = useState('');
         const [Wais19, setWais19] = useState('');
         const [Wais20, setWais20] = useState('');
         const [Wais21, setWais21] = useState([]);
         const [Wais22, setWais22] = useState([]);
         const [Wais23, setWais23] = useState([]);
         const [Wais24, setWais24] = useState([]);
         const [Wais25, setWais25] = useState([]);
        const [resultWais, setResultWais] = useState(0);

         const handleRadioChange21 = (e) => {
            setWais21(e.target.value);
          };

          const handleRadioChange22 = (e) => {
            setWais22(e.target.value);
          };

          const handleRadioChange23 = (e) => {
            setWais23(e.target.value);
          };

          const handleRadioChange24 = (e) => {
            setWais24(e.target.value);
          };

          const handleRadioChange25 = (e) => {
            setWais25(e.target.value);
          };

         useEffect(() => {
            let temResultWais = 0;

            if (Wais1 === '80') {
                temResultWais = temResultWais + 10;
            }

            if (Wais2 === '-1') {
                temResultWais = temResultWais + 10;
            }

            if (Wais3 === ' 2 horas') {
                temResultWais = temResultWais + 10;
            }

            if (Wais4 === '66') {
                temResultWais = temResultWais + 10;
            }

            if (Wais5 === 'Carro') {
                temResultWais = temResultWais + 10;
            }

            if (Wais6 === 'Proporcionar un ejemplo práctico y verificar su comprensión.') {
                temResultWais = temResultWais + 10;
            }

            if (Wais7 === 'Diseñar actividades con diferentes niveles de dificultad.') {
                temResultWais = temResultWais + 10;
            }

            if (Wais8 === 'Escuchar y debatir respetuosamente.') {
                temResultWais = temResultWais + 10;
            }

            if (Wais9 === 'Prepararte lo mejor posible con los recursos disponibles.') {
                temResultWais = temResultWais + 10;
            }

            if (isCorrect) {
                temResultWais = temResultWais + 10;
            }

            if (Wais11 === 'Hablar con él para entender sus intereses.') {
                temResultWais = temResultWais + 10;
            }

            if (isCorrect2) {
                temResultWais = temResultWais + 10;
            }

            if (isCorrect3) {
                temResultWais = temResultWais + 10;
            }

            if (Wais14 === 'Corrigiendo de manera constructiva y explicativa.') {
                temResultWais = temResultWais + 10;
            }

            if (isCorrect4) {
                temResultWais = temResultWais + 10;
            }

            if (Wais16) {
                temResultWais = temResultWais + 10;
            }

            if (Wais17 === 'Hablar con él en privado para entender su comportamiento.') {
                temResultWais = temResultWais + 10;
            }

            if (Wais18) {
                temResultWais = temResultWais + 10;
            }

            if (Wais19 === 'Resolviéndolo en privado, escuchando ambas partes.') {
                temResultWais = temResultWais + 10;
            }

            if (Wais20) {
                temResultWais = temResultWais + 10;
            }

            if (Wais21 === 'd') {
                temResultWais = temResultWais + 10;
            }

            if (Wais22 === 'd') {
                temResultWais = temResultWais + 10;
            }

            if (Wais23 === 'c') {
                temResultWais = temResultWais + 10;
            }

            if (Wais24 === 'c') {
                temResultWais = temResultWais + 10;
            }

            if (Wais25 === 'c') {
                temResultWais = temResultWais + 10;
            }

            setResultWais(temResultWais);
         });
 


    const nextStep = () => {
        setStep(step + 1);
      };
    
      const prevStep = () => {
        setStep(step - 1);
      };

        const {datos1} = useAsesor();

        const navigate = useNavigate();

        const ResultadoBigFive = Number(bigfive1) + Number(bigfive2) + Number(bigfive3) + Number(bigfive4) + Number(bigfive5) + Number(bigfive6) + Number(bigfive7) + Number(bigfive8) + Number(bigfive9) + Number(bigfive10) + Number(bigfive11) + Number(bigfive12) + Number(bigfive13) + Number(bigfive14) + Number(bigfive15) + Number(bigfive16) + Number(bigfive17) + Number(bigfive18) + Number(bigfive19) + Number(bigfive20) + Number(bigfive21) + Number(bigfive22)

        const ResultadoDASS = Number(dass1) + Number(dass2) + Number(dass3) + Number(dass4) + Number(dass5) + Number(dass6) + Number(dass7) + Number(dass8) + Number(dass9) + Number(dass10) + Number(dass11) + Number(dass12) + Number(dass13) + Number(dass14) + Number(dass15) + Number(dass16) + Number(dass17) + Number(dass18) + Number(dass19) + Number(dass20) + Number(dass21);

        const ResultadoZavic = Number(Zavic2) + Number(Zavic4) + Number(Zavic6) + Number(Zavic8) + Number(Zavic10) + Number(Zavic12) + Number(Zavic14) + Number(Zavic16) + Number(Zavic18) + Number(Zavic20) + Number(Zavic22) + Number(Zavic24) + Number(Zavic26) + Number(Zavic28) + Number(Zavic30) + Number(Zavic32) + Number(Zavic34) + Number(Zavic36) + Number(Zavic38) + Number(Zavic40) + Number(Zavic42) + Number(Zavic44) + Number(Zavic46) + Number(Zavic48) + Number (Zavic50) + Number (Zavic52) + Number (Zavic54) + Number (Zavic56) + Number (Zavic58) + Number (Zavic60);

        const ResultadoBarOn = Number(baron1) + Number(baron2) + Number(baron3) + Number(baron4) + Number(baron5) + Number(baron6) + Number(baron7) + Number(baron8) + Number(baron9) + Number(baron10) + Number(baron11) + Number(baron12) + Number(baron13) + Number(baron14) + Number(baron15) + Number(baron16) + Number(baron17) + Number(baron18) + Number(baron19) + Number(baron20) + Number(baron21) + Number(baron22) + Number(baron23) + Number(baron24) + Number(baron25);

        const ResultadoWais = Number(resultWais);

        const ResultadoAcademica = Number(ResultAcademica);

        const Onsubmite = (e) => {
            e.preventDefault();
            navigate('/resultados', { state: { ResultadoBigFive, ResultadoDASS, ResultadoZavic, ResultadoBarOn, ResultadoWais, ResultadoAcademica } });
        }



        // Temporizador 1
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Inicia el temporizador cuando step sea 17
    if (step === 17) {
      setIsRunning(true);
    }

    // Detiene el temporizador cuando step sea 24
    if (step === 24) {
      setIsRunning(false);
    }
  }, [step]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0){
        setIsRunning(false);
        setStep(24);
    }

    // Limpia el intervalo si el temporizador se detiene o se agota el tiempo
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Temporizador 2
    const [timeLeft2, setTimeLeft2] = useState(45 * 60); // 40 minutos en segundos
    const [isRunning2, setIsRunning2] = useState(false);

    useEffect(() => {
        // Inicia el temporizador cuando step sea 17
        if (step === 26) {
          setIsRunning2(true);
        }
    
        // Detiene el temporizador cuando step sea 24
        if (step === 29) {
          setIsRunning2(false);
        }
      }, [step]);

      useEffect(() => {
        let timer2;
        if (isRunning2 && timeLeft2 > 0) {
          timer2 = setInterval(() => {
            setTimeLeft2((prevTime) => prevTime - 1);
          }, 1000);
        } else if (timeLeft2 === 0){
            setIsRunning2(false);
        }
    
        // Limpia el intervalo si el temporizador se detiene o se agota el tiempo
        return () => clearInterval(timer2);
      }, [isRunning2, timeLeft2]);

      const formatTime2 = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

        useEffect(() => {
            if (datos1.length === 0) {
                navigate('/pre_registro');
            }
        }, []);

  return (
    <div>
        <Navbar />
        <div className="flex justify-center items-center overflow-hidden">
                {/* <!-- Tarjeta para móviles --> */}
                <div className="p-8 rounded-3xl md:hidden mb-5">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">{datos1.nombres} {datos1.apellidos}</h2>
                <p className='text-justify mb-10'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
                    <div className='border-4 border-[#3818c3]'>
                        <p className='text-justify mt-5 ml-3 mr-3 mb-6'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>1. Test psicológicos y pruebas académicas: Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>2. Una vez hayas acreditados los test y pruebas,podrás subir tus documentos: Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.</p>
                        <p className='text-justify ml-3 mr-3'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p className='text-justify ml-3 mr-3'>Si tienes alguna pregunta o necesitas apoyo, no dudes en comunicarte con nuestro equipo.</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>¡Mucho éxito y bienvenido(a) a esta nueva etapa!</p>
                        <p className='text-center mb-10 font-bold'>El equipo de MQerKAcademy</p>
                    </div>
                    <div className='flex justify-center'>
                        <button type="submit" className="font-bold text-2xl w-40 py-3 mt-5.5 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition duration-300">
                            Iniciar
                        </button>
                    </div>
                </div>
              
                {/* <!-- Tarjeta para computadoras --> */}
                <div className="hidden md:flex p-8 d-flex w-330 flex-col">
                    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-6">{datos1.nombres} {datos1.apellidos}</h2>
                    {step === 1 && (
                    <form onSubmit={nextStep}>
                    <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE PERSONALIDAD - Big Five</h2>
                    <p className='text-center text-xl mb-2'>Instrucciones:</p>
                    <p className='text-center text-xl mb-3'>Responde cada afirmación indicando qué tan de acuerdo estás con la afirmación. Usa la siguiente escala:</p>
                    <p className='text-center text-xl mb-3'>0 = Totalmente en desacuerdo | 1 = En desacuerdo | 2 = Neutral | 3 = De acuerdo | 4 = Totalmente de acuerdo</p>
                    <div className='border-4 border-[#3818c3]'>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'>1. Disfruto aprender cosas nuevas y explorar temas desconocidos.</p>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setBigfive1(e.target.value)}
                                value={bigfive1}
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option selected value="">Selecciona un puntaje</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'>2. Me gusta experimentar con métodos o ideas poco convencionales.</p>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setBigfive2(e.target.value)}
                                value={bigfive2}
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option selected value="">Selecciona un puntaje</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'>3. Aprecio las artes, la creatividad y nuevas formas de expresión.</p>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setBigfive3(e.target.value)}
                                value={bigfive3}
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option selected value="">Selecciona un puntaje</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'>4. Estoy abierto/a a los cambios y nuevas experiencias.</p>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setBigfive4(e.target.value)} 
                                value={bigfive4}                               
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option selected value="">Selecciona un puntaje</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'>5. Cumplo con mis compromisos sin importar las dificultades.</p>
                        </div>

                        <div>
                            <select
                                onChange={(e) => setBigfive5(e.target.value)}
                                value={bigfive5}
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option selected value="">Selecciona un puntaje</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Me considero una persona organizada y meticulosa en mi trabajo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive6(e.target.value)}
                                    value={bigfive6}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Planeo con anticipación para evitar contratiempos.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive7(e.target.value)}
                                    value={bigfive7}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                        <div className="flex-2 flex items-center">
                            <p className='text-justify'></p>
                        </div>

                        <div className='flex justify-center items-center'>
                            <button
                            type="submit"
                            className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                            Siguiente
                            </button>
                        </div>
                    </div>
                    </form>
                    )}
                    {step === 2 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE PERSONALIDAD - Big Five</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde cada afirmación indicando qué tan de acuerdo estás con la afirmación. Usa la siguiente escala:</p>
                        <p className='text-center text-xl mb-3'>0 = Totalmente en desacuerdo | 1 = En desacuerdo | 2 = Neutral | 3 = De acuerdo | 4 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. Termino lo que empiezo, incluso si requiere un esfuerzo extra.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive8(e.target.value)}
                                    value={bigfive8}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Me gusta interactuar con otras personas y compartir ideas.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive9(e.target.value)}
                                    value={bigfive9}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Siento energía y entusiasmo cuando trabajo en equipo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive10(e.target.value)}
                                    value={bigfive10}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. Tomo la iniciativa en conversaciones o proyectos grupales.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive11(e.target.value)}
                                    value={bigfive11}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Me resulta fácil presentarme y comunicarme con nuevas personas.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive12(e.target.value)}
                                    value={bigfive12}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. Escucho y valoro las opiniones de los demás.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive13(e.target.value)}
                                    value={bigfive13}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. Ayudo a compañeros o estudiantes cuando necesitan apoyo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive14(e.target.value)}
                                    value={bigfive14}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 3 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE PERSONALIDAD - Big Five</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde cada afirmación indicando qué tan de acuerdo estás con la afirmación. Usa la siguiente escala:</p>
                        <p className='text-center text-xl mb-3'>0 = Totalmente en desacuerdo | 1 = En desacuerdo | 2 = Neutral | 3 = De acuerdo | 4 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Mantengo un trato respetuoso y positivo en situaciones conflictivas.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive15(e.target.value)}
                                    value={bigfive15}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. Celebro los logros de los demás y reconozco sus esfuerzos.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive16(e.target.value)}
                                    value={bigfive16}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Mantengo la calma en situaciones estresantes o difíciles.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive17(e.target.value)}
                                    value={bigfive17}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. No me dejo afectar fácilmente por críticas o problemas menores.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive18(e.target.value)}
                                    value={bigfive18}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Manejo mis emociones de manera equilibrada y reflexiva.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive19(e.target.value)}
                                    value={bigfive19}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Encuentro soluciones prácticas sin dejarme llevar por el estrés.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive20(e.target.value)}
                                    value={bigfive20}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Nunca me he sentido estresado o presionado en mi vida.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive21(e.target.value)}
                                    value={bigfive21}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>22. Siempre he logrado todo sin enfrentar ningún error.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setBigfive22(e.target.value)}
                                    value={bigfive22}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 4 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DASS-21</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
                        <p className='text-center text-xl mb-3'>0 = Nunca | 1 = Casi nunca | 2 = A veces | 3 = Frecuentemente | 4 = Muy frecuentemente</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Me ha sido difícil relajarme después de un día de trabajo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass1(e.target.value)}
                                    value={dass1}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. Me he sentido nervioso/a o alterado/a al enfrentar cambios importantes.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass2(e.target.value)}
                                    value={dass2}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. He sentido que no puedo organizar mis tareas y responsabilidades de forma efectiva.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass3(e.target.value)}
                                    value={dass3}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Me he sentido tenso/a o irritado/a sin motivo aparente.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass4(e.target.value)}
                                    value={dass4}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Siento que mi carga de trabajo me resulta difícil de manejar.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass5(e.target.value)}
                                    value={dass5}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Me cuesta pensar con claridad cuando me encuentro bajo presión.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass6(e.target.value)}
                                    value={dass6}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Me frustro fácilmente cuando las cosas no salen como planeo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass7(e.target.value)}
                                    value={dass7}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 5 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DASS-21</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
                        <p className='text-center text-xl mb-3'>0 = Nunca | 1 = Casi nunca | 2 = A veces | 3 = Frecuentemente | 4 = Muy frecuentemente</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. He sentido una sensación de miedo, aunque no haya un motivo claro.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass8(e.target.value)}
                                    value={dass8}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. He sentido que mi corazón late rápido incluso en reposo.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass9(e.target.value)}
                                                                        value={dass9}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Me cuesta mantener la calma al enfrentar conflictos o desafíos.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass10(e.target.value)}
                                                                        value={dass10}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. He sentido que no puedo detener pensamientos preocupantes.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass11(e.target.value)}
                                                                        value={dass11}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Me he sentido abrumado/a ante tareas importantes.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass12(e.target.value)}
                                                                        value={dass12}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. He evitado situaciones que me ponen nervioso/a.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass13(e.target.value)}
                                                                        value={dass13}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. He sentido incomodidad física (como temblores o sudoración) en situaciones estresantes.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass14(e.target.value)}
                                                                        value={dass14}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 6 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DASS-21</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
                        <p className='text-center text-xl mb-3'>0 = Nunca | 1 = Casi nunca | 2 = A veces | 3 = Frecuentemente | 4 = Muy frecuentemente</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Me he sentido triste o vacío/a durante la última semana.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass15(e.target.value)}
                                                                        value={dass15}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. He perdido interés en actividades que antes disfrutaba.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass16(e.target.value)}
                                                                        value={dass16}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. He sentido que no tengo energía para cumplir con mis responsabilidades.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass17(e.target.value)}
                                                                        value={dass17}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Me he sentido inferior o poco capaz comparado con otros.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass18(e.target.value)}
                                                                        value={dass18}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Me cuesta encontrar cosas positivas en mi día a día.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass19(e.target.value)}
                                                                        value={dass19}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Me he sentido desmotivado/a para resolver problemas cotidianos.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass20(e.target.value)}
                                                                        value={dass20}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Siento que no estoy logrando los objetivos que me he propuesto.</p>
                            </div>

                            <div>
                                <select
                                    onChange={(e) => setDass21(e.target.value)}
                                                                        value={dass21}
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 7 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Si descubres que un colega no está cumpliendo con las normas de la empresa, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic1(e.target.value)}
                                                                            value={Zavic1}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo reportas a un supervisor de inmediato.">Lo reportas a un supervisor de inmediato.</option>
                                        <option value="Intentas hablar con él para entender la situación.">Intentas hablar con él para entender la situación.</option>
                                        <option value="Decides no involucrarte en el asunto.">Decides no involucrarte en el asunto.</option>
                                        <option value="Consideras que es su responsabilidad y no intervienes.">Consideras que es su responsabilidad y no intervienes.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic2(e.target.value)}
                                        value={Zavic2}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. En una situación en la que tu equipo debe tomar una decisión difícil, tú</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic3(e.target.value)}
                                        value={Zavic3}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Propones seguir estrictamente las políticas establecidas.">Propones seguir estrictamente las políticas establecidas.</option>
                                        <option value="Buscas la opción más justa para todos.">Buscas la opción más justa para todos.</option>
                                        <option value="Consideras lo que beneficiaría más a la mayoría.">Consideras lo que beneficiaría más a la mayoría.</option>
                                        <option value="Optas por la decisión más eficiente, sin importar las reglas.">Optas por la decisión más eficiente, sin importar las reglas.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic4(e.target.value)}
                                        value={Zavic4}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Si tienes que elegir entre dos proyectos, eliges el que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic5(e.target.value)}
                                        value={Zavic5}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Está alineado con las normas de la empresa.">Está alineado con las normas de la empresa.</option>
                                        <option value="Tiene un mayor impacto positivo en las personas.">Tiene un mayor impacto positivo en las personas.</option>
                                        <option value="Te brinde más beneficios económicos.">Te brinde más beneficios económicos.</option>
                                        <option value="Sea más fácil de completar rápidamente.">Sea más fácil de completar rápidamente.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic6(e.target.value)}
                                        value={Zavic6}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Cuando trabajas en equipo, priorizas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic7(e.target.value)}
                                        value={Zavic7}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Seguir las reglas para evitar conflictos.">Seguir las reglas para evitar conflictos.</option>
                                        <option value="Crear un ambiente de respeto mutuo.">Crear un ambiente de respeto mutuo.</option>
                                        <option value="Cumplir con los objetivos, sin importar las relaciones personales.">Cumplir con los objetivos, sin importar las relaciones personales.</option>
                                        <option value="Minimizar el esfuerzo necesario para lograr los resultados.">Minimizar el esfuerzo necesario para lograr los resultados.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic8(e.target.value)}
                                        value={Zavic8}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Si observas que un proyecto no cumple con los estándares éticos de la empresa, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic9(e.target.value)}
                                        value={Zavic9}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Informas inmediatamente a los responsables.">Informas inmediatamente a los responsables.</option>
                                        <option value="Buscas entender las razones detrás de la situación antes de actuar.">Buscas entender las razones detrás de la situación antes de actuar.</option>
                                        <option value="Te mantienes al margen para evitar conflictos.">Te mantienes al margen para evitar conflictos.</option>
                                        <option value="Lo consideras un error menor si no afecta directamente el resultado.">Lo consideras un error menor si no afecta directamente el resultado.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic10(e.target.value)}
                                        value={Zavic10}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Si encuentras un objeto valioso olvidado en tu lugar de trabajo, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic11(e.target.value)}
                                        value={Zavic11}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo devuelves inmediatamente a su dueño.">Lo devuelves inmediatamente a su dueño.</option>
                                        <option value="Informas a tus superiores y entregas el objeto.">Informas a tus superiores y entregas el objeto.</option>
                                        <option value="Decides esperar para ver si alguien lo reclama.">Decides esperar para ver si alguien lo reclama.</option>
                                        <option value="Lo dejas donde lo encontraste.">Lo dejas donde lo encontraste.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic12(e.target.value)}
                                        value={Zavic12}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 8 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Si un cliente ofrece un incentivo para recibir un trato especial, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic13(e.target.value)}
                                        value={Zavic13}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Rechazas el incentivo y explicas que no es ético.">Rechazas el incentivo y explicas que no es ético.</option>
                                        <option value="Informas la situación a tu supervisor.">Informas la situación a tu supervisor.</option>
                                        <option value="Aceptas el incentivo para evitar problemas.">Aceptas el incentivo para evitar problemas.</option>
                                        <option value="Consideras si afecta negativamente a alguien antes de decidir.">Consideras si afecta negativamente a alguien antes de decidir.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic14(e.target.value)}
                                        value={Zavic14}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. En una situación de presión por cumplir metas laborales, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic15(e.target.value)}
                                        value={Zavic15}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Mantener la integridad, aunque afecte los resultados.">Mantener la integridad, aunque afecte los resultados.</option>
                                        <option value="Buscar apoyo del equipo para trabajar dentro de las reglas.">Buscar apoyo del equipo para trabajar dentro de las reglas.</option>
                                        <option value="Tomar atajos siempre que sean efectivos.">Tomar atajos siempre que sean efectivos.</option>
                                        <option value="Adaptarte a las circunstancias, incluso si eso implica romper algunas normas.">Adaptarte a las circunstancias, incluso si eso implica romper algunas normas.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic16(e.target.value)}
                                        value={Zavic16}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Si un compañero de trabajo te pide que lo cubras en una actividad que no completó, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic17(e.target.value)}
                                        value={Zavic17}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Informas al supervisor sobre la situación.">Informas al supervisor sobre la situación.</option>
                                        <option value="Lo ayudas solo si es una emergencia.">Lo ayudas solo si es una emergencia.</option>
                                        <option value="Aceptas hacerlo, pero te aseguras de que sea la última vez.">Aceptas hacerlo, pero te aseguras de que sea la última vez.</option>
                                        <option value="Te niegas porque no es tu responsabilidad.">Te niegas porque no es tu responsabilidad.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic18(e.target.value)}
                                        value={Zavic18}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Si tuvieras que elegir entre dos trabajos, elegirías el que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic19(e.target.value)}
                                        value={Zavic19}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Ofrece mayor estabilidad económica.">Ofrece mayor estabilidad económica.</option>
                                        <option value="Te permite obtener mayores ingresos a corto plazo.">Te permite obtener mayores ingresos a corto plazo.</option>
                                        <option value="Ofrece menos ingresos pero más equilibrio personal.">Ofrece menos ingresos pero más equilibrio personal.</option>
                                        <option value="Brinda más oportunidades de crecimiento profesional.">Brinda más oportunidades de crecimiento profesional.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic20(e.target.value)}
                                        value={Zavic20}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. Cuando se trata de beneficios laborales, priorizas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic21(e.target.value)}
                                        value={Zavic21}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Un salario justo y competitivo.">Un salario justo y competitivo.</option>
                                        <option value="Incentivos adicionales como bonos.">Incentivos adicionales como bonos.</option>
                                        <option value="Un ambiente laboral cómodo y equilibrado.">Un ambiente laboral cómodo y equilibrado.</option>
                                        <option value="Oportunidades de aprendizaje y desarrollo.">Oportunidades de aprendizaje y desarrollo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic22(e.target.value)}
                                        value={Zavic22}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Si tienes la oportunidad de mejorar un proceso en tu trabajo, lo haces porque:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic23(e.target.value)}
                                        value={Zavic23}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Aumenta la productividad de tu equipo.">Aumenta la productividad de tu equipo.</option>
                                        <option value="Mejora los ingresos de la empresa.">Mejora los ingresos de la empresa.</option>
                                        <option value="Beneficia a los clientes o usuarios.">Beneficia a los clientes o usuarios.</option>
                                        <option value="Genera menos estrés en tu día a día.">Genera menos estrés en tu día a día.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic24(e.target.value)}
                                        value={Zavic24}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 9 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. Si tu supervisor te pide que completes una tarea extra sin remuneración adicional, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic25(e.target.value)}
                                        value={Zavic25}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Te aseguras de que valga la pena el esfuerzo.">Te aseguras de que valga la pena el esfuerzo.</option>
                                        <option value="Preguntas si habrá beneficios futuros por hacerlo.">Preguntas si habrá beneficios futuros por hacerlo.</option>
                                        <option value="Lo haces porque es parte de tu compromiso.">Lo haces porque es parte de tu compromiso.</option>
                                        <option value="Lo rechazas si consideras que no es justo.">Lo rechazas si consideras que no es justo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic26(e.target.value)}
                                        value={Zavic26}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. En un proyecto grupal, prefieres ser:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic27(e.target.value)}
                                        value={Zavic27}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="El líder que toma decisiones.">El líder que toma decisiones.</option>
                                        <option value="Parte del equipo que ejecuta las tareas.">Parte del equipo que ejecuta las tareas.</option>
                                        <option value="El apoyo técnico que brinda soluciones.">El apoyo técnico que brinda soluciones.</option>
                                        <option value="El observador que monitorea el progreso.">El observador que monitorea el progreso.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic28(e.target.value)}
                                        value={Zavic28}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Si tu supervisor te pide una opinión sobre una estrategia, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic29(e.target.value)}
                                        value={Zavic29}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Propones una alternativa más efectiva.">Propones una alternativa más efectiva.</option>
                                        <option value="Das tu opinión solo si estás seguro/a de que será bien recibida.">Das tu opinión solo si estás seguro/a de que será bien recibida.</option>
                                        <option value="Apoyas lo que ya está decidido.">Apoyas lo que ya está decidido.</option>
                                        <option value="Evitas opinar para no complicarte.">Evitas opinar para no complicarte.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic30(e.target.value)}
                                        value={Zavic30}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. En un entorno laboral, buscas roles que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic31(e.target.value)}
                                        value={Zavic31}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Te permitan tomar decisiones importantes.">Te permitan tomar decisiones importantes.</option>
                                        <option value="Sean clave para el éxito del equipo.">Sean clave para el éxito del equipo.</option>
                                        <option value="No requieran demasiada exposición.">No requieran demasiada exposición.</option>
                                        <option value="Te ofrezcan la posibilidad de aprender sin presión.">Te ofrezcan la posibilidad de aprender sin presión.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic32(e.target.value)}
                                        value={Zavic32}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Cuando surge un problema en tu equipo, tiendes a:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic33(e.target.value)}
                                        value={Zavic33}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Asumir la responsabilidad de encontrar una solución.">Asumir la responsabilidad de encontrar una solución.</option>
                                        <option value="Esperar a que alguien más tome la iniciativa.">Esperar a que alguien más tome la iniciativa.</option>
                                        <option value="Consultar a tus superiores antes de actuar.">Consultar a tus superiores antes de actuar.</option>
                                        <option value="Resolverlo solo si afecta directamente tu desempeño.">Resolverlo solo si afecta directamente tu desempeño.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic34(e.target.value)}
                                        value={Zavic34}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Si un colega está teniendo un mal día, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic35(e.target.value)}
                                        value={Zavic35}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Le ofreces tu ayuda para aliviar su carga.">Le ofreces tu ayuda para aliviar su carga.</option>
                                        <option value="Intentas animarlo con una conversación positiva.">Intentas animarlo con una conversación positiva.</option>
                                        <option value="Decides darle su espacio para que lo resuelva por su cuenta.">Decides darle su espacio para que lo resuelva por su cuenta.</option>
                                        <option value="Lo reportas a los supervisores para que lo apoyen.">Lo reportas a los supervisores para que lo apoyen.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic36(e.target.value)}
                                        value={Zavic36}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 10 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Si tu equipo está enfrentando dificultades, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic37(e.target.value)}
                                        value={Zavic37}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Buscas formas de motivarlos a seguir adelante.">Buscas formas de motivarlos a seguir adelante.</option>
                                        <option value="Les recuerdas que todos deben cumplir sus responsabilidades.">Les recuerdas que todos deben cumplir sus responsabilidades.</option>
                                        <option value="Los apoyas solo si afecta directamente tus tareas.">Los apoyas solo si afecta directamente tus tareas.</option>
                                        <option value="Esperas a que encuentren una solución por sí mismos.">Esperas a que encuentren una solución por sí mismos.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                       onChange={(e) => setZavic38(e.target.value)}
                                       value={Zavic38}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Cuando se trata de compartir recursos laborales, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic39(e.target.value)}
                                        value={Zavic39}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Aseguras que todos tengan acceso equitativo.">Aseguras que todos tengan acceso equitativo.</option>
                                        <option value="Priorizas las necesidades de quienes más lo necesitan.">Priorizas las necesidades de quienes más lo necesitan.</option>
                                        <option value="Utilizas los recursos de manera personal para garantizar resultados.">Utilizas los recursos de manera personal para garantizar resultados.</option>
                                        <option value="Propones que los recursos sean asignados por orden jerárquico.">Propones que los recursos sean asignados por orden jerárquico.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic40(e.target.value)}
                                        value={Zavic40}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Si un cliente necesita más tiempo o apoyo del esperado, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic41(e.target.value)}
                                        value={Zavic41}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo ayudas sin dudar porque es tu responsabilidad.">Lo ayudas sin dudar porque es tu responsabilidad.</option>
                                        <option value="Buscas apoyo de otros para brindarle el servicio necesario.">Buscas apoyo de otros para brindarle el servicio necesario.</option>
                                        <option value="Haces lo que puedes sin comprometer tus tareas.">Haces lo que puedes sin comprometer tus tareas.</option>
                                        <option value="Le explicas que hay límites claros en los servicios ofrecidos.">Le explicas que hay límites claros en los servicios ofrecidos.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic42(e.target.value)}
                                        value={Zavic42}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>22. Prefieres un entorno laboral donde puedas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic43(e.target.value)}
                                        value={Zavic43}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Innovar constantemente en los procesos.">Innovar constantemente en los procesos.</option>
                                        <option value="Mejorar la eficiencia con métodos probados.">Mejorar la eficiencia con métodos probados.</option>
                                        <option value="Tener un enfoque claro y estructurado.">Tener un enfoque claro y estructurado.</option>
                                        <option value="Cumplir tus tareas sin necesidad de cambiar lo establecido.">Cumplir tus tareas sin necesidad de cambiar lo establecido.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic44(e.target.value)}
                                        value={Zavic44}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>23. Al abordar un problema complejo, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic45(e.target.value)}
                                        value={Zavic45}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Piensas fuera de lo convencional para resolverlo.">Piensas fuera de lo convencional para resolverlo.</option>
                                        <option value="Analizas las soluciones más prácticas disponibles.">Analizas las soluciones más prácticas disponibles.</option>
                                        <option value="Buscas ejemplos previos para guiarte.">Buscas ejemplos previos para guiarte.</option>
                                        <option value="Evitas involucrarte si no es parte de tu rol.">Evitas involucrarte si no es parte de tu rol.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic46(e.target.value)}
                                        value={Zavic46}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>24. Cuando tienes una idea nueva, tiendes a:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic47(e.target.value)}
                                        value={Zavic47}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Compartirla con el equipo para desarrollarla juntos.">Compartirla con el equipo para desarrollarla juntos.</option>
                                        <option value="Analizarla primero para asegurarte de que es viable.">Analizarla primero para asegurarte de que es viable.</option>
                                        <option value="Guardarla para ti hasta que sea necesaria.">Guardarla para ti hasta que sea necesaria.</option>
                                        <option value="Evitar proponerla si no estás seguro/a de su éxito.">Evitar proponerla si no estás seguro/a de su éxito.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic48(e.target.value)}
                                        value={Zavic48}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 11 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>25. Si un proyecto requiere innovación, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic49(e.target.value)}
                                        value={Zavic49}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Proponer nuevas formas de hacerlo.">Proponer nuevas formas de hacerlo.</option>
                                        <option value="Seguir métodos que ya hayan funcionado antes.">Seguir métodos que ya hayan funcionado antes.</option>
                                        <option value="Pedir apoyo a un colega más experimentado.">Pedir apoyo a un colega más experimentado.</option>
                                        <option value="Cumplir tu parte sin involucrarte en la planificación.">Cumplir tu parte sin involucrarte en la planificación.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic50(e.target.value)}
                                        value={Zavic50}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>26. Si tu empresa enfrenta un problema recurrente, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic51(e.target.value)}
                                        value={Zavic51}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aseguras que todos tengan acceso equitativo.'>Aseguras que todos tengan acceso equitativo.</option>
                                        <option value='Priorizas las necesidades de quienes más lo necesitan.'>Priorizas las necesidades de quienes más lo necesitan.</option>
                                        <option value='Utilizas los recursos de manera personal para garantizar resultados.'>Utilizas los recursos de manera personal para garantizar resultados.</option>
                                        <option value='Propones que los recursos sean asignados por orden jerárquico.'>Propones que los recursos sean asignados por orden jerárquico.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic52(e.target.value)}
                                        value={Zavic52}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>27. Cuando trabajas en un equipo diverso con distintas ideas, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic53(e.target.value)}
                                        value={Zavic53}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Fomentas la integración de todas las perspectivas.'>Fomentas la integración de todas las perspectivas.</option>
                                        <option value='Analizas qué idea tiene más sentido práctico.'>Analizas qué idea tiene más sentido práctico.</option>
                                        <option value='Prefieres seguir con las ideas que ya funcionan.'>Prefieres seguir con las ideas que ya funcionan.</option>
                                        <option value='Te adaptas a la decisión de la mayoría sin cuestionar.'>Te adaptas a la decisión de la mayoría sin cuestionar.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic54(e.target.value)}
                                        value={Zavic54}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>28. Si la empresa donde trabajas implementa un proyecto de impacto social, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic55(e.target.value)}
                                        value={Zavic55}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Participas activamente y propones ideas.'>Participas activamente y propones ideas.</option>
                                        <option value='Colaboras si te lo solicitan.'>Colaboras si te lo solicitan.</option>
                                        <option value='Lo apoyas solo si no interfiere con tus tareas.'>Lo apoyas solo si no interfiere con tus tareas.</option>
                                        <option value='Consideras que es una actividad secundaria.'>Consideras que es una actividad secundaria.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic56(e.target.value)}
                                        value={Zavic56}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>29. Cuando observas prácticas laborales que dañan el medio ambiente, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        required
                                        onChange={(e) => setZavic57(e.target.value)}
                                        value={Zavic57}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Informas a tus superiores para buscar soluciones.'>Informas a tus superiores para buscar soluciones.</option>
                                        <option value='Propones alternativas más sostenibles.'>Propones alternativas más sostenibles.</option>
                                        <option value='Te enfocas en cumplir con tus propias responsabilidades.'>Te enfocas en cumplir con tus propias responsabilidades.</option>
                                        <option value='Lo ignoras porque no depende de ti cambiarlo.'>Lo ignoras porque no depende de ti cambiarlo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic58(e.target.value)}
                                        value={Zavic58}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>30. Si tu equipo recibe fondos adicionales para un proyecto, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                       required
                                        onChange={(e) => setZavic59(e.target.value)}
                                        value={Zavic59}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aseguras que se usen de manera eficiente y responsable.'>Aseguras que se usen de manera eficiente y responsable.</option>
                                        <option value='Propones invertirlos en actividades que beneficien a la comunidad.'>Propones invertirlos en actividades que beneficien a la comunidad.</option>
                                        <option value='Sugieres utilizarlos en mejorar los recursos internos del equipo.'>Sugieres utilizarlos en mejorar los recursos internos del equipo.</option>
                                        <option value='Consideras que deberían distribuirse como incentivos individuales.'>Consideras que deberían distribuirse como incentivos individuales.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        onChange={(e) => setZavic60(e.target.value)}
                                        value={Zavic60}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 12 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Soy capaz de reconocer cuando mis emociones afectan mi desempeño en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron1(e.target.value)}
                                        value={baron1}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. Entiendo cómo mis emociones pueden influir en la dinámica del equipo de trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron2(e.target.value)}
                                        value={baron2}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Reflexiono sobre mis emociones después de situaciones estresantes para aprender de ellas.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron3(e.target.value)}
                                        value={baron3}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Soy consciente de las emociones que siento cuando estoy trabajando bajo presión.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron4(e.target.value)}
                                        value={baron4}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Reconozco mis fortalezas y debilidades emocionales.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron5(e.target.value)}
                                        value={baron5}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Mantengo la calma en situaciones de alta presión o conflicto en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron6(e.target.value)}
                                        value={baron6}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. En momentos de estrés, puedo mantener un enfoque claro y no dejo que mis emociones me descontrolen.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron7(e.target.value)}
                                        value={baron7}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 13 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. Cuando estoy frustrado, sé cómo calmarme y seguir adelante.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron8(e.target.value)}
                                        value={baron8}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Me esfuerzo por mantener una actitud positiva frente a desafíos o fracasos.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron9(e.target.value)}
                                        value={baron9}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Suelo manejar mis emociones sin que estas interfieran con la toma de decisiones en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron10(e.target.value)}
                                        value={baron10}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. Trato de comprender cómo se sienten los demás antes de actuar o dar una respuesta.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron11(e.target.value)}
                                        value={baron11}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Escucho activamente a los compañeros de trabajo para comprender sus necesidades y emociones.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron12(e.target.value)}
                                        value={baron12}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. Soy capaz de reconocer cuando los estudiantes o colegas necesitan apoyo emocional.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron13(e.target.value)}
                                        value={baron13}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 14 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. Intento adaptar mi enfoque a las necesidades emocionales de los demás, especialmente cuando trato con estudiantes.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron14(e.target.value)}
                                        value={baron14}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Me esfuerzo por mostrar empatía y apoyo en situaciones emocionales difíciles en el entorno académico.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron15(e.target.value)}
                                        value={baron15}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. Puedo manejar conflictos de manera eficaz sin que estos afecten las relaciones laborales.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron16(e.target.value)}
                                        value={baron6}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Me siento cómodo estableciendo relaciones de confianza con colegas y estudiantes.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron17(e.target.value)}
                                        value={baron17}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Fomento un ambiente de trabajo colaborativo y respetuoso.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron18(e.target.value)}
                                        value={baron18}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Soy capaz de comunicarme claramente con los estudiantes y compañeros, incluso en situaciones difíciles.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron19(e.target.value)}
                                        value={baron19}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 15 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Me esfuerzo por crear un clima laboral inclusivo y positivo en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron20(e.target.value)}
                                        value={baron20}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Al tomar decisiones importantes, considero tanto los hechos como mis emociones.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron21(e.target.value)}
                                        value={baron21}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>22. En situaciones complicadas, busco soluciones que beneficien tanto a los estudiantes como al equipo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron22(e.target.value)}
                                        value={baron22}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>23. Soy capaz de evaluar las posibles consecuencias emocionales de mis decisiones antes de actuar.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron23(e.target.value)}
                                        value={baron23}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>24. A la hora de resolver problemas, soy creativo y abierto a nuevas ideas.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron24(e.target.value)}
                                        value={baron24}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>25. Tomo decisiones basadas en un equilibrio entre la lógica y las emociones de los involucrados.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setBaron25(e.target.value)}
                                        value={baron25}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 16 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p className='text-xl mb-2'>Instrucciones:</p>
                        <p className='text-xl'>1. Lee cuidadosamente cada pregunta antes de responder.</p>
                        <p className='text-xl'>2. Responde con claridad y en el espacio indicado.</p>
                        <p className='text-xl'>3. Algunas preguntas son cerradas (elige la opción correcta) y otras abiertas (explica o describe).</p>
                        <p className='text-xl mb-6'>4. En las preguntas abiertas, procura incluir ejemplos prácticos, soluciones claras o reflexiones relevantes según corresponda.</p>
                        <p className='text-center font-bold text-xl text-gray-900'>Tiempo estimado:</p>
                        <p className='text-center text-xl'>Tienes un máximo de 40 minutos para completar el test.</p>
                        <p className='text-center font-bold text-xl text-gray-900'>¡Buena suerte!</p>
                        <p className='text-center text-xl mb-8'>Si tienes alguna duda antes de comenzar, consulta con el evaluador.</p>
                        <div className='flex justify-center items-center'>
                            <button
                            type="submit"
                            className="w-50 px-10 py-3 font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                            Iniciar
                            </button>
                        </div>
                    </form>
                    )}
                    {step === 17 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Encuentra el siguiente número en la serie: 5, 10, 20, 40, ...</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais1(e.target.value)}
                                        value={Wais1}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='50'>50</option>
                                        <option value='60'>60</option>
                                        <option value='80'>80</option>
                                        <option value='100'>100</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. Si 2(x+3)=3x+7, ¿cuánto vale x?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais2(e.target.value)}
                                        value={Wais2}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='-1'>-1</option>
                                        <option value='1'>1</option>
                                        <option value='0'>0</option>
                                        <option value='2'>2</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Un empleado realiza una tarea en 4 horas. Si trabaja al doble de velocidad, ¿cuánto tardará en terminar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais3(e.target.value)}
                                        value={Wais3}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value=' 2 horas'> 2 horas</option>
                                        <option value=' 3 horas'> 3 horas</option>
                                        <option value=' 1 horas'> 1 horas</option>
                                        <option value=' 4 horas'> 4 horas</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. En un grupo hay 12 personas. Cada una debe saludar a las demás una vez. ¿Cuántos saludos se realizan en total?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais4(e.target.value)}
                                        value={Wais4}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='66'>66</option>
                                        <option value='72'>72</option>
                                        <option value='144'>144</option>
                                        <option value='12'>12</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Encuentra el elemento que no encaja: Manzana, Pera, Carro, Mango.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais5(e.target.value)}
                                        value={Wais5}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Manzana'>Manzana</option>
                                        <option value='Pera'>Pera</option>
                                        <option value='Carro'>Carro</option>
                                        <option value='Mango'>Mango</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 18 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Un estudiante no entiende un concepto clave en clase. ¿Qué pasos seguirías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais6(e.target.value)}
                                        value={Wais6}
                                        className="mt-2 p-3 border w-127 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar el problema y continuar.'>Ignorar el problema y continuar.</option>
                                        <option value='Repetir la explicación de la misma manera.'>Repetir la explicación de la misma manera.</option>
                                        <option value='Proporcionar un ejemplo práctico y verificar su comprensión.'>Proporcionar un ejemplo práctico y verificar su comprensión.</option>
                                        <option value='Pedirle que lo estudie después de clase.'>Pedirle que lo estudie después de clase.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Si te enfrentas a un grupo con niveles de aprendizaje variados, ¿qué harías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais7(e.target.value)}
                                        value={Wais7}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Dividir el grupo en niveles y trabajar con cada nivel por separado.'>Dividir el grupo en niveles y trabajar con cada nivel por separado.</option>
                                        <option value='Ignorar las diferencias y enseñar al ritmo promedio.'>Ignorar las diferencias y enseñar al ritmo promedio.</option>
                                        <option value='Diseñar actividades con diferentes niveles de dificultad.'>Diseñar actividades con diferentes niveles de dificultad.</option>
                                        <option value='Enfocarme solo en los más avanzados.'>Enfocarme solo en los más avanzados.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. ¿Qué harías si un estudiante cuestiona tu explicación con argumentos válidos?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais8(e.target.value)}
                                        value={Wais8}
                                        className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Escuchar y debatir respetuosamente.'>Escuchar y debatir respetuosamente.</option>
                                        <option value='Rechazar sus argumentos de inmediato.'>Rechazar sus argumentos de inmediato.</option>
                                        <option value='Ignorar el comentario y seguir.'>Ignorar el comentario y seguir.</option>
                                        <option value='Pedirle que consulte otras fuentes.'>Pedirle que consulte otras fuentes.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Te informan de un cambio de tema con 24 horas de anticipación. ¿Qué harías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais9(e.target.value)}
                                        value={Wais9}
                                        className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Solicitar más tiempo para prepararte.'>Solicitar más tiempo para prepararte.</option>
                                        <option value='Prepararte lo mejor posible con los recursos disponibles.'>Prepararte lo mejor posible con los recursos disponibles.</option>
                                        <option value='Cancelar la clase si no te sientes listo.'>Cancelar la clase si no te sientes listo.</option>
                                        <option value='Ignorar la preparación y trabajar improvisando.'>Ignorar la preparación y trabajar improvisando.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Propón una actividad dinámica para enseñar un concepto complejo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                onChange={handleInputChange}
                                value={Wais10}
                                className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aquí"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 19 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. ¿Qué harías para motivar a un estudiante desinteresado?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais11(e.target.value)}
                                        value={Wais11}
                                        className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Hablar con él para entender sus intereses.'>Hablar con él para entender sus intereses.</option>
                                        <option value='Ignorar su actitud.'>Ignorar su actitud.</option>
                                        <option value='Regañarlo frente a la clase.'>Regañarlo frente a la clase.</option>
                                        <option value='Pedirle que busque motivación en casa.'>Pedirle que busque motivación en casa.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. ¿Cómo redactarías un correo breve a los padres de un estudiante sobre su progreso?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                onChange={handleInputChange2}
                                value={Wais12}
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. ¿Cómo explicarías la importancia de tu materia?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                onChange={handleInputChange3}
                                value={Wais13}
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. ¿Cómo corregirías a un estudiante sin hacerlo sentir mal?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        onChange={(e) => setWais14(e.target.value)}
                                        value={Wais14}
                                        className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Regañandolo en privado.'>Regañandolo en privado.</option>
                                        <option value='Ignorando el error.'>Ignorando el error.</option>
                                        <option value='Corrigiendo de manera constructiva y explicativa.'>Corrigiendo de manera constructiva y explicativa.</option>
                                        <option value='Pidiéndole que lo investigue por su cuenta.'>Pidiéndole que lo investigue por su cuenta.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Describe tu introducción ideal para tu primera clase.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                onChange={handleInputChange4}
                                value={Wais15}
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 20 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. Un estudiante argumenta que una técnica no es útil en la vida real. ¿Cómo responderías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                onChange={(e) => setWais16(e.target.value)}
                                value={Wais16}
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Describe cómo manejarías una situación en la que un estudiante interrumpe constantemente.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais17(e.target.value)}
                                        value={Wais17}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar las interrupciones.'>Ignorar las interrupciones.</option>
                                        <option value='Llamarle la atención frente a la clase.'>Llamarle la atención frente a la clase.</option>
                                        <option value='Hablar con él en privado para entender su comportamiento.'>Hablar con él en privado para entender su comportamiento.</option>
                                        <option value='Pedirle que abandone la clase.'>Pedirle que abandone la clase.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Si no tienes acceso a tus materiales preparados, ¿cómo improvisarías una clase?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                onChange={(e) => setWais18(e.target.value)}
                                value={Wais18}
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. ¿Cómo manejarías un conflicto entre dos estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        onChange={(e) => setWais19(e.target.value)}
                                        value={Wais19}
                                        className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorando el conflicto.'>Ignorando el conflicto.</option>
                                        <option value='Resolviéndolo en privado, escuchando ambas partes.'>Resolviéndolo en privado, escuchando ambas partes.</option>
                                        <option value='Sancionándolos a ambos.'>Sancionándolos a ambos.</option>
                                        <option value='Pidiendo la intervención de un superior.'>Pidiendo la intervención de un superior.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Explica cómo evaluarías si los estudiantes comprendieron el tema al final de la sesión.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                onChange={(e) => setWais20(e.target.value)}
                                value={Wais20}
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 21 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>21.</p>
                                <img className='w-50 h-50' src={Veintiuno} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange21}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='a' checked={Wais21 === 'a'} />
                                    <img src={R21_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='b' checked={Wais21 === 'b'} />
                                    <img src={R21_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='c' checked={Wais21 === 'c'} />
                                    <img src={R21_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='d' checked={Wais21 === 'd'} />
                                    <img src={R21_4} />
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>22.</p>
                                <img className='w-50 h-50' src={Veintidos} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange22}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='a' checked={Wais22 === 'a'} />
                                    <img src={R22_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='b' checked={Wais22 === 'b'} />
                                    <img src={R22_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='c' checked={Wais22 === 'c'} />
                                    <img src={R22_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='d' checked={Wais22 === 'd'} />
                                    <img src={R22_4} />
                                </div>
                            </div>
                        </div>        
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 22 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>23.</p>
                                <img className='w-50 h-50' src={Veintitres} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange23}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='a' checked={Wais23 === 'a'} />
                                    <img src={R23_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='b' checked={Wais23 === 'b'} />
                                    <img src={R23_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='c' checked={Wais23 === 'c'} />
                                    <img src={R23_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='d' checked={Wais23 === 'd'} />
                                    <img src={R23_4} />
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>24.</p>
                                <img className='w-50 h-50' src={Veinticuatro} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange24}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='a' checked={Wais24 === 'a'} />
                                    <img src={R24_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='b' checked={Wais24 === 'b'} />
                                    <img src={R24_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='c' checked={Wais24 === 'c'} />
                                    <img src={R24_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='d' checked={Wais24 === 'd'} />
                                    <img src={R24_4} />
                                </div>
                            </div>
                        </div>        
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 23 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime(timeLeft)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>25.</p>
                                <img className='w-90 h-20' src={Veinticinco} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-8' onChange={handleRadioChange25}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='a' checked={Wais25 === 'a'} />
                                    <img src={R25_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='b' checked={Wais25 === 'b'} />
                                    <img src={R25_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='c' checked={Wais25 === 'c'} />
                                    <img src={R25_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='d' checked={Wais25 === 'd'} />
                                    <img src={R25_4} />
                                </div>
                            </div>
                        </div>     
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Finalizar
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 24 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">¡Felicidades por completar los test psicológicos!</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Tu compromiso y dedicación en esta etapa son muy valiosos para nosotros. Ahora que has finalizado esta fase, estás listo(a) para pasar a las pruebas académicas, donde podrás demostrar tus conocimientos y habilidades en las áreas clave de nuestra academia.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Recuerda que estas pruebas son una oportunidad para destacar tus fortalezas y confirmar tu preparación para formar parte del equipo de asesores especializados de MQerKAcademy.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Te invitamos a mantener la misma actitud positiva y enfoque en esta próxima etapa. Si tienes dudas o necesitas alguna orientación, no dudes en preguntarnos.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl font-bold text-center'>¡Mucho éxito!</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-center font-bold'>El equipo de MQerKAcademy</p>    
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">

                            <div className='flex justify-center items-center w-full'>
                                <button
                                type="submit"
                                className="w-55 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 25 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div>
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Instrucciones:</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Esta prueba académica tiene como objetivo evaluar tus habilidades, conocimientos y estrategias como asesor educativo. Responde con sinceridad y claridad, demostrando tu capacidad para abordar situaciones académicas y personales de los estudiantes. Completa las preguntas dentro del tiempo establecido y entrega tus respuestas al finalizar. </p>           
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl font-bold text-center'>Tiempo: 45 minutos</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-center font-bold'>¡Éxito!</p>    
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">

                            <div className='flex justify-center items-center w-full'>
                                <button
                                type="submit"
                                className="w-55 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Iniciar Prueba
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 26 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. ¿Cuál es el primer paso al identificar el problema de un estudiante?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica1}
                                        onChange={(e) => setAcademica1(e.target.value)}
                                        className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Proponer soluciones inmediatas'>Proponer soluciones inmediatas</option>
                                        <option value='Escuchar activamente al estudiante'>Escuchar activamente al estudiante</option>
                                        <option value='Informar a los padres sin consultar al estudiante'>Informar a los padres sin consultar al estudiante</option>
                                        <option value='Revisar el expediente académico'>Revisar el expediente académico</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. ¿Qué estrategia usarías para motivar a un estudiante desinteresado?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica2}
                                onChange={(e) => setAcademica2(e.target.value)}
                                className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Si un estudiante tiene dificultades en matemáticas, ¿cuál sería tu acción inmediata?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica3}
                                        onChange={(e) => setAcademica3(e.target.value)}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Regañarlo por su bajo rendimiento'>Regañarlo por su bajo rendimiento</option>
                                        <option value='Proporcionarle recursos adicionales, como ejercicios prácticos'>Proporcionarle recursos adicionales, como ejercicios prácticos</option>
                                        <option value='Cambiar su enfoque hacia otra materia'>Cambiar su enfoque hacia otra materia</option>
                                        <option value='Decirle que es cuestión de práctica'>Decirle que es cuestión de práctica</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Define "escucha activa" en tus propias palabras.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica4}
                                onChange={(e) => setAcademica4(e.target.value)}
                                className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. ¿Qué harías si un estudiante no muestra interés en mejorar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        value={Academica5}
                                            onChange={(e) => setAcademica5(e.target.value)}
                                        className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorarlo y centrarte en otros estudiantes'>Ignorarlo y centrarte en otros estudiantes</option>
                                        <option value='Investigar las causas subyacentes y buscar soluciones con él'>Investigar las causas subyacentes y buscar soluciones con él</option>
                                        <option value='Aplicar castigos para que se motive'>Aplicar castigos para que se motive</option>
                                        <option value='Dejarlo a cargo de otro asesor'>Dejarlo a cargo de otro asesor</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 27 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. ¿Cómo manejarías un conflicto entre dos estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica6}
                                onChange={(e) => setAcademica6(e.target.value)}
                                className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Completa la frase: "Un buen asesor debe ser ______."</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica7}
                                            onChange={(e) => setAcademica7(e.target.value)}
                                        className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Autoritario'>Autoritario</option>
                                        <option value='Empático'>Empático</option>
                                        <option value='Distante'>Distante</option>
                                        <option value='Impersonal'>Impersonal</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. ¿Cuál es la mejor forma de evaluar el progreso de un estudiante?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                       value={Academica8}
                                            onChange={(e) => setAcademica8(e.target.value)}
                                        className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aplicar exámenes semanales'>Aplicar exámenes semanales</option>
                                        <option value='Observar su desempeño general y recopilar retroalimentación'>Observar su desempeño general y recopilar retroalimentación</option>
                                        <option value='Compararlo con otros estudiantes'>Compararlo con otros estudiantes</option>
                                        <option value='Presionarlo para obtener mejores resultados'>Presionarlo para obtener mejores resultados</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Describe un caso en el que tu intervención como asesor sería crítica.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica9}
                                            onChange={(e) => setAcademica9(e.target.value)}
                                className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. ¿Qué harías si un estudiante confiesa tener problemas personales graves?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        value={Academica10}
                                            onChange={(e) => setAcademica10(e.target.value)}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar el problema y seguir con los temas académicos'>Ignorar el problema y seguir con los temas académicos</option>
                                        <option value='Escuchar con empatía y referirlo a un profesional si es necesario'>Escuchar con empatía y referirlo a un profesional si es necesario</option>
                                        <option value='Decirle que no puedes ayudarle'>Decirle que no puedes ayudarle</option>
                                        <option value='Hablar directamente con sus padres sin su consentimiento'>Hablar directamente con sus padres sin su consentimiento</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 28 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. ¿Qué herramientas tecnológicas usarías para asesorar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica11}
                                onChange={(e) => setAcademica11(e.target.value)}
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. ¿Qué actitud es más importante al dar retroalimentación?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica12}
                                            onChange={(e) => setAcademica12(e.target.value)}
                                        className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ser crítico para que el estudiante mejore'>Ser crítico para que el estudiante mejore</option>
                                        <option value='Ser constructivo y destacar áreas de mejora junto con logros'>Ser constructivo y destacar áreas de mejora junto con logros</option>
                                        <option value='Ser permisivo y evitar dar críticas'>Ser permisivo y evitar dar críticas</option>
                                        <option value='Mostrar indiferencia'>Mostrar indiferencia</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. ¿Cómo equilibrarías la disciplina y la motivación?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica13}
                                onChange={(e) => setAcademica13(e.target.value)}
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. ¿Qué harías si un estudiante interrumpe constantemente la clase?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica14}
                                        onChange={(e) => setAcademica14(e.target.value)}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorarlo para no afectar a otros'>Ignorarlo para no afectar a otros</option>
                                        <option value='Hablar con él en privado para entender la causa del comportamiento'>Hablar con él en privado para entender la causa del comportamiento</option>
                                        <option value='Expulsarlo de la sesión'>Expulsarlo de la sesión</option>
                                        <option value='Regañarlo públicamente para que aprenda'>Regañarlo públicamente para que aprenda</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. ¿Qué importancia tiene la empatía en el rol de asesor?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica15}
                                onChange={(e) => setAcademica15(e.target.value)}
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 29 && (
                    <form onSubmit={Onsubmite}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. ¿Cómo manejarías la presión de trabajar con varios estudiantes al mismo tiempo?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        value={Academica16}
                                        onChange={(e) => setAcademica16(e.target.value)}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Priorizar casos según su urgencia y delegar tareas si es necesario'>Priorizar casos según su urgencia y delegar tareas si es necesario</option>
                                        <option value='Trabajar de forma rápida y superficial'>Trabajar de forma rápida y superficial</option>
                                        <option value='Ignorar a los menos problemáticos'>Ignorar a los menos problemáticos</option>
                                        <option value='Centrarse solo en un estudiante hasta resolver su caso'>Centrarse solo en un estudiante hasta resolver su caso</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. ¿Qué harías si un estudiante rechaza tu ayuda constantemente?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica17}
                                onChange={(e) => setAcademica17(e.target.value)}
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. ¿Cuál es el principal objetivo de un asesor educativo?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        value={Academica18}
                                        onChange={(e) => setAcademica18(e.target.value)}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Resolver problemas administrativos'>Resolver problemas administrativos</option>
                                        <option value='Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal'>Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal</option>
                                        <option value='Garantizar que todos obtengan las mejores calificaciones'>Garantizar que todos obtengan las mejores calificaciones</option>
                                        <option value='Cumplir con los requisitos de la institución'>Cumplir con los requisitos de la institución</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Describe una técnica creativa que usarías para enseñar un tema complejo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica19}
                                onChange={(e) => setAcademica19(e.target.value)}
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. ¿Qué significa ser un líder para tus estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                value={Academica20}
                                onChange={(e) => setAcademica20(e.target.value)}
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Finalizar
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                </div>
        </div>
    </div>
  )
}