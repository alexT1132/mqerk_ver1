import React from 'react';
import { FileText } from 'lucide-react'; // Asumiendo que usas lucide-react para los iconos

const HistorialModal = ({ simulacion, historial, onClose }) => {
  if (!simulacion) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold truncate">Historial de Intentos</h2>
              <p className="text-indigo-100 mt-0.5 text-xs sm:text-sm truncate">{simulacion.nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors ml-3 flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-[10px] sm:text-xs font-medium">Total de Intentos</div>
              <div className="text-base sm:text-lg font-bold text-blue-800">{historial.totalIntentos}</div>
            </div>
            <div className="bg-green-50 p-2 rounded-lg border border-green-200">
              <div className="text-green-600 text-[10px] sm:text-xs font-medium">Mejor Puntaje</div>
              <div className="text-base sm:text-lg font-bold text-green-800">{historial.mejorPuntaje}%</div>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
              <div className="text-purple-600 text-[10px] sm:text-xs font-medium">Promedio</div>
              <div className="text-base sm:text-lg font-bold text-purple-800">
                {Math.round(historial.promedioTiempo || 0)} min
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
              <div className="text-orange-600 text-[10px] sm:text-xs font-medium">Último</div>
              <div className="text-[10px] sm:text-xs font-bold text-orange-800">
                {historial.intentos.length > 0
                  ? new Date(historial.intentos[historial.intentos.length - 1].fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
                  : 'N/A'
                }
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Historial Detallado ({historial.intentos.length} intentos)
            </h3>

            {historial.intentos.length > 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 max-h-48 sm:max-h-56 overflow-y-auto">
                <div className="space-y-1.5">
                  {[...historial.intentos].reverse().map((intento, index) => (
                    <div
                      key={intento.id}
                      className="bg-white p-2 rounded-md border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs flex-shrink-0">
                          {historial.intentos.length - index}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                            Intento {historial.intentos.length - index}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(intento.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })},{' '}
                            {new Date(intento.fecha).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <div className="text-right">
                          <div className={`font-bold text-xs sm:text-sm ${intento.puntaje === historial.mejorPuntaje
                            ? 'text-green-600'
                            : 'text-gray-700'
                            }`}>
                            {intento.puntaje}%
                            {intento.puntaje === historial.mejorPuntaje && (
                              <span className="ml-0.5 text-yellow-500">👑</span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {intento.tiempoEmpleado} min
                          </div>
                        </div>
                        <div className={`w-1 h-6 rounded-full ${intento.puntaje >= 90 ? 'bg-green-500' :
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

        <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 flex justify-end flex-shrink-0 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModal;