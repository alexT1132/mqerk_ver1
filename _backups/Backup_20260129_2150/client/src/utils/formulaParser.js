/**
 * Utilidades para parsear y convertir texto con fórmulas LaTeX
 * a segmentos editables y viceversa
 */

let idCounter = 0;

/**
 * Genera un ID único para cada segmento de fórmula
 */
export function generateId() {
    return `formula_${Date.now()}_${idCounter++}`;
}

/**
 * Convierte texto con fórmulas LaTeX ($...$) a array de segmentos
 * @param {string} text - Texto con fórmulas LaTeX
 * @returns {Array} Array de segmentos {type, content/latex, id}
 */
export function parseTextToSegments(text) {
    if (!text || typeof text !== 'string') {
        return [{ type: 'text', content: '', id: generateId() }];
    }

    const segments = [];
    const regex = /\$([^$]+)\$/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Texto antes de la fórmula
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
                id: generateId()
            });
        }

        // Fórmula
        segments.push({
            type: 'formula',
            latex: match[1],
            id: generateId()
        });

        lastIndex = regex.lastIndex;
    }

    // Texto después de la última fórmula
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex),
            id: generateId()
        });
    }

    // Si no hay segmentos, agregar uno vacío
    if (segments.length === 0) {
        segments.push({
            type: 'text',
            content: text,
            id: generateId()
        });
    }

    return segments;
}

/**
 * Convierte array de segmentos a texto con fórmulas LaTeX
 * @param {Array} segments - Array de segmentos
 * @returns {string} Texto con fórmulas LaTeX
 */
export function segmentsToText(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return '';
    }

    return segments
        .map(seg => {
            if (seg.type === 'text') {
                return seg.content || '';
            } else if (seg.type === 'formula') {
                return `$${seg.latex}$`;
            }
            return '';
        })
        .join('');
}

/**
 * Inserta una fórmula en una posición específica
 * @param {Array} segments - Segmentos actuales
 * @param {number} position - Posición donde insertar (índice del segmento)
 * @param {string} latex - Código LaTeX de la fórmula
 * @returns {Array} Nuevos segmentos con la fórmula insertada
 */
export function insertFormulaAtPosition(segments, position, latex) {
    const newSegments = [...segments];

    // Insertar la fórmula después de la posición especificada
    newSegments.splice(position + 1, 0, {
        type: 'formula',
        latex,
        id: generateId()
    });

    return newSegments;
}

/**
 * Actualiza una fórmula existente
 * @param {Array} segments - Segmentos actuales
 * @param {string} formulaId - ID de la fórmula a actualizar
 * @param {string} newLatex - Nuevo código LaTeX
 * @returns {Array} Segmentos actualizados
 */
export function updateFormula(segments, formulaId, newLatex) {
    return segments.map(seg => {
        if (seg.id === formulaId && seg.type === 'formula') {
            return { ...seg, latex: newLatex };
        }
        return seg;
    });
}

/**
 * Elimina una fórmula
 * @param {Array} segments - Segmentos actuales
 * @param {string} formulaId - ID de la fórmula a eliminar
 * @returns {Array} Segmentos sin la fórmula eliminada
 */
export function deleteFormula(segments, formulaId) {
    return segments.filter(seg => seg.id !== formulaId);
}

/**
 * Actualiza el contenido de un segmento de texto
 * @param {Array} segments - Segmentos actuales
 * @param {string} segmentId - ID del segmento a actualizar
 * @param {string} newContent - Nuevo contenido
 * @returns {Array} Segmentos actualizados
 */
export function updateTextSegment(segments, segmentId, newContent) {
    return segments.map(seg => {
        if (seg.id === segmentId && seg.type === 'text') {
            return { ...seg, content: newContent };
        }
        return seg;
    });
}
