import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, BookOpen, Users, MessageCircle, TrendingDown, Sparkles, Brain, X, ExternalLink } from 'lucide-react';
import { getQuizIntentoReview, getQuizAnalytics } from '../../api/quizzes';
import { getSimulacionIntentoReview } from '../../api/simulaciones';
import { generarAnalisisConGemini, limpiarCacheAnalisisGemini } from '../../service/geminiService';
import InlineMath from './simGen/InlineMath';

// Componente para renderizar texto con fórmulas LaTeX (igual que en Quiz.jsx)
function MathText({ text = "" }) {
  if (!text) return null;

  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }
    nodesToRemove.forEach(n => {
      const parent = n.parentNode;
      while (n.firstChild) {
        parent.insertBefore(n.firstChild, n);
      }
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  // ✅ Normalizar saltos de línea y espacios primero
  let processedText = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ✅ Reemplazar símbolos Unicode de multiplicación y división por comandos LaTeX
  // Esto debe hacerse ANTES de proteger las fórmulas
  processedText = processedText.replace(/×/g, '\\times').replace(/÷/g, '\\div');

  // Regex para detectar $...$ y $$...$$
  const fullLatexRe = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;

  // Protegiendo LaTeX antes de procesar Markdown
  const latexPlaceholder = '___LATEX_PLACEHOLDER___';
  const latexMatches = [];
  let placeholderIndex = 0;

  processedText = processedText.replace(fullLatexRe, (match) => {
    const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
    latexMatches.push(match);
    placeholderIndex++;
    return placeholder;
  });

  // Procesar Markdown: **texto** -> <strong>texto</strong>
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

  // Restaurar LaTeX
  latexMatches.forEach((match, idx) => {
    processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
  });

  const parts = [];
  let lastIndex = 0;
  let m;
  let matchFound = false;

  fullLatexRe.lastIndex = 0;

  while ((m = fullLatexRe.exec(processedText)) !== null) {
    matchFound = true;
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: processedText.slice(lastIndex, m.index) });
    }

    // m[1] es para $$...$$, m[2] es para $...$
    const formula = (m[1] || m[2] || "").trim();
    const isBlock = !!m[1];

    if (formula) {
      parts.push({ type: 'math', content: formula, display: isBlock });
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < processedText.length) {
    parts.push({ type: 'text', content: processedText.slice(lastIndex) });
  }

  if (!matchFound || parts.length === 0) {
    return (
      <span
        className="block w-full break-words overflow-x-auto whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }}
      />
    );
  }

  return (
    <span className="block w-full break-words overflow-x-auto whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <InlineMath key={`math-${idx}`} math={part.content} display={part.display} />
        ) : (
          <span
            key={`text-${idx}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }}
          />
        )
      )}
    </span>
  );
}

/**
 * Componente analizador que detecta preguntas con fallos repetidos
 * y sugiere apoyo/asesorías para el estudiante
 * 
 * @param {Object} props
 * @param {string} props.tipo - 'quiz' o 'simulacion'
 * @param {number} props.id - ID del quiz o simulación
 * @param {number} props.idEstudiante - ID del estudiante
 * @param {number} props.totalIntentos - Total de intentos del estudiante
 */
export default function AnalizadorFallosRepetidos({ tipo, id, idEstudiante, totalIntentos }) {
  const [loading, setLoading] = useState(true);
  const [analisis, setAnalisis] = useState(null);
  const [error, setError] = useState(null);
  const [analisisIA, setAnalisisIA] = useState(null);
  const [analisisIACompleto, setAnalisisIACompleto] = useState(null); // Guardar el análisis completo
  const [loadingIA, setLoadingIA] = useState(false);
  const [mostrarBotonIA, setMostrarBotonIA] = useState(false); // Controlar si mostrar el botón
  const [mostrarModalAnalisis, setMostrarModalAnalisis] = useState(false); // Controlar modal de análisis completo

  useEffect(() => {
    if (!id || !idEstudiante || !totalIntentos) {
      setLoading(false);
      return;
    }

    const analizarFallos = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener todos los intentos del estudiante
        const intentosData = [];
        const maxIntentos = Math.min(totalIntentos, 10); // Limitar a 10 intentos para no sobrecargar

        for (let i = 1; i <= maxIntentos; i++) {
          try {
            const reviewFn = tipo === 'quiz'
              ? getQuizIntentoReview
              : getSimulacionIntentoReview;

            const response = await reviewFn(id, idEstudiante, i);
            const data = response?.data?.data || response?.data;

            if (data && Array.isArray(data.preguntas)) {
              intentosData.push({
                intento: i,
                preguntas: data.preguntas
              });
            }
          } catch (e) {
            // Si un intento no existe, continuar con el siguiente
            console.warn(`Intento ${i} no disponible:`, e?.message);
          }
        }

        if (intentosData.length < 2) {
          setLoading(false);
          // No retornamos, dejamos que el render maneje el mensaje de "pocos intentos"
        }

        // Analizar fallos repetidos
        const fallosPorPregunta = new Map();

        intentosData.forEach(({ intento, preguntas }) => {
          preguntas.forEach((pregunta) => {
            const idPreg = pregunta.id;
            if (!fallosPorPregunta.has(idPreg)) {
              fallosPorPregunta.set(idPreg, {
                id: idPreg,
                enunciado: pregunta.enunciado || pregunta.texto || `Pregunta ${pregunta.orden || 'N/A'}`,
                orden: pregunta.orden,
                tipo: pregunta.tipo,
                totalIntentos: 0,
                fallos: 0,
                ultimoIntento: null,
                siempreFallo: false
              });
            }

            const stats = fallosPorPregunta.get(idPreg);
            stats.totalIntentos++;

            // Verificar si falló (correcta === false o 0)
            const fallo = !pregunta.correcta || pregunta.correcta === 0 || pregunta.correcta === false;
            if (fallo) {
              stats.fallos++;
              stats.ultimoIntento = intento;
            }
          });
        });

        // Analizar patrones y tipos de preguntas
        const analisisPorTipo = new Map();
        const analisisPorTendencia = {
          mejorando: 0,
          empeorando: 0,
          estable: 0
        };

        // Analizar cada pregunta en detalle
        const preguntasDetalladas = Array.from(fallosPorPregunta.values()).map(stats => {
          stats.siempreFallo = stats.fallos === stats.totalIntentos;
          stats.porcentajeFallo = (stats.fallos / stats.totalIntentos) * 100;

          // Analizar tendencia: ¿mejoró o empeoró en intentos recientes?
          const intentosRecientes = intentosData.slice(-3); // Últimos 3 intentos
          let fallosRecientes = 0;
          let fallosAntiguos = 0;

          intentosRecientes.forEach((int, idx) => {
            const preguntaEnIntento = int.preguntas.find(p => p.id === stats.id);
            if (preguntaEnIntento) {
              const fallo = !preguntaEnIntento.correcta || preguntaEnIntento.correcta === 0;
              if (fallo) fallosRecientes++;
            }
          });

          const intentosAntiguos = intentosData.slice(0, Math.max(0, intentosData.length - 3));
          intentosAntiguos.forEach((int) => {
            const preguntaEnIntento = int.preguntas.find(p => p.id === stats.id);
            if (preguntaEnIntento) {
              const fallo = !preguntaEnIntento.correcta || preguntaEnIntento.correcta === 0;
              if (fallo) fallosAntiguos++;
            }
          });

          // Determinar tendencia
          if (intentosRecientes.length > 0 && intentosAntiguos.length > 0) {
            const tasaReciente = fallosRecientes / intentosRecientes.length;
            const tasaAntigua = fallosAntiguos / intentosAntiguos.length;
            if (tasaReciente < tasaAntigua - 0.2) {
              stats.tendencia = 'mejorando';
              analisisPorTendencia.mejorando++;
            } else if (tasaReciente > tasaAntigua + 0.2) {
              stats.tendencia = 'empeorando';
              analisisPorTendencia.empeorando++;
            } else {
              stats.tendencia = 'estable';
              analisisPorTendencia.estable++;
            }
          } else {
            stats.tendencia = 'insuficiente_datos';
          }

          // Agrupar por tipo de pregunta
          const tipo = stats.tipo || 'desconocido';
          if (!analisisPorTipo.has(tipo)) {
            analisisPorTipo.set(tipo, { total: 0, fallos: 0, siempreFallo: 0 });
          }
          const tipoStats = analisisPorTipo.get(tipo);
          tipoStats.total++;
          tipoStats.fallos += stats.fallos;
          if (stats.siempreFallo) tipoStats.siempreFallo++;

          return stats;
        });

        // Identificar preguntas problemáticas (siempre falló o >70% fallos)
        const preguntasProblematicas = preguntasDetalladas
          .filter(stats => {
            return stats.siempreFallo || stats.porcentajeFallo >= 70;
          })
          .sort((a, b) => {
            // Ordenar por: siempre falló primero, luego por porcentaje de fallos
            if (a.siempreFallo && !b.siempreFallo) return -1;
            if (!a.siempreFallo && b.siempreFallo) return 1;
            return b.porcentajeFallo - a.porcentajeFallo;
          });

        // Generar recomendaciones básicas inteligentes sin IA
        const recomendacionesBasicas = generarRecomendacionesBasicas(
          preguntasProblematicas,
          analisisPorTipo,
          analisisPorTendencia,
          intentosData.length
        );

        // Calcular estadísticas generales
        const totalPreguntas = fallosPorPregunta.size;
        const preguntasSiempreFalladas = preguntasProblematicas.filter(p => p.siempreFallo).length;
        const porcentajeProblemas = totalPreguntas > 0
          ? ((preguntasProblematicas.length / totalPreguntas) * 100).toFixed(1)
          : 0;

        // Identificar temas/conceptos comunes (extraer palabras clave de enunciados)
        const temasComunes = identificarTemasComunes(preguntasProblematicas);

        // NUEVO: Ejecutar análisis avanzados
        const patronesCognitivos = analizarPatronesCognitivos(preguntasProblematicas);
        const correlaciones = analizarCorrelaciones(preguntasProblematicas);
        const progresion = analizarProgresion(preguntasProblematicas);

        // NUEVO: Diagnóstico de causas raíz para cada pregunta problemática
        const causasRaiz = preguntasProblematicas.map(preg => ({
          pregunta: preg.orden,
          causas: diagnosticarCausaRaiz(preg)
        })).filter(item => item.causas.length > 0);

        // NUEVO: Calcular confiabilidad del análisis
        const confiabilidad = {
          nivelConfianza: intentosData.length >= 5 ? 'ALTA' :
            intentosData.length >= 3 ? 'MEDIA' : 'BAJA',
          muestraSuficiente: intentosData.length >= 5,
          datosCompletos: preguntasProblematicas.every(p => p.enunciado),
          recomendacion: intentosData.length < 5 ?
            `Se recomienda esperar ${5 - intentosData.length} intento(s) más para un análisis más preciso` :
            'Análisis confiable basado en datos suficientes'
        };

        setAnalisis({
          preguntasProblematicas,
          estadisticas: {
            totalPreguntas,
            preguntasSiempreFalladas,
            preguntasConProblemas: preguntasProblematicas.length,
            porcentajeProblemas: Number(porcentajeProblemas),
            totalIntentosAnalizados: intentosData.length,
            analisisPorTipo: Object.fromEntries(analisisPorTipo),
            analisisPorTendencia,
            temasComunes
          },
          // NUEVO: Análisis avanzado
          analisisAvanzado: {
            patronesCognitivos,
            correlaciones,
            progresion,
            causasRaiz,
            confiabilidad
          },
          recomendacionesBasicas
        });

        // Mostrar botón para generar análisis con IA (no generarlo automáticamente)
        if (preguntasProblematicas.length > 0) {
          setMostrarBotonIA(true);
        }
      } catch (e) {
        console.error('Error al analizar fallos:', e);
        setError('No se pudo analizar los fallos repetidos');
      } finally {
        setLoading(false);
      }
    };

    analizarFallos();
  }, [tipo, id, idEstudiante, totalIntentos]);

  // Función para generar recomendaciones básicas inteligentes sin IA (MEJORADA)
  const generarRecomendacionesBasicas = (preguntasProblematicas, analisisPorTipo, analisisPorTendencia, totalIntentos) => {
    const recomendaciones = [];

    // Análisis por severidad
    const siempreFalladas = preguntasProblematicas.filter(p => p.siempreFallo).length;
    const porcentajeSiempreFalladas = preguntasProblematicas.length > 0
      ? ((siempreFalladas / preguntasProblematicas.length) * 100).toFixed(0)
      : 0;

    if (siempreFalladas > 0) {
      recomendaciones.push({
        tipo: 'urgente',
        titulo: `${siempreFalladas} pregunta${siempreFalladas !== 1 ? 's' : ''} siempre fallada${siempreFalladas !== 1 ? 's' : ''} (${porcentajeSiempreFalladas}% del total)`,
        descripcion: `El estudiante necesita refuerzo inmediato en ${siempreFalladas} pregunta${siempreFalladas !== 1 ? 's' : ''} que nunca ha respondido correctamente en ${totalIntentos} intento${totalIntentos !== 1 ? 's' : ''}. Esto indica una falta de comprensión fundamental de estos conceptos.`,
        accion: `Programar sesión de asesoría enfocada en estos conceptos específicos. Revisar las preguntas ${preguntasProblematicas.filter(p => p.siempreFallo).slice(0, 3).map(p => `#${p.orden || 'N/A'}`).join(', ')}${siempreFalladas > 3 ? ' y más' : ''} para identificar el tema común.`,
        preguntasRelacionadas: preguntasProblematicas.filter(p => p.siempreFallo).slice(0, 5).map(p => ({
          orden: p.orden,
          enunciado: p.enunciado?.substring(0, 100) + (p.enunciado?.length > 100 ? '...' : ''),
          tipo: p.tipo
        }))
      });
    }

    // Análisis por tipo de pregunta
    const tiposProblematicos = Array.from(analisisPorTipo.entries())
      .filter(([tipo, stats]) => {
        const porcentajeFallo = (stats.fallos / (stats.total * totalIntentos)) * 100;
        return porcentajeFallo >= 70;
      })
      .sort((a, b) => {
        const porcentajeA = (a[1].fallos / (a[1].total * totalIntentos)) * 100;
        const porcentajeB = (b[1].fallos / (b[1].total * totalIntentos)) * 100;
        return porcentajeB - porcentajeA;
      });

    tiposProblematicos.forEach(([tipo, stats]) => {
      const nombreTipo = tipo === 'opcion_multiple' ? 'Opción múltiple' :
        tipo === 'verdadero_falso' ? 'Verdadero/Falso' :
          tipo === 'respuesta_corta' ? 'Respuesta corta' : tipo;
      const porcentajeFallo = (stats.fallos / (stats.total * totalIntentos)) * 100;
      const preguntasDeEsteTipo = preguntasProblematicas.filter(p => p.tipo === tipo);

      recomendaciones.push({
        tipo: 'tipo_pregunta',
        titulo: `Dificultad con preguntas de ${nombreTipo} (${porcentajeFallo.toFixed(0)}% de fallos)`,
        descripcion: `El estudiante tiene problemas específicos con este tipo de pregunta. Ha fallado ${stats.fallos} veces en ${stats.total} pregunta${stats.total !== 1 ? 's' : ''} de este tipo.`,
        accion: `Practicar más ejercicios de ${nombreTipo.toLowerCase()} y explicar la estrategia para este formato. Enfocarse en ${preguntasDeEsteTipo.length} pregunta${preguntasDeEsteTipo.length !== 1 ? 's' : ''} específica${preguntasDeEsteTipo.length !== 1 ? 's' : ''} donde más falla.`,
        estrategias: tipo === 'opcion_multiple'
          ? ['Enseñar a eliminar opciones incorrectas primero', 'Practicar lectura cuidadosa de todas las opciones', 'Identificar palabras clave en el enunciado']
          : tipo === 'verdadero_falso'
            ? ['Enseñar a analizar cada parte de la afirmación', 'Identificar palabras absolutas que suelen indicar falsedad', 'Practicar con ejemplos concretos']
            : ['Enseñar a estructurar respuestas cortas', 'Practicar precisión en el vocabulario', 'Revisar ortografía y gramática']
      });
    });

    // Análisis de tendencia
    if (analisisPorTendencia.empeorando > analisisPorTendencia.mejorando) {
      recomendaciones.push({
        tipo: 'tendencia',
        titulo: 'Tendencia preocupante detectada',
        descripcion: 'El estudiante está empeorando en varias preguntas en intentos recientes.',
        accion: 'Revisar si hay confusión creciente o falta de práctica. Considerar pausar nuevos intentos y enfocarse en repaso.'
      });
    } else if (analisisPorTendencia.mejorando > 0) {
      recomendaciones.push({
        tipo: 'positivo',
        titulo: 'Progreso positivo detectado',
        descripcion: `El estudiante está mejorando en ${analisisPorTendencia.mejorando} pregunta${analisisPorTendencia.mejorando !== 1 ? 's' : ''}.`,
        accion: 'Mantener el enfoque actual y reforzar las áreas donde aún hay dificultades.'
      });
    }

    // Recomendación general basada en porcentaje de problemas
    const totalPreguntasUnicas = new Set(preguntasProblematicas.map(p => p.id)).size;
    const porcentajeProblemas = totalPreguntasUnicas > 0
      ? ((preguntasProblematicas.length / totalPreguntasUnicas) * 100).toFixed(0)
      : 0;

    if (Number(porcentajeProblemas) >= 50) {
      recomendaciones.push({
        tipo: 'general',
        titulo: 'Necesita refuerzo general',
        descripcion: `${porcentajeProblemas}% de las preguntas presentan problemas recurrentes. El estudiante tiene dificultades en múltiples áreas.`,
        accion: 'Considerar un plan de estudio estructurado y sesiones de asesoría regulares. Priorizar las áreas más problemáticas identificadas arriba.',
        planSugerido: {
          frecuencia: '2-3 sesiones por semana',
          duracion: '4-6 semanas',
          enfoque: 'Reforzar conceptos base antes de avanzar'
        }
      });
    }

    // Agregar recomendación de seguimiento
    recomendaciones.push({
      tipo: 'seguimiento',
      titulo: 'Seguimiento recomendado',
      descripcion: `Monitorear el progreso del estudiante en los próximos intentos. Verificar si mejora en las ${preguntasProblematicas.length} pregunta${preguntasProblematicas.length !== 1 ? 's' : ''} identificadas.`,
      accion: `Revisar resultados después de ${Math.ceil(totalIntentos * 1.5)} intentos para evaluar mejoras. Si persisten los mismos errores, considerar intervención más intensiva.`,
      metricas: [
        `Reducción de fallos en preguntas siempre falladas`,
        `Mejora en tipos de pregunta problemáticos`,
        `Aumento en porcentaje de aciertos general`
      ]
    });

    return recomendaciones;
  };

  // Función para identificar temas comunes en las preguntas problemáticas
  const identificarTemasComunes = (preguntasProblematicas) => {
    const palabrasClave = new Map();

    // Palabras comunes en matemáticas
    const palabrasMatematicas = ['ecuación', 'función', 'derivada', 'integral', 'álgebra', 'geometría', 'trigonométrica', 'logaritmo', 'fracción', 'porcentaje'];
    // Palabras comunes en español
    const palabrasEspanol = ['sinónimo', 'antónimo', 'ortografía', 'acentuación', 'gramática', 'redacción', 'comprensión'];
    // Palabras comunes en física
    const palabrasFisica = ['fuerza', 'velocidad', 'aceleración', 'energía', 'trabajo', 'potencia', 'ley', 'newton'];
    // Palabras comunes en química
    const palabrasQuimica = ['molécula', 'átomo', 'reacción', 'compuesto', 'elemento', 'valencia', 'enlace'];

    const todasPalabras = [
      ...palabrasMatematicas.map(p => ({ palabra: p, categoria: 'Matemáticas' })),
      ...palabrasEspanol.map(p => ({ palabra: p, categoria: 'Español' })),
      ...palabrasFisica.map(p => ({ palabra: p, categoria: 'Física' })),
      ...palabrasQuimica.map(p => ({ palabra: p, categoria: 'Química' }))
    ];

    preguntasProblematicas.forEach(preg => {
      const enunciadoLower = (preg.enunciado || '').toLowerCase();
      todasPalabras.forEach(({ palabra, categoria }) => {
        if (enunciadoLower.includes(palabra)) {
          if (!palabrasClave.has(categoria)) {
            palabrasClave.set(categoria, []);
          }
          palabrasClave.get(categoria).push(palabra);
        }
      });
    });

    // Convertir a array y ordenar por frecuencia
    const temas = Array.from(palabrasClave.entries()).map(([categoria, palabras]) => ({
      categoria,
      palabrasUnicas: [...new Set(palabras)],
      frecuencia: palabras.length
    })).sort((a, b) => b.frecuencia - a.frecuencia);

    return temas.slice(0, 5); // Top 5 temas
  };

  // NUEVO: Análisis de patrones cognitivos
  const analizarPatronesCognitivos = (preguntasProblematicas) => {
    const patrones = {
      erroresConceptuales: 0,
      erroresProcedimentales: 0,
      erroresComprension: 0,
      erroresCalculo: 0,
      detalles: []
    };

    preguntasProblematicas.forEach(preg => {
      const enunciado = (preg.enunciado || '').toLowerCase();
      const longitud = enunciado.length;

      // Detectar errores conceptuales (palabras clave de conceptos)
      const palabrasConceptuales = ['definición', 'concepto', 'qué es', 'significa', 'representa', 'teoría', 'principio'];
      if (palabrasConceptuales.some(p => enunciado.includes(p))) {
        patrones.erroresConceptuales++;
        patrones.detalles.push({ pregunta: preg.orden, tipo: 'conceptual', razon: 'Pregunta sobre definiciones o conceptos' });
      }
      // Detectar errores procedimentales (palabras de proceso)
      else if (enunciado.includes('calcula') || enunciado.includes('resuelve') || enunciado.includes('determina') || enunciado.includes('encuentra')) {
        patrones.erroresProcedimentales++;
        patrones.detalles.push({ pregunta: preg.orden, tipo: 'procedimental', razon: 'Pregunta sobre cálculos o procedimientos' });
      }
      // Detectar errores de comprensión (enunciados largos)
      else if (longitud > 200) {
        patrones.erroresComprension++;
        patrones.detalles.push({ pregunta: preg.orden, tipo: 'comprension', razon: 'Enunciado largo - posible problema de comprensión lectora' });
      }
      // Detectar errores de cálculo (números en el enunciado)
      else if (/\d+/.test(enunciado)) {
        patrones.erroresCalculo++;
        patrones.detalles.push({ pregunta: preg.orden, tipo: 'calculo', razon: 'Pregunta numérica - posible error de cálculo' });
      }
    });

    return patrones;
  };

  // NUEVO: Análisis de correlaciones entre preguntas
  const analizarCorrelaciones = (preguntasProblematicas) => {
    const correlaciones = [];
    const umbralCorrelacion = 0.7;

    // Agrupar por temas comunes
    const gruposPorTema = new Map();
    preguntasProblematicas.forEach(preg => {
      const enunciado = (preg.enunciado || '').toLowerCase();
      // Palabras clave por tema
      const temas = [
        { nombre: 'Álgebra', palabras: ['álgebra', 'ecuación', 'incógnita', 'variable', 'x', 'y'] },
        { nombre: 'Geometría', palabras: ['geometría', 'triángulo', 'círculo', 'área', 'perímetro', 'volumen'] },
        { nombre: 'Cálculo', palabras: ['derivada', 'integral', 'límite', 'función'] },
        { nombre: 'Gramática', palabras: ['verbo', 'sustantivo', 'adjetivo', 'oración', 'sujeto'] },
        { nombre: 'Física', palabras: ['fuerza', 'velocidad', 'aceleración', 'energía', 'masa'] }
      ];

      temas.forEach(tema => {
        if (tema.palabras.some(p => enunciado.includes(p))) {
          if (!gruposPorTema.has(tema.nombre)) {
            gruposPorTema.set(tema.nombre, []);
          }
          gruposPorTema.get(tema.nombre).push(preg);
        }
      });
    });

    // Crear correlaciones para grupos con más de 1 pregunta
    gruposPorTema.forEach((preguntas, tema) => {
      if (preguntas.length > 1) {
        correlaciones.push({
          tema,
          preguntas: preguntas.map(p => p.orden),
          cantidad: preguntas.length,
          fuerza: Math.min(0.95, 0.6 + (preguntas.length * 0.1)),
          recomendacion: `Reforzar conocimientos en ${tema} - ${preguntas.length} preguntas relacionadas`
        });
      }
    });

    return correlaciones.sort((a, b) => b.cantidad - a.cantidad);
  };

  // NUEVO: Análisis de progresión temporal
  const analizarProgresion = (preguntasProblematicas) => {
    const progresion = {
      mejorando: [],
      estancadas: [],
      regresion: [],
      velocidadMejora: 0
    };

    preguntasProblematicas.forEach(preg => {
      if (preg.tendencia === 'mejorando') {
        progresion.mejorando.push(preg);
      } else if (preg.tendencia === 'empeorando') {
        progresion.regresion.push(preg);
      } else if (preg.tendencia === 'estable' && preg.porcentajeFallo > 50) {
        progresion.estancadas.push(preg);
      }
    });

    // Calcular velocidad de mejora (intentos promedio para mejorar)
    if (progresion.mejorando.length > 0) {
      const totalIntentos = progresion.mejorando.reduce((sum, p) => sum + p.totalIntentos, 0);
      progresion.velocidadMejora = (totalIntentos / progresion.mejorando.length).toFixed(1);
    }

    return progresion;
  };

  // NUEVO: Diagnóstico de causas raíz
  const diagnosticarCausaRaiz = (pregunta) => {
    const causas = [];
    const enunciado = (pregunta.enunciado || '').toLowerCase();
    const longitud = enunciado.length;

    // 1. Comprensión lectora
    if (longitud > 250) {
      causas.push({
        tipo: 'comprension_lectora',
        severidad: 'MEDIA',
        descripcion: 'Enunciado muy largo (>250 caracteres)',
        recomendacion: 'Practicar lectura analítica, subrayar palabras clave, resumir el enunciado'
      });
    }

    // 2. Razonamiento complejo
    const palabrasComplejidad = ['además', 'sin embargo', 'por lo tanto', 'considerando', 'dado que'];
    if (palabrasComplejidad.some(p => enunciado.includes(p))) {
      causas.push({
        tipo: 'razonamiento_complejo',
        severidad: 'ALTA',
        descripcion: 'Requiere razonamiento en múltiples pasos',
        recomendacion: 'Practicar descomposición de problemas, hacer diagramas de flujo'
      });
    }

    // 3. Conocimiento previo
    if (pregunta.siempreFallo && pregunta.totalIntentos >= 3) {
      causas.push({
        tipo: 'conocimiento_base',
        severidad: 'ALTA',
        descripcion: 'Falla consistente indica falta de conocimiento fundamental',
        recomendacion: 'Revisar conceptos básicos antes de intentar problemas complejos'
      });
    }

    // 4. Tipo de pregunta específico
    if (pregunta.tipo === 'opcion_multiple' && pregunta.porcentajeFallo > 80) {
      causas.push({
        tipo: 'estrategia_respuesta',
        severidad: 'MEDIA',
        descripcion: 'Dificultad con preguntas de opción múltiple',
        recomendacion: 'Enseñar técnica de eliminación de opciones incorrectas'
      });
    }

    return causas;
  };


  // Función para generar análisis con IA (solo cuando el asesor lo solicite)
  const handleGenerarAnalisisIA = async () => {
    if (!analisis || !analisis.preguntasProblematicas || analisis.preguntasProblematicas.length === 0) {
      return;
    }

    setMostrarBotonIA(false); // Ocultar botón mientras se genera

    // Preparar datos para limpiar el cache antes de generar nuevo análisis
    const datosParaCache = {
      simulacion: tipo === 'quiz' ? 'Quiz' : 'Simulación',
      analisisTipo: 'fallos_repetidos',
      idEstudiante: idEstudiante,
      preguntasProblematicas: analisis.preguntasProblematicas
    };

    // Limpiar cache para forzar regeneración
    limpiarCacheAnalisisGemini(datosParaCache);

    await generarAnalisisIA(analisis.preguntasProblematicas, [], tipo);
  };

  // Función para generar análisis con IA enfocado en fallos repetidos
  const generarAnalisisIA = async (preguntasProblematicas, intentosData, tipoEvaluacion) => {
    setLoadingIA(true);
    try {
      // Preparar datos específicos para análisis de fallos repetidos
      const datosAnalisis = {
        simulacion: tipo === 'quiz' ? 'Quiz' : 'Simulación',
        tipoEvaluacion: tipo === 'quiz' ? 'Quiz' : 'Simulación de examen',
        nivelEducativo: 'Preparatoria/Universidad',
        // Enfoque específico en fallos repetidos
        analisisTipo: 'fallos_repetidos',
        idEstudiante: idEstudiante, // Incluir ID de estudiante para caché específico
        intentos: intentosData.map((int, idx) => ({
          numero: int.intento,
          puntaje: int.preguntas.filter(p => p.correcta).length / int.preguntas.length * 100,
          totalPreguntas: int.preguntas.length,
          correctas: int.preguntas.filter(p => p.correcta).length,
          incorrectas: int.preguntas.filter(p => !p.correcta).length
        })),
        preguntasProblematicas: preguntasProblematicas.map(p => ({
          id: p.id,
          enunciado: p.enunciado,
          tipo: p.tipo,
          orden: p.orden,
          porcentajeFallo: ((p.fallos / p.totalIntentos) * 100).toFixed(0),
          siempreFallo: p.siempreFallo,
          totalIntentos: p.totalIntentos,
          fallos: p.fallos
        })),
        estadisticas: {
          totalPreguntas: preguntasProblematicas.length,
          preguntasSiempreFalladas: preguntasProblematicas.filter(p => p.siempreFallo).length,
          porcentajeProblemas: preguntasProblematicas.length > 0
            ? ((preguntasProblematicas.filter(p => p.siempreFallo).length / preguntasProblematicas.length) * 100).toFixed(1)
            : 0,
          totalIntentosAnalizados: intentosData.length
        },
        // Instrucciones específicas para el análisis
        instruccionesEspeciales: `
          ENFOQUE ESPECÍFICO: Analiza los FALLOS REPETIDOS del estudiante.
          - Identifica PATRONES COMUNES en las preguntas que siempre falla
          - Sugiere TEMAS/CONCEPTOS específicos que necesita reforzar
          - Genera RECOMENDACIONES ACCIONABLES basadas en el contenido de las preguntas
          - Proporciona ESTRATEGIAS DE ESTUDIO específicas para cada tipo de pregunta problemática
          - Detecta si hay un patrón de errores (conceptual, procedimental, de comprensión)
        `
      };

      // Llamar a la IA para análisis profundo (forzar regeneración sin usar cache)
      const resultadoIA = await generarAnalisisConGemini(datosAnalisis, { forceRegenerate: true });

      if (resultadoIA && !resultadoIA.error) {
        // Guardar el análisis completo para la modal
        console.log('📊 Resultado IA completo recibido:', resultadoIA);
        setAnalisisIACompleto(resultadoIA);

        // Extraer recomendaciones personalizadas del nuevo formato mejorado
        const recomendaciones = [];

        // De recomendaciones personalizadas directas
        if (Array.isArray(resultadoIA.recomendacionesPersonalizadas)) {
          recomendaciones.push(...resultadoIA.recomendacionesPersonalizadas);
        }

        // De intervención del asesor (nuevo campo)
        if (resultadoIA.intervencionAsesor) {
          if (resultadoIA.intervencionAsesor.queEnsenar) {
            recomendaciones.push(`📚 QUÉ enseñar: ${resultadoIA.intervencionAsesor.queEnsenar}`);
          }
          if (resultadoIA.intervencionAsesor.comoEnsenarlo) {
            recomendaciones.push(`🎯 CÓMO enseñarlo: ${resultadoIA.intervencionAsesor.comoEnsenarlo}`);
          }
          if (Array.isArray(resultadoIA.intervencionAsesor.ejerciciosEspecificos)) {
            resultadoIA.intervencionAsesor.ejerciciosEspecificos.forEach(ej => {
              recomendaciones.push(`✏️ Ejercicio: ${ej}`);
            });
          }
          if (resultadoIA.intervencionAsesor.verificacionAprendizaje) {
            recomendaciones.push(`✅ Verificar: ${resultadoIA.intervencionAsesor.verificacionAprendizaje}`);
          }
        }

        // De preguntas problemáticas (análisis detallado)
        if (Array.isArray(resultadoIA.preguntasProblematicas)) {
          resultadoIA.preguntasProblematicas.slice(0, 3).forEach(p => {
            if (p.conceptoNoDomina) {
              recomendaciones.push(`🔍 Pregunta ${p.orden}: No domina "${p.conceptoNoDomina}"`);
            }
            if (p.queEnsenar) {
              recomendaciones.push(`📖 Para Pregunta ${p.orden}: ${p.queEnsenar}`);
            }
          });
        }

        // De estrategias de estudio mejoradas
        const estrategias = [];
        if (Array.isArray(resultadoIA.estrategiasEstudio)) {
          resultadoIA.estrategiasEstudio.forEach(estr => {
            estrategias.push({
              materia: estr.materia || 'General',
              enfoque: estr.enfoque || estr.actividadEspecifica || '',
              tiempo: estr.tiempo || '30 min diarios',
              actividad: estr.actividadEspecifica || estr.enfoque || ''
            });
          });
        }

        // Resumen mejorado
        const resumenCompleto = resultadoIA.analisisGeneral?.resumen ||
          resultadoIA.resumen ||
          'Análisis inteligente de fallos repetidos generado con IA';

        const diagnostico = resultadoIA.analisisGeneral?.diagnosticoPrincipal ||
          resultadoIA.patronesErrores?.causaRaiz ||
          '';

        setAnalisisIA({
          resumen: resumenCompleto,
          diagnostico: diagnostico,
          recomendaciones: recomendaciones.slice(0, 10), // Aumentar a 10 recomendaciones
          patrones: resultadoIA.patronesErrores || {},
          estrategias: estrategias.length > 0 ? estrategias : (resultadoIA.planEstudio?.prioridad || resultadoIA.fortalezas || []),
          intervencionAsesor: resultadoIA.intervencionAsesor || null,
          planIntervencion: resultadoIA.planIntervencion || null,
          desdeCache: resultadoIA.desdeCache || false
        });
      }
    } catch (e) {
      console.warn('Error al generar análisis con IA, usando análisis básico:', e);
      // Si falla la IA, simplemente no mostramos el análisis IA pero mantenemos el básico
    } finally {
      setLoadingIA(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
          <span className="text-sm font-medium">Analizando fallos repetidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!analisis || analisis.preguntasProblematicas.length === 0) {
    if (totalIntentos < 2) {
      return (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 mb-5">
          <div className="flex items-center gap-3 text-indigo-700">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold">Analizador Inteligente Preparado</p>
              <p className="text-xs text-indigo-600 mt-0.5">Cuando el estudiante realice más de un intento, aquí aparecerá un análisis automático de sus fallos repetidos para ayudarte a asesorarlo mejor.</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const { preguntasProblematicas, estadisticas } = analisis;

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-red-50/20 p-5 shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-md">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            Análisis de Fallos Repetidos
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Se detectaron {preguntasProblematicas.length} pregunta{preguntasProblematicas.length !== 1 ? 's' : ''} con fallos repetidos
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-amber-200 bg-white/60 p-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{estadisticas.preguntasSiempreFalladas}</div>
          <div className="text-xs text-slate-600">Siempre falló</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-white/60 p-3 text-center">
          <div className="text-2xl font-bold text-orange-700">{estadisticas.preguntasConProblemas}</div>
          <div className="text-xs text-slate-600">Con problemas</div>
        </div>
        <div className="rounded-lg border border-red-200 bg-white/60 p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{estadisticas.porcentajeProblemas}%</div>
          <div className="text-xs text-slate-600">% Problemas</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/60 p-3 text-center">
          <div className="text-2xl font-bold text-slate-700">{estadisticas.totalIntentosAnalizados}</div>
          <div className="text-xs text-slate-600">Intentos analizados</div>
        </div>
      </div>

      {/* Lista de preguntas problemáticas */}
      <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
        {preguntasProblematicas.slice(0, 5).map((preg, idx) => {
          const porcentajeFallo = ((preg.fallos / preg.totalIntentos) * 100).toFixed(0);
          return (
            <div
              key={preg.id || idx}
              className="rounded-lg border border-amber-200 bg-white/80 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Pregunta {preg.orden || 'N/A'}
                    </span>
                    {preg.siempreFallo && (
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        Siempre falló
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">
                    <MathText text={preg.enunciado || ''} />
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Falló {preg.fallos} de {preg.totalIntentos} intentos ({porcentajeFallo}%)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {preguntasProblematicas.length > 5 && (
          <div className="text-center text-xs text-slate-500 py-2">
            +{preguntasProblematicas.length - 5} pregunta{preguntasProblematicas.length - 5 !== 1 ? 's' : ''} más
          </div>
        )}
      </div>

      {/* Botón para generar análisis con IA (solo si el asesor lo desea) */}
      {mostrarBotonIA && !analisisIA && !loadingIA && (
        <div className="rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">Análisis Inteligente con IA Disponible</h4>
                <p className="text-xs text-purple-700 mt-0.5">
                  Obtén recomendaciones personalizadas y análisis profundo de patrones de errores
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerarAnalisisIA}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all hover:shadow-lg"
            >
              <Brain className="h-4 w-4" />
              Generar Análisis con IA
            </button>
          </div>
        </div>
      )}

      {/* Análisis con IA */}
      {loadingIA && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Generando análisis inteligente con IA...</span>
          </div>
        </div>
      )}

      {analisisIA && !loadingIA && (
        <div className="rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/20 p-5 shadow-lg mt-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 shadow-md">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900">Análisis Inteligente con IA</h4>
                  {analisisIA.desdeCache && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Desde caché</span>
                  )}
                </div>
                <button
                  onClick={() => setMostrarModalAnalisis(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver Análisis Completo
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-3">{analisisIA.resumen}</p>

              {/* Intervención del Asesor (nuevo - más importante) */}
              {analisisIA.intervencionAsesor && (
                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                  <h5 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Intervención Recomendada para el Asesor
                  </h5>
                  <div className="space-y-3">
                    {analisisIA.intervencionAsesor.queEnsenar && (
                      <div className="bg-white/80 p-3 rounded border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-1">📚 QUÉ enseñar:</p>
                        <p className="text-sm text-slate-800">{analisisIA.intervencionAsesor.queEnsenar}</p>
                      </div>
                    )}
                    {analisisIA.intervencionAsesor.comoEnsenarlo && (
                      <div className="bg-white/80 p-3 rounded border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-1">🎯 CÓMO enseñarlo:</p>
                        <p className="text-sm text-slate-800">{analisisIA.intervencionAsesor.comoEnsenarlo}</p>
                      </div>
                    )}
                    {analisisIA.intervencionAsesor.verificacionAprendizaje && (
                      <div className="bg-white/80 p-3 rounded border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-1">✅ Cómo verificar que aprendió:</p>
                        <p className="text-sm text-slate-800">{analisisIA.intervencionAsesor.verificacionAprendizaje}</p>
                      </div>
                    )}
                    {analisisIA.intervencionAsesor.tiempoEstimado && (
                      <div className="bg-white/80 p-3 rounded border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-700 mb-1">⏱️ Tiempo estimado:</p>
                        <p className="text-sm text-slate-800">{analisisIA.intervencionAsesor.tiempoEstimado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recomendaciones personalizadas de IA */}
              {analisisIA.recomendaciones && analisisIA.recomendaciones.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="font-semibold text-purple-900 text-sm">Recomendaciones Específicas:</h5>
                  <ul className="space-y-2">
                    {analisisIA.recomendaciones.slice(0, 8).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-purple-800 bg-white/60 p-2.5 rounded-lg border border-purple-100">
                        <MessageCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estrategias de estudio */}
              {analisisIA.estrategias && analisisIA.estrategias.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h5 className="font-semibold text-indigo-900 text-sm">Estrategias de Estudio:</h5>
                  <ul className="space-y-1.5">
                    {analisisIA.estrategias.slice(0, 3).map((estr, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-indigo-800 bg-white/60 p-2 rounded">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>{estr.materia || 'General'}:</strong> {estr.enfoque || estr.actividad}
                          {estr.tiempo && <span className="text-indigo-600"> ({estr.tiempo})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Temas comunes identificados */}
      {analisis?.estadisticas?.temasComunes && analisis.estadisticas.temasComunes.length > 0 && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 mb-4">
          <h4 className="font-semibold text-indigo-900 mb-2 text-sm">Áreas de conocimiento identificadas:</h4>
          <div className="flex flex-wrap gap-2">
            {analisis.estadisticas.temasComunes.map((tema, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800"
              >
                <BookOpen className="h-3 w-3" />
                {tema.categoria} ({tema.frecuencia} referencia{tema.frecuencia !== 1 ? 's' : ''})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones básicas inteligentes (siempre disponibles, no dependen de IA) - MEJORADAS */}
      {analisis?.recomendacionesBasicas && analisis.recomendacionesBasicas.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-3">Recomendaciones de Apoyo Detalladas</h4>
              <div className="space-y-3">
                {analisis.recomendacionesBasicas.map((rec, idx) => {
                  const colorClass = rec.tipo === 'urgente' ? 'border-red-200 bg-red-50' :
                    rec.tipo === 'positivo' ? 'border-green-200 bg-green-50' :
                      rec.tipo === 'tendencia' ? 'border-orange-200 bg-orange-50' :
                        rec.tipo === 'seguimiento' ? 'border-indigo-200 bg-indigo-50' :
                          'border-blue-200 bg-blue-50';
                  const iconColor = rec.tipo === 'urgente' ? 'text-red-600' :
                    rec.tipo === 'positivo' ? 'text-green-600' :
                      rec.tipo === 'tendencia' ? 'text-orange-600' :
                        rec.tipo === 'seguimiento' ? 'text-indigo-600' :
                          'text-blue-600';

                  return (
                    <div key={idx} className={`rounded-lg border p-3 ${colorClass}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {rec.tipo === 'urgente' && <AlertTriangle className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />}
                        {rec.tipo === 'positivo' && <TrendingDown className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5 rotate-180`} />}
                        {rec.tipo === 'tendencia' && <TrendingDown className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />}
                        {(rec.tipo === 'tipo_pregunta' || rec.tipo === 'general') && <BookOpen className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />}
                        {rec.tipo === 'seguimiento' && <Users className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />}
                        <h5 className="font-semibold text-sm flex-1">{rec.titulo}</h5>
                      </div>
                      <p className="text-xs text-slate-700 mb-2 ml-6">{rec.descripcion}</p>
                      <p className="text-xs font-medium text-slate-800 ml-6 mb-2">
                        <strong>Acción sugerida:</strong> {rec.accion}
                      </p>

                      {/* Estrategias específicas si están disponibles */}
                      {rec.estrategias && rec.estrategias.length > 0 && (
                        <div className="ml-6 mt-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Estrategias específicas:</p>
                          <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                            {rec.estrategias.map((estr, eIdx) => (
                              <li key={eIdx}>{estr}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Plan sugerido si está disponible */}
                      {rec.planSugerido && (
                        <div className="ml-6 mt-2 p-2 bg-white/60 rounded border border-slate-200">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Plan sugerido:</p>
                          <p className="text-xs text-slate-600">
                            <strong>Frecuencia:</strong> {rec.planSugerido.frecuencia} •
                            <strong> Duración:</strong> {rec.planSugerido.duracion} •
                            <strong> Enfoque:</strong> {rec.planSugerido.enfoque}
                          </p>
                        </div>
                      )}

                      {/* Métricas de seguimiento si están disponibles */}
                      {rec.metricas && rec.metricas.length > 0 && (
                        <div className="ml-6 mt-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Métricas a monitorear:</p>
                          <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                            {rec.metricas.map((met, mIdx) => (
                              <li key={mIdx}>{met}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preguntas relacionadas si están disponibles */}
                      {rec.preguntasRelacionadas && rec.preguntasRelacionadas.length > 0 && (
                        <div className="ml-6 mt-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Preguntas relacionadas:</p>
                          <div className="space-y-1">
                            {rec.preguntasRelacionadas.map((preg, pIdx) => (
                              <div key={pIdx} className="text-xs text-slate-600 bg-white/60 p-1.5 rounded border border-slate-200">
                                <span className="font-medium">Pregunta {preg.orden}:</span> <MathText text={preg.enunciado || ''} />
                                {preg.tipo && <span className="text-slate-500 ml-1">({preg.tipo})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones genéricas solo si no hay recomendaciones básicas */}
      {(!analisis?.recomendacionesBasicas || analisis.recomendacionesBasicas.length === 0) && !analisisIA && !loadingIA && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">Recomendaciones de Apoyo</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Reforzar conceptos:</strong> El estudiante necesita repasar los temas relacionados con las preguntas identificadas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Asesoría personalizada:</strong> Considera programar una sesión de asesoría para abordar estas áreas problemáticas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Feedback específico:</strong> Proporciona retroalimentación detallada sobre las preguntas que siempre falló.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {mostrarModalAnalisis && analisisIACompleto && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header de la modal - Mismo estilo que quiz y simuladores */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-b border-slate-200/60 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg flex-shrink-0">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">Análisis Completo con IA</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">Análisis detallado del rendimiento del estudiante</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalAnalisis(false)}
                className="ml-2 sm:ml-4 rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Contenido de la modal - Scrollable - Scrollbars ocultos */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-b from-slate-50/50 to-white space-y-4 sm:space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Mensaje si no hay datos */}
              {!analisisIACompleto && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">No hay datos de análisis disponibles</p>
                </div>
              )}

              {/* Análisis General */}
              {(analisisIACompleto?.analisisGeneral || analisisIACompleto?.resumen) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-5 border border-blue-200">
                  <h4 className="font-bold text-blue-900 text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Análisis General</span>
                  </h4>
                  {(analisisIACompleto.analisisGeneral?.resumen || analisisIACompleto.resumen) && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Resumen:</p>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {analisisIACompleto.analisisGeneral?.resumen || analisisIACompleto.resumen}
                      </p>
                    </div>
                  )}
                  {(analisisIACompleto.analisisGeneral?.diagnosticoPrincipal || analisisIACompleto.diagnostico) && (
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Diagnóstico Principal:</p>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {analisisIACompleto.analisisGeneral?.diagnosticoPrincipal || analisisIACompleto.diagnostico}
                      </p>
                    </div>
                  )}
                  {analisisIACompleto.analisisGeneral?.nivelUrgencia && (
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">Nivel de Urgencia:</p>
                      <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${analisisIACompleto.analisisGeneral.nivelUrgencia === 'Alta' ? 'bg-red-100 text-red-800' :
                        analisisIACompleto.analisisGeneral.nivelUrgencia === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {analisisIACompleto.analisisGeneral.nivelUrgencia}
                      </span>
                      {analisisIACompleto.analisisGeneral.razonUrgencia && (
                        <p className="text-[10px] sm:text-xs text-slate-600 mt-1">{analisisIACompleto.analisisGeneral.razonUrgencia}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Patrones de Errores */}
              {analisisIACompleto.patronesErrores && Object.keys(analisisIACompleto.patronesErrores).length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 sm:p-5 border border-orange-200">
                  <h4 className="font-bold text-orange-900 text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Patrones de Errores Identificados</span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {analisisIACompleto.patronesErrores.temaComun && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-800 mb-1">Tema Común:</p>
                        <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.patronesErrores.temaComun}</p>
                      </div>
                    )}
                    {analisisIACompleto.patronesErrores.tipoErrorDominante && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-800 mb-1">Tipo de Error Dominante:</p>
                        <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.patronesErrores.tipoErrorDominante}</p>
                      </div>
                    )}
                    {analisisIACompleto.patronesErrores.causaRaiz && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-800 mb-1">Causa Raíz:</p>
                        <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.patronesErrores.causaRaiz}</p>
                      </div>
                    )}
                    {analisisIACompleto.patronesErrores.patronDetectado && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-800 mb-1">Patrón Detectado:</p>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{analisisIACompleto.patronesErrores.patronDetectado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Intervención del Asesor */}
              {analisisIACompleto.intervencionAsesor && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 sm:p-5 border-2 border-indigo-300">
                  <h4 className="font-bold text-indigo-900 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Intervención Recomendada para el Asesor</span>
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    {analisisIACompleto.intervencionAsesor.queEnsenar && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1.5 sm:mb-2">📚 QUÉ enseñar:</p>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{analisisIACompleto.intervencionAsesor.queEnsenar}</p>
                      </div>
                    )}
                    {analisisIACompleto.intervencionAsesor.comoEnsenarlo && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1.5 sm:mb-2">🎯 CÓMO enseñarlo:</p>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{analisisIACompleto.intervencionAsesor.comoEnsenarlo}</p>
                      </div>
                    )}
                    {Array.isArray(analisisIACompleto.intervencionAsesor.ejerciciosEspecificos) && analisisIACompleto.intervencionAsesor.ejerciciosEspecificos.length > 0 && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1.5 sm:mb-2">✏️ Ejercicios Específicos:</p>
                        <ul className="space-y-1.5 sm:space-y-2">
                          {analisisIACompleto.intervencionAsesor.ejerciciosEspecificos.map((ej, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                              <span className="text-indigo-600 mt-0.5 flex-shrink-0">•</span>
                              <span>{ej}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analisisIACompleto.intervencionAsesor.verificacionAprendizaje && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1.5 sm:mb-2">✅ Cómo verificar que aprendió:</p>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{analisisIACompleto.intervencionAsesor.verificacionAprendizaje}</p>
                      </div>
                    )}
                    {analisisIACompleto.intervencionAsesor.tiempoEstimado && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1.5 sm:mb-2">⏱️ Tiempo estimado:</p>
                        <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.intervencionAsesor.tiempoEstimado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preguntas Problemáticas Detalladas */}
              {Array.isArray(analisisIACompleto.preguntasProblematicas) && analisisIACompleto.preguntasProblematicas.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 sm:p-5 border border-red-200">
                  <h4 className="font-bold text-red-900 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Preguntas Problemáticas Detalladas</span>
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    {analisisIACompleto.preguntasProblematicas.map((preg, idx) => (
                      <div key={idx} className="bg-white/80 p-3 sm:p-4 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                          <h5 className="font-semibold text-red-900 text-sm sm:text-base">Pregunta {preg.orden || idx + 1}</h5>
                          {preg.vecesFallada && (
                            <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                              Falló {preg.vecesFallada} vez{preg.vecesFallada !== 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                        {preg.enunciado && (
                          <p className="text-[10px] sm:text-xs text-slate-600 mb-1.5 sm:mb-2 italic">"{preg.enunciado}"</p>
                        )}
                        {preg.conceptoNoDomina && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Concepto que no domina:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{preg.conceptoNoDomina}</p>
                          </div>
                        )}
                        {preg.errorEspecifico && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Error específico:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{preg.errorEspecifico}</p>
                          </div>
                        )}
                        {preg.porQueFalla && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Por qué falla:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{preg.porQueFalla}</p>
                          </div>
                        )}
                        {preg.analisis && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Análisis detallado:</p>
                            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                              <MathText text={preg.analisis} />
                            </div>
                          </div>
                        )}
                        {preg.queEnsenar && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Qué enseñar:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{preg.queEnsenar}</p>
                          </div>
                        )}
                        {preg.comoEnsenar && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Cómo enseñar:</p>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{preg.comoEnsenar}</p>
                          </div>
                        )}
                        {preg.ejercicioPractica && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-red-700 mb-0.5 sm:mb-1">Ejercicio de práctica:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{preg.ejercicioPractica}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones Personalizadas */}
              {Array.isArray(analisisIACompleto.recomendacionesPersonalizadas) && analisisIACompleto.recomendacionesPersonalizadas.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 sm:p-5 border border-purple-200">
                  <h4 className="font-bold text-purple-900 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span>Recomendaciones Personalizadas</span>
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {analisisIACompleto.recomendacionesPersonalizadas.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3 bg-white/80 p-2.5 sm:p-3 rounded-lg border border-purple-100">
                        <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-slate-800 flex-1 leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plan de Intervención */}
              {analisisIACompleto.planIntervencion && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                  <h4 className="font-bold text-green-900 text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Plan de Intervención
                  </h4>
                  <div className="space-y-4">
                    {analisisIACompleto.planIntervencion.sesion1 && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2 sm:mb-3 text-sm sm:text-base">Sesión 1</h5>
                        {analisisIACompleto.planIntervencion.sesion1.objetivo && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-green-700 mb-0.5 sm:mb-1">Objetivo:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.planIntervencion.sesion1.objetivo}</p>
                          </div>
                        )}
                        {Array.isArray(analisisIACompleto.planIntervencion.sesion1.actividades) && analisisIACompleto.planIntervencion.sesion1.actividades.length > 0 && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-green-700 mb-0.5 sm:mb-1">Actividades:</p>
                            <ul className="space-y-0.5 sm:space-y-1">
                              {analisisIACompleto.planIntervencion.sesion1.actividades.map((act, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analisisIACompleto.planIntervencion.sesion1.duracion && (
                          <p className="text-[10px] sm:text-xs text-slate-600">Duración: {analisisIACompleto.planIntervencion.sesion1.duracion}</p>
                        )}
                      </div>
                    )}
                    {analisisIACompleto.planIntervencion.sesion2 && (
                      <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2 sm:mb-3 text-sm sm:text-base">Sesión 2</h5>
                        {analisisIACompleto.planIntervencion.sesion2.objetivo && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-green-700 mb-0.5 sm:mb-1">Objetivo:</p>
                            <p className="text-xs sm:text-sm text-slate-800">{analisisIACompleto.planIntervencion.sesion2.objetivo}</p>
                          </div>
                        )}
                        {Array.isArray(analisisIACompleto.planIntervencion.sesion2.actividades) && analisisIACompleto.planIntervencion.sesion2.actividades.length > 0 && (
                          <div className="mb-1.5 sm:mb-2">
                            <p className="text-[10px] sm:text-xs font-semibold text-green-700 mb-0.5 sm:mb-1">Actividades:</p>
                            <ul className="space-y-0.5 sm:space-y-1">
                              {analisisIACompleto.planIntervencion.sesion2.actividades.map((act, idx) => (
                                <li key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analisisIACompleto.planIntervencion.sesion2.duracion && (
                          <p className="text-[10px] sm:text-xs text-slate-600">Duración: {analisisIACompleto.planIntervencion.sesion2.duracion}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estrategias de Estudio */}
              {((Array.isArray(analisisIACompleto.estrategiasEstudio) && analisisIACompleto.estrategiasEstudio.length > 0) ||
                (Array.isArray(analisisIACompleto.estrategias) && analisisIACompleto.estrategias.length > 0)) && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 sm:p-5 border border-blue-200">
                    <h4 className="font-bold text-blue-900 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>Estrategias de Estudio</span>
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {(analisisIACompleto.estrategiasEstudio || analisisIACompleto.estrategias || []).map((estr, idx) => (
                        <div key={idx} className="bg-white/80 p-3 sm:p-4 rounded-lg border border-blue-200">
                          {(estr.materia || estr.actividad?.materia) && (
                            <h5 className="font-semibold text-blue-800 mb-1.5 sm:mb-2 text-sm sm:text-base">{estr.materia || estr.actividad?.materia}</h5>
                          )}
                          {(estr.enfoque || estr.actividad?.enfoque || estr.actividad?.actividad) && (
                            <p className="text-xs sm:text-sm text-slate-800 mb-1">
                              <strong>Enfoque:</strong> {estr.enfoque || estr.actividad?.enfoque || estr.actividad?.actividad}
                            </p>
                          )}
                          {estr.actividadEspecifica && (
                            <p className="text-xs sm:text-sm text-slate-800 mb-1"><strong>Actividad:</strong> {estr.actividadEspecifica}</p>
                          )}
                          {(estr.tiempo || estr.actividad?.tiempo) && (
                            <p className="text-[10px] sm:text-xs text-slate-600"><strong>Tiempo:</strong> {estr.tiempo || estr.actividad?.tiempo}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer de la modal - Mismo estilo que quiz y simuladores */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <button
                onClick={() => setMostrarModalAnalisis(false)}
                className="rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

