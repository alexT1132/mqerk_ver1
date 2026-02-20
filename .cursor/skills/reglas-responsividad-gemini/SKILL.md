---
name: reglas-responsividad-gemini
description: Reglas de diseño responsivo optimizadas para el agente Antigraviity (Gemini). Incluye directivas MANDATORIAS sobre viewports, modales y tarjetas, además de reglas específicas para componentes de IA.
---

# Responsividad en React + Tailwind (Reglas para Antigravity)

## 🚨 MANDATORY RULES FOR AI AGENT

When generating or modifying UI components in this project, you **MUST** adhere to these rules:

1.  **Viewport Logic**: NEVER use physical resolution (e.g., "1920x1080") as a reference. ALWAYS design for logical viewport width (`window.innerWidth` or Tailwind breakpoints).
2.  **Mobile-First**: Start with base classes for mobile and use `xs:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:` overrides for larger screens.
3.  **Balanced Cards**: Ensure all 'card' components use `aspect-square` or `min-h` + `max-w` to prevent "tower" (too tall/narrow) or "strip" (too wide/short) layouts.
4.  **Fluid Typography**: Use `clamp()` for headings to avoid jumpy resizing.
5.  **Modal Constraints**: Limit max-width of modals to prevent them from stretching too wide on large screens. See specific rules below.

## 📱 BREAKPOINTS REFERENCE

Use these breakpoints to target specific device ranges:

| Class Prefix | Min Width | Target Devices |
| :--- | :--- | :--- |
| **(base)** | 0px | Small Mobile (iPhone SE, old Androids) |
| **xs:** | 480px | Large Mobile / Phablets |
| **sm:** | 640px | Landscape Mobile, Small Tablets (iPad Mini - Portrait) |
| **md:** | 768px | Tablets (iPad Mini - Landscape, iPad Air - Portrait) |
| **lg:** | 1024px | Large Tablets (iPad Pro), Small Laptops |
| **xl:** | 1280px | Standard Laptops, Desktops |
| **2xl:** | 1536px | Large Monitors, Ultra-Wide |

**Note:** Ensure `xs` is configured in `tailwind.config.js` if not already present (`'xs': '480px'`).

## 🛑 SPECIFIC COMPONENT RULES

### AI Modals (`GeneradorIAModal`, `QuizIAModal`)
**Target Files:**
- `client/src/components/Asesor/simGen/GeneradorIAModal.jsx`
- `client/src/components/Asesor/simGen/QuizIAModal.jsx`

**Sizing Logic:**
*   **Base Width (< 1536px)**: `max-w-2xl` (Current default).
*   **Large Screens (≥ 1536px / 2xl)**: MUST expand to `2xl:max-w-4xl`.
*   **Ultra-Wide (≥ 1800px)**: MUST expand to `min-[1800px]:max-w-5xl`.
*   **Height**: Use `max-h-[75vh]` base, `2xl:max-h-[85vh]`.

**Required ClassName Pattern:**
```jsx
className="... w-full max-w-2xl 2xl:max-w-4xl min-[1800px]:max-w-5xl max-h-[75vh] 2xl:max-h-[85vh] ..."
```

**EXCEPTION**: The inline modal in `client/src/components/Asesor/SimuladoresGen.jsx` MUST remain `max-w-xl`. DO NOT apply the expansion rules to it.

## 📐 IMPLEMENTATION PATTERNS

### Responsive Grid
```jsx
<div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* items */}
</div>
```

### Balanced Card (Standard)
```jsx
<article className="flex flex-col aspect-square w-full max-w-[420px] mx-auto rounded-2xl sm:rounded-3xl p-6 bg-white shadow-lg">
  {/* Content */}
</article>
```

### Balanced Card (Alternative for variable content)
```jsx
<div className="w-full max-w-[380px] mx-auto min-h-[220px] flex flex-col rounded-2xl ...">
  {/* Content */}
</div>
```

### Fluid Typography
```jsx
<h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold">Título</h1>
<p className="text-[clamp(0.9rem,1.2vw,1.1rem)]">Texto de cuerpo</p>
```

## ✅ VERIFICATION CHECKLIST

Before completing a task involving UI:
1.  [ ] Did I use `xs:`/`sm:`/`md:`/`lg:`/`xl:`/`2xl:` breakpoints correctly to cover mobile, tablet, and desktop?
2.  [ ] Are modals constrained properly (checking for the specific AI Modal rules)?
3.  [ ] Are cards balanced (not warped)?
4.  [ ] Is typography readable on both mobile (375px) and desktop (1920px+)?
