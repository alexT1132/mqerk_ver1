# Recomendaciones para Optimizar Uso de Análisis IA (Gemini)

Este documento resume buenas prácticas para reducir errores 429 (quota / rate limit) y mejorar la calidad y costo del análisis.

## 1. Evitar Llamadas Innecesarias
- Generar firma (hash) de datos relevantes: número de intentos, último puntaje, promedios por materia.
- Si la firma no cambia, reutilizar análisis previo (ya implementado en `SimulacionGraficaHistorial.jsx`).
- Definir umbral de cambio mínimo (ej: cambio >= 2 puntos en promedio general) antes de recalcular.

## 2. Backoff y Reintentos
- Reintentos limitados (2) con backoff exponencial + jitter (ya implementado).
- No exceder 3 porque degrada experiencia y cumple poca función si la cuota dura está agotada.

## 3. Cache Local y Persistencia
- Cache en `localStorage` con TTL (ahora 6h). Ajustar según volumen real.
- Guardar también en backend para compartir análisis entre dispositivos y reducir llamadas.
- Endpoint sugerido: `POST /api/analisis-ia` y `GET /api/analisis-ia?simulacion=...`.

## 4. Fallback Heurístico
- Mantener heurística local que produce: resumen, fortalezas, debilidades y plan corto.
- Mostrar badge (Fallback Local) para transparencia.
- Permite continuidad pedagógica sin bloquear al estudiante.

## 5. Monitorización
Registrar (en backend o analytics):
- Total solicitudes.
- % Respuestas IA reales vs cache vs fallback.
- Número de 429 por hora.
- Tiempo medio de respuesta IA.

## 6. Control de Frecuencia (UI)
- Cooldown progresivo: primer 429 => 60s; múltiples consecutivos => aumentar (ej: 60, 120, 300s).
- Deshabilitar botón mientras una petición esté en curso (lock in-flight) — implementado con `enProcesoRef`.

## 7. Optimización del Prompt
- Reducir longitud: solo incluir datos de los últimos N intentos (ej: últimos 10).
- Evitar campos irrelevantes que no cambian.
- Añadir modo resumido cuando la cuota esté baja (toggle futuro `modoAhorro`).

## 8. Gestión de Claves y Cuotas
- No exponer directamente la API key en frontend en producción (usar proxy/backend).
- Configurar límites escalonados en GCP y alertas cuando uso > 80%.

## 9. Estrategia de Degradación
Orden recomendado:
1. IA en vivo.
2. Reintentos con backoff.
3. Cache válido.
4. Fallback Heurístico.
5. Mensaje educativo si todo falla (último recurso).

## 10. Siguientes Mejoras Técnicas
- Hook reutilizable: `useAnalisisIA(datos, opciones)` para desacoplar la lógica.
- Modo batch: agrupar solicitudes de múltiples usuarios en backend (cola / worker).
- Métricas avanzadas: registrar precisión relativa comparando heurístico vs IA.
- Guardar la firma de datos junto con el análisis en BD para trazabilidad.

## 11. Seguridad y Privacidad
- Minimizar datos sensibles enviados al modelo.
- Anonimizar identificadores (usar IDs internos, no nombres reales cuando escale).

## 12. Testing Recomendado
- Test unitario para: firma estable, fallback 429, uso de cache.
- Test de integración simulando secuencia: IA -> cache -> 429 -> fallback.

---
Última actualización: generación automática (branch `miguel/feature-reports`).
