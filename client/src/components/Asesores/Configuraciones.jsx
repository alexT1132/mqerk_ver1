import {
  UserRound,
  Camera,
  ShieldCheck,
  LockKeyhole,
  AlertTriangle,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  // Estado mínimo de ejemplo (integra aquí tu store / API)
  const [form, setForm] = useState({
    name: "Cesar Laguna",
    email: "cesar@gmail.com",
    phone: "2811975587",
    birthday: "2000-11-01",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // súbelo a tu backend y actualiza preview
    console.log("Avatar seleccionado:", file.name);
  };

  const onSave = (e) => {
    e.preventDefault();
    // Lógica para persistir cambios (fetch/axios)
    console.log("Guardando...", form);
  };

  const onChangePassword = (e) => {
    e.preventDefault();
    // Validaciones + API
    console.log("Cambiando contraseña...");
  };

  const onDeleteAccount = () => {
    // Confirm + API
    if (confirm("¿Seguro que deseas eliminar permanentemente el acceso?")) {
      console.log("Acceso eliminado");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            CONFIGURACIÓN
          </span>
        </h1>
        <p className="mt-2 text-center text-slate-500">
          Personaliza tu experiencia y mantén tu cuenta segura.
        </p>
      </header>

      {/* Contenido */}
      <main className="mx-auto grid w-full gap-6 px-4 pb-32 pt-8 sm:px-6 lg:grid-cols-3 lg:gap-8 lg:px-8">
        {/* Información personal */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader
              icon={<UserRound className="h-5 w-5" />}
              title="Información Personal"
              subtitle="Tu perfil público"
            />
            <form onSubmit={onSave} className="space-y-8">
              {/* Avatar */}
              <div className="flex justify-center items-center gap-4">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"
                    alt="Avatar"
                    className="h-45 w-45 rounded-2xl object-cover shadow-sm ring-4 ring-white"
                  />
                  <label className="absolute -right-2 -bottom-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow ring-1 ring-slate-200 hover:bg-white">
                    <Camera className="h-4 w-4" />
                    Cambiar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Campos */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nombre Completo"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
                <Field
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tucorreo@dominio.com"
                />
                <Field
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="55 0000 0000"
                />
                <Field
                  label="Fecha de Nacimiento"
                  name="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={handleChange}
                />
              </div>
            </form>
          </Card>
        </section>

        {/* Seguridad */}
        <section className="lg:col-span-1">
          <Card>
            <CardHeader
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Seguridad"
              subtitle="Protege tu cuenta"
            />
            <form onSubmit={onChangePassword} className="space-y-4">
              <Field
                label="Contraseña Actual"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña actual"
              />
              <Field
                label="Nueva Contraseña"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Nueva contraseña"
              />
              <Field
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-white shadow-sm transition hover:bg-fuchsia-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50"
              >
                <LockKeyhole className="h-4 w-4" />
                Cambiar Contraseña
              </button>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6 border-rose-200 bg-rose-50/60">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-rose-600 shadow ring-1 ring-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-rose-700">Zona de Peligro</h3>
                <p className="text-sm text-rose-600">
                  Esta acción eliminará permanentemente tu acceso. <b>No</b> se
                  puede deshacer.
                </p>

                <button
                  onClick={onDeleteAccount}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-rose-700 shadow ring-1 ring-rose-200 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Acceso Permanentemente
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Barra Guardar Cambios */}
      <footer className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-600">
                Los cambios se guardarán de forma segura y se aplicarán
                inmediatamente.
              </p>
              <button
                onClick={onSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white shadow-md transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** ---------- UI helpers ---------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-slate-100 p-2 text-violet-600 ring-1 ring-slate-200">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-xl border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-900 shadow-sm outline-none ring-transparent transition placeholder:text-slate-400 hover:bg-white focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
      />
    </label>
  );
}
