/**
 * Servicio unificado para usar diferentes proveedores de IA (Gemini y Groq)
 * Permite elegir el proveedor o usar fallback automático
 */

import { generarConGroq, generarAnalisisConGroq } from './groqService.js';
import { generarAnalisisConGemini } from './geminiService.js';

/**
 * Genera contenido usando el proveedor especificado
 * @param {Object} options - Opciones de generación
 * @param {string} options.proveedor - 'gemini' o 'groq' (opcional, por defecto 'gemini')
 * @param {Object} options.requestBody - Cuerpo de la petición
 * @returns {Promise<Object>} Respuesta del proveedor
 */
export const generarConAI = async (options = {}) => {
  const { proveedor = 'gemini', requestBody } = options;
  const proveedorLower = (proveedor || 'gemini').toLowerCase();

  if (proveedorLower === 'groq') {
    return await generarConGroq(requestBody);
  } else {
    // Usar Gemini (requiere importar la función correspondiente)
    // Por ahora, redirigir a Groq si se solicita explícitamente
    throw new Error('Generación directa con Gemini debe usar geminiService directamente');
  }
};

/**
 * Genera análisis usando el proveedor especificado
 * @param {Object} datosAnalisis - Datos del análisis
 * @param {Object} options - Opciones adicionales
 * @param {string} options.proveedor - 'gemini' o 'groq' (opcional)
 * @param {boolean} options.fallback - Si true, intenta con el otro proveedor si falla
 * @returns {Promise<Object>} Análisis generado
 */
export const generarAnalisisConAI = async (datosAnalisis, options = {}) => {
  const { proveedor, fallback = false } = options;
  const proveedorLower = (proveedor || 'gemini').toLowerCase();

  try {
    if (proveedorLower === 'groq') {
      return await generarAnalisisConGroq(datosAnalisis);
    } else {
      return await generarAnalisisConGemini(datosAnalisis);
    }
  } catch (error) {
    // Si fallback está habilitado y el proveedor principal falla, intentar con el otro
    if (fallback) {
      console.warn(`[Unified AI] Error con ${proveedorLower}, intentando fallback...`);
      try {
        if (proveedorLower === 'groq') {
          return await generarAnalisisConGemini(datosAnalisis);
        } else {
          return await generarAnalisisConGroq(datosAnalisis);
        }
      } catch (fallbackError) {
        throw new Error(`Ambos proveedores fallaron. ${proveedorLower}: ${error.message}, fallback: ${fallbackError.message}`);
      }
    }
    throw error;
  }
};

/**
 * Obtiene el proveedor recomendado según la configuración
 * @param {string} purpose - Propósito de la llamada
 * @returns {string} 'gemini' o 'groq'
 */
export const getRecommendedProvider = (purpose) => {
  // Verificar preferencias del usuario (podría venir de localStorage o configuración)
  const userPreference = localStorage.getItem('ai_provider_preference');
  if (userPreference) {
    return userPreference.toLowerCase();
  }

  // Estrategia por defecto: usar Groq para tareas rápidas, Gemini para complejas
  const quickTasks = ['formula', 'calificacion'];
  const complexTasks = ['analisis', 'simulador'];

  if (quickTasks.includes(purpose?.toLowerCase())) {
    return 'groq';
  }

  if (complexTasks.includes(purpose?.toLowerCase())) {
    return 'gemini';
  }

  // Por defecto, preferir Gemini
  return 'gemini';
};

/**
 * Establece la preferencia del usuario para el proveedor de IA
 * @param {string} proveedor - 'gemini' o 'groq'
 */
export const setProviderPreference = (proveedor) => {
  const proveedorLower = (proveedor || 'gemini').toLowerCase();
  if (proveedorLower === 'gemini' || proveedorLower === 'groq') {
    localStorage.setItem('ai_provider_preference', proveedorLower);
  }
};

/**
 * Obtiene la preferencia del usuario para el proveedor de IA
 * @returns {string} 'gemini' o 'groq'
 */
export const getProviderPreference = () => {
  return localStorage.getItem('ai_provider_preference') || 'gemini';
};

