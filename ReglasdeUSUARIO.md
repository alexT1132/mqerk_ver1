# Reglas de Usuario – Documentación de cambios

Este archivo documenta de forma detallada cada cambio realizado en el proyecto, por mínima que sea la modificación.

---

## 2025-02-19 – Gastos fijos: iPad (768px+) tabla y botones

### Objetivo
Ajustar la página Gastos fijos para viewports tipo iPad (desde 768×1024 hasta tablets grandes): que la tabla ocupe el ancho disponible y que los botones del registro estén bien distribuidos.

### Cambios en `client/src/components/admin/FinanzasEgresosFijos.jsx`

- **Tarjetas de resumen (Hoy, 7 días, Mes, Año):** Grid antes `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, lo que en iPad (768px) dejaba 3 columnas y la cuarta sola. Ahora: `grid-cols-2 md:grid-cols-2 lg:grid-cols-4`. En iPad (768–1023px) se muestra 2×2; en lg y superior, 4 en una fila.
- **Botones del registro (Filtros, Exportar Excel, Plantillas, Nuevo egreso fijo):** Se mantiene **flex flex-wrap** en todos los viewports. Solo en **móvil** los botones son más táctiles: `min-h-[44px]`, `py-2.5`, `rounded-xl`; “Nuevo egreso fijo” con `w-full` en móvil. En **PC (md y superiores)** se revirtió al aspecto original: `md:min-h-0`, `md:py-2`, `md:rounded-lg`, `md:w-auto` para que no se vean más grandes ni largos en pantallas chicas y grandes.
- **Tabla de gastos fijos:** En **móvil y tablet** (por debajo de 1024px) la tabla mantiene ancho mínimo `min-w-[1020px]` para que las columnas no queden apretadas y el usuario haga scroll horizontal con el dedo. Solo a partir de **lg (1024px)** la tabla usa todo el ancho del contenedor (`lg:min-w-0 lg:w-full`), así en iPad en vertical y móviles la tabla no se “junta”. Contenedor con `overflow-x-auto` y `min-w-0`.

### Resultado esperado
En iPad (768px y superiores) la tabla llena el ancho del bloque sin scroll horizontal innecesario y los cuatro botones se ven alineados y con peso visual similar. Las tarjetas de resumen en iPad se ven en 2×2.

---

## 2025-02-19 – Gastos fijos: plantillas (comprobación) y botones más discretos

### Objetivo
Confirmar que la función de **plantillas** de gastos fijos sirve para crear recordatorios/gastos fijos en automático según fecha, frecuencia y día de pago; y ajustar el diseño de los botones del modal de plantillas para todos los dispositivos (menos grandes).

### Comprobación de la función de plantillas
- **Backend:** En `server/jobs/plantillasAuto.js` un cron diario (por defecto 05:05, TZ México) ejecuta `runPlantillasJob(fecha)`: carga plantillas con `auto_instanciar=1`, `activo=1` y `fecha_inicio <= hoy`; para cada una determina si “hoy” corresponde según frecuencia, día de pago y fecha de inicio (Diario, Semanal, Quincenal, Mensual, Bimestral, Semestral, Anual); si no existe ya un gasto para esa plantilla en esa fecha, inserta el registro en `gastos_fijos`. La plantilla se guarda con `fecha_inicio`, `cadencia_anchor`, `dia_pago`, etc. vía `createPlantilla`/`updatePlantilla`.
- **Frontend:** Al hacer clic en “Instanciar” (crear registro ahora) se llama a `instanciarDesdePlantilla` y, si la plantilla tiene “Calendario automático” (`auto_evento`), se crea además el evento en el calendario y se vincula al gasto. La auto-creación por fecha la hace el servidor; el calendario automático en instanciado manual se hace desde el cliente.
- **Ajuste:** Se corrigió el uso de `saveExpenses('fijos', rows)` en el callback de instanciar manual: ahora se actualiza el backup con la lista resultante dentro del `setRows(prev => { const next = ...; saveExpenses('fijos', next); return next; })` para no usar estado desactualizado.

### Cambios de diseño (botones) en `client/src/components/admin/FinanzasEgresosFijos.jsx`
- **Modal Plantillas de gastos fijos:**
  - **“Agregar plantilla”:** De `h-full w-full rounded-2xl px-6 py-4` a `px-4 py-2.5 text-sm font-bold rounded-xl`, sin ocupar toda la celda; `min-h-[44px]` y `touch-manipulation` para tacto.
  - **“Cerrar gestión”:** De `px-8 py-2.5 rounded-2xl` a `px-5 py-2 text-sm font-bold rounded-xl`; pie del modal `py-4` → `py-3`, `px-6` → `px-4 sm:px-6`.
- **Modal Editar plantilla:**
  - **Cancelar / Guardar cambios:** Tamaño reducido (`px-4 py-2` / `px-5 py-2`), `text-sm`, `min-h-[40px]`, `touch-manipulation`; pie `py-4` → `py-3`, `gap-3` → `gap-2 sm:gap-3`.
- **Nota en el formulario de nueva plantilla:** Bajo los checkboxes “Calendario automático” y “Auto-instanciar” se añadió el texto: “Con Auto-instanciar y Fecha de inicio, el servidor crea los gastos automáticamente según la frecuencia y día de pago.”

### Resultado esperado
La función de plantillas queda verificada (auto-creación por el job en servidor; instanciado manual con opción de evento en calendario). Los botones del modal de plantillas y de edición se ven más proporcionados en PC, tablet y móvil.

---

## 2025-02-19 – Calendario Admin: tour guiado con Driver.js

### Objetivo
Añadir un **tour guiado** por la agenda usando la librería **Driver.js**: un icono discreto (interrogación en círculo) que al pulsarlo inicia un recorrido por las funciones principales: crear recordatorios, calendario y meses, tipos y prioridades, pendientes, recordatorios de Finanzas (no eliminables desde aquí), y próximos recordatorios.

### Cambios realizados

- **Dependencia:** En `client` se instaló **driver.js** (`npm install driver.js`).
- **`client/src/components/admin/Calendario_Admin_comp.jsx`:**
  - **Import:** `import { driver } from 'driver.js'` e `import 'driver.js/dist/driver.css'`.
  - **Botón del tour:** Icono discreto (círculo con “?”) junto al botón «Nuevo Recordatorio» en el header. Atributos `title="Tour guiado por la agenda"` y `aria-label="Iniciar tour guiado"`. Al hacer clic se llama a `startTour()`.
  - **Función `startTour()`:** Crea una instancia de Driver con `showProgress: true`, textos en español (Siguiente, Anterior, Listo, «{{current}} de {{total}}») y los siguientes pasos:
    1. **Crear recordatorio** (`#tour-nuevo-recordatorio`): desde aquí solo se crean recordatorios de tipo trabajo, personal o académico; los de tipo finanzas solo se crean en la sección Finanzas.
    2. **Calendario y meses** (`#tour-calendario-mes`): uso de flechas para cambiar de mes; en cada día se ven los recordatorios (en PC tipo y título, en móvil un número); tocar día o número para lista y detalles.
    3. **Tipos y prioridades** (`#tour-tipos-prioridades`): tipos Trabajo, Personal, Académico y Finanzas (estos últimos solo se crean en Finanzas: gastos variables, fijos, pago asesores); prioridades Alta, Media, Baja.
    4. **Pendientes** (`#tour-resumen-pendientes`): clic para ver no completados; al tocar uno se abre el modal de detalles.
    5. **Recordatorios de Finanzas** (`#tour-header`): los de tipo finanzas solo se crean en Finanzas; si aparecen aquí es por vinculación desde allí; no se pueden eliminar desde el calendario, solo desde Finanzas.
    6. **Próximos recordatorios** (`#tour-proximos`): lista de siguientes pendientes; tocar uno para detalles.
  - **Ids para el tour:** Se añadieron `id="tour-nuevo-recordatorio"` (botón), `id="tour-header"` (banner superior), `id="tour-calendario-mes"` (contenedor del calendario), `id="tour-proximos"` (card Próximos Recordatorios), `id="tour-tipos-prioridades"` (card Tipos + Prioridades), `id="tour-resumen-pendientes"` (card Resumen).

### Resultado esperado
En PC, móvil y tablet, el usuario ve un icono de ayuda discreto; al pulsarlo se inicia un tour que explica crear recordatorios, tipos, prioridades, pendientes, limitación de eliminación en Finanzas y próximos recordatorios.

---

## 2025-02-19 – Calendario Admin: clic en Pendientes abre modal con lista; clic en uno abre Detalles

### Objetivo
En PC, móvil y tablet, al hacer **clic en "Pendientes"** en el resumen del calendario se abre un **modal** con la lista de recordatorios no completados. Al hacer **clic en uno** de ellos se cierra ese modal y se abre el modal **"Detalles del Recordatorio"** (el mismo que en el resto de la app), para ver y usar Eliminar, Completar Tarea, Cerrar.

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`

- **Estado:** `showPendientesModal` para controlar la visibilidad del modal de pendientes.
- **Resumen – fila Pendientes:** La fila "Pendientes" + número es ahora un **botón** (solo hace algo si hay al menos un recordatorio pendiente). Al hacer clic se abre el modal de pendientes.
- **Modal "Recordatorios pendientes":** Lista de recordatorios con `!r.completado`, ordenados por fecha y hora. Cada ítem es un botón que muestra tipo (color y etiqueta corta), título, fecha, hora; al hacer clic se asigna `selectedReminder`, se cierra el modal de pendientes y se abre el modal de Detalles. Diseño responsive (móvil: sale desde abajo, `rounded-t-2xl`; escritorio: centrado). Texto de ayuda: "Toca uno para ver detalles".

### Resultado esperado
En cualquier dispositivo, clic en Pendientes (cuando haya pendientes) → modal con la lista; clic en un recordatorio → modal Detalles del Recordatorio.

---

## 2025-02-19 – Calendario Admin: abreviaturas de tipo (G. variable, Fijos, P. asesor, Trab., etc.)

### Objetivo
Mostrar en celdas y en el modal del día **etiquetas cortas** del tipo de recordatorio para ahorrar espacio y mejorar lectura: gastos variables → «G. variable», gastos fijos → «Fijos», pago asesor → «P. asesor», trabajo → «Trab.», personal → «Pers.», académico → «Acad.», finanzas genérico → «Finanz.».

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`

- **getTipoShortLabel(tipo, titulo):** Nueva función que devuelve la etiqueta abreviada según `tipo` y, si es «finanzas», según el `titulo`: si el título contiene «gasto variable» → «G. variable»; «gasto fijo» → «Fijos»; «pago» y «asesor» → «P. asesor»; en otro caso «Finanz.». Para trabajo/personal/académico devuelve «Trab.» / «Pers.» / «Acad.».
- **Celda del día (escritorio):** El texto del tipo en cada recordatorio pasa a ser `getTipoShortLabel(recordatorio.tipo, recordatorio.titulo)` en lugar del tipo completo.
- **Modal del día – resumen:** El resumen por tipo ahora agrupa por etiqueta corta (p. ej. «2 Trab., 1 G. variable») usando `getTipoShortLabel` para cada recordatorio.
- **Modal del día – fila:** En cada fila, la línea de hora y tipo muestra `r.hora · getTipoShortLabel(r.tipo, r.titulo)`.

### Resultado esperado
En calendario y modal del día se ven abreviaturas claras (G. variable, Fijos, P. asesor, Trab., Pers., Acad., Finanz.) en lugar de textos largos, ganando espacio y legibilidad.

---

## 2025-02-19 – Calendario Admin (PC): celdas sin hora, solo tipo + título; hasta 5 ítems

### Objetivo
En todas las resoluciones de escritorio (medianas, grandes, extra grandes), cuando hay varios recordatorios en una fecha no se veían completos y la hora ocupaba espacio innecesario, ya que la hora se consulta en el modal de detalles. Se simplifica la celda del día: **no se muestra la hora**; se muestra **tipo** (con punto de color por tipo) y **título** (truncado). Así se libera espacio y se ven más recordatorios sin truncar tanto.

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`

- **Vista escritorio (lg y mayor) – contenido de cada recordatorio en la celda:**
  - **Antes:** Primera línea: punto por prioridad + hora; segunda línea: título (truncado). Máximo 3 ítems, luego «+N más».
  - **Ahora:** Primera línea: **punto por tipo** (nuevo `getTipoDotColor`: trabajo=azul, personal=verde, académico=morado, finanzas/otros=ámbar) + **tipo** en texto (capitalizado); segunda línea: **título** (truncado). **Sin hora** en la celda.
  - Se muestran hasta **5** recordatorios por día (antes 3); si hay más, «+N más».
- **getTipoColor:** Ahora normaliza por `toLowerCase()` y se añade caso **finanzas** (fondo y borde ámbar).
- **getTipoDotColor (nuevo):** Devuelve la clase del punto por tipo (bg-blue-500, bg-green-500, bg-purple-500, bg-amber-500) para que el punto en la celda indique el tipo de recordatorio.

### Resultado esperado
En PC (todas las tallas), cada recordatorio en la celda muestra solo tipo + título; la hora se ve en el modal «Detalles del Recordatorio» al hacer clic. Se muestran hasta 5 ítems por día y el punto de color indica el tipo.

---

## 2025-02-19 – Calendario Admin (móvil/iPad): modal del día como resumen + abrir Detalles al tocar

### Objetivo
En móvil/iPad, al tocar el indicador numérico del día debe abrirse un **primer modal** que muestre cuántos recordatorios hay, de qué tipo (resumen) y una **lista de filas clicables**. Al tocar **una fila** se cierra ese modal y se abre el modal **"Detalles del Recordatorio"** (el mismo que en PC: título, descripción, fecha, hora, tipo, prioridad, recordar, Eliminar, Completar Tarea, Cerrar), optimizado para móvil. Las acciones Eliminar y Completar quedan solo en el modal de Detalles, no en el modal del día.

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`

- **Modal del día (primer modal):**
  - Se mantiene el título con cantidad y fecha (ej. «3 recordatorios — 16 feb»).
  - **Resumen por tipo:** Se agrupan los recordatorios por `tipo` y se muestra una línea de texto, ej. «2 trabajo, 1 personal» o «1 finanzas». Se usa `typeLabels` para trabajo, personal, académico, finanzas; otros tipos se muestran en minúscula.
  - Texto de ayuda: «Toca uno para ver detalles».
  - **Lista clicable:** Cada recordatorio es una **fila clicable** (botón) con: punto de prioridad, título, hora y tipo, e icono de flecha. **Sin** botones Eliminar ni Completar en el modal del día.
  - **Al tocar una fila:** Se asigna `setSelectedReminder(r)`, se cierra el modal del día (`setShowDayModal(false)`, se limpian `dayModalReminders` y `dayModalDate`) y se abre el modal de edición con `setShowEditModal(true)`.

- **Modal "Detalles del Recordatorio" (optimizado móvil):**
  - Mismo contenido que en PC (título, descripción, fecha, hora, tipo, prioridad, recordar, botones Eliminar, Completar Tarea, Cerrar).
  - **Contenedor del backdrop:** En pantallas pequeñas el modal se alinea abajo: `flex items-end sm:items-center` y `p-0 sm:p-4` para que en móvil aparezca desde abajo sin padding y en escritorio centrado.
  - **Contenedor del modal:** En móvil `rounded-t-2xl`, en sm+ `sm:rounded-2xl`; `max-h-[90vh]` se mantiene.
  - **Padding:** `p-4 sm:p-6` para más espacio táctil en móvil.
  - **Título:** `text-base sm:text-xl` para no exceder en pantallas pequeñas.
  - **Botón cerrar (X):** `p-2`, `min-h-[44px] min-w-[44px]`, `touch-manipulation` y contenido centrado para área táctil adecuada.
  - **Botones de acción:** Eliminar, Completar Tarea y Cerrar con `min-h-[44px]`, `touch-manipulation` y en móvil `py-3` (sm: `py-1.5`) para mayor altura táctil.

### Resultado esperado
En móvil/iPad: tocar el número del día → modal con cantidad, resumen por tipo y lista; tocar un recordatorio → se cierra el primer modal y se abre "Detalles del Recordatorio" con todas las acciones (Eliminar, Completar, Cerrar) y diseño optimizado para touch.

---

## 2025-02-19 – Calendario Admin: móvil/iPad con indicador numérico y modal del día

### Objetivo
En el calendario admin, en móvil e iPad usar la misma vista compacta: mostrar en cada día un **indicador numérico** (1, 2, 3…) de cuántos recordatorios hay y, al tocar, abrir un **modal compacto** con la lista de recordatorios de ese día y acciones: Eliminar, Marcar pendiente, Marcar completado. Así se evita saturar la cuadrícula y se hace más práctico en pantallas pequeñas.

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`

- **iPad = misma vista que móvil:** La cuadrícula del mes usa ahora el breakpoint **lg** (1024px): la vista con indicador numérico y toque aplica en **`lg:hidden`** (visible en móvil y tablet/iPad); la vista con lista de recordatorios en la celda aplica en **`hidden lg:flex`** (solo escritorio).
- **Indicador numérico:** En cada día con recordatorios se muestra siempre un **número** (1, 2, 3… o «9+» si hay más de 9) dentro de un badge redondeado (purple), en lugar de puntos o mezcla de puntos y número. El badge es táctil (`touch-manipulation`, `min-w-[20px]`, `h-5`/`h-6`).
- **Modal del día (nuevo):** Al tocar el indicador se abre un modal que muestra:
  - Título: «1 recordatorio» o «N recordatorios» y la fecha (día y mes).
  - Lista compacta de recordatorios del día: título, hora, tipo; cada uno con botones **Eliminar** (rosa) y **Completar** / **Pendiente** (verde/ámbar según estado). Botones con `min-h-[44px]` y `touch-manipulation` para uso táctil.
  - Al eliminar un recordatorio se actualiza la lista en el modal y se cierra el modal si ya no queda ninguno.
- **Estado nuevo:** `showDayModal`, `dayModalReminders`, `dayModalDate` para controlar la visibilidad y el contenido del modal del día.

### Resultado esperado
En móvil e iPad cada día del calendario muestra un número (1, 2, 3…) de recordatorios; al tocarlo se abre un modal compacto con la lista del día y las acciones Eliminar, Marcar pendiente y Marcar completado. En escritorio (lg+) se mantiene la vista con lista de recordatorios en la celda.

---

## 2025-02-19 – HeaderAdmin: con poco espacio solo nombre de la academia

### Objetivo
En iPad mini y tablets el título largo («Asesores Especializados en Educación de Ciencia y Tecnología») se superponía al icono de notificaciones aunque se pusiera en varias líneas. Se decidió que **cuando hay poco espacio** se muestre solo el **nombre de la academia** («MQerK Academy») en el centro del header; el título largo solo en escritorio.

### Cambios en `client/src/components/layouts/HeaderAdmin.jsx`

- **Bloque central:** Dos variantes según ancho de pantalla:
  - **Poco espacio (por debajo de lg, &lt; 1024px):** Se muestra solo **«MQerK Academy»** y el subtítulo de sección (Panel Principal, etc.). Clases: `flex lg:hidden` para este bloque. Título en una línea, sin invadir iconos.
  - **Escritorio (lg y superior, ≥ 1024px):** Se muestra el título largo «Asesores Especializados en Educación de Ciencia y Tecnología» y el subtítulo. Clases: `hidden lg:flex` para este bloque. `whitespace-nowrap` para mantener una sola línea.
- **Contenedor:** `max-w-[calc(100vw-14rem)]` en viewports pequeños y `lg:max-w-3xl xl:max-w-4xl` en escritorio; padding `px-4 sm:px-6 md:px-8 lg:px-12`.

### Resultado esperado
En móvil, tablet e iPad el header muestra en el centro «MQerK Academy» + subtítulo, sin solapar los iconos. En pantallas grandes (lg+) se muestra el título largo completo.

---

## 2025-02-19 – SideBarAdmin (drawer): ajustes para iPad/tablet

### Objetivo
En iPad el drawer del menú admin presentaba: opciones poco distribuidas con mucho espacio vacío abajo, altura que parecía excesiva y un borde que casi tapaba parte del header. Ajustar posición, altura y distribución.

### Cambios en `client/src/components/layouts/SideBarAdmin.jsx` (SideBarsm)

- **Posición y altura del drawer:**
  - **Móvil:** `top-16` (4rem) y `h-[calc(100vh-4rem)]` para alinear con el header `h-16`.
  - **Tablet/iPad (sm+):** `sm:top-20` (5rem) y `sm:h-[calc(100vh-5rem)]` para alinear con el header `sm:h-20`, evitando que el drawer invada el header.
- **Borde y sombra:** Añadido `rounded-br-2xl` para suavizar la esquina inferior derecha y que no se vea un corte sobre el header; sombra de `shadow-2xl` a `shadow-xl`.
- **Distribución de opciones:**
  - Lista principal: `py-4 px-2 space-y-1` → `py-5 px-3 pb-10 space-y-2` para más padding, más espacio entre ítems y margen inferior dentro del scroll.
  - Bloque inferior (Cerrar sesión): `pb-4 pt-2 px-2` → `pb-5 pt-3 px-3` y `space-y-1` → `space-y-2`.

### Resultado esperado
En iPad el drawer arranca justo bajo el header sin solaparlo, la altura es la correcta y las opciones del menú se ven mejor repartidas, con menos hueco vacío abajo.

### Ajuste posterior: distribución y descendentes (g, j, p, y)

- **Distribución:** Más espacio entre ítems para aprovechar la altura y reducir el hueco debajo: `space-y-2` → `space-y-3` en lista principal y en bloque «Cerrar sesión»; `py-5 pb-10` → `py-4 pb-6`; `pt-3` → `pt-4` en el bloque inferior.
- **Descendentes visibles:** Las letras con descendentes (g, j, p, y) se cortaban por `leading-none` y `truncate` en el texto móvil. En `ElementoSideBar` (estilo móvil): el `<span>` del nombre pasó de `leading-none font-medium ... truncate` a **`leading-relaxed font-medium ... break-words`** para que la línea tenga altura suficiente y no se corte el texto; el enlace tiene **`py-3.5`** y **`min-h-[2.75rem]`** para dar cabida a los descendentes.
- **Sin truncate:** Se eliminó `truncate` para no recortar; etiquetas largas pueden pasar a dos líneas con `break-words`.

---

## 2025-02-19 – Sidebar escritorio admin (PC/laptop): opciones más compactas

### Objetivo
En pantallas grandes, extra grandes y en laptops, las opciones del sidebar de escritorio (admin) tenían demasiado espacio entre sí; en monitores con poca altura eso hacía que hubiera que hacer mucho scroll o que el sidebar se viera demasiado “abierto”. Compactar el sidebar para que las opciones estén más juntas en todos los tamaños de escritorio.

### Cambios en `client/src/components/layouts/SidebarBase.jsx`

- **Espacio entre ítems (lista principal admin):** De `space-y-1.5 xl:space-y-3 2xl:space-y-5` a **`space-y-0.5 xl:space-y-1 2xl:space-y-1.5`**, para reducir el hueco entre opciones en todos los breakpoints (especialmente en xl y 2xl).
- **Espacio en bloque inferior (Cerrar sesión, admin):** De `space-y-1` con `xl:space-y-2` a **`space-y-0.5`** con **`xl:space-y-1`**.
- **Altura mínima por ítem (admin, desktop):** Reducida para que quepan más opciones sin scroll en pantallas bajas:
  - Sidebar abierto: de `min-h-[44px] xl:min-h-[54px] 2xl:min-h-[62px]` a **`min-h-[40px] xl:min-h-[42px] 2xl:min-h-[44px]`**.
  - Sidebar colapsado: de `min-h-[48px] xl:min-h-[58px] 2xl:min-h-[66px]` a **`min-h-[42px] xl:min-h-[44px] 2xl:min-h-[46px]`**.
- **Padding vertical del enlace (desktop, expandido):** De `py-2.5` a **`py-2`**.
- **Padding superior de la lista principal:** De `pt-4` a **`pt-3`** (solo en el `ul` de opciones principales).

### Resultado esperado
En PC/laptop (pantallas normales, grandes y extra grandes) el sidebar admin muestra las opciones más compactas, con menos espacio entre ellas; en monitores con poca altura se reduce el scroll y se evita que el menú se vea excesivamente abierto.

### Ajuste fino: equilibrio por tamaño de pantalla

- **Pantallas pequeñas y xl (base, lg, xl):** Ítems más juntos para laptops como Huawei 13.6" (p. ej. 1440px): **`space-y-1 lg:space-y-1.5 xl:space-y-1.5`**, **`min-h-[40px] lg:min-h-[42px] xl:min-h-[42px]`** (abierto) y **`min-h-[42px] lg:min-h-[44px] xl:min-h-[44px]`** (colapsado); bloque inferior **`xl:space-y-1`**. En xl no se aplica `py-3` (solo en 2xl).
- **Solo pantallas 2xl (1536px+):** Espaciado amplio para monitores como 15.6" 1920×1080: **`2xl:space-y-3`**, **`2xl:min-h-[50px]`** (abierto), **`2xl:min-h-[54px]`** (colapsado), **`2xl:py-3`**; bloque inferior **`2xl:space-y-2.5`**. En viewports muy altos (p. ej. 2160px en laptop pequeña), usar zoom del navegador (~125–150%) para que el sidebar use el estilo compacto (xl).

---

## 2025-02-19 – Layout admin: menú tipo móvil en tablet/iPad (botón flotante)

### Objetivo
En iPad (y tablets en general) el menú se mostraba como en PC (sidebar fijo a la izquierda), ocupando espacio y dejando algunas páginas poco cómodas. Se pidió que en vista iPad también se use el menú tipo móvil (botón flotante abajo + drawer) para que el contenido “encaje” mejor, sin optimizar aún todas las páginas para iPad.

### Cambios en `client/src/components/layouts/Layout.jsx`

- **Sidebar de escritorio:** El contenedor del sidebar pasa de `hidden sm:block` a **`hidden lg:block`**. El sidebar lateral solo se muestra a partir de **1024px (lg)**.
- **Overlay del menú drawer:** De `sm:hidden` a **`lg:hidden`**, de modo que el overlay (y por tanto el uso del drawer) se aplique en todo viewport &lt; 1024px.
- **Botón hamburguesa flotante:** De `sm:hidden` a **`lg:hidden`**, de modo que el botón se vea en móvil y tablet/iPad (todo &lt; 1024px).
- **Margen del contenido principal:** Se eliminó **`sm:ml-20`**; se mantienen solo **`lg:ml-20`** y **`lg:ml-64`** (según sidebar expandido o no). Por debajo de 1024px el contenido ya no tiene margen izquierdo para el sidebar.
- **Bloqueo de scroll (body):** La condición para fijar el scroll cuando el menú móvil está abierto pasa de `window.innerWidth < 768` a **`window.innerWidth < 1024`**, de modo que también se bloquee en tablet/iPad al abrir el drawer.

### Cambios en `client/src/components/layouts/SideBarAdmin.jsx`

- **SideBarsm (drawer móvil):** El overlay y el `<aside>` del drawer pasan de **`sm:hidden`** a **`lg:hidden`**, para que el drawer sea visible cuando el menú está abierto en viewports &lt; 1024px (incluido iPad).

### Resultado esperado
En viewports &lt; 1024px (móvil y tablet/iPad) se muestra el botón flotante de menú y, al pulsarlo, el drawer lateral; no hay sidebar fijo a la izquierda, por lo que el contenido usa todo el ancho y “encaja” mejor. A partir de 1024px se mantiene el comportamiento de escritorio con sidebar lateral.

---

## 2025-02-19 – BienvenidaAdmin: luces de fondo en la sección de tarjetas

### Objetivo
Suavizar la transición entre el hero (con video) y la zona de tarjetas, añadiendo luces o reflejos muy suaves y con movimiento sutil en el fondo para que no se vea tan plano y contrastar con el hero. Debe verse bien en móvil, tablet y cualquier dispositivo.

### Cambios en `client/src/components/admin/BienvenidaAdmin.jsx`

- **Contenedor de la sección de tarjetas:** Se añadió `relative` y `overflow-hidden` para contener la capa de luces.
- **Capa de luces/reflejos (fondo):** Nueva capa absoluta (`absolute inset-0`, `pointer-events-none`, `z-0`) con `aria-hidden="true"` que contiene cinco orbes difuminados:
  - Cuatro orbes con animación de flotación suave (`animate-lights-float`): posiciones superior izquierda, superior derecha, inferior izquierda e inferior derecha; colores indigo, purple, blue y violet con opacidad baja (`/20`, `/15`); tamaños responsive (`w-40` a `md:w-80`, etc.); duraciones 22s, 28s, 25s y 30s con delays distintos para desfasar el movimiento.
  - Un orbe central con animación de pulso suave (`animate-lights-pulse`), indigo muy suave, escala responsive.
- **Keyframes CSS (en el mismo componente):**
  - `lightsFloat`: desplazamiento y escala muy suaves (translate 1–1.5%, scale 0.99–1.02) y variación de opacidad (0.45–0.65) en ciclo largo.
  - `lightsPulse`: opacidad 0.35–0.55 y escala 1–1.05 en el centro, manteniendo `translate(-50%, -50%)` para no descentrar.
- **Contenido:** La rejilla de tarjetas y la cita diaria se envuelven en un `div` con `relative z-10` para quedar por encima de las luces.

### Resultado esperado
En la zona donde están las tarjetas (Fecha, Hora, Notificaciones) y la cita diaria se ve un fondo con luces/reflejos muy suaves en movimiento lento, sin interferir con la lectura ni con el uso en móvil o tablet.

---

## 2025-02-19 – Menús desplegables del header (HeaderAdmin): más compactos en móvil

### Objetivo
Los menús que se despliegan al hacer clic en el icono de notificaciones y en el icono de perfil del administrador (esquina superior derecha) en vista móvil debían verse más compactos, no tan anchos.

### Cambios en `client/src/components/layouts/HeaderAdmin.jsx`

- **Menú desplegable de perfil (dropdown):** En móvil (`max-sm`) el panel es más estrecho y alineado al borde derecho:
  - `max-sm:right-0 max-sm:left-auto` para que quede anclado a la derecha (junto al icono de perfil).
  - `max-sm:w-56 max-sm:min-w-0` para un ancho compacto (14rem / 224px) en lugar de centrado con ancho casi total (`calc(100vw-32px)`).
- **Menú desplegable de notificaciones:** Mismo criterio en móvil:
  - `max-sm:right-0 max-sm:left-auto` para alineado a la derecha (junto al icono de campana).
  - `max-sm:w-56 max-sm:min-w-0` para ancho compacto; se eliminó `max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-32px)]`.
- En pantallas `sm` y superiores se mantiene en ambos: menú absoluto, alineado a la derecha, ancho fijo (perfil `w-64`, notificaciones `w-80` con `sm:max-w-xs`), bordes redondeados y sombra.

### Resultado esperado
En móvil, tanto el menú de notificaciones como el de perfil se muestran más compactos (ancho 224px), alineados a la derecha bajo su icono, sin ocupar todo el ancho de la pantalla.

---

## 2025-02-19 – Perfil de alumno y Detalles de pagos: optimización móvil

### Objetivo
Las páginas accesibles desde **Lista de alumnos → Gestionar** (perfil de alumno y detalles de pagos) no estaban optimizadas para móviles: no aprovechaban el ancho total y en la página de perfil del estudiante había muchos contenedores anidados que restaban espacio. Ajustar ambas páginas para que en móvil usen el espacio disponible, con menos padding y sin contenedores que roben ancho.

### Cambios en `client/src/pages/Admin/StudentProfilePage.jsx`

- **Contenedor principal:** `min-h-screen` con padding vertical reducido en móvil: `pt-8 sm:pt-12` → `pt-4 xs:pt-6 sm:pt-8 md:pt-12`; `pb-4 sm:pb-8` → `pb-3 xs:pb-4 sm:pb-8`.
- **Wrapper del contenido:** Añadido `w-full`; padding horizontal `px-2 sm:px-4` → `px-2 xs:px-3 sm:px-4 lg:px-8` para usar mejor el ancho en móvil.
- **Header (nombre, folio, botones):** Padding de la card `p-4 sm:p-6` → `p-3 xs:p-4 sm:p-6`; margen inferior `mb-6 sm:mb-8` → `mb-4 xs:mb-6 sm:mb-8`. Botón "Volver a Lista" con `min-h-[44px]` y `touch-manipulation`.
- **Sección de tabs:** Área de contenido de cada pestaña con `min-h-[400px] p-3 sm:p-5` → `min-h-[300px] sm:min-h-[400px] p-2 xs:p-3 sm:p-5` para reducir padding en móvil.
- **Contenido de cada tab (General, Académico, Curso, Salud, Expectativas, Cuenta):** Todos los wrappers internos con `w-full` además de `max-w-*` para no añadir restricción extra; `space-y-6` → `space-y-4 sm:space-y-6`. Cards con cabecera `px-5 sm:px-8 py-4 sm:py-5` → `px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-5`; cuerpo de cards `p-5 sm:p-8` → `p-3 xs:p-4 sm:p-6 lg:p-8` y `p-6 space-y-6` → `p-3 xs:p-4 sm:p-6 space-y-4 sm:space-y-6`. Títulos de sección con iconos más compactos en móvil (`w-8 h-8 sm:w-9`…) y `min-w-0` en el texto para evitar desborde. Grids con `gap-6` → `gap-4 sm:gap-6` donde aplica.

### Cambios en `client/src/pages/Admin/StudentPaymentsPage.jsx`

- **Contenedor principal:** Añadido `w-full`; padding `pt-6 sm:pt-8` → `pt-4 xs:pt-6 sm:pt-8`; `pb-4 sm:pb-6` → `pb-3 xs:pb-4 sm:pb-6`; `px-3 sm:px-4 md:px-6` → `px-2 xs:px-3 sm:px-4 md:px-6`.
- **Wrapper interno:** `w-full` y `space-y-5 sm:space-y-6` → `space-y-4 sm:space-y-5 lg:space-y-6`.
- **Header:** Card con `p-4 sm:p-6` → `p-3 xs:p-4 sm:p-6`. Botones "Regresar" y "Ver Perfil" con `min-h-[44px]`, `touch-manipulation` y `shrink-0` en iconos.
- **Card "Próximo pago":** Padding `p-5 sm:p-6 md:p-8` → `p-3 xs:p-4 sm:p-6 md:p-8`.
- **Card Plan de pagos + tabla:** Padding `p-5 sm:p-6 md:p-8` → `p-3 xs:p-4 sm:p-6 md:p-8`; tabla con contenedor `overflow-x-auto` y márgenes negativos en móvil (`-mx-2 xs:-mx-3 sm:mx-0 px-2 xs:px-3 sm:px-0`) para scroll horizontal al borde; tabla con `min-w-[520px] sm:min-w-0`; encabezados con `text-xs sm:text-sm lg:text-base`, `whitespace-nowrap` y padding reducido en móvil.
- **Card "Próximos pagos" (lista):** Padding `p-5 sm:p-6 md:p-8` → `p-3 xs:p-4 sm:p-6 md:p-8`.

### Resultado esperado
En móvil, la página de perfil del estudiante y la de detalles de pagos usan todo el ancho útil, con menos padding y menos sensación de contenedores anidados; los botones tienen área táctil adecuada y la tabla de pagos hace scroll horizontal sin comprimir texto.

### Ajuste posterior: ancho total en móvil (márgenes laterales a cero)

- **StudentProfilePage:** Contenedor principal con `px-0 sm:px-4 lg:px-8` (en móvil sin padding lateral). Card del header y contenedor de tabs con `rounded-none sm:rounded-xl lg:rounded-2xl` y `border-0 sm:border-2` para que en móvil lleguen al borde de la pantalla y ocupen cada pixel de ancho. (Corrección: se eliminó la clase duplicada `sm:rounded-2xl` y se usa la progresión `rounded-none` → `sm:rounded-xl` → `lg:rounded-2xl`.)
- **StudentPaymentsPage:** Contenedor principal con `px-0 sm:px-4 md:px-6` (en móvil sin márgenes laterales). Todas las cards (header, alertas bloqueo/tolerancia, próximo pago, plan + tabla, próximos pagos) con `rounded-none sm:rounded-xl lg:rounded-2xl` y `border-0 sm:border-2` en las que tenían borde, para que en móvil el contenido use el ancho total de la pantalla.

---

## 2025-02-19 – Finanzas Ingresos: vista móvil (tabla y tarjetas)

### Objetivo
Optimizar la vista de **Ingresos** (Registro de ingresos) para móviles: (1) la tabla mostraba letras muy comprimidas o en apariencia vertical; (2) algunas tarjetas (Hoy, 7 días, Mes, Año) no estaban bien asentadas; (3) cabecera y botones del bloque "Registro de ingresos" quedaban apretados. Ajustar **solo para móvil** sin modificar la configuración ya existente para pantallas pequeñas (sm), grandes (lg) y extra grandes (xl / 1920px).

### Cambios en `client/src/components/admin/FinanzasIngresos.jsx`

#### Tarjetas rápidas (Hoy, Últimos 7 días, Mes, Año)
- **Grid:** `gap-3 sm:gap-4` → `gap-2 xs:gap-3 sm:gap-4` para mejor uso del ancho en móvil.
- **Cada tarjeta:** Añadido `min-w-0` para evitar desborde; `min-h-[100px] xs:min-h-[108px] sm:min-h-0` para que en móvil tengan altura mínima y se vean asentadas; `flex flex-col justify-between`; padding `p-4 sm:p-5` → `p-3 xs:p-4 sm:p-5`; bordes `rounded-3xl` → `rounded-2xl sm:rounded-3xl`.
- **Texto:** Etiqueta (Hoy, Mes, etc.) `text-xs` → `text-[11px] xs:text-xs`; monto principal `text-2xl` → `text-lg xs:text-xl sm:text-2xl` y `truncate` + `title` para tooltip; línea Ticket/Ventas `text-[11px]` → `text-[10px] xs:text-[11px]` y en móvil "Ventas" en segunda línea (`block xs:inline`) para evitar compresión; separador " · " solo visible desde `xs` (`hidden xs:inline`).

#### Cabecera "Registro de ingresos"
- **Contenedor:** De `flex items-center justify-between` a `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` para que en móvil título/total y botones se apilen.
- **Título y total:** Envoltorio `flex flex-wrap items-baseline gap-2`; total móvil junto al título en la misma zona.
- **Botones:** Añadido `min-h-[44px]` y `touch-manipulation` para área táctil adecuada; `gap-2 sm:gap-3` y `flex-wrap` para que envuelvan en móvil; padding vertical `py-1.5` → `py-2` en móvil.

#### Tabla de ingresos
- **Ancho mínimo (solo móvil):** `min-w-[900px]` → `min-w-[1020px] sm:min-w-[900px]` para que en viewports &lt; sm la tabla tenga más ancho total y las columnas no se compriman tanto al hacer scroll horizontal; desde sm se mantiene 900px; `min-[1920px]:min-w-[1260px]` sin cambios.
- **Tipografía:** Tabla `text-sm` → `text-xs sm:text-sm`; todos los `th` y `td` con `text-xs sm:text-sm` para legibilidad en móvil sin reducir tamaño en sm+.
- **Encabezados:** Añadido `whitespace-nowrap` a todos los `th` para evitar que los textos (Desc., Asistencia, etc.) se muestren comprimidos o en vertical; padding horizontal `px-4 py-3` → `px-2 xs:px-3 sm:px-4 py-2.5 sm:py-3` en móvil.
- **Celdas:** Mismo padding responsive; en celdas de Fecha, Hora, Pago e Importe añadido `whitespace-nowrap` donde aplica; Asistencia con `text-[11px] sm:text-xs` y `whitespace-nowrap`; botón Ver descripción (ojo) con `min-h-[44px] min-w-[44px]` y `touch-manipulation` para táctil.

### Comportamiento conservado
- **sm y superiores:** Tabla con `min-w-[900px]`, mismos anchos de columna (%), misma apariencia de tarjetas y cabecera.
- **min-[1920px]:** `table-auto`, `min-w-[1260px]`, sin cambios.

### Resultado esperado
En móvil: tarjetas de resumen con altura mínima y texto legible (Ticket y Ventas en dos líneas si hace falta); cabecera del registro apilada con botones que envuelven y área táctil ≥44px; tabla con scroll horizontal y columnas menos comprimidas (min-width 1020px) y encabezados/celdas sin texto en apariencia vertical gracias a `whitespace-nowrap` y tamaño de fuente `text-xs` en móvil.

---

## 2025-02-19 – Modal «Editar ingreso»: optimización móvil

### Objetivo
La modal «Editar ingreso» en Finanzas Ingresos no estaba optimizada para móvil: el botón «Actualizar» quedaba cortado (solo se veía «Actua») al tener los tres botones del pie (Eliminar, Cancelar, Actualizar) en una sola fila. Ajustar solo para vista móvil sin cambiar el comportamiento en sm y superiores.

### Cambios en `client/src/components/admin/FinanzasIngresos.jsx` (modal Editar ingreso)

- **Overlay:** Padding `p-4` → `p-3 xs:p-4` para ganar espacio en pantallas muy estrechas.
- **Contenedor de la modal:** `max-w-xl` → `max-w-[min(36rem,92vw)] sm:max-w-xl` para que en móvil no toque los bordes de la pantalla.
- **Encabezado:** Padding `px-6 py-5` → `px-4 xs:px-5 sm:px-6 py-4 sm:py-5`; título `text-xl` → `text-lg sm:text-xl`; botón cerrar con `min-h-[44px] min-w-[44px]`, `touch-manipulation` y contenido centrado.
- **Cuerpo del formulario:** Padding `p-6` → `p-4 xs:p-5 sm:p-6`.
- **Pie (botones):** De una sola fila con `justify-between` a **apilado en móvil**: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`; padding `px-6 py-4` → `px-4 xs:px-5 sm:px-6 py-3 sm:py-4`. En móvil: botón «Eliminar» a ancho completo (`w-full sm:w-auto`), debajo una fila con «Cancelar» y «Actualizar» repartiendo espacio (`flex gap-2 w-full sm:w-auto` con `flex-1 sm:flex-initial` en cada uno). Todos los botones con `min-h-[44px]`, `touch-manipulation` y `shrink-0` para que no se corten el texto.

### Resultado esperado
En móvil la modal deja margen lateral (92vw máx.), el pie muestra primero «Eliminar» y en la fila siguiente «Cancelar» y «Actualizar» completos y visibles; en sm y superiores se mantiene la disposición en una sola fila (Eliminar a la izquierda, Cancelar y Actualizar a la derecha).

---

## 2025-02-19 – Gastos fijos, variables, presupuesto y pagos asesores: vista móvil

### Objetivo
Aplicar las mismas optimizaciones móviles ya usadas en Finanzas Ingresos a **Gastos fijos**, **Gastos variables**, **Presupuesto** y **Pagos asesores**: tarjetas de resumen bien asentadas, cabecera del registro con botones que no se corten (apilados o envueltos), tabla con encabezados legibles (sin texto comprimido en vertical) y scroll horizontal. Sin modificar el comportamiento en sm, lg, xl ni min-[1920px].

### Cambios por archivo

#### `client/src/components/admin/FinanzasEgresosFijos.jsx`
- **Tarjetas (Hoy, 7 días, Mes, Año):** gap `gap-2 xs:gap-3` en móvil; cada card con `min-w-0`, `min-h-[100px] xs:min-h-[108px] sm:min-h-0`, `flex flex-col justify-between`, `p-3 xs:p-4 sm:p-5`, `rounded-2xl sm:rounded-3xl`; montos con `text-lg xs:text-xl sm:text-2xl` y `truncate` + `title`.
- **Cabecera "Registro de gastos fijos":** contenedor `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`; título y "Total pagado" en un bloque `flex flex-wrap items-baseline gap-2`; botones con `min-h-[44px]`, `touch-manipulation`, `flex-wrap` y `gap-2`; en móvil texto del botón principal "Nuevo egreso fijo" → "Nuevo" (`sm:hidden` / `hidden sm:inline`).
- **Tabla:** `min-w-[1020px] sm:min-w-[900px]` en móvil; tabla y thead con `text-xs sm:text-sm`; todos los `th` con `whitespace-nowrap`, `px-2 xs:px-3 sm:px-4`, `py-2.5 sm:py-3` y `text-xs sm:text-sm`.

#### `client/src/components/admin/FinanzasEgresosVariables.jsx`
- **Tarjetas:** mismo patrón (gap, min-h, padding, rounded, truncate).
- **Cabecera:** apilado en móvil (`flex-col gap-3 sm:flex-row`), botones con área táctil y en móvil "Nuevo gasto variable" → "Nuevo".
- **Tabla:** `min-w-[1020px] sm:min-w-[900px]`; thead con `whitespace-nowrap`, padding y tamaño de texto responsive; encabezado "Valor unitario" → "Valor unit." y "Método de pago" → "Método" en móvil para reducir compresión.

#### `client/src/components/admin/FinanzasPagosAsesores.jsx`
- **Tarjetas (5 cards):** mismo patrón de tarjetas; grid ya 2 columnas en base.
- **Cabecera "Registro de pagos a asesores":** apilado en móvil; botones con `min-h-[44px]`, `touch-manipulation`; "Nuevo pago" → "Nuevo" en móvil.
- **Tabla:** contenedor con `-mx-2 xs:-mx-3 sm:mx-0 px-2 xs:px-3 sm:px-0` para scroll al borde en móvil; tabla `min-w-[1020px] sm:min-w-0 min-[1920px]:min-w-[1100px]` para scroll horizontal en móvil y comportamiento actual en sm+; thead con `sticky top-0 z-10`, `whitespace-nowrap`, `text-xs sm:text-sm` y encabezados acortados donde aplica (Tipo de servicio → Tipo servicio, Honorarios/Comisión → Honor./Com., Fecha de pago → Fecha pago, Método de pago → Método).

#### `client/src/components/admin/FinanzasEgresosPresupuesto.jsx`
- **Tarjetas (Mes, Presupuesto, Gastado, Disponible, Excedente):** mismo patrón (gap, min-h, padding, rounded, truncate).
- **Tabla "Histórico de presupuestos":** contenedor con márgenes/padding para scroll en móvil; tabla `min-w-[640px] sm:min-w-0 min-[1920px]:min-w-[760px]`; thead con `whitespace-nowrap`, `text-xs sm:text-sm` y padding responsive.

### Resultado esperado
En móvil, en las cuatro vistas (gastos fijos, gastos variables, presupuesto, pagos asesores) las tarjetas de resumen se ven estables y legibles; la cabecera del registro apila título y botones o permite que los botones envuelvan sin cortar "Nuevo egreso fijo" / "Nuevo gasto variable" / "Nuevo pago"; las tablas hacen scroll horizontal con encabezados sin compresión vertical. Comportamiento en sm y pantallas grandes se conserva.

---

## 2025-02-19 – Finanzas: cards principales y tablas responsivas (móvil/tablet)

### Objetivo
En la sección Finanzas: (1) en la pantalla principal las tarjetas de Ingresos y Egresos se veían muy alargadas en móvil, no ocupaban bien el espacio lateral y el contenido parecía desordenado; (2) en Ingresos, Egresos, Gastos fijos y Gastos variables las tablas se mostraban como cards en móvil y el usuario quería ver siempre **tablas** (responsivas, con scroll horizontal). Ajustar sin romper el comportamiento en pantallas grandes.

### Cambios en `client/src/components/admin/Finanzas.jsx` (pantalla principal)
- **Contenedor del grid:** Padding lateral `px-4 sm:px-6` → `px-2 xs:px-3 sm:px-6`; gap `gap-4` → `gap-3 xs:gap-4 sm:gap-6` para mejor uso del ancho en móvil.
- **Tarjetas Ingresos y Egresos:** En móvil dejar de usar alturas mínimas grandes que alargaban las cards; usar **`aspect-[4/3]`** en móvil y **`sm:aspect-auto`** con `sm:min-h-[220px]` en adelante, de modo que en móvil las tarjetas se vean más cuadradas/organizadas. Padding de las cards: `p-3 xs:p-4 sm:p-6` (igual en ambas).
- **Header de cada tarjeta:** Más compacto en móvil: icono y título con `gap-2 xs:gap-3`, iconos `w-9 h-9 xs:w-11 xs:h-11`, títulos `text-base xs:text-lg sm:text-2xl`, subtítulo con `truncate`; bloque de totales a la derecha se mantiene `hidden sm:block`.
- **Contenido y estadísticas:** Descripción corta en móvil (`text-[10px] xs:text-[11px]`); grids de estadísticas con menos gap en móvil (`gap-1.5 xs:gap-2`, `p-1.5 xs:p-2`); `mb-0` en el bloque de stats en móvil para no sumar espacio innecesario.
- **Footer:** Texto "Sistema activo" → "Activo" en móvil; iconos y espaciado más compactos (`text-xs xs:text-sm`, `mt-auto pt-1 sm:pt-0`).
- **Egresos:** Corregido el párrafo móvil que tenía `hidden sm:hidden` (nunca se veía) → `block sm:hidden` con texto "Gastos y presupuesto".

### Cambios en tablas (siempre tabla, scroll horizontal en móvil)
- **FinanzasIngresos.jsx:** Eliminada la "Vista móvil (cards)" (`sm:hidden`). La tabla se muestra en todos los viewports; contenedor con `overflow-x-auto`, `-mx-2 xs:-mx-3 sm:mx-0 px-2 xs:px-3 sm:px-0` para que el scroll use el borde de la pantalla en móvil; tabla con `min-w-[900px]` para forzar scroll horizontal cuando no quepa.
- **FinanzasEgresos.jsx:** Eliminada la "Vista móvil con cards"; tabla siempre visible con `overflow-x-auto` y mismo patrón de márgenes/padding; tabla `min-w-[720px]`.
- **FinanzasEgresosFijos.jsx:** Eliminado el bloque "Móvil - cards" completo; contenedor de la tabla de `hidden sm:block` a `w-full` con `overflow-x-auto` y márgenes responsive; tabla `min-w-[900px]`.
- **FinanzasEgresosVariables.jsx:** Eliminado el bloque "Móvil - cards"; tabla siempre visible con `overflow-x-auto` y `min-w-[900px]`.

### Modales
- Los modales de Finanzas (Egresos selector, Nuevo gasto variable/fijo, etc.) ya usan `max-h-[90vh]`, `p-4` y `max-w-lg`; se mantienen sin cambios para móvil/tablet.

### Resultado esperado
En móvil/tablet: la pantalla principal de Finanzas muestra dos tarjetas más proporcionadas (4:3) que usan el ancho lateral; en Ingresos, Egresos, Gastos fijos y Gastos variables se ve siempre la tabla y se desliza horizontalmente para ver todas las columnas. Comportamiento en pantallas grandes (lg, xl, 2xl, min-[1920px]) se conserva.

---

## 2025-02-19 – Comentarios de guía para responsividad móvil (Dashboard Admin)

### Objetivo
Añadir comentarios en el código del dashboard administrativo (inicio-admin.jsx) que sirvan de guía para futuros ajustes de responsividad en móviles, sin cambiar comportamiento ni lógica.

### Cambios en `client/src/components/admin/inicio-admin.jsx`
- **Bloque al inicio (tras imports):** Comentario que resume breakpoints, recomendación de 2 columnas o scroll horizontal para las tarjetas en móvil, área táctil mínima (~44px), textos y FAB/safe-area. Incluye referencia a `.cursor/skills/reglas-responsividad/SKILL.md` y `docs/reglas_responsivide.md`.
- **MetricCard:** Comentario indicando que ya usa touch-manipulation y min-h por breakpoint, y que si el grid pasa a scroll horizontal conviene añadir `min-w-[140px]` o `min-w-[160px]` a cada card.
- **Grid de tarjetas (grid-cols-6):** Comentario explicando que en móvil 6 columnas deja las tarjetas muy estrechas; opciones (1) `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` o (2) contenedor con `overflow-x-auto` + `flex` + `min-w` en cada card para scroll horizontal tipo carrusel.
- **Indicador “Toca las tarjetas para más detalles”:** Comentario recordando asegurar en móvil que el mensaje no quede cortado por teclado o barra del navegador.

### Resultado esperado
Quien retoque después la vista móvil del dashboard tiene en el propio archivo una guía clara de qué cambiar (grid vs scroll horizontal, anchos mínimos, referencias a reglas de responsividad).

---

## 2025-02-19 – Dashboard Admin: 2 tarjetas por fila en móvil

### Objetivo
En móviles no hay espacio horizontal para mostrar las 6 tarjetas de métricas en una sola fila; deben verse **solo 2 tarjetas por columna (por fila)** en vista móvil.

### Cambio en `client/src/components/admin/inicio-admin.jsx`
- **Grid de tarjetas:** `grid-cols-6` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`.
  - **Móvil (base, &lt; 640px):** 2 columnas (2 tarjetas por fila).
  - **sm (≥ 640px):** 3 columnas.
  - **lg (≥ 1024px):** 6 columnas (una fila como antes).

### Resultado esperado
En móvil se muestran 2 tarjetas por fila; en tablet 3; en desktop las 6 en una fila.

---

## 2025-02-19 – Bienvenida Admin: 2 tarjetas por fila en móvil

### Objetivo
Aplicar el mismo criterio que en el dashboard de métricas: en móvil solo 2 tarjetas por fila (Fecha, Hora, Notificaciones) por falta de espacio horizontal.

### Cambio en `client/src/components/admin/BienvenidaAdmin.jsx`
- **Grid de tarjetas (Fecha, Hora, Notificaciones):** `grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3` → `grid-cols-2 md:grid-cols-3`.
  - **Móvil (base, &lt; 768px):** 2 columnas (2 tarjetas por fila).
  - **md (≥ 768px):** 3 columnas (las 3 en una fila).

### Resultado esperado
En móvil se ven 2 tarjetas por fila; en desktop las 3 en una fila.

---

## 2025-02-19 – Bienvenida Admin: saludo más abajo y más grande

### Objetivo
El bloque de texto del saludo (¡Buenas tardes, Admin Jessica, etc.) quedaba muy arriba; el saludo debía verse más grande y todo el bloque más abajo.

### Cambios en `client/src/components/admin/BienvenidaAdmin.jsx` (GreetingHeader)
- **Contenedor del hero:** Padding unificado `py-*` sustituido por `pt-*` y `pb-*` con más espacio arriba: `pt-20 pb-10`, `xs:pt-24 xs:pb-12`, `sm:pt-28 sm:pb-16`, `md:pt-32 md:pb-20`, `lg:pt-36 lg:pb-24`, `xl:pt-40 xl:pb-28`, `2xl:pt-44 2xl:pb-32`. El contenido del saludo queda más abajo.
- **Título del saludo (h1 “¡Buenas tardes”):** Clamp de tamaño aumentado en todos los breakpoints y añadido `xl`: `text-[clamp(2rem,8vw,4rem)]`, `xs:clamp(2.5rem,7.5vw,4.5rem)`, `sm:clamp(3.5rem,6.5vw,5.5rem)`, `md:clamp(4rem,6vw,6rem)`, `lg:clamp(4.5rem,5vw,7rem)`, `xl:clamp(5rem,5vw,8rem)`.

### Resultado esperado
El saludo se ve más grande y el bloque de texto (saludo, nombre, bienvenida, mensaje del día) queda más abajo en la sección hero.

---

## 2025-02-19 – Generar contrato (Validación Pagos): solo tabla, sin tarjetas en móvil

### Objetivo
En el componente de generar contrato (ValidacionPagos_Admin_comp) la lista de pagos y contratos debía verse como **tabla** en todos los viewports (como en Finanzas y Solicitudes), no como tarjetas en móvil.

### Cambios en `client/src/components/admin/ValidacionPagos_Admin_comp.jsx`
- **Vista única:** Se eliminó la “Vista móvil - Cards” (lg:hidden). La tabla se muestra en todos los tamaños de pantalla.
- **Contenedor de la tabla:** De `hidden lg:block overflow-hidden` a `overflow-x-auto w-full` para que la tabla sea visible siempre y en móvil tenga scroll horizontal.
- **Tabla:** Se añadió `min-w-[900px]` y `min-[1920px]:table-auto` para que en pantallas estrechas la tabla no se comprima y se desplace horizontalmente; en ≥1920px se mantiene table-auto.

### Resultado esperado
En generar contrato, pagos y contratos se ven siempre en formato tabla (cabeceras, filas, columnas); en móvil la tabla hace scroll horizontal si no cabe.

---

## 2025-02-19 – Reportes de Pagos: uso del espacio y tabla en móviles

### Objetivo
En Reportes de Pagos la vista se veía mal en móviles y no aprovechaba el ancho; unificar con el criterio de Finanzas/Generar contrato: menos padding lateral, grids de 2 columnas en móvil y tabla con scroll horizontal.

### Cambios en `client/src/components/admin/ReportesPagos_Admin_comp.jsx`
- **Contenedor principal:** `px-6` → `px-2 xs:px-3 sm:px-6`; añadido `w-full`. Contenedor interno con `w-full`.
- **Header y filtros:** Padding reducido en móvil: `p-5 sm:p-6` → `p-3 xs:p-4 sm:p-6`.
- **Métricas (4 tarjetas):** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` → `grid-cols-2 lg:grid-cols-4` con `gap-3 xs:gap-4 sm:gap-6` para 2 columnas en móvil.
- **Gráficas principales (3):** `grid-cols-1 xl:grid-cols-3` → `grid-cols-2 xl:grid-cols-3` y gap reducido en móvil.
- **Gráficas temporales (2):** `grid-cols-1 lg:grid-cols-2` → `grid-cols-2` y gap responsive.
- **Tabla Pagos Detallados:** Card con `p-3 xs:p-4` y `w-full`; contenedor `overflow-x-auto w-full`; tabla `w-full min-w-[900px] table-fixed min-[1920px]:table-auto` con anchos % en thead hasta 1920px (Folio 7%, Alumno 12%, Curso 10%, Grupo 8%, Estado 8%, Importe 8%, Método 8%, Motivo Rechazo 12%, Creado 12%, Actualizado 15%).

### Resultado esperado
En móvil se usa todo el ancho disponible, las métricas y gráficas van en 2 columnas y la tabla de pagos detallados hace scroll horizontal como en Finanzas.

---

## 2025-02-19 – Reportes de Pagos: gráficas completas y bien escaladas en móvil

### Objetivo
En Reportes de Pagos, en móvil algunas gráficas no se veían completas (donut cortado) o con escala rara (ejes 0 / 0.25 / 250). Ajustar contenedores y Recharts para que todas las gráficas se rendericen bien y ocupen el espacio disponible.

### Cambios en `client/src/components/admin/ReportesPagos_Admin_comp.jsx`
- **Contenedores de gráficas:** Sustituido `flex-1 min-h-[240px]` (o `min-h-[260px]`) por **altura fija** para que `ResponsiveContainer` de Recharts tenga dimensión definida: `h-[220px] xs:h-[240px]` en las 3 gráficas principales; `h-[240px] sm:h-[260px]` en Ingresos por Semana e Ingresos por Año.
- **Tarjetas de gráficas:** Añadido `min-w-0 overflow-visible` en las cards para evitar recorte en grid y que el contenido no se corte.
- **BarChart / LineChart:** Añadido `margin={{ top: 8, right: 8, left: 0, bottom: 0 }}` para no pegar al borde; en todos los **YAxis** añadido `domain={[0, 'auto']}` para evitar escalas raras cuando hay pocos datos o vacíos; `tick={{ fontSize: 10 }}` (o 11 donde aplica) para etiquetas más legibles en móvil.
- **PieChart (Distribución por Método):** Añadido `margin={{ top: 8, right: 8, bottom: 8, left: 8 }}` al `PieChart`; el **Pie** pasa de radios fijos en px a **porcentajes** para que escale con el contenedor y no se corte: `innerRadius="40%" outerRadius="65%"`, y `cx="50%" cy="50%"` para centrado; contenedor con `flex items-center justify-center` para centrar el donut.
- **Pagos por Curso:** Reducido `height={60}` del XAxis a `50` y leyenda `fontSize: 11` para ganar espacio en alto.
- **LineChart (Ingresos por Semana):** Ajuste menor en `labelFormatter` del Tooltip para evitar accesos indefinidos.

### Resultado esperado
En móvil todas las gráficas (barras, líneas, donut) se ven completas, con escala correcta en los ejes y sin recortes; el donut de “Distribución por Método” se adapta al contenedor y se ve entero.

---

## 2025-02-19 – Calendario Admin: uso del espacio y celdas sin estirar

### Objetivo
En Calendario Admin todo se veía muy estirado y no se ocupaba todo el espacio disponible. Ajustar contenedores, celdas del mes y sidebar para usar el ancho disponible y dar proporciones equilibradas (evitar celdas altas y estrechas).

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`
- **Contenedor principal:** Añadido `w-full`; padding lateral `px-4 sm:px-6 lg:px-8` → `px-2 xs:px-3 sm:px-6 lg:px-8`; padding vertical reducido en móvil (`pt-4 xs:pt-6 sm:pt-8 md:pt-10`). Contenedor interno con `w-full`.
- **Header "Mi Agenda":** Padding de la card `p-5 sm:p-6` → `p-3 xs:p-4 sm:p-6`, `mb-6` → `mb-4 sm:mb-6`.
- **Barra de navegación del mes (flechas + Hoy):** Card con `p-3 xs:p-4 sm:p-6` y `mb-4 sm:mb-6`; título del mes `text-xl sm:text-2xl` → `text-lg sm:text-xl md:text-2xl`; espaciado entre flechas y botón más compacto en móvil (`space-x-2 sm:space-x-4`).
- **Grid principal (calendario + sidebar):** `gap-6` → `gap-4 sm:gap-6`; columna del calendario con `w-full min-w-0`; card del calendario con `w-full`.
- **Cabecera de días de la semana:** Padding reducido en móvil `px-1 sm:px-2 md:px-4`, `py-2 sm:py-3`; texto `text-[10px] xs:text-xs sm:text-sm`.
- **Celdas del mes:** Sustituido `min-h-28 sm:min-h-32` por **`aspect-square min-h-0`** con `flex flex-col overflow-hidden` para que cada celda tenga proporción 1:1 y no se estire en vertical; padding `p-1 sm:p-1.5 md:p-2`; grid de días con `auto-rows-fr`. Número del día con `shrink-0` y tamaño `text-[10px] xs:text-xs sm:text-sm`; lista de recordatorios con `flex-1 min-h-0 overflow-hidden` y `space-y-0.5 sm:space-y-1`; texto "+N más" con `text-[9px] xs:text-[10px]`.
- **Sidebar (Próximos, Tipos, Resumen):** De `space-y-6` a **grid** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-1` con `gap-4 sm:gap-6`, para que en tablet (sm) las tres tarjetas se muestren en 2 columnas; en lg una columna junto al calendario. Cards del sidebar con `p-3 xs:p-4 sm:p-6` y títulos con `mb-3 sm:mb-4`.

### Resultado esperado
El calendario usa todo el ancho disponible; las celdas del mes son cuadradas (no estiradas); en tablet el sidebar muestra las tarjetas en 2 columnas; en móvil el contenido es más compacto y legible.

---

## 2025-02-19 – Calendario Admin: indicador simple en móvil (puntos o número)

### Objetivo
En móvil el diseño de los recordatorios dentro de cada día (tarjetas con hora y título) no se veía bien. Sustituir en vista móvil por un indicador simple: puntos de colores (por prioridad) o un número que indique cuántos avisos/recordatorios hay ese día.

### Cambios en `client/src/components/admin/Calendario_Admin_comp.jsx`
- **Vista móvil (por debajo de `sm`):** En cada celda del mes, en lugar de la lista de recordatorios con hora y título se muestra:
  - **1 a 4 recordatorios:** una fila de puntos pequeños (1,5px) con el color de prioridad (rojo/amarillo/verde); si está completado el punto va con opacidad 50%.
  - **5 o más:** un badge pequeño con el número (ej. «5» o «9+» si hay más de 9), estilo `bg-slate-300 text-slate-800 rounded-full`, tamaño de fuente 9–10px.
- Al tocar el indicador (puntos o número) se abre el modal de edición del **primer** recordatorio del día. Se usa `touch-manipulation` en el botón para mejor respuesta táctil.
- **Vista sm y mayor:** se mantiene la lista de recordatorios con hora y título (hasta 3 + «+N más») como antes (`hidden sm:flex`).

### Resultado esperado
En móvil cada día muestra solo puntos o un número, de forma clara y sin saturar la celda; al tocar se abre el primer recordatorio. En tablet y desktop se sigue viendo la lista con hora y título.

---

## 2025-02-19 – Gastos variables: tabla a ancho completo en monitores chicos (p. ej. Huawei 13.6" 2160×1440)

### Objetivo
En monitores chicos como la Huawei 13.6" (2160×1440), la tabla de Registro de gastos variables no usaba todo el ancho disponible y se veía espacio vacío a los lados. Cada píxel cuenta en ese tamaño.

### Cambios en FinanzasEgresosVariables.jsx
- **Section:** padding lateral reducido en lg/xl: `lg:px-10` → `lg:px-6 xl:px-8`.
- **Tabla:** Por debajo de 1920px la tabla usa siempre `table-fixed` y `w-full` con `min-w-0`; desde `min-[1920px]` se usa `table-auto` y `min-w-[1260px]`.
- **Columnas (thead th):** En viewports &lt; 1920px anchos en porcentaje (# 5%, Unidades 8%, Producto/Servicio 18%, Desc. 7%, Entidad 14%, Valor unitario 12%, Método 12%, Importe 12%, Estatus 12%); desde 1920px `min-[1920px]:w-auto`.

### Resultado esperado
En viewports tipo 1280–1919px (p. ej. Huawei 13.6" 2160×1440) la tabla llena todo el ancho; en pantallas ≥ 1920px se mantiene table-auto.

---

## 2025-02-19 – Todas las tablas de Finanzas: mismo criterio (ancho completo hasta 1920px)

### Objetivo
Aplicar el mismo comportamiento de tabla a ancho completo en monitores chicos (hasta 1920px) en **todas** las vistas de la sección Finanzas: Gastos variables (ya aplicado), Gastos fijos, Ingresos, Pagos de asesores, Presupuesto de egresos y vista principal Egresos.

### Archivos y cambios

- **FinanzasEgresosFijos.jsx:** Section `lg:px-10 xl:px-12` → `lg:px-6 xl:px-8`. Tabla `w-full min-w-0 min-[1920px]:min-w-[1260px] table-fixed min-[1920px]:table-auto`; columnas con anchos % hasta 1920px (# 4%, Fecha 10%, Hora 6%, Categoría 12%, Descripción 8%, Proveedor 14%, Frecuencia 10%, Método 12%, Importe 10%, Estatus 14%).
- **FinanzasIngresos.jsx:** Section `lg:px-10` → `lg:px-6 xl:px-8`. Tabla mismo patrón; columnas # 3%, Alumno 11%, Curso 13%, Fecha 7%, Hora 5%, Asesor 9%, Pago 7%, Importe 7%, Estatus 7%, Desc. 5%, Asistencia 8%, Acciones 11%.
- **FinanzasPagosAsesores.jsx:** Section `px-4 sm:px-6 lg:px-10` → `px-2 xs:px-3 sm:px-6 lg:px-6 xl:px-8`, `w-full`. Card y panel filtros con padding reducido en chicas (`p-3 xs:p-4 sm:p-6`, `px-3 xs:px-4 sm:px-6`). Tabla `w-full min-w-0 min-[1920px]:min-w-[1100px] table-fixed min-[1920px]:table-auto`; columnas con % (ID_Pago 6%, Asesor 12%, Tipo servicio 14%, Monto base 8%, Horas 8%, Honorarios 12%, Ingreso final 10%, Fecha pago 10%, Método 8%, Nota 6%, Status 6%).
- **FinanzasEgresosPresupuesto.jsx:** Section mismo patrón de padding; card `w-full` y header con padding reducido. Tabla "Histórico de presupuestos": `w-full min-w-0 min-[1920px]:min-w-[760px] table-fixed min-[1920px]:table-auto` con columnas % (Mes, Monto, Gastado, Disponible, Excedente, Acciones). Tabla del modal Cargar presupuestos: `w-full min-w-0 min-[1920px]:min-w-[640px] table-fixed min-[1920px]:table-auto` con columnas % (Mes 22%, Presupuesto 19%, Gastado 19%, Disponible 19%, Excedente 21%).
- **FinanzasEgresos.jsx** (vista principal Egresos): Section `lg:px-10` → `lg:px-6 xl:px-8`, `w-full` y `2xl:max-w-none`. Card `w-full`, header `p-3 xs:p-4 sm:p-6`. Tabla `w-full min-w-0 min-[1920px]:min-w-[1260px] table-fixed min-[1920px]:table-auto`; columnas # 5%, Concepto 22%, Fecha 12%, Método 12%, Importe 12%, Estatus 12%, Descripción 25%.

### Resultado esperado
En cualquier vista de Finanzas (Gastos variables, Gastos fijos, Ingresos, Pagos asesores, Presupuesto, Egresos), en viewports &lt; 1920px (p. ej. Huawei 13.6" 2160×1440) las tablas ocupan el 100% del ancho disponible sin huecos laterales; desde 1920px se usa table-auto y min-width según tabla.

---

## 2025-02-19 – Asesores (Solicitudes / Administrar): tabla a ancho completo hasta 1920px

### Objetivo
Aplicar el mismo criterio de tablas a ancho completo en monitores chicos en la sección Administrar Asesores (Solicitudes de asesores).

### Archivos modificados

- **AdministrarAsesores.jsx:** Contenedor wrapper: `px-4 lg:px-8` → `px-2 xs:px-3 sm:px-6 lg:px-6 xl:px-8`; añadido `w-full`.
- **SolicitudesAsesores.jsx:** Card de la tabla: añadido `w-full`. Header del card: `px-6` → `px-3 xs:px-4 sm:px-6`. Contenedor de la tabla: `overflow-x-auto w-full`. Tabla: `w-full min-w-[1100px]` → `w-full min-w-0 min-[1920px]:min-w-[1100px] table-fixed min-[1920px]:table-auto`. Columnas (thead): anchos en % hasta 1920px (ID 6%, Nombre 14%, Correo 16%, Área 10%, Grupos 18%, Status 10%, Fecha 12%, Estado 14%); desde 1920px `min-[1920px]:w-auto`.

### Resultado esperado
En viewports &lt; 1920px la tabla de solicitudes de asesores ocupa el 100% del ancho disponible; desde 1920px se mantiene table-auto.

---

## 2025-02-19 – Modal Egresos: breakpoint 1920px “el doble” para 15.6"

### Objetivo
En 15.6" a 1920×1080 el modal de Egresos debía verse **el doble de grande** que la versión anterior en ese breakpoint: más ancho, más padding, iconos y textos claramente mayores.

### Cambios en `client/src/components/admin/Finanzas.jsx` (solo `min-[1920px]:`)
- **Modal:** `min-[1920px]:max-w-3xl` (antes max-w-xl); header `min-[1920px]:px-12 min-[1920px]:py-6`; título `min-[1920px]:text-4xl`; subtítulo `min-[1920px]:text-base`; botón cerrar `min-[1920px]:p-2`; icono X `min-[1920px]:w-10 min-[1920px]:h-10`.
- **Área de contenido:** `min-[1920px]:p-10`, `min-[1920px]:gap-6`.
- **Cada tarjeta (F, V, P, A):** `min-[1920px]:p-8`, `min-[1920px]:gap-6`; icono letra y flecha `min-[1920px]:h-14 min-[1920px]:w-14`, `min-[1920px]:text-2xl`; título `min-[1920px]:text-2xl`; descripción `min-[1920px]:text-base`.

### Resultado esperado
- ≥ 1920px (pantallas grandes): modal **más ancha y más larga de forma proporcional**: `max-w-7xl`, `min-h-[50vh]`, `max-h-[90vh]`; header `px-14 py-6`; contenido `p-10 py-8 gap-6`; tarjetas `p-7 py-6`.
- ≥ 2560px (pantallas más grandes / 2K): aún más ancha y alta: `max-w-[88rem]`, `min-h-[55vh]`; header `px-20 py-8`; título `text-5xl`, subtítulo `text-lg`, icono cerrar `w-12 h-12`; contenido `p-14 py-10 gap-8`; tarjetas `p-9 py-7`. Overlay `p-8`. Todo escalado de forma proporcional.

---

## 2025-02-19 – Modal Egresos: tamaño para L, XL y 2XL sin afectar pantallas chicas

### Objetivo
El modal de selector de Egresos (Gastos fijos, Gastos variables, Presupuesto, Pagos asesores) debía ajustarse para L, XL y 2XL para que no se viera flotando en tanto espacio, y las tarjetas internas debían escalar en tamaño. En pantallas chicas el modal ya se veía bien; no modificar ese comportamiento.

### Archivos modificados

#### `client/src/components/admin/Finanzas.jsx`

**Contenedor del modal**
- **Ancho:** En pantallas &lt; lg se mantiene `max-w-md`. En L/XL/2XL el modal es más ancho: `lg:max-w-xl`, `xl:max-w-2xl`, `2xl:max-w-3xl` (antes era lg:max-w-lg, xl:max-w-xl, 2xl:max-w-2xl).
- **Header:** Padding vertical en 2xl `2xl:py-7`; botón cerrar `2xl:p-2.5`; icono X `2xl:w-9 2xl:h-9`. Título y subtítulo solo escalan a partir de lg (sin cambiar móvil/sm).

**Tarjetas del modal (Gastos fijos, Gastos variables, Presupuesto, Pagos asesores)**
- **Padding de cada tarjeta:** En chicas `p-4`; `lg:p-5`, `xl:p-6`, `2xl:p-8`.
- **Círculo de letra (F, V, P, A):** En chicas `h-8 w-8`; `lg:h-10 lg:w-10`, `xl:h-11 xl:w-11`, `2xl:h-14 2xl:w-14`; texto dentro `lg:text-base`, `xl:text-lg`, `2xl:text-xl`.
- **Título de la tarjeta:** `lg:text-base`, `xl:text-lg`, `2xl:text-xl`; descripción `lg:text-sm`, `xl:text-base`, `2xl:text-base`; `mt-0.5` en descripción.
- **Flecha “→”:** Mismas dimensiones que el círculo de letra en cada breakpoint; `shrink-0` en icono y flecha para evitar que se compriman.
- **Gap entre icono y texto:** `lg:gap-4`, `xl:gap-5`, `2xl:gap-6`. Contenedor del texto `min-w-0` para que el texto pueda reducirse en pantallas estrechas.

### Resultado esperado
- En pantallas chicas (móvil, sm) el modal y las tarjetas se mantienen como antes.
- En lg (≥1024px), xl (≥1280px) y 2xl (≥1536px) el modal es más ancho y las cuatro opciones (Gastos fijos, variables, Presupuesto, Pagos asesores) tienen más padding, iconos y texto más grandes, sin verse flotando en tanto espacio.

---

## 2025-02-19 – Panel Admin: más espacio en pantallas grandes (2xl), menos vacío y tarjetas/tablas más amplias

### Objetivo
En el panel de administración, en pantallas grandes y extra grandes el contenido quedaba limitado por un ancho máximo (1700px) y las tarjetas/tablas se veían estrechas con mucho espacio vacío a los lados. Aplicar el mismo criterio que en el dashboard del asesor: en 2xl permitir ancho completo (2xl:max-w-none) y dar más espacio a tarjetas, grids y tablas.

### Archivos modificados

#### `client/src/components/admin/Finanzas.jsx`
- **Header y contenedor:** `2xl:max-w-[1700px]` → `2xl:max-w-none`; padding `2xl:px-4`.
- **Grid de tarjetas (Ingresos / Egresos):** contenedor `2xl:max-w-none 2xl:px-4`; grid `2xl:gap-16`; tarjetas con `2xl:p-10` y `2xl:min-h-[320px]` para que no se vean “muy esidas” y tengan más aire.
- **Modal selector Egresos:** `2xl:max-w-lg min-[1800px]:max-w-xl` para que en pantallas grandes el modal sea un poco más ancho.

#### `client/src/components/admin/inicio-admin.jsx`
- Contenedores: `2xl:max-w-none`; `2xl:px-4` donde aplica; grid de métricas `2xl:gap-8`.

#### Resto de componentes admin
- **FinanzasIngresos, FinanzasEgresosFijos, FinanzasEgresosVariables, FinanzasEgresosPresupuesto, FinanzasPagosAsesores:** `2xl:max-w-none` en el contenedor principal; secciones con `2xl:px-4`.
- **ListaAlumnos_Admin_comp, ValidacionPagos_Admin_comp, AdministrarAsesores, Email_Admin_comp, Configuracion_Admin_comp, Calendario_Admin_comp, ReportesPagos_Admin_comp:** contenedor principal `2xl:max-w-none` (en lugar de `2xl:max-w-[1700px]`). AdministrarAsesores además `2xl:px-4`.

### Resultado esperado
- En pantallas 2xl (≥1536px) el contenido del panel admin usa todo el ancho disponible (con padding lateral 2xl:px-4 del Layout). Las tarjetas de Finanzas e inicio-admin tienen más separación y altura; las tablas y listas disponen de más espacio horizontal y se reduce la sensación de “espacio vacío” y tarjetas/tablas estrechas.

---

## 2025-02-19 – Modal "Generando contrato" en pantallas grandes y extra grandes (solo 2xl y 1920px)

### Problema
En el componente de validación de pagos / generar contrato, el modal que muestra el progreso de generación ("Generando contrato", "Preparando PDF", barra de progreso y contador) era demasiado pequeño en pantallas grandes (p. ej. 15.6" a 1920×1080). Una primera versión escalaba el modal también en sm/md/lg/xl, lo que hacía que en laptops de 13–14" (p. ej. Huawei D15 2160×1440, viewport típico ~1280–1440px) el modal se viera demasiado grande; el usuario solo pedía ampliarlo en pantallas grandes como 15.6" 1920×1080.

### Objetivo
Ampliar el modal **solo** en viewports realmente grandes: **2xl (≥1536px)** y **min-[1920px]** (típico de 15.6" a 1920×1080). En viewports menores (móvil, tablet, laptops 13–14" como 1280–1440px) el modal debe mantenerse con el tamaño original (max-w-xs, p-5, textos e iconos sin escalar).

### Criterio por viewport lógico
- **&lt; 1536px** (incl. 1280px, 1440px — D15 y similares): modal pequeño, igual que antes (max-w-xs, 320px).
- **≥ 1536px (2xl):** modal un poco más grande (max-w-lg, más padding y textos/iconos algo mayores).
- **≥ 1920px:** modal aún más grande (max-w-xl, más padding y elementos escalados), correspondiente a 15.6" 1080p en pantalla completa.

### Cambios realizados

#### Archivo: `client/src/components/admin/ValidacionPagos_Admin_comp.jsx`

**Portal del modal de generación (genModal):** Se eliminaron todas las clases en sm/md/lg/xl. Solo se usan **2xl:** y **min-[1920px]:**.

1. **Contenedor del overlay**
   - Sin `p-4` global para no alterar el centrado en pantallas chicas. El modal tiene `mx-4` para no pegarse a los bordes en móvil.

2. **Contenedor principal del modal**
   - **Ancho:** `max-w-xs` (base) + `2xl:max-w-lg` + `min-[1920px]:max-w-xl` (sin sm/md/lg/xl).
   - **Padding:** `p-5` (base) + `2xl:p-7` + `min-[1920px]:p-8`.
   - **Bordes:** `rounded-xl` (base) + `2xl:rounded-2xl` + `min-[1920px]:rounded-3xl`.

3. **Icono giratorio (esquina superior derecha)**  
   Solo escalado en 2xl y min-[1920px]: `2xl:-top-4 2xl:-right-4 2xl:w-10 2xl:h-10`, `min-[1920px]:w-12 min-[1920px]:h-12`; SVG `2xl:w-5 2xl:h-5`, `min-[1920px]:w-6 min-[1920px]:h-6`.

4. **Bloque título + subtítulo**  
   Márgenes, icono izquierdo, título, badge PRELIMINAR y subtítulo: todas las ampliaciones solo con `2xl:` y `min-[1920px]:` (sin lg/xl).

5. **Barra de progreso y textos**  
   `space-y-4` + `2xl:space-y-5` + `min-[1920px]:space-y-6`; barra `h-2` + `2xl:h-2.5` + `min-[1920px]:h-3`; barra interna `h-full`; "Procesando..." y párrafo inferior solo con `2xl:` y `min-[1920px]:`.

### Actualización: crecimiento parejo en lg, xl, 2xl y 1920px
El usuario indicó que en pantallas **lg, xl y 2xl** el modal seguía viéndose pequeño y que debía crecer **de forma pareja** (no solo más ancho, sino también más alto), para no quedar como una “tira” ancha y baja.

**Cambios añadidos:** Se reintrodujeron los breakpoints **lg** y **xl** y se escaló el modal de forma **proporcional en ancho y alto** en lg → xl → 2xl → min-[1920px]:
- **Ancho:** max-w-xs (base) + lg:max-w-sm, xl:max-w-md, 2xl:max-w-lg, min-[1920px]:max-w-xl.
- **Padding (ancho y alto):** p-5 + lg:p-6, xl:p-7, 2xl:p-8, min-[1920px]:p-9.
- **Espaciado interno (space-y), altura de barra de progreso, tamaño de iconos y textos** aumentan de forma progresiva en cada breakpoint, de modo que el modal gane altura además de ancho y se mantenga proporcionado (no solo “largo”).
- Bordes: rounded-xl + lg:rounded-2xl + 2xl:rounded-3xl.

### Resultado esperado
- Por debajo de lg (viewport &lt; 1024px) el modal se mantiene pequeño (320px de ancho).
- En lg, xl, 2xl y ≥1920px el modal es más grande y crece de forma pareja (más ancho y más alto: más padding, más espacio entre bloques, iconos y barra más grandes).

---

## 2025-02-19 – Persistencia de imágenes al guardar borrador (columna metadata_json)

### Problema
Al editar un quiz o simulador, cargar una imagen en una pregunta u opción y pulsar **"Guardar como borrador"**, la imagen no se veía en la vista previa de la tabla ni al volver a editar: la URL no se estaba persistiendo en base de datos.

### Causa
El backend guarda la URL de la imagen en la columna **`metadata_json`** de las tablas `quizzes_preguntas`, `quizzes_preguntas_opciones`, `simulaciones_preguntas` y `simulaciones_preguntas_opciones`. Si esa columna no existe en la base de datos (tablas antiguas), el `UPDATE metadata_json` falla y el controlador ignora el error ("tabla antigua"), por lo que la imagen nunca se guarda.

### Solución: migración de base de datos
Hay que asegurar que las cuatro tablas tengan la columna `metadata_json` (TEXT NULL).

#### Archivos añadidos
- **`server/migrations/add_metadata_json_preguntas_opciones.sql`:** Script SQL con los `ALTER TABLE ... ADD COLUMN metadata_json TEXT NULL` para las cuatro tablas. Incluye comentarios; si una tabla ya tiene la columna, MySQL devolverá "Duplicate column name" y se puede ignorar ese ALTER.
- **`server/migrations/run_add_metadata_json.js`:** Script Node que comprueba si cada tabla tiene ya la columna (vía `information_schema`) y solo entonces ejecuta el `ALTER`. Seguro ejecutarlo varias veces.

#### Cómo aplicar la migración
**Opción recomendada:** desde la raíz del proyecto:
```bash
node server/migrations/run_add_metadata_json.js
```
**Opción manual:** ejecutar el contenido de `add_metadata_json_preguntas_opciones.sql` en tu cliente MySQL (phpMyAdmin, DBeaver, línea de comandos, etc.).

### Resultado esperado
Después de aplicar la migración, al guardar como borrador un quiz o simulador con imágenes en preguntas u opciones, la URL se persiste en `metadata_json`, la vista previa en las tablas muestra las imágenes y al reabrir el quiz/simulador para editar las imágenes siguen ahí.

---

## 2025-02-19 – Título "Object" en UI y ruido de consola (API/WebSocket)

### Objetivo
1. **Título: Object:** En algunas pantallas (cursos, notificaciones, curso actual) aparecía la palabra "Object" cuando el backend enviaba un título como objeto (ej. `title: { es: "..." }`) en lugar de string. Corregir para que siempre se muestre un texto legible.
2. **Errores de consola:** Al tener el frontend en marcha sin el backend (puerto 1002), la consola se llenaba de "Failed to load resource", "WebSocket connection failed" y "[WS] onerror". Reducir el ruido para que solo se registre un mensaje informativo en desarrollo.

### Cambios realizados

#### Utilidad para títulos
- **Nuevo** `client/src/utils/text.js`: Función `toDisplayTitle(val)`. Convierte cualquier valor a string para mostrar en UI: si es string lo devuelve; si es objeto, intenta `val.title`, `val.titulo`, `val.nombre`, `val.name`, `val.es`, `val.text`, `val.message`; en otro caso `String(val)`. Evita "[object Object]" o "Object" cuando el API envía objetos.

#### Uso de `toDisplayTitle` en la UI
- **MisCursos_Alumno_Comp.jsx:** En `CourseCard`, el título e instructor del curso se obtienen con `toDisplayTitle(course?.title ?? course?.titulo)` y `toDisplayTitle(course?.instructor ?? course?.instructor_name)` para que nunca se renderice un objeto.
- **Header_Alumno_comp.jsx:** En el listado de notificaciones, se muestra `toDisplayTitle(notification.title)` y `toDisplayTitle(notification.message)`.
- **InicioAlumnoDashboard.jsx:** El nombre del curso actual y del instructor se muestran con `toDisplayTitle(currentCourse?.title)` y `toDisplayTitle(currentCourse?.instructor)`.
- **CourseDetailDashboard.jsx:** Título del curso e instructor con `toDisplayTitle(currentCourse?.title)` y `toDisplayTitle(currentCourse?.instructor)`.
- **Asistencia_Alumno_comp.jsx:** Título del curso actual con `toDisplayTitle(currentCourse?.title)`.

#### Ruido de consola (WebSocket)
- **StudentContext.jsx:** En el manejador `ws.onerror` del WebSocket de notificaciones, se dejó de usar `console.warn` en cada error. Ahora solo se hace un `console.debug` en el primer intento (attempt === 1) y en desarrollo, con un mensaje que indica que puede ser por tener el backend apagado (puerto 1002) y que se puede ignorar.

### Sobre los errores de red del navegador
- Los mensajes **"Failed to load resource: net::ERR_CONNECTION_REFUSED"** y **"WebSocket connection to 'ws://localhost:1002/ws/notifications' failed"** los genera el propio navegador al intentar conectar con el backend. No se pueden suprimir desde código. Para evitarlos hay que:
  1. Tener el servidor backend corriendo en el puerto configurado (por defecto 1002), o
  2. Definir `VITE_API_URL` (y si aplica `VITE_WS_NOTIFICATIONS_URL`) en `.env` apuntando a un backend disponible.

### Resultado esperado
- Los títulos de cursos, notificaciones y curso actual se muestran siempre como texto legible, aunque el API envíe objetos.
- En desarrollo, si el backend no está en marcha, la consola solo muestra un mensaje debug en el primer fallo del WebSocket; los avisos nativos del navegador (Failed to load resource, WebSocket failed) seguirán apareciendo hasta que el backend esté activo o se configure la URL correcta.

---

## 2025-02-19 – Imágenes en vistas previas de tablas (Quiz y Simuladores)

### Objetivo
En las vistas previas que se abren desde las tablas de quizzes y de simuladores (modales "Vista previa" con N preguntas), las fórmulas matemáticas se renderizaban bien pero **no se mostraban las imágenes** de las preguntas ni de las opciones. Corregir para que en esos modales también se vean las imágenes, usando la misma resolución de URL que en la vista del alumno.

### Cambios realizados

#### `client/src/components/Asesor/Quiz.jsx`
- **Import:** Se añadió `import { buildStaticUrl } from "../../utils/url.js";`.
- **Modal de vista previa (previewOpen / previewQuiz):** En el listado de preguntas del modal:
  - **Imagen de la pregunta:** Si la pregunta tiene `p.imagen` o `p.image`, se muestra un bloque con `<img src={buildStaticUrl(p.imagen || p.image) || (p.imagen || p.image)} alt="Imagen de la pregunta" />` dentro de un contenedor con borde, `max-w-md`, `max-h-48` y `object-contain`, colocado después del enunciado y antes de las opciones.
  - **Imagen de cada opción:** En cada ítem de opción múltiple, si la opción tiene `o.imagen` o `o.image`, se muestra una `<img>` con `src={buildStaticUrl(o.imagen || o.image) || (o.imagen || o.image)}`, con clases `w-12 h-12 rounded object-cover flex-shrink-0`, junto al texto de la opción.

#### `client/src/components/Asesor/SimuladoresGen.jsx`
- **Import:** Se añadió `import { buildStaticUrl } from "../../utils/url.js";`.
- **Modal de vista previa (previewOpen / previewSim):** Se aplicó el mismo patrón que en Quiz.jsx: imagen de pregunta (después del enunciado, con `max-w-md` y `max-h-48`) e imagen de opción (en cada opción, `w-12 h-12 rounded object-cover`) usando `buildStaticUrl` para el `src` de las imágenes.

### Resultado esperado
- Al abrir "Vista previa" desde la tabla de quizzes o desde la tabla de simuladores, las preguntas y opciones que tengan imagen asociada las muestran correctamente, con las rutas `/uploads/preguntas/...` resueltas mediante `buildStaticUrl` igual que en Quizz_Review y Simulacion_Review.

---

## 2025-02-19 – Imágenes en preguntas/opciones de quizzes y simulaciones (subir, guardar, mostrar al alumno)

### Objetivo
En la creación de quizzes y simulaciones ya existía la opción de añadir fotos a preguntas y opciones, pero las imágenes no se subían al servidor, no se guardaban como URL y no se mostraban correctamente en la vista previa del builder ni al alumno al resolver el quiz/simulación. Habilitar el flujo completo: subida → guardado de URL → vista previa en builder → visualización para el alumno.

### Cambios realizados

#### Backend
- **Nuevo middleware** `server/middlewares/preguntaImageMulter.js`: Multer para subir una imagen por petición a la carpeta `uploads/preguntas/`. Acepta PNG, JPG, JPEG, WEBP, GIF; límite 5MB.
- **Nuevo controlador** `server/controllers/uploads.controller.js`: `uploadPreguntaImagen` recibe `req.file`, devuelve `{ url: '/uploads/preguntas/nombrearchivo' }`.
- **Nueva ruta** `server/routes/uploads.routes.js`: `POST /api/uploads/pregunta-imagen` con auth, campo `image` (multipart). Respuesta: `{ url: '/uploads/preguntas/...' }`.
- **app.js**: Se monta `uploadsRoutes` y se sirven archivos estáticos con `express.static('uploads/preguntas')` en `/uploads/preguntas`.

#### Frontend – API
- **Nuevo** `client/src/api/uploads.js`: Función `uploadPreguntaImagen(file)` que envía el archivo a `POST /uploads/pregunta-imagen` y devuelve la URL (string).

#### Frontend – Builder (quiz/simulador)
- **QuiztBuilder.jsx**: Import de `uploadPreguntaImagen` y `buildStaticUrl`. Nueva función `resolveQuestionImages(questions)`: para cada pregunta/opción con `image.file` sube la imagen, obtiene la URL y deja `image = { url, preview }`; si ya hay URL (no blob) la reutiliza. En `handleSave` y `handleSaveSim` se llama a `resolveQuestionImages(questions)` antes de armar el payload y se envía `image: q.image.url` (string) en cada pregunta/opción.
- **QuiztNew.jsx**: Misma lógica: `resolveQuestionImages`, y en guardar borrador y en publicar se suben las imágenes antes y se envía solo la URL en `preguntas[].image` y `preguntas[].options[].image`.

#### Frontend – Vista alumno
- **Quizz_Review.jsx** y **Simulacion_Review.jsx**: Import de `buildStaticUrl`. En las etiquetas `<img>` de pregunta y opción, `src` pasa a ser `buildStaticUrl(p.imagen || p.image) || (p.imagen || p.image)` para que las rutas relativas `/uploads/preguntas/...` se resuelvan contra el origen del API y las imágenes se carguen correctamente.

### Flujo resultante
1. El asesor en el builder añade una imagen a una pregunta u opción → se muestra la vista previa (blob URL local).
2. Al guardar (quiz o simulador), por cada imagen nueva (`image.file`) se llama a `uploadPreguntaImagen`, se recibe la URL y se incluye en el payload como string.
3. El backend (quizzes y simulaciones) ya guardaba `imagen` en `metadata_json`; ahora recibe una URL válida en lugar de un blob.
4. Al cargar un quiz/simulación existente, el builder muestra la imagen con la URL guardada.
5. El alumno en Quizz_Review / Simulacion_Review recibe `pregunta.imagen` y `opcion.imagen` desde el API y las muestra con `buildStaticUrl(...)` para que las rutas `/uploads/...` apunten al servidor correcto.

### Resultado esperado
- Las fotos añadidas en preguntas/opciones se suben al servidor, se guardan como URL y se ven en la vista previa del builder y en la pantalla del alumno al resolver el quiz o la simulación.

---

## 2025-02-19 – KaTeX sin CDN: evitar bloqueo por Tracking Prevention

### Objetivo
En el builder de simuladores (y donde se renderizan fórmulas con KaTeX) el navegador mostraba «Tracking Prevention blocked access to storage for https://cdn.jsdelivr.net/npm/katex@0.16.x/...». Eso ocurre cuando KaTeX se carga desde un CDN y el navegador (p. ej. Firefox/Safari) bloquea acceso a almacenamiento de terceros.

### Solución
Dejar de cargar KaTeX desde cdn.jsdelivr.net y usar el paquete npm `katex` ya instalado, de modo que CSS y JS se sirvan desde el mismo origen (bundled por Vite).

### Archivos modificados
- **`client/src/components/Asesor/simGen/InlineMath.jsx`:** Se eliminó la carga dinámica desde el CDN (script + link). Ahora se usa `import katex from 'katex'` e `import 'katex/dist/katex.min.css'`. Los componentes internos `KaInlineMath` y `BlockMath` usan la instancia importada para `katex.render()`.
- **`client/src/components/Asesor/simGen/RichTextEditor.jsx`:** Se eliminó la inyección del `<link>` a katex.min.css en cdn.jsdelivr.net. Se añadió `import 'katex/dist/katex.min.css'` y el efecto que detectaba/cargaba KaTeX ahora solo hace `setIsKatexReady(true)` (KaTeX ya está en el bundle).

### Resultado esperado
Las fórmulas se renderizan con KaTeX sin peticiones al CDN; no aparece el aviso de Tracking Prevention y los estilos se aplican correctamente.

---

## 2025-02-19 – Fórmulas LaTeX en quizzes/simulaciones generados con IA

### Objetivo
Al crear quizzes o simulaciones con IA (desde SimulatorModal/SimuladoresGen o generación de preguntas con Gemini), las fórmulas matemáticas (por ejemplo «v(t) = 3t^2 - 4t + 2») aparecían como texto plano y no se renderizaban con el diseño especial (KaTeX/MathText). El sistema solo reconoce y dibuja fórmulas cuando están en LaTeX entre `$...$` o `$$...$$`.

### Causa
El prompt enviado a la IA ya pedía usar LaTeX, pero no era lo bastante explícito ni incluía ejemplos del tipo «NUNCA texto plano, SIEMPRE $...$», por lo que a veces la IA devolvía fórmulas sin delimitadores.

### Archivos modificados

#### `client/src/service/simuladoresAI.js`
1. **Prompt reforzado (instrucciones de fórmulas):**
   - Añadida una «REGLA OBLIGATORIA» que indica: NUNCA escribir fórmulas como texto plano; SIEMPRE encerrar cualquier expresión matemática entre `$ ... $` (inline) o `$$ ... $$` (bloque).
   - Ejemplos explícitos correctos: «La velocidad se modela por la función $v(t) = 3t^2 - 4t + 2$ (en m/s).», «Calcule la distancia desde $t=0$ hasta $t=3$ segundos.»
   - Ejemplo MAL vs BIEN: no escribir «La función v(t) = 3t^2 - 4t + 2 modela…», sino «La función $v(t) = 3t^2 - 4t + 2$ modela…»
   - Recordatorio de que en «text» y en «options[].text» del JSON todas las fórmulas deben ir entre `$...$` para que el sistema las renderice.

2. **Post-procesado (red de seguridad):**
   - Nueva función `wrapPlainFormulasInLatex(str)`: si el texto no contiene ya `$`, detecta patrones de fórmulas en texto plano y los envuelve en `$...$».
   - Patrones tratados: (1) función de una variable = expresión (ej. `v(t) = 3t^2 - 4t + 2`) cuando la expresión parece matemática (contiene ^, ², ³, \\frac, \\sqrt, \\int o operadores con números); (2) variable = número (ej. `t=0`, `t=3`) en contexto de intervalo.
   - Se aplica en `normalizarPreguntas` al texto de cada pregunta (`text`) y al texto de cada opción (`options[].text`) antes de devolver las preguntas normalizadas.

### Resultado esperado
- La IA recibe instrucciones claras para devolver siempre fórmulas en LaTeX con `$...$`.
- Si aun así llega texto plano con fórmulas típicas (como `v(t) = 3t^2 - 4t + 2` o `t=0`), el post-procesado las envuelve en `$...$` para que MathText/InlineMath (Quiz.jsx, SimuladoresGen.jsx) las rendericen correctamente con KaTeX.

### Actualización (misma fecha): Fórmulas de cualquier tipo (cálculo, álgebra, física, química)
- **Detección de áreas con fórmulas ampliada:** además de matemática/física/química/álgebra/geometría, ahora se consideran: `cálculo`, `trigonometr`, `estequiometr`, `razonamiento matemático/lógico`, y temas que contengan "ecuacion" o "fórmula", para que el prompt completo de LaTeX se aplique a más materias.
- **Prompt:** la regla de fórmulas en LaTeX se amplió con ejemplos de álgebra ($x^2+5x+6=0$), cálculo (integral, derivada) y química; y en "Requisitos estrictos" se añadió una instrucción universal: si en "text" u "options[].text" hay CUALQUIER fórmula o ecuación (de cualquier materia), debe ir entre `$...$`.
- **Post-procesado `wrapPlainFormulasInLatex`:** ahora detecta y envuelve en `$...$`: (1) variable = número (t=0, x=2); (2) ecuaciones tipo polinomio/álgebra (x^2+5x+6=0); (3) función de variable = expresión (v(t)=3t^2-4t+2); (4) fórmulas cortas tipo física/química (F=ma, v=d/t, E=mc^2, PV=nRT), sin volver a envolver texto ya envuelto.

---

## 2025-02-19 – Modales de Solicitudes más grandes en pantallas grandes y extra grandes

### Objetivo
Los modales del Centro de Solicitudes (Vista Simple, “Ver todas” / Centro de Solicitudes, y “Razón del rechazo”) se veían demasiado pequeños en pantallas grandes y extra grandes. Aplicar el mismo criterio de responsividad 2xl que en los modales de Extender fecha: más ancho, más padding y texto/controles más grandes.

### Archivos modificados

#### `client/src/components/common/SolicitudesModal.jsx`
- **RequestsManager (Centro de Solicitudes – “Ver todas”):** Overlay `2xl:p-6`; contenedor `2xl:max-w-5xl min-[1800px]:max-w-6xl`, `2xl:max-h-[85vh]`; header `2xl:px-8 2xl:py-5`, icono y título más grandes (`2xl:text-xl`), botones Vista Simple y cerrar con 2xl; pestañas Pendientes/Aprobadas/Rechazadas con `2xl:px-8 2xl:py-4` y botones `2xl:text-sm`; body `2xl:p-8`, grid `2xl:gap-6`; RequestCard con `2xl:p-6`, avatares y textos más grandes, botones Rechazar/Aprobar `2xl:py-3 2xl:text-sm`.
- **Vista Simple (modal principal):** Overlay `2xl:p-6`; contenedor `2xl:max-w-lg min-[1800px]:max-w-xl`; header y sección de pestañas con más padding y tamaños 2xl; lista con `2xl:max-h-[520px]`, filas y botones Aprobar/Rechazar más grandes en 2xl.
- **Modal “Razón del rechazo”:** Overlay `2xl:p-6`; contenedor `2xl:max-w-2xl min-[1800px]:max-w-3xl`; header `2xl:px-8 2xl:py-5`, título `2xl:text-xl`; body `2xl:p-8`, textarea `2xl:p-4 2xl:text-base`; footer y botones con 2xl.

### Resultado esperado
- En pantallas 2xl y ≥1800px los modales de solicitudes tienen más ancho y el contenido (títulos, pestañas, tarjetas, botones, textarea) escala de forma proporcionada.

---

## 2025-02-19 – Modales “Extender fecha límite” en Actividades (Entregas) más grandes en 2xl

### Objetivo
En Actividades (entregas), los modales “Extender fecha límite por grupo” y “Extender fecha límite por estudiante” se veían demasiado pequeños en pantallas grandes y extra grandes. Ajustar ancho (aprox. el doble en 2xl), padding y tamaño de texto/botones para que escalen de forma notable.

### Archivos modificados

#### `client/src/components/Asesor/EntregasActividad.jsx`
- **Modal “Extender fecha límite por grupo”:** Overlay `2xl:p-6`; contenedor `max-w-md 2xl:max-w-2xl min-[1800px]:max-w-3xl` (672px en 2xl, 768px en ≥1800px); header `2xl:px-8 2xl:py-5`, título `2xl:text-lg`, botón cerrar `2xl:p-2`, icono X `2xl:w-6 2xl:h-6`; body `2xl:p-6 2xl:space-y-4`; labels `2xl:text-base 2xl:mb-2`; inputs/textarea `2xl:px-4 2xl:py-3 2xl:text-base`; footer `2xl:px-8 2xl:py-5`; botones `2xl:px-5 2xl:py-2.5 2xl:text-base`.
- **Modal “Extender fecha límite por estudiante”:** Mismo criterio (ancho 2xl/3xl, header/body/footer y controles más grandes en 2xl).

### Resultado esperado
- En pantallas 2xl y ≥1800px los modales tienen aproximadamente el doble de presencia: más anchos (2xl / 3xl) y contenido (título, labels, campos, botones) más grande y legible.

---

## 2025-02-19 – Modales “Generar con IA”: solo más anchos en pantallas grandes/extra grandes

### Objetivo
- Mantener el diseño inicial del modal en pantallas chicas (igual que en simuladores); solo ampliar el ancho en pantallas grandes (2xl) y extra grandes (≥1800px).

### Archivos modificados

#### `client/src/components/Asesor/simGen/GeneradorIAModal.jsx`
- **Contenedor del modal (dialog):** En base y hasta 2xl: `max-w-2xl` (672px), como el diseño inicial. Solo a partir de 2xl se amplía: `2xl:max-w-4xl` (896px), `min-[1800px]:max-w-5xl` (1024px). Sin contenedor interno extra: el body sigue siendo un único div con scroll.

#### `client/src/components/Asesor/simGen/QuizIAModal.jsx`
- **Contenedor del modal (dialog):** Mismo criterio: `max-w-2xl 2xl:max-w-4xl min-[1800px]:max-w-5xl`; body sin wrapper adicional.

### Resultado esperado
- En pantallas chicas y medianas (incl. 13–14"): el modal se ve igual que antes (max-w-2xl).
- En pantallas grandes (≥1536px) y extra grandes (≥1800px): el modal usa más ancho (4xl / 5xl).

---

## 2025-02-19 – Modales de pasos (crear/editar simulador y quiz) más grandes en 2xl

### Objetivo
En pantallas grandes y extra grandes los modales de los pasos al crear o editar simuladores y quizzes (“Editar simulador”, “Información del simulador”, “Crear instrucciones”, “Información del quizt”) se veían demasiado pequeños. Ajustar para que en viewport 2xl (≥1536px) los modales usen más ancho y altura y los elementos (títulos, botones, campos) escalen mejor.

### Archivos modificados

#### `client/src/components/Asesor/SimulatorModal.jsx`
- **Overlay:** Se añadió `2xl:p-6` al padding del overlay (además de `p-4`).
- **Contenedor del modal:** `max-w-2xl` → `max-w-2xl 2xl:max-w-4xl`; se añadió `2xl:max-h-[90vh]` (además de `max-h-[85vh]`).
- **Header:** Más padding y gap en 2xl (`2xl:px-6 2xl:py-4`, `2xl:gap-4`); título `2xl:text-lg`; subtítulo “Paso X de 2” `2xl:text-sm`; botón cerrar `2xl:p-2.5`; icono cerrar SVG `2xl:h-6 2xl:w-6`.
- **Body:** `2xl:px-6 2xl:py-5`.
- **Footer:** Más padding en 2xl; botones (Cancelar, Atrás, Siguiente, Guardar y editar preguntas, Guardar cambios / Crear simulador) con `2xl:px-5 2xl:py-2.5` (o `2xl:px-6 2xl:py-2.5` donde aplica), `2xl:text-base` e iconos `2xl:h-5 2xl:w-5`.

#### `client/src/components/Asesor/QuiztModal.jsx`
- **Overlay:** Se añadió `2xl:p-6` al padding del overlay.
- **Ancho del contenido:** Variable `contentMaxW`: en paso 2 se añadió `2xl:max-w-4xl`; en paso 1 se añadió `2xl:max-w-2xl`.
- **Contenedor del modal:** Se añadió `2xl:max-h-[90vh]`.
- **Header:** Más padding y gap en 2xl (`2xl:px-6 2xl:py-4`, `2xl:gap-4`); título `2xl:text-lg`; “Paso X de 2” `2xl:text-sm`; botón cerrar `2xl:p-2.5`; icono cerrar `2xl:h-6 2xl:w-6`.
- **Body y footer:** Ya tenían `2xl:px-6 2xl:py-5` y botones con `2xl:px-5 2xl:py-2.5 2xl:text-base`.

### Resultado esperado
- En pantallas 2xl los modales de pasos (simulador y quiz) ocupan más espacio, con campos y botones más grandes y legibles, sin verse “chicos” en monitores grandes.

---

## 2025-02-19 – Carga de datos al editar simulador y quiz (fecha, grupos, intentos)

### Objetivo
Al abrir el modal de edición de un simulador o de un quiz, los datos ya guardados (fecha límite, grupos asignados, intentos permitidos, etc.) no se mostraban en el formulario. Corregir para que al editar se obtengan y se rellenen correctamente estos campos.

### Archivos modificados

#### `client/src/components/Asesor/SimuladoresGen.jsx`
- **handleEdit:** Al construir `editData` para el modal en modo edición:
  - Se usa `fechaLimite` con fallback: si `simData.fechaLimite` existe se formatea con `String(simData.fechaLimite).slice(0, 10)` (formato YYYY-MM-DD); si no, se deja vacío.
  - **Intentos:** Se derivan `intentosMode` y `maxIntentos`: si `simData.maxIntentos` es null/undefined o 0 se usa `intentosMode: 'unlimited'` y `maxIntentos: 1`; si no, `intentosMode: 'limited'` y `maxIntentos` desde los datos.
  - **Grupos:** `grupos` se toma de `simData.grupos`; si es string (p. ej. separado por comas) se hace `split(',')` y map trim para obtener un array; si ya es array se usa tal cual.
- **initialForm (modal en edición):** Se pasa al `SimulatorModal` un objeto que incluye `nombre`, `fechaLimite`, `duracionHrs`, `duracionMin`, `intentosMode`, `maxIntentos` y `grupos` (array), de modo que el `useEffect` interno del modal rellene el estado del formulario con estos valores.

#### `client/src/components/Asesor/Quiz.jsx`
- **handleEdit:** Al preparar los datos para editar ya no se usa `grupos: []` fijo. Se obtiene `quizData` desde `fullData?.data?.quiz || fullData?.data || fullData`; si `quizData.grupos` existe, se parsea: si es string (JSON) se hace `JSON.parse`; si ya es array se usa; resultado en `gruposArray`, que se asigna a `editData.grupos`.
- **handleUpdate:** El payload enviado a `updateQuiz` incluye `grupos` cuando el formulario tiene grupos definidos y es array: `...(form.grupos !== undefined && Array.isArray(form.grupos) ? { grupos: form.grupos } : {})`.

### Comportamiento del modal (SimulatorModal)
- El modal recibe `initialForm` con los campos anteriores; en un `useEffect` que depende de `open` e `initialForm` (vía `initialFormKey` serializado), se actualiza el estado del formulario con esos valores, de modo que al abrir en modo edición se muestren fecha límite, grupos e intentos ya asignados.

### Resultado esperado
- Al editar un simulador: se ven la fecha límite, la duración, los intentos (sin límite / límite con número) y los grupos asignados tal como están guardados.
- Al editar un quiz: se ven los grupos asignados y el resto de datos; al guardar, los grupos se envían correctamente en el payload de actualización.

---

## 2025-02-19 – Pantallas grandes (2xl): reducir márgenes laterales

### Objetivo
En pantallas grandes (2xl, ≥1536px) los márgenes laterales eran excesivos y el contenido (Quizzes, Actividades, Simuladores) quedaba “encogido” en el centro. Ajustar para que el contenido use más ancho y se vea bien en todos los aspectos en pantallas grandes.

### Archivos modificados

#### `client/src/components/layouts/Layout.jsx`
- **`<main>`:** Se añadió `2xl:px-4` al padding lateral. Antes: `px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8`. Ahora en 2xl el área principal tiene menos padding lateral (4 = 1rem) para que el contenido del dashboard aproveche más el ancho.

#### `client/src/components/Asesor/Quiz.jsx`
- **Contenedor principal:** De `mx-auto max-w-8xl 2xl:max-w-[90rem] px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10` a `mx-auto max-w-8xl w-full 2xl:max-w-none 2xl:px-4 px-4 pb-12 pt-4 sm:px-6 lg:px-8`. En 2xl se quita el límite de ancho (`2xl:max-w-none`) y se reduce el padding lateral a `2xl:px-4` para eliminar los márgenes laterales grandes.

#### `client/src/components/Asesor/SimuladoresGen.jsx`
- **Contenedor principal:** De `mx-auto max-w-8xl px-4 pb-8 pt-4 sm:pt-6 sm:px-6 lg:px-8` a `mx-auto max-w-8xl w-full 2xl:max-w-none 2xl:px-4 px-4 pb-8 pt-4 sm:pt-6 sm:px-6 lg:px-8`. En 2xl se permite ancho completo y padding lateral `2xl:px-4`.

#### `client/src/components/Asesor/TablaActividades.jsx`
- **Sección principal:** De `px-4 sm:px-6 lg:px-8 2xl:px-10` a `px-4 sm:px-6 lg:px-8 2xl:px-4`. En 2xl se reduce el padding lateral de 2.5rem a 1rem para que la tabla de actividades use más ancho.

### Resultado esperado
- En viewports 2xl (p. ej. 1920×1080), el contenido de Quizzes, Actividades y Simuladores ocupa más ancho útil, con márgenes laterales reducidos y sin sensación de “contenido pequeño en el centro”.

---

## 2025-02-19 – Tabla Actividades: limitar ancho de la columna ACTIVIDAD

### Objetivo
En la vista de tabla de Actividades (módulo), la columna “ACTIVIDAD” se expandía demasiado en pantallas grandes cuando el título o la descripción tenían texto muy largo sin espacios (p. ej. “flwekjfkwjefklew”), dejando la tabla desproporcionada. En laptop chica se veía bien. Evitar que esa celda domine el ancho de la tabla.

### Archivos modificados

#### `client/src/components/Asesor/TablaActividades.jsx`
- **Tabla:** Se añadió `table-fixed` para que los anchos de columna se respeten y el contenido largo no estire la tabla.
- **Cabecera columna “Actividad” (th):** De `min-w-[220px]` a `w-[260px] max-w-[260px] min-w-[180px]` para fijar un ancho máximo de 260px y un mínimo razonable.
- **Celda “Actividad” (td):** Se añadió `w-[260px] max-w-[260px]` y `overflow-hidden`. El contenedor interno pasó de `max-w-[200px] lg:max-w-xs xl:max-w-md` a `min-w-0 max-w-full` para que respete el ancho de la celda. Al título se añadió `break-words` (además de `truncate`) y a la descripción `break-words overflow-hidden` además de `line-clamp-2` para que cadenas largas sin espacios se partan y no fuercen el ancho.

### Resultado esperado
- La columna ACTIVIDAD tiene un ancho controlado (~260px); el título se trunca con ellipsis y la descripción hace hasta 2 líneas con corte de palabras, sin expandir la tabla en pantallas grandes. En laptop chica el comportamiento se mantiene correcto.

### Corrección: altura de la tabla con pocas filas (mismo día)
- Con una sola actividad (1 fila), el bloque de la tabla quedaba **muy alto hacia abajo** porque tenía `2xl:min-h-[55vh]`. Se eliminó esa altura mínima para que el contenedor de la tabla solo ocupe el alto del contenido: con 1 fila se ve compacto; con más filas la tabla crece hacia abajo de forma natural.
- **Simuladores:** Se aplicó el mismo criterio en `client/src/components/Asesor/SimuladoresGen.jsx`: se quitaron `2xl:min-h-[55vh]` del contenedor exterior y `2xl:min-h-[50vh]` del contenedor de la tabla, para que la tabla de simuladores tampoco quede muy larga hacia abajo cuando hay pocas filas.

---

## 2025-02-19 – Agenda y Calendario: más altura en pantallas grandes (2xl)

### Objetivo
En la vista “Agenda y Calendario” del asesor, en pantallas grandes y extra grandes el calendario se veía **aplanado y con poca altura** aunque hubiera espacio de sobra. Ajustar para que en 2xl (≥1536px) el calendario use más altura y se vea proporcionado.

### Archivos modificados

#### `client/src/components/Asesor/Agenda.jsx` (componente Calendar)
- **Cabecera del mes:** `py-5 2xl:py-7`; botones `p-2.5 2xl:p-3.5`; iconos Chevron `size-5 2xl:size-7`; título del mes `2xl:text-3xl`; icono calendario `2xl:size-8`.
- **Fila de días de la semana (L, M, X…):** `2xl:text-sm`; `2xl:py-5`.
- **Celdas del mes (vacías y con día):** en 2xl cada celda `2xl:h-28` (7rem), en min-[2200px] `min-[2200px]:h-32`. Celdas con día: `2xl:p-2`; número del día: `2xl:w-10 2xl:h-10`, `2xl:text-base`.
- **Pie del calendario:** `2xl:p-6`; botón “Nuevo recordatorio” `2xl:text-lg`, `2xl:py-4 2xl:px-8`, icono Plus `2xl:size-6`.

### Resultado esperado
- En viewports 2xl el calendario tiene altura generosa: celdas de 7rem, cabecera y pie más grandes, mejor uso del espacio vertical (ajuste reforzado respecto a la primera versión que era lo mínimo).

---

## 2025-02-19 – Agenda, Recursos, Mis pagos, Asesorías: escalado 2xl en pantallas grandes

### Objetivo
En pantallas grandes y extra grandes había mucho espacio y los elementos (títulos, botones, tarjetas, listas) se veían pequeños. Aplicar el mismo criterio de escalado **2xl** (≥1536px) a las vistas **Agenda y Calendario** (resto de la página), **Recursos educativos**, **Mis pagos** y **Asesorías** para que el contenido use mejor el espacio y no se vea “chico”.

### Archivos modificados

#### `client/src/components/Asesor/Agenda.jsx` (página principal, fuera del componente Calendar)
- **Contenedor:** `2xl:max-w-none`, `2xl:px-4`, `2xl:py-10`; márgenes inferiores del header `2xl:mb-12`; gap del header `2xl:gap-6 2xl:mb-6`.
- **Header “Agenda y Calendario”:** icono `2xl:size-12`, título `2xl:text-6xl`, subtítulo `2xl:text-lg`; bloque del icono `2xl:p-5`.
- **Grid principal:** `2xl:gap-10`; sección Recordatorios `2xl:space-y-6`.
- **Título “Recordatorios”:** `2xl:text-4xl`; badge “pendientes” `2xl:text-sm 2xl:px-3 2xl:py-1`.
- **Búsqueda y filtro:** input `2xl:py-4 2xl:text-base`; iconos Search/Filter `2xl:size-5`; select `2xl:py-4 2xl:text-base`.
- **Lista de eventos:** `2xl:max-h-[500px]`, `2xl:px-2`.
- **Leyenda de Eventos:** contenedor `2xl:p-5`; icono Tag `2xl:size-5`; texto “Leyenda de Eventos” `2xl:text-base`; ítems de leyenda `2xl:text-sm`, punto de color `2xl:w-4 2xl:h-4`.

#### `client/src/components/Asesor/Recursos.jsx`
- **Contenedor:** `2xl:max-w-none`, `2xl:px-4`, `2xl:py-10`; header `2xl:mb-10`, `2xl:gap-6 2xl:mb-6`.
- **Header:** icono `2xl:size-12`, título `2xl:text-6xl`, descripción `2xl:text-lg`; bloque icono `2xl:p-5`.
- **Tabs (Mis Recursos / Recursos del Administrador):** `2xl:py-4 2xl:text-base`, iconos `2xl:size-5`.
- **Botones (Subir archivo, Agregar enlace, Eliminar):** `2xl:px-6 2xl:py-4 2xl:text-base`, iconos `2xl:size-6`.
- **“Seleccionar todos”:** `2xl:text-base`, `2xl:px-4 2xl:py-2.5`.
- **Bloque de filtros/búsqueda:** `2xl:p-7`, `2xl:mb-8`.
- **Tarjetas de recurso:** `2xl:p-7`.
- **Tarjetas más grandes en 2xl (mismo día):** En pantallas grandes las tarjetas de recurso se veían pequeñas con mucho espacio vacío. Se ajustó: grid de tarjetas `2xl:grid-cols-[repeat(auto-fit,minmax(360px,480px))]` y `2xl:gap-8`; cada tarjeta `2xl:p-8`; icono del tipo de archivo contenedor `2xl:w-20 2xl:h-20` e icono interno `2xl:[&_svg]:size-10`; título `2xl:text-base`; tipo/tamaño `2xl:text-sm`; descripción y tags `2xl:text-sm`; botones de acción con `2xl:p-2.5` e iconos `2xl:size-5`; pie “Subido”/“ID” `2xl:text-sm 2xl:pt-4`.
- **Modal de preview (videos y documentos):** En 2xl el modal de vista previa es más grande: contenedor `2xl:max-w-5xl`, `2xl:max-h-[90vh]`; overlay `2xl:p-6`; cabecera `2xl:px-6 2xl:py-5`, título `2xl:text-xl`, subtítulo `2xl:text-sm`; botones Descargar/Abrir y cerrar `2xl:py-2.5 2xl:text-base`, iconos `2xl:size-5`/`2xl:size-6`; contenido `2xl:p-6`; iframe PDF `2xl:min-h-[500px] 2xl:max-h-[70vh]`; video e imagen `2xl:max-h-[70vh]`. En pantallas chicas o con poca resolución el modal se mantiene como antes.

#### `client/src/components/Asesor/Pagos.jsx`
- **Contenedor:** `2xl:max-w-none`, `2xl:px-4`, `2xl:py-10`; header `2xl:mb-10`, `2xl:gap-6 2xl:mb-6`.
- **Header:** icono `2xl:size-12`, título `2xl:text-6xl`, subtítulo `2xl:text-lg`; bloque icono `2xl:p-5`.
- **Filtros:** card `2xl:p-7 2xl:mb-8`; badge “pagos encontrados” `2xl:py-4 2xl:text-base`.
- **Selección de semana:** `2xl:mb-8`, icono y título `2xl:size-6` / `2xl:text-xl`; chips de semana `2xl:px-6 2xl:py-4 2xl:text-base`.
- **Tarjetas de estadísticas (Ingresos, Pendientes, Horas, Total):** `2xl:p-7`, iconos `2xl:size-6`, números `2xl:text-4xl`, etiquetas `2xl:text-sm`; grid `2xl:gap-6 2xl:mb-8`.
- **Tabla de pagos:** thead `2xl:py-4`, `2xl:text-xs`; filas `2xl:[&_td]:py-4`.

#### `client/src/components/Asesor/Asesorias.jsx`
- **Sección principal:** `2xl:px-4`, `2xl:pt-14`, `2xl:pb-12`, `2xl:max-w-none`; header `2xl:mb-10`, `2xl:gap-6`.
- **Header:** icono `2xl:size-12`, título `2xl:text-6xl`, subtítulo `2xl:text-lg`; bloque icono `2xl:p-5`; select `2xl:py-3 2xl:text-base`.
- **KPIs:** grid `2xl:gap-5 2xl:mb-8`; componente KPI con `2xl:p-6`, icono `2xl:h-12 2xl:w-12`, label `2xl:text-base`, value `2xl:text-3xl`.
- **Detalle de sesión y lista:** bloques con `2xl:p-7`; título “Detalle de Sesión” `2xl:text-xl`; tabs `2xl:py-2.5 2xl:text-base`.
- **SessionCard:** `2xl:p-5`, textos `2xl:text-sm` / `2xl:text-base`.

### Resultado esperado
- En viewports 2xl, Agenda (header + Recordatorios + Leyenda), Recursos educativos, Mis pagos y Asesorías tienen títulos, iconos, botones, tarjetas y tablas más grandes y mejor proporcionados, aprovechando el espacio disponible en pantallas grandes.

---

## 2025-02-19 – Simuladores (Asesor): tarjetas responsivas (compactas en pantallas chicas, grandes en xl/2xl)

### Objetivo
En la vista SIMULADORES del asesor, las dos tarjetas (“Simulador por áreas generales” y “Simulador por módulos específicos”) se veían demasiado grandes en pantallas chicas y demasiado pequeñas en pantallas grandes y extra grandes. Ajustar según reglas de responsividad: **más compactas en pantallas chicas** y **más grandes en xl/2xl**.

### Archivos modificados

#### `client/src/components/Asesor/AsesorSimuladores.jsx`

- **SimCard (tarjeta):**
  - **Padding:** `p-8 sm:p-10` → `p-5 sm:p-6 lg:p-8 xl:p-10 2xl:p-12` (menos en base/sm, más en xl/2xl).
  - **Icono contenedor:** de `h-20 w-20` fijo a `h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 2xl:h-28 2xl:w-28`; márgenes `mb-6` → `mb-4 sm:mb-5 lg:mb-6`.
  - **Icono interno:** `h-10 w-10` → `h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-14 2xl:w-14`.
  - **Título:** `text-2xl sm:text-3xl` → `text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl`.
  - **Subtítulo:** `text-xl` → `text-base sm:text-lg lg:text-xl`; margen `mt-2` → `mt-1.5 sm:mt-2`.
  - **Descripción:** `text-slate-600` con tamaño `text-sm sm:text-base lg:text-lg`; márgenes `mt-4 mb-8` → `mt-3 sm:mt-4 lg:mt-4 mb-4 sm:mb-6 lg:mb-8`.
  - **Botón ACCEDER:** padding `px-4 py-2.5 sm:px-5 sm:py-3 lg:px-6 … xl … 2xl:px-8 2xl:py-4`; texto `text-sm sm:text-base`; icono flecha `h-4 w-4 sm:h-5 … 2xl:h-6 2xl:w-6`.
  - **Hover:** `hover:-translate-y-2` → `hover:-translate-y-1 sm:hover:-translate-y-2`; bordes `rounded-3xl` → `rounded-2xl sm:rounded-3xl`.
- **Sección del grid:**
  - **Ancho máximo:** de `max-w-6xl` fijo a `max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl` para que en pantallas chicas el bloque no sea tan ancho y en 2xl las tarjetas ocupen más espacio y se vean más grandes.

### Resultado esperado
- **Pantallas chicas:** tarjetas más compactas (menos padding, iconos y textos más pequeños).
- **Pantallas grandes y extra grandes (xl/2xl):** tarjetas más grandes (más padding, iconos y textos más grandes, contenedor más ancho en 2xl).

### Corrección: Huawei y laptops chicas (mismo día)
- En Huawei y laptops chicas las tarjetas seguían viéndose demasiado grandes porque en **xl** (1280px) ya se aplicaban tamaños grandes. Se dejó el **contenido grande solo en 2xl** (≥1536px).
- **Hasta xl:** padding `lg:p-6 xl:p-6` (sin `xl:p-10`); icono `lg:h-16 xl:h-16` (sin `xl:h-24`); icono interno `lg:h-8 xl:h-8`; título `lg:text-xl xl:text-xl` (sin `xl:text-3xl`); subtítulo y descripción en `lg`/`xl` sin subir a `xl`; botón `lg:text-sm xl:text-sm` y padding reducido; contenedor `xl:max-w-5xl` (no 6xl) y `xl:gap-6`.
- **Solo 2xl:** `2xl:p-12`, `2xl:h-28 2xl:w-28`, `2xl:text-4xl`, `2xl:text-xl`, `2xl:text-lg`, `2xl:mb-8`, `2xl:px-8 2xl:py-4`, `2xl:text-base`, `2xl:max-w-7xl`.
- **Separación entre tarjetas:** más espacio entre las dos tarjetas de Simuladores: `gap-4 …` → `gap-5 sm:gap-6 lg:gap-8 …`; luego `gap-6 sm:gap-8 lg:gap-10 xl:gap-10 2xl:gap-12`.
- **Mismo estilo que Actividades/Quizzes:** las dos tarjetas de Simuladores se rediseñaron para usar el mismo estilo y tamaño que la página de Actividades (Quizt&Act.jsx): tarjetas centradas (`text-center`), `rounded-3xl`, `border-2`, `shadow-xl`, `ring-2 ring-slate-100/50`, `p-6 sm:p-9`, icono `w-16 h-16 sm:w-20 sm:h-20` con `rounded-3xl`, título `text-2xl sm:text-3xl`, `mt-6 sm:mt-7`, descripción `text-sm sm:text-base`, botón `mt-7 sm:mt-9` y `px-6 py-3`; grid `max-w-6xl`, `md:grid-cols-2`, `gap-6 sm:gap-8 lg:gap-12 xl:gap-16`. Se mantienen los colores violeta/índigo por tarjeta y el CTA "ACCEDER".
- **Pantallas 1920×1080 (2xl):** en resoluciones grandes el diseño se veía muy pequeño. Se añadieron variantes **2xl** solo para viewport ≥1536px: (1) **Tarjetas:** `2xl:p-12`, icono `2xl:w-28 2xl:h-28` e interno `2xl:w-14 2xl:h-14`, título `2xl:text-4xl`, subtítulo `2xl:text-3xl`, descripción `2xl:text-lg`, botón `2xl:px-8 2xl:py-4 2xl:text-lg`, flecha `2xl:w-5 2xl:h-5`, márgenes `2xl:mt-8`, `2xl:mt-10`. (2) **Grid:** `2xl:max-w-7xl`, `2xl:gap-20`. (3) **Hero SIMULACIONES:** `2xl:px-12 2xl:py-10`, icono `2xl:w-24 2xl:h-24`, Zap `2xl:h-12 2xl:w-12`, título `2xl:text-7xl`, descripción `2xl:text-xl`, badge "Actualizado hoy" y Clock más grandes. (4) **Header SIMULADORES:** `2xl:px-8 2xl:py-6`, icono `2xl:h-16 2xl:w-16`, título `2xl:text-4xl`, subrayado y texto `2xl:text-lg`.
- **Actividades y Quizzes (Quizt&Act.jsx) — mismo 2xl:** se aplicó el mismo escalado 2xl a la página de donde se copió el diseño: sección `2xl:px-12 2xl:py-10`; header superior con `2xl:px-10 2xl:py-8`, título `2xl:text-5xl`, botón Volver y badge "2 tipos disponibles" más grandes; banner "Actividades y Quizzes" con `2xl:px-10 2xl:py-8`, icono `2xl:w-28 2xl:h-28`, ListChecks `2xl:w-14 2xl:h-14`, título `2xl:text-5xl`; grid `2xl:max-w-7xl 2xl:gap-20`; ambas tarjetas (Actividades y Quizzes) con `2xl:p-12`, icono `2xl:w-28 2xl:h-28`, icono interno `2xl:w-14 2xl:h-14`, título `2xl:text-4xl`, descripción `2xl:text-lg`, botón `2xl:px-8 2xl:py-4 2xl:text-lg`, `2xl:mt-8`, `2xl:mt-10`.
- **Botones alineados abajo en las tarjetas (Actividades/Quizzes y Simuladores):** para que los botones queden siempre en la misma posición (abajo) aunque una tarjeta tenga más o menos texto, se usó flex: en el `<article>` `flex flex-col h-full`; en el contenedor interno `flex flex-col flex-1 min-h-0`; en la descripción `flex-1 min-h-0` para que absorba el espacio; en el contenedor del botón `mt-auto pt-6 sm:pt-8 2xl:pt-10 shrink-0`. Aplicado en `Quizt&Act.jsx` (Actividades y Quizzes) y en `AsesorSimuladores.jsx` (SimCard). El grid ya hace que las dos tarjetas de la fila tengan la misma altura (align-items: stretch por defecto).
- **Tablas/contenido de Actividades, Quizzes y Simulaciones en 1920×1080 (2xl):** en pantallas grandes las tablas y el contenido se veían muy pequeños y quedaba mucho espacio debajo. Se aplicó escalado **solo 2xl** (≥1536px) en: **(1) Quiz.jsx:** contenedor `2xl:max-w-[90rem] 2xl:px-10`; bloque de tabla desktop `2xl:min-h-[55vh]`, tabla `2xl:min-h-[50vh]`; thead `2xl:py-4`, `2xl:text-xs`; filas de datos `2xl:[&_td]:py-4`, celda de nombre `2xl:text-base 2xl:max-w-lg`; estado vacío “No hay quizzes” con `2xl:py-28`, icono `2xl:w-28 2xl:h-28`, FileQuestion `2xl:w-14 2xl:h-14`, título `2xl:text-xl`, texto `2xl:text-base`, botón “Nuevo quiz” `2xl:px-4 2xl:py-2`. **(2) TablaActividades.jsx:** sección `2xl:px-10 2xl:py-10`; contenedor tabla `2xl:min-h-[55vh]`; thead `2xl:py-4`, `2xl:text-xs`; filas de datos `2xl:[&_td]:py-4`. **(3) SimuladoresGen.jsx:** bloque tabla `2xl:min-h-[55vh]`, contenedor tabla `2xl:min-h-[50vh]`; thead `2xl:py-4`, `2xl:text-xs`; filas `2xl:[&_td]:py-4`, celda nombre `2xl:text-base 2xl:max-w-lg`; estado vacío “No hay simuladores” con mismos 2xl que Quiz (icono, texto, botón).

---

## 2025-02-19 – Módulos específicos: 5 tarjetas por fila en pantallas grandes

### Objetivo
Según las reglas de responsividad del proyecto, en **pantallas grandes** la sección Módulos específicos debe mostrar **5 tarjetas por fila** (en lugar de 6 u otra cantidad por auto-fill) para que las tarjetas se vean más grandes.

### Archivos modificados

#### `client/src/components/common/ModulosEspecificos.jsx`

- **Grid de tarjetas:** de `grid-cols-[repeat(auto-fill,minmax(240px,1fr))]` a columnas explícitas por breakpoint: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5`, con `gap-4 sm:gap-5` sin cambios.
- **5 columnas solo en 2xl** (≥1536px). En **xl** (1280–1535px), p. ej. Huawei D15 con resolución alta (pantalla chica), se mantienen **4 por fila**; en lg, 4; en md, 3; en sm, 2; en base, 1.

### Resultado esperado
- En monitores realmente grandes (2xl) se ven 5 tarjetas por fila. En laptops/pantallas chicas de alta resolución (xl, como Huawei D15) se mantienen 4 por fila. En pantallas menores, 1–4 columnas según breakpoint.

---

## 2025-02-19 – ÁREAS DE ESTUDIO: contenido más grande en xl/2xl (monitor 15.6" 1920×1080)

### Objetivo
Seguir el patrón de diseño responsivo y **solo en viewports grandes (xl, 2xl)** hacer más grande el contenido interno de las tarjetas (letras, títulos, iconos, botón) para llenar mejor el espacio. El tamaño de la tarjeta (CTA) no se modifica.

### Archivos modificados

#### `client/src/components/Asesor/Actividades.jsx` (AreaCard)

- **Padding de la tarjeta:** añadido `xl:p-5 2xl:p-5` para dar cabida al contenido más grande.
- **Icono:** contenedor con `xl:w-14 xl:h-14 2xl:w-16 2xl:h-16`; icono interno `xl:scale-125 2xl:scale-[1.35]` para que se vea más grande.
- **Título (h3):** `xl:text-lg 2xl:text-xl` y `xl:mt-3 2xl:mt-3`.
- **Descripción (p):** `lg:text-sm xl:text-base` y `xl:mt-1`.
- **Botón "Explorar área":** `xl:text-sm 2xl:text-sm`, `xl:px-4 xl:py-2 2xl:px-4 2xl:py-2`; icono flecha `xl:h-4 xl:w-4 2xl:h-4 2xl:w-4`.

### Resultado esperado
- En monitores 1920×1080 (15.6") y viewports xl/2xl, el contenido de cada tarjeta (iconos, títulos, descripción, botón) se ve más grande y aprovecha mejor el espacio, sin cambiar el tamaño de la tarjeta.

### Corrección posterior (mismo día)
- El contenido grande no debe afectar pantallas chicas: se quitó todo escalado en **lg** (1024px). Solo **xl** (≥1280px) y **2xl** (≥1536px) tenían contenido más grande.
- Segunda corrección: en pantalla chica 13–14" con resolución 2160×1440 el viewport lógico suele ser ~1440px (p. ej. escala 150%), por lo que **xl** (1280px) aplicaba y el contenido seguía viéndose grande. Se quitó todo el contenido grande en **xl** y se dejó **solo en 2xl** (≥1536px). Así, viewports &lt; 1536px (incl. 1440px de la laptop 13–14") mantienen iconos, títulos, descripción y botón en tamaño normal; solo monitores con ancho lógico ≥1536px ven el contenido más grande.

---

## 2025-02-19 – ÁREAS DE ESTUDIO: menos altura de tarjetas y menos espacio entre descripción y botón

### Objetivo
Reducir la altura de las tarjetas de ÁREAS DE ESTUDIO y el espacio excesivo entre la descripción y el botón "Explorar área".

### Archivos modificados

#### `client/src/components/Asesor/Actividades.jsx` (AreaCard)

- **Proporción de la tarjeta:** `aspect-square` → `aspect-[4/3]` y `min-h-[180px] sm:min-h-[200px]` → `min-h-[160px] sm:min-h-[180px]` para tarjetas un poco más bajas.
- **Padding de la tarjeta:** `p-4` en base → `p-3 sm:p-4` para compactar un poco el contenido.
- **Título:** `mt-2.5 sm:mt-3` → `mt-2 sm:mt-2.5`.
- **Descripción:** eliminado `flex-1 min-h-0` para que no absorba el espacio entre texto y botón; `mt-1` → `mt-0.5`.
- **Contenedor del botón:** `mt-auto pt-2 sm:pt-3` → `mt-2 sm:mt-2.5`; luego `mt-3 sm:mt-3.5`; finalmente `mt-auto` para bajar el botón a ras del marco inferior de la tarjeta.

### Resultado esperado
- Tarjetas algo menos altas y con menos espacio vacío entre la descripción y el botón "Explorar área".

---

## 2025-02-19 – ÁREAS DE ESTUDIO: 4 tarjetas por fila, uso total del ancho y menos espacio entre tarjetas

### Objetivo
Que las tarjetas de ÁREAS DE ESTUDIO ocupen el espacio total de los márgenes laterales, permitan **4 cartas por fila** en escritorio y se **reduzca el espacio entre ellas**.

### Archivos modificados

#### `client/src/components/Asesor/Actividades.jsx`

- **Sección contenedora:**
  - Padding horizontal reducido: `px-4 sm:px-6 lg:px-8` → `px-3 sm:px-4 lg:px-5` para ganar ancho útil.
  - Ancho máximo ampliado: `max-w-[1400px]` → `max-w-[1920px]` para aprovechar monitores grandes.
- **Grid de tarjetas:**
  - Columnas en escritorio: `lg:grid-cols-3` → `lg:grid-cols-4` (4 tarjetas por fila desde `lg`).
  - Espacio entre tarjetas reducido: `gap-4 sm:gap-5 lg:gap-5` → `gap-3 sm:gap-4 lg:gap-4`.
  - Eliminado `justify-items-center` para que las tarjetas ocupen todo el ancho de su celda.
- **AreaCard (tarjeta individual):**
  - De tamaños fijos por breakpoint (`w-[200px] h-[200px]` … `2xl:w-[300px] 2xl:h-[300px]`) a **layout flexible**: `w-full min-w-0` para que cada tarjeta use todo el espacio de su celda del grid.
  - Proporción cuadrada mantenida con `aspect-square` y `min-h-[180px] sm:min-h-[200px]` para que no se deformen en pantallas pequeñas.
  - Eliminado `mx-auto` porque el ancho lo define el grid.
  - Padding en `lg` unificado a `lg:p-4` para compensar el menor gap.

### Resultado esperado
- En pantallas `lg` y mayores: **4 tarjetas por fila** que ocupan el ancho disponible.
- Menos espacio entre tarjetas (gaps más pequeños) y márgenes laterales reducidos para aprovechar mejor el viewport.
- En móvil/tablet se mantiene 1 y 2 columnas; las tarjetas siguen siendo cuadradas y legibles.

---

## 2025-02-19 – Skill de responsividad en ÁREAS DE ESTUDIO y Módulos específicos

### Objetivo
Aplicar el skill `.cursor/skills/reglas-responsividad/SKILL.md` a la pantalla **ÁREAS DE ESTUDIO** (Actividades) y al listado de **Módulos específicos** (componente común ModulosEspecificos), para que no se vean desproporcionados en pantallas 1080p y se mantenga mobile-first con escalado moderado.

### Archivos modificados

#### `client/src/components/Asesor/Actividades.jsx` (ÁREAS DE ESTUDIO)

- **SectionBadge (encabezado “ÁREAS DE ESTUDIO”):**
  - Padding `p-6 sm:p-8` → `p-4 sm:p-6`; margen inferior `mb-8` → `mb-6 sm:mb-8`.
  - Blobs de fondo `h-64 w-64` → `h-48 w-48 sm:h-56 sm:w-56`.
  - Icono contenedor `size-16 sm:size-20` → `size-14 sm:size-16`; GraduationCap `size-8 sm:size-10` → `size-7 sm:size-8`; estrella `h-6 w-6` → `h-5 w-5 sm:h-6 sm:w-6`.
  - Título `text-3xl sm:text-4xl md:text-5xl` → `text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl`.
  - Subrayados y gaps con tamaños responsivos (`h-1 sm:h-1.5`, `w-14 sm:w-20`, etc.). Añadido `min-w-0` al contenedor del título.
- **AreaCard (tarjetas por área):**
  - Padding `p-7 sm:p-8` → `p-5 sm:p-6`; bordes `rounded-3xl` → `rounded-2xl sm:rounded-3xl`.
  - Icono del área `w-16 h-16` → `w-14 h-14 sm:w-16 sm:h-16`; hover `scale-110` → `scale-105`.
  - Título `text-xl sm:text-2xl` → `text-lg sm:text-xl`; márgenes `mt-6` → `mt-4 sm:mt-5`, `pt-8` → `pt-6 sm:pt-8`.
  - Botón “Explorar área” con padding `px-4 py-2 sm:px-5 sm:py-2.5` e icono `h-3.5 w-3.5 sm:h-4 sm:w-4`.
- **Sección y grid:**
  - Contenedor con `max-w-[min(1920px,100vw)] mx-auto` y padding `lg:px-6 2xl:px-8`.
  - Grid `xl:grid-cols-4` → `2xl:grid-cols-4`; gaps `gap-5 sm:gap-6` → `gap-4 sm:gap-5`.

#### `client/src/components/common/ModulosEspecificos.jsx` (Módulos específicos – actividades y simuladores)

- **SectionBadge (encabezado “Módulos específicos” o título inyectado):**
  - Mismos criterios que Actividades: `p-4 sm:p-6`, blobs `h-48 w-48 sm:h-56 sm:w-56`, icono `size-14 sm:size-16`, título `text-2xl … 2xl:text-5xl`.
  - Botón “Volver” `h-9 w-9 sm:h-10 sm:w-10`, `rounded-xl sm:rounded-2xl`; ChevronLeft `size-5 sm:size-6`.
  - Contador de módulos y botón refrescar con tamaños `h-8 w-8 sm:h-9 sm:w-9`, `px-3 sm:px-4 py-2 sm:py-3`, `text-base sm:text-lg`; añadido `shrink-0` donde corresponde.
- **AreaCard (tarjetas de módulo):**
  - `rounded-[1.5rem]` → `rounded-xl sm:rounded-[1.5rem]`; hover `-translate-y-2` → `-translate-y-1 sm:-translate-y-2`.
  - Título `min-h-[2.5rem]` → `min-h-[2.25rem] sm:min-h-[2.5rem]`; descripción `text-sm` → `text-xs sm:text-sm`, `h-10` → `h-9 sm:h-10`.
- **Sección y grid:**
  - Contenedor `max-w-[1920px]` → `max-w-[min(1920px,100vw)]`; padding `lg:px-8` → `lg:px-6 2xl:px-8`.
  - Grid `minmax(260px,1fr)` → `minmax(240px,1fr)`; `gap-6` → `gap-4 sm:gap-5`.

### Resultado esperado
- **ÁREAS DE ESTUDIO** y **Módulos específicos** se ven proporcionados en 1080p (laptops 13–15") y en monitores grandes (2xl).
- Mobile-first y límite de ancho con `max-w-[min(1920px,100vw)]` aplicados de forma coherente con el resto del panel Asesor.

---

## 2025-02-19 – Aplicación del skill de responsividad al panel del Asesor

### Objetivo
Aplicar las reglas del skill `.cursor/skills/reglas-responsividad/SKILL.md` al panel del Asesor: mobile-first, escalado moderado en `lg` para no verse desproporcionado en pantallas 1080p (ej. laptop 13"), y uso de `2xl` para los tamaños mayores solo en monitores grandes.

### Archivos modificados

#### `client/src/components/Asesor/AsesorMaestro.jsx` (dashboard / inicio)

- **CourseChip (tarjetas de curso):** Eliminado escalado `lg:` en gaps, padding e iconos. Iconos `h-10 sm:h-12` (sin md/lg mayores). Título del curso hasta `md:text-sm` (sin `lg:text-base`). Badge y flecha sin `md:bottom-3`/`md:right-3`.
- **Elementos decorativos de fondo (blurs):** Tamaños reducidos y escalado solo hasta `2xl` (ej. `2xl:w-[500px]` en lugar de `lg:w-[600px]`), para que en 1080p no dominen la pantalla.
- **Contenedor principal:** `max-w-[1920px]` → `max-w-[min(1920px,100vw)]`; padding `lg:px-12 xl:px-16` → `lg:px-10 2xl:px-12`; padding inferior sin `lg:pb-12`.
- **Header “Bienvenido de vuelta”:** Título `text-3xl … lg:text-6xl` → `text-2xl … lg:text-5xl 2xl:text-6xl`. Nombre de usuario `text-lg … xl:text-4xl` → `text-base … lg:text-2xl 2xl:text-3xl`. Icono Sparkles hasta `md:size-7` (sin lg). Espaciados y “Panel de Asesor” sin crecimiento excesivo en lg.
- **Sección “Mis Cursos”:** Título `text-2xl … xl:text-6xl` → `text-xl … lg:text-4xl 2xl:text-5xl`. Descripción y badge “Total” con tamaños moderados. Bordes y márgenes sin `lg:`/`xl:` agresivos.
- **Grid de cursos:** `xl:grid-cols-6` → `2xl:grid-cols-6`; gaps `lg:gap-6 xl:gap-8` → `gap-3 sm:gap-4 md:gap-5` (sin gaps mayores en lg/xl). Skeleton y estado vacío “No tienes cursos” con iconos y paddings moderados (sin `md:w-28 md:h-28` ni `md:mb-6`).

#### `client/src/components/Asesor/Topbar.jsx`

- **Logo:** `w-10 sm:w-14 md:w-16 lg:w-20` → `w-10 sm:w-12 md:w-14` para que no se vea enorme en 1080p.
- **Título central:** Eliminado `lg:text-xl`; se mantiene `md:text-base`.
- **Botón notificaciones:** Eliminado `lg:p-3`; se mantiene `p-2`.
- **Dropdown de notificaciones:** Ancho `sm:w-96` → `w-[min(24rem,calc(100vw-1rem))]` para limitar ancho en viewports grandes y mantener usabilidad en móvil.
- **Avatar de perfil:** Eliminado `lg:w-12 lg:h-12`; se mantiene hasta `md:w-10 md:h-10`.
- **Altura del header y padding del contenido:** Se mantienen `h-14 md:h-16 lg:h-20` y `!pt-14 md:!pt-16 lg:!pt-20` en el bundle para no desalinear el sidebar (Layout usa `top-14 md:top-16 lg:top-20`).

### Resultado esperado
- En **laptops 1080p** (13–15"): el dashboard y el topbar se ven proporcionados, sin títulos ni iconos desmesurados.
- En **monitores grandes (2xl):** se aprovechan tamaños algo mayores solo donde se usó `2xl:`.
- **Mobile-first** respetado: base y `sm`/`md` definen la experiencia; `lg` y `2xl` solo refinan sin inflar en exceso.

---

## 2025-02-19 – Skill de responsividad (reglas_responsivide → skill)

### Cambio realizado
- **Skill creado:** `.cursor/skills/reglas-responsividad/SKILL.md` con el contenido de responsividad React + Tailwind (breakpoints, principios mobile-first, límites de modales en 1080p, ejemplos de uso).
- **Descripción del skill:** el agente aplica este skill cuando se trabaja en responsividad, breakpoints, modales que se ven grandes/pequeños en distintas pantallas, layouts adaptativos o cuando el usuario mencione diseño responsivo / Tailwind responsive.
- **Documento actualizado:** `docs/reglas_responsivide.md` ahora indica que la fuente oficial es el skill en `.cursor/skills/reglas-responsividad/SKILL.md` y conserva un resumen rápido para referencia humana.

### Archivos tocados
- Creado: `.cursor/skills/reglas-responsividad/SKILL.md`
- Modificado: `docs/reglas_responsivide.md` (reducido a enlace al skill + resumen).

---

## 2025-02-19 – Modal Centro de Solicitudes: evitar que se vea enorme en pantallas chicas con alta resolución

### Contexto del problema
- En **pantalla grande** (ej. monitor de escritorio) el modal se veía bien.
- En **pantalla chica con más resolución** (ej. MacBook Air 13–14" a 1920×1080) el modal se veía **demasiado grande** y desproporcionado (“se ve mucho más grande y es feo”).

### Solución aplicada
Se limitó el tamaño máximo del modal y se quitó el escalado agresivo con `lg:`/`xl:` que hacía que en viewports grandes (como 1920px) todo creciera mucho. Así el modal deja de dominar la pantalla en laptops con 1080p.

### Cambios en `client/src/components/common/SolicitudesModal.jsx`

**1. Modal principal "Centro de Solicitudes" (RequestsManager)**

- **Ancho máximo:** de `max-w-3xl lg:max-w-4xl xl:max-w-5xl` a `max-w-3xl sm:max-w-[min(48rem,90vw)] 2xl:max-w-4xl`.
  - En viewports grandes el ancho queda limitado a **48rem (768px)** o 90% del viewport (el menor de los dos). En 1920×1080 el modal ya no ocupa ~70–80% del ancho.
  - Solo en pantallas muy grandes (2xl, ≥1536px) se permite hasta `max-w-4xl` (896px).
- **Altura:** de `max-h-[80vh] lg:max-h-[85vh]` a `max-h-[78vh]` fijo.
- **Escalado de contenido:** se eliminaron las clases `lg:` y `xl:` del encabezado, pestañas, iconos, títulos y área de contenido (tamaños de fuente e iconos unificados, sin crecer en lg/xl).
- **Padding del overlay:** de `p-3 sm:p-4 lg:p-6` a `p-3 sm:p-4`.

**2. Tarjetas de solicitud (RequestCard)**

- Se quitaron todas las variantes `lg:` (tamaños de fuente, iconos, padding). Las tarjetas mantienen un tamaño estable en todas las resoluciones.

**3. Modal compacto (vista por defecto) y modal "Razón del rechazo"**

- Se eliminaron `lg:` y `xl:` en anchos, paddings, tamaños de texto e iconos. Anchos: modal compacto `max-w-sm sm:max-w-md`; modal rechazo `max-w-md`.
- Tamaños de fuente e iconos fijos para que no se vean sobredimensionados en pantallas pequeñas con 1080p.

**4. StatusBadge**

- De `size-5 lg:size-6 text-[10px] lg:text-xs` a `size-5 text-[10px]` fijo.

### Resultado esperado
- **Pantalla grande:** el modal sigue viéndose bien, con un ancho contenido (máx. 768px hasta 2xl, luego 896px).
- **Pantalla chica con 1920×1080:** el modal ya no ocupa la mayor parte de la pantalla ni se ve “enorme”; proporción más equilibrada y legible.

---

## 2025-02-19 – Centrado del modal Centro de Solicitudes

### Cambio realizado
- El modal "Centro de Solicitudes" (vista "Ver todas" en `SolicitudesModal.jsx`) quedó **centrado** en pantalla tanto en vertical como en horizontal en todos los tamaños de vista.
- Se eliminaron las clases `sm:items-start sm:pt-24 lg:pt-36` del contenedor del overlay del modal (componente `RequestsManager`).
- El contenedor ahora usa siempre `flex items-center justify-center`, de modo que el modal aparece centrado en cualquier resolución.

### Archivo modificado
- `client/src/components/common/SolicitudesModal.jsx`: línea del overlay del modal principal (Centro de Solicitudes).

---

## 2025-02-19 – Ajuste de diseño responsivo (Centro de Solicitudes y panel Asesor)

### Contexto del cambio
- En pantallas de mayor resolución (ej. 2160×1440, Huawei D15 ~13–14") el diseño del panel Asesor y del modal "Centro de Solicitudes" se veía correcto.
- En monitores 15.6" con resolución 1920×1080 algunos elementos (especialmente el modal de solicitudes) se veían demasiado pequeños.
- Al ajustar manualmente para pantallas grandes, el diseño se desajustaba en pantallas más pequeñas.
- Se decidió usar **Tailwind CSS** (ya presente en el proyecto) con breakpoints responsivos para que el mismo diseño escale bien en ambas situaciones sin romper en ninguna.

### Archivos modificados

#### `client/src/components/common/SolicitudesModal.jsx`

**1. Modal principal "Centro de Solicitudes" (vista "Ver todas" – `RequestsManager`)**

- **Contenedor del overlay**
  - `p-4` → `p-3 sm:p-4 lg:p-6` para más espacio en pantallas grandes.
  - El modal se mantiene centrado con `items-center justify-center` (véase entrada "Centrado del modal Centro de Solicitudes").

- **Contenedor del modal**
  - `max-w-3xl` → `max-w-3xl lg:max-w-4xl xl:max-w-5xl` para que en 1080p y mayores el modal use más ancho.
  - `max-h-[75vh]` → `max-h-[80vh] lg:max-h-[85vh]` para aprovechar mejor la altura en pantallas grandes.
  - `rounded-[2rem]` → `rounded-2xl lg:rounded-[2rem]` para mantener proporción en móvil.

- **Encabezado**
  - Icono: `size-10` → `size-10 lg:size-12`; icono interno `size-5` → `size-5 lg:size-6`.
  - Título: `text-lg` → `text-lg lg:text-xl xl:text-2xl`.
  - Subtítulo "Área: ...": `text-xs` → `text-xs lg:text-sm`.
  - Padding: `px-6 py-4` → `px-4 sm:px-6 lg:px-8 py-4 lg:py-5`.
  - Botón "Vista Simple": `text-xs` → `text-xs lg:text-sm`, `px-3 py-1.5` → `lg:px-4 lg:py-2`.
  - Botón cerrar: `size-8` → `size-8 lg:size-10`, icono `size-6` → `size-5 lg:size-6`.

- **Pestañas (Pendientes / Aprobadas / Rechazadas)**
  - Contenedor: `px-6 py-3` → `px-4 sm:px-6 lg:px-8 py-3 lg:py-4`.
  - Botones: `text-xs` → `text-xs lg:text-sm`, `px-3 py-1.5` → `lg:px-4 lg:py-2`.
  - Número en badge: `text-[10px]` → `text-[10px] lg:text-xs`.
  - Añadido `shrink-0` para evitar que se compriman.

- **Área de contenido**
  - Padding: `p-4 sm:p-6` → `p-4 sm:p-6 lg:p-8`.
  - Estado vacío ("Sin resultados"): icono `size-16` → `size-16 lg:size-20`, texto principal `text-sm` → `text-sm lg:text-base xl:text-lg`, texto secundario `text-xs` → `text-xs lg:text-sm`, más padding vertical `py-10 lg:py-14`.
  - Grid de cards: `gap-4` → `gap-4 lg:gap-6`.
  - Skeleton de carga: `h-32` → `h-32 lg:h-36`, `gap-4` → `gap-4 lg:gap-6`.

**2. Tarjetas de solicitud (`RequestCard`)**

- Contenedor: `p-5` → `p-4 sm:p-5 lg:p-6`, `rounded-3xl` → `rounded-2xl lg:rounded-3xl`.
- Avatar: `size-12` → `size-11 sm:size-12 lg:size-14`, texto `text-lg` → `text-base lg:text-lg`.
- Nombre: `text-base` → `text-sm sm:text-base lg:text-lg` y `truncate` para nombres largos.
- Email: `text-xs` → `text-xs lg:text-sm`.
- Fecha "Solicitado": `text-xs` / `text-sm` → `text-xs lg:text-sm` y `text-sm lg:text-base`.
- Badges de área y tipo: `text-xs` → `text-xs lg:text-sm`, padding ajustado con `lg:`.
- Botones Aprobar/Rechazar: `text-xs` → `text-xs lg:text-sm`, `py-2.5` → `py-2.5 lg:py-3`, iconos `size-4` → `size-4 lg:size-5`.
- Estado aprobado/rechazado: `text-sm` → `text-sm lg:text-base`, `p-3` → `p-3 lg:p-4`, iconos `size-5` → `size-5 lg:size-6`.
- Añadidos `min-w-0`, `truncate` y `shrink-0` donde corresponde para evitar desbordes.

**3. Modal compacto (vista por defecto, sin "Ver todas")**

- Overlay: `p-4` → `p-3 sm:p-4 lg:p-6`.
- Contenedor: `max-w-sm` → `max-w-sm lg:max-w-md xl:max-w-lg`, `rounded-[1.5rem]` → `rounded-xl lg:rounded-[1.5rem]`.
- Encabezado: icono `h-9 w-9` → `h-9 w-9 lg:h-10 lg:w-10`, `text-sm` → `text-sm lg:text-base`, subtítulo `text-[10px]` → `text-[10px] lg:text-xs`, badge de cantidad con `lg:h-5 lg:min-w-5` y `lg:text-xs`, padding `px-4 py-3` → `px-4 lg:px-5 py-3 lg:py-4`.
- Botones de estado (íconos): `size-8` → `size-8 lg:size-9`, iconos `size-4` → `size-4 lg:size-5`.
- "Ver todas": `text-[10px]` → `text-[10px] lg:text-xs`, `px-3 py-1.5` → `lg:px-4 lg:py-2`.
- Lista: `max-h-[420px]` → `max-h-[420px] lg:max-h-[480px]`, textos de ítems `text-[11px]` → `text-[11px] lg:text-sm`, `text-[9px]` → `text-[9px] lg:text-xs`, avatares `size-8` → `size-8 lg:size-10`, botones de acción `size-8` → `size-8 lg:size-9`.
- Estado vacío y carga: iconos y textos con variantes `lg:`.

**4. Componente `StatusBadge` (P/A/R)**

- `size-5` → `size-5 lg:size-6`, `text-[10px]` → `text-[10px] lg:text-xs`.

**5. Modal "Razón del rechazo"**

- Overlay: `p-4` → `p-4 lg:p-6`.
- Contenedor: `max-w-md` → `max-w-md lg:max-w-lg`, `rounded-[1.5rem]` → `rounded-xl lg:rounded-[1.5rem]`.
- Encabezado: `text-lg` → `text-base sm:text-lg lg:text-xl`, padding `px-6 py-4` → `px-5 sm:px-6 lg:px-8 py-4 lg:py-5`, botón cerrar `size-8` → `size-8 lg:size-10`.
- Cuerpo: `p-6` → `p-5 sm:p-6 lg:p-8`, textarea con `p-3 lg:p-4`, `text-sm lg:text-base`, `min-h-[100px] lg:min-h-[120px]`.
- Pie: mismo padding que encabezado, botones con `text-sm lg:text-base` y `lg:px-5 lg:py-2.5`.

### Criterios de diseño aplicados

- **Breakpoints Tailwind usados:** `sm` (640px), `lg` (1024px), `xl` (1280px). En viewports ≥1024px (típico 1920×1080 o 2160×1440) se aplican tamaños de fuente, iconos y espaciados mayores.
- **Sin romper pantallas pequeñas:** en móvil y tablet se mantienen los tamaños base; solo se añaden clases con prefijo `lg:` o `xl:` para escalar hacia arriba.
- **Misma estructura:** no se cambió la lógica ni el flujo del componente; solo clases de utilidad de Tailwind para que el mismo diseño sea legible y usable en 1080p y en resoluciones mayores.

### Resultado esperado

- En **1920×1080 (15.6")**: modal más ancho, textos e iconos más grandes, mejor lectura sin zoom.
- En **2160×1440** (Huawei D15): se mantiene o mejora la proporción con las mismas clases responsivas.
- En **pantallas pequeñas** (móvil/tablet): sin cambios negativos; el diseño base se conserva.

### Nota técnica

- El proyecto ya utiliza **Tailwind CSS v4** (`tailwindcss` y `@tailwindcss/vite` en `client/package.json`). No se añadieron dependencias; solo se utilizan clases responsivas estándar de Tailwind.
