import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Clock, X } from 'lucide-react';
import { listRemindersPersonal } from '../../api/asesores.js';

// Helper para parsear fecha local sin problemas de zona horaria
const parseLocalDateTime = (dateStr, timeStr = null) => {
    if (!dateStr) return new Date();

    // Si la fecha ya viene con T, normalizar
    let normalizedDate = dateStr;
    if (normalizedDate.includes('T')) {
        normalizedDate = normalizedDate.split('T')[0];
    }

    const parts = normalizedDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(year, month, day, hours, minutes || 0, 0);
    }
    return new Date(year, month, day, 0, 0, 0);
};

export default function ReminderNotifier() {
    const [notifiedStages, setNotifiedStages] = useState({}); // { [id]: { ten: bool, lastRecurring: timestamp } }

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkReminders = async () => {
            try {
                const res = await listRemindersPersonal();
                const reminders = res.data?.data || [];
                const now = new Date();

                reminders.forEach(rem => {
                    if (rem.completed) return;

                    const remTime = parseLocalDateTime(rem.date, rem.time);
                    const diffMs = remTime.getTime() - now.getTime();
                    const diffMin = diffMs / (60 * 1000);

                    // Generar llave única de tiempo para detectar ediciones
                    const timeKey = `${rem.date}_${rem.time}`;

                    // Estado actual de notificaciones para este recordatorio
                    const currentStages = notifiedStages[rem.id];

                    let stages;
                    let updated = false;

                    // Si no existe estado previo O la hora cambió (edicion), resetear flags
                    if (!currentStages || currentStages.timeKey !== timeKey) {
                        stages = { ten: false, lastRecurring: 0, now: false, timeKey };
                        updated = true; // Guardar el nuevo timeKey inmediatamente
                    } else {
                        stages = { ...currentStages };
                    }

                    // 1. Notificación 10 minutos antes (una sola vez)
                    // Rango ampliado para asegurar captura
                    if (diffMin > 9 && diffMin <= 10.5 && !stages.ten) {
                        showReminderToast(rem, "En 10 minutos", "warning", `ten-${rem.id}`);
                        stages.ten = true;
                        updated = true;
                    }

                    // 2. Notificación URGENTE: AL MOMENTO (sin espera)
                    // Se dispara cuando falta muy poco (<= 0.2 min) o ya pasó un poco
                    else if (diffMin <= 0.2 && diffMin > -1 && !stages.now) {
                        const toastId = `countdown-${rem.id}`;
                        showReminderToast(rem, "¡ES AHORA!", "Tu actividad ha comenzado.", toastId, true);

                        // Reproducir sonido de alerta
                        try {
                            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            audio.volume = 0.5;
                            audio.play().catch(e => console.warn("Audio play failed", e));
                        } catch (e) {
                            console.warn("Audio not supported");
                        }

                        stages.now = true;
                        stages.lastRecurring = now.getTime(); // Actualizar para que no se duplique con el recurrente
                        updated = true;
                    }

                    // 3. Notificación recurrente (1 - 3 minutos antes)
                    else if (diffMin <= 3.5 && diffMin > 0.2) {
                        const oneMinute = 60 * 1000;
                        const timeSinceLast = now.getTime() - stages.lastRecurring;

                        // Si pasó al menos 1 minuto o nunca se ha notificado
                        if (timeSinceLast >= oneMinute || stages.lastRecurring === 0) {
                            const mins = Math.ceil(diffMin);
                            const titleLabel = `En ${mins} minuto${mins !== 1 ? 's' : ''}`;
                            const message = `Tu actividad comienza en ${mins} minuto${mins !== 1 ? 's' : ''}.`;

                            // ID único compartido para toda la fase de cuenta regresiva
                            const toastId = `countdown-${rem.id}`;
                            // Urgente si falta 1 minuto
                            const isUrgent = mins <= 1;

                            showReminderToast(rem, titleLabel, message, toastId, isUrgent);
                            stages.lastRecurring = now.getTime();
                            updated = true;
                        }
                    }

                    if (updated) {
                        setNotifiedStages(prev => ({
                            ...prev,
                            [rem.id]: stages
                        }));
                    }
                });
            } catch (e) {
                console.warn('Error al verificar recordatorios cercanos:', e);
            }
        };

        // Revisar con más frecuencia para asegurar tiempo real
        const interval = setInterval(checkReminders, 5000);
        checkReminders();

        return () => clearInterval(interval);
    }, [notifiedStages]);

    const showReminderToast = (rem, titleLabel, message, toastId, isUrgent = false) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-4'
                    } max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl pointer-events-auto flex ring-1 p-1 duration-300 ${isUrgent ? 'bg-red-50 ring-red-500/30' : 'bg-white ring-violet-500/20'
                    }`}
            >
                <div className="flex-1 p-3">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg ring-4 ring-violet-100">
                                <Bell className="h-5 w-5 text-white animate-bounce" />
                            </div>
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-xs font-extrabold text-violet-600 uppercase tracking-widest mb-1">
                                {titleLabel}
                            </p>
                            <p className="text-sm text-slate-900 font-extrabold leading-tight">
                                {rem.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 font-bold italic">
                                {message}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded-lg w-fit">
                                <Clock className="size-3.5 text-violet-600" />
                                <span>Hora: {rem.time || '?'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-100">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        ), {
            id: toastId, // ID único para evitar duplicados
            duration: 8000,
            position: 'top-right'
        });
    };

    return null;
}