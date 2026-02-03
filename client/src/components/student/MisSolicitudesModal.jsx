import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

/**
 * Modal compacto y responsivo para que el estudiante vea el estado de sus solicitudes
 * @param {string} filterType - Opcional 'actividad' | 'simulacion'. Si se omite, muestra todas.
 */
export default function MisSolicitudesModal({ isOpen, onClose, filterType = null }) {
    const { hydrateAreaAccess } = useStudent(); // Para refrescar el contexto
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchWithRefresh = async (url, options = {}) => {
        const opts = { credentials: 'include', ...options };
        let res = await fetch(url, opts).catch(() => null);
        if (res && res.status !== 401) return res;
        try {
            const r = await fetch('/api/usuarios/token/refresh', { method: 'POST', credentials: 'include' });
            if (r.ok) {
                res = await fetch(url, opts).catch(() => null);
                return res;
            }
        } catch (_) { }
        return res;
    };

    const fetchSolicitudes = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await fetchWithRefresh('/api/student/area-requests');
            if (!res || !res.ok) {
                throw new Error(`Error ${res?.status || 'de red'}`);
            }
            const json = await res.json();
            let data = Array.isArray(json?.data) ? json.data : [];

            // Filtrar si se especifica un tipo
            if (filterType) {
                data = data.filter(s => s.area_type === filterType);
            }

            setSolicitudes(data);

            // También refrescar el contexto para que los badges se actualicen
            if (hydrateAreaAccess) {
                try {
                    await hydrateAreaAccess();
                } catch (err) {
                    console.warn('No se pudo refrescar el contexto:', err);
                }
            }
        } catch (err) {
            console.error('Error fetching solicitudes:', err);
            setError('No se pudieron cargar tus solicitudes');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSolicitudes();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getStatusInfo = (rawStatus) => {
        // Normalizar status para evitar problemas de mayúsculas/espacios
        const status = String(rawStatus || 'pending').toLowerCase().trim();

        switch (status) {
            case 'approved':
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: 'text-green-700',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'Aprobada'
                };
            case 'rejected':
            case 'denied':
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    color: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Rechazada'
                };
            case 'pending':
            default:
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: 'text-amber-700',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    label: 'Pendiente'
                };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-2 sm:p-4 pt-24 sm:pt-32" onClick={onClose}>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header compacto */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-bold truncate">Mis Solicitudes</h2>
                            <p className="text-xs sm:text-sm text-violet-100 hidden sm:block">Estado de acceso a módulos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botón refrescar */}
                        <button
                            onClick={() => fetchSolicitudes(true)}
                            disabled={isRefreshing || loading}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refrescar solicitudes"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Content compacto */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                            <p className="text-xs sm:text-sm text-gray-500">Cargando...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="font-medium text-red-900 text-sm">Error</p>
                                <p className="text-xs text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && solicitudes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-2 sm:gap-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-500 font-medium">No tienes solicitudes</p>
                            <p className="text-xs sm:text-sm text-gray-400 text-center px-4">Aún no has solicitado acceso a ningún módulo</p>
                        </div>
                    )}

                    {!loading && !error && solicitudes.length > 0 && (
                        <div className="space-y-3 sm:space-y-4">
                            {solicitudes.map((solicitud) => {
                                const statusInfo = getStatusInfo(solicitud.status);
                                return (
                                    <div
                                        key={solicitud.id}
                                        className={`group border ${statusInfo.borderColor} ${statusInfo.bgColor} rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:scale-[1.01]`}
                                    >
                                        {/* DEBUG: Ver status real */}
                                        {console.log(`Solicitud ${solicitud.id} raw status: "${solicitud.status}"`)}

                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{solicitud.area_name || `Área ${solicitud.area_id}`}</h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color} bg-white border ${statusInfo.borderColor} shadow-sm`}>
                                                        {statusInfo.icon}
                                                        <span>{statusInfo.label}</span>
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-[10px] sm:text-xs text-gray-600">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="font-medium text-gray-500">Solicitado:</span>
                                                            <span className="text-gray-900 font-semibold">{formatDate(solicitud.created_at)}</span>
                                                        </div>
                                                        {solicitud.decided_at && (
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3 text-gray-400" />
                                                                <span className="font-medium text-gray-500">Respondido:</span>
                                                                <span className="text-gray-900 font-semibold">{formatDate(solicitud.decided_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {solicitud.notes && (
                                                        <div className="mt-3 p-3 bg-white/50 rounded-lg border border-gray-100/50">
                                                            <p className="font-bold text-gray-700 text-[10px] sm:text-[11px] uppercase tracking-wider mb-1">Retroalimentación:</p>
                                                            <p className="text-gray-600 italic text-[11px] sm:text-xs leading-relaxed">{solicitud.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer compacto */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-2">
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {solicitudes.length > 0 && `${solicitudes.length} solicitud${solicitudes.length !== 1 ? 'es' : ''}`}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm flex-shrink-0"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
