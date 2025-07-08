# 🔧 GUÍA COMPLETA DE INTEGRACIÓN BACKEND - DASHBOARD ALUMNOS

## 📋 RESUMEN EJECUTIVO

✅ **Frontend 100% Terminado** - UI completa, responsive, funcional  
🔧 **Backend Pendiente** - Solo faltan conexiones a APIs  
📝 **TODOs Marcados** - Buscar "TODO: BACKEND" en el código  

## 🎯 COMPONENTE DE ACTIVIDADES - LISTO

**Archivo:** `src/components/Actividades_Alumno_comp.jsx`

### 🔌 Puntos de Integración (buscar TODO en el código):

1. **handleSelectType()** - Cargar actividades por materia y tipo
2. **handleFileUpload()** - Subir archivos al servidor  
3. **handleDownload()** - Descargar plantillas/archivos

### 📋 APIs Necesarias:

- **GET** `/api/students/{studentId}/activities?materiaId={id}&tipo={tipo}&mes={mes}`
- **POST** `/api/students/{studentId}/activities/{activityId}/upload` (FormData)
- **GET** `/api/activities/{activityId}/download` (Binary file)

## 📋 Descripción General

Este documento contiene toda la información necesaria para que una AI implemente las conexiones backend del sistema de Dashboard de Alumnos. El frontend está **100% terminado** con diseños responsivos y funcionalidades de UI, pero necesita conexión con APIs.

## 🏗️ Arquitectura del Sistema

### 📁 Estructura Principal del Proyecto

```
src/
├── components/                          # 📂 COMPONENTES PRINCIPALES
│   ├── AlumnoDashboardBundle.jsx        # 🎯 ROUTER PRINCIPAL - Solo rutas
│   ├── AlumnoLayout.jsx                 # 🎨 Layout wrapper con sidebar/header
│   ├── SideBar_Alumno_Comp.jsx         # 🧭 Navegación lateral
│   ├── Header_Alumno_comp.jsx          # 📱 Header superior
│   │
│   ├── InicioAlumnoDashboard.jsx        # 🏠 DASHBOARD PRINCIPAL
│   ├── Profile_Alumno_comp.jsx          # 👤 PERFIL - Necesita backend
│   ├── Calendar_Alumno_comp.jsx         # 📅 CALENDARIO - Necesita backend  
│   ├── MisCursos_Alumno_comp.jsx        # 📚 MIS CURSOS - Necesita backend
│   ├── MisPagos_Alumno_comp.jsx         # 💳 PAGOS - Necesita backend
│   ├── Configuracion_Alumno_comp.jsx    # ⚙️ CONFIGURACIÓN - Necesita backend
│   ├── Feedback_Alumno_Comp.jsx         # 💬 FEEDBACK - Necesita backend
│   ├── Asistencia_Alumno_comp.jsx       # ✅ ASISTENCIA - Necesita backend
│   ├── modal_actividades.jsx            # 📝 ACTIVIDADES MODAL
│   └── test.jsx                         # 🧪 PANEL DE TESTING
│
├── pages/                               # 📄 PÁGINAS PRINCIPALES
│   └── Alumnos/
│       └── Dashboard_Alumnos.jsx        # 🎯 PÁGINA PRINCIPAL DASHBOARD
│
├── context/                             # 🔄 GESTIÓN DE ESTADO
│   ├── StudentContext.jsx              # 👨‍🎓 Estado del estudiante
│   └── CourseContext.jsx               # 📖 Estado de cursos
│
└── examples/                            # 📝 EJEMPLOS DE INTEGRACIÓN
    ├── FeedbackIntegration.js
    ├── SimulatorDataIntegration.js
    └── SimulatorAPIFormat.js
```

## 🎯 Componente Principal: AlumnoDashboardBundle.jsx

**Ubicación:** `src/components/AlumnoDashboardBundle.jsx`

### 📝 Responsabilidades:
- ✅ **Solo maneja rutas** - NO contiene lógica de datos
- ✅ **Routing completo** para todas las páginas del alumno
- ✅ **Layout wrapper** - Proporciona estructura visual
- ✅ **Navegación** entre componentes

### 🛣️ Rutas Implementadas:
```javascript
/alumno/                    → InicioAlumnoDashboard (Dashboard principal)
/alumno/mi-perfil           → Profile_Alumno_comp
/alumno/calendario          → Calendar_Alumno_comp  
/alumno/cursos              → MisCursos_Alumno_comp
/alumno/mis-pagos           → MisPagos_Alumno_comp
/alumno/configuracion       → Configuracion_Alumno_comp
/alumno/feedback            → Feedback_Alumno_Comp
/alumno/asistencia          → Asistencia_Alumno_comp
/alumno/actividades         → AlumnoActividades (implementada en bundle)
/alumno/simulaciones        → AlumnoSimulaciones (implementada en bundle)
/alumno/dashboard           → CourseDetailDashboard
/alumno/test                → AlumnoTestPanel (solo testing)
```

## 🔧 COMPONENTES QUE NECESITAN BACKEND

### 1. 🏠 **InicioAlumnoDashboard.jsx** 
**Estado:** ✅ **COMPLETAMENTE FUNCIONAL**
- Dashboard principal con métricas
- Progreso de cursos
- Actividades recientes
- Ya tiene toda la lógica implementada

### 2. 👤 **Profile_Alumno_comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/profile          // Obtener datos del perfil
PUT    /api/students/profile          // Actualizar perfil
POST   /api/students/profile/avatar   // Subir foto de perfil
```

**Datos esperados:**
```javascript
{
  id: "student_123",
  nombre: "Juan Pérez",
  email: "juan@email.com",
  telefono: "+1234567890",
  fechaNacimiento: "1995-03-15",
  avatar: "https://...",
  carrera: "Ingeniería",
  semestre: 5,
  promedio: 8.7
}
```

### 3. 📅 **Calendar_Alumno_comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/calendar         // Obtener calendario
GET    /api/students/events          // Eventos del estudiante
POST   /api/students/events          // Crear evento personal
```

**Datos esperados:**
```javascript
{
  events: [
    {
      id: "event_1",
      title: "Examen de Matemáticas",
      date: "2025-07-15",
      time: "10:00",
      type: "exam", // class, exam, assignment, personal
      location: "Aula 101",
      course: "MAT101"
    }
  ]
}
```

### 4. 📚 **MisCursos_Alumno_comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/courses          // Cursos del estudiante
GET    /api/courses/{id}/progress     // Progreso en curso específico
POST   /api/students/courses/enroll   // Inscribirse a curso
```

**Datos esperados:**
```javascript
{
  enrolledCourses: [
    {
      id: "course_1",
      title: "Matemáticas Avanzadas",
      instructor: "Prof. García",
      progress: 75,
      nextClass: "2025-07-08T10:00:00Z",
      totalLessons: 20,
      completedLessons: 15
    }
  ]
}
```

### 5. 💳 **MisPagos_Alumno_comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/payments         // Historial de pagos
POST   /api/students/payments/upload  // Subir comprobante
GET    /api/students/payments/pending // Pagos pendientes
```

**Datos esperados:**
```javascript
{
  payments: [
    {
      id: "pay_1",
      amount: 500.00,
      date: "2025-07-01",
      status: "approved", // pending, approved, rejected
      concept: "Mensualidad Julio 2025",
      receipt: "https://..."
    }
  ],
  pendingAmount: 500.00
}
```

### 6. ⚙️ **Configuracion_Alumno_comp.jsx**
**Estado:** ✅ **UI COMPLETA** - 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/settings         // Configuración actual
PUT    /api/students/settings         // Actualizar configuración
POST   /api/students/change-password  // Cambiar contraseña
DELETE /api/students/account          // Eliminar cuenta
```

**TODOs específicos en el código:**
- Línea 124: `loadUserData()` - Cargar configuración inicial
- Línea 227: `handleSaveChanges()` - Guardar cambios generales
- Línea 251: `handleChangePassword()` - Cambio de contraseña
- Línea 300: `handleChangeProfilePicture()` - Subir imagen

### 7. 💬 **Feedback_Alumno_Comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/feedback         // Feedback recibido
POST   /api/students/feedback         // Enviar feedback
GET    /api/courses/{id}/feedback     // Feedback por curso
```

### 8. ✅ **Asistencia_Alumno_comp.jsx**
**Estado:** 🔧 **NECESITA BACKEND**

**APIs Necesarias:**
```javascript
GET    /api/students/attendance       // Registro de asistencia
POST   /api/students/attendance/mark  // Marcar asistencia
GET    /api/students/attendance/stats // Estadísticas
```

## 🔄 Contextos de Estado

### 👨‍🎓 **StudentContext.jsx**
**Ubicación:** `src/context/StudentContext.jsx`

**Estado Global del Estudiante:**
```javascript
{
  isVerified: boolean,        // Estudiante verificado
  hasPaid: boolean,          // Pago realizado
  currentCourse: object,     // Curso actual
  isFirstAccess: boolean,    // Primer acceso
  activeSection: string,     // Sección activa del dashboard
  studentData: object       // Datos completos del estudiante
}
```

### 📖 **CourseContext.jsx**
**Ubicación:** `src/context/CourseContext.jsx`

**Estado Global de Cursos:**
```javascript
{
  courses: array,           // Lista de cursos disponibles
  enrolledCourses: array,   // Cursos inscritos
  currentCourse: object,    // Curso seleccionado
  progress: object          // Progreso por curso
}
```

## 🧪 Testing y Desarrollo

### 🎯 **Panel de Testing: test.jsx**
**Ubicación:** `src/components/test.jsx`

**Funcionalidades:**
- ✅ Simular todos los estados del estudiante
- ✅ Navegación rápida entre componentes
- ✅ Escenarios predefinidos de testing
- ✅ Debug de estados en tiempo real

**Acceso:** `/alumno/test`

## 🎨 **DISEÑO Y UI**

### ✅ **Estado Actual del Frontend**
- **100% Responsive** - Funciona en móvil y desktop
- **Diseño Moderno** - Tailwind CSS, gradientes, sombras
- **UX Completa** - Loading states, error handling, feedback visual
- **Navegación Fluida** - Sidebar responsive, breadcrumbs
- **Componentes Reutilizables** - Iconos, botones, formularios

### 🎯 **NO requiere cambios de diseño**
Todo el frontend está terminado. Solo se necesita:
1. Conectar APIs donde dice `// TODO:`
2. Reemplazar datos de prueba con datos reales
3. Mantener la estructura existente

## 🎨 **Sistema de Diseño**

#### **Sistema de Colores:**
```css
/* Paleta principal del dashboard */
--primary-blue: #3B82F6       /* Azul principal */
--primary-indigo: #6366F1     /* Índigo para acentos */
--secondary-gray: #6B7280     /* Gris para textos secundarios */
--success-green: #10B981      /* Verde para estados exitosos */
--warning-yellow: #F59E0B     /* Amarillo para advertencias */
--error-red: #EF4444          /* Rojo para errores */

/* Backgrounds gradientes */
--bg-main: linear-gradient(135deg, #EBF4FF 0%, #E0E7FF 100%)
--bg-sidebar: rgba(255, 255, 255, 0.95)
--bg-header: rgba(255, 255, 255, 1)
```

#### **Transiciones y Animaciones:**
```css
/* Sidebar transitions */
.sidebar-transition {
  transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
}

/* Content area transitions */
.content-transition {
  transition: margin-left 0.3s ease-in-out;
}

/* Hover effects */
.menu-item-hover {
  transition: all 0.2s ease-in-out;
}
```

### 🔧 **Backend Integration Points**

#### **Datos que necesitan APIs:**
```javascript
// En AlumnoLayout.jsx:
- Datos del estudiante para header (avatar, nombre)
- Notificaciones en tiempo real
- Estado de verificación/pago

// En SideBar_Alumno_Comp.jsx:
- Contadores de badges (cursos pendientes, pagos, etc.)
- Estados de progreso por sección

// En Header_Alumno_comp.jsx:
- Búsqueda global de cursos/contenido
- Notificaciones push/real-time
```

#### **TODOs específicos de Layout:**
```javascript
// AlumnoLayout.jsx - línea 45
// TODO: Conectar con API de notificaciones en tiempo real
// TODO: Implementar WebSocket para updates live

// SideBar_Alumno_Comp.jsx - línea 78
// TODO: Cargar badges dinámicos desde API
// TODO: Actualizar contadores automáticamente

// Header_Alumno_comp.jsx - línea 23
// TODO: Implementar búsqueda global con API
// TODO: Conectar sistema de notificaciones
```

### ✅ **Estado de Layouts - Resumen**

**COMPLETAMENTE FUNCIONAL:**
- ✅ Responsive design en todos los breakpoints
- ✅ Navegación fluida entre componentes
- ✅ Estados visuales y transiciones
- ✅ Estructura modular y reutilizable
- ✅ Integración con contextos de React

**LISTO PARA BACKEND:**
- 🔧 Notificaciones en tiempo real
- 🔧 Búsqueda global
- 🔧 Badges/contadores dinámicos
- 🔧 Estados de usuario en tiempo real

---

## 🎨 ARQUITECTURA DE LAYOUTS Y WRAPPERS

### 📐 **Estructura de Layouts del Sistema**

El sistema utiliza una arquitectura de layouts anidados que proporciona una experiencia de usuario consistente y modular:

```
┌─────────────────────────────────────────────────────────────┐
│                    Layout Principal                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                AlumnoLayout.jsx                        │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐│ │
│  │  │                 │  │                                 ││ │
│  │  │  SideBar_Alumno │  │      Contenido Principal        ││ │
│  │  │     _Comp.jsx   │  │                                 ││ │
│  │  │                 │  │  ┌─────────────────────────────┐││ │
│  │  │  - Navegación   │  │  │   Header_Alumno_comp.jsx   │││ │
│  │  │  - Menú         │  │  └─────────────────────────────┘││ │
│  │  │  - Estados      │  │                                 ││ │
│  │  │                 │  │  ┌─────────────────────────────┐││ │
│  │  │                 │  │  │     Componente Activo       │││ │
│  │  │                 │  │  │   (Profile, Calendar, etc)  │││ │
│  │  │                 │  │  └─────────────────────────────┘││ │
│  │  └─────────────────┘  └─────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────┐ │
└─────────────────────────────────────────────────────────────┘
```

### 🏗️ **Componentes de Layout Principal**

#### 1. 🎯 **AlumnoLayout.jsx** - Layout Wrapper Principal
**Ubicación:** `src/components/AlumnoLayout.jsx`

**Responsabilidades:**
- ✅ **Estructura base** del dashboard de alumnos
- ✅ **Responsive design** - Se adapta a móvil/desktop automáticamente
- ✅ **Gestión de estado** del sidebar (abierto/cerrado)
- ✅ **Wrapper de contextos** - Envuelve StudentContext y CourseContext
- ✅ **Animaciones** y transiciones suaves

**Características técnicas:**
```javascript
// Estructura del AlumnoLayout.jsx
export default function AlumnoLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentContextProvider>
        <CourseContextProvider>
          {/* Sidebar Component */}
          <SideBar_Alumno_Comp 
            isOpen={sidebarOpen}
            onToggle={setSidebarOpen}
          />
          
          {/* Main Content Area */}
          <div className={`transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}>
            <Header_Alumno_comp onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="p-6">
              {children}
            </main>
          </div>
        </CourseContextProvider>
      </StudentContextProvider>
    </div>
  );
}
```

#### 2. 🧭 **SideBar_Alumno_Comp.jsx** - Navegación Lateral
**Ubicación:** `src/components/SideBar_Alumno_Comp.jsx`

**Responsabilidades:**
- ✅ **Navegación principal** entre secciones del dashboard
- ✅ **Estados visuales** - Sección activa, hover effects
- ✅ **Responsive behavior** - Colapsa en móvil, se expande en desktop
- ✅ **Iconografía** - Íconos consistentes para cada sección
- ✅ **Indicadores de estado** - Notificaciones, badges, progreso

**Características técnicas:**
```javascript
// Estructura del SideBar_Alumno_Comp.jsx
const menuItems = [
  { path: '/alumno/', icon: Home, label: 'Dashboard', badge: null },
  { path: '/alumno/mi-perfil', icon: User, label: 'Mi Perfil', badge: null },
  { path: '/alumno/cursos', icon: BookOpen, label: 'Mis Cursos', badge: '3' },
  { path: '/alumno/calendario', icon: Calendar, label: 'Calendario', badge: null },
  { path: '/alumno/mis-pagos', icon: CreditCard, label: 'Mis Pagos', badge: 'pending' },
  // ... más items
};

// Estados responsivos:
// - Mobile (< 768px): Sidebar oculto por defecto, fullscreen overlay
// - Tablet: Sidebar oculto por defecto, overlay al abrir
// - Desktop: Sidebar visible por defecto, puede colapsar
```

#### 3. 📱 **Header_Alumno_comp.jsx** - Header Superior
**Ubicación:** `src/components/Header_Alumno_comp.jsx`

**Responsabilidades:**
- ✅ **Barra superior** con información contextual
- ✅ **Breadcrumbs** - Navegación jerárquica
- ✅ **Información del usuario** - Avatar, nombre, rol
- ✅ **Notificaciones** - Bell icon con contador
- ✅ **Búsqueda rápida** - Search bar global
- ✅ **Menú de usuario** - Configuración, logout

**Características técnicas:**
```javascript
// Estructura del Header_Alumno_comp.jsx
export default function Header_Alumno_comp({ onMenuToggle }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Menu Toggle Button */}
        <button onClick={onMenuToggle} className="lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Breadcrumbs */}
        <BreadcrumbComponent />
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <SearchComponent />
          <NotificationsComponent />
          <UserMenuComponent />
        </div>
      </div>
    </header>
  );
}
```

### 🔄 **Flujo de Navegación y Estados**

#### **1. Navegación Responsiva:**
```javascript
// Desktop (>= 1024px):
sidebarWidth: "256px" (expandido) | "64px" (colapsado)
mainContent: "margin-left: 256px" | "margin-left: 64px"

// Tablet (768px - 1023px):
sidebarWidth: "256px" (overlay) | "hidden"
mainContent: "margin-left: 0" (siempre)

// Mobile (< 768px):
sidebarWidth: "100%" (overlay) | "hidden"
mainContent: "margin-left: 0" (siempre)
```

#### **2. Gestión de Estado Global:**
```javascript
// En AlumnoLayout.jsx se gestionan:
- sidebarOpen: boolean           // Estado del sidebar
- currentRoute: string           // Ruta activa actual
- userNotifications: array       // Notificaciones del usuario
- globalLoading: boolean         // Loading state global
```

#### **3. Contextos Integrados:**
```javascript
// StudentContext - Datos del estudiante
const { studentData, isVerified, hasPaid } = useContext(StudentContext);

// CourseContext - Datos de cursos
const { enrolledCourses, currentCourse } = useContext(CourseContext);
```

## 📋 CHECKLIST PARA IMPLEMENTACIÓN

### ✅ **Componentes Listos (No necesitan backend)**
- [x] AlumnoDashboardBundle.jsx (Solo routing)
- [x] AlumnoLayout.jsx (Layout)
- [x] SideBar_Alumno_Comp.jsx (Navegación)
- [x] Header_Alumno_comp.jsx (Header)
- [x] InicioAlumnoDashboard.jsx (Dashboard principal)
- [x] test.jsx (Panel testing)

### 🔧 **Componentes que Necesitan APIs**
- [ ] Profile_Alumno_comp.jsx
- [ ] Calendar_Alumno_comp.jsx
- [ ] MisCursos_Alumno_comp.jsx
- [ ] MisPagos_Alumno_comp.jsx
- [ ] Configuracion_Alumno_comp.jsx (UI lista, faltan APIs)
- [ ] Feedback_Alumno_Comp.jsx
- [ ] Asistencia_Alumno_comp.jsx

### 🔄 **Contextos que Necesitan APIs**
- [ ] StudentContext.jsx - Conectar con `/api/students/`
- [ ] CourseContext.jsx - Conectar con `/api/courses/`

## 🚀 PASOS PARA IMPLEMENTAR

### 1. **Configurar Base URL de API**
```javascript
// src/config/api.js
export const API_BASE_URL = 'http://localhost:3001/api';
```

### 2. **Crear Servicio de API**
```javascript
// src/services/apiService.js
export const apiService = {
  get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`),
  post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
};
```

### 3. **Implementar APIs en cada Componente**
- Buscar comentarios `// TODO:` en cada archivo
- Reemplazar `console.log` con llamadas reales a API
- Mantener manejo de estados de loading/error existentes

### 4. **Conectar Contextos**
- Implementar funciones de StudentContext con APIs reales
- Implementar funciones de CourseContext con APIs reales

### 5. **Testing**
- Usar `test.jsx` para probar cada componente
- Verificar estados de loading/error
- Probar navegación completa

## 🔗 **URLs de Endpoints Sugeridas**

```
BASE_URL/api/students/
├── GET    /profile              # Perfil del estudiante
├── PUT    /profile              # Actualizar perfil
├── GET    /courses              # Cursos del estudiante
├── GET    /calendar             # Calendario personal
├── GET    /payments             # Historial de pagos
├── POST   /payments/upload      # Subir comprobante
├── GET    /attendance           # Registro de asistencia
├── GET    /feedback             # Feedback recibido
├── POST   /feedback             # Enviar feedback
├── GET    /settings             # Configuración
├── PUT    /settings             # Actualizar configuración
├── POST   /change-password      # Cambiar contraseña
└── DELETE /account              # Eliminar cuenta

BASE_URL/api/courses/
├── GET    /                     # Lista de cursos
├── GET    /{id}                 # Detalle de curso
├── GET    /{id}/progress        # Progreso en curso
└── POST   /{id}/enroll          # Inscribirse
```

---

## 📞 **INSTRUCCIONES ESPECÍFICAS PARA LA AI**

### 🤖 **CONTEXTO PARA LA AI:**
Eres una AI especializada en integración backend. El frontend de este Dashboard de Alumnos está **100% terminado** visualmente y funcionalmente. Tu trabajo es SOLO conectar las APIs sin cambiar el diseño ni la estructura existente.

### 🎯 **TU MISIÓN ESPECÍFICA:**
1. **NO cambiar el diseño** - El UI está perfecto
2. **SOLO conectar APIs** donde aparezcan comentarios `// TODO:`
3. **Reemplazar datos mock** con datos reales de APIs
4. **Mantener la funcionalidad** existente de estados y navegación

### 📋 **PLAN DE TRABAJO PASO A PASO:**

#### **PASO 1: Configuración Base**
1. Crear `src/config/api.js` con la URL base del backend
2. Crear `src/services/apiService.js` con funciones de HTTP
3. Agregar manejo de JWT tokens para autenticación

#### **PASO 2: Por Cada Componente**
1. **Buscar líneas con `// TODO:`** en el código
2. **Reemplazar console.log** con llamadas reales a API
3. **Mantener los estados existentes** (loading, error, success)
4. **NO cambiar la estructura JSX** ni los estilos

#### **PASO 3: Conectar Contextos**
1. **StudentContext.jsx** - Conectar con `/api/students/`
2. **CourseContext.jsx** - Conectar con `/api/courses/`
3. **Mantener la estructura de estado** existente

#### **PASO 4: Testing**
1. Usar `/alumno/test` para probar cada componente
2. Verificar que todas las funciones trabajen con APIs reales
3. Probar estados de loading y error

### 🚫 **LO QUE NO DEBES HACER:**
- ❌ NO cambiar estilos ni clases CSS
- ❌ NO modificar la estructura de componentes JSX
- ❌ NO cambiar el routing existente
- ❌ NO alterar el diseño responsivo
- ❌ NO quitar funcionalidades existentes

### ✅ **LO QUE SÍ DEBES HACER:**
- ✅ Buscar comentarios `// TODO:` y implementar las APIs
- ✅ Reemplazar datos de prueba con datos reales
- ✅ Mantener manejo de estados (loading, error, success)
- ✅ Agregar autenticación JWT donde sea necesario
- ✅ Conservar toda la funcionalidad existente

### 📁 **ARCHIVOS ESPECÍFICOS A MODIFICAR:**

#### **Configuración (Crear nuevos):**
- `src/config/api.js` - URL base y configuración
- `src/services/apiService.js` - Funciones HTTP

#### **Componentes (Modificar TODOs existentes):**
- `src/components/Profile_Alumno_comp.jsx` - Líneas 45, 78, 102
- `src/components/Calendar_Alumno_comp.jsx` - Líneas 34, 67, 89
- `src/components/MisCursos_Alumno_comp.jsx` - Líneas 56, 91, 124
- `src/components/MisPagos_Alumno_comp.jsx` - Líneas 23, 78, 145
- `src/components/Configuracion_Alumno_comp.jsx` - Líneas 124, 227, 251, 300
- `src/components/Feedback_Alumno_Comp.jsx` - Líneas 43, 89, 156
- `src/components/Asistencia_Alumno_comp.jsx` - Líneas 67, 98, 134

#### **Contextos (Conectar con APIs):**
- `src/context/StudentContext.jsx` - Conectar funciones con backend
- `src/context/CourseContext.jsx` - Conectar funciones con backend

### 🔗 **ENDPOINTS QUE DEBES IMPLEMENTAR:**
Usa exactamente estas URLs para las conexiones:

```javascript
// Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Endpoints para estudiantes
GET    /api/students/profile          // Obtener perfil
PUT    /api/students/profile          // Actualizar perfil
GET    /api/students/courses          // Cursos del estudiante
GET    /api/students/calendar         // Calendario
GET    /api/students/payments         // Historial de pagos
POST   /api/students/payments/upload  // Subir comprobante
GET    /api/students/attendance       // Asistencia
GET    /api/students/feedback         // Feedback recibido
GET    /api/students/settings         // Configuración
PUT    /api/students/settings         // Actualizar configuración
POST   /api/students/change-password  // Cambiar contraseña
DELETE /api/students/account          // Eliminar cuenta

// Endpoints para cursos
GET    /api/courses/                  // Lista de cursos
GET    /api/courses/{id}              // Detalle de curso
GET    /api/courses/{id}/progress     // Progreso en curso
```

---

## 🎯 INTEGRACIÓN COMPLETA DE AlumnoDashboardBundle.jsx

### 📋 **Información del Archivo Principal**
**Ubicación:** `src/components/AlumnoDashboardBundle.jsx`
**Tamaño:** 549 líneas de código
**Responsabilidad:** Router principal y gestor de rutas del Dashboard de Alumnos

### 🏗️ **Estructura Interna del Componente**

#### **1. 📦 Importaciones Principales**
```javascript
// Layout y contextos principales
import { AlumnoLayout } from './AlumnoLayout.jsx';
import { useStudent } from '../context/StudentContext.jsx';

// Componentes de páginas individuales
import { Profile_Alumno_comp } from './Profile_Alumno_comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_comp.jsx';
import { MisCursos_Alumno_comp } from './MisCursos_Alumno_comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx';
import { Asistencia_Alumno_comp } from './Asistencia_Alumno_comp.jsx';
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import CourseDetailDashboard from './CourseDetailDashboard.jsx';
import AlumnoTestPanel from './test.jsx';

// Componentes de navegación
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from './SideBar_Alumno_Comp.jsx';

// Proveedores de contexto
import { CourseProvider } from '../context/CourseContext.jsx';
import { StudentProvider } from '../context/StudentContext.jsx';
```

#### **2. 🛣️ Páginas Implementadas en el Bundle**

##### **Páginas que Renderizan Componentes Externos:**
- `AlumnoMiPerfil()` → Renderiza `Profile_Alumno_comp`
- `AlumnoCalendario()` → Renderiza `Calendar_Alumno_comp`
- `AlumnoMisCursos()` → Renderiza `MisCursos_Alumno_comp`
- `AlumnoFeedback()` → Renderiza `Feedback_Alumno_Comp`
- `AlumnoAsistencia()` → Renderiza `Asistencia_Alumno_comp`
- `AlumnoMisPagos()` → Renderiza `MisPagos_Alumno_comp`
- `AlumnoConfiguracion()` → Renderiza `Configuracion_Alumno_comp`

##### **Páginas Implementadas Internamente:**
- `AlumnoActividades()` → Página completa de actividades (140 líneas)
- `AlumnoSimulaciones()` → Página completa de simulaciones (170 líneas)
- `AlumnoCerrarSesion()` → Página de logout (50 líneas)

#### **3. 🎯 Componente Principal Exportado**

```javascript
export function AlumnoDashboardBundle() {
  return (
    <StudentProvider>
      <CourseProvider>
        <StudentAwareLayout />
      </CourseProvider>
    </StudentProvider>
  );
}
```

#### **4. 🧠 Lógica Interna - StudentAwareLayout**

```javascript
function StudentAwareLayout() {
  const { isVerified, hasPaid, currentCourse } = useStudent();
  const location = useLocation();
  
  // Lógica para mostrar sidebar condicionalmente
  const shouldShowSidebar = !!(
    currentCourse &&             // Debe haber un curso seleccionado
    isVerified &&               // Debe estar verificado
    hasPaid                     // Debe haber pagado
  );

  return (
    <AlumnoLayout
      HeaderComponent={undefined} // Siempre mostrar header
      SideBarDesktopComponent={shouldShowSidebar ? SideBarDesktop_Alumno_comp : () => null}
      SideBarSmComponent={shouldShowSidebar ? SideBarSm_Alumno_comp : () => null}
    >
      {/* Rutas definidas aquí */}
    </AlumnoLayout>
  );
}
```

### 🚀 **INTEGRACIÓN EN App.js - PASO A PASO**

#### **PASO 1: 📁 Ubicación del App.js**
Asumiendo que tu archivo principal está en `src/App.js` o `src/App.jsx`

#### **PASO 2: 📦 Importaciones Necesarias en App.js**
```javascript
// En tu App.js, agregar estas importaciones:
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importar el Bundle principal del Dashboard de Alumnos
import { AlumnoDashboardBundle } from './components/AlumnoDashboardBundle.jsx';

// Otros componentes que ya tengas (ejemplos)
import Login from './pages/Login.jsx';
import { IndexComp } from './components/IndexComp.jsx';
// ... otras importaciones existentes
```

#### **PASO 3: 🛣️ Configuración de Rutas Principal**
```javascript
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<IndexComp />} />
          <Route path="/login" element={<Login />} />
          
          {/* INTEGRACIÓN DEL DASHBOARD DE ALUMNOS */}
          <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />
          
          {/* Otras rutas existentes */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/asesor/*" element={<AsesorDashboard />} />
          
          {/* Ruta de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

#### **PASO 4: 🔐 Protección de Rutas (Opcional pero Recomendado)**
```javascript
// Crear un componente para proteger rutas
function ProtectedRoute({ children, requiredRole = null }) {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Aplicar protección en App.js
<Route 
  path="/alumno/*" 
  element={
    <ProtectedRoute requiredRole="student">
      <AlumnoDashboardBundle />
    </ProtectedRoute>
  } 
/>
```

#### **📝 Diferencias Clave entre App.js y App.jsx:**
##### **🔸 Extensión de Archivo:**
```javascript
// App.js - JavaScript puro
import React from 'react';

// App.jsx - JavaScript con JSX explícito
import React from 'react';
// Mismo contenido, pero extensión .jsx indica JSX
```

##### **🔸 Configuración de Bundler:**
```javascript
// En vite.config.js (si usas Vite):
export default {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}

// En webpack.config.js (si usas Webpack):
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
}
```

#### **⚙️ Verificación de Configuración para App.jsx**

##### **1. 📁 Estructura de Archivos Esperada:**
```
src/
├── App.jsx                          ← Tu archivo principal
├── index.js                         ← Entry point que renderiza App.jsx
├── index.css                        ← Estilos con Tailwind
├── components/
│   ├── AlumnoDashboardBundle.jsx    ← El componente que integras
│   ├── IndexComp.jsx               ← Página de inicio
│   └── ...
├── pages/
│   ├── Login.jsx
│   └── ...
└── context/
    ├── StudentContext.jsx
    └── CourseContext.jsx
```

##### **2. 📝 Verificar index.js (Entry Point):**
```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // ← Importa tu App.jsx
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

##### **3. 🎨 Verificar index.css (Tailwind):**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos globales adicionales si los necesitas */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

#### **🧪 Testing de App.jsx Integrado**

##### **1. ✅ Comandos de Testing:**
```bash
# Iniciar el servidor de desarrollo
npm start
# o
yarn start

# Verificar que las rutas funcionen:
# http://localhost:3000/                 → IndexComp
# http://localhost:3000/login            → Login
# http://localhost:3000/alumno/          → Dashboard de Alumnos
# http://localhost:3000/alumno/mi-perfil → Perfil del estudiante
```

##### **2. 🔍 Debugging en Navegador:**
```javascript
// Abrir DevTools (F12) y verificar:
// 1. No hay errores en Console
// 2. Network tab muestra recursos cargando
// 3. React Developer Tools muestra componentes
```

##### **3. 🎯 Testing de Navegación:**
```javascript
// En cualquier parte de tu app, puedes navegar programáticamente:
import { useNavigate } from 'react-router-dom';

function MiComponente() {
  const navigate = useNavigate();
  
  const irAlDashboard = () => {
    navigate('/alumno/');
  };
  
  const irAlPerfil = () => {
    navigate('/alumno/mi-perfil');
  };
  
  return (
    <div>
      <button onClick={irAlDashboard}>Ir al Dashboard</button>
      <button onClick={irAlPerfil}>Ir al Perfil</button>
    </div>
  );
}
```

#### **🚨 Troubleshooting Específico para App.jsx**

##### **❌ Error: "JSX element type does not have any construct"**
```jsx
// Problema: Importación incorrecta
import AlumnoDashboardBundle from './components/AlumnoDashboardBundle.jsx'; // ❌

// Solución: Usar destructuring
import { AlumnoDashboardBundle } from './components/AlumnoDashboardBundle.jsx'; // ✅
```

##### **❌ Error: "Cannot resolve module './App.jsx'"**
```javascript
// En index.js, verificar la importación:
import App from './App.jsx'; // ✅ Con extensión
// o
import App from './App'; // ✅ Sin extensión (si está configurado)
```

##### **❌ Error: "Router not defined"**
```jsx
// Verificar que tienes instalado react-router-dom:
npm install react-router-dom

// Y que importas correctamente:
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
```

##### **❌ Estilos de Tailwind no se aplican**
```css
/* Verificar que index.css tenga estas líneas: */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### **🎉 Resultado Final con App.jsx**

Después de integrar correctamente tendrás:

✅ **App.jsx como router principal** de tu aplicación
✅ **Dashboard de alumnos** accesible en `/alumno/*`
✅ **Todas las sub-rutas** funcionando automáticamente:
   - `/alumno/` → Dashboard principal
   - `/alumno/mi-perfil` → Perfil
   - `/alumno/cursos` → Mis cursos  
   - `/alumno/calendario` → Calendario
   - `/alumno/mis-pagos` → Pagos
   - `/alumno/configuracion` → Configuración
   - `/alumno/feedback` → Feedback
   - `/alumno/asistencia` → Asistencia
   - `/alumno/actividades` → Actividades
   - `/alumno/simulaciones` → Simulaciones
   - `/alumno/test-panel` → Panel de testing

✅ **Navegación SPA** sin recargas de página
✅ **Protección de rutas** (si implementas ProtectedRoute)
✅ **Contextos globales** funcionando en toda la app

**🚀 TU APP.JSX ESTARÁ COMPLETAMENTE INTEGRADO Y FUNCIONAL**

# 📝 COMPONENTE DE ACTIVIDADES - NAVEGACIÓN MULTINIVEL

## 🎯 Actividades_Alumno_comp.jsx

**Ubicación:** `src/components/Actividades_Alumno_comp.jsx`

### ✨ Funcionalidades Implementadas:

#### 📊 Navegación Multinivel (4 Niveles):
1. **Nivel 1:** Tarjetas de áreas/módulos/materias
2. **Nivel 2:** Lista de materias específicas del área seleccionada
3. **Nivel 3:** Botones de "Actividades" y "Quiz" por materia
4. **Nivel 4:** Tabla completa de actividades con todas las funcionalidades

#### 🎨 UI/UX Inspirada en Feedback_Alumno_Comp:
- **Sistema de puntos totales** con visualización destacada
- **Animaciones de confeti** al subir actividades
- **Modales mejorados** con mejor UX
- **Filtrado por mes** con dropdown elegante
- **Vista responsive** (desktop y móvil)
- **Vista previa de archivos** en modales

#### 🔧 Funcionalidades de Gestión:
- **Descargar actividades** (plantillas/instrucciones)
- **Subir archivos** (PDF, DOC, DOCX)
- **Editar actividades** (placeholder para futuro)
- **Visualizar archivos subidos** con iframe/modal
- **Estado de entrega** (pendiente/entregado/revisado)
- **Sistema de calificaciones** con puntos
- **Gestión de fechas límite**

### 🔌 APIs Necesarias para Integración:

#### 1. **GET /api/students/{studentId}/subjects**
```json
// Obtener áreas y materias del estudiante
{
  "areas": [
    {
      "id": 1,
      "titulo": "Matemáticas",
      "icono": "📊",
      "color": "from-blue-400 to-blue-600",
      "materias": [
        {
          "id": 11,
          "nombre": "Álgebra básica",
          "descripcion": "Fundamentos matemáticos",
          "areaId": 1
        }
      ]
    }
  ]
}
```

#### 2. **GET /api/students/{studentId}/activities**
```json
// Obtener actividades por materia y tipo
// Query params: ?materiaId=11&tipo=actividades&mes=all
{
  "activities": [
    {
      "id": 1,
      "nombre": "Operaciones fundamentales",
      "descripcion": "Ejercicios básicos de matemáticas",
      "fechaEntrega": "2024-02-12",
      "fechaSubida": "2024-02-10",
      "archivo": "/uploads/student123/activity1.pdf",
      "entregada": true,
      "score": 85,
      "maxScore": 100,
      "estado": "revisada", // pendiente|entregada|revisada
      "materiaId": 11,
      "tipo": "actividades" // actividades|quiz
    }
  ],
  "totalScore": 340,
  "totalPossible": 400
}
```

#### 3. **POST /api/students/{studentId}/activities/{activityId}/upload**
```json
// Subir archivo de actividad
// Content-Type: multipart/form-data
{
  "file": "archivo.pdf",
  "activityId": 1,
  "studentId": 123
}

// Response:
{
  "success": true,
  "fileUrl": "/uploads/student123/activity1.pdf",
  "message": "Archivo subido exitosamente",
  "uploadedAt": "2024-02-10T10:30:00Z"
}
```

#### 4. **GET /api/activities/{activityId}/download**
```json
// Descargar plantilla/instrucciones de actividad
// Response: Binary file download (PDF)
```

#### 5. **DELETE /api/students/{studentId}/activities/{activityId}/submission**
```json
// Cancelar entrega de actividad
{
  "success": true,
  "message": "Entrega cancelada exitosamente"
}
```

### 🎯 Puntos de Integración en el Código:

#### Estados para Backend:
```javascript
// Estados que necesitan datos del backend
const [areasData, setAreasData] = useState([]); // TODO: API /api/students/{id}/subjects
const [actividades, setActividades] = useState([]); // TODO: API /api/students/{id}/activities
const [totalScore, setTotalScore] = useState(0); // Calculado desde actividades
```

#### Funciones que Necesitan Backend:
```javascript
// 1. Cargar áreas y materias al montar componente
useEffect(() => {
  // TODO: Llamar API /api/students/{studentId}/subjects
  // setAreasData(response.data.areas);
}, []);

// 2. Cargar actividades por materia y tipo
const handleSelectType = (type) => {
  // TODO: Llamar API /api/students/{studentId}/activities
  // ?materiaId=${selectedMateria.id}&tipo=${type}&mes=${selectedMonth}
};

// 3. Subir archivo
const handleFileUpload = (actividadId, file) => {
  // TODO: POST /api/students/{studentId}/activities/${actividadId}/upload
  // FormData con el archivo
};

// 4. Descargar actividad
const handleDownload = (actividadId) => {
  // TODO: GET /api/activities/${actividadId}/download
  // Iniciar descarga del archivo
};
```

### 🎨 Efectos Visuales Implementados:

#### Animación de Confeti:
- Se activa al subir actividades exitosamente
- Muestra puntos ganados temporalmente
- Mensaje motivacional incluido

#### Tabla Responsive:
- **Desktop:** Tabla completa con todas las columnas
- **Móvil:** Cards en grid con información compacta
- **Tablet:** Vista híbrida optimizada

#### Modales Mejorados:
- **Modal de Subida:** Gestión de archivos nuevos/existentes
- **Modal de Vista:** Preview de archivos con iframe
- **Modal de Edición:** Placeholder para funcionalidades futuras

### 🔒 Validaciones Necesarias:

#### Frontend (Ya Implementado):
- ✅ Validación de tipos de archivo (.pdf, .doc, .docx)
- ✅ Validación de fechas límite
- ✅ Estados de carga y errores
- ✅ Feedback visual de acciones

#### Backend (Por Implementar):
- 🔄 Autenticación de estudiante
- 🔄 Autorización por materia
- 🔄 Validación de tamaño de archivo
- 🔄 Verificación de fecha límite
- 🔄 Almacenamiento seguro de archivos

---
