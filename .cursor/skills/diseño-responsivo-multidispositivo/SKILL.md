---
name: diseño-responsivo-multidispositivo
description: Aplica principios de diseño ligero, responsivo y proporcional en todas las modificaciones. Considera pantallas grandes, mapeo de resoluciones y dispositivos (Mac, laptops, iPad, tablets, iPhone, Android, escritorio). Garantiza que el contenido aproveche y se ajuste a todas las pantallas sin dejar huecos ni espacios vacíos a los lados. Usar cuando se modifiquen layouts, componentes UI, páginas o cualquier elemento visual.
---

# Diseño Responsivo Multidispositivo

## Cuándo usar este skill

- Modificar layouts, componentes, páginas o cualquier elemento visual.
- Crear nuevas vistas o interfaces.
- Ajustar estilos, grids, contenedores o espaciados.
- Trabajar en diseño que deba verse bien en múltiples dispositivos.

---

## Principios fundamentales

1. **Diseño cuidado**: Mantener coherencia visual, jerarquía clara y estética limpia.
2. **Ligereza**: Evitar elementos pesados, animaciones excesivas o contenido que degrade rendimiento.
3. **Responsividad**: Todo debe adaptarse fluidamente al viewport sin romperse ni desproporcionarse.
4. **Proporcionalidad**: Elementos equilibrados en todas las resoluciones.
5. **Aprovechamiento del espacio**: Sin huecos ni espacios vacíos a los lados; el contenido debe llenar el ancho disponible de forma inteligente.

---

## Mapeo de dispositivos y resoluciones

| Dispositivo | Viewport típico (lógico) | Consideraciones |
|-------------|--------------------------|-----------------|
| iPhone SE / mini | 375px | Móvil pequeño, una columna, botones grandes |
| iPhone estándar | 390–430px | Móvil estándar |
| Android móvil | 360–412px | Similar a iPhone |
| iPad / tablet vertical | 768px | 2 columnas posibles, más espacio |
| iPad / tablet horizontal | 1024px | Layout amplio, sidebars |
| MacBook 13" / laptop pequeña | 1280–1440px | Escala del sistema aplicada |
| MacBook 14–16" / laptop estándar | 1440–1728px | Pantalla principal de trabajo |
| iMac / escritorio | 1920–2560px | Mucho espacio horizontal |
| Monitores 4K / ultra-wide | 2560–3840px | Evitar contenido centrado con márgenes enormes |

> **Importante**: Usar siempre el **viewport lógico** (`window.innerWidth`), no la resolución física. Una laptop 13" a 1920×1080 puede tener viewport ~960px si el sistema escala al 200%.

---

## Regla crítica: sin huecos ni espacios vacíos

> ⚠️ El contenido **no debe** quedar centrado con grandes márgenes blancos a los lados en pantallas grandes.

### Qué hacer

- **Contenedores principales**: Usar `w-full` o `min-w-full` para ocupar el ancho disponible.
- **Grids y layouts**: Que se expandan con `flex-1`, `min-w-0`, o columnas que crezcan (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- **Márgenes laterales**: Solo los necesarios para legibilidad (`max-w-7xl mx-auto px-4`), no fijos que dejen huecos.
- **Contenido fluido**: Usar `min-w-0` en flex children para evitar overflow y permitir que se compriman.

### Qué evitar

- Contenedores con `max-w` muy pequeño que dejen bandas vacías en monitores grandes.
- Layouts centrados con `max-w-2xl` en páginas que deberían usar todo el ancho.
- `margin: 0 auto` con ancho fijo que no escale.

### Patrón recomendado para páginas full-width

```jsx
<div className="w-full min-w-0">
  <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
    {/* Contenido que usa todo el ancho hasta 1920px */}
  </div>
</div>
```

---

## Breakpoints y escalado

| Breakpoint | Min width | Dispositivos típicos |
|------------|-----------|----------------------|
| base | — | Móviles pequeños |
| sm | 480px | Móviles estándar |
| md | 768px | Tablets verticales |
| lg | 1024px | Tablets horizontales, laptops pequeñas |
| xl | 1280px | Laptops estándar |
| 2xl | 1536px | Monitores grandes |
| 4k / min-[1920px] | 1920px | Escritorio, 4K |

Aplicar estilos progresivos: base para móvil, luego `sm:`, `md:`, `lg:`, `xl:`, `2xl:` para pantallas mayores.

---

## Checklist antes de entregar

- [ ] ¿El layout se ve bien en móvil (375px), tablet (768px) y escritorio (1280px+)?
- [ ] ¿Hay huecos o espacios vacíos innecesarios a los lados en pantallas grandes?
- [ ] ¿El contenido aprovecha el ancho disponible de forma proporcional?
- [ ] ¿Los elementos son ligeros (sin animaciones o assets pesados innecesarios)?
- [ ] ¿Se consideraron Mac, laptops, iPad, tablets, iPhone, Android y escritorio?
- [ ] ¿La interfaz es proporcional y no se ve desproporcionada en ninguna resolución?

---

## Relación con otros skills

Para implementación técnica con Tailwind (modales, tarjetas, tipografía fluida, breakpoints), usar el skill **reglas-responsividad**.
