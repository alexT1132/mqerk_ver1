import {useState, useEffect, useRef} from 'react'
import ActionSheetSelect from "../../components/ui/ActionSheetSelect.jsx";
import { useAsesor } from "../../context/AsesorContext.jsx";
import { usePreventPageReload } from "../../NoReload.jsx";
import { useNavigate } from "react-router-dom";
import NavLogin from "../../components/common/auth/NavLogin.jsx";
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

    // Ref del contenedor principal (usado para el override móvil)
    const wrapperRef = useRef(null);

    const [step, setStep] = useState(0);
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
            // Cálculo Académica con dependencias explícitas para evitar recalcular en cada render innecesario.
            let temResultAcademica = 0;
            if (Academica1 === 'Escuchar activamente al estudiante') temResultAcademica += 10;
            if (Academica2) temResultAcademica += 10;
            if (Academica3 === 'Proporcionarle recursos adicionales, como ejercicios prácticos') temResultAcademica += 10;
            if (Academica4) temResultAcademica += 10;
            if (Academica5 === 'Investigar las causas subyacentes y buscar soluciones con él') temResultAcademica += 10;
            if (Academica6) temResultAcademica += 10;
            if (Academica7 === 'Empático') temResultAcademica += 10;
            if (Academica8 === 'Observar su desempeño general y recopilar retroalimentación') temResultAcademica += 10;
            if (Academica9) temResultAcademica += 10;
            if (Academica10 === 'Escuchar con empatía y referirlo a un profesional si es necesario') temResultAcademica += 10;
            if (Academica11) temResultAcademica += 10;
            if (Academica12 === 'Ser constructivo y destacar áreas de mejora junto con logros') temResultAcademica += 10;
            if (Academica13) temResultAcademica += 10;
            if (Academica14 === 'Hablar con él en privado para entender la causa del comportamiento') temResultAcademica += 10;
            if (Academica15) temResultAcademica += 10;
            if (Academica16 === 'Priorizar casos según su urgencia y delegar tareas si es necesario') temResultAcademica += 10;
            if (Academica17) temResultAcademica += 10;
            if (Academica18 === 'Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal') temResultAcademica += 10;
            if (Academica19) temResultAcademica += 10;
            if (Academica20) temResultAcademica += 10;
            setResultAcademica(temResultAcademica);
         }, [Academica1,Academica2,Academica3,Academica4,Academica5,Academica6,Academica7,Academica8,Academica9,Academica10,Academica11,Academica12,Academica13,Academica14,Academica15,Academica16,Academica17,Academica18,Academica19,Academica20]);

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
            }, [Wais1,Wais2,Wais3,Wais4,Wais5,Wais6,Wais7,Wais8,Wais9,isCorrect,Wais11,isCorrect2,isCorrect3,Wais14,isCorrect4,Wais16,Wais17,Wais18,Wais19,Wais20,Wais21,Wais22,Wais23,Wais24,Wais25]);
 


        const scrollTop = () => {
                try { window.scrollTo({ top:0, behavior:'smooth'}); } catch(_) {}
        };
        const nextStep = () => {
                setStep(s => { const ns = s + 1; setTimeout(scrollTop,10); return ns; });
            };
        const prevStep = () => {
                setStep(s => { const ps = Math.max(1, s - 1); setTimeout(scrollTop,10); return ps; });
            };

    const { datos1, saveTestResults, preregistroId, loadPreRegistro, loading, error } = useAsesor();

    // Intentar cargar datos si volvieron al test tras refrescar / volver desde flechas
    useEffect(()=>{
        if(preregistroId && !datos1){
            loadPreRegistro();
        }
    },[preregistroId]);

    // (fallback moved into main return to not alterar orden de hooks)

        // ================== VALIDACION & CONFIRMACION SALIDA ==================
        const [validationError, setValidationError] = useState('');
        const testCompletedRef = useRef(false);

        const handleStepSubmit = (e) => {
            e.preventDefault();
            setValidationError('');
            const form = e.target;
            // Requerimos que todos los selects visibles tengan valor y los textareas/inputs type=text si existen
            const missing = [];
            const elements = Array.from(form.querySelectorAll('select, textarea, input[type="text"], input[type="number"]'));
            elements.forEach(el => {
                if(el.offsetParent === null) return; // oculto
                if(el.tagName === 'SELECT' && el.value === '') missing.push(el);
                if((el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number') && el.hasAttribute('required') && el.value.trim() === '') missing.push(el);
            });
            // Radio groups: cada group name distinto debe tener uno seleccionado
            const radios = Array.from(form.querySelectorAll('input[type="radio"]'));
            const radioNames = [...new Set(radios.map(r=>r.name))];
            radioNames.forEach(name => {
                const group = radios.filter(r=>r.name===name && r.offsetParent!==null);
                if(group.length && !group.some(r=>r.checked)) missing.push(group[0]);
            });
            if(missing.length){
                setValidationError('Responde todas las preguntas antes de continuar.');
                // Añadir marca visual
                missing.forEach(el => el.classList.add('ring','ring-red-500'));
                setTimeout(()=> missing.forEach(el => el.classList.remove('ring','ring-red-500')), 1500);
                return;
            }
            nextStep();
        };

        // Confirmación al intentar cerrar/recargar
        useEffect(()=>{
            const handleBeforeUnload = (e) => {
                if(!testCompletedRef.current){
                    e.preventDefault();
                    e.returnValue = '';
                }
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        },[]);

        // ================== PERSISTENCIA Y BLOQUEO DE REGRESO ==================
        const STORAGE_KEY = 'asesor_test_draft_v1';
        const restoredRef = useRef(false);
        const savingRef = useRef(false);

        // Restaurar borrador de este preregistro al montar/cambiar preregistro
        useEffect(()=>{
            if(restoredRef.current) return;
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if(raw){
                    const data = JSON.parse(raw);
                    if(data && typeof data === 'object'){
                        // Solo restaurar si el borrador pertenece a este preregistro
                        if(data.preregistroId && preregistroId && data.preregistroId !== preregistroId){
                            // Borrador antiguo de otra persona/sesión: ignorar
                        } else {
                            if(data.step !== undefined) setStep(data.step);
                        }
                        // Restaurar BigFive (22)
                        const bf = data.bigFive || [];
                        if(bf.length){
                            setBigfive1(bf[0]||''); setBigfive2(bf[1]||''); setBigfive3(bf[2]||''); setBigfive4(bf[3]||''); setBigfive5(bf[4]||''); setBigfive6(bf[5]||''); setBigfive7(bf[6]||''); setBigfive8(bf[7]||''); setBigfive9(bf[8]||''); setBigfive10(bf[9]||''); setBigfive11(bf[10]||''); setBigfive12(bf[11]||''); setBigfive13(bf[12]||''); setBigfive14(bf[13]||''); setBigfive15(bf[14]||''); setBigfive16(bf[15]||''); setBigfive17(bf[16]||''); setBigfive18(bf[17]||''); setBigfive19(bf[18]||''); setBigfive20(bf[19]||''); setBigfive21(bf[20]||''); setBigfive22(bf[21]||'');
                        }
                        // DASS (21)
                        const ds = data.dass || [];
                        if(ds.length){
                            setDass1(ds[0]||''); setDass2(ds[1]||''); setDass3(ds[2]||''); setDass4(ds[3]||''); setDass5(ds[4]||''); setDass6(ds[5]||''); setDass7(ds[6]||''); setDass8(ds[7]||''); setDass9(ds[8]||''); setDass10(ds[9]||''); setDass11(ds[10]||''); setDass12(ds[11]||''); setDass13(ds[12]||''); setDass14(ds[13]||''); setDass15(ds[14]||''); setDass16(ds[15]||''); setDass17(ds[16]||''); setDass18(ds[17]||''); setDass19(ds[18]||''); setDass20(ds[19]||''); setDass21(ds[20]||'');
                        }
                        // Zavic (60) solo pares suman pero guardamos todos
                        const zv = data.zavic || [];
                        if(zv.length){
                          [setZavic1,setZavic2,setZavic3,setZavic4,setZavic5,setZavic6,setZavic7,setZavic8,setZavic9,setZavic10,setZavic11,setZavic12,setZavic13,setZavic14,setZavic15,setZavic16,setZavic17,setZavic18,setZavic19,setZavic20,setZavic21,setZavic22,setZavic23,setZavic24,setZavic25,setZavic26,setZavic27,setZavic28,setZavic29,setZavic30,setZavic31,setZavic32,setZavic33,setZavic34,setZavic35,setZavic36,setZavic37,setZavic38,setZavic39,setZavic40,setZavic41,setZavic42,setZavic43,setZavic44,setZavic45,setZavic46,setZavic47,setZavic48,setZavic49,setZavic50,setZavic51,setZavic52,setZavic53,setZavic54,setZavic55,setZavic56,setZavic57,setZavic58,setZavic59,setZavic60]
                            .forEach((setter,idx)=> setter(zv[idx]||''));
                        }
                        // BarOn (25)
                        const bo = data.baron || [];
                        if(bo.length){
                            [setBaron1,setBaron2,setBaron3,setBaron4,setBaron5,setBaron6,setBaron7,setBaron8,setBaron9,setBaron10,setBaron11,setBaron12,setBaron13,setBaron14,setBaron15,setBaron16,setBaron17,setBaron18,setBaron19,setBaron20,setBaron21,setBaron22,setBaron23,setBaron24,setBaron25].forEach((setter,idx)=> setter(bo[idx]||''));
                        }
                        // Wais (25)
                        const ws = data.wais || [];
                        if(ws.length){
                            [setWais1,setWais2,setWais3,setWais4,setWais5,setWais6,setWais7,setWais8,setWais9,setWais10,setWais11,setWais12,setWais13,setWais14,setWais15,setWais16,setWais17,setWais18,setWais19,setWais20,setWais21,setWais22,setWais23,setWais24,setWais25].forEach((setter,idx)=> setter(ws[idx]||''));
                        }
                        // Académica (20)
                        const ac = data.academica || [];
                        if(ac.length){
                            [setAcademica1,setAcademica2,setAcademica3,setAcademica4,setAcademica5,setAcademica6,setAcademica7,setAcademica8,setAcademica9,setAcademica10,setAcademica11,setAcademica12,setAcademica13,setAcademica14,setAcademica15,setAcademica16,setAcademica17,setAcademica18,setAcademica19,setAcademica20].forEach((setter,idx)=> setter(ac[idx]||''));
                        }
                    }
                }
            } catch(err){
                console.error('Error restaurando borrador test', err);
            } finally {
                restoredRef.current = true;
            }
    },[preregistroId]);

        // Guardar borrador (debounce ~400ms para mejorar rendimiento móvil)
        const debounceTimer = useRef(null);
        useEffect(()=>{
            if(!restoredRef.current) return;
            if(debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(()=>{
                try {
                    const draft = {
                        preregistroId: preregistroId || null,
                        step,
                        bigFive: [bigfive1,bigfive2,bigfive3,bigfive4,bigfive5,bigfive6,bigfive7,bigfive8,bigfive9,bigfive10,bigfive11,bigfive12,bigfive13,bigfive14,bigfive15,bigfive16,bigfive17,bigfive18,bigfive19,bigfive20,bigfive21,bigfive22],
                        dass: [dass1,dass2,dass3,dass4,dass5,dass6,dass7,dass8,dass9,dass10,dass11,dass12,dass13,dass14,dass15,dass16,dass17,dass18,dass19,dass20,dass21],
                        zavic: [Zavic1,Zavic2,Zavic3,Zavic4,Zavic5,Zavic6,Zavic7,Zavic8,Zavic9,Zavic10,Zavic11,Zavic12,Zavic13,Zavic14,Zavic15,Zavic16,Zavic17,Zavic18,Zavic19,Zavic20,Zavic21,Zavic22,Zavic23,Zavic24,Zavic25,Zavic26,Zavic27,Zavic28,Zavic29,Zavic30,Zavic31,Zavic32,Zavic33,Zavic34,Zavic35,Zavic36,Zavic37,Zavic38,Zavic39,Zavic40,Zavic41,Zavic42,Zavic43,Zavic44,Zavic45,Zavic46,Zavic47,Zavic48,Zavic49,Zavic50,Zavic51,Zavic52,Zavic53,Zavic54,Zavic55,Zavic56,Zavic57,Zavic58,Zavic59,Zavic60],
                        baron: [baron1,baron2,baron3,baron4,baron5,baron6,baron7,baron8,baron9,baron10,baron11,baron12,baron13,baron14,baron15,baron16,baron17,baron18,baron19,baron20,baron21,baron22,baron23,baron24,baron25],
                        wais: [Wais1,Wais2,Wais3,Wais4,Wais5,Wais6,Wais7,Wais8,Wais9,Wais10,Wais11,Wais12,Wais13,Wais14,Wais15,Wais16,Wais17,Wais18,Wais19,Wais20,Wais21,Wais22,Wais23,Wais24,Wais25],
                        academica: [Academica1,Academica2,Academica3,Academica4,Academica5,Academica6,Academica7,Academica8,Academica9,Academica10,Academica11,Academica12,Academica13,Academica14,Academica15,Academica16,Academica17,Academica18,Academica19,Academica20]
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
                } catch(err){
                    console.error('Error guardando borrador test', err);
                }
            },400);
            return ()=> { if(debounceTimer.current) clearTimeout(debounceTimer.current); };
        }, [step, bigfive1,bigfive2,bigfive3,bigfive4,bigfive5,bigfive6,bigfive7,bigfive8,bigfive9,bigfive10,bigfive11,bigfive12,bigfive13,bigfive14,bigfive15,bigfive16,bigfive17,bigfive18,bigfive19,bigfive20,bigfive21,bigfive22,
            dass1,dass2,dass3,dass4,dass5,dass6,dass7,dass8,dass9,dass10,dass11,dass12,dass13,dass14,dass15,dass16,dass17,dass18,dass19,dass20,dass21,
            Zavic1,Zavic2,Zavic3,Zavic4,Zavic5,Zavic6,Zavic7,Zavic8,Zavic9,Zavic10,Zavic11,Zavic12,Zavic13,Zavic14,Zavic15,Zavic16,Zavic17,Zavic18,Zavic19,Zavic20,Zavic21,Zavic22,Zavic23,Zavic24,Zavic25,Zavic26,Zavic27,Zavic28,Zavic29,Zavic30,Zavic31,Zavic32,Zavic33,Zavic34,Zavic35,Zavic36,Zavic37,Zavic38,Zavic39,Zavic40,Zavic41,Zavic42,Zavic43,Zavic44,Zavic45,Zavic46,Zavic47,Zavic48,Zavic49,Zavic50,Zavic51,Zavic52,Zavic53,Zavic54,Zavic55,Zavic56,Zavic57,Zavic58,Zavic59,Zavic60,
            baron1,baron2,baron3,baron4,baron5,baron6,baron7,baron8,baron9,baron10,baron11,baron12,baron13,baron14,baron15,baron16,baron17,baron18,baron19,baron20,baron21,baron22,baron23,baron24,baron25,
            Wais1,Wais2,Wais3,Wais4,Wais5,Wais6,Wais7,Wais8,Wais9,Wais10,Wais11,Wais12,Wais13,Wais14,Wais15,Wais16,Wais17,Wais18,Wais19,Wais20,Wais21,Wais22,Wais23,Wais24,Wais25,
            Academica1,Academica2,Academica3,Academica4,Academica5,Academica6,Academica7,Academica8,Academica9,Academica10,Academica11,Academica12,Academica13,Academica14,Academica15,Academica16,Academica17,Academica18,Academica19,Academica20]);

        // Inyectar override CSS (solo móvil) para que los bloques `hidden md:flex` se vean en mobile
        // sin tocar la vista de escritorio. Se aplica dentro del contenedor con clase `test-mobile`.
        useEffect(()=>{
            const id = 'test-mobile-override';
            let style = document.getElementById(id);
            if (!style) {
                style = document.createElement('style');
                style.id = id;
                document.head.appendChild(style);
            }
            style.textContent = `
                /* Ajustes móviles */
                @media (max-width: 767px){
                    .test-mobile .hidden.md\:flex{display:flex !important; flex-direction:column;}
                    .test-mobile .space-x-20{column-gap:0 !important;}
                    .test-mobile .flex-2{flex:1 1 auto;}

                    /* Layout y medidas más compactas */
                    .test-mobile{padding-left:0.5rem; padding-right:0.5rem;}
                    .test-mobile .p-8{padding:1rem !important;}
                    .test-mobile .mb-6{margin-bottom:1rem !important;}
                    .test-mobile .mt-6{margin-top:0.75rem !important;}
                    .test-mobile .w-330{width:100% !important;}

                    /* Tipografías más legibles en móvil */
                    .test-mobile .text-3xl{font-size:1.5rem; line-height:2rem;}
                    .test-mobile .text-2xl{font-size:1.25rem; line-height:1.75rem;}
                    .test-mobile .text-xl{font-size:1rem; line-height:1.5rem;}

                    /* Cada fila de pregunta: más aire y separación */
                    .test-mobile .hidden.md\:flex > div{margin-bottom:0.5rem;}
                    .test-mobile .hidden.md\:flex{row-gap:0.5rem; padding-top:0.25rem; padding-bottom:0.75rem; border-bottom:1px dashed #e5e7eb;}

                    /* Select como overlay estilo input */
                    .test-mobile .sheet-select-wrapper{position:relative; min-height:52px;}
                    .test-mobile select{appearance:none; -webkit-appearance:none; -moz-appearance:none; background-image:none; opacity:0; position:absolute; inset:0; width:100%; height:100%; pointer-events:none;}
                    .test-mobile .sheet-proxy{position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; padding:0.75rem; border:1px solid #D1D5DB; border-radius:0.5rem; background:#fff; color:#111827;}
                    .test-mobile .sheet-proxy:focus{outline:2px solid #3B82F6; outline-offset:2px;}
                    .test-mobile .sheet-proxy .placeholder{color:#9CA3AF;}
                }

                /* En desktop: aseguramos que el proxy no se muestre y el select nativo se vea normal */
                @media (min-width: 768px){
                    .test-mobile .sheet-proxy{display:none !important;}
                }
            `;
        }, []);

        // Bloquear botón atrás del navegador (permite usar botones internos prevStep)
        useEffect(()=>{
            const handlePop = (e) => {
                // Empujar de nuevo para evitar salir y mostrar aviso simple
                window.history.pushState(null, '', window.location.href);
            };
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePop);
            return () => window.removeEventListener('popstate', handlePop);
        },[]);

        const navigate = useNavigate();

        // Si venimos desde preregistro (?preregistroid=...), forzar mostrar la introducción (step 0)
        // solo si NO hay borrador previo con step>0 para este preregistro
        const forcedIntroOnceRef = useRef(false);
        useEffect(()=>{
            if (forcedIntroOnceRef.current) return;
            const params = new URLSearchParams(window.location.search);
            if (params.has('preregistroid')){
                forcedIntroOnceRef.current = true;
                let shouldForceIntro = true;
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw){
                        const data = JSON.parse(raw);
                        if (data && typeof data === 'object' && (data.preregistroId === preregistroId)){
                            if (typeof data.step === 'number' && data.step > 0){
                                shouldForceIntro = false;
                            }
                        }
                    }
                } catch{}

                if (shouldForceIntro){
                    setStep(0);
                    try {
                        const raw = localStorage.getItem(STORAGE_KEY);
                        const data = raw ? JSON.parse(raw) : {};
                        if (data && typeof data === 'object'){
                            data.preregistroId = preregistroId || null;
                            data.step = 0;
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                        }
                    } catch{}
                }
            }
        }, [preregistroId]);

        // ========================
        // BIG FIVE (versión mejorada intermedia)
        // Objetivo: pasar de un total bruto a puntajes por las 5 dimensiones O C E A N.
        // Nota: Este mapeo es ilustrativo (aprox) y debe ajustarse a los ítems reales que uses en formulario.
        // Cada entrada de bigFiveMeta describe: dimension y si el ítem es de puntaje invertido.
        // Escala asumida Likert 1–5. Reverse scoring: score = 6 - valor.
        // Dimensiones: O (Apertura), C (Responsabilidad/Conscientiousness), E (Extraversión), A (Amabilidad/Agreeableness), N (Neuroticismo).
        // Comentarios por ítem para trazabilidad (ej: "E+ sociabilidad", "N- estabilidad" si fuera invertido, etc.)
        // Ajusta según tu baterÍa real: los ítems invertidos suelen medir el polo opuesto (ej: baja sociabilidad).
        const bigFiveRawItems = [
            bigfive1,bigfive2,bigfive3,bigfive4,bigfive5,bigfive6,bigfive7,bigfive8,bigfive9,bigfive10,
            bigfive11,bigfive12,bigfive13,bigfive14,bigfive15,bigfive16,bigfive17,bigfive18,bigfive19,bigfive20,bigfive21,bigfive22
        ];
        const bigFiveMeta = [
            // Ítem 1
            { dimension:'E', reverse:false, comentario:'Extraversión: energía social' },
            // Ítem 2
            { dimension:'A', reverse:true, comentario:'Amabilidad (invertido: rudeza / crítica)' },
            // Ítem 3
            { dimension:'C', reverse:false, comentario:'Responsabilidad: organización' },
            // Ítem 4
            { dimension:'N', reverse:false, comentario:'Neuroticismo: ansiedad / tensión' },
            // Ítem 5
            { dimension:'O', reverse:false, comentario:'Apertura: curiosidad intelectual' },
            // Ítem 6
            { dimension:'E', reverse:true, comentario:'Extraversión (invertido: reserva)' },
            // Ítem 7
            { dimension:'A', reverse:false, comentario:'Amabilidad: cooperación / empatía' },
            // Ítem 8
            { dimension:'C', reverse:true, comentario:'Responsabilidad (invertido: desorden)' },
            // Ítem 9
            { dimension:'N', reverse:true, comentario:'Neuroticismo (invertido: calma)' },
            // Ítem 10
            { dimension:'O', reverse:false, comentario:'Apertura: imaginación' },
            // Ítem 11
            { dimension:'E', reverse:false, comentario:'Extraversión: assertividad' },
            // Ítem 12
            { dimension:'A', reverse:false, comentario:'Amabilidad: confianza' },
            // Ítem 13
            { dimension:'C', reverse:false, comentario:'Responsabilidad: autodisciplina' },
            // Ítem 14
            { dimension:'N', reverse:false, comentario:'Neuroticismo: vulnerabilidad emocional' },
            // Ítem 15
            { dimension:'O', reverse:true, comentario:'Apertura (invertido: preferencia rutina)' },
            // Ítem 16
            { dimension:'E', reverse:false, comentario:'Extraversión: entusiasmo' },
            // Ítem 17
            { dimension:'A', reverse:true, comentario:'Amabilidad (invertido: competitividad dura)' },
            // Ítem 18
            { dimension:'C', reverse:false, comentario:'Responsabilidad: diligencia' },
            // Ítem 19
            { dimension:'N', reverse:false, comentario:'Neuroticismo: preocupación' },
            // Ítem 20
            { dimension:'O', reverse:false, comentario:'Apertura: apreciación estética' },
            // Ítem 21
            { dimension:'E', reverse:true, comentario:'Extraversión (invertido: retiro social)' },
            // Ítem 22
            { dimension:'A', reverse:false, comentario:'Amabilidad: altruismo' }
        ];
        // Contenedores acumuladores
        const bigFiveDimScores = {};
        const bigFiveDimCounts = {};
        // Recorrer ítems y sumar puntajes por dimensión
        bigFiveRawItems.forEach((val,i)=>{
            const meta = bigFiveMeta[i];
            const raw = Number(val)||0;
            const score = meta.reverse ? (raw ? (6 - raw) : 0) : raw; // reverse scoring
            if(!meta.dimension) return;
            bigFiveDimScores[meta.dimension] = (bigFiveDimScores[meta.dimension]||0) + score;
            bigFiveDimCounts[meta.dimension] = (bigFiveDimCounts[meta.dimension]||0) + (raw?1:0);
        });
        // Promedios (para comparar dimensiones entre sí sin sesgo por ítems faltantes)
        const bigFiveDimAverages = Object.fromEntries(Object.entries(bigFiveDimScores).map(([k,v])=> [k, (v / (bigFiveDimCounts[k]||1))]));
        // Total legacy (suma cruda sin reversas) se mantiene para gating retro-compatibilidad
        const ResultadoBigFive = bigFiveRawItems.reduce((acc,v)=> acc + (Number(v)||0),0);
        // Totales ajustados (con reversas aplicadas) – pueden usarse en futuro para un gating más fino
        const bigFiveDimAdjustedTotals = Object.fromEntries(Object.entries(bigFiveDimScores));
        // Categorías simples (bajo <2.5, medio 2.5–3.5, alto >3.5)
        const categorize = (avg)=> avg<=0 ? 'Sin datos' : (avg < 2.5 ? 'Bajo' : (avg <= 3.5 ? 'Medio' : 'Alto'));
        const bigFiveDimCategories = Object.fromEntries(Object.entries(bigFiveDimAverages).map(([k,v])=> [k, categorize(v)]));
        // Paquete dimensiones para enviar
        const bigFiveDimPacked = {
            averages: bigFiveDimAverages,
            adjusted_totals: bigFiveDimAdjustedTotals,
            categories: bigFiveDimCategories,
            meta: bigFiveMeta.map((m,idx)=> ({ idx: idx+1, dimension: m.dimension, reverse: m.reverse, comentario: m.comentario }))
        };
    // (Bloque previo duplicado eliminado) -- ya calculado arriba

        // ========================
        // DASS-21 SUBESCALAS
        // Ítems (1-21) se mapean a 3 subescalas y luego cada subescala se multiplica x2.
        // Depresión: 3,5,10,13,16,17,21
        // Ansiedad : 2,4,7,9,15,19,20
        // Estrés   : 1,6,8,11,12,14,18
        const dassItems = [dass1,dass2,dass3,dass4,dass5,dass6,dass7,dass8,dass9,dass10,dass11,dass12,dass13,dass14,dass15,dass16,dass17,dass18,dass19,dass20,dass21];
        const idx = (n)=> Number(dassItems[n-1])||0; // helper index 1-based
        const dassDepRaw = [3,5,10,13,16,17,21].reduce((a,n)=>a+idx(n),0);
        const dassAnxRaw = [2,4,7,9,15,19,20].reduce((a,n)=>a+idx(n),0);
        const dassStrRaw = [1,6,8,11,12,14,18].reduce((a,n)=>a+idx(n),0);
        const dassDep = dassDepRaw * 2;
        const dassAnx = dassAnxRaw * 2;
        const dassStr = dassStrRaw * 2;
        // Clasificación simple (tablas oficiales) devuelven etiqueta; útil para informe futuro
        const dassClassify = (type, score)=>{
            // type: 'D','A','S'
            const ranges = type==='D'
                ? [[0,9,'Normal'],[10,13,'Mild'],[14,20,'Moderate'],[21,27,'Severe'],[28,99,'Extremely Severe']]
                : type==='A'
                    ? [[0,7,'Normal'],[8,9,'Mild'],[10,14,'Moderate'],[15,19,'Severe'],[20,99,'Extremely Severe']]
                    : [[0,14,'Normal'],[15,18,'Mild'],[19,25,'Moderate'],[26,33,'Severe'],[34,99,'Extremely Severe']];
            const found = ranges.find(r=> score>=r[0] && score<=r[1]);
            return found?found[2]:'NA';
        };
        const dassDepCat = dassClassify('D', dassDep);
        const dassAnxCat = dassClassify('A', dassAnx);
        const dassStrCat = dassClassify('S', dassStr);
        // Total legacy (se mantiene para gating actual) = suma ítems sin multiplicar
        const ResultadoDASS = dassItems.reduce((a,v)=> a + (Number(v)||0),0);

        const ResultadoZavic = Number(Zavic2) + Number(Zavic4) + Number(Zavic6) + Number(Zavic8) + Number(Zavic10) + Number(Zavic12) + Number(Zavic14) + Number(Zavic16) + Number(Zavic18) + Number(Zavic20) + Number(Zavic22) + Number(Zavic24) + Number(Zavic26) + Number(Zavic28) + Number(Zavic30) + Number(Zavic32) + Number(Zavic34) + Number(Zavic36) + Number(Zavic38) + Number(Zavic40) + Number(Zavic42) + Number(Zavic44) + Number(Zavic46) + Number(Zavic48) + Number (Zavic50) + Number (Zavic52) + Number (Zavic54) + Number (Zavic56) + Number (Zavic58) + Number (Zavic60);

        const ResultadoBarOn = Number(baron1) + Number(baron2) + Number(baron3) + Number(baron4) + Number(baron5) + Number(baron6) + Number(baron7) + Number(baron8) + Number(baron9) + Number(baron10) + Number(baron11) + Number(baron12) + Number(baron13) + Number(baron14) + Number(baron15) + Number(baron16) + Number(baron17) + Number(baron18) + Number(baron19) + Number(baron20) + Number(baron21) + Number(baron22) + Number(baron23) + Number(baron24) + Number(baron25);

        const ResultadoWais = Number(resultWais);

        const ResultadoAcademica = Number(ResultAcademica);

    // Helper para construir el payload a enviar (evita duplicación y futuros errores)
    const buildPayload = () => ({
        bigfive_total: ResultadoBigFive,
        dass21_total: ResultadoDASS,
        zavic_total: ResultadoZavic,
        baron_total: ResultadoBarOn,
        wais_total: ResultadoWais,
        academica_total: ResultadoAcademica,
        bigfive_respuestas: [bigfive1,bigfive2,bigfive3,bigfive4,bigfive5,bigfive6,bigfive7,bigfive8,bigfive9,bigfive10,bigfive11,bigfive12,bigfive13,bigfive14,bigfive15,bigfive16,bigfive17,bigfive18,bigfive19,bigfive20,bigfive21,bigfive22],
        dass21_respuestas: [dass1,dass2,dass3,dass4,dass5,dass6,dass7,dass8,dass9,dass10,dass11,dass12,dass13,dass14,dass15,dass16,dass17,dass18,dass19,dass20,dass21],
        zavic_respuestas: [Zavic1,Zavic2,Zavic3,Zavic4,Zavic5,Zavic6,Zavic7,Zavic8,Zavic9,Zavic10,Zavic11,Zavic12,Zavic13,Zavic14,Zavic15,Zavic16,Zavic17,Zavic18,Zavic19,Zavic20,Zavic21,Zavic22,Zavic23,Zavic24,Zavic25,Zavic26,Zavic27,Zavic28,Zavic29,Zavic30,Zavic31,Zavic32,Zavic33,Zavic34,Zavic35,Zavic36,Zavic37,Zavic38,Zavic39,Zavic40,Zavic41,Zavic42,Zavic43,Zavic44,Zavic45,Zavic46,Zavic47,Zavic48,Zavic49,Zavic50,Zavic51,Zavic52,Zavic53,Zavic54,Zavic55,Zavic56,Zavic57,Zavic58,Zavic59,Zavic60],
        baron_respuestas: [baron1,baron2,baron3,baron4,baron5,baron6,baron7,baron8,baron9,baron10,baron11,baron12,baron13,baron14,baron15,baron16,baron17,baron18,baron19,baron20,baron21,baron22,baron23,baron24,baron25],
        wais_respuestas: [Wais1,Wais2,Wais3,Wais4,Wais5,Wais6,Wais7,Wais8,Wais9,Wais10,Wais11,Wais12,Wais13,Wais14,Wais15,Wais16,Wais17,Wais18,Wais19,Wais20,Wais21,Wais22,Wais23,Wais24,Wais25],
        academica_respuestas: [Academica1,Academica2,Academica3,Academica4,Academica5,Academica6,Academica7,Academica8,Academica9,Academica10,Academica11,Academica12,Academica13,Academica14,Academica15,Academica16,Academica17,Academica18,Academica19,Academica20],
        dass21_subescalas: { depresion: dassDep, ansiedad: dassAnx, estres: dassStr, dep_cat: dassDepCat, anx_cat: dassAnxCat, str_cat: dassStrCat },
        bigfive_dimensiones: bigFiveDimPacked
    });

    const navigateToResults = () => {
        navigate('/resultados', { state: { ResultadoBigFive, ResultadoDASS, ResultadoZavic, ResultadoBarOn, ResultadoWais, ResultadoAcademica, dassDep, dassAnx, dassStr, dassDepCat, dassAnxCat, dassStrCat, bigFiveDim: bigFiveDimPacked } });
    };

    const Onsubmite = async (e) => {
        e.preventDefault();
        if(!preregistroId){
            navigate('/pre_registro');
            return;
        }
        try {
            const payload = buildPayload();
            await saveTestResults(payload);
            localStorage.removeItem(STORAGE_KEY);
            testCompletedRef.current = true;
            navigateToResults();
        } catch(err){
            console.error('Error guardando resultados', err);
            alert('Error guardando resultados: ' + (err.message || '')); // No navegamos si falla
        }
    };

                // Cronómetro por sección (40 min) eliminado: usamos solo el temporizador global

                // Temporizador global (1 hora 20 minutos) para TODO el test
                const GLOBAL_TIMER_KEY = 'asesor_test_global_timer_v2';
                const [globalLeft, setGlobalLeft] = useState(null); // segundos restantes
                const autoSubmittedRef = useRef(false);

        const autoSubmitOnTimeout = async ()=>{
                        if(autoSubmittedRef.current) return;
                        autoSubmittedRef.current = true;
                        try{
                                if(!preregistroId){
                                        navigate('/pre_registro');
                                        return;
                                }
                // Enviar lo que haya, sin bloquear validaciones (ya manejado antes)
                await saveTestResults(buildPayload());
                                try { localStorage.removeItem(STORAGE_KEY); } catch{}
                                testCompletedRef.current = true;
                        } catch(e){
                // En caso de error, aún navegamos mostrando resultados locales
                console.error('Auto-submit (timeout) falló al guardar remotamente', e);
                        }
            navigateToResults();
                };

        useEffect(()=>{
            if(!preregistroId) return;
            try {
                const durationSec = 80 * 60; // 1h 20m
                let data = null;
                try { data = JSON.parse(localStorage.getItem(GLOBAL_TIMER_KEY)||'null'); } catch {}
                // Initialize only if not present or different preregistro
                if(!data || data.preregistroId !== preregistroId){
                    data = { preregistroId, startedAt: Date.now(), durationSec };
                    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(data));
                }
                const tick = ()=>{
                    const elapsed = Math.floor((Date.now() - data.startedAt)/1000);
                    const left = Math.max(0, data.durationSec - elapsed);
                    setGlobalLeft(left);
                    if(left === 0){
                        autoSubmitOnTimeout();
                    }
                };
                tick();
                const id = setInterval(tick, 1000);
                return ()=> clearInterval(id);
            } catch(e){ /* ignore */ }
                }, [preregistroId]);

            const timeLeft2 = globalLeft ?? 0;
            const formatTime2 = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

        useEffect(() => {
            if (datos1 === null) {
                // si aún no cargó dejamos que el fallback lo maneje
                return;
            }
            if (!datos1) {
                navigate('/pre_registro');
            }
        }, [datos1]);

  return (
    <div>
        <Navbar />
        {!datos1 && (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 w-full">
                <p className="mb-4 text-center text-gray-700">{loading ? 'Cargando tus datos...' : (error || 'Recuperando preregistro...')}</p>
                {!loading && (
                    <div className="flex gap-3">
                        {preregistroId && <button onClick={()=>loadPreRegistro()} className="px-4 py-2 bg-blue-500 text-white rounded">Reintentar</button>}
                        <button onClick={()=>window.location.href='/pre_registro'} className="px-4 py-2 bg-gray-500 text-white rounded">Ir a preregistro</button>
                    </div>
                )}
            </div>
        )}
    {datos1 && (
    <div ref={wrapperRef} className="test-mobile flex justify-center md:items-center items-start overflow-y-auto md:overflow-visible min-h-screen w-full">
                {/* Intro (móvil y desktop) */}
                {step === 0 && (
                <div className="w-full max-w-5xl md:max-w-6xl mx-auto px-3 md:px-6">
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow ring-1 ring-gray-200 p-6 md:p-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-3">{datos1?.nombres || ''} {datos1?.apellidos || ''}</h2>
                        <p className="text-center text-gray-600 mb-6">Bienvenido(a) al proceso en MQerKAcademy</p>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 md:p-5 mb-6">
                            <p className="text-gray-800 mb-3">Estamos muy emocionados de contar contigo. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva que prepare a los estudiantes para los retos del futuro.</p>
                            <p className="text-gray-700 mb-3">A continuación, completa estos pasos:</p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li><span className="font-medium">Test psicológicos y pruebas académicas</span>: nos ayudan a conocer tus habilidades, conocimientos y áreas de especialidad.</li>
                                <li><span className="font-medium">Sube tus documentos</span> una vez acredites los test: asegúrate de cargarlos en el formato indicado para agilizar la contratación.</li>
                            </ul>
                        </div>

                                                {/* Aviso de tiempo total del test */}
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 mb-6">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-amber-400 text-white grid place-items-center text-sm">⏱</div>
                                                        <div>
                                                            <p className="text-gray-900 font-semibold">Tiempo total del test: 1 hora 20 minutos</p>
                                                            <p className="text-gray-700 text-sm">El tiempo corre durante todo el proceso de evaluación. Al agotarse, el sistema enviará tus respuestas automáticamente y te llevará a la pantalla de resultados.</p>
                                                        </div>
                                                    </div>
                                                </div>

                        <div className="rounded-xl border border-gray-200 p-4 md:p-5 mb-6">
                            <p className="text-gray-700">En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                            <p className="text-gray-700 mt-2">Si tienes preguntas o necesitas apoyo, nuestro equipo está para ayudarte.</p>
                            <p className="text-gray-900 font-semibold mt-3">¡Mucho éxito y bienvenido(a) a esta nueva etapa!</p>
                            <p className="text-gray-900 font-bold">Equipo de MQerKAcademy</p>
                        </div>

                        <div className="flex justify-center">
                                                        <button type="button" onClick={() => { 
                                                            try { 
                                                                const durationSec = 80*60;
                                                                let data = null; 
                                                                try { data = JSON.parse(localStorage.getItem(GLOBAL_TIMER_KEY)||'null'); } catch {}
                                                                const now = Date.now();
                                                                const shouldInit = !data || data.preregistroId !== preregistroId || (now - (data.startedAt||0)) / 1000 >= (data.durationSec||durationSec);
                                                                if(shouldInit){
                                                                    localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify({ preregistroId, startedAt: now, durationSec })); 
                                                                }
                                                            } catch {}
                                                            setStep(1); 
                                                        }}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl font-semibold shadow-sm transition">
                                Iniciar
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Contenido de pruebas (visible en móvil y desktop) */}
                <div className={`w-full max-w-5xl md:max-w-6xl mx-auto px-3 md:px-6 flex flex-col ${step === 0 ? 'hidden' : ''}`}>
                                        {/* Barra fija con el contador global visible en todas las secciones del test */}
                                        {globalLeft != null && (
                                            <div className="sticky top-0 z-20 pt-3 pb-2 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
                                                <div className="flex justify-end">
                                                    <div className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-lg px-3 py-1.5 shadow">
                                                        <span className="text-xs uppercase tracking-wide opacity-90">Tiempo restante</span>
                                                        <span className="font-semibold tabular-nums">{formatTime2(timeLeft2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                    {/* No mostramos enlace para volver a la introducción una vez iniciado el test */}
                    {/* ActionSheetSelect compartido para móvil: intercepta selects nativos */}
                    <MobileSelectInterceptor wrapperRef={wrapperRef} />
                    {/* Nombre duplicado removido para evitar desajustes de layout */}
                    {step === 1 && (
                    <form onSubmit={handleStepSubmit}>
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
                                <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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

                        <div className='flex flex-col justify-center items-center'>
                            <button
                            type="submit"
                            className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                            Siguiente
                            </button>
                            {validationError && <p className="mt-2 text-red-600 text-sm font-semibold">{validationError}</p>}
                        </div>
                    </div>
                    </form>
                    )}
                    {step === 2 && (
                    <form onSubmit={handleStepSubmit}>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                    <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled>Selecciona una opción</option>
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
                                        <option value="" disabled>Selecciona un puntaje</option>
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
                                        <option value="" disabled>Selecciona una opción</option>
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
                                        <option value="" disabled>Selecciona un puntaje</option>
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
                                        <option value="" disabled>Selecciona una opción</option>
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
                                        <option value="" disabled>Selecciona un puntaje</option>
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
                                        <option value="" disabled>Selecciona una opción</option>
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
                                        <option value="" disabled>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        value={baron16}
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                                        <option value="" disabled hidden>Selecciona un puntaje</option>
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
                    <form onSubmit={handleStepSubmit}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p className='text-xl mb-2'>Instrucciones:</p>
                        <p className='text-xl'>1. Lee cuidadosamente cada pregunta antes de responder.</p>
                        <p className='text-xl'>2. Responde con claridad y en el espacio indicado.</p>
                        <p className='text-xl'>3. Algunas preguntas son cerradas (elige la opción correcta) y otras abiertas (explica o describe).</p>
                        <p className='text-xl mb-6'>4. En las preguntas abiertas, procura incluir ejemplos prácticos, soluciones claras o reflexiones relevantes según corresponda.</p>
                        <p className='text-center font-bold text-xl text-gray-900'>Tiempo y envío:</p>
                        <p className='text-center text-xl'>Este test se resuelve dentro del tiempo global de 1 hora 20 minutos. Al finalizar el tiempo, el sistema enviará tus respuestas automáticamente.</p>
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
                    <form onSubmit={handleStepSubmit}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                    <form onSubmit={handleStepSubmit}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                    <form onSubmit={handleStepSubmit}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                placeholder="Introduce tu respuesta aqui"
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
                                placeholder="Introduce tu respuesta aqui"
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                placeholder="Introduce tu respuesta aqui"
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
                    <form onSubmit={handleStepSubmit}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='flex justify-center items-center font-bold text-xl text-gray-900 mb-4'>
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
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
                                placeholder="Introduce tu respuesta aqui"
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                placeholder="Introduce tu respuesta aqui"
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                placeholder="Introduce tu respuesta aqui"
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
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>21.</p>
                                <img className='w-50 h-50' src={Veintiuno} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange21}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='a' checked={Wais21 === 'a'} onChange={handleRadioChange21} />
                                    <img src={R21_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='b' checked={Wais21 === 'b'} onChange={handleRadioChange21} />
                                    <img src={R21_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='c' checked={Wais21 === 'c'} onChange={handleRadioChange21} />
                                    <img src={R21_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question21" value='d' checked={Wais21 === 'd'} onChange={handleRadioChange21} />
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
                                    <input type="radio" name="question22" value='a' checked={Wais22 === 'a'} onChange={handleRadioChange22} />
                                    <img src={R22_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='b' checked={Wais22 === 'b'} onChange={handleRadioChange22} />
                                    <img src={R22_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='c' checked={Wais22 === 'c'} onChange={handleRadioChange22} />
                                    <img src={R22_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question22" value='d' checked={Wais22 === 'd'} onChange={handleRadioChange22} />
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
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>23.</p>
                                <img className='w-50 h-50' src={Veintitres} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15' onChange={handleRadioChange23}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='a' checked={Wais23 === 'a'} onChange={handleRadioChange23} />
                                    <img src={R23_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='b' checked={Wais23 === 'b'} onChange={handleRadioChange23} />
                                    <img src={R23_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='c' checked={Wais23 === 'c'} onChange={handleRadioChange23} />
                                    <img src={R23_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question23' value='d' checked={Wais23 === 'd'} onChange={handleRadioChange23} />
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
                                    <input type="radio" name='question24' value='a' checked={Wais24 === 'a'} onChange={handleRadioChange24} />
                                    <img src={R24_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='b' checked={Wais24 === 'b'} onChange={handleRadioChange24} />
                                    <img src={R24_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='c' checked={Wais24 === 'c'} onChange={handleRadioChange24} />
                                    <img src={R24_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name='question24' value='d' checked={Wais24 === 'd'} onChange={handleRadioChange24} />
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
                            <h2 className='bg-[#3818c3] px-3 py-1 rounded-2xl text-white'>{formatTime2(timeLeft2)}</h2>
                        </div>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>25.</p>
                                <img className='w-90 h-20' src={Veinticinco} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-8' onChange={handleRadioChange25}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='a' checked={Wais25 === 'a'} onChange={handleRadioChange25} />
                                    <img src={R25_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='b' checked={Wais25 === 'b'} onChange={handleRadioChange25} />
                                    <img src={R25_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='c' checked={Wais25 === 'c'} onChange={handleRadioChange25} />
                                    <img src={R25_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="radio" name="question25" value='d' checked={Wais25 === 'd'} onChange={handleRadioChange25} />
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
                                        <option value="" disabled hidden>Selecciona una opción</option>
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
    )}
    </div>
  )
}

// Componente auxiliar: convierte todos los <select> visibles dentro de wrapperRef
// en un ActionSheetSelect cuando estamos en móvil. No altera desktop.
function MobileSelectInterceptor({ wrapperRef }){
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [placeholder, setPlaceholder] = useState('Selecciona');
    const [value, setValue] = useState('');
    const selectRef = useRef(null);

    useEffect(()=>{
        if (!wrapperRef?.current) return;
        const root = wrapperRef.current;
        const mq = window.matchMedia('(max-width: 767px)');

        const enhance = () => {
            const selects = Array.from(root.querySelectorAll('select'));
            selects.forEach((sel) => {
                if (sel.dataset.sheetEnhanced) return;
                sel.dataset.sheetEnhanced = '1';
                // Envolver en contenedor relativo si el padre no lo es
                const parent = sel.parentElement;
                const wrapper = document.createElement('div');
                wrapper.className = 'sheet-select-wrapper';
                parent.insertBefore(wrapper, sel);
                wrapper.appendChild(sel);

                // Crear proxy visible
                const proxy = document.createElement('button');
                proxy.type = 'button';
                proxy.className = 'sheet-proxy';
                const updateLabel = () => {
                    const selectedOption = sel.options[sel.selectedIndex];
                    const label = selectedOption?.textContent || 'Selecciona';
                    const isPlaceholder = !sel.value || selectedOption?.disabled;
                    proxy.innerHTML = `<span class="${isPlaceholder? 'placeholder':''}">${label}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd" /></svg>`;
                };
                updateLabel();
                wrapper.appendChild(proxy);

                const openFor = () => {
                    try {
                        const opts = Array.from(sel.options).map(o=>({ value:o.value, label:o.textContent }));
                        setOptions(opts);
                        const ph = (sel.querySelector('option[disabled]')?.textContent) || 'Selecciona';
                        setPlaceholder(ph);
                        setValue(sel.value || '');
                        selectRef.current = sel;
                        setOpen(true);
                    } catch {}
                };
                const onChange = () => updateLabel();
                sel.addEventListener('change', onChange);
                proxy.addEventListener('click', openFor);

                // Evitar que el select abra nativo
                const block = (e) => { e.preventDefault(); e.stopPropagation(); };
                sel.addEventListener('mousedown', block, true);
                sel.addEventListener('touchstart', block, { capture:true, passive:false });
                sel.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ block(e); openFor(); } }, true);

                // Cleanup per select on unmount using MutationObserver scope (handled below)
            });
        };

        // Enhance now and when step/page mutates DOM (solo cuando es móvil)
        const runIfMobile = () => { if (mq.matches) enhance(); };
        runIfMobile();

        const mo = new MutationObserver(() => runIfMobile());
        mo.observe(root, { subtree:true, childList:true });
        const onChange = (e) => { if (e.matches) enhance(); };
        try { mq.addEventListener('change', onChange); } catch { /* safari fallback */ mq.addListener(onChange); }
        return ()=> {
            mo.disconnect();
            try { mq.removeEventListener('change', onChange); } catch { mq.removeListener(onChange); }
        };
    }, [wrapperRef]);

    const handleChange = (val)=>{
        setValue(val);
        const sel = selectRef.current;
        if (sel) {
            sel.value = val;
            // Disparar eventos para que React capte el cambio si usa onChange
            const ev = new Event('change', { bubbles:true });
            sel.dispatchEvent(ev);
        }
        setOpen(false);
    };

    return (
        <div className="md:hidden fixed left-[-9999px] top-0 w-0 h-0 overflow-hidden">
            <ActionSheetSelect
                open={open}
                onOpenChange={setOpen}
                value={value}
                onChange={handleChange}
                options={options}
                placeholder={placeholder}
                className="hidden"
            />
        </div>
    );
}
