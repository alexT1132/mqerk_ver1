# Sugerencias Inteligentes Personalizadas

Esta sección complementa el análisis IA con lógica pedagógica local para asegurar valor incluso en escenarios de límite de cuota.

## Qué genera
1. Diagnóstico de Causas Probables (por materia < 70%)
2. Plan de 7 días (ciclos cortos adaptados a debilidades)
3. Estrategia de apalancamiento de fortalezas (materias >= 80%)
4. Quick tips cognitivos (memoria, práctica, recuperación activa)
5. Botón de copia rápida del plan (JSON estructurado)

## Lógica de clasificación de debilidades
| Rango | Causa Probable | Enfoque |
|-------|----------------|---------|
| < 55  | Déficit de fundamentos básicos | Reconstrucción conceptual, ejemplos simples |
| 55-62 | Baja consolidación conceptual | Mapas, resúmenes, micro-quizzes |
| 63-69 | Necesita más práctica aplicada | Ejercicios cronometrados + revisión de errores |

## Plan de 7 días
- Días 1-2: Fundamentos / Reconstrucción
- Días 3-4: Práctica guiada estructurada
- Días 5-6: Simulacros cortos + análisis de errores
- Día 7: Repaso + autoevaluación

## Extensión futura (sugerida)
- Integrar carga de recursos específicos desde backend (tabla recursos_educativos)
- Añadir tracking de cumplimiento diario (persistencia en backend)
- Generar variantes del plan según disponibilidad declarada del usuario
- Añadir modo intensivo (doble sesión para materias < 50%)

## Integración
La función `generarSugerenciasPersonalizadas` se ejecuta después de recibir el resultado IA o fallback y utiliza:
- `promediosPorMateria` (promedios, mejor, último)
- Clasificación simple para definir causa / acción.

## Accesibilidad y UX
- Se colapsa/expande.
- Uso de tamaño de fuente compacto para móviles.
- Sin llamadas de red adicionales.

Última actualización automática.
