import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBootstrapStatus, adminBootstrapRegister } from '../../api/usuarios';

export default function SetupAdmin() {
  const [needs, setNeeds] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ usuario: '', contraseña: '', nombre: '', email: '', telefono: '' });
  const [foto, setFoto] = useState(null);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getBootstrapStatus();
        setNeeds(Boolean(data?.needsBootstrap));
      } catch (e) {
        setNeeds(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      // Enviar llaves alternativas para mejor compatibilidad
      if (form.contraseña) {
        fd.append('contrasena', form.contraseña);
        fd.append('password', form.contraseña);
      }
      if (foto) fd.append('foto', foto);
  const { data } = await adminBootstrapRegister(fd);
  setMsg({ ok: true, text: `Administrador creado: ${data?.usuario?.usuario}` });
  // Redirigir al panel admin tras creación y auto-login
  setTimeout(() => navigate('/administrativo'), 600);
    } catch (err) {
      const text = err?.response?.data?.message || 'No se pudo crear el admin';
      setMsg({ ok: false, text });
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando…</div>;
  if (!needs) return (
    <div className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur rounded-xl text-center">
      <h2 className="text-xl font-semibold">Sistema configurado</h2>
      <p className="text-gray-600 mt-2">Ya existe al menos un administrador.</p>
      <a className="text-indigo-600 underline mt-3 inline-block" href="/login">Ir al login</a>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white/90 backdrop-blur rounded-xl shadow">
      <h2 className="text-xl font-bold mb-3">Configuración inicial</h2>
      <p className="text-sm text-gray-600 mb-4">Crea el primer administrador (solo disponible cuando aún no existe uno).</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={onChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm">Usuario</label>
          <input name="usuario" value={form.usuario} onChange={onChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm">Correo</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm">Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Contraseña</label>
          <input type="password" name="contraseña" value={form.contraseña} onChange={onChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm">Foto (opcional)</label>
          <input type="file" accept="image/*" onChange={(e)=> setFoto(e.target.files?.[0]||null)} />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Crear administrador</button>
      </form>

      {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>{msg.text}</p>}
      <p className="text-xs text-gray-500 mt-3">Tras crear el primer admin, ve a <a className="underline" href="/login">Login</a>.</p>
    </div>
  );
}
