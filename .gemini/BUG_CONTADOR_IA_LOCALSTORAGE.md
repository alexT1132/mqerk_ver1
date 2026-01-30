# 🐛 Bug Crítico: Contador de Análisis IA se Resetea

## 📋 Problema Identificado

**Síntoma**:
- El contador de usos de análisis IA se resetea al refrescar la página
- Si tenía 1 uso restante, al refrescar vuelve a tener 5 usos
- Esto ocurre tanto en **Simulaciones** como en **Quizzes**

**Causa Raíz**:
El contador está almacenado en **localStorage** (navegador), no en la **base de datos**.

---

## 🔍 Código Actual (Problemático)

### Ubicación: `SimulacionGraficaHistorial.jsx` (líneas 136-175)

```javascript
// ❌ PROBLEMA: Usa localStorage (se borra al refrescar)
const AI_USAGE_KEY = 'ai_analysis_usage';
const DAILY_LIMIT = userRole === 'asesor' || userRole === 'admin' ? 20 : 5;

const getUsageToday = () => {
  try {
    const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
    }
    return {
      count: data.count || 0,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - (data.count || 0))
    };
  } catch {
    return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
  }
};

const incrementUsage = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
    if (data.date !== today) {
      localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT }));
    } else {
      data.count = (data.count || 0) + 1;
      localStorage.setItem(AI_USAGE_KEY, JSON.stringify(data));
    }
    const newUsage = getUsageToday();
    setAiUsage(newUsage);
  } catch (e) {
    console.error('Error incrementando uso de IA:', e);
  }
};
```

**Problemas**:
1. ❌ `localStorage` se puede borrar fácilmente (Ctrl+Shift+Del, modo incógnito, etc.)
2. ❌ Se resetea al cambiar de navegador
3. ❌ No es confiable para límites de uso
4. ❌ El usuario puede manipularlo desde DevTools

---

## ✅ Solución: Mover a Base de Datos

### 1. **Crear Tabla en Base de Datos**

```sql
CREATE TABLE ai_usage_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'simulacion' | 'quiz'
  contador INT DEFAULT 0,
  limite_diario INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_date_type (id_estudiante, fecha, tipo),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE
);
```

**Campos**:
- `id_estudiante`: ID del estudiante
- `fecha`: Fecha del uso (YYYY-MM-DD)
- `tipo`: 'simulacion' o 'quiz' (para separar contadores)
- `contador`: Número de análisis usados hoy
- `limite_diario`: Límite según rol (5 para estudiantes, 20 para asesores)

---

### 2. **Crear Endpoints en Backend**

#### **GET** `/api/ai-usage/:studentId/:type`
Obtener el uso actual del día

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 3,
    "limit": 5,
    "remaining": 2,
    "date": "2026-01-29"
  }
}
```

#### **POST** `/api/ai-usage/:studentId/:type/increment`
Incrementar el contador

**Response**:
```json
{
  "success": true,
  "data": {
    "count": 4,
    "limit": 5,
    "remaining": 1,
    "date": "2026-01-29"
  }
}
```

---

### 3. **Actualizar Frontend**

#### Archivo: `SimulacionGraficaHistorial.jsx`

**ANTES** (localStorage):
```javascript
const getUsageToday = () => {
  const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
  // ...
};

const incrementUsage = () => {
  localStorage.setItem(AI_USAGE_KEY, JSON.stringify(data));
  // ...
};
```

**DESPUÉS** (base de datos):
```javascript
const getUsageToday = async () => {
  try {
    const studentId = idEstudiante || alumno?.id || user?.id;
    if (!studentId) return { count: 0, limit: 5, remaining: 5 };
    
    const response = await api.get(`/ai-usage/${studentId}/simulacion`);
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo uso de IA:', error);
    return { count: 0, limit: 5, remaining: 5 };
  }
};

const incrementUsage = async () => {
  try {
    const studentId = idEstudiante || alumno?.id || user?.id;
    if (!studentId) return;
    
    const response = await api.post(`/ai-usage/${studentId}/simulacion/increment`);
    const newUsage = response.data.data;
    setAiUsage(newUsage);
    console.log('AI Usage incremented:', newUsage);
  } catch (error) {
    console.error('Error incrementando uso de IA:', error);
  }
};
```

---

### 4. **Actualizar useEffect Inicial**

```javascript
useEffect(() => {
  // Cargar uso actual al montar el componente
  const loadUsage = async () => {
    const usage = await getUsageToday();
    setAiUsage(usage);
  };
  loadUsage();
}, [idEstudiante, alumno?.id, user?.id]);
```

---

## 📁 Archivos a Modificar

### Backend:
1. **`server/routes/aiUsageRoutes.js`** (NUEVO)
   - Rutas para GET y POST de uso de IA

2. **`server/controllers/aiUsageController.js`** (NUEVO)
   - Lógica para obtener e incrementar contador

3. **`server/models/aiUsageModel.js`** (NUEVO)
   - Queries a la base de datos

4. **`server/migrations/create_ai_usage_tracking.sql`** (NUEVO)
   - Script SQL para crear la tabla

5. **`server/index.js`**
   - Registrar las rutas de aiUsage

### Frontend:
1. **`client/src/components/simulaciones/SimulacionGraficaHistorial.jsx`**
   - Reemplazar localStorage por llamadas a API

2. **`client/src/components/student/QuizTable.jsx`** (o donde esté el análisis de quizzes)
   - Aplicar el mismo cambio

---

## 🔧 Implementación Backend

### 1. Crear Migración SQL

**Archivo**: `server/migrations/create_ai_usage_tracking.sql`

```sql
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  fecha DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  contador INT DEFAULT 0,
  limite_diario INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_date_type (id_estudiante, fecha, tipo),
  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  INDEX idx_student_date (id_estudiante, fecha),
  INDEX idx_date (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Crear Modelo

**Archivo**: `server/models/aiUsageModel.js`

```javascript
const pool = require('../config/database');

class AiUsageModel {
  // Obtener o crear registro de uso para hoy
  static async getOrCreateUsageToday(studentId, type) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Intentar obtener registro existente
      const [rows] = await pool.query(
        `SELECT * FROM ai_usage_tracking 
         WHERE id_estudiante = ? AND fecha = ? AND tipo = ?`,
        [studentId, today, type]
      );
      
      if (rows.length > 0) {
        const usage = rows[0];
        return {
          count: usage.contador,
          limit: usage.limite_diario,
          remaining: Math.max(0, usage.limite_diario - usage.contador),
          date: usage.fecha
        };
      }
      
      // Si no existe, crear nuevo registro
      await pool.query(
        `INSERT INTO ai_usage_tracking (id_estudiante, fecha, tipo, contador, limite_diario) 
         VALUES (?, ?, ?, 0, 5)`,
        [studentId, today, type]
      );
      
      return {
        count: 0,
        limit: 5,
        remaining: 5,
        date: today
      };
    } catch (error) {
      console.error('Error en getOrCreateUsageToday:', error);
      throw error;
    }
  }
  
  // Incrementar contador
  static async incrementUsage(studentId, type) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Asegurar que existe el registro
      await this.getOrCreateUsageToday(studentId, type);
      
      // Incrementar contador
      await pool.query(
        `UPDATE ai_usage_tracking 
         SET contador = contador + 1 
         WHERE id_estudiante = ? AND fecha = ? AND tipo = ?`,
        [studentId, today, type]
      );
      
      // Retornar nuevo estado
      return await this.getOrCreateUsageToday(studentId, type);
    } catch (error) {
      console.error('Error en incrementUsage:', error);
      throw error;
    }
  }
  
  // Limpiar registros antiguos (opcional, para mantenimiento)
  static async cleanOldRecords(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    try {
      const [result] = await pool.query(
        `DELETE FROM ai_usage_tracking WHERE fecha < ?`,
        [cutoffDateStr]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error en cleanOldRecords:', error);
      throw error;
    }
  }
}

module.exports = AiUsageModel;
```

### 3. Crear Controlador

**Archivo**: `server/controllers/aiUsageController.js`

```javascript
const AiUsageModel = require('../models/aiUsageModel');

class AiUsageController {
  // GET /api/ai-usage/:studentId/:type
  static async getUsage(req, res) {
    try {
      const { studentId, type } = req.params;
      
      // Validar tipo
      if (!['simulacion', 'quiz'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
        });
      }
      
      const usage = await AiUsageModel.getOrCreateUsageToday(studentId, type);
      
      res.json({
        success: true,
        data: usage
      });
    } catch (error) {
      console.error('Error en getUsage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener uso de IA',
        error: error.message
      });
    }
  }
  
  // POST /api/ai-usage/:studentId/:type/increment
  static async incrementUsage(req, res) {
    try {
      const { studentId, type } = req.params;
      
      // Validar tipo
      if (!['simulacion', 'quiz'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo inválido. Debe ser "simulacion" o "quiz"'
        });
      }
      
      // Verificar límite antes de incrementar
      const currentUsage = await AiUsageModel.getOrCreateUsageToday(studentId, type);
      if (currentUsage.remaining <= 0) {
        return res.status(429).json({
          success: false,
          message: 'Límite diario de análisis alcanzado',
          data: currentUsage
        });
      }
      
      const newUsage = await AiUsageModel.incrementUsage(studentId, type);
      
      res.json({
        success: true,
        data: newUsage,
        message: 'Uso incrementado correctamente'
      });
    } catch (error) {
      console.error('Error en incrementUsage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al incrementar uso de IA',
        error: error.message
      });
    }
  }
}

module.exports = AiUsageController;
```

### 4. Crear Rutas

**Archivo**: `server/routes/aiUsageRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const AiUsageController = require('../controllers/aiUsageController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/ai-usage/:studentId/:type
router.get('/:studentId/:type', AiUsageController.getUsage);

// POST /api/ai-usage/:studentId/:type/increment
router.post('/:studentId/:type/increment', AiUsageController.incrementUsage);

module.exports = router;
```

### 5. Registrar Rutas en `server/index.js`

```javascript
// Importar rutas de AI Usage
const aiUsageRoutes = require('./routes/aiUsageRoutes');

// Registrar rutas
app.use('/api/ai-usage', aiUsageRoutes);
```

---

## 🧪 Testing

### 1. Probar Endpoint GET
```bash
GET http://localhost:1002/api/ai-usage/123/simulacion
```

**Response esperado**:
```json
{
  "success": true,
  "data": {
    "count": 0,
    "limit": 5,
    "remaining": 5,
    "date": "2026-01-29"
  }
}
```

### 2. Probar Endpoint POST
```bash
POST http://localhost:1002/api/ai-usage/123/simulacion/increment
```

**Response esperado**:
```json
{
  "success": true,
  "data": {
    "count": 1,
    "limit": 5,
    "remaining": 4,
    "date": "2026-01-29"
  },
  "message": "Uso incrementado correctamente"
}
```

### 3. Probar Límite
Hacer 5 POST seguidos, el 6to debería retornar:
```json
{
  "success": false,
  "message": "Límite diario de análisis alcanzado",
  "data": {
    "count": 5,
    "limit": 5,
    "remaining": 0,
    "date": "2026-01-29"
  }
}
```

---

## ✅ Beneficios de la Solución

1. ✅ **Persistente**: No se borra al refrescar
2. ✅ **Confiable**: No se puede manipular desde DevTools
3. ✅ **Centralizado**: Un solo lugar de verdad
4. ✅ **Auditable**: Historial completo en BD
5. ✅ **Escalable**: Fácil agregar límites por rol
6. ✅ **Seguro**: Validación en backend

---

## 📊 Orden de Implementación

1. ✅ Crear tabla en BD (migración SQL)
2. ✅ Crear modelo (`aiUsageModel.js`)
3. ✅ Crear controlador (`aiUsageController.js`)
4. ✅ Crear rutas (`aiUsageRoutes.js`)
5. ✅ Registrar rutas en `server/index.js`
6. ✅ Actualizar frontend (`SimulacionGraficaHistorial.jsx`)
7. ✅ Actualizar frontend de quizzes
8. ✅ Probar endpoints
9. ✅ Probar flujo completo en UI

---

## 🎯 Resultado Final

**ANTES**:
- Contador en localStorage
- Se resetea al refrescar
- Fácil de manipular

**DESPUÉS**:
- Contador en base de datos
- Persistente y confiable
- Seguro y auditable
- Límites reales por estudiante

**El contador ahora será 100% confiable y no se podrá resetear refrescando la página.**
