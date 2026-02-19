# Reglas de responsividad (React + Tailwind)

**El skill oficial del proyecto para responsividad está en:**

**`.cursor/skills/reglas-responsividad/SKILL.md`**

El agente de Cursor usa ese skill cuando se trabaja en diseño responsivo, breakpoints, modales o layouts adaptativos con React y Tailwind. Ahí están las instrucciones concisas, principios y ejemplos.

---

## Resumen rápido (referencia humana)

- **Breakpoints:** base (móvil), `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. Opcional: definir `screens` en `tailwind.config.js`.
- **Mobile-first:** estilos base para móvil; sobreescribir con `sm:`, `md:`, `lg:`, etc.
- **Viewport lógico:** lo que importa es el ancho de ventana (p. ej. `window.innerWidth`), no pulgadas ni resolución física.
- **Modales en 1080p:** limitar ancho (ej. `max-w-[min(48rem,90vw)]`) y no abusar de escalado `lg:`/`xl:` para que no se vean enormes en pantallas chicas con alta resolución.
- **Probar** con el modo responsivo del navegador.

Para detalles, ejemplos de código y configuración, ver **`.cursor/skills/reglas-responsividad/SKILL.md`**.
