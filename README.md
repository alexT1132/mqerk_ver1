# MQerk Academy - Sistema de Gestión Educativa

EL CHAT DE RESTORAGE ADVISOR ES EL BUENO PAAR CUALQUEIR COSA

![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-38B2AC)

Sistema integral de gestión educativa para preparación de exámenes de admisión universitaria con inteligencia artificial integrada.

## 📋 Descripción

MQerkAcademy es una plataforma educativa completa que combina gestión de estudiantes, asesores y administración con herramientas de inteligencia artificial para optimizar el proceso de preparación para exámenes de admisión (IPN, UNAM, etc.).

El sistema incluye paneles diferenciados por rol, simuladores inteligentes, gestión académica completa, sistema financiero y comunicación en tiempo real.

##  Arquitectura

### Estructura del Proyecto
```
mqerk_ver1-Miguel-el-Angel/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/    # Componentes React organizados por rol
│   │   ├── pages/        # Páginas principales
│   │   ├── service/      # Servicios API (IA, estudiantes, etc.)
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilidades
├── server/                # Backend Node.js + Express
│   ├── controllers/      # Controladores de API
│   ├── models/          # Modelos de base de datos
│   ├── routes/          # Rutas de API
│   ├── middlewares/     # Middlewares de autenticación
│   └── services/        # Servicios de backend
├── base de datos/        # Scripts SQL y estructura
├── docs/                # Documentación
└── uploads/             # Archivos subidos
```

### Stack Tecnológico

**Frontend:**
- React 19.1.0 con Functional Components y Hooks
- Vite 6.3.5 para build y desarrollo rápido
- TailwindCSS 4.1.7 para estilos
- Material-UI (MUI) para componentes UI
- React Router DOM 6.30.1 para navegación
- Axios para peticiones HTTP

**Backend:**
- Node.js con Express 5.1.0
- MySQL 8.0 con mysql2/promise
- JWT para autenticación
- WebSockets para chat en tiempo real
- Multer para manejo de archivos
- Nodemon para desarrollo

**Inteligencia Artificial:**
- Google Gemini API (gemini-2.5-flash)
- Groq API (llama-3.1-70b-versatile)
- Sistema unificado con fallback automático
- Rotación de API keys y rate limiting

**Base de Datos:**
- MySQL con 50+ tablas normalizadas
- Modelos para estudiantes, asesores, actividades, pagos, etc.
- Sistema de soft deletes y auditoría

##  Características Principales

### 1. Sistema de Roles Multi-nivel
- **Estudiantes**: Panel completo con métricas, cursos, actividades, simuladores
- **Asesores**: Gestión de estudiantes, recursos, calificaciones, chat
- **Administradores**: Control total del sistema, finanzas, configuración

### 2. Gestión Académica Avanzada
- **Actividades y Tareas**: Sistema de entrega con fechas límite y calificación
- **Quizzes**: Exámenes rápidos con modo seguro anti-copia
- **Simuladores**: Exámenes completos tipo admisión con IA
- **Calendario**: Eventos académicos, pagos, asesorías
- **Asistencia**: Control de presencia en clases y entregas

### 3. Inteligencia Artificial Integrada
- **Generación de Preguntas**: Creación automática de preguntas para simuladores
- **Análisis de Respuestas**: Evaluación automática con feedback
- **Sistema de Límites**: Control de uso por rol y período
- **Multi-proveedor**: Gemini y Groq con fallback automático

### 4. Sistema Financiero
- **Gestión de Pagos**: Métodos de pago (transferencia, efectivo)
- **Comprobantes**: Subida y validación de comprobantes
- **Presupuestos**: Control de gastos fijos y variables
- **Contratos**: Generación y firma digital de contratos

### 5. Comunicación y Colaboración
- **Chat en Tiempo Real**: Comunicación estudiante-asesor
- **Notificaciones**: Sistema de notificaciones push
- **Recordatorios**: Recordatorios automáticos por email
- **Recursos Educativos**: Biblioteca digital compartida

### 6. Métricas y Analytics
- **Dashboard Estudiantil**: Progreso visual con gráficas
- **Reportes de Rendimiento**: Análisis por área y tema
- **Exportación**: Excel, PDF para reportes
- **Logs de Actividad**: Auditoría completa del sistema

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- MySQL 8.0+
- Git

### 1. Clonar el Repositorio
```bash
git clone <repo-url>
cd mqerk_ver1-Miguel-el-Angel
```

### 2. Configurar Base de Datos
```bash
# Importar estructura inicial
mysql -u root -p < "base de datos/mqerkacademy.sql"
```

### 3. Configurar Variables de Entorno
```bash
# Crear archivo .env en server/
cp server/.env.example server/.env
# Editar con tus credenciales
```

### 4. Instalar Dependencias
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Configurar APIs de IA
Crear archivo `server/.env` con:
```env
# Gemini API Keys
GEMINI_API_KEY=tu_api_key_gemini
GEMINI_API_KEY_QUIZZES_1=tu_api_key_quizzes_1

# Groq API Keys
GROQ_API_KEY=tu_api_key_groq

# Configuración de base de datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mqerkacademy
```

### 6. Ejecutar la Aplicación
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:1002

## 📊 Base de Datos

### Modelos Principales
- **Usuarios**: Autenticación y perfiles
- **Estudiantes**: Información académica y progreso
- **Asesores**: Perfiles de tutores y disponibilidad
- **Actividades**: Tareas, quizzes y simuladores
- **Pagos**: Transacciones y comprobantes
- **Chat**: Mensajes en tiempo real
- **Recursos**: Material educativo
- **AI Usage**: Logs de uso de inteligencia artificial

### Migraciones
El sistema incluye scripts de migración para:
- Creación de tablas
- Columnas adicionales
- Datos de prueba
- Índices de optimización

## 🔧 API Endpoints Principales

### Autenticación
- `POST /api/login` - Inicio de sesión
- `POST /api/verify` - Verificación de token
- `POST /api/token/refresh` - Refrescar token

### Estudiantes
- `GET /api/estudiantes/metricas` - Métricas del dashboard
- `GET /api/estudiantes/cursos` - Cursos inscritos
- `POST /api/estudiantes/actividades/entregar` - Entregar tarea

### Asesores
- `GET /api/asesores/estudiantes` - Lista de estudiantes asignados
- `POST /api/asesores/calificar` - Calificar actividad
- `GET /api/asesores/recursos` - Recursos educativos

### IA
- `POST /api/ai/gemini/generate` - Generar contenido con Gemini
- `POST /api/ai/groq/generate` - Generar contenido con Groq
- `GET /api/ai/quota` - Ver límites de uso

### Finanzas
- `GET /api/finanzas/pagos` - Historial de pagos
- `POST /api/finanzas/comprobantes` - Subir comprobante
- `GET /api/finanzas/presupuesto` - Presupuesto actual

## 🤖 Integración con IA

### Proveedores Soportados
1. **Google Gemini**: Ideal para análisis complejos y generación de contenido
2. **Groq**: Optimizado para respuestas rápidas y procesamiento eficiente

### Características de IA
- **Generación de Preguntas**: Creación automática de preguntas para simuladores
- **Análisis de Respuestas**: Evaluación automática con feedback personalizado
- **Sistema de Cooldown**: Prevención de rate limits automática
- **Rotación de API Keys**: Distribución de carga entre múltiples keys
- **Caché**: Respuestas cacheadas por 6 horas
- **Fallback Automático**: Cambio entre proveedores si uno falla

### Configuración de Límites
```sql
-- Ejemplo de configuración de límites
INSERT INTO ai_quota_config (rol, tipo_limite, valor, periodo)
VALUES 
  ('estudiante', 'diario', 10, 'day'),
  ('asesor', 'diario', 50, 'day'),
  ('admin', 'diario', 200, 'day');
```

## 🧪 Testing

### Pruebas de API
```bash
# Ejecutar tests del backend
cd server
npm test
```

### Pruebas de Conexión
```bash
# Probar conexión a base de datos
node server/scripts/test-db-connection.js

# Probar APIs de IA
node server/scripts/test-ai-apis.js
```

## 📈 Despliegue

### Producción
1. **Build del Frontend**
```bash
cd client
npm run build
```

2. **Configurar Servidor de Producción**
```bash
cd server
NODE_ENV=production npm start
```

### Variables de Entorno de Producción
```env
NODE_ENV=production
ALLOW_ALL_CORS=false
PORT=3000
DB_HOST=production-db-host
DB_PASSWORD=secure-password
```

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
EXPOSE 3000
CMD ["node", "index.js"]
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de Conexión a MySQL**
```bash
# Verificar que MySQL esté corriendo
sudo service mysql status

# Probar conexión manual
mysql -u root -p -e "SELECT 1;"
```

2. **Error de CORS en Desarrollo**
```bash
# Asegurar que ALLOW_ALL_CORS=true en desarrollo
# Verificar que el frontend use el puerto correcto
```

3. **APIs de IA no Responden**
```bash
# Verificar API keys en .env
# Probar conexión a APIs externas
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

4. **Archivos Estáticos no se Sirven**
```bash
# Verificar permisos de carpeta uploads/
chmod -R 755 uploads/
```

## 📚 Documentación Adicional

- [Configuración de Proveedores de IA](docs/ai-providers-setup.md)
- [Manual de Usuario - Estudiante](docs/estudiante.md)
- [Estructura de Base de Datos](base%20de%20datos/mqerkacademy.sql)

## 👥 Roles y Permisos

### Estudiante
- Ver dashboard personal
- Acceder a cursos inscritos
- Entregar actividades y quizzes
- Ver calificaciones y progreso
- Subir comprobantes de pago

### Asesor
- Gestionar estudiantes asignados
- Crear y calificar actividades
- Subir recursos educativos
- Chatear con estudiantes
- Ver métricas de grupo

### Administrador
- Gestión completa de usuarios
- Configuración del sistema
- Control financiero
- Monitoreo de uso de IA
- Reportes y analytics

## 🔄 Flujos de Trabajo

### Inscripción de Estudiante
1. Registro en plataforma
2. Asignación a curso y asesor
3. Pago de colegiatura
4. Subida de comprobante
5. Activación de acceso

### Ciclo de Actividad
1. Asesor crea actividad
2. Sistema notifica a estudiantes
3. Estudiante entrega tarea
4. Asesor califica y da feedback
5. Sistema actualiza métricas

### Proceso de Pago
1. Generación de referencia
2. Pago por estudiante
3. Subida de comprobante
4. Validación por administrador
5. Desbloqueo de siguiente período

## 🎯 Roadmap

### Próximas Características
- [ ] App móvil nativa (React Native)
- [ ] Sistema de videoconferencias integrado
- [ ] Gamificación avanzada (logros, insignias)
- [ ] Analytics predictivo con machine learning
- [ ] Integración con sistemas de pago en línea
- [ ] Exportación de certificados automática
- [ ] Sistema de tickets para soporte

### Mejoras Técnicas
- [ ] Migración a TypeScript
- [ ] Implementación de GraphQL
- [ ] Microservicios arquitectura
- [ ] CI/CD pipeline automatizado
- [ ] Tests de integración completos
- [ ] Monitoreo con Prometheus/Grafana

## 📄 Licencia

Este proyecto es privado y de uso interno de MQerkAcademy.

## 📞 Soporte

Para soporte técnico:
- **Email**: soporte@mqerk.edu.mx
- **Documentación**: [docs/](docs/)
- **Issues**: Reportar bugs en el sistema de issues

---

**MQerk Academy** - Transformando la educación con tecnología e inteligencia artificial 🚀


otra cosa, yo tengo @client/src/components/student/ActivitiesTable.jsx  y Quizztablet, no se si d everdad se estan suanod no pero antes de usarlo quiero ver y poder asegurar que cada tiene todo lo que tiene el componte origial cada modificacion cada funcion etc

de igual forma refactorizar la tabla de simulaciones
