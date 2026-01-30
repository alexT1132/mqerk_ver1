import React, { useState } from 'react';
import { adminRegisterRequest } from '../../api/usuarios';

export default function RegistroAdmin() {
  const [form, setForm] = useState({ usuario: '', contraseña: '', nombre: '', email: '', telefono: '' });
  const [foto, setFoto] = useState(null);
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (foto) fd.append('foto', foto);
      const { data } = await adminRegisterRequest(fd);
      setStatus({ ok: true, msg: `Admin creado: ${data?.usuario}` });
      setForm({ usuario: '', contraseña: '', nombre: '', email: '', telefono: '' });
      setFoto(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al registrar';
      setStatus({ ok: false, msg });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Registro de Administrador</h2>
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
          <label className="block text-sm">Contraseña</label>
          <input type="password" name="contraseña" value={form.contraseña} onChange={onChange} className="w-full border rounded p-2" required />
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
          <label className="block text-sm">Foto (opcional)</label>
          <input type="file" accept="image/*" onChange={(e)=> setFoto(e.target.files?.[0]||null)} />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Registrar</button>
      </form>
      {status && (
        <p className={`mt-3 text-sm ${status.ok ? 'text-green-700' : 'text-red-700'}`}>{status.msg}</p>
      )}
    </div>
  );
}
