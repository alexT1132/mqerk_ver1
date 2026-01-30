# Configuración de Proveedores de IA (Gemini y Groq)

Este documento explica cómo configurar y usar los diferentes proveedores de IA en la plataforma.

## Proveedores Soportados

- **Google Gemini**: Proveedor principal, ideal para análisis complejos
- **Groq**: Proveedor alternativo, ideal para respuestas rápidas

## Configuración del Servidor

### Variables de Entorno

Agregar al archivo `server/.env`:

```env
# Gemini API Keys (puedes tener múltiples por propósito)
GEMINI_API_KEY=tu_api_key_gemini
GEMINI_API_KEY_QUIZZES_1=tu_api_key_quizzes_1
GEMINI_API_KEY_QUIZZES_2=tu_api_key_quizzes_2
GEMINI_API_KEY_SIMULADORES_1=tu_api_key_simuladores_1
GEMINI_API_KEY_ANALISIS_1=tu_api_key_analisis_1
GEMINI_API_KEY_FORMULAS_1=tu_api_key_formulas_1

# Groq API Keys
GROQ_API_KEY=tu_api_key_groq
GROQ_API_KEY_QUIZZES_1=tu_api_key_groq_quizzes_1
GROQ_API_KEY_ANALISIS_1=tu_api_key_groq_analisis_1
```

### Obtener API Keys

#### Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuevo proyecto o selecciona uno existente
3. Genera una API key
4. Copia la key al archivo `.env`

#### Groq
1. Ve a [Groq Console](https://console.groq.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el menú
4. Genera una nueva API key
5. Copia la key al archivo `.env`

## Migración de Base de Datos

Ejecutar la migración para agregar soporte de proveedores:

```sql
-- Ejecutar: server/migrations/009_add_proveedor_to_ai_usage_log.sql
```

O ejecutar manualmente:

```sql
ALTER TABLE `ai_usage_log` 
ADD COLUMN IF NOT EXISTS `proveedor` VARCHAR(20) DEFAULT 'gemini' 
COMMENT 'Proveedor de IA usado: gemini o groq' 
AFTER `modelo_usado`;
```

## Uso en el Código

### Backend

#### Usar Gemini (por defecto)
```javascript
// En cualquier controlador
const response = await fetch('/api/ai/gemini/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Tu prompt aquí' }] }],
    purpose: 'analisis',
    model: 'gemini-2.5-flash'
  })
});
```

#### Usar Groq
```javascript
const response = await fetch('/api/ai/groq/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Tu prompt aquí' }] }],
    purpose: 'analisis',
    model: 'llama-3.1-70b-versatile',
    proveedor: 'groq'
  })
});
```

### Frontend

#### Usar servicio unificado
```javascript
import { generarAnalisisConAI } from '@/service/unifiedAIService.js';

// Con proveedor específico
const analisis = await generarAnalisisConAI(datosAnalisis, {
  proveedor: 'groq'
});

// Con fallback automático
const analisis = await generarAnalisisConAI(datosAnalisis, {
  proveedor: 'groq',
  fallback: true // Si Groq falla, intenta con Gemini
});
```

#### Usar servicios individuales
```javascript
// Gemini
import { generarAnalisisConGemini } from '@/service/geminiService.js';
const analisis = await generarAnalisisConGemini(datosAnalisis);

// Groq
import { generarAnalisisConGroq } from '@/service/groqService.js';
const analisis = await generarAnalisisConGroq(datosAnalisis);
```

## Límites de Uso

El sistema incluye un sistema de límites de uso configurable:

### Configuración en Base de Datos

La tabla `ai_quota_config` controla los límites:

- **Límites por rol**: Estudiantes, Asesores, Administradores
- **Límites globales**: Para toda la aplicación
- **Límites diarios y mensuales**: Separados para cada tipo

### Verificar Límites

Los límites se verifican automáticamente mediante el middleware `verificarLimitesAI`.

### Obtener Estadísticas de Uso

```javascript
import { getUserUsageStats } from '@/models/ai_quota.model.js';

const stats = await getUserUsageStats(userId, role);
// Retorna: { daily: { used, limit, remaining, percentage }, monthly: {...} }
```

## Modelos Disponibles

### Gemini
- `gemini-2.5-flash` (por defecto, rápido)
- `gemini-2.5-pro` (más potente)
- `gemini-1.5-flash` (versión anterior)

### Groq
- `llama-3.1-70b-versatile` (por defecto, más potente)
- `llama-3.1-8b-instant` (rápido)
- `mixtral-8x7b-32768` (alta calidad)
- `gemma-7b-it` (optimizado para instrucciones)

## Optimizaciones Implementadas

1. **Rotación de API Keys**: Distribuye la carga entre múltiples keys
2. **Sistema de Cooldown**: Evita rate limits automáticamente
3. **Caché**: Respuestas cacheadas por 6 horas (configurable)
4. **Fallback Automático**: Cambia de modelo si uno falla
5. **Logging Detallado**: Registra cada uso en `ai_usage_log`

## Monitoreo

### Ver Uso en Base de Datos

```sql
-- Uso diario por usuario
SELECT id_usuario, COUNT(*) as usos, proveedor
FROM ai_usage_log
WHERE DATE(timestamp) = CURDATE()
GROUP BY id_usuario, proveedor;

-- Uso por proveedor
SELECT proveedor, COUNT(*) as total, 
       SUM(CASE WHEN exito = 1 THEN 1 ELSE 0 END) as exitosos
FROM ai_usage_log
WHERE DATE(timestamp) = CURDATE()
GROUP BY proveedor;
```

## Troubleshooting

### Error: API_KEY_MISSING
- Verificar que las variables de entorno estén en `server/.env`
- Reiniciar el servidor después de agregar variables

### Error: Rate Limit (429)
- El sistema automáticamente rota entre keys y aplica cooldown
- Considera agregar más API keys para el propósito específico

### Error: Límite de uso alcanzado
- Verificar límites en `ai_quota_config`
- Los límites se resetean diariamente/mensualmente automáticamente

## Próximas Mejoras

- [ ] Dashboard de monitoreo de uso
- [ ] Notificaciones cuando se alcanza 80% del límite
- [ ] Configuración de límites desde el panel de administración
- [ ] Análisis de costos por proveedor
- [ ] Selección automática de proveedor según tipo de tarea

