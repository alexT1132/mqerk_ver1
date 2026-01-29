import fs from "fs/promises";
import path from "path";

export function publicUrlToDiskPath(publicUrl) {
  try {
    if (!publicUrl) return null;
    const url = new URL(publicUrl, "http://dummy"); // base para URLs relativas
    // Aceptamos solo rutas que comienzan con /uploads
    if (!url.pathname.startsWith("/uploads/")) return null;

    const root = process.cwd(); // raíz del proyecto backend
    return path.join(root, url.pathname);
  } catch {
    return null;
  }
}

/** fs.unlink envuelto para no explotar si no existe */
export async function safeUnlink(absPath) {
  try {
    await fs.unlink(absPath);
  } catch (e) {
    // Ignora ENOENT (archivo no existe)
    if (e && e.code !== "ENOENT") throw e;
  }
}
