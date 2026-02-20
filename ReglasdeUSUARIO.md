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

### Re-aplicación scroll EEAU23 (contenido arriba)
- **Contexto**: Se volvió a aplicar la corrección del scroll al entrar a `/mqerk/online/eeau23` (contenido que se veía "hasta abajo").
- **Cambios**: En **EEAU23.jsx** se mantiene el `useEffect` al montar con `window.scrollTo(0, 0)` inmediato + `requestAnimationFrame` + `setTimeout(..., 50)` y se añadió un segundo `setTimeout(..., 150)` para cubrir contenido que se pinta más tarde (p. ej. ReactPlayer). En **ScrollToTop.jsx** se mantiene scroll inmediato + `requestAnimationFrame` en cada cambio de `pathname`. Archivos: `client/src/components/mqerk/online/EEAU23.jsx`, `client/src/components/common/ScrollToTop.jsx`.

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

### Última actualización
19/02/2026
