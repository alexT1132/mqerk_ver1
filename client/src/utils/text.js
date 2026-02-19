/**
 * Convierte un valor a string seguro para mostrar como título o texto en UI.
 * Evita que se muestre "[object Object]" o "Object" cuando el backend envía un objeto
 * (ej. title: { es: "Título" } o notification.title como objeto).
 * @param {*} val - Valor que puede ser string, object con .es/.nombre/.title, o null/undefined
 * @returns {string}
 */
export function toDisplayTitle(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object' && val !== null) {
    const s = val.title ?? val.titulo ?? val.nombre ?? val.name ?? val.es ?? val.text ?? val.message;
    if (typeof s === 'string') return s.trim();
  }
  return String(val);
}
