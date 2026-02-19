// Este componente QuizIAModal es un modal de React que permite al usuario configurar y generar un cuestionario 
// (quiz) usando inteligencia artificial. Está diseñado para integrarse en una aplicación educativa o de evaluación, 
// y ofrece una interfaz amigable para personalizar cómo se generan las preguntas.

import React, { useState, useEffect, useMemo } from 'react';
import {
    Sparkles,
    X,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Brain,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { createPortal } from 'react-dom';
import { generarPreguntasIA, getCooldownRemainingMs } from "../../../service/simuladoresAI";
import { useAlert } from "../../../components/shared/AlertModal.jsx";

export default function QuizIAModal({
    open,
    onClose,
    onSuccess,
    areaTitle,
    selectedAreaId,
    initialTopic = "",
    initialCount = 5
}) {
    const { showAlert, showConfirm, AlertComponent } = useAlert();

    // Constants
    const MAX_IA = Number(import.meta.env?.VITE_AI_MAX_QUESTIONS || 50);
    const COUNT_OPTIONS = [5, 10, 30, 50].filter(n => n <= MAX_IA);

    // State
    const [iaChoiceMode, setIaChoiceMode] = useState('general'); // 'general' | 'temas'
    const [iaChoiceTopics, setIaChoiceTopics] = useState(initialTopic || '');
    const [iaNivel, setIaNivel] = useState('intermedio');
    const [iaIdioma, setIaIdioma] = useState('auto'); // auto | es | en | mix
    const [iaError, setIaError] = useState('');
    const [iaLoading, setIaLoading] = useState(false);
    const [cooldownMs, setCooldownMs] = useState(0);

    // Quick count sync
    const [iaQuickCount, setIaQuickCount] = useState(initialCount);

    // Distribution
    const [iaCountMultiple, setIaCountMultiple] = useState(3);
    const [iaCountVerdaderoFalso, setIaCountVerdaderoFalso] = useState(1);
    const [iaCountCorta, setIaCountCorta] = useState(1);

    // Advanced params
    const [iaShowAdvanced, setIaShowAdvanced] = useState(false);
    const [iaTemperature, setIaTemperature] = useState(0.6);
    const [iaTopP, setIaTopP] = useState('');
    const [iaTopK, setIaTopK] = useState('');
    const [iaMaxTokens, setIaMaxTokens] = useState('');

    // Lock page scroll while modal is open (avoid browser scrollbar)
    useEffect(() => {
        if (!open) return; // Solo ejecutar si está abierto
        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        document.body.style.overflow = 'hidden';
        try {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
        } catch { }
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
        };
    }, [open]);

    // Cooldown effect
    useEffect(() => {
        if (!open) return;
        let mounted = true;
        const tick = () => {
            if (!mounted) return;
            const remaining = getCooldownRemainingMs();
            setCooldownMs(remaining);
            if (remaining === 0) {
                setIaError(prev => {
                    if (!prev) return prev;
                    const msg = prev.toLowerCase();
                    if (msg.includes('límite') || msg.includes('espera') || msg.includes('cooldown')) return '';
                    return prev;
                });
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => { mounted = false; clearInterval(id); };
    }, [open]);

    // Sync distribution with count
    useEffect(() => {
        const currentTotal = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
        const quickTotal = iaQuickCount || 5;

        if (currentTotal !== quickTotal && quickTotal > 0) {
            if (currentTotal === 0) {
                const multi = Math.ceil(quickTotal * 0.6);
                const tf = Math.floor(quickTotal * 0.2);
                const corta = Math.max(0, quickTotal - multi - tf);
                setIaCountMultiple(multi);
                setIaCountVerdaderoFalso(tf);
                setIaCountCorta(corta);
            } else {
                const ratio = quickTotal / currentTotal;
                const newMulti = Math.max(0, Math.round(iaCountMultiple * ratio));
                const newTf = Math.max(0, Math.round(iaCountVerdaderoFalso * ratio));
                const newCorta = Math.max(0, Math.round(iaCountCorta * ratio));
                const newTotal = newMulti + newTf + newCorta;
                const diff = quickTotal - newTotal;
                setIaCountMultiple(newMulti + diff);
                setIaCountVerdaderoFalso(newTf);
                setIaCountCorta(newCorta);
            }
        }
    }, [iaQuickCount]);

    // Templates
    const temasPlantillas = useMemo(() => {
        const areaLower = (areaTitle || '').toLowerCase();
        if (areaLower.includes('español') || areaLower.includes('redacción')) {
            return ['sinónimos y antónimos', 'ortografía', 'lectura comprensiva', 'acentuación', 'gramática'];
        } else if (areaLower.includes('matemática') || areaLower.includes('pensamiento')) {
            return ['ecuaciones y sistemas', 'geometría', 'fracciones', 'funciones', 'razonamiento numérico'];
        } else if (areaLower.includes('física')) {
            return ['cinemática', 'dinámica', 'energía', 'termodinámica', 'electricidad'];
        } else if (areaLower.includes('química')) {
            return ['estequiometría', 'soluciones', 'balanceo', 'tabla periódica', 'reacciones'];
        }
        return ['conceptos básicos', 'aplicaciones', 'análisis', 'síntesis', 'evaluación'];
    }, [areaTitle]);

    if (!open) return null;

    const handleGenerate = async () => {
        if (iaLoading) return;

        // Check cooldown
        const currentCooldown = getCooldownRemainingMs();
        if (currentCooldown > 0) {
            const secs = Math.ceil(currentCooldown / 1000);
            setIaError(`Espera ${secs}s antes de volver a generar.`);
            setCooldownMs(currentCooldown);
            return;
        }

        setIaError('');

        // Validation
        const temasList = String(iaChoiceTopics || '').split(',').map(s => s.trim()).filter(Boolean);
        if (iaChoiceMode === 'temas' && temasList.length === 0) {
            setIaError('Ingresa al menos un tema.');
            return;
        }

        const cantidad = iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta;
        if (cantidad < 1) {
            setIaError('Se requiere al menos 1 pregunta.');
            return;
        }

        setIaLoading(true);

        try {
            const tema = iaChoiceMode === 'temas' ? (temasList.join(', ') || 'Varios temas') : (areaTitle || 'General');
            const distribucion = {
                multi: iaCountMultiple,
                tf: iaCountVerdaderoFalso,
                short: iaCountCorta
            };

            // Ensure distribucion values are non-negative
            distribucion.multi = Math.max(0, distribucion.multi);
            distribucion.tf = Math.max(0, distribucion.tf);
            distribucion.short = Math.max(0, distribucion.short);

            const opts = {
                tema,
                cantidad,
                area: areaTitle || undefined,
                nivel: iaNivel,
                idioma: iaIdioma,
                distribucion,
                temperature: iaTemperature,
                ...(iaTopP !== '' && { topP: Number(iaTopP) }),
                ...(iaTopK !== '' && { topK: Number(iaTopK) }),
                ...(iaMaxTokens !== '' && { maxOutputTokens: Number(iaMaxTokens) })
            };

            if (iaChoiceMode === 'temas') {
                opts.modo = 'temas';
                opts.temas = temasList;
            } else {
                opts.modo = 'general';
            }

            // ✅ Validación: Detectar múltiples temas y comparar con cantidad de preguntas
            const numTemas = iaChoiceMode === 'temas' && temasList.length ? temasList.length : 0;

            // ✅ Advertencia si hay más temas que preguntas
            if (numTemas > cantidad) {
                const advertencia = `Has especificado ${numTemas} temas (${temasList.join(', ')}), pero solo se generarán ${cantidad} preguntas. Algunos temas no tendrán preguntas. ¿Deseas continuar?`;

                const continuar = await showConfirm(advertencia, 'Advertencia');
                if (!continuar) {
                    setIaLoading(false);
                    return;
                }
            }

            const preguntasIA = await generarPreguntasIA({ ...opts, purpose: 'quiz_gen' });

            // Map to quiz format
            const preguntas = preguntasIA.map((q) => {
                if (q.type === 'multi') {
                    let options = (q.options || []).map(o => ({ text: o.text || '', correct: !!o.correct }));
                    if (options.length > 4) options = options.slice(0, 4);
                    while (options.length < 4) options.push({ text: `Opción ${options.length + 1}`, correct: false });
                    const idxC = options.findIndex(o => o.correct);
                    if (idxC === -1) options[0].correct = true;
                    else options = options.map((o, j) => ({ ...o, correct: j === idxC }));
                    return { type: 'multiple', text: q.text, points: Number(q.points || 1), options };
                }
                if (q.type === 'tf') {
                    return { type: 'tf', text: q.text, points: Number(q.points || 1), answer: (String(q.answer).toLowerCase() !== 'false') ? 'true' : 'false' };
                }
                return { type: 'short', text: q.text, points: Number(q.points || 1), answer: String(q.answer || '') };
            });

            const tituloSugerido = `${tema} (IA · ${cantidad} p)`;
            const instrucciones = `Quiz generado con IA sobre: ${tema}. Nivel: ${iaNivel}.`;

            const draft = {
                titulo: tituloSugerido,
                instrucciones,
                nombre: tituloSugerido,
                publico: false,
                maxIntentos: 3,
                areaTitle,
                selectedAreaId
            };

            onSuccess({ draft, questions: preguntas });
            onClose();

        } catch (e) {
            console.error(e);
            const msg = String(e?.message || '').toLowerCase();

            // API Key bloqueada por seguridad
            if (e?.code === 'API_KEY_LEAKED' || msg.includes('leaked')) {
                setIaError('⚠️ API Key bloqueada por seguridad. Contacta al administrador.');
            }
            // Límite de cuota de Google alcanzado (429)
            else if (msg.includes('quota') || msg.includes('429') || msg.includes('limit') || msg.includes('rate limit')) {
                const cooldown = getCooldownRemainingMs();
                const mins = Math.ceil(cooldown / 60000);

                setIaError(
                    `🕒 Límite de la API de Google alcanzado. ` +
                    `Esto es normal con el tier gratuito (15 peticiones/minuto por proyecto). ` +
                    `${cooldown > 0 ? `Espera ${mins} minuto${mins > 1 ? 's' : ''} antes de reintentar.` : 'Intenta nuevamente en unos momentos.'} ` +
                    `El sistema rotará automáticamente entre las API keys disponibles.`
                );
                setCooldownMs(cooldown);
            }
            // Cooldown activo
            else if (e?.code === 'COOLDOWN') {
                const cooldown = getCooldownRemainingMs();
                const secs = Math.ceil(cooldown / 1000);
                const mins = Math.floor(secs / 60);
                const remainingSecs = secs % 60;
                const timeDisplay = mins > 0
                    ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
                    : `${secs} segundo${secs > 1 ? 's' : ''}`;

                setIaError(`⏳ Espera ${timeDisplay} antes de generar nuevamente. Esto ayuda a evitar límites de la API de Google.`);
                setCooldownMs(cooldown);
            }
            // Otros errores
            else {
                setIaError(e?.message || 'Error al generar preguntas. Intenta nuevamente.');
            }
        } finally {
            setIaLoading(false);
        }
    };

    // Compact utility functions for UI consistency
    const ButtonGroup = ({ children, className = "" }) => (
        <div className={`flex gap-2 ${className}`}>{children}</div>
    );

    const CounterControl = ({ label, value, onDecrement, onIncrement, max }) => (
        <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 w-32">{label}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={onDecrement}
                    disabled={value <= 0}
                    className="w-6 h-6 flex items-center justify-center rounded border bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                    -
                </button>
                <span className="w-8 text-center font-semibold">{value}</span>
                <button
                    onClick={onIncrement}
                    disabled={value >= max}
                    className="w-6 h-6 flex items-center justify-center rounded border bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                    +
                </button>
            </div>
        </div>
    );

    return createPortal(
        <>
            <AlertComponent />
            <div className="mqerk-quiz-ia-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 xl:p-6 2xl:p-8">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
                <div className="mqerk-quiz-ia-dialog relative z-10 w-full max-w-2xl 2xl:max-w-4xl min-[1800px]:max-w-5xl max-h-[90vh] 2xl:max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex-shrink-0 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-indigo-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 p-2 shadow-md">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-slate-900 leading-tight">Generar con IA</h3>
                                <p className="text-xs text-slate-600 mt-0.5">Configuración personalizada</p>
                            </div>
                            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body con scroll */}
                    <div className="mqerk-hide-scrollbar flex-1 min-h-0 px-4 py-4 space-y-4 overflow-y-auto bg-white/50">
                        {/* Mode Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tipo de generación</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIaChoiceMode('general')}
                                    className={`relative text-left rounded-xl border-2 p-3 transition-all ${iaChoiceMode === 'general'
                                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200/50 shadow-sm'
                                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {iaChoiceMode === 'general' && (
                                        <div className="absolute top-2 right-2">
                                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="font-bold text-sm text-slate-800 mb-0.5">General del área</div>
                                    <div className="text-xs text-slate-500 leading-snug">Preguntas variadas de "{areaTitle || 'esta área'}"</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIaChoiceMode('temas')}
                                    className={`relative text-left rounded-xl border-2 p-3 transition-all ${iaChoiceMode === 'temas'
                                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200/50 shadow-sm'
                                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {iaChoiceMode === 'temas' && (
                                        <div className="absolute top-2 right-2">
                                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="font-bold text-sm text-slate-800 mb-0.5">Por temas específicos</div>
                                    <div className="text-xs text-slate-500 leading-snug">Enfocado en temas concretos</div>
                                </button>
                            </div>
                        </div>

                        {/* Topics Input */}
                        {iaChoiceMode === 'temas' && (
                            <div className="animate-in slide-in-from-top-2 duration-200 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Temas (separados por coma)</label>
                                <input
                                    value={iaChoiceTopics}
                                    onChange={e => setIaChoiceTopics(e.target.value)}
                                    className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-200 transition-all shadow-sm"
                                    placeholder="Ej: sinónimos, ortografía, lectura"
                                    autoFocus
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {temasPlantillas.slice(0, 5).map((tema, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setIaChoiceTopics(prev => {
                                                const current = prev ? prev.split(',').map(s => s.trim()).filter(Boolean) : [];
                                                if (!current.includes(tema)) return [...current, tema].join(', ');
                                                return prev;
                                            })}
                                            className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-sm"
                                        >
                                            + {tema}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nivel */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Dificultad</label>
                                <div className="flex rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                    {[
                                        { id: 'básico', label: 'Básico', color: 'blue' },
                                        { id: 'intermedio', label: 'Intermedio', color: 'emerald' },
                                        { id: 'avanzado', label: 'Avanzado', color: 'purple' }
                                    ].map((lvl) => (
                                        <button
                                            key={lvl.id}
                                            type="button"
                                            onClick={() => setIaNivel(lvl.id)}
                                            className={`flex-1 px-2 py-2 text-xs font-semibold capitalize transition-all ${iaNivel === lvl.id
                                                ? `bg-slate-100 text-slate-900`
                                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                                }`}
                                            style={{
                                                backgroundColor: iaNivel === lvl.id ? (lvl.id === 'básico' ? '#eff6ff' : lvl.id === 'intermedio' ? '#ecfdf5' : '#f3e8ff') : '',
                                                color: iaNivel === lvl.id ? (lvl.id === 'básico' ? '#1d4ed8' : lvl.id === 'intermedio' ? '#047857' : '#7e22ce') : ''
                                            }}
                                        >
                                            {lvl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Idioma */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Idioma</label>
                                <select
                                    value={iaIdioma}
                                    onChange={(e) => setIaIdioma(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:ring-emerald-200 shadow-sm"
                                >
                                    <option value="auto">Auto (según tema)</option>
                                    <option value="es">Español (MX)</option>
                                    <option value="en">Inglés (US)</option>
                                    <option value="mix">Mixto (ES/EN)</option>
                                </select>
                            </div>
                        </div>

                        {/* Cantidad & Distribución */}
                        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/60">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Configuración de Preguntas</label>
                                <select
                                    value={iaQuickCount}
                                    onChange={e => setIaQuickCount(Number(e.target.value))}
                                    className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none shadow-sm"
                                >
                                    {COUNT_OPTIONS.map(n => <option key={n} value={n}>{n} preguntas</option>)}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <CounterControl
                                    label="Opción Múltiple"
                                    value={iaCountMultiple}
                                    onDecrement={() => setIaCountMultiple(Math.max(0, iaCountMultiple - 1))}
                                    onIncrement={() => setIaCountMultiple(Math.min(MAX_IA, iaCountMultiple + 1))}
                                    max={MAX_IA}
                                />
                                <CounterControl
                                    label="Verdadero/Falso"
                                    value={iaCountVerdaderoFalso}
                                    onDecrement={() => setIaCountVerdaderoFalso(Math.max(0, iaCountVerdaderoFalso - 1))}
                                    onIncrement={() => setIaCountVerdaderoFalso(Math.min(MAX_IA, iaCountVerdaderoFalso + 1))}
                                    max={MAX_IA}
                                />
                                <CounterControl
                                    label="Respuesta Corta"
                                    value={iaCountCorta}
                                    onDecrement={() => setIaCountCorta(Math.max(0, iaCountCorta - 1))}
                                    onIncrement={() => setIaCountCorta(Math.min(MAX_IA, iaCountCorta + 1))}
                                    max={MAX_IA}
                                />
                                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-700">
                                    <span>Total preguntas</span>
                                    <span className={iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta > MAX_IA ? 'text-rose-600' : 'text-emerald-700'}>
                                        {iaCountMultiple + iaCountVerdaderoFalso + iaCountCorta} / {iaQuickCount} (aprox)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Params Toggle */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setIaShowAdvanced(!iaShowAdvanced)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 p-2 transition-colors group"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Brain className="h-3.5 w-3.5 group-hover:text-emerald-600 transition-colors" />
                                    <span>Parámetros avanzados de IA</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {iaShowAdvanced ? (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                    ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    )}
                                </div>
                            </button>
                            {iaShowAdvanced && (
                                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                                    <div className="text-xs">
                                        <div className="flex justify-between mb-1">
                                            <label className="font-semibold text-slate-700">Creatividad (Temperatura)</label>
                                            <span className="text-slate-500">{iaTemperature}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={iaTemperature}
                                            onChange={e => setIaTemperature(Number(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                            <span>Preciso</span>
                                            <span>Creativo</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Top‑P</label>
                                            <input
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={iaTopP}
                                                onChange={(e) => setIaTopP(e.target.value)}
                                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-emerald-200"
                                                placeholder="(vacío)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Top‑K</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min="1"
                                                step="1"
                                                value={iaTopK}
                                                onChange={(e) => setIaTopK(e.target.value)}
                                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-emerald-200"
                                                placeholder="(vacío)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1">Max tokens</label>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min="64"
                                                step="64"
                                                value={iaMaxTokens}
                                                onChange={(e) => setIaMaxTokens(e.target.value)}
                                                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-emerald-500 focus:ring-emerald-200"
                                                placeholder="(vacío)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {iaError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <p className="leading-relaxed">{iaError}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer - siempre visible */}
                    <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                            {cooldownMs > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Espera {Math.ceil(cooldownMs / 1000)}s
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                disabled={iaLoading}
                                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={iaLoading || cooldownMs > 0}
                                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {iaLoading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Generando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Generar Quiz</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS local: ocultar barra de scroll manteniendo scroll */}
            <style>{`
          .mqerk-hide-scrollbar {
            -ms-overflow-style: none; /* IE/Edge legacy */
            scrollbar-width: none; /* Firefox */
            scrollbar-color: transparent transparent; /* Firefox */
          }
          .mqerk-hide-scrollbar::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
          }
          .mqerk-hide-scrollbar::-webkit-scrollbar-thumb {
            background: transparent !important;
          }
          .mqerk-hide-scrollbar::-webkit-scrollbar-track {
            background: transparent !important;
          }

          /* Pantallas con poca altura: modal más compacto */
          @media (max-height: 720px) {
            .mqerk-quiz-ia-dialog {
              max-height: 80vh;
            }
          }
        `}</style>
        </>,
        document.body
    );
}