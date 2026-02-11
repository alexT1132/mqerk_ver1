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
  X,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getMiPerfil, updateMiPerfil, updateMiFoto } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import axios from "../../api/axios.js";
import ConfirmModal from "../shared/ConfirmModal.jsx";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  // Modal de notificación personalizada
  const [notificationModal, setNotificationModal] = useState({ open: false, message: '', type: 'success' }); // 'success' | 'error'
  // Modal de confirmación para eliminar cuenta
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false });

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

  // Cerrar automáticamente la modal de éxito después de 3 segundos
  useEffect(() => {
    if (notificationModal.open && notificationModal.type === 'success') {
      const timer = setTimeout(() => {
        setNotificationModal({ open: false, message: '', type: 'success' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationModal.open, notificationModal.type]);

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
        // ✅ Agregar timestamp para evitar cache al cargar inicialmente
        if (perfil?.foto_url) {
          const separator = perfil.foto_url.includes('?') ? '&' : '?';
          setPhotoPreview(`${perfil.foto_url}${separator}t=${Date.now()}`);
        } else if (perfil?.doc_fotografia) {
          const url = buildStaticUrl(perfil.doc_fotografia);
          if (url) {
            const separator = url.includes('?') ? '&' : '?';
            setPhotoPreview(`${url}${separator}t=${Date.now()}`);
          } else {
            setPhotoPreview(null);
          }
        } else {
          setPhotoPreview(null);
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
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setNotificationModal({ open: true, message: 'Solo se permiten archivos de imagen', type: 'error' });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotificationModal({ open: true, message: 'La imagen no debe exceder 5MB', type: 'error' });
      return;
    }

    // ✅ Mostrar preview inmediato antes de subir (para mejor UX)
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    setUploadingPhoto(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('foto', file);

      const { data } = await updateMiFoto(formData);

      // Recargar datos del perfil primero para obtener la URL actualizada
      const { data: refreshData } = await getMiPerfil();
      const perfilActualizado = refreshData?.data?.perfil || data?.data?.perfil;

      // ✅ Limpiar el preview temporal
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Actualizar preview con la nueva URL del servidor (agregar timestamp para evitar cache)
      let nuevaFotoUrl = null;
      if (perfilActualizado?.foto_url) {
        nuevaFotoUrl = perfilActualizado.foto_url;
      } else if (perfilActualizado?.doc_fotografia) {
        nuevaFotoUrl = buildStaticUrl(perfilActualizado.doc_fotografia);
      }

      // ✅ Agregar timestamp para forzar recarga del navegador
      if (nuevaFotoUrl) {
        const separator = nuevaFotoUrl.includes('?') ? '&' : '?';
        const urlConTimestamp = `${nuevaFotoUrl}${separator}t=${Date.now()}`;
        setPhotoPreview(urlConTimestamp);
      } else {
        setPhotoPreview(null);
      }

      // Actualizar estado con datos frescos
      setPerfilData(refreshData?.data || {
        ...perfilData,
        perfil: perfilActualizado
      });

      // ✅ Disparar evento para actualizar Topbar y otros componentes
      window.dispatchEvent(new CustomEvent('asesor-photo-updated'));

      setNotificationModal({ open: true, message: 'Foto de perfil actualizada correctamente', type: 'success' });
    } catch (e) {
      // ✅ En caso de error, limpiar el preview temporal y restaurar el anterior
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPhotoPreview(null); // Esto hará que use el avatarUrl original
      }
      setNotificationModal({ open: true, message: e?.response?.data?.message || 'Error al subir la foto', type: 'error' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar teléfono (formato mexicano o internacional básico)
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') return true; // Opcional
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!form.nombres.trim()) {
      setError('El nombre es obligatorio');
      setSaving(false);
      return;
    }

    if (!form.apellidos.trim()) {
      setError('Los apellidos son obligatorios');
      setSaving(false);
      return;
    }

    if (!form.correo.trim()) {
      setError('El correo electrónico es obligatorio');
      setSaving(false);
      return;
    }

    if (!validateEmail(form.correo.trim())) {
      setError('El formato del correo electrónico no es válido');
      setSaving(false);
      return;
    }

    if (form.telefono && !validatePhone(form.telefono.trim())) {
      setError('El formato del teléfono no es válido');
      setSaving(false);
      return;
    }

    try {
      const { data } = await updateMiPerfil({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
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
    setDeleteConfirmModal({
      isOpen: true,
      message: '¿Estás seguro de eliminar permanentemente tu acceso?',
      details: 'Esta acción no se puede deshacer. Perderás acceso a tu cuenta de forma permanente.',
      variant: 'danger',
      confirmText: 'Eliminar acceso',
      cancelText: 'Cancelar',
      onConfirm: () => {
        setError('Funcionalidad de eliminación de cuenta no disponible aún');
        setDeleteConfirmModal({ isOpen: false });
      },
      onCancel: () => setDeleteConfirmModal({ isOpen: false })
    });
  };

  // Avatar URL (usar photoPreview primero, luego foto_url, luego doc_fotografia)
  // ✅ Si hay photoPreview, usarlo directamente (ya incluye timestamp si es necesario)
  let avatarUrl = null;
  if (photoPreview) {
    avatarUrl = photoPreview;
  } else if (perfilData?.perfil?.foto_url) {
    avatarUrl = perfilData.perfil.foto_url;
  } else if (perfilData?.perfil?.doc_fotografia) {
    avatarUrl = buildStaticUrl(perfilData.perfil.doc_fotografia);
  }


  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <ShieldCheck className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-normal">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block py-2" style={{ lineHeight: '1.2' }}>
                  Configuración
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Personaliza tu experiencia y mantén tu cuenta segura
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito/error */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-3 shadow-md ring-2 ring-red-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
              <XCircle className="size-4" />
            </div>
            <span className="flex-1 font-bold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="Cerrar mensaje de error"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-700 flex items-center gap-3 shadow-md ring-2 ring-green-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="flex-1 font-bold">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors"
              aria-label="Cerrar mensaje de éxito"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Modal de notificación personalizada */}
        {notificationModal.open && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4" onClick={() => setNotificationModal({ open: false, message: '', type: 'success' })}>
            <div className="bg-black/60 backdrop-blur-sm absolute inset-0" onClick={() => setNotificationModal({ open: false, message: '', type: 'success' })}></div>
            <div
              className={`relative bg-white rounded-3xl shadow-2xl border-2 ${notificationModal.type === 'success'
                ? 'border-emerald-200 shadow-emerald-200/30'
                : 'border-rose-200 shadow-rose-200/30'
                } max-w-md w-full p-6 ring-4 ${notificationModal.type === 'success' ? 'ring-emerald-100' : 'ring-rose-100'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ring-2 ${notificationModal.type === 'success'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 ring-emerald-200'
                  : 'bg-gradient-to-br from-rose-500 to-red-600 ring-rose-200'
                  }`}>
                  {notificationModal.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-extrabold mb-1 ${notificationModal.type === 'success' ? 'text-emerald-900' : 'text-rose-900'
                    }`}>
                    {notificationModal.type === 'success' ? 'Éxito' : 'Error'}
                  </h3>
                  <p className="text-slate-700 text-sm font-medium">{notificationModal.message}</p>
                </div>
                <button
                  onClick={() => setNotificationModal({ open: false, message: '', type: 'success' })}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setNotificationModal({ open: false, message: '', type: 'success' })}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg ${notificationModal.type === 'success'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white'
                    }`}
                >
                  Aceptar
                </button>
              </div>
            </div>
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
                  <div className="flex justify-center items-center py-4">
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-3xl ring-4 ring-violet-100 shadow-xl transition-all duration-300 group-hover:ring-violet-200 group-hover:shadow-2xl">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            key={photoPreview || perfilData?.perfil?.doc_fotografia || perfilData?.perfil?.foto_url || Date.now()}
                            className="h-36 w-36 sm:h-44 sm:w-44 object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-36 w-36 sm:h-44 sm:w-44 bg-gradient-to-br from-violet-200 via-indigo-200 to-purple-200 flex items-center justify-center rounded-3xl transition-all duration-300 group-hover:from-violet-300 group-hover:via-indigo-300 group-hover:to-purple-300">
                            <UserRound className="h-20 w-20 sm:h-24 sm:w-24 text-violet-500" />
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                            <div className="text-center">
                              <Loader2 className="size-10 animate-spin text-white mx-auto mb-2" />
                              <p className="text-white text-sm font-medium">Subiendo...</p>
                            </div>
                          </div>
                        )}
                        {!uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.style.display = 'none';
                          input.onchange = (e) => {
                            handleAvatarChange(e);
                            document.body.removeChild(input);
                          };
                          document.body.appendChild(input);
                          input.click();
                        }}
                        disabled={uploadingPhoto}
                        className="absolute -right-1 -bottom-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-xl ring-4 ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      >
                        <Camera className="h-4 w-4" />
                        {uploadingPhoto ? 'Subiendo...' : 'Cambiar'}
                      </button>
                    </div>
                  </div>

                  {/* Campos */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Nombre"
                      name="nombres"
                      value={form.nombres}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      required
                      icon={User}
                    />
                    <Field
                      label="Apellidos"
                      name="apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                      placeholder="Tus apellidos"
                      required
                      icon={User}
                    />
                    <Field
                      label="Correo Electrónico"
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={handleChange}
                      placeholder="tucorreo@dominio.com"
                      required
                      icon={Mail}
                    />
                    <Field
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="55 0000 0000"
                      icon={Phone}
                    />
                    <Field
                      label="Fecha de Nacimiento"
                      name="nacimiento"
                      type="date"
                      value={form.nacimiento}
                      onChange={handleChange}
                      className="sm:col-span-2"
                      icon={Calendar}
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3.5 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-5 w-5" />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </form>
              </Card>

              {/* Danger Zone */}
              <Card className="border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-rose-100">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-3 text-white shadow-md ring-2 ring-rose-200 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-lg text-rose-800 mb-2">Zona de Peligro</h3>
                    <p className="text-sm text-rose-700 mb-5 leading-relaxed font-medium">
                      Esta acción eliminará permanentemente tu acceso. <strong className="text-rose-900">No</strong> se puede deshacer.
                    </p>

                    <button
                      onClick={onDeleteAccount}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 px-4 py-3 text-white shadow-lg ring-2 ring-rose-200 transition-all duration-200 font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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

        {/* Modal de confirmación para eliminar cuenta */}
        <ConfirmModal
          isOpen={deleteConfirmModal.isOpen}
          message={deleteConfirmModal.message}
          details={deleteConfirmModal.details}
          variant={deleteConfirmModal.variant}
          confirmText={deleteConfirmModal.confirmText}
          cancelText={deleteConfirmModal.cancelText}
          onConfirm={deleteConfirmModal.onConfirm}
          onCancel={deleteConfirmModal.onCancel}
        />
      </div>
    </div>
  );
}

/** ---------- UI helpers ---------- */


function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-slate-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5 text-white shadow-md ring-2 ring-violet-200 shrink-0 self-start">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 leading-normal">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 font-medium leading-relaxed">{subtitle}</p>}
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
  icon,
}) {
  const IconComponent = icon;

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-1.5 leading-normal">
        {IconComponent && <IconComponent className="h-4 w-4 text-violet-500 shrink-0" />}
        <span className="truncate">{label}</span>
        {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        {IconComponent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-transparent transition-all duration-200 placeholder:text-slate-400 hover:border-violet-300 hover:shadow-md focus:border-violet-500 focus:ring-4 focus:ring-violet-500/30 font-medium leading-normal ${icon ? 'pl-10' : ''}`}
        />
      </div>
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
      <span className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-1.5 leading-normal">
        <LockKeyhole className="h-4 w-4 text-violet-500 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-slate-900 shadow-sm outline-none ring-transparent transition-all duration-200 placeholder:text-slate-400 hover:border-violet-300 hover:shadow-md focus:border-violet-500 focus:ring-4 focus:ring-violet-500/30 font-medium leading-normal"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-violet-600 transition-colors rounded-r-xl"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
