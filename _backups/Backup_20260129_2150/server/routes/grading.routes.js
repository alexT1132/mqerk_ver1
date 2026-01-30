import { Router } from 'express';
import { getGradingStatus } from '../services/backgroundGrader.js';
import gradingQueue from '../services/gradingQueue.js';
import db from '../db.js';

const router = Router();

/**
 * GET /api/grading/status/:tipo/:id_sesion
 * Obtiene el estado de calificación de una sesión
 */
router.get('/status/:tipo/:id_sesion', async (req, res) => {
    try {
        const { tipo, id_sesion } = req.params;

        // Validar tipo
        if (tipo !== 'simulacion' && tipo !== 'quiz') {
            return res.status(400).json({
                error: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
            });
        }

        const status = await getGradingStatus(tipo, id_sesion);

        res.json({ data: status });
    } catch (error) {
        console.error('[GradingAPI] Error obteniendo estado:', error);
        res.status(500).json({
            error: 'Error al obtener estado de calificación',
            message: error.message
        });
    }
});

/**
 * GET /api/grading/pending/:tipo/:id_intento
 * Obtiene el número de respuestas pendientes de calificación para un intento
 */
router.get('/pending/:tipo/:id_intento', async (req, res) => {
    try {
        const { tipo, id_intento } = req.params;

        // Validar tipo
        if (tipo !== 'simulacion' && tipo !== 'quiz') {
            return res.status(400).json({
                error: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
            });
        }

        let query;
        if (tipo === 'simulacion') {
            // Obtener id_sesion desde simulaciones_intentos
            const [[intento]] = await db.query(
                'SELECT id_simulacion, id_estudiante FROM simulaciones_intentos WHERE id = ?',
                [id_intento]
            );
            if (!intento) {
                return res.status(404).json({ error: 'Intento no encontrado' });
            }
            // Obtener la sesión más reciente para este intento
            const [[sesion]] = await db.query(
                'SELECT id FROM simulaciones_sesiones WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY finished_at DESC, id DESC LIMIT 1',
                [intento.id_simulacion, intento.id_estudiante]
            );
            if (!sesion) {
                return res.json({ data: { pending: 0, total: 0 } });
            }
            query = `
                SELECT 
                    COUNT(*) as pending,
                    (SELECT COUNT(*) FROM simulaciones_respuestas WHERE id_sesion = ? AND id_pregunta IN (
                        SELECT id FROM simulaciones_preguntas WHERE id_simulacion = ? AND tipo = 'respuesta_corta'
                    )) as total
                FROM simulaciones_respuestas 
                WHERE id_sesion = ? 
                AND calificacion_status = 'pending'
                AND id_pregunta IN (
                    SELECT id FROM simulaciones_preguntas WHERE id_simulacion = ? AND tipo = 'respuesta_corta'
                )
            `;
            const [[result]] = await db.query(query, [
                sesion.id, intento.id_simulacion, sesion.id, intento.id_simulacion
            ]);
            res.json({ data: { pending: Number(result.pending) || 0, total: Number(result.total) || 0 } });
        } else {
            // Para quizzes, obtener id_sesion desde quizzes_intentos
            const [[intento]] = await db.query(
                'SELECT id_quiz, id_estudiante FROM quizzes_intentos WHERE id = ?',
                [id_intento]
            );
            if (!intento) {
                return res.status(404).json({ error: 'Intento no encontrado' });
            }
            // Obtener la sesión más reciente para este intento
            const [[sesion]] = await db.query(
                'SELECT id FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? ORDER BY finished_at DESC, id DESC LIMIT 1',
                [intento.id_quiz, intento.id_estudiante]
            );
            if (!sesion) {
                return res.json({ data: { pending: 0, total: 0 } });
            }
            query = `
                SELECT 
                    COUNT(*) as pending,
                    (SELECT COUNT(*) FROM quizzes_sesiones_respuestas WHERE id_sesion = ? AND id_pregunta IN (
                        SELECT id FROM quizzes_preguntas WHERE id_quiz = ? AND tipo = 'respuesta_corta'
                    )) as total
                FROM quizzes_sesiones_respuestas 
                WHERE id_sesion = ? 
                AND calificacion_status = 'pending'
                AND id_pregunta IN (
                    SELECT id FROM quizzes_preguntas WHERE id_quiz = ? AND tipo = 'respuesta_corta'
                )
            `;
            const [[result]] = await db.query(query, [
                sesion.id, intento.id_quiz, sesion.id, intento.id_quiz
            ]);
            res.json({ data: { pending: Number(result.pending) || 0, total: Number(result.total) || 0 } });
        }
    } catch (error) {
        console.error('[GradingAPI] Error obteniendo respuestas pendientes:', error);
        res.status(500).json({
            error: 'Error al obtener respuestas pendientes',
            message: error.message
        });
    }
});

/**
 * GET /api/grading/queue/status
 * Obtiene el estado actual de la cola de calificación
 */
router.get('/queue/status', (req, res) => {
    try {
        const status = gradingQueue.getStatus();
        res.json({ data: status });
    } catch (error) {
        console.error('[GradingAPI] Error obteniendo estado de cola:', error);
        res.status(500).json({
            error: 'Error al obtener estado de cola',
            message: error.message
        });
    }
});

/**
 * GET /api/grading/pending/:tipo/:id_simulacion_quiz/:id_estudiante
 * Obtiene el número de respuestas pendientes de calificación para el INTENTO OFICIAL (primer intento)
 */
router.get('/pending/:tipo/:id_simulacion_quiz/:id_estudiante', async (req, res) => {
    try {
        const { tipo, id_simulacion_quiz, id_estudiante } = req.params;

        // Validar tipo
        if (tipo !== 'simulacion' && tipo !== 'quiz') {
            return res.status(400).json({
                error: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
            });
        }

        if (tipo === 'simulacion') {
            // Obtener el intento oficial (intent_number = 1)
            const [[intentoOficial]] = await db.query(
                'SELECT id FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ? AND intent_number = 1 LIMIT 1',
                [id_simulacion_quiz, id_estudiante]
            );
            if (!intentoOficial) {
                return res.json({ data: { pending: 0, total: 0 } });
            }
            
            // Para simulaciones, necesitamos encontrar la sesión asociada al primer intento
            // Como no hay relación directa, buscamos la sesión más antigua (primera finalizada)
            const [[sesion]] = await db.query(
                'SELECT id FROM simulaciones_sesiones WHERE id_simulacion = ? AND id_estudiante = ? AND finished_at IS NOT NULL ORDER BY finished_at ASC, id ASC LIMIT 1',
                [id_simulacion_quiz, id_estudiante]
            );
            if (!sesion) {
                return res.json({ data: { pending: 0, total: 0 } });
            }
            
            // Contar respuestas pendientes de tipo respuesta_corta SOLO del intento oficial
            const [[result]] = await db.query(`
                SELECT 
                    COUNT(*) as pending,
                    (SELECT COUNT(*) FROM simulaciones_respuestas sr 
                     JOIN simulaciones_preguntas sp ON sp.id = sr.id_pregunta 
                     WHERE sr.id_sesion = ? AND sp.tipo = 'respuesta_corta') as total
                FROM simulaciones_respuestas sr
                JOIN simulaciones_preguntas sp ON sp.id = sr.id_pregunta
                WHERE sr.id_sesion = ? 
                AND sp.tipo = 'respuesta_corta'
                AND sr.calificacion_status = 'pending'
            `, [sesion.id, sesion.id]);
            res.json({ data: { pending: Number(result.pending) || 0, total: Number(result.total) || 0 } });
        } else {
            // Para quizzes, obtener la sesión del intento oficial (intento_num = 1)
            const [[sesion]] = await db.query(
                'SELECT id FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? AND intento_num = 1 AND estado = "finalizado" LIMIT 1',
                [id_simulacion_quiz, id_estudiante]
            );
            if (!sesion) {
                return res.json({ data: { pending: 0, total: 0 } });
            }
            
            // Contar respuestas pendientes de tipo respuesta_corta SOLO del intento oficial
            const [[result]] = await db.query(`
                SELECT 
                    COUNT(*) as pending,
                    (SELECT COUNT(*) FROM quizzes_sesiones_respuestas qsr 
                     JOIN quizzes_preguntas qp ON qp.id = qsr.id_pregunta 
                     WHERE qsr.id_sesion = ? AND qp.tipo = 'respuesta_corta') as total
                FROM quizzes_sesiones_respuestas qsr
                JOIN quizzes_preguntas qp ON qp.id = qsr.id_pregunta
                WHERE qsr.id_sesion = ? 
                AND qp.tipo = 'respuesta_corta'
                AND qsr.calificacion_status = 'pending'
            `, [sesion.id, sesion.id]);
            res.json({ data: { pending: Number(result.pending) || 0, total: Number(result.total) || 0 } });
        }
    } catch (error) {
        console.error('[GradingAPI] Error obteniendo respuestas pendientes:', error);
        res.status(500).json({
            error: 'Error al obtener respuestas pendientes',
            message: error.message
        });
    }
});

/**
 * PUT /api/grading/manual-review/:tipo/:id_respuesta
 * Permite al asesor revisar y cambiar manualmente la calificación de una respuesta
 */
router.put('/manual-review/:tipo/:id_respuesta', async (req, res) => {
    try {
        const { tipo, id_respuesta } = req.params;
        const { correcta, notas } = req.body;

        // Validar tipo
        if (tipo !== 'simulacion' && tipo !== 'quiz') {
            return res.status(400).json({
                error: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
            });
        }

        // Validar que se proporcione la calificación
        if (correcta === undefined || correcta === null) {
            return res.status(400).json({
                error: 'El campo "correcta" es requerido (true/false)'
            });
        }

        // Obtener ID del usuario (asesor) desde la sesión
        const asesor_id = req.user?.id || null;

        const tabla = tipo === 'simulacion'
            ? 'simulaciones_respuestas'
            : 'quizzes_sesiones_respuestas';

        // Para simulaciones, no tenemos columna 'correcta', solo actualizamos campos de calificación
        // Para quizzes, sí tenemos columna 'correcta'
        const tieneColumnaCorrecta = tipo === 'quiz';
        
        // Construir query dinámicamente según el tipo
        let query;
        let params;
        
        if (tieneColumnaCorrecta) {
            // Quiz: incluir columna correcta
            query = `
                UPDATE ${tabla}
                SET 
                    correcta = ?,
                    calificacion_status = 'graded',
                    calificacion_metodo = 'manual',
                    calificacion_confianza = 100,
                    calificada_at = NOW(),
                    revisada_por = ?,
                    notas_revision = ?,
                    revisada_at = NOW()
                WHERE id = ?
            `;
            params = [
                correcta ? 1 : 0,
                asesor_id,
                notas || null,
                id_respuesta
            ];
        } else {
            // Simulación: NO incluir columna correcta (no existe en la tabla)
            // Usar calificacion_confianza para almacenar: 100 = correcta, 0 = incorrecta (cuando es revisión manual)
            query = `
                UPDATE ${tabla}
                SET 
                    calificacion_status = 'graded',
                    calificacion_metodo = 'manual',
                    calificacion_confianza = ?,
                    calificada_at = NOW(),
                    revisada_por = ?,
                    notas_revision = ?,
                    revisada_at = NOW()
                WHERE id = ?
            `;
            params = [
                correcta ? 100 : 0, // 100 = correcta, 0 = incorrecta para revisión manual
                asesor_id,
                notas || null,
                id_respuesta
            ];
        }

        // Verificar que la respuesta existe antes de actualizar
        const [[respuestaExistente]] = await db.query(
            `SELECT id, id_sesion FROM ${tabla} WHERE id = ?`,
            [id_respuesta]
        );

        if (!respuestaExistente) {
            return res.status(404).json({
                error: 'Respuesta no encontrada',
                message: `No se encontró la respuesta con ID ${id_respuesta} en ${tabla}`
            });
        }

        // Ejecutar la actualización
        await db.query(query, params);

        // Obtener la respuesta actualizada
        const [[respuesta]] = await db.query(
            `SELECT * FROM ${tabla} WHERE id = ?`,
            [id_respuesta]
        );

        if (!respuesta) {
            return res.status(500).json({
                error: 'Error al obtener respuesta actualizada',
                message: 'La respuesta se actualizó pero no se pudo recuperar'
            });
        }

        // Recalcular puntaje de la sesión si es necesario
        if (respuesta.id_sesion) {
            try {
                await recalcularPuntajeSesion(tipo, respuesta.id_sesion);
            } catch (recalcError) {
                console.error('[GradingAPI] Error al recalcular puntaje:', recalcError);
                // No fallar la operación si el recálculo falla, solo loguear
            }
        }

        console.log(`[GradingAPI] ✅ Revisión manual: ${tipo} #${id_respuesta} → ${correcta ? 'CORRECTA' : 'INCORRECTA'} (Asesor: ${asesor_id})`);

        // Para simulaciones, determinar correcta desde calificacion_confianza (100 = correcta, 0 = incorrecta)
        // Para quizzes, usar la columna correcta directamente
        const correctaValue = tipo === 'simulacion' 
            ? (respuesta?.calificacion_confianza === 100 ? 1 : 0)
            : (correcta ? 1 : 0);

        res.json({
            success: true,
            data: {
                id: id_respuesta,
                correcta: correctaValue,
                metodo: 'manual',
                confianza: tipo === 'simulacion' ? (correcta ? 100 : 0) : 100,
                revisada_por: asesor_id,
                notas: notas || null,
                calificacion_status: 'graded',
                calificacion_metodo: 'manual',
                calificacion_confianza: tipo === 'simulacion' ? (correcta ? 100 : 0) : 100
            }
        });

    } catch (error) {
        console.error('[GradingAPI] Error en revisión manual:', error);
        console.error('[GradingAPI] Stack trace:', error.stack);
        console.error('[GradingAPI] Detalles:', {
            tipo,
            id_respuesta,
            correcta,
            tabla: tipo === 'simulacion' ? 'simulaciones_respuestas' : 'quizzes_sesiones_respuestas'
        });
        
        // Proporcionar mensaje de error más detallado
        let errorMessage = error.message || 'Error desconocido';
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = `Error de base de datos: columna no encontrada. ${error.sqlMessage || error.message}`;
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = `Error de base de datos: tabla no encontrada. ${error.sqlMessage || error.message}`;
        }
        
        res.status(500).json({
            error: 'Error al procesar revisión manual',
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? {
                code: error.code,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            } : undefined
        });
    }
});

/**
 * Recalcula el puntaje de una sesión después de una revisión manual
 */
async function recalcularPuntajeSesion(tipo, id_sesion) {
    try {
        if (tipo === 'simulacion') {
            // Para simulaciones, recalcular en simulaciones_intentos
            // NOTA: simulaciones_respuestas NO tiene columna 'correcta', debemos calcularla
            const [[sesion]] = await db.query(
                'SELECT id_simulacion, id_estudiante FROM simulaciones_sesiones WHERE id = ?',
                [id_sesion]
            );

            if (!sesion) return;

            // Obtener todas las preguntas con sus opciones correctas
            const [preguntas] = await db.query(
                `SELECT p.id, p.tipo 
                 FROM simulaciones_preguntas p 
                 WHERE p.id_simulacion = ?`,
                [sesion.id_simulacion]
            );

            // Obtener opciones correctas por pregunta
            const [opcionesCorrectas] = await db.query(
                `SELECT id_pregunta, GROUP_CONCAT(id) as ids_correctas
                 FROM simulaciones_preguntas_opciones
                 WHERE es_correcta = 1
                 GROUP BY id_pregunta`
            );
            const correctasMap = new Map();
            opcionesCorrectas.forEach(o => {
                correctasMap.set(o.id_pregunta, o.ids_correctas ? o.ids_correctas.split(',').map(Number) : []);
            });

            // Obtener respuestas de la sesión (sin columna correcta)
            const [respuestas] = await db.query(
                `SELECT id_pregunta, id_opcion, texto_libre, calificacion_status, calificacion_metodo, calificacion_confianza
                 FROM simulaciones_respuestas 
                 WHERE id_sesion = ?`,
                [id_sesion]
            );

            // Agrupar respuestas por pregunta
            const respuestasPorPregunta = new Map();
            respuestas.forEach(r => {
                const arr = respuestasPorPregunta.get(r.id_pregunta) || [];
                arr.push(r);
                respuestasPorPregunta.set(r.id_pregunta, arr);
            });

            let correctas = 0;
            const total = preguntas.length;

            // Calcular correctas por pregunta
            for (const p of preguntas) {
                const resps = respuestasPorPregunta.get(p.id) || [];
                const correctasIds = correctasMap.get(p.id) || [];
                
                let esCorrecta = false;
                
                if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
                    // Para opción múltiple: verificar si la opción seleccionada es correcta
                    const seleccionada = resps.find(r => r.id_opcion != null)?.id_opcion;
                    esCorrecta = seleccionada != null && correctasIds.includes(Number(seleccionada));
                } else if (p.tipo === 'multi_respuesta') {
                    // Para multi-respuesta: todas las correctas seleccionadas y ninguna incorrecta
                    const seleccionadas = resps.filter(r => r.id_opcion != null).map(r => Number(r.id_opcion));
                    esCorrecta = seleccionadas.length === correctasIds.length && 
                                 seleccionadas.every(id => correctasIds.includes(id));
                } else if (p.tipo === 'respuesta_corta') {
                    // Para respuesta corta: si fue revisada manualmente, usar calificacion_confianza
                    // 100 = correcta, < 100 = incorrecta (o usar lógica de calificación)
                    const respuestaCorta = resps.find(r => r.texto_libre != null);
                    if (respuestaCorta) {
                        // Si fue revisada manualmente, calificacion_confianza = 100 significa correcta
                        if (respuestaCorta.calificacion_metodo === 'manual') {
                            esCorrecta = respuestaCorta.calificacion_confianza === 100;
                        } else {
                            // Si no fue revisada manualmente, usar la lógica de calificación automática
                            // calificacion_confianza >= 70 generalmente significa correcta
                            esCorrecta = respuestaCorta.calificacion_confianza != null && respuestaCorta.calificacion_confianza >= 70;
                        }
                    }
                }
                
                if (esCorrecta) correctas++;
            }

            const puntaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

            // Actualizar el intento correspondiente
            await db.query(
                'UPDATE simulaciones_intentos SET puntaje = ?, correctas = ? WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY id DESC LIMIT 1',
                [puntaje, correctas, sesion.id_simulacion, sesion.id_estudiante]
            );

            console.log(`[recalcularPuntaje] Simulación sesión ${id_sesion}: ${correctas}/${total} = ${puntaje}%`);

        } else if (tipo === 'quiz') {
            // Para quizzes, el puntaje se recalcula en la tabla quizzes_sesiones
            const [[sesion]] = await db.query(
                'SELECT id_quiz FROM quizzes_sesiones WHERE id = ?',
                [id_sesion]
            );

            if (!sesion) return;

            // Obtener todas las preguntas
            const [preguntas] = await db.query(
                'SELECT id, puntos FROM quizzes_preguntas WHERE id_quiz = ?',
                [sesion.id_quiz]
            );

            // Obtener respuestas de la sesión
            const [respuestas] = await db.query(
                'SELECT id_pregunta, correcta FROM quizzes_sesiones_respuestas WHERE id_sesion = ?',
                [id_sesion]
            );

            let puntosAcumulados = 0;
            let puntosTotales = 0;

            for (const p of preguntas) {
                puntosTotales += p.puntos || 1;
                const respuesta = respuestas.find(r => r.id_pregunta === p.id);
                if (respuesta && respuesta.correcta === 1) {
                    puntosAcumulados += p.puntos || 1;
                }
            }

            const puntaje = puntosTotales > 0 ? Math.round((puntosAcumulados / puntosTotales) * 100) : 0;

            // Actualizar puntaje en la sesión (si existe columna puntaje)
            await db.query(
                'UPDATE quizzes_sesiones SET puntaje = ? WHERE id = ?',
                [puntaje, id_sesion]
            ).catch(() => {
                // Si no existe la columna, no hacer nada
                console.log('[recalcularPuntaje] Columna puntaje no existe en quizzes_sesiones');
            });

            console.log(`[recalcularPuntaje] Quiz sesión ${id_sesion}: ${puntosAcumulados}/${puntosTotales} = ${puntaje}%`);
        }

    } catch (error) {
        console.error('[recalcularPuntaje] Error:', error);
    }
}

export default router;
