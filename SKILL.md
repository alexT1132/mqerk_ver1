---
name: reglas-responsividad
description: Aplica reglas de diseño responsivo en React con Tailwind CSS. Usar cuando se trabaje en layouts adaptativos, modales, grids, tarjetas (cards), tipografía o cualquier componente que deba escalar según viewport lógico. Incluye proporciones de tarjetas (estilo cuadrado/equilibrado), tipografía fluida con clamp() y consistencia visual (bordes, botones, espaciado).
---

# Responsividad en React + Tailwind

## Cuándo usar este skill

- Ajustar componentes (modales, grids, **tarjetas/cards**, tipografía) para que se vean bien en distintas resoluciones y densidades de pantalla.
- Asegurar que **todas las tarjetas** tengan proporciones equilibradas (ni demasiado altas, ni largas ni angostas).
- Evitar que en pantallas chicas con alta resolución (ej. laptop 13" a 1920×1080) todo se vea desproporcionado.
- Implementar o revisar breakpoints y estilos responsivos con Tailwind.
- Validar que los layouts escalen por **viewport lógico (`window.innerWidth`)**, no por pulgadas ni resolución física.
- Aplicar tipografía fluida con `clamp()` para que los textos nunca se vean ni muy pequeños ni muy grandes.
- Mantener **consistencia visual**: bordes redondeados, botones con área táctil mínima, espaciado uniforme en grids.

---

## Regla fundamental: viewport lógico, no resolución física

> ⚠️ Nunca tomar decisiones de diseño basadas en pulgadas, DPI o resolución física (ej. 1920×1080).  
> ✅ Siempre guiarse por el **ancho lógico del viewport** (`window.innerWidth` o los breakpoints de Tailwind).

Una laptop de 13" con pantalla 1920×1080 puede tener un viewport lógico de ~960px si el sistema escala al 200%. El diseño debe responder a ese valor lógico, no al físico.

---

## Breakpoints recomendados (2026)

| Breakpoint | Min width | Uso típico |
|------------|-----------|------------|
| base       | —         | móviles muy pequeños (< 480px) |
| sm         | 480px     | móviles estándar |
| md         | 768px     | tablets verticales |
| lg         | 1024px    | tablets horizontales / laptops pequeñas |
| xl         | 1280px    | laptops estándar |
| 2xl        | 1536px    | monitores grandes |
| 4k         | 1920px    | ultra-wide / 4K |

Tailwind usa por defecto `sm: 640px`. Si el proyecto requiere `480px`, definirlo en `tailwind.config.js` (ver sección de configuración).

---

## Principios clave

1. **Mobile-first:** estilos base para móvil; sobreescribir con `sm:`, `md:`, `lg:` hacia pantallas mayores.
2. **Viewport lógico manda:** nunca usar resolución física ni pulgadas como referencia.
3. **Limitar tamaño de modales y paneles:** usar `max-w-[min(48rem,90vw)]` para que no crezcan sin control en pantallas grandes.
4. **Unidades relativas:** preferir `rem`, `%`, `vh`/`vw` para tipografía y spacing.
5. **Tipografía fluida con `clamp()`:** evita saltos bruscos de tamaño entre breakpoints.
6. **Tarjetas equilibradas:** todas las tarjetas deben tener proporciones cuadrado/equilibradas (no demasiado altas, largas ni angostas); ver sección Tarjetas.
7. **Consistencia visual:** bordes redondeados unificados (`rounded-2xl`/`rounded-3xl`), botones con área táctil mínima (~44px), espaciado uniforme en grids (`gap-4`/`gap-6`).
8. **Validación:** usar el "responsive design mode" del navegador para probar layouts en distintos viewports.

---

## Patrones de uso

### Clases por breakpoint

```jsx
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-base md:text-lg lg:text-xl">Título</h1>
</div>
```

### Modal que no ocupe toda la pantalla en laptops 1080p

```jsx
<div className="w-full max-w-[min(48rem,90vw)] max-h-[78vh] overflow-y-auto">
  {/* Contenido del modal */}
</div>
```

### Grid responsivo

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* items */}
</div>
```

### Tarjetas (cards): proporciones equilibradas

> **Regla:** Todas las tarjetas deben tener un **estilo cuadrado o equilibrado**: ni demasiado altas, ni demasiado largas ni muy angostas. Evitar tarjetas tipo “tira” (muy anchas y bajas) o “torre” (muy altas y estrechas).

- **Proporción recomendada:** usar `aspect-square` para tarjetas de área/módulo, o controlar con `aspect-[4/3]` / `min-h` + `max-w` para que la relación alto/ancho sea coherente.
- **Ancho máximo por tarjeta:** en grids de varias columnas, limitar el ancho de cada card con `max-w-[320px]` a `max-w-[420px]` y `mx-auto` si hace falta, para que en pantallas anchas no se estiren demasiado.
- **Altura:** si no se usa `aspect-*`, definir `min-h` razonable (ej. `min-h-[200px]` a `min-h-[260px]`) y evitar `min-h` excesivos que generen tarjetas muy altas en una sola columna.

**Ejemplo — tarjeta cuadrada (área/módulo):**

```jsx
<article
  className={[
    "flex flex-col aspect-square overflow-hidden w-full max-w-[420px] mx-auto",
    "rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6",
    "bg-white border-2 shadow-lg hover:shadow-2xl transition-all duration-300",
  ].join(" ")}
>
  {/* icono, título, descripción */}
</article>
```

**Ejemplo — grid de tarjetas equilibradas:**

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
  {items.map((item) => (
    <div key={item.id} className="w-full max-w-[380px] mx-auto min-h-[220px] flex flex-col rounded-2xl ...">
      {/* contenido */}
    </div>
  ))}
</div>
```

**Qué evitar:** tarjetas con solo `min-h` muy alto sin `max-w` ni `aspect-*` (quedan torres en móvil); tarjetas en una sola columna que ocupan el 100% del ancho con poco contenido (tiras largas y bajas).

**Referencia en el proyecto:** `Actividades.jsx` (AreaCard con `aspect-square` + `max-w-[420px]`), `UnifiedCard.jsx` (minHeight + `rounded-2xl`/`rounded-3xl`). Al crear o modificar tarjetas, alinear con estos patrones.

### Botones y áreas táctiles

- **Mínimo recomendado:** altura/anchura efectiva ≥ 44px para elementos clicables (accesibilidad y uso táctil). Ejemplo: `min-h-[44px] min-w-[44px]` o `p-3` (12px × 2 + contenido).
- En móvil, preferir botones con `py-3 px-4` o superior para que no queden demasiado pequeños.

### Bordes redondeados consistentes

- **Tarjetas y paneles:** `rounded-2xl` en móvil, `sm:rounded-3xl` en pantallas mayores (alineado con `UnifiedCard` y `AreaCard` del proyecto).
- **Botones:** `rounded-xl` o `rounded-2xl`; evitar mezclar `rounded-full` con `rounded-lg` sin criterio.
- **Modales:** mismo criterio que tarjetas (`rounded-2xl` / `rounded-3xl`).

### Sidebar + contenido principal

```jsx
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64 shrink-0">...</aside>
  <main className="flex-1 min-w-0">...</main>
</div>
```

---

## Tipografía fluida con `clamp()`

`clamp(min, preferred, max)` permite que el texto escale de forma fluida entre un tamaño mínimo y máximo según el viewport, sin depender de breakpoints discretos.

### Fórmula general

```
clamp(tamaño-mínimo, valor-fluido, tamaño-máximo)
```

El valor fluido usa unidades `vw` para que el texto crezca con el viewport:

```
preferred = calc(tamaño-base + (diferencia * ((100vw - vp-min) / (vp-max - vp-min))))
```

### Escala tipográfica recomendada

| Rol          | clamp                              |
|--------------|------------------------------------|
| h1           | `clamp(1.75rem, 4vw, 3rem)`        |
| h2           | `clamp(1.4rem, 3vw, 2.25rem)`      |
| h3           | `clamp(1.15rem, 2.5vw, 1.75rem)`   |
| body / p     | `clamp(0.9rem, 1.2vw, 1.1rem)`     |
| small / hint | `clamp(0.75rem, 1vw, 0.875rem)`    |

### Uso en Tailwind con clases arbitrarias

```jsx
<h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold">Título principal</h1>
<p className="text-[clamp(0.9rem,1.2vw,1.1rem)] leading-relaxed">Párrafo</p>
```

### Uso con CSS custom properties (alternativa)

```css
/* globals.css */
:root {
  --text-h1: clamp(1.75rem, 4vw, 3rem);
  --text-body: clamp(0.9rem, 1.2vw, 1.1rem);
}
```

```jsx
<h1 style={{ fontSize: 'var(--text-h1)' }}>Título</h1>
```

### Cuándo NO usar clamp()

- Si el diseño tiene requisitos de accesibilidad muy estrictos (WCAG AA en tamaños mínimos), verificar que el mínimo nunca quede por debajo de `0.875rem` (~14px).
- En textos de UI pequeños (labels, badges), preferir tamaños fijos con `text-xs` / `text-sm` ya que `clamp()` puede hacerlos ilegibles en viewports muy chicos.

---

## Configuración opcional en Tailwind

Si el proyecto necesita breakpoints distintos a los defaults de Tailwind:

```js
// tailwind.config.js
theme: {
  screens: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '4k': '1920px',
  },
},
```

> Nota: definir `screens` dentro de `theme` (no `theme.extend`) **reemplaza** los valores por defecto. Usar `theme.extend.screens` si solo se quieren agregar breakpoints nuevos sin perder los defaults.

---

## Checklist antes de entregar un componente

- [ ] ¿El layout se ve bien en 375px (móvil), 768px (tablet) y 1280px (laptop estándar)?
- [ ] ¿Los modales/paneles tienen `max-w` y `max-h` definidos?
- [ ] ¿Las **tarjetas** tienen proporciones equilibradas (aspect-square o min-h + max-w) y no quedan ni tipo “tira” ni “torre”?
- [ ] ¿Las tarjetas en grid tienen `max-w` por card (ej. 320–420px) cuando hay muchas columnas?
- [ ] ¿Los botones/iconos clicables tienen área táctil ≥ 44px?
- [ ] ¿Bordes redondeados coherentes (`rounded-2xl`/`rounded-3xl` en cards y paneles)?
- [ ] ¿La tipografía usa unidades relativas (`rem`, `clamp()`) en lugar de `px` fijos?
- [ ] ¿Se validó en el responsive design mode del navegador?
- [ ] ¿No hay decisiones basadas en pulgadas o resolución física?

---

## Resumen

- Base = móvil; `sm`/`md`/`lg`/`xl`/`2xl` para escalar hacia pantallas mayores.
- **Tarjetas:** estilo cuadrado/equilibrado (aspect-square o min-h + max-w); max-w por card ~320–420px; evitar tarjetas muy altas o muy anchas y bajas.
- Limitar ancho y altura de modales/paneles para que no se vean desproporcionados en laptops 1080p.
- No depender de pulgadas ni resolución física; guiarse por el ancho lógico del viewport.
- Consistencia: bordes `rounded-2xl`/`rounded-3xl`, botones con área táctil ≥ 44px, espaciado uniforme en grids.
- Usar `clamp()` para tipografía fluida que escala sin saltos entre breakpoints.
- Usar unidades relativas y mobile-first para mantener consistencia en todas las pantallas.