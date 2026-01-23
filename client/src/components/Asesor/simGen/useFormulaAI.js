import { useState, useCallback } from 'react';
import {
  validateQuery,
  cleanFormula,
  classifyAPIError,
  startCooldown,
  incrementFormulaUsage,
  getFormulaUsageToday
} from './formulaUtils';

/**
 * Hook para manejar la generación de fórmulas con IA
 * Incluye validación, manejo de errores y estado
 */
export function useFormulaAI() {
  const [state, setState] = useState({
    loading: false,
    error: '',
    generatedFormula: '',
    usage: getFormulaUsageToday()
  });

  // Validar y limpiar consulta del usuario
  const validateAndCleanQuery = useCallback((query) => {
    const validation = validateQuery(query);
    if (!validation.valid) {
      setState(prev => ({ ...prev, error: validation.error }));
      return null;
    }
    return validation.query;
  }, []);

  // Generar fórmula usando la API de Gemini
  const generateFormula = useCallback(async (query, cooldownRemainingMs = 0) => {
    // Validar cooldown
    if (cooldownRemainingMs > 0) {
      const secs = Math.ceil(cooldownRemainingMs / 1000);
      setState(prev => ({
        ...prev,
        error: `Debes esperar ${secs} segundo${secs > 1 ? 's' : ''} antes de volver a generar con IA.`
      }));
      return null;
    }

    // Validar y limpiar consulta
    const cleanedQuery = validateAndCleanQuery(query);
    if (!cleanedQuery) return null;

    // Validar límite diario
    const usage = getFormulaUsageToday();
    if (usage.remaining <= 0) {
      setState(prev => ({
        ...prev,
        error: `Has alcanzado el límite diario de ${usage.limit} fórmulas. Vuelve mañana.`
      }));
      return null;
    }

    // Iniciar estado de carga
    setState(prev => ({ ...prev, loading: true, error: '', generatedFormula: '' }));

    try {
      const prompt = `Genera SOLO el código LaTeX de una fórmula matemática para: "${cleanedQuery}".

IMPORTANTE:
- Responde ÚNICAMENTE con el código LaTeX de la fórmula, sin texto adicional, sin explicaciones, sin comillas.
- Si la fórmula tiene parámetros variables (como coeficientes, variables, constantes), usa \\square como placeholder para cada parámetro que deba ser completado.
- Si la fórmula es específica y completa (sin parámetros), NO uses \\square.
- Ejemplo: Si pides "ecuación cuadrática", responde: x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
- Ejemplo: Si pides "raíz cuadrada de un número", responde: \\sqrt{\\square}
- Ejemplo: Si pides "ecuación de Dirac", responde: (i\\gamma^\\mu \\partial_\\mu - m)\\psi = 0
- Si pides una fórmula con valores específicos, usa esos valores.
- NO agregues delimitadores $ al inicio o final.
- NO agregues texto adicional como "La fórmula es:" o similares.
- Para fórmulas más complejas (ejemplo: Transformada de Fourier en 3D, ecuación de Schrödinger, Navier-Stokes), genera la versión más detallada y formal posible, evitando expresiones demasiado generales.

Fórmula solicitada: ${cleanedQuery}`;

      const response = await fetch('/api/ai/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          },
          model: 'gemini-2.5-flash',
          purpose: 'formulas'
        }),
      });

      // Manejar errores de respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorInfo = classifyAPIError(response, errorData);
        
        // Iniciar cooldown para errores de rate limit
        if (errorInfo.type === 'RATE_LIMIT' || errorInfo.type === 'SERVICE_UNAVAILABLE') {
          startCooldown(errorInfo.is503);
        }
        
        throw new Error(errorInfo.message);
      }

      const data = await response.json();

      // Extraer fórmula de la respuesta
      let formula = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts || [];
        formula = parts.map(p => p.text || '').join('').trim();
      }

      if (!formula) {
        throw new Error('No se pudo generar la fórmula. Por favor intenta con otra descripción.');
      }

      // Limpiar fórmula
      const cleanedFormula = cleanFormula(formula);

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('[useFormulaAI] Fórmula generada:', cleanedFormula.substring(0, 200));
      }

      // Incrementar contador de uso exitoso
      incrementFormulaUsage();

      // Actualizar estado con éxito
      setState(prev => ({
        ...prev,
        loading: false,
        generatedFormula: cleanedFormula,
        usage: getFormulaUsageToday()
      }));

      return cleanedFormula;

    } catch (error) {
      const errorMessage = error.message || 'Error al generar la fórmula. Por favor intenta de nuevo.';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Log error en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('[useFormulaAI] Error:', error);
      }

      return null;
    }
  }, [validateAndCleanQuery]);

  // Limpiar estado
  const clearState = useCallback(() => {
    setState({
      loading: false,
      error: '',
      generatedFormula: '',
      usage: getFormulaUsageToday()
    });
  }, []);

  // Actualizar fórmula generada (para edición manual)
  const setGeneratedFormula = useCallback((formula) => {
    setState(prev => ({ ...prev, generatedFormula: formula }));
  }, []);

  // Actualizar error manualmente
  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    // Estado
    loading: state.loading,
    error: state.error,
    generatedFormula: state.generatedFormula,
    usage: state.usage,
    
    // Acciones
    generateFormula,
    clearState,
    setGeneratedFormula,
    setError,
    
    // Helpers
    hasFormula: !!state.generatedFormula,
    hasError: !!state.error,
    canGenerate: state.usage.remaining > 0
  };
}