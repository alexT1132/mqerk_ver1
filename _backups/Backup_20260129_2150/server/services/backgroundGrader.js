/**
 * Servicio de calificación en segundo plano
 * Procesa respuestas cortas usando el sistema híbrido de 3 niveles
 */

import db from '../db.js';
import {
    normalizeText,
    extractKeywords,
    calculateKeywordMatch,
    compareExact
} from '../utils/textComparison.js';
import fetch from 'node-fetch';

/**
 * Califica una respuesta corta usando IA (Nivel 3)
 */
async function calificarConIA(pregunta, respuestaEsperada, respuestaEstudiante) {
    try {
        const prompt = `Eres un profesor calificando una respuesta corta. Analiza si la respuesta del estudiante es correcta.

Pregunta: ${pregunta}
Respuesta esperada: ${respuestaEsperada}
Respuesta del estudiante: ${respuestaEstudiante}

Responde SOLO con una de estas opciones:
- CORRECTA: Si la respuesta es correcta, equivalente semánticamente, o contiene la información esencial aunque no esté redactada exactamente igual. Acepta sinónimos y variaciones de redacción. Sé generoso: si demuestra comprensión del concepto, marca CORRECTA.
- PARCIAL: Si la respuesta contiene información relevante pero está incompleta, tiene errores menores, o solo cubre parte de lo esperado. Úsalo solo cuando la respuesta tenga valor parcial pero no sea completamente correcta.
- INCORRECTA: Si la respuesta es incorrecta, no relacionada con la pregunta, o muestra un malentendido fundamental del concepto.

IMPORTANTE: Sé generoso con "CORRECTA". Si el estudiante demuestra comprensión del concepto aunque use palabras diferentes, marca CORRECTA. Solo usa PARCIAL cuando realmente falte información importante o haya errores conceptuales menores.

Responde solo con una palabra (CORRECTA, PARCIAL o INCORRECTA).`;

        const model = process.env.GEMINI_CALIFICACION_MODEL || 'gemini-2.0-flash-exp';
        const apiKey = process.env.GEMINI_API_KEY_CALIFICACION_1 || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('No API key available for grading');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 10,
                topP: 0.95
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[BackgroundGrader] Error de IA:', errorData);
            throw new Error('Error al calificar con IA');
        }

        const data = await response.json();
        const iaResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';

        let correcta = false;
        let confianza = 50;

        if (iaResponse.includes('CORRECTA')) {
            correcta = true;
            confianza = 90;
        } else if (iaResponse.includes('PARCIAL')) {
            // Respuesta parcialmente correcta: la IA la considera válida pero no perfecta
            // Le damos 75% de confianza para que no requiera revisión manual automáticamente
            // pero el asesor puede revisarla si lo desea (aparecerá con badge amarillo si < 80%)
            correcta = true;
            confianza = 75;
        } else if (iaResponse.includes('INCORRECTA')) {
            correcta = false;
            confianza = 90;
        } else {
            // Respuesta inesperada de la IA
            return {
                correcta: false,
                confianza: 50,
                metodo: 'revisar',
                status: 'manual_review'
            };
        }

        // Umbral ajustado: >= 70% = calificada automáticamente, < 70% = requiere revisión manual
        // Esto significa que respuestas "PARCIAL" (75%) se califican automáticamente como correctas
        // pero aparecerán con badge amarillo en la UI si confianza < 80% (para indicar que pueden revisarse)
        return {
            correcta,
            confianza,
            metodo: 'ia',
            status: confianza >= 70 ? 'graded' : 'manual_review'
        };

    } catch (error) {
        console.error('[BackgroundGrader] Error en calificación IA:', error);
        return {
            correcta: false,
            confianza: 50,
            metodo: 'revisar',
            status: 'manual_review'
        };
    }
}

/**
 * Procesa una respuesta corta con el sistema híbrido de 3 niveles
 */
export async function processShortAnswer(item) {
    const { id_respuesta, tipo, pregunta, respuesta_esperada, respuesta_estudiante } = item;

    console.log(`[BackgroundGrader] 🔍 Procesando ${tipo} #${id_respuesta}`);

    let resultado = {
        correcta: false,
        confianza: 0,
        metodo: 'revisar',
        status: 'manual_review'
    };

    try {
        // NIVEL 1: Comparación exacta (normalizada)
        const exactMatch = compareExact(respuesta_esperada, respuesta_estudiante);
        if (exactMatch) {
            resultado = {
                correcta: true,
                confianza: 100,
                metodo: 'exacta',
                status: 'graded'
            };
            console.log(`[BackgroundGrader] ✅ Nivel 1 (Exacta): ${tipo} #${id_respuesta}`);
        } else {
            // NIVEL 2: Coincidencia de palabras clave
            const keywordMatch = calculateKeywordMatch(respuesta_esperada, respuesta_estudiante);

            if (keywordMatch >= 0.7) {
                // 70%+ de palabras clave → correcta
                resultado = {
                    correcta: true,
                    confianza: Math.round(keywordMatch * 100),
                    metodo: 'palabras_clave',
                    status: 'graded'
                };
                console.log(`[BackgroundGrader] ✅ Nivel 2 (Palabras clave ${Math.round(keywordMatch * 100)}%): ${tipo} #${id_respuesta}`);
            } else if (keywordMatch < 0.3) {
                // <30% de palabras clave → incorrecta
                resultado = {
                    correcta: false,
                    confianza: Math.round((1 - keywordMatch) * 100),
                    metodo: 'palabras_clave',
                    status: 'graded'
                };
                console.log(`[BackgroundGrader] ❌ Nivel 2 (Palabras clave ${Math.round(keywordMatch * 100)}%): ${tipo} #${id_respuesta}`);
            } else {
                // NIVEL 3: IA (casos dudosos 30-70%)
                console.log(`[BackgroundGrader] 🤖 Nivel 3 (IA): ${tipo} #${id_respuesta}`);
                resultado = await calificarConIA(pregunta, respuesta_esperada, respuesta_estudiante);
            }
        }

        // Actualizar la base de datos con el resultado
        await updateGradingResult(id_respuesta, tipo, resultado);

        return resultado;

    } catch (error) {
        console.error(`[BackgroundGrader] Error procesando ${tipo} #${id_respuesta}:`, error);

        // En caso de error, marcar para revisión manual
        resultado = {
            correcta: false,
            confianza: 0,
            metodo: 'error',
            status: 'manual_review'
        };

        try {
            await updateGradingResult(id_respuesta, tipo, resultado);
        } catch (updateError) {
            console.error(`[BackgroundGrader] Error actualizando resultado:`, updateError);
        }

        throw error;
    }
}

/**
 * Actualiza el resultado de calificación en la base de datos
 */
async function updateGradingResult(id_respuesta, tipo, resultado) {
    const { correcta, confianza, metodo, status } = resultado;

    const tabla = tipo === 'simulacion'
        ? 'simulaciones_respuestas'
        : 'quizzes_sesiones_respuestas';

    // Para simulaciones, NO tenemos columna 'correcta', usamos calificacion_confianza
    // Para quizzes, sí tenemos columna 'correcta'
    const tieneColumnaCorrecta = tipo === 'quiz';
    
    let query;
    let params;
    
    if (tieneColumnaCorrecta) {
        // Quiz: incluir columna correcta
        query = `
            UPDATE ${tabla}
            SET 
                correcta = ?,
                calificacion_status = ?,
                calificacion_metodo = ?,
                calificacion_confianza = ?,
                calificada_at = NOW()
            WHERE id = ?
        `;
        params = [
            correcta ? 1 : 0,
            status,
            metodo,
            confianza,
            id_respuesta
        ];
    } else {
        // Simulación: NO incluir columna correcta (no existe)
        // Usar calificacion_confianza para almacenar: 100 = correcta, 0 = incorrecta
        // Para respuestas parciales, usar el valor de confianza directamente
        const confianzaValue = correcta ? (confianza >= 70 ? confianza : 100) : (confianza >= 70 ? 0 : 0);
        
        query = `
            UPDATE ${tabla}
            SET 
                calificacion_status = ?,
                calificacion_metodo = ?,
                calificacion_confianza = ?,
                calificada_at = NOW()
            WHERE id = ?
        `;
        params = [
            status,
            metodo,
            confianzaValue,
            id_respuesta
        ];
    }

    await db.query(query, params);

    console.log(`[BackgroundGrader] 💾 Actualizado en BD: ${tabla} #${id_respuesta} → ${correcta ? 'CORRECTA' : 'INCORRECTA'} (${metodo}, ${confianza}%)`);
}

/**
 * Obtiene el estado de calificación de una sesión
 */
export async function getGradingStatus(tipo, id_sesion) {
    const tabla = tipo === 'simulacion'
        ? 'simulaciones_respuestas'
        : 'quizzes_sesiones_respuestas';

    const [rows] = await db.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN calificacion_status = 'graded' THEN 1 ELSE 0 END) as graded,
      SUM(CASE WHEN calificacion_status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN calificacion_status = 'manual_review' THEN 1 ELSE 0 END) as manual_review
    FROM ${tabla}
    WHERE id_sesion = ?
  `, [id_sesion]);

    const stats = rows[0] || { total: 0, graded: 0, pending: 0, manual_review: 0 };

    return {
        total: Number(stats.total) || 0,
        graded: Number(stats.graded) || 0,
        pending: Number(stats.pending) || 0,
        manual_review: Number(stats.manual_review) || 0,
        progress: stats.total > 0 ? Math.round((stats.graded / stats.total) * 100) : 100
    };
}
