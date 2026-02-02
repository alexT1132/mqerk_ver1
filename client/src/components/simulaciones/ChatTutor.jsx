import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askQuickTutor } from '../../service/quizAnalysisService';

const ChatTutor = ({
    analysisContext,
    studentName,
    onClose,
    onUsageUpdate,
    aiUsage,
    isFallback,
    analysisSource
}) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    // Referencia para el auto-scroll
    const scrollRef = useRef(null);

    // Efecto para bajar el scroll automáticamente al recibir respuesta
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [response, loading]);

    const handleSend = async () => {
        const cleanQuery = query.trim();
        if (!cleanQuery || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await askQuickTutor(analysisContext, cleanQuery, studentName);
            setResponse(res);
            setQuery(''); // Limpiamos el input solo si hubo éxito

            // Notificar al padre para actualizar cuotas
            if (onUsageUpdate) onUsageUpdate();
        } catch (err) {
            console.error("Error tutor:", err);
            setError('No pude obtener una respuesta. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Verificar bloqueo (cuota o fallback)
    const isBlocked = (aiUsage?.remaining <= 0) || isFallback;

    return (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2">

            {/* Cabecera del Chat */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-lg">
                        <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-none">Tutor IA Personalizado</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">Soporte de aprendizaje</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    title="Cerrar chat"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Área de Visualización de Respuesta */}
            {(response || loading || error) && (
                <div
                    ref={scrollRef}
                    className="p-4 max-h-[300px] overflow-y-auto bg-slate-50/50 space-y-4"
                >
                    {response && (
                        <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm text-sm text-slate-700 animate-in zoom-in-95 duration-200">
                            <div className="prose prose-sm prose-indigo max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] font-medium text-slate-400">Respuesta basada en tu desempeño</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">IA</span>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-slate-100 w-fit animate-pulse">
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            <span className="text-xs text-slate-500 font-medium">El tutor está redactando...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-between bg-red-50 border border-red-100 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-xs text-red-700 font-medium">{error}</span>
                            </div>
                            <button
                                onClick={handleSend}
                                className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 font-bold"
                            >
                                <RefreshCw className="w-3 h-3" /> Reintentar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Área de Entrada de Texto */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative group">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ej: Explícame por qué fallé en la pregunta sobre fracciones..."
                        className={`w-full text-sm rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 min-h-[90px] pr-12 resize-none py-3 px-4 transition-all ${isBlocked ? 'opacity-20 select-none' : 'opacity-100'
                            }`}
                        disabled={isBlocked || loading}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || loading || isBlocked}
                        className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-0 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        title="Enviar pregunta"
                    >
                        <Send className="w-4 h-4" />
                    </button>

                    {/* Overlay de Bloqueo (Cuota o Fallback) */}
                    {isBlocked && (
                        <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/40 flex flex-col items-center justify-center text-center p-4 rounded-xl">
                            <div className="bg-amber-50 p-2 rounded-full mb-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Tutor en pausa</p>
                            <p className="text-xs text-slate-500 max-w-[200px]">
                                {aiUsage?.remaining <= 0
                                    ? 'Has alcanzado el límite de consultas diarias.'
                                    : 'Esta función requiere conexión a internet estable.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer del input */}
                <div className="mt-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <MessageCircle className="w-3 h-3" />
                        <span className="text-[10px]">Escribe tu duda de forma específica</span>
                    </div>
                    {aiUsage && (
                        <span className={`text-[10px] font-bold ${aiUsage.remaining < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                            Consultas: {aiUsage.remaining} restantes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatTutor);