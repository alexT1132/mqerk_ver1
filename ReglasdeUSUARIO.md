# 📋 REGLAS DE USUARIO - MQerK

Este documento contiene todas las reglas, convenciones e instrucciones que deben seguirse en el desarrollo del proyecto **MQerK Academy**.
Este archivo es la **fuente de verdad** para el estilo de código y arquitectura del proyecto.

---

## 🎯 REGLAS FUNDAMENTALES Y CRÍTICAS

### 1. Metodología de Desarrollo
- **Backend (Node/Express)**:
  - **Patrón MVC**: Estricta separación.
  - **Asincronía**: Usar `async/await` en lugar de callbacks para promesas (DB, FileSystem).
  - **Manejo de Errores**: Usar bloques `try/catch` en controladores. Preferir pasar errores al middleware global con `next(err)` para errores inesperados.
- **Frontend (React)**:
  - **Componentes Funcionales**: Uso exclusivo de Hooks.
  - **Estado Global**: Context API para estados compartidos (`AuthContext`, etc.).
  - **Servicios**: Toda llamada a API debe estar encapsulada en `client/src/api/`.

### 2. Nomenclatura (Naming Conventions)
- **Archivos Backend**: `camelCase` con sufijo descriptivo.
  - Ej: `usuarios.controller.js`, `cursos.model.js`, `auth.routes.js`.
- **Archivos Frontend**:
  - **Componentes**: `PascalCase` (Ej: `Navbar.jsx`, `CursoCard.jsx`).
  - **Contextos**: `PascalCase` (Ej: `AuthContext.jsx`).
  - **Hooks**: `camelCase` con prefijo `use` (Ej: `useAuth.jsx`).
  - **Funciones/Variables**: `camelCase` (Ej: `handleSubmit`, `isLoading`).
- **Base de Datos**: `snake_case` para tablas y columnas (Ej: `id_estudiante`, `created_at`).

---

## 🎨 UI/UX Y DISEÑO (REGLAS OBLIGATORIAS)

### 1. Diseño Visual (Tailwind CSS v4)
- **Tema Oscuro/Claro**: La aplicación DEBE funcionar en ambos modos sin fallos visuales.
- **Selects Visibles [CRÍTICO]**: Asegurar contraste en elementos `<select>` y `<option>`.
  - *Regla*: Usar estilos globales o clases utilitarias `dark:bg-gray-800 dark:text-white`.

### 2. Animaciones
- **Obligatorio**:
  - Transiciones en botones (`hover:scale-105`, `transition-colors`).
  - Entrada suave de vistas (`animate-fade-in`).
  - Feedback visual de carga (`skeleton loaders` o spinners).

---

## 🧩 ARQUITECTURA DETALLADA

### 1. Backend (`server/`)
- **Manejo de Respuestas**:
  - Éxito: `res.status(200).json({ ok: true, data: ... })`.
  - Creación: `res.status(201).json({ ok: true, data: ... })`.
  - Error Controlado: `res.status(4xx).json({ message: "..." })`.
  - Error Servidor: `res.status(500)` o `next(err)`.
- **Base de Datos**:
  - Usar `mysql2/promise`.
  - Consultas parametrizadas `?` para evitar SQL Injection.
  - Conexión vía pool (`db.js`).

### 2. Frontend (`client/`)
- **API Requests (`client/src/api/`)**:
  - Usar instancia de `axios` configurada.
  - Exportaciones nombradas.
  - Ej: `export const loginRequest = (data) => axios.post('/login', data);`
- **Contextos**:
  - Proveedores deben encapsular lógica y estado.
  - Exponer funciones de acción (`login`, `registro`) y estado (`user`, `loading`).
- **Imports**:
  - Agrupar imports de librerías primero, luego componentes internos, luego estilos/assets.

---

## 📝 CONTROL DE CAMBIOS Y DOCUMENTACIÓN

### Regla de Registro Diario
**OBLIGATORIO**: Registrar cambios al final de este archivo.

**Formato**:
`### Versión [Mayor].[Menor] - DD/MM/YYYY - HH:MM:SS`
- **Descripción**: Resumen.
- **Cambios**: Puntos clave.

**Cómo obtener la fecha y hora para el historial**:
- **PowerShell (Windows)**: `Get-Date -Format 'yyyy-MM-dd HH:mm:ss'` → convertir a DD/MM/YYYY - HH:MM:SS.
- **Bash/Git Bash**: `date '+%d/%m/%Y - %H:%M:%S'` (formato directo).
- **CMD (Windows)**: `echo %date% %time%` (ajustar formato manualmente).
- Se usa la fecha y hora **actual del equipo** al momento de registrar el cambio.

---

## 📅 HISTORIAL DE CAMBIOS

### 20/02/2026 - Modales Feedback_Alumno_Comp más proporcionales en escritorio

#### Objetivo
Los modales del componente Feedback (Nueva actividad, Subir/Cancelar tarea, Ver nota del asesor) tenían un ancho fijo `max-w-md` (448px) que en pantallas de escritorio se veía pequeño y desproporcionado. Se ajustó el tamaño para que escale según el viewport y abarque un tamaño considerable en función del equipo, manteniendo estética, diseño y responsividad.

#### Qué se hizo
- **Escala responsiva del ancho**: Los modales ahora usan una progresión de `max-width` según breakpoints:
  - **Base (móvil)**: `max-w-[min(28rem,95vw)]` — hasta 448px o 95% del viewport (evita desbordes).
  - **sm (≥640px)**: `max-w-md` (448px).
  - **md (≥768px)**: `max-w-lg` (512px).
  - **lg (≥1024px)**: `max-w-xl` (576px).
  - **xl (≥1280px)**: `max-w-2xl` (672px).
  - **2xl (≥1536px)**: `max-w-3xl` (768px).

#### Cómo se hizo (paso a paso)
1. Se localizaron los tres modales en `Feedback_Alumno_Comp.jsx` por su estructura común (div con `bg-white`, `rounded-2xl`, `shadow-2xl`).
2. En cada modal, se identificó el atributo `className` del div contenedor del contenido.
3. Se reemplazó la cadena `max-w-md w-full` por la nueva cadena responsiva.
4. Se mantuvo `w-full` al inicio para que el modal ocupe el ancho disponible hasta el `max-w` correspondiente.

#### Código exacto: antes y después

**ANTES** (en cada uno de los 3 modales):
```jsx
<div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-violet-200/50 ring-2 ring-violet-100/50">
```

**DESPUÉS** (Modal Subir/Cancelar y Crear actividad):
```jsx
<div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl transform transition-all duration-300 scale-100 border-2 border-violet-200/50 ring-2 ring-violet-100/50">
```

**DESPUÉS** (Modal Ver nota del asesor — sin `transform`):
```jsx
<div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl overflow-hidden border-2 border-violet-200/50 ring-2 ring-violet-100/50">
```

#### Explicación de cada clase de ancho
| Clase | Valor | Cuándo aplica |
|-------|-------|---------------|
| `w-full` | 100% del padre | Siempre |
| `max-w-[min(28rem,95vw)]` | El menor entre 448px y 95% del viewport | Base (móvil) |
| `sm:max-w-md` | 448px (28rem) | viewport ≥ 640px |
| `md:max-w-lg` | 512px (32rem) | viewport ≥ 768px |
| `lg:max-w-xl` | 576px (36rem) | viewport ≥ 1024px |
| `xl:max-w-2xl` | 672px (42rem) | viewport ≥ 1280px |
| `2xl:max-w-3xl` | 768px (48rem) | viewport ≥ 1536px |

#### Archivos modificados (detalle)
| Archivo | Líneas aprox. | Descripción del cambio |
|--------|---------------|------------------------|
| `client/src/components/student/Feedback_Alumno_Comp.jsx` | ~1147, ~1326, ~1358 | En cada modal: reemplazo de `max-w-md w-full` por la cadena responsiva en el `className` del div con `bg-white`. |

#### Resultado
Los modales se ven más proporcionados en laptops y monitores grandes, sin perder usabilidad en móviles. Se sigue el principio de viewport lógico del skill de responsividad (no resolución física).

---

### 20/02/2026 - Animaciones de entrada y salida en modales (ReciboModal y Feedback_Alumno_Comp)

#### Objetivo
Añadir animaciones de entrada y salida a los modales ReciboModal y Feedback_Alumno_Comp usando Tailwind/CSS, para mejorar la experiencia visual al abrir y cerrar.

#### Qué se hizo
- **Entrada**: overlay con fade-in, contenido con fade-in + scale (0.9 → 1).
- **Salida**: overlay con fade-out, contenido con fade-out + scale (1 → 0.95). Se retrasa el unmount 200 ms para que la animación se complete.
- **Clases CSS** en `index.css`:
  - `animate-fade-in-overlay`: overlay entra con opacidad 0→1 (0.2s).
  - `animate-fade-out-overlay`: overlay sale con opacidad 1→0 (0.2s).
  - `animate-fade-in-scale`: contenido entra con opacidad 0→1 y scale 0.9→1 (0.3s).
  - `animate-fade-out-scale`: contenido sale con opacidad 1→0 y scale 1→0.95 (0.2s).

#### Cómo se hizo (paso a paso)

**Paso 1: index.css — nuevas keyframes y clases**

Se insertó el siguiente bloque CSS **después** de `.animate-fade-in-scale` y **antes** del comentario `/* Barra de progreso */`:

```css
/* Animación de fade-out con escala (para salida de modales) */
@keyframes fade-out-scale {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

.animate-fade-out-scale {
  animation: fade-out-scale 0.2s ease-in forwards;
}

/* Fade-in para overlay de modales */
@keyframes fade-in-overlay {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.animate-fade-in-overlay {
  animation: fade-in-overlay 0.2s ease-out forwards;
}

@keyframes fade-out-overlay {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.animate-fade-out-overlay {
  animation: fade-out-overlay 0.2s ease-in forwards;
}
```

**Paso 2: ComprobanteVirtual.jsx — ReciboModal**

- Se añadió `useState` para `isExiting` (ya estaba importado).
- Se creó la función `handleClose` que: (1) evita doble cierre si `isExiting` es true; (2) pone `setIsExiting(true)`; (3) tras `setTimeout(..., 200)` llama `onClose()` y `setIsExiting(false)`.
- Se cambió la condición de render: `if (!isOpen) return null` → `if (!isOpen && !isExiting) return null`.
- Se reemplazó el JSX estático por clases dinámicas según `isExiting`:
  - Overlay: `onClick={handleClose}`, `className` con `animate-fade-in-overlay` o `animate-fade-out-overlay`.
  - Contenido: `onClick={(e) => e.stopPropagation()}`, `className` con `animate-fade-in-scale` o `animate-fade-out-scale`.
- El botón de cerrar (X) ahora llama a `handleClose` en lugar de `onClose`.

**Paso 3: Feedback_Alumno_Comp.jsx**

- Se añadió estado: `const [modalExiting, setModalExiting] = useState(null);` (valores: `'upload' | 'note' | 'create'`).
- Se crearon tres handlers que retrasan el cierre 200 ms:
  ```jsx
  const closeModalWithAnimation = () => {
    if (modalExiting) return;
    setModalExiting('upload');
    setTimeout(() => { closeModal(); setModalExiting(null); }, 200);
  };
  const closeNoteModalWithAnimation = () => { ... };
  const closeCreateTaskWithAnimation = () => { ... };
  ```
- En cada modal se añadieron al overlay: `onClick`, `role="dialog"`, `aria-modal="true"`, y clases dinámicas `animate-fade-in-overlay` / `animate-fade-out-overlay` según `modalExiting === 'upload'|'note'|'create'`.
- En el div del contenido: `onClick={(e) => e.stopPropagation()}`, clases `animate-fade-in-scale` / `animate-fade-out-scale`.
- Los botones "Cerrar" y "Cancelar" ahora llaman a los handlers con animación en lugar de los cierres directos.

#### Código exacto: fragmentos clave

**ReciboModal — overlay y contenido (ComprobanteVirtual.jsx):**
```jsx
const overlayClasses = `fixed inset-0 z-[9999] ... ${exiting ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'}`;
const contentClasses = `relative bg-white ... ${exiting ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`;

return createPortal(
  <div className={overlayClasses} onClick={handleClose} role="dialog" aria-modal="true">
    <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
```

**Feedback — ejemplo Modal Subir/Cancelar:**
```jsx
<div className={`fixed inset-0 ... ${modalExiting === 'upload' ? 'animate-fade-out-overlay' : 'animate-fade-in-overlay'}`}
     onClick={closeModalWithAnimation} role="dialog" aria-modal="true">
  <div className={`bg-white ... ${modalExiting === 'upload' ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
       onClick={(e) => e.stopPropagation()}>
```

#### Archivos modificados (detalle)
| Archivo | Líneas/bloque | Cambio |
|--------|---------------|--------|
| `client/src/index.css` | Tras `.animate-fade-in-scale` | Nuevo bloque con 4 keyframes y 4 clases. |
| `client/src/components/shared/ComprobanteVirtual.jsx` | ReciboModal (líneas ~27-100) | `useState(isExiting)`, `handleClose`, clases dinámicas, `onClick` en overlay. |
| `client/src/components/student/Feedback_Alumno_Comp.jsx` | Estados ~56, handlers ~363, modales ~1147, ~1326, ~1358 | `modalExiting`, 3 handlers, overlays y contenidos con clases dinámicas. |

#### Resultado
Los modales tienen animación de entrada (fade + scale) y salida (fade + scale) de 200 ms, con cierre al hacer clic fuera cuando aplica.

---

### 20/02/2026 - Calendario: título "EVENTOS PRÓXIMOS" centrado

#### Objetivo
En la página Calendario, centrar solo el título "EVENTOS PRÓXIMOS" (igual que en Mis Pagos), manteniendo el badge "X pendiente(s)" a la derecha en desktop.

#### Qué se hizo
- **Móvil**: badge arriba (order-1), título centrado abajo (order-2).
- **Desktop (sm+)**: título centrado con `absolute left-1/2 -translate-x-1/2`; badge a la derecha con `ml-auto`.

#### Cómo se hizo (paso a paso)
1. Se localizó el header de "Eventos Próximos" en `Calendar_Alumno_Comp.jsx` (dentro de la columna xl:order-1).
2. Se cambió el contenedor de `grid grid-cols-1 sm:grid-cols-[1fr_auto]` a `flex flex-col sm:flex-row sm:items-center ... relative`.
3. Se añadió al `h2` las clases para centrarlo: `w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex justify-center`.
4. Se añadió al `span` (badge) `sm:ml-auto` para empujarlo a la derecha en desktop, y `justify-center sm:justify-end` para alineación.

#### Código exacto: antes y después

**ANTES:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 shrink-0">
  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 tracking-tight order-2 sm:order-1">
    EVENTOS PRÓXIMOS
  </h2>
  <span className="inline-flex items-center justify-self-start sm:justify-self-end px-2.5 sm:px-3 py-1 sm:py-1.5 ... order-1 sm:order-2">
    {importantEvents.length} pendiente{importantEvents.length !== 1 ? 's' : ''}
  </span>
</div>
```

**DESPUÉS:**
```jsx
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 shrink-0 relative">
  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 tracking-tight w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex justify-center order-2 sm:order-1">
    EVENTOS PRÓXIMOS
  </h2>
  <span className="inline-flex items-center justify-center sm:justify-end px-2.5 sm:px-3 py-1 sm:py-1.5 ... order-1 sm:order-2 sm:ml-auto">
    {importantEvents.length} pendiente{importantEvents.length !== 1 ? 's' : ''}
  </span>
</div>
```

#### Explicación de las clases clave
| Elemento | Clase | Función |
|----------|-------|---------|
| Contenedor | `relative` | Permite posicionar el h2 con `absolute` respecto a este contenedor. |
| h2 | `sm:absolute sm:left-1/2 sm:-translate-x-1/2` | Centra el título horizontalmente en desktop. |
| h2 | `flex justify-center` | Centra el texto dentro del h2 en móvil (cuando ocupa `w-full`). |
| span | `sm:ml-auto` | Empuja el badge a la derecha en el flex-row. |

#### Archivos modificados (detalle)
| Archivo | Ubicación | Cambio |
|--------|-----------|--------|
| `client/src/components/student/Calendar_Alumno_Comp.jsx` | Header "Eventos Próximos", ~líneas 834-841 | Sustitución del div contenedor, h2 y span con las nuevas clases. |

---

### 20/02/2026 - MisPagos: icono y título "MIS PAGOS" centrados

#### Objetivo
En la página Mis Pagos, el usuario solicitó que solo el icono y el título "MIS PAGOS" estén centrados, en lugar de tener el título a la izquierda y los tabs a la derecha con `justify-between`.

#### Qué se hizo
- **Móvil**: icono + título centrados en su fila; tabs debajo.
- **Desktop (sm+)**: icono + título centrados con `absolute left-1/2 -translate-x-1/2`; tabs alineados a la derecha con `ml-auto`.

#### Cómo se hizo (paso a paso)
1. Se localizó el header con el icono CreditCard, el título "MIS PAGOS" y los tabs (Plan Actual, Historial).
2. Se cambió el contenedor padre de `flex flex-col md:flex-row md:items-center md:justify-between` a `flex flex-col sm:flex-row sm:items-center ... relative`.
3. Se envolvió el icono + título en un div con clases para centrarlo: `w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2` y se añadió comentario "Icono + título centrados".
4. Se añadieron al contenedor de tabs las clases `sm:ml-auto sm:order-2` para posicionarlos a la derecha en desktop.

#### Código exacto: antes y después

**ANTES:**
```jsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
  <div className="flex items-center justify-center gap-2 sm:gap-3">
    <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 ...">
      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <h1 className="text-xl xs:text-2xl ...">MIS PAGOS</h1>
  </div>
  <div className="flex bg-white rounded-xl ...">
    {/* tabs */}
  </div>
</div>
```

**DESPUÉS:**
```jsx
<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative">
  <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
    <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 ...">
      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <h1 className="text-xl xs:text-2xl ...">MIS PAGOS</h1>
  </div>
  <div className="flex bg-white rounded-xl ... sm:ml-auto sm:order-2">
    {/* tabs */}
  </div>
</div>
```

#### Archivos modificados (detalle)
| Archivo | Ubicación | Cambio |
|--------|-----------|--------|
| `client/src/components/student/MisPagos_Alumno_Comp.jsx` | Header principal, ~líneas 1981-1994 | Contenedor con `relative`; div icono+título con `w-full sm:w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2`; div tabs con `sm:ml-auto sm:order-2`. |

---

### 20/02/2026 - PaymentModal (Calendario) más proporcional en escritorio

#### Objetivo
El modal PaymentModal en `Calendar_Alumno_Comp.jsx` (información de pago pendiente) tenía una escala responsiva que en escritorio se veía pequeña (`sm:max-w-sm` 384px, `lg:max-w-lg` 512px). Se actualizó para usar la misma escala que ReciboModal y Feedback, con mayor ancho en pantallas grandes.

#### Qué se hizo
- **Antes**: `max-w-[95vw] sm:max-w-sm lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl`
- **Después**: `max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl`

#### Cómo se hizo (paso a paso)
1. Se localizó el componente `PaymentModal` en `Calendar_Alumno_Comp.jsx`.
2. Se identificó el div con la clase `payment-modal-content` que contiene el contenido del modal (header "Pago pendiente", monto, botón Cerrar).
3. Se reemplazó en el `className` la cadena de `max-w-*` por la nueva escala responsiva unificada.

#### Código exacto: antes y después

**ANTES:**
```jsx
<div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-2xl p-1 sm:p-4 lg:p-6 xl:p-8 w-full max-w-[95vw] sm:max-w-sm lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto border border-gray-100 shrink-0 my-auto payment-modal-content">
```

**DESPUÉS:**
```jsx
<div className="bg-white rounded-md sm:rounded-2xl lg:rounded-3xl shadow-2xl p-1 sm:p-4 lg:p-6 xl:p-8 w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto border border-gray-100 shrink-0 my-auto payment-modal-content">
```

#### Tabla comparativa de anchos
| Breakpoint | Antes | Después |
|------------|-------|---------|
| Base | 95vw | min(28rem, 95vw) |
| sm | 384px | 448px |
| md | — | 512px |
| lg | 512px | 576px |
| xl | 576px | 672px |
| 2xl | 672px | 768px |

#### Archivos modificados (detalle)
| Archivo | Ubicación | Cambio |
|--------|-----------|--------|
| `client/src/components/student/Calendar_Alumno_Comp.jsx` | PaymentModal, div con `payment-modal-content`, ~línea 31 | Sustitución de la cadena `max-w-[95vw] sm:max-w-sm lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl` por `max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl`. |

---

### 20/02/2026 - ReciboModal (Comprobante de Pago) más proporcional en escritorio

#### Objetivo
El modal ReciboModal (Comprobante de Pago) en `ComprobanteVirtual.jsx` tenía un ancho fijo `max-w-sm` (384px) que en pantallas de escritorio se veía pequeño. Se aplicó la misma escala responsiva que los modales de Feedback para consistencia visual y mejor legibilidad del comprobante.

#### Qué se hizo
- **Escala responsiva del ancho**: El contenedor del modal pasó de `max-w-sm w-full` a la misma progresión usada en Feedback_Alumno_Comp:
  - **Base (móvil)**: `max-w-[min(28rem,95vw)]`.
  - **sm (≥640px)**: `max-w-md` (448px).
  - **md (≥768px)**: `max-w-lg` (512px).
  - **lg (≥1024px)**: `max-w-xl` (576px).
  - **xl (≥1280px)**: `max-w-2xl` (672px).
  - **2xl (≥1536px)**: `max-w-3xl` (768px).

#### Cómo se hizo (paso a paso)
1. Se localizó la función `ReciboModal` en `ComprobanteVirtual.jsx`.
2. Se identificó el div contenedor principal del modal (el que tiene `bg-white rounded-lg shadow-2xl` y envuelve el header "Comprobante de Pago" y el contenido).
3. Se reemplazó `max-w-sm w-full` por la cadena responsiva completa.
4. Se mantuvo intacto `max-h-[min(90vh,720px)]` y el resto de clases.

#### Código exacto: antes y después

**ANTES:**
```jsx
<div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[min(90vh,720px)] overflow-hidden flex flex-col">
```

**DESPUÉS:**
```jsx
<div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl max-h-[min(90vh,720px)] overflow-hidden flex flex-col">
```

#### Clases añadidas/reemplazadas
| Sustitución | Detalle |
|-------------|---------|
| `max-w-sm w-full` → | Eliminado |
| `w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl` | Nueva cadena responsiva |

#### Archivos modificados (detalle)
| Archivo | Ubicación | Cambio |
|--------|-----------|--------|
| `client/src/components/shared/ComprobanteVirtual.jsx` | ReciboModal, div contenedor del contenido, ~línea 61 | Reemplazo de `max-w-sm w-full` por `w-full max-w-[min(28rem,95vw)] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl` en el `className`. |

#### Resultado
El comprobante de pago se ve más grande y legible en escritorio, alineado con el resto de modales del proyecto.

---

### 19/02/2026 - Verificación y corrección de cambios del historial (cursor_html_element_size_adjustment_for)
- **Objetivo**: Verificar que todos los cambios documentados en el chat exportado estén correctamente aplicados en el código.
- **Verificación realizada**: Se revisaron ProfileEditModal, ChartModal, SidebarBase, SidebarAlumno, AlumnoDashboardBundle, Layout, InicioAlumnoDashboard, Web.jsx, index.css, Online.jsx, PersonalDataCollapsible, FeedbackCard, Metrics_dash_alumnos_comp, Cursos.jsx, vite.config, package.json.
- **Correcciones aplicadas**:
  1. **ProfileEditModal** (`Profile_Alumno_Comp.jsx`): Se añadió `backdrop-blur-sm` al div del backdrop (faltaba según v2.3).
  2. **ChartModal** (`ChartModal.jsx`): Se añadió `backdrop-blur-sm` al overlay y se actualizó el comentario a "Overlay con blur (estilo ReciboModal)".
  3. **SidebarBase** (`SidebarBase.jsx`): Se corrigió `CLICK_FREEZE_MS` de 100 a **1200** ms en modo `expandOnHoverOnly` (v1.8: evita colapso por mouseleave espurio tras clic/navegación).
  4. **Online.jsx**: Se añadió `relative z-10` al div del hero para que no quede por debajo del contenido.
- **Archivos modificados**:
  - `client/src/components/student/Profile_Alumno_Comp.jsx`
  - `client/src/components/student/metricsAlumno/ChartModal.jsx`
  - `client/src/components/layouts/SidebarBase.jsx`
  - `client/src/components/mqerk/online/Online.jsx`
- **Resultado**: Los cambios del historial quedan alineados con el código actual.

### 19/02/2026 - Corrección scroll EEAU23 (contenido arriba, no hasta abajo) – Documentación detallada

#### Objetivo
Al hacer clic en la tarjeta "Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023" en la página `/online`, la ruta `/mqerk/online/eeau23` cargaba correctamente pero la vista quedaba desplazada "hasta abajo" (sección "Testimonios Reales") en lugar de mostrar el inicio de la página (hero, video, objetivos). La corrección asegura que la vista siempre comience en la parte superior.

#### Causa del problema
1. **Restauración de scroll del navegador**: El navegador intentaba restaurar la posición de scroll al navegar.
2. **Scroll anchoring**: Al cargar contenido asíncrono (p. ej. ReactPlayer/YouTube), el navegador ajustaba el scroll para mantener la "ancla" visual.
3. **Timing**: El scroll se ejecutaba antes de que el layout final estuviera pintado.
4. **Múltiples contenedores de scroll**: El scroll podía estar en `window`, `document.documentElement`, `document.body` o `#root`.

---

#### Qué se hizo (resumen por archivo)

| Archivo | Cambio |
|---------|--------|
| `client/src/main.jsx` | Desactivar restauración automática de scroll del navegador |
| `client/src/index.css` | Desactivar scroll anchoring en los contenedores principales |
| `client/src/components/mqerk/online/EEAU23.jsx` | Scroll forzado al montar con múltiples refuerzos y `scrollIntoView` |
| `client/src/components/common/ScrollToTop.jsx` | Scroll global en cada cambio de ruta con varios timeouts |
| `client/src/components/mqerk/online/Online.jsx` | `replace: true` en el Link de la tarjeta EEAU23 |

---

#### Cómo se hizo (detalle por archivo)

##### 1. `client/src/main.jsx`

**Ubicación**: Justo después de los imports y antes de `createRoot(...)`.

**Código añadido**:
```javascript
// Evitar que el navegador restaure scroll al navegar (p. ej. /online → /mqerk/online/eeau23)
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}
```

**Explicación**: `history.scrollRestoration = 'manual'` indica al navegador que no restaure la posición de scroll al navegar (avanzar/retroceder). Así evitamos que se recupere una posición antigua al cambiar de ruta.

---

##### 2. `client/src/index.css`

**Ubicación**: Dentro del bloque de estilos de `html, body, #root` (aprox. líneas 21-31).

**Código añadido** (una línea dentro del bloque existente):
```css
overflow-anchor: none; /* Evita que el navegador ajuste scroll al cargar contenido (ej. ReactPlayer en EEAU23) */
```

**Bloque completo resultante**:
```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  max-width: 100vw;
  overflow-anchor: none; /* Evita que el navegador ajuste scroll al cargar contenido (ej. ReactPlayer en EEAU23) */
}
```

**Explicación**: `overflow-anchor: none` desactiva el scroll anchoring. Sin esto, al cargar contenido nuevo (p. ej. el iframe de ReactPlayer), el navegador puede ajustar el scroll para mantener una "ancla" visual, lo que hacía que la vista bajara.

---

##### 3. `client/src/components/mqerk/online/EEAU23.jsx`

**Cambios realizados**:

**a) Imports**: Se añadió `useLayoutEffect`:
```javascript
import React, { useState, useEffect, useLayoutEffect } from 'react'
```

**b) Ref y función de scroll** (dentro del componente `EEAU23`):
```javascript
const topRef = React.useRef(null)

const scrollToTop = () => {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  const root = document.getElementById('root')
  if (root) root.scrollTop = 0
  const el = topRef.current || document.getElementById('eeau23-top')
  el?.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' })
}
```

**c) useLayoutEffect** (scroll antes del paint):
```javascript
useLayoutEffect(() => {
  scrollToTop()
}, [])
```

**d) useEffect** (refuerzos para contenido que se pinta más tarde):
```javascript
useEffect(() => {
  scrollToTop()
  const raf = requestAnimationFrame(scrollToTop)
  const t50 = setTimeout(scrollToTop, 50)
  const t150 = setTimeout(scrollToTop, 150)
  const t400 = setTimeout(scrollToTop, 400)
  const t800 = setTimeout(scrollToTop, 800)
  const t1200 = setTimeout(scrollToTop, 1200)
  return () => {
    cancelAnimationFrame(raf)
    clearTimeout(t50)
    clearTimeout(t150)
    clearTimeout(t400)
    clearTimeout(t800)
    clearTimeout(t1200)
  }
}, [])
```

**e) JSX**: Ref en el contenedor principal y ancla invisible:
```javascript
<div ref={topRef} className='min-h-screen flex flex-col bg-linear-to-b from-purple-50 to-white'>
  {/* Ancla para scroll al inicio (evita que quede "hasta abajo" al navegar desde /online) */}
  <div id="eeau23-top" className="absolute -top-px left-0 w-px h-px pointer-events-none" aria-hidden="true" />
  <Navbar />
  {/* ... resto del contenido ... */}
</div>
```

**Explicación**:
- `topRef` apunta al contenedor principal para usar `scrollIntoView` de forma fiable.
- `scrollToTop` aplica scroll en todos los posibles contenedores (`window`, `documentElement`, `body`, `#root`) y luego `scrollIntoView` en el elemento superior.
- `useLayoutEffect` ejecuta el scroll antes del paint para evitar parpadeos.
- `useEffect` repite el scroll en varios momentos (0, rAF, 50, 150, 400, 800, 1200 ms) para cubrir contenido que se pinta más tarde (p. ej. ReactPlayer).
- La ancla `#eeau23-top` es un div de 1px en la parte superior que sirve como referencia para `scrollIntoView`.

---

##### 4. `client/src/components/common/ScrollToTop.jsx`

**Código completo del archivo**:
```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.getElementById('root');
  if (root) root.scrollTop = 0;
  const topEl = document.getElementById('eeau23-top');
  if (topEl) topEl.scrollIntoView({ behavior: 'instant', block: 'start' });
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    scrollToTop();
    const raf = requestAnimationFrame(scrollToTop);
    const t1 = setTimeout(scrollToTop, 50);
    const t2 = setTimeout(scrollToTop, 150);
    const t3 = setTimeout(scrollToTop, 400);
    const t4 = hash === '#top' ? setTimeout(scrollToTop, 600) : null;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
    };
  }, [pathname, hash]);

  return null;
}
```

**Explicación**:
- Se ejecuta en cada cambio de `pathname` (y `hash`).
- Aplica scroll en `window`, `documentElement`, `body`, `#root` y, si existe, en `#eeau23-top` con `scrollIntoView`.
- Refuerza el scroll en el siguiente frame (`requestAnimationFrame`) y en 50, 150 y 400 ms.
- Si la URL tiene `#top`, añade un refuerzo extra a los 600 ms.

---

##### 5. `client/src/components/mqerk/online/Online.jsx`

**Ubicación**: En el componente `OnlineCard`, en la definición de `cardProps`.

**Antes**:
```javascript
const cardProps = to ? { to } : {};
```

**Después**:
```javascript
const cardProps = to ? { to, ...(to === '/mqerk/online/eeau23' ? { replace: true } : {}) } : {};
```

**Explicación**: Para la tarjeta que enlaza a `/mqerk/online/eeau23` se usa `replace: true` en el `Link`. Así la navegación reemplaza la entrada actual del historial en lugar de añadir una nueva, lo que puede evitar comportamientos de restauración de scroll asociados al historial.

---

#### Archivos modificados (listado)

| Ruta | Qué se modificó |
|------|------------------|
| `client/src/main.jsx` | Bloque `if` con `history.scrollRestoration = 'manual'` antes de `createRoot` |
| `client/src/index.css` | Propiedad `overflow-anchor: none` en el bloque `html, body, #root` |
| `client/src/components/mqerk/online/EEAU23.jsx` | Imports, `topRef`, `scrollToTop`, `useLayoutEffect`, `useEffect`, ref y ancla en el JSX |
| `client/src/components/common/ScrollToTop.jsx` | Función `scrollToTop` ampliada y `useEffect` con múltiples timeouts |
| `client/src/components/mqerk/online/Online.jsx` | `cardProps` con `replace: true` condicional para la ruta EEAU23 |

---

#### Resultado esperado
Al hacer clic en la tarjeta "Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023" en `/online`, la página `/mqerk/online/eeau23` debe mostrarse con la vista al inicio (hero, título, video, objetivos), sin quedar desplazada hacia la sección "Testimonios Reales".

### 19/02/2026 - Scroll al inicio al entrar a EEAU23 (contenido arriba, no hasta abajo)
- **Problema**: Al hacer clic en la tarjeta "Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023" en `/online`, la página `/mqerk/online/eeau23` cargaba pero la vista quedaba con el contenido "hasta abajo" en lugar de mostrar el inicio (hero, video, objetivos).
- **Causa**: El scroll al cambio de ruta (ScrollToTop) se ejecutaba antes de que el componente EEAU23 terminara de renderizar o el navegador aplicara el layout, por lo que la posición de scroll no se mantenía en 0.
- **Solución**:
  1. **EEAU23.jsx**: Se añadió un `useEffect` al montar que hace `window.scrollTo(0, 0)` de forma inmediata, y además en `requestAnimationFrame` y con `setTimeout(..., 50)` para forzar scroll al inicio tras el primer pintado y tras contenido asíncrono (p. ej. ReactPlayer).
  2. **ScrollToTop.jsx**: Se reforzó el efecto para ejecutar el scroll de forma inmediata y también en el siguiente `requestAnimationFrame`, de modo que si la nueva ruta pinta después del cambio de `pathname`, el scroll se aplique igualmente.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/mqerk/online/EEAU23.jsx`: `useEffect` con scroll al montar.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/common/ScrollToTop.jsx`: doble scroll (inmediato + requestAnimationFrame) en cada cambio de `pathname`.

### 19/02/2026 - Contenido completo en tarjetas de la página Online (EEAU / testimonios)
- **Problema**: En la página `/online`, la tarjeta "Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023" (y el resto de tarjetas) truncaban título y descripción con `line-clamp-3`, por lo que el contenido se veía "solo hasta lo último" (solo la parte final visible).
- **Solución**: En el componente `OnlineCard` de `Online.jsx` se eliminó `line-clamp-3` del título y de la descripción, y se quitó `min-h-[4rem]` del título para que la tarjeta muestre el texto completo. Se añadió `min-h-0` al contenedor del contenido para un correcto comportamiento del flex.
- **Archivo modificado**: `mqerk_ver1-Miguel-el-Angel/client/src/components/mqerk/online/Online.jsx` (componente `OnlineCard`: div del contenido, `h3` del título, `p` de la descripción).

### Versión 2.3 - 18/02/2026 - Efecto blur en backdrops de modales (ProfileEditModal y ChartModal)
- **Objetivo**: Unificar la experiencia visual de los modales con el de ReciboModal: al abrir un modal, el contenido de la página de fondo se desenfoca con `backdrop-blur-sm`.
- **Referencia**: En ReciboModal (ComprobanteRecibo) el contenedor del modal usa `bg-black/60 backdrop-blur-sm`; se replicó el efecto en los backdrops de Mi perfil y del modal de gráficas.
- **Qué se hizo**:
  1. **ProfileEditModal (Editar Perfil – Mi perfil)**  
     - Se añadió la clase `backdrop-blur-sm` al div del backdrop (el que cubre toda la pantalla y recibe el clic para cerrar).
     - Ese div ya tenía `absolute inset-0 bg-black/50` y `transition-opacity duration-200`; solo se agregó `backdrop-blur-sm` en el `className`.
  2. **ChartModal (modal de gráficas en métricas del alumno)**  
     - Se añadió `backdrop-blur-sm` al overlay fijo que está detrás del contenido del modal.
     - El overlay ya tenía `fixed inset-0 bg-black/50 transition-opacity duration-200` y `onClick={onClose}`; solo se agregó `backdrop-blur-sm`.
     - Se actualizó el comentario de "Overlay - sin blur para mejor rendimiento" a "Overlay con blur (estilo ReciboModal)".
- **Cómo se hizo**:
  - En ambos archivos se localizó el elemento del DOM que actúa como fondo oscuro del modal (backdrop/overlay).
  - En ese elemento se añadió la clase Tailwind `backdrop-blur-sm` junto a las clases existentes, sin cambiar estructura ni comportamiento (cierre al clic, Escape, etc.).
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/Profile_Alumno_Comp.jsx`  
    - Función/componente: `ProfileEditModal`.  
    - Bloque: `modalContent`, dentro del primer `div` contenedor; el hijo que hace de backdrop es un `div` con `aria-hidden="true"` y `onClick={handleClose}`. En su `className` se añadió `backdrop-blur-sm`.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/metricsAlumno/ChartModal.jsx`  
    - Componente: `ChartModal`.  
    - Dentro de `modalContent`, el primer hijo del contenedor es el overlay (div con `onClick={onClose}` y `aria-hidden="true"`). En su `className` se añadió `backdrop-blur-sm` y se actualizó el comentario.
- **Resultado**: Al abrir el modal "Editar Perfil" en Mi perfil o el modal de la gráfica en métricas, el fondo de la página se desenfoca de forma consistente con ReciboModal.

### Versión 2.2 - 17/02/2026 - Carrusel "Nuestros estudiantes": botones y transición

- **Objetivo**: Permitir navegación manual en el carrusel de la landing y dar feedback visual (animación/transición) al cambiar de foto, sin quitar el avance automático.

---

#### Qué se hizo (resumen por funcionalidad)

1. **Botones anterior y siguiente**
   - Dos botones circulares a izquierda y derecha del carrusel, con íconos de flecha (`ChevronLeft`, `ChevronRight` de lucide-react).
   - Al hacer clic llaman a `goToPrev()` y `goToNext()`, que actualizan `currentIndex` de forma circular (módulo sobre la longitud del array de imágenes).
   - Estilo final (tras v2.2.1): transparente/glass (ver entrada 2.2.1 más abajo).

2. **Animación al cambiar de foto**
   - **Imagen central**: clase `pasarela-img-center-enter` que dispara la animación CSS `pasarela-fadeIn` (0,45 s, `ease-out`): la nueva foto entra con opacidad de 0 a 1 y escala desde un valor menor hasta el definido para cada breakpoint (1.8 en desktop, 1.5 en ≤930px, 1.2 en ≤855px).
   - **Imágenes laterales**: clase `pasarela-img-transition` con `transition: opacity 0.35s ease-out` para un cambio suave al actualizar el índice.

3. **Keys en las imágenes**
   - Cada `<img>` del carrusel tiene un `key` que depende del índice: `key={\`prev-${getPrevIndex()}\`}`, `key={\`center-${currentIndex}\`}`, `key={\`next-${getNextIndex()}\`}`.
   - Así, cuando cambia `currentIndex`, la imagen central se desmonta y se vuelve a montar con la nueva fuente; al montar, la clase `pasarela-img-center-enter` hace que se ejecute la animación de entrada en cada cambio.

4. **Avance automático y reinicio al usar los botones**
   - El carrusel sigue avanzando solo cada 4 segundos.
   - Se usa un `useRef` (`intervalRef`) para guardar el id del `setInterval`. La función `startAutoAdvance()` limpia el intervalo anterior (si existe) y crea uno nuevo.
   - Tanto el `useEffect` inicial como las funciones `goToPrev` y `goToNext` llaman a `startAutoAdvance()`, de modo que al pulsar un botón el temporizador se reinicia y no avanza justo después del clic.

---

#### Cómo se hizo (paso a paso por archivo)

**Archivo: `mqerk_ver1-Miguel-el-Angel/client/src/Web.jsx`**

| Paso | Dónde / qué | Acción |
|------|-------------|--------|
| 1 | Cabecera del archivo, después de `useLocation` | Se añadió el import: `import { ChevronLeft, ChevronRight } from "lucide-react";` |
| 2 | Dentro de `function Web()`, después de `const [currentIndex, setCurrentIndex] = useState(0);` | Se añadió `const intervalRef = useRef(null);` y se reemplazó el bloque del `useEffect` del carrusel por: (a) función `startAutoAdvance()` que hace `clearInterval(intervalRef.current)` y luego `intervalRef.current = setInterval(...)` con `setCurrentIndex((prev) => (prev + 1) % studentImages.length)` cada 4000 ms; (b) `useEffect` que llama a `startAutoAdvance()` y en el cleanup hace `clearInterval(intervalRef.current)`; (c) funciones `goToPrev()` y `goToNext()` que actualizan `currentIndex` con módulo y llaman a `startAutoAdvance()`. |
| 3 | JSX: sección "SECCIÓN: ESTUDIANTES (CARRUSEL 3D)" | Se envolvió el `div.pasarela-3d-container` en un `div` con clase `pasarela-3d-wrapper`. Dentro del wrapper, antes del contenedor: un `<button type="button" onClick={goToPrev} className="pasarela-btn pasarela-btn-prev" aria-label="Foto anterior">` con `<ChevronLeft className="pasarela-btn-icon" strokeWidth={2.5} />`. Después del contenedor: un `<button type="button" onClick={goToNext} className="pasarela-btn pasarela-btn-next" aria-label="Foto siguiente">` con `<ChevronRight className="pasarela-btn-icon" strokeWidth={2.5} />`. |
| 4 | Las tres `<img>` del carrusel | Se añadió a cada una un atributo `key` (ver punto 3 de "Qué se hizo"). A la imagen izquierda y derecha se añadió la clase `pasarela-img-transition` además de `pasarela-img left` / `pasarela-img right`. A la imagen central se añadió la clase `pasarela-img-center-enter` además de `pasarela-img center`. |

**Archivo: `mqerk_ver1-Miguel-el-Angel/client/src/index.css`**

| Paso | Dónde / qué | Acción |
|------|-------------|--------|
| 1 | Justo después del comentario `/* ------------------------------------------------ */` y **antes** de `.pasarela-3d-container` | Se insertó un bloque nuevo con: (a) `.pasarela-3d-wrapper` con `position: relative`, `width: 100%`, `display: flex`, `justify-content: center`, `align-items: center`; (b) estilos de botones (ver entrada 2.2.1 para valores actuales de `.pasarela-btn` y hover); (c) `.pasarela-btn-prev` con `left: 8px` y `.pasarela-btn-next` con `right: 8px`; (d) media query `@media (max-width: 855px)` para reducir tamaño de botones e íconos y márgenes; (e) `.pasarela-img-center-enter` con `animation: pasarela-fadeIn 0.45s ease-out forwards`; (f) `.pasarela-img-transition` con `transition: opacity 0.35s ease-out`; (g) `@keyframes pasarela-fadeIn` con `from` (opacity 0, scale según breakpoint) y `to` (opacity 1, scale final); (h) dos media queries adicionales para redefinir los valores de scale dentro de `pasarela-fadeIn` en 930px y 855px. |
| 2 | (En la misma zona) | Los estilos base de `.pasarela-3d-container`, `.pasarela-3d` y `.pasarela-img` se dejaron igual; solo se añadieron las clases nuevas y el wrapper. |

---

#### Archivos modificados (listado con detalle)

| Archivo | Qué se modificó |
|---------|-----------------|
| **`mqerk_ver1-Miguel-el-Angel/client/src/Web.jsx`** | Línea ~3: nuevo import `ChevronLeft`, `ChevronRight`. Dentro de `Web`: nuevo `intervalRef`; reemplazo del `useEffect` del carrusel por `startAutoAdvance`, `useEffect` con cleanup y `goToPrev`/`goToNext`; en el JSX de la sección "Nuestros estudiantes", nuevo wrapper `pasarela-3d-wrapper`, dos botones con íconos y las tres imágenes con `key` y clases `pasarela-img-transition` / `pasarela-img-center-enter`. |
| **`mqerk_ver1-Miguel-el-Angel/client/src/index.css`** | Tras el separador de la pasarela: nuevo bloque con `.pasarela-3d-wrapper`, `.pasarela-btn`, `.pasarela-btn:hover`, `.pasarela-btn:active`, `.pasarela-btn-icon`, `.pasarela-btn-prev`, `.pasarela-btn-next`, media query 855px para botones, `.pasarela-img-center-enter`, `.pasarela-img-transition`, `@keyframes pasarela-fadeIn` y sus media queries 930px y 855px. |

---

#### Versión 2.2.1 - 17/02/2026 - Botones en estilo transparente/glass

- **Objetivo**: Que los botones del carrusel no compitan con el color de la página (fondo negro, título rosa) y se integren visualmente.
- **Qué se hizo**: Se cambiaron los estilos de `.pasarela-btn` y `.pasarela-btn:hover` en `index.css`.
- **Valores aplicados**:
  - **Estado normal**: `border: 1px solid rgba(255, 255, 255, 0.25)`; `background: rgba(0, 0, 0, 0.35)`; `color: rgba(255, 255, 255, 0.85)`; `backdrop-filter: blur(8px)`; transiciones para background, color, transform, border-color y box-shadow.
  - **Hover**: `background: rgba(244, 19, 138, 0.5)`; `color: white`; `border-color: rgba(244, 19, 138, 0.7)`; `box-shadow: 0 0 16px rgba(244, 19, 138, 0.25)`; `transform: scale(1.08)`.
  - **Responsivo**: En `@media (max-width: 855px)` los botones pasan a 40×40px, el ícono a 22×22px y los márgenes laterales a 4px.
- **Archivo modificado**: `mqerk_ver1-Miguel-el-Angel/client/src/index.css` — únicamente las reglas `.pasarela-btn` y `.pasarela-btn:hover` (y la media query de botones si se ajustó ahí el tamaño).

---

#### Resultado final

- Carrusel con dos botones (anterior/siguiente) en estilo glass que combinan con el fondo.
- Al cambiar de foto (manual o automático), la central hace una animación de entrada (fade + escala) y las laterales una transición de opacidad.
- El avance automático cada 4 s se reinicia al usar los botones.

### Versión 2.0 - 11/02/2026 - 01:59:20 - Restauración del botón candado en sidebar alumno
- **Objetivo**: Mantener modo hover y volver a mostrar el candado (pin) para fijar el sidebar colapsado.
- **Qué se hizo**:
  1. Modo hover (`expandOnHoverOnly`) se mantiene para expandir/retraer por cursor.
  2. Candado (pin) de nuevo visible y funcional para fijar colapsado cuando el usuario lo active.
  3. En `SidebarBase.jsx`: se eliminó el forzado que ocultaba el pin en modo hover; se re-habilitó `togglePinned`; se ajustaron `effectivePinnedCollapsed` y `effectiveShowPinnedToggle` para respetar el estado real del candado.
  4. En `SidebarAlumno.jsx`: `showPinnedToggle` cambiado a `true`.
- **Cómo se hizo**: Revisión de la lógica de `effectiveShowPinnedToggle` y del render del botón pin en `SidebarBase.jsx`; cambio de prop en `SidebarAlumno.jsx`.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarBase.jsx`: lógica del pin en modo hover, `effectivePinnedCollapsed`, `effectiveShowPinnedToggle`, `togglePinned`.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarAlumno.jsx`: prop `showPinnedToggle={true}`.
- **Resultado**: Sidebar con hover y control manual por candado sin perder funcionalidades.

### Versión 2.1 - 11/02/2026 - 02:14:25 - Transiciones visuales y ajuste responsivo
- **Objetivo**: Suavizar transiciones del sidebar y del contenido principal y eliminar espacios en blanco en distintas resoluciones.
- **Qué se hizo**:
  1. **Sidebar**: Animaciones suaves en ítems (hover, iconos con micro-scale, indicador lateral); estados activos con `ring` y desplazamiento sutil.
  2. **Contenido principal**: Entrada con fade/translate al cambiar de vista; wrapper con `min-h-[calc(100vh-3.5rem)]`; contenedor con `max-w-[1440px]` y padding responsivo.
- **Cómo se hizo**: Ajuste de clases Tailwind en los componentes (transiciones, alturas mínimas, anchos máximos).
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarBase.jsx`: estilos de ítems, hover, indicador lateral, estados activos.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/Layout.jsx`: wrapper y contenedor del contenido principal.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/InicioAlumnoDashboard.jsx`: ajustes de layout y espaciado.
- **Resultado**: Transiciones más suaves y layout sin huecos en blanco en distintas resoluciones.

### Versión 1.9 - 10/02/2026 - 17:33:27 - Rebote del sidebar al seleccionar opciones
- **Objetivo**: Evitar que el sidebar se retraiga o rebote al hacer clic en un enlace de navegación.
- **Causa raíz**: el sidebar desktop se pasaba como función inline en `AlumnoDashboardBundle.jsx`, provocando remonte del componente al navegar y reinicio de estado (`isSidebarOpen`).
- **Fix aplicado**:
  - Se reemplazó el componente inline por referencia estable:
    - `SideBarDesktopComponent={shouldShowSidebar ? SideBarDesktop_Alumno_comp : null}`
    - `SideBarSmComponent={shouldShowSidebar ? SideBarSm_Alumno_comp : null}`
- **Resultado esperado**: el estado del sidebar se mantiene entre cambios de ruta y se elimina el “rebote” visual al hacer clic en links.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/AlumnoDashboardBundle.jsx`: props `SideBarDesktopComponent` y `SideBarSmComponent` del `Layout`.
- **Resultado**: El estado del sidebar se mantiene entre cambios de ruta y desaparece el rebote visual al hacer clic en links.

### Versión 1.8 - 10/02/2026 - 16:28:40 - Freeze del sidebar tras clic (navegación)
- **Objetivo**: Evitar que el sidebar se colapse al hacer clic en una opción (navegación), manteniendo el diseño y el colapso al salir el cursor.
- **Qué se hizo**: Se aumentó `CLICK_FREEZE_MS` en modo `expandOnHoverOnly` de 500 ms a **1200 ms** para que, tras un clic (p. ej. en un Link), no se dispare un colapso por `mouseleave` espurio.
- **Cómo se hizo**: Localización de la constante `CLICK_FREEZE_MS` (o equivalente) en `SidebarBase.jsx` y cambio de valor; el "freeze" retrasa la comprobación de cierre del sidebar tras interacción.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarBase.jsx`: constante de freeze (CLICK_FREEZE_MS o lógica equivalente) en la lógica de `handleMouseLeave` / expandOnHoverOnly.
- **Resultado**: Tras hacer clic en una opción del sidebar, este no se retrae de forma inmediata; el colapso solo ocurre al salir el cursor.

### Versión 1.7 - 10/02/2026 - 15:32:10 - Sidebar alumno (expandOnHoverOnly)
- **Objetivo**: Sidebar que inicia colapsado, se expande al hover y solo se retrae al salir el cursor, sin retraerse al hacer clic en una opción.
- **Qué se hizo**:
  1. Sidebar inicia colapsado (solo íconos).
  2. Al entrar el cursor: se expande mostrando texto y opciones completas.
  3. Al hacer clic en una opción: el sidebar no se retrae.
  4. Al salir el cursor del área: el sidebar se retrae a solo íconos.
  5. Transiciones suaves (duration-300, delay 180 ms).
  6. Nuevo prop `expandOnHoverOnly` en `DesktopSidebarBase`; se desactiva el blur que provocaba retracción al clicar; se oculta el botón pin; sidebar alumno usa este modo.
- **Cómo se hizo**: Implementación de `expandOnHoverOnly` en `SidebarBase.jsx` (lógica de mouse enter/leave y freeze); en `SidebarAlumno.jsx` se pasa el prop y se configura `showPinnedToggle` según el modo.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarBase.jsx`: prop `expandOnHoverOnly`, `handleMouseEnter`/`handleMouseLeave`, delay/Freeze, estilos de transición, visibilidad del pin.
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/layouts/SidebarAlumno.jsx`: uso de `expandOnHoverOnly` y configuración del sidebar alumno.
- **Resultado**: Sidebar del alumno con comportamiento solo por hover y sin retracción al navegar.

### Versión 1.6 - 10/02/2026 - 14:00:18 - Re-aplicación modal Información de Pago
- **Objetivo**: Restaurar las correcciones del modal de Información de Pago para pantallas grandes tras una actualización del proyecto.
- **Qué se hizo**: Se reaplicaron en `InicioAlumnoDashboard.jsx` los cambios de la v1.5: contenedor con breakpoints xl/2xl, padding y espaciado, header, métodos de pago, transferencia, efectivo, subir comprobante.
- **Cómo se hizo**: Revisión del modal de pago en `InicioAlumnoDashboard.jsx` y restauración de las clases y estructura documentadas en v1.5.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/InicioAlumnoDashboard.jsx`: contenedor del modal, padding, header, secciones de pago.
- **Resultado**: Modal de Información de Pago de nuevo adaptado a pantallas grandes.

### Versión 1.5 - 10/02/2026 - 12:11:14 - Ampliación modal Información de Pago (InicioAlumnoDashboard)
- **Objetivo**: Mejorar legibilidad y aprovechamiento del espacio del modal de Información de Pago en monitores grandes sin afectar la experiencia móvil.
- **Qué se hizo**:
  1. Contenedor del modal: breakpoints `xl:max-w-2xl` (672px) y `2xl:max-w-3xl` (768px).
  2. Padding y espaciado: contenido interno `lg:p-3`, `xl:p-4`, `lg:space-y-2.5`, `xl:space-y-3`.
  3. Header: mayor padding (`md:px-3 xl:px-4`, `md:py-2 xl:py-2.5`), título `lg:text-base xl:text-lg`, icono más grande.
  4. Métodos de Pago: padding `lg:p-2.5 xl:p-3`, títulos `lg:text-sm xl:text-base`, grid `lg:gap-2 xl:gap-3`.
  5. Transferencia Bancaria: padding `lg:p-2.5 xl:p-3`, iconos `lg:w-7 lg:h-7`, textos y campos Cuenta/CLABE `lg:text-sm`.
  6. Pago en Efectivo: mismos ajustes de escala.
  7. Subir Comprobante: padding `lg:p-3 xl:p-4`, icono `lg:w-12 lg:h-12 xl:w-14 xl:h-14`, textos `lg:text-sm xl:text-base`.
- **Cómo se hizo**: Ajuste de clases Tailwind por breakpoint en el modal de pago de `InicioAlumnoDashboard.jsx`.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/InicioAlumnoDashboard.jsx`: contenedor del modal, header, secciones Métodos de Pago, Transferencia, Efectivo, Subir Comprobante.
- **Resultado**: Modal de pago más legible y proporcionado en pantallas grandes.

### Versión 1.5 - 10/02/2026 - 13:45:02 - Re-aplicación mejoras de responsividad (estudiante)
- **Objetivo**: Restaurar el diseño de ancho completo (`w-full`) en todos los componentes de estudiantes tras una actualización.
- **Qué se hizo**: Se reaplicaron correcciones de responsividad (ancho completo, viewport) en los componentes listados.
- **Cómo se hizo**: Revisión y ajuste de clases de ancho/layout en cada componente.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/AccessGuard.jsx` (ajuste relativo al viewport)
  - `Asistencia_Alumno_comp.jsx`, `Calendar_Alumno_Comp.jsx`, `Configuracion_Alumno_Comp.jsx`, `Feedback_Alumno_Comp.jsx`, `MisPagos_Alumno_Comp.jsx`, `Recursos_Alumno_comp.jsx`, `Simulaciones_Alumno_comp.jsx`, `InicioAlumnoDashboard.jsx`, `MisCursos_Alumno_Comp.jsx`, `Actividades_Alumno_comp.jsx`
- **Resultado**: Módulos de estudiante de nuevo con ancho completo consistente.

### Versión 1.4 - 10/02/2026 - 01:44:04 - Responsividad AccessGuard
- **Objetivo**: Hacer que el aviso de AccessGuard escale con el tamaño de la ventana de forma fluida.
- **Qué se hizo**: Se actualizó `AccessGuard.jsx` para usar unidades relativas al viewport (`vw`) y porcentajes; el aviso escala en el rango 90%-40% del viewport; se conservaron dimensiones y legibilidad.
- **Cómo se hizo**: Sustitución de valores fijos por unidades `vw` y porcentajes en los estilos del componente.
- **Archivos modificados**:
  - `mqerk_ver1-Miguel-el-Angel/client/src/components/student/AccessGuard.jsx` (o ruta equivalente): estilos del contenedor del aviso.
- **Resultado**: Aviso de acceso que se adapta al tamaño de la ventana.

### Versión 1.3 - 10/02/2026 - 01:19:06 - Diseño responsivo módulos estudiante
- **Objetivo**: Aprovechar el ancho completo de pantalla en los módulos de estudiante eliminando restricciones de ancho máximo.
- **Qué se hizo**: Se eliminaron `max-w-7xl`, `max-w-[90rem]`, etc. en Recursos, Simulaciones, Feedback, Asistencia, Calendar, Configuracion; se aplicó `w-full max-w-full`; se verificó consistencia en Profile.
- **Cómo se hizo**: Revisión de cada componente y cambio de clases Tailwind de ancho.
- **Archivos modificados**:
  - Componentes de estudiante: Recursos, Simulaciones, Feedback, Asistencia, Calendar, Configuracion, Profile (en `mqerk_ver1-Miguel-el-Angel/client/src/components/student/`).
- **Resultado**: Módulos de estudiante con ancho completo en distintas resoluciones.

### Versión 1.2 - 10/02/2026 - 00:50:00 - Robustecimiento Reglas de Usuario
- **Objetivo**: Documentar y estandarizar convenciones de nomenclatura, respuestas de API y capa de servicios.
- **Qué se hizo**: Convenciones de nomenclatura (Backend/Frontend); manejo de respuestas y errores en Backend (`next(err)`, códigos HTTP); patrones para `client/src/api`; convenciones DB `snake_case` vs código `camelCase`.
- **Cómo se hizo**: Actualización de este documento (ReglasdeUSUARIO.md) con las secciones correspondientes.
- **Archivos modificados**:
  - `ReglasdeUSUARIO.md`: secciones de nomenclatura, arquitectura Backend/Frontend, convenciones de BD.
- **Resultado**: Reglas explícitas para mantener consistencia en el proyecto.

### Versión 1.1 - 10/02/2026 - 00:43:00 - Documentación exhaustiva
- **Objetivo**: Dejar por escrito las reglas implícitas del proyecto.
- **Qué se hizo**: Documentación exhaustiva de reglas y convenciones en ReglasdeUSUARIO.md.
- **Archivos modificados**: `ReglasdeUSUARIO.md`.
- **Resultado**: Fuente de verdad documentada para el estilo y la arquitectura del proyecto.

### Versión 1.0 - 10/02/2026 - 00:30:00 - Inicialización del análisis
- **Objetivo**: Punto de partida del registro de cambios.
- **Qué se hizo**: Inicialización del análisis del proyecto y del historial de cambios.
- **Resultado**: Base del historial en ReglasdeUSUARIO.md.

### Versión 1.7 - 16/02/2026 - Eliminación dependencia sileo
- **Objetivo**: Quitar la dependencia no usada `sileo` del proyecto.
- **Qué se hizo**: Se eliminó el paquete `sileo` (^0.1.0) del `package.json` de la raíz del repositorio; la dependencia no se usaba en client ni server.
- **Cómo se hizo**: Edición de `package.json` en la raíz: eliminación de la entrada `sileo` en `dependencies`.
- **Archivos modificados**:
  - `package.json` (raíz del repositorio MQerK): eliminada la entrada de `sileo` en dependencies.
- **Resultado**: Proyecto sin dependencia sileo; se recomienda ejecutar `npm install` en la raíz para actualizar `package-lock.json` y eliminar `node_modules/sileo` si existe.

### 18/02/2026 - Restauración desde commits 21d561e, c2047bd y 1634496
- **Acción**: Se restauró todo el árbol del proyecto al estado del commit **1634496** (que incluye los cambios de 21d561e y c2047bd), sobrescribiendo la versión actual con tu versión de esos archivos.
- **Commits incluidos**:
  - `21d561e` – Correcciones de errores visuales de Dashboard Alumnos y LandingPage.
  - `c2047bd` – Correcciones de errores visuales de Dashboard Alumnos y LandingPage (+ .gitignore, ReglasdeUSUARIO).
  - `1634496` – Implementación del carrusel "Nuestros estudiantes", botones, animaciones, ProfileEditModal, sidebar, index.css, etc.
- **Alcance**: Más de 100 archivos restaurados (client, server, ReglasdeUSUARIO.md, package.json en raíz, etc.).
- **Recuperación de cambios de Miguel (Asesor)**: Tras la restauración anterior se habían perdido los cambios de Miguel en el módulo Asesor (él trabajaba Asesor, tú Alumno). Se restauraron desde **HEAD** (commit 763d6b6) todos los archivos del Asesor para recuperar su trabajo:
  - Componentes: `client/src/components/Asesor/*` (Agenda, Dashboard, PerfilAsesor, Cursos, Pagos, Sidebar, simGen, etc.), `SideBarAsesor.jsx`, `AsesorContext.jsx`.
  - Páginas: `pages/Asesor/Feedback.jsx`, `FeedbackDetail.jsx`, `SimulacionesGenerales.jsx`.
  - Backend: `server/controllers/asesor_reminders.controller.js`, `server/routes/asesor_reminders.routes.js`, `server/routes/asesor_resources.routes.js`.
  - Admin relacionados: `FinanzasPagosAsesores.jsx`, `SolicitudesAsesores.jsx`.
- **Recuperación de cambios de Miguel (Admin)**: También se habían sobrescrito componentes del panel Admin. Se restauraron desde **HEAD** estos archivos para mantener el trabajo de Miguel:
  - `client/src/components/admin/BienvenidaAdmin.jsx`
  - `client/src/components/admin/Calendario_Admin_comp.jsx`
  - `client/src/components/admin/ChatAdmin.jsx`
  - `client/src/components/admin/Finanzas.jsx`
  - `client/src/components/admin/FinanzasEgresosFijos.jsx`
  - `client/src/components/admin/FinanzasEgresosPresupuesto.jsx`
  - `client/src/components/admin/FinanzasEgresosVariables.jsx`
  - `client/src/components/admin/FinanzasIngresos.jsx`
  - `client/src/components/admin/ListaAlumnos_Admin_comp.jsx`
  - `client/src/components/admin/ReportesPagos_Admin_comp.jsx`
  - `client/src/components/admin/ValidacionPagos_Admin_comp.jsx`
  - `client/src/components/admin/inicio-admin.jsx`
- **Estado final**: Tus cambios (Alumno, carrusel, Profile_Alumno_Comp, sidebars alumno, index.css, etc.) siguen en staging; los archivos del Asesor vuelven a ser la versión de Miguel.
- **Incorporación del commit 4162167 de Miguel (responsive Asesor)**: Se hizo `git fetch repo-miguel` y se aplicaron los cambios del commit `4162167a14e525bd47f8c4312696579002304d0c` ("ajuste de responsive de asesor: inicio, mi perfil y curso"). Ese commit solo toca 3 archivos; se copió su contenido a la estructura local (`mqerk_ver1-Miguel-el-Angel/client/...`):
  - `client/src/components/Asesor/Agenda.jsx`
  - `client/src/components/Asesor/AsesorMaestro.jsx`
  - `client/src/components/Asesor/PerfilAsesor.jsx`
- **Nota**: En el repo de Miguel (remoto `repo-miguel`) la raíz tiene `client/` y `server/` directamente; aquí esas rutas viven bajo `mqerk_ver1-Miguel-el-Angel/`. No había más archivos de Asesor ni Admin en ese commit; si Miguel sube más cambios a esa rama, se puede repetir el proceso con el nuevo commit.
- **Asesor inicio (AsesorMaestro.jsx)**: Se volvió a traer la versión exacta del commit **4162167** de Miguel ("ajuste de responsive de asesor: inicio, mi perfil y curso") y se corrigió la corrupción de encoding al copiar desde git (Página, Título, selección, sesión, Sección, aún, aparecerán aquí, ícono ✓). La vista Asesor > Inicio debe reflejar ya las correcciones recientes de Mike (layout responsive, `max-w-[1920px]`, espaciados, grid de cursos y textos legibles).
- **Siguiente paso**: Revisar con `git diff` los 3 archivos; hacer `git add` y commit (p. ej. "Incorporo ajustes responsive Asesor del commit 4162167 de Miguel").

### 18/02/2026 - Importación completa del historial de Miguel (repo-miguel/Miguel-el-Angel)
- **Objetivo**: Traer todos los cambios de Miguel hasta su commit más reciente a las carpetas correspondientes del proyecto local.
- **Historial analizado** (commits recientes de Miguel Angel Cruz Vargas):
  - `4162167` – ajuste de responsive de asesor: inicio, mi perfil y curso
  - `0e5e268` – ancho máximo 1920px (Asesorías, Cursos, Inicio)
  - `6c75600` – fix calendar cell heights y simulation layout responsive
  - `4028dc0` – FIX_FEAT: Recursos, Pagos, Actividades
  - `0df5fc7` – Fix advisor reminders, agenda
  - `f9494b9` – Correcciones estéticas, iconos, descenders
  - `bf232d6` – Refactor UI/UX Sidebar, Recursos, Configuraciones
  - `7ce9635` – Botón Logout en Topbar Asesor
  - Y anteriores: Trophy, simuladores, bloqueo, badges, formula rendering, ReviewModal, LaTeX, chat, sidebars, etc.
- **Método usado**:
  1. `git fetch repo-miguel`
  2. `git archive repo-miguel/Miguel-el-Angel -o mqerk_miguel.zip`
  3. Extracción del zip a `mqerk_miguel_extract/`
  4. Copia de `mqerk_miguel_extract/client/*` → `mqerk_ver1-Miguel-el-Angel/client/`
  5. Copia de `mqerk_miguel_extract/server/*` → `mqerk_ver1-Miguel-el-Angel/server/`
  6. Eliminación de `mqerk_miguel_extract` y `mqerk_miguel.zip`
- **Alcance**: Todo el árbol `client/` y `server/` del commit **4162167** (rama `Miguel-el-Angel`) queda reflejado en `mqerk_ver1-Miguel-el-Angel/client/` y `mqerk_ver1-Miguel-el-Angel/server/`. Incluye Asesor (inicio, perfil, curso, agenda, Topbar, sidebar), Admin, Recursos, Pagos, Actividades, simuladores, fórmulas, recordatorios, etc.
- **Nota**: Los archivos `.env` no se incluyen en el archive (están en `.gitignore`), por lo que no se sobrescriben.

### 18/02/2026 - Sincronización desde carpeta local de Mike (C:\...\mqerk_ver1) sin tocar tus cambios
- **Objetivo**: Traer los cambios de Mike desde su carpeta `C:\Users\Jair Iván\Documents\mqerk_ver1`, pegándolos en `mqerk_ver1-Miguel-el-Angel`, **sin modificar** tus archivos (Alumno, carrusel, Web.jsx, index.css, ReglasdeUSUARIO, sidebars alumno, etc.).
- **Criterio**: Por **cada commit** del historial de Mike se tomó **lo que él corrigió/modificó en ese commit**; solo se copiaron los archivos que pertenecen a **Asesor**, **Admin** o **server** (excluyendo `_backups/`, `server/.env` y cualquier ruta que sea de tus áreas). Es decir: no se copió “en bloque” por cantidad de commits, sino **commit a commit, los archivos tocados en cada uno**.
- **Archivos copiados** (origen: `mqerk_ver1`, destino: `mqerk_ver1-Miguel-el-Angel`): unión de todos los archivos que Mike tocó en sus commits y que cumplen el criterio anterior:
  - **Admin**: componentes BienvenidaAdmin, Calendario_Admin_comp, ChatAdmin, Finanzas*, ListaAlumnos_Admin_comp, SolicitudesAsesores, ValidacionPagos_Admin_comp, inicio-admin, etc.
  - **Asesor**: Agenda, AsesorMaestro, PerfilAsesor, Topbar, Sidebar, Cursos, Pagos, Recursos, Actividades, simGen/*, Quizt&Act, pages/Asesor/*, SideBarAsesor.jsx, api/asesores.js, y demás componentes que Mike modificó en algún commit.
  - **Server**: controladores, rutas, modelos, migraciones, scripts, etc. que Mike modificó en algún commit; **no** se copió `server/.env`.
- **Detalle por commit** (qué se aplicó de lo que Mike corrigió en cada uno):
  - `4162167` – responsive asesor (inicio, perfil, curso) → Agenda, AsesorMaestro, PerfilAsesor.
  - `0e5e268` – ancho máx. 1920px (Asesorías, Cursos, Inicio) → AsesorMaestro, AsesorSimuladores, Asesorias, Cursos, Dashboard, Quizt&Act.
  - `6c75600` – calendar/simulation responsive → Agenda, AsesorDashboardBundle, AsesorMaestro, AsesorSimuladores, ChatAsesor, Configuraciones, Dashboard, DocumentacionAsesor, EntregasActividad, Pagos, PerfilAsesor, Recursos, RegistroAsistencia, Reportes, Sidebar; admin (BienvenidaAdmin, Calendario, ChatAdmin, Finanzas*, ListaAlumnos, SolicitudesAsesores, ValidacionPagos, inicio-admin); pages/Asesor (Feedback, FeedbackDetail, SimulacionesGenerales).
  - `4028dc0` – Recursos, Pagos, Actividades (validación etiquetas, error 400, columnas, “Ver Todos”) → ActSolicitudes, AnalizadorFallosRepetidos, EntregasActividad, ModuloSeleccionado, Pagos, Quiz, Recursos, RegistroAsistencia, ReviewModal, SimuladoresGen, TablaActividades, simGen/QuizIAModal; server: asesor_resources.routes.
  - `0df5fc7` – recordatorios asesor (broadcast, agenda) → api/asesores, Agenda, Pagos; server: asesor_reminders (controller, model, routes).
  - `f9494b9` – iconos y descenders en títulos → múltiples Asesor (Actividades, Agenda, Dashboard, Pagos, Recursos, simGen, etc.) y pages/Asesor/Feedback.
  - `bf232d6` – UI/UX Sidebar, Recursos, Configuraciones, modales, scroll → Agenda, AsesorDashboardBundle, AsesorMaestro, Configuraciones, Dashboard, DocumentacionAsesor, Quiz, QuiztModal, Recursos, ReminderNotifier, Sidebar, SimuladoresGen, SimulatorModal, Topbar.
  - `7ce9635` – botón Logout Topbar Asesor → SimuladoresGen, Topbar.
  - `55f0df3` – importación duplicada Trophy → SimuladoresGen.
  - `3efba64` – signos y layout tabla simuladores → SimuladoresGen.
  - `96c2050` – lógica bloqueo y web → server app.js, index.js.
  - `d8f76b2` – bloqueo por pago → server: cursos, preview, upload, models, routes, tokens, utils.
  - `11c2536` – badges solicitud, contexto, re-solicitud → QuiztModal, TablaActividades, simGen/QuiztBuilder.
  - `73a50c8` – fórmulas LaTeX y overflow en Asesor → ActEspecificos, AnalizadorFallosRepetidos, ChatAsesor, ListaAlumnos, PerfilEstudiante, Quiz, QuiztModal, ReviewModal, Simuladores*, SimulatorModal, simGen/*; server: aiUsage, gemini, aiUsageControl, ai_quota, etc.
  - `da23d62` / `b513c8d` – (archivos en _backups excluidos) → server: gemini, quizzes_questions, ai_quota, quizzes_intentos.
  - `9ac8322` – análisis simulaciones → server: app, aiUsageController, migrations, aiUsageModel, aiUsageRoutes.
  - `e9b5dd3` – tabla Quizzes → QuiztModal, SimuladoresGen, simGen (GeneradorIAModal, QuizIAModal), pages/Asesor (FormRegistro, Resultado, Test).
  - `47ce010` – ReviewModal (calificar quizzes/simuladores) → AnalizadorFallosRepetidos, ManualReviewShortAnswer, Quiz, ReviewModal, SimuladoresGen, SimulatorModal, simGen (InlineMath, QuiztBuilder, QuiztNew, RichTextEditor); server: quizzes, simulaciones, quizzes_intentos.
  - `d9141c6` – LaTeX y acentos InlineMath → Quiz, SimuladorBuilder, SimuladoresGen, SimulatorModal, TablaActividades, simGen (AIFormulaModal, InlineMath, MathField, MathLiveInput, MathPalette, MathQuillEditor, MathTextarea, QuizIAModal, QuiztBuilder, QuiztNew, RichTextEditor, WYSIWYGMathEditor, formulaUtils, useCooldown, useFormulaAI); server: simulaciones.
  - `ed40ca8` – chat tiempo real, sidebars, Groq → Asesor (Asesorias, ChatAsesor, ModuloSeleccionado, Quiz, QuiztModal, SimuladoresGen, SimulatorModal, simGen), admin (ChatAdmin, Finanzas*, ValidacionPagos), SideBarAsesor, pages/Asesor (Bienvenida, FormRegistro, Gracias, PreReg, Resultado, Test); server: chat, groq, migraciones, modelos, scripts, ws.
  - `f9e657d` – sidebars y notas → SideBarAsesor.
  - `7faced0` – sidebar móviles → server: gemini, groq.
  - `7f70bfc` / `271de74` – integración web, chat tiempo real (alumno, asesor, admin) → ChatAsesor, SideBarAsesor, ChatAdmin; server: app, chat, gemini, groq, ai_quota, migraciones, modelos, rutas, ws.
  - `56b64cf` – cambios → server: chatMulter, scripts.
  - `5f256c4` – CAMBIOS → ChatAsesor, ChatAdmin; server chat.controller.
  - `fd35b4e` – fixeds → Asesor (DashboardBundle, ChatAsesor, MobileSidebar, Recursos, Sidebar, navItems), admin (AdminDashboardBundle, ChatAdmin), pages/Asesor/Resultado; server: app, chat, eeau, ws, migraciones, modelos.
  - `e6f7462` – proyecto actualizaciones recientes → múltiples Asesor y simGen; server: asesor_resources, asesores, eeau, gemini, quizzes_questions, reportes, simulaciones, migraciones grading/manual_review, modelos, rutas, backgroundGrader, gradingQueue, textComparison.
  - `4ec8b27` – timeout sesión, analizador fallos, análisis sin IA, scrollbar → Asesor y admin (muchos componentes); server: actividades, asesor_resources, asesores, eeau, estudiantes, gemini, quizzes, simulaciones, student_resources, usuarios, migraciones, modelos, scripts.
  - `6673ce5` – asistencia y bug fixes → Asesor, admin, pages/Asesor; server: asesor_notifications, asesor_reminders, asesor_resources, asistencias, documentos, eeau, feedback, formulas, health, logger, quizzes, simulaciones, student_reminders, usuarios, migraciones, scripts.
  - `db04e14` – subir proyecto completo → Asesor, admin, pages/Asesor, SideBarAsesor; server: app, controllers, models, routes, migrations, scripts, ws (sin .env).
- **No se modificó**: Todo lo tuyo (student/, Web.jsx, index.css, SideBar_Alumno_Comp, ReglasdeUSUARIO.md, etc.) quedó intacto.

### 18/02/2026 - Limpieza de desorganización y duplicaciones (mqerk_ver1-Miguel-el-Angel)
- **Problemas detectados**:
  1. **Carpeta duplicada** `client/src/hooks/src/hooks/`: existía un archivo `useReciboData.js` dentro de `hooks/src/hooks/` (estructura repetida). Se movió `useReciboData.js` a `client/src/hooks/useReciboData.js` y se eliminó la carpeta `hooks/src/`.
  2. **Archivos duplicados con " copy"**: se eliminaron `Actividades_Alumno_comp copy.jsx` (student) y `BienvenidaAdmin copy.jsx` (admin); no eran importados por nadie.
  3. **Dos carpetas de componentes de asesor**: coexisten `components/Asesor/` (singular) y `components/Asesores/` (plural) con archivos similares (Topbar, Sidebar, Pagos, Recursos, etc.). Las **páginas** en `pages/Asesor/*` importan desde **Asesores** (plural). La carpeta **Asesor** (singular) es la que se sincronizó con los commits de Mike; **Asesores** es la que usa el enrutado actual. No se eliminó ninguna: queda como decisión futura unificar en una sola carpeta o mantener ambas si tienen usos distintos.
- **Acciones realizadas**: corrección de estructura en `hooks/`, eliminación de los dos archivos " copy", documentación de lo anterior.

### 19/02/2026 - Análisis ortográfico, puntuación y gramática de la página Online
- **Objetivo**: Revisar ortografía, puntuación y gramática de los textos visibles en la página `/online` (vista pública MQerK).
- **Herramientas**: Navegador interno MCP (cursor-ide-browser): `browser_tabs`, `browser_lock`, `browser_snapshot`. DevTools MCP (user-chrome-devtools) no se usó porque no se encontró el ejecutable de Chrome en el sistema.
- **Ámbito**: Código fuente de `Online.jsx`, `Navbar.jsx` y `footer.jsx`; pestaña abierta en `http://localhost:5173/online`.
- **Resultado**: Se creó el archivo **ANALISIS_ORTOGRAFIA_PAGINA_ONLINE.md** en la raíz del repo con:
  - Resumen (ortografía, puntuación, gramática, consistencia).
  - Listado de textos revisados por componente.
  - Observaciones: "nuestr@s" (recomendación RAE); "Día Internacional de la Educación" (mayúscula); "Inglés, el idioma dominio" (redacción: "el dominio del idioma"); "mostraron la participación en realizar" (simplificar); "definición-problemática" (opción "definición, problemática y solución"); "brinqué" (coloquial, alternativas "salté"/"di el salto"); "Guía Padres" → "Guía para padres"; consistencia "Ingresar" vs "Iniciar sesión".
  - Lo que está correcto (mayúsculas, abreviaturas, acentos, puntuación).
- **Documentación**: Este registro en ReglasdeUSUARIO.md.

### 20/02/2026 - Creación de skill "diseño-responsivo-multidispositivo"
- **Objetivo**: Crear un skill de Cursor que aplique principios de diseño ligero, responsivo y proporcional en todas las modificaciones, considerando pantallas grandes, mapeo de resoluciones y dispositivos (Mac, laptops, iPad, tablets, iPhone, Android, escritorio), sin dejar huecos ni espacios vacíos a los lados.
- **Archivo creado**: `.cursor/skills/diseño-responsivo-multidispositivo/SKILL.md`
- **Contenido del skill**:
  - **Nombre**: `diseño-responsivo-multidispositivo`
  - **Descripción**: Aplica principios de diseño ligero, responsivo y proporcional; considera pantallas grandes, mapeo de resoluciones y dispositivos; garantiza aprovechamiento del espacio sin huecos a los lados.
  - **Principios fundamentales**: Diseño cuidado, ligereza, responsividad, proporcionalidad, aprovechamiento del espacio.
  - **Mapeo de dispositivos y resoluciones**: Tabla con iPhone, Android, iPad, MacBook, iMac, monitores 4K y viewports típicos (lógicos).
  - **Regla crítica**: Sin huecos ni espacios vacíos; contenedores con `w-full`, grids que se expandan, márgenes solo para legibilidad; patrón recomendado con `max-w-[1920px] mx-auto px-4`.
  - **Breakpoints**: base, sm (480px), md (768px), lg (1024px), xl (1280px), 2xl (1536px), 4k (1920px).
  - **Checklist**: Layout en móvil/tablet/escritorio, ausencia de huecos, aprovechamiento del ancho, ligereza, consideración de dispositivos.
  - **Relación**: Complementa el skill `reglas-responsividad` para implementación técnica con Tailwind.
- **Cuándo se aplica**: Al modificar layouts, componentes UI, páginas o cualquier elemento visual.
- **Documentación**: Este registro en ReglasdeUSUARIO.md.

### 20/02/2026 - Migración a clases canónicas de Tailwind CSS v4
- **Objetivo**: Corregir las sugerencias de Tailwind IntelliSense (`suggestCanonicalClasses`) para usar la sintaxis canónica de Tailwind v4.
- **Archivos modificados**:
  - `client/src/components/layouts/SidebarBase.jsx`
  - `client/src/components/mqerk/online/EEAU23.jsx`
  - `client/src/components/mqerk/online/Online.jsx`
  - `client/src/components/student/Calendar_Alumno_Comp.jsx`
  - `client/src/components/student/Feedback_Alumno_Comp.jsx`
  - `client/src/components/student/MisPagos_Alumno_Comp.jsx`
  - `client/src/components/student/Profile_Alumno_Comp.jsx`
  - `ReglasdeUSUARIO.md`
- **Reemplazos aplicados**:
  | Clase antigua | Clase canónica (Tailwind v4) |
  |---------------|------------------------------|
  | `flex-shrink-0` | `shrink-0` |
  | `z-[999]`, `z-[1000]`, `z-[2000]`, `z-[9999]`, `z-[99999]` | `z-999`, `z-1000`, `z-2000`, `z-9999`, `z-99999` |
  | `bg-gradient-to-b` | `bg-linear-to-b` |
  | `bg-gradient-to-r` | `bg-linear-to-r` |
  | `bg-gradient-to-l` | `bg-linear-to-l` |
  | `bg-gradient-to-t` | `bg-linear-to-t` |
  | `bg-gradient-to-br` | `bg-linear-to-br` |
  | `bg-gradient-to-tr` | `bg-linear-to-tr` |
  | `hover:bg-gradient-to-r` | `hover:bg-linear-to-r` |
  | `file:bg-gradient-to-r` | `file:bg-linear-to-r` |
  | `min-h-[4rem]` | `min-h-16` |
  | `break-words` | `wrap-break-word` |
  | `supports-[backdrop-filter]:bg-white/80` | `supports-backdrop-filter:bg-white/80` |
- **Motivo**: Tailwind v4 introduce nombres canónicos más cortos y alineados con la especificación CSS. Las clases antiguas siguen funcionando pero generan advertencias de IntelliSense.
- **Documentación**: Este registro en ReglasdeUSUARIO.md.

### Última actualización
20/02/2026 (migración clases canónicas Tailwind v4)
