import React, { useEffect, useState } from "react";

/* --- Uploader de avatar (simple, con preview) --- */
function AvatarUploader({ value, onChange }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(typeof value === "string" ? value : "");
  }, [value]);

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Sube una imagen (png, jpg, webp).");
      return;
    }
    onChange?.(f);
  };

  return (
    <div className="relative h-28 w-28 md:h-32 md:w-32">
      <img
        src={
          preview ||
          "https://api.iconify.design/solar:user-bold.svg?color=%23cbd5e1"
        }
        alt="Foto de perfil"
        className={`h-full w-full rounded-full object-cover ring-4 ring-white shadow ${
          preview ? "" : "p-6 bg-slate-100"
        }`}
      />
      <label
        className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white shadow cursor-pointer hover:opacity-95"
        title="Cambiar foto"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M7 7l1-2h8l1 2M5 7l-1 12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L19 7" />
          <path d="M12 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
        Cambiar
        <input type="file" accept="image/*" className="sr-only" onChange={handlePick} />
      </label>
    </div>
  );
}

/* --- Página --- */
export default function AccountSettings() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    birth: "",
    avatar: "", // File o URL
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    // aquí mandarías form + avatar (si es File) con FormData a tu API
    setTimeout(() => setSaving(false), 800);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="relative mb-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-b from-indigo-500 to-blue-600 text-white shadow">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                Configuración de Cuenta
              </h1>
              <p className="text-slate-500 text-sm">
                Personaliza tu perfil, preferencias y seguridad.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Tarjeta: Información personal */}
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-200">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v6H4z" />
                <path d="M8 14h8" />
                <path d="M6 18h12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Información Personal
              </h2>
              <p className="text-slate-500 text-sm">Tu perfil público</p>
            </div>
          </div>

          <AvatarUploader value={form.avatar} onChange={(f) => update("avatar", f)} />
        </div>

        {/* Campos */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Nombre Completo</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nombre y apellidos"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </label>

          <label className="grid gap-1 md:col-span-1">
            <span className="text-sm text-slate-700">Correo Electrónico</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="correo@dominio.com"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Teléfono</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Ej. 2811975587"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-slate-700">Fecha de Nacimiento</span>
            <input
              type="date"
              value={form.birth}
              onChange={(e) => update("birth", e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </label>

          {/* fila completa opcional */}
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-slate-700">Biografía (opcional)</span>
            <textarea
              rows={3}
              value={form.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Cuéntanos algo sobre ti…"
              className="resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
          </label>
        </div>

        {/* Footer del form (en móvil fija abajo si quieres) */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
