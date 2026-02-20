import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStudent } from '../../context/StudentContext.jsx';

// Bloquea acceso a contenido académico hasta aprobación (verificacion>=2)
// Permite siempre: cursos, mis-pagos, configuracion, logout, dashboard inicial
export function AccessGuard({ allowWhilePending = false, children }) {
  const { alumno } = useAuth();
  const { isVerified, hasPaid } = useStudent();
  const verificacion = Number(alumno?.verificacion ?? 0);
  const approved = verificacion >= 2 || (isVerified && hasPaid);

  if (approved || allowWhilePending) return children;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-11/12 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-2/5 max-w-[90vw] bg-white border border-amber-300 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-10 text-center mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-amber-700 mb-3">Acceso restringido</h2>
        <p className="text-amber-800 font-medium mb-4">Tu comprobante aún no ha sido aprobado.</p>
        <p className="text-sm text-amber-700 mb-6 leading-relaxed">
          Para continuar debes subir tu comprobante de pago y esperar la aprobación del equipo. Una vez aprobado se habilitarán tus actividades, simulaciones y demás recursos.
        </p>
        <div className="space-y-3">
          <a href="/alumno/mis-pagos" className="block w-full py-3 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors">Ir a Mis Pagos</a>
          <a href="/alumno/cursos" className="block w-full py-3 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">Seleccionar Curso</a>
        </div>
        <p className="text-xs text-amber-600 mt-6">Si ya enviaste tu comprobante, la revisión puede tardar unos minutos.</p>
      </div>
    </div>
  );
}
