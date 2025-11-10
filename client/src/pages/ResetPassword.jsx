import React, { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from '../api/axios.js';

export default function ResetPassword() {
  const location = useLocation();
  const initialToken = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('token') || '';
    } catch { return ''; }
  }, [location.search]);

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'working', message: '' });
    if (!token) return setStatus({ state: 'error', message: 'Falta el token de recuperación' });
    if (!password || password.length < 6) return setStatus({ state: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    if (password !== confirm) return setStatus({ state: 'error', message: 'Las contraseñas no coinciden' });
    try {
      await axios.post('/password/reset', { token, newPassword: password });
      setStatus({ state: 'done', message: 'Listo. Tu contraseña fue actualizada.' });
      setPassword(''); setConfirm('');
    } catch (e) {
      const msg = e?.response?.data?.message || 'No se pudo restablecer la contraseña';
      setStatus({ state: 'error', message: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e0722] via-[#0b0b24] to-[#37148a] text-white p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/10">
        <h1 className="text-2xl font-semibold text-center mb-1">Restablecer contraseña</h1>
        <p className="text-sm text-center text-zinc-300 mb-6">Ingresa el token (si no aparece) y tu nueva contraseña.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Token</label>
            <input
              type="text"
              value={token}
              onChange={e=>setToken(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/80 text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Pega aquí el token si no aparece"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/80 text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={e=>setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/80 text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Repite tu nueva contraseña"
            />
          </div>
          <button type="submit" disabled={status.state==='working'} className="w-full py-2.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-colors font-medium">
            {status.state==='working' ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-4 text-sm ${status.state==='error' ? 'text-red-300' : 'text-emerald-300'}`}>{status.message}</div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-300 hover:text-indigo-200">Volver a iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
