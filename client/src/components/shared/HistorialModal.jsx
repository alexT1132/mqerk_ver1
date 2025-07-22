import React from 'react';
import { FileText } from 'lucide-react'; // Asumiendo que usas lucide-react para los iconos

const HistorialModal = ({ simulacion, historial, onClose }) => {
  if (!simulacion) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 pb-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl min-h-fit max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col my-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold truncate">Historial de Intentos</h2>
              <p className="text-indigo-100 mt-1 text-base truncate">{simulacion.nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0 p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="text-blue-600 text-sm font-medium">Total de Intentos</div>
              <div className="text-2xl font-bold text-blue-800">{historial.totalIntentos}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="text-green-600 text-sm font-medium">Mejor Puntaje</div>
              <div className="text-2xl font-bold text-green-800">{historial.mejorPuntaje}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="text-purple-600 text-sm font-medium">Promedio de Tiempo</div>
              <div className="text-2xl font-bold text-purple-800">
                {Math.round(historial.promedioTiempo || 0)} min
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="text-orange-600 text-sm font-medium">Último Intento</div>
              <div className="text-sm font-bold text-orange-800">
                {historial.intentos.length > 0 
                  ? new Date(historial.intentos[historial.intentos.length - 1].fecha).toLocaleDateString('es-ES')
                  : 'N/A'
                }
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Historial Detallado ({historial.intentos.length} intentos)
            </h3>
            
            {historial.intentos.length > 0 ? (
              <div className="max-h-80 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  {[...historial.intentos].reverse().map((intento, index) => (
                    <div
                      key={intento.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {historial.intentos.length - index}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-base">
                            Intento {historial.intentos.length - index}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {new Date(intento.fecha).toLocaleDateString('es-ES')} a las{' '}
                            {new Date(intento.fecha).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            intento.puntaje === historial.mejorPuntaje 
                              ? 'text-green-600' 
                              : 'text-gray-700'
                          }`}>
                            {intento.puntaje}%
                            {intento.puntaje === historial.mejorPuntaje && (
                              <span className="ml-1 text-yellow-500">👑</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {intento.tiempoEmpleado} min
                          </div>
                        </div>
                        <div className={`w-2 h-8 rounded-full ${
                          intento.puntaje >= 90 ? 'bg-green-500' :
                          intento.puntaje >= 70 ? 'bg-yellow-500' :
                          intento.puntaje >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base">No hay intentos registrados para esta simulación.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end flex-shrink-0 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;
