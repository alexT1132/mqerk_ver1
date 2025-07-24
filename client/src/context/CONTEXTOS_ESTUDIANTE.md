# INTEGRACIÓN BACKEND - DASHBOARD ESTUDIANTE



### **❌ NO MODIFICAR (Ya listos para backend, no necesitan cambios)**
```
src/components/layouts/Header_Alumno_comp.jsx
src/components/layouts/SideBar_Alumno_Comp.jsx  
src/components/layouts/AlumnoLayout.jsx
src/context/StudentDashboardProvider.jsx
```

### **✅ SOLO MODIFICAR ESTOS ARCHIVOS**
```
src/context/StudentContext.jsx
src/context/StudentNotificationContext.jsx
```

## 📋 LISTA TODO BACKEND

### StudentContext.jsx

**Línea 65:** Reemplazar llamada API mock
```javascript
// TODO: BACKEND - Reemplazar con API real
const response = await fetch('/api/students/profile');
```

**Línea 83:** Reemplazar carga de cursos mock  
```javascript
// TODO: BACKEND - Cargar cursos matriculados reales
const coursesResponse = await fetch('/api/students/courses');
```

**Línea 98:** Reemplazar verificación mock
```javascript
// TODO: BACKEND - Estado de verificación real  
const verificationResponse = await fetch('/api/students/verification');
```

**Función `logout()` - Línea 110:** Conectar API logout real
```javascript
// TODO: BACKEND - Llamar endpoint logout real
await fetch('/api/auth/logout', { method: 'POST' });
```

### StudentNotificationContext.jsx

**Línea 45:** Reemplazar fetch de notificaciones mock
```javascript
// TODO: BACKEND - Reemplazar con API real
const response = await fetch('/api/notifications');
```

**Línea 65:** Reemplazar marcar como leída mock
```javascript
// TODO: BACKEND - API real marcar como leída
await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
```

**Línea 78:** Reemplazar marcar todas como leídas mock
```javascript
// TODO: BACKEND - API real marcar todas como leídas  
await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
```

**Línea 90:** Reemplazar eliminar notificación mock
```javascript
// TODO: BACKEND - API real eliminar
await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
```

## 🔍 TESTING (Solo Carga Manual de Mocks)

### Testing StudentNotificationContext.jsx
```javascript
// Línea 102: Carga manual de datos mock para testing
loadMockNotifications() // Solo llamar cuando se necesite para testing
```

## 📁 ESTADO DE ARCHIVOS AFECTADOS

### ✅ LISTOS - NO NECESITAN CAMBIOS BACKEND
- `src/components/layouts/Header_Alumno_comp.jsx` - UI completa, basada en contextos
- `src/components/layouts/SideBar_Alumno_Comp.jsx` - UI completa, lógica logout lista  
- `src/components/layouts/AlumnoLayout.jsx` - Integración de providers completa
- `src/context/StudentDashboardProvider.jsx` - Wrapper de contextos completo

### 🔧 REQUIEREN TRABAJO BACKEND
- `src/context/StudentContext.jsx` - Líneas 65, 83, 98, 110
- `src/context/StudentNotificationContext.jsx` - Líneas 45, 65, 78, 90

## 🚨 CHECKLIST FINAL BACKEND

1. **Abrir StudentContext.jsx**
   - Reemplazar línea 65: `/api/students/profile`
   - Reemplazar línea 83: `/api/students/courses`  
   - Reemplazar línea 98: `/api/students/verification`
   - Reemplazar línea 110: `/api/auth/logout`

2. **Abrir StudentNotificationContext.jsx**
   - Reemplazar línea 45: `/api/notifications`
   - Reemplazar línea 65: `/api/notifications/{id}/read`
   - Reemplazar línea 78: `/api/notifications/mark-all-read`
   - Reemplazar línea 90: `/api/notifications/{id}` DELETE

3. **NO TOCAR**
   - Ningún archivo de layout
   - Ningún archivo de componente  
   - Archivos de provider
   - Archivos de header
   - Archivos de sidebar

## 🎯 **PARA EL DESARROLLADOR BACKEND**

**Solo necesitas trabajar en 2 archivos:**
1. `src/context/StudentContext.jsx` - Buscar `// TODO: BACKEND`
2. `src/context/StudentNotificationContext.jsx` - Buscar `// TODO: BACKEND`

**El header funcionará automáticamente cuando conectes las APIs.**
