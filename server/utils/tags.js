export function parseTagsToArray(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((x) => String(x));

  const s = String(input).trim();
  if (!s) return [];

  // Si viene como JSON stringify
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) return j.map((x) => String(x));
  } catch (_) { /* ignore */ }

  // Fallback: CSV
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function serializeTagsCSV(input) {
  return parseTagsToArray(input).join(",");
}
