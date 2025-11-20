import {
  UserRound,
  Camera,
  ShieldCheck,
  LockKeyhole,
  AlertTriangle,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getMiPerfil, updateMiPerfil, updateMiFoto } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import axios from "../../api/axios.js";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  
  // Datos del perfil
  const [perfilData, setPerfilData] = useState(null);
  
  // Formulario de información personal
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    nacimiento: "",
  });

  // Formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preview de foto
  const [photoPreview, setPhotoPreview] = useState(null);

  // Cargar datos del perfil
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getMiPerfil();
        if (!alive) return;
        
        const { perfil, preregistro } = data?.data || {};
        setPerfilData(data?.data || null);
        
        if (preregistro) {
          setForm({
            nombres: preregistro.nombres || "",
            apellidos: preregistro.apellidos || "",
            correo: preregistro.correo || "",
            telefono: preregistro.telefono || "",
            nacimiento: perfil?.nacimiento ? perfil.nacimiento.split('T')[0] : "",
          });
        }
        
        // Cargar preview de foto si existe (usar foto_url si está disponible, sino construir con doc_fotografia)
        if (perfil?.foto_url) {
          setPhotoPreview(perfil.foto_url);
        } else if (perfil?.doc_fotografia) {
          setPhotoPreview(buildStaticUrl(perfil.doc_fotografia));
        }
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando perfil');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSuccess(null);
    setError(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
    setError(null);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe exceder 5MB');
      return;
    }
    
    setUploadingPhoto(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('foto', file);
      
      const { data } = await updateMiFoto(formData);
      
      // Actualizar preview (usar foto_url si está disponible, sino construir con doc_fotografia)
      if (data?.data?.perfil?.foto_url) {
        setPhotoPreview(data.data.perfil.foto_url);
      } else if (data?.data?.perfil?.doc_fotografia) {
        setPhotoPreview(buildStaticUrl(data.data.perfil.doc_fotografia));
      }
      
      // Actualizar estado
      setPerfilData(prev => ({
        ...prev,
        perfil: data?.data?.perfil || prev?.perfil
      }));
      
      setSuccess('Foto actualizada correctamente');
      
      // Recargar datos del perfil
      const { data: refreshData } = await getMiPerfil();
      setPerfilData(refreshData?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
      // Resetear input
      e.target.value = '';
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data } = await updateMiPerfil({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        nacimiento: form.nacimiento || null,
      });
      
      setPerfilData(data?.data || perfilData);
      setSuccess('Información personal actualizada correctamente');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Todos los campos de contraseña son obligatorios');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setChangingPassword(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.put('/admin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setSuccess('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const onDeleteAccount = () => {
    // TODO: Implementar eliminación de cuenta
    if (window.confirm("¿Seguro que deseas eliminar permanentemente tu acceso?\n\nEsta acción no se puede deshacer.")) {
      setError('Funcionalidad de eliminación de cuenta no disponible aún');
    }
  };

  // Avatar URL (usar foto_url si está disponible, sino construir con doc_fotografia)
  const avatarUrl = photoPreview || (perfilData?.perfil?.foto_url 
    ? perfilData.perfil.foto_url 
    : (perfilData?.perfil?.doc_fotografia 
      ? buildStaticUrl(perfilData.perfil.doc_fotografia) 
      : "https://i.pravatar.cc/150?img=12"));

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CONFIGURACIÓN
            </span>
          </h1>
          <p className="text-slate-600">
            Personaliza tu experiencia y mantén tu cuenta segura.
          </p>
        </div>

        {/* Mensajes de éxito/error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <XCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="size-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <div className="grid w-full gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Información personal */}
            <section className="lg:col-span-2">
              <Card>
                <CardHeader
                  icon={<UserRound className="h-5 w-5" />}
                  title="Información Personal"
                  subtitle="Tu perfil público"
                />
                <form onSubmit={onSave} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex justify-center items-center">
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-2xl ring-4 ring-white shadow-lg">
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-32 w-32 sm:h-40 sm:w-40 object-cover"
                          onError={(e) => {
                            e.target.src = "https://i.pravatar.cc/150?img=12";
                          }}
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="size-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <label className="absolute -right-2 -bottom-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-all">
                        <Camera className="h-4 w-4" />
                        {uploadingPhoto ? 'Subiendo...' : 'Cambiar'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Campos */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Nombre"
                      name="nombres"
                      value={form.nombres}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      required
                    />
                    <Field
                      label="Apellidos"
                      name="apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                      placeholder="Tus apellidos"
                      required
                    />
                    <Field
                      label="Correo Electrónico"
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={handleChange}
                      placeholder="tucorreo@dominio.com"
                      required
                    />
                    <Field
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="55 0000 0000"
                    />
                    <Field
                      label="Fecha de Nacimiento"
                      name="nacimiento"
                      type="date"
                      value={form.nacimiento}
                      onChange={handleChange}
                      className="sm:col-span-2"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Card>
            </section>

            {/* Seguridad */}
            <section className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Seguridad"
                  subtitle="Protege tu cuenta"
                />
                <form onSubmit={onChangePassword} className="space-y-4">
                  <PasswordField
                    label="Contraseña Actual"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Tu contraseña actual"
                    show={showPassword.current}
                    onToggleShow={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                  />
                  <PasswordField
                    label="Nueva Contraseña"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    show={showPassword.new}
                    onToggleShow={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                  />
                  <PasswordField
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirma tu nueva contraseña"
                    show={showPassword.confirm}
                    onToggleShow={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                  />
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-4 w-4" />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </form>
              </Card>

              {/* Danger Zone */}
              <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-rose-600 shadow ring-1 ring-rose-100 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-rose-700 mb-1">Zona de Peligro</h3>
                    <p className="text-sm text-rose-600 mb-4">
                      Esta acción eliminará permanentemente tu acceso. <strong>No</strong> se puede deshacer.
                    </p>

                    <button
                      onClick={onDeleteAccount}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-rose-700 shadow ring-1 ring-rose-200 transition hover:bg-rose-100 font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar Acceso
                    </button>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/** ---------- UI helpers ---------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 p-2.5 text-violet-600 ring-1 ring-violet-200 shrink-0">
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
  required = false,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none ring-transparent transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
      />
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 pr-10 text-slate-900 shadow-sm outline-none ring-transparent transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
