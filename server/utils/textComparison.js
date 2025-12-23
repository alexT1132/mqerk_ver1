/**
 * Utilidades para comparación inteligente de texto
 * Usado para calificar respuestas cortas sin necesidad de IA
 */

/**
 * Normaliza texto para comparación
 * - Convierte a minúsculas
 * - Elimina acentos
 * - Elimina puntuación
 * - Elimina espacios extras
 */
function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!]/g, '') // Eliminar puntuación
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim();
}

/**
 * Extrae palabras clave de un texto
 * Filtra palabras comunes (stopwords) y palabras muy cortas
 */
function extractKeywords(text) {
    const normalized = normalizeText(text);

    // Stopwords en español (palabras comunes que no aportan significado)
    const stopwords = new Set([
        'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
        'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
        'pero', 'mas', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
        'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'muy', 'sin', 'vez',
        'mucho', 'saber', 'que', 'sobre', 'tambien', 'me', 'hasta', 'hay', 'donde',
        'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni',
        'contra', 'otros', 'fueron', 'ese', 'eso', 'había', 'sido', 'cual', 'son',
        'sus', 'esta', 'estas', 'estos', 'esas', 'esos', 'del', 'al', 'una', 'unos',
        'unas', 'los', 'las'
    ]);

    const words = normalized.split(' ').filter(word =>
        word.length > 2 && !stopwords.has(word)
    );

    return [...new Set(words)]; // Eliminar duplicados
}

/**
 * Calcula el porcentaje de coincidencia de palabras clave
 * entre dos textos
 */
function calculateKeywordMatch(expectedText, studentText) {
    const expectedKeywords = extractKeywords(expectedText);
    const studentKeywords = extractKeywords(studentText);

    if (expectedKeywords.length === 0) return 0;

    // Contar cuántas palabras clave esperadas están en la respuesta del estudiante
    const matchedKeywords = expectedKeywords.filter(keyword =>
        studentKeywords.includes(keyword)
    );

    return matchedKeywords.length / expectedKeywords.length;
}

/**
 * Compara dos textos de forma exacta (después de normalizar)
 */
function compareExact(expectedText, studentText) {
    const normalizedExpected = normalizeText(expectedText);
    const normalizedStudent = normalizeText(studentText);

    return normalizedExpected === normalizedStudent;
}

/**
 * Calcula la similitud de Levenshtein entre dos strings
 * (distancia de edición)
 */
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Calcula similitud entre dos textos usando Levenshtein
 * Retorna un valor entre 0 (totalmente diferente) y 1 (idéntico)
 */
function calculateSimilarity(text1, text2) {
    const normalized1 = normalizeText(text1);
    const normalized2 = normalizeText(text2);

    if (normalized1 === normalized2) return 1;
    if (!normalized1 || !normalized2) return 0;

    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    return 1 - (distance / maxLength);
}

export {
    normalizeText,
    extractKeywords,
    calculateKeywordMatch,
    compareExact,
    calculateSimilarity,
    levenshteinDistance
};

