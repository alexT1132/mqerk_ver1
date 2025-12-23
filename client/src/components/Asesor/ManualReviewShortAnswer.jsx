import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';

/**
 * Componente para revisión manual de respuestas cortas por asesores
 * Muestra la calificación automática y permite cambiarla manualmente
 */
export default function ManualReviewShortAnswer({
    respuesta,
    pregunta,
    respuestaEsperada,
    tipo = 'simulacion', // 'simulacion' o 'quiz'
    onReviewComplete
}) {
    const [reviewing, setReviewing] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notas, setNotas] = useState('');

    // Determinar si requiere revisión
    const requiereRevision =
        respuesta.calificacion_status === 'manual_review' ||
        (respuesta.calificacion_confianza && respuesta.calificacion_confianza < 70);
    
    // Para simulaciones, determinar correcta basándose en calificacion_confianza cuando es revisión manual
    // calificacion_confianza = 100 significa correcta, 0 significa incorrecta (cuando es manual)
    const esCorrecta = respuesta.calificacion_metodo === 'manual' && tipo === 'simulacion'
        ? (respuesta.calificacion_confianza === 100)
        : (respuesta.correcta === 1);

    // Determinar color del badge según confianza
    const getBadgeColor = () => {
        if (respuesta.calificacion_metodo === 'manual') return 'bg-blue-100 text-blue-700 border-blue-300';
        if (respuesta.calificacion_status === 'pending') return 'bg-gray-100 text-gray-700 border-gray-300';
        if (requiereRevision) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        // Alta confianza (>= 90%): verde (muy seguro)
        if (respuesta.calificacion_confianza >= 90) return 'bg-green-100 text-green-700 border-green-300';
        // Confianza media (70-89%): amarillo claro (puede revisarse opcionalmente)
        if (respuesta.calificacion_confianza >= 70) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        // Baja confianza (< 70%): requiere revisión
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    };

    // Manejar cambio de calificación
    const handleChangeGrade = async (nuevaCalificacion) => {
        if (reviewing) return;

        // Validar que tenemos un ID válido
        if (!respuesta.id) {
            console.error('[ManualReview] No se proporcionó ID de respuesta:', respuesta);
            alert('Error: No se encontró el ID de la respuesta. Por favor, recarga la página.');
            return;
        }

        setReviewing(true);

        try {
            console.log('[ManualReview] Enviando revisión manual:', {
                tipo,
                id_respuesta: respuesta.id,
                correcta: nuevaCalificacion,
                notas: notas.trim() || null
            });

            const response = await fetch(`/api/grading/manual-review/${tipo}/${respuesta.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    correcta: nuevaCalificacion,
                    notas: notas.trim() || null
                })
            });

            if (!response.ok) {
                // Intentar obtener el mensaje de error del servidor
                let errorMessage = 'Error al actualizar calificación';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    console.error('[ManualReview] Error del servidor:', errorData);
                } catch (e) {
                    console.error('[ManualReview] Error al parsear respuesta:', response.status, response.statusText);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('[ManualReview] ✅ Calificación actualizada:', data);

            // Notificar al componente padre con los datos actualizados
            if (onReviewComplete) {
                // Pasar los datos completos para que el componente padre pueda actualizar el estado
                onReviewComplete({
                    ...data.data,
                    // Asegurar que los campos estén presentes
                    calificacion_status: data.data.calificacion_status || 'graded',
                    calificacion_metodo: data.data.calificacion_metodo || 'manual',
                    calificacion_confianza: data.data.calificacion_confianza || data.data.confianza || (nuevaCalificacion ? 100 : 0)
                });
            }

            // Cerrar notas si estaban abiertas
            setShowNotes(false);
            setNotas('');

        } catch (error) {
            console.error('Error al cambiar calificación:', error);
            alert(`Error al actualizar la calificación: ${error.message || 'Error desconocido'}. Intenta de nuevo.`);
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div className={`rounded-lg border-2 p-4 ${requiereRevision ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
            {/* Pregunta y respuestas */}
            <div className="space-y-2 mb-3">
                <p className="font-semibold text-gray-900">{pregunta}</p>
                <div className="text-sm space-y-1">
                    <p className="text-gray-600">
                        <span className="font-medium">Esperada:</span> {respuestaEsperada}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-medium">Estudiante:</span> {respuesta.valor_texto || respuesta.texto_libre || '(Sin respuesta)'}
                    </p>
                </div>
            </div>

            {/* Estado de calificación */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                {/* Badge de resultado (Correcta/Incorrecta) - MÁS VISIBLE */}
                {/* Mostrar solo si ya fue calificada (no pendiente ni requiere revisión manual) */}
                {respuesta.calificacion_status === 'graded' && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-bold shadow-sm ${
                        esCorrecta 
                            ? 'bg-green-100 text-green-800 border-green-400' 
                            : 'bg-red-100 text-red-800 border-red-400'
                    }`}>
                        {esCorrecta ? (
                            <>
                                <span className="text-lg">✓</span>
                                <span>CORRECTA</span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg">✗</span>
                                <span>INCORRECTA</span>
                            </>
                        )}
                    </span>
                )}

                {/* Badge de método y confianza */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${getBadgeColor()}`}>
                    {respuesta.calificacion_metodo === 'manual' && '👤'}
                    {(() => {
                        // Si requiere revisión y NO es manual, mostrar "Requiere revisión" con icono de alerta
                        if (requiereRevision && respuesta.calificacion_metodo !== 'manual') {
                            return (
                                <>
                                    <AlertTriangle className="w-3 h-3" />
                                    <span className="capitalize">Requiere revisión</span>
                                    {respuesta.calificacion_confianza != null && (
                                        <span>• {respuesta.calificacion_confianza}%</span>
                                    )}
                                </>
                            );
                        }
                        // Si es manual
                        if (respuesta.calificacion_metodo === 'manual') {
                            return (
                                <>
                                    <span className="capitalize">Manual</span>
                                    {respuesta.calificacion_confianza != null && (
                                        <span>• {respuesta.calificacion_confianza}%</span>
                                    )}
                                </>
                            );
                        }
                        // Si es automática (IA) y ya está calificada (no requiere revisión)
                        if (respuesta.calificacion_metodo === 'ia') {
                            return (
                                <>
                                    <span>🤖</span>
                                    <span className="capitalize">Automática (IA)</span>
                                    {respuesta.calificacion_confianza != null && (
                                        <span>• {respuesta.calificacion_confianza}%</span>
                                    )}
                                </>
                            );
                        }
                        // Si es exacta
                        if (respuesta.calificacion_metodo === 'exacta') {
                            return (
                                <>
                                    <span>✓</span>
                                    <span className="capitalize">Exacta</span>
                                    {respuesta.calificacion_confianza != null && (
                                        <span>• {respuesta.calificacion_confianza}%</span>
                                    )}
                                </>
                            );
                        }
                        // Si es palabras clave
                        if (respuesta.calificacion_metodo === 'palabras_clave') {
                            return (
                                <>
                                    <span>🔤</span>
                                    <span className="capitalize">Palabras clave</span>
                                    {respuesta.calificacion_confianza != null && (
                                        <span>• {respuesta.calificacion_confianza}%</span>
                                    )}
                                </>
                            );
                        }
                        // Si está pendiente
                        if (respuesta.calificacion_status === 'pending') {
                            return (
                                <>
                                    <span className="capitalize">Pendiente</span>
                                </>
                            );
                        }
                        // Default
                        return (
                            <>
                                <span className="capitalize">Automática</span>
                                {respuesta.calificacion_confianza != null && (
                                    <span>• {respuesta.calificacion_confianza}%</span>
                                )}
                            </>
                        );
                    })()}
                </span>

                {/* Indicador de revisión manual previa */}
                {respuesta.revisada_por && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        ✓ Revisado manualmente
                    </span>
                )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => handleChangeGrade(true)}
                    disabled={reviewing || (esCorrecta && respuesta.calificacion_metodo === 'manual')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${esCorrecta && respuesta.calificacion_metodo === 'manual'
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-600 hover:text-white hover:border-green-600'
                        }`}
                >
                    {reviewing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4" />
                    )}
                    Correcta
                </button>

                <button
                    onClick={() => handleChangeGrade(false)}
                    disabled={reviewing || (!esCorrecta && respuesta.calificacion_metodo === 'manual')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${!esCorrecta && respuesta.calificacion_metodo === 'manual'
                            ? 'bg-red-600 text-white cursor-default'
                            : 'bg-red-50 text-red-700 border-2 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600'
                        }`}
                >
                    {reviewing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <XCircle className="w-4 h-4" />
                    )}
                    Incorrecta
                </button>

                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    {showNotes ? 'Ocultar' : 'Agregar'} notas
                </button>
            </div>

            {/* Campo de notas */}
            {showNotes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas de revisión (opcional)
                    </label>
                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Ej: La respuesta es válida aunque usa sinónimos..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}

            {/* Notas previas de revisión */}
            {respuesta.notas_revision && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">Notas de revisión anterior:</p>
                    <p className="text-sm text-gray-700 italic">"{respuesta.notas_revision}"</p>
                </div>
            )}
        </div>
    );
}
