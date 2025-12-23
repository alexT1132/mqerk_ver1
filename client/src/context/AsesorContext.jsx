import { createContext, useContext, useState, useEffect } from "react";
import { buildApiUrl } from '../utils/url.js';

const AsesorContext = createContext();

export const useAsesor = () => {
    const context = useContext(AsesorContext);

    if (!context) {
        throw new Error("useAsesor must be used within a AsesorProvider");
    }

    return context;
}

export function AsesorProvider({ children }) {

    const [datos1, setDatos1] = useState(null);
    const [preregistroId, setPreregistroId] = useState(() => {
        const stored = localStorage.getItem('asesor_preregistro_id');
        return stored ? Number(stored) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Eliminados estados de tests

    const preSignup = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(buildApiUrl('/asesores/preregistro'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || 'Error al preregistrar');
            }
            const body = await res.json();
            setDatos1(body.preregistro);
            setPreregistroId(body.preregistro.id);
            localStorage.setItem('asesor_preregistro_id', String(body.preregistro.id));
            // Devolver el preregistro creado para permitir a la UI navegar con el ID inmediatamente
            return body.preregistro;
        } catch (e) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    // Guardar resultados de test para un preregistro
    const saveTestResults = async (payload) => {
        if (!preregistroId) throw new Error('No hay preregistro activo');
        setLoading(true); setError(null);
        try {
            const res = await fetch(buildApiUrl(`/asesores/tests/${preregistroId}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body.message || 'Error guardando resultados');
            }
            return body.resultados;
        } catch (e) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const loadPreRegistro = async () => {
        if (!preregistroId || datos1) return;
        setLoading(true); setError(null);
        try {
            const res = await fetch(buildApiUrl(`/asesores/preregistro/${preregistroId}`), { credentials: 'include' });
            if (res.status === 404) {
                // ID inválida: limpiar estado para forzar preregistro de nuevo
                localStorage.removeItem('asesor_preregistro_id');
                setPreregistroId(null);
                setError('El preregistro ya no existe, vuelve a registrarte');
                return;
            }
            if (!res.ok) {
                const bodyErr = await res.json().catch(() => ({}));
                throw new Error(bodyErr.message || 'Error cargando preregistro');
            }
            const body = await res.json();
            setDatos1(body.preregistro);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (preregistroId && !datos1) {
            loadPreRegistro();
        }
    }, [preregistroId]);

    // Chat notification handling - GLOBAL for advisors
    useEffect(() => {
        let notificationAudio = null;
        let audioUnlocked = false;
        let titleInterval = null;
        let originalTitle = document.title;

        const unlockAudio = () => {
            try {
                if (!notificationAudio) {
                    notificationAudio = new Audio('/notification-sound-for-whatsapp.mp3');
                }
                notificationAudio.play().then(() => {
                    notificationAudio.pause();
                    notificationAudio.currentTime = 0;
                    audioUnlocked = true;
                }).catch(() => { });
            } catch (e) { }
        };

        const playNotificationSound = () => {
            try {
                if (!audioUnlocked || !notificationAudio) {
                    unlockAudio();
                    return;
                }
                notificationAudio.currentTime = 0;
                notificationAudio.play().catch(() => { });
            } catch (e) { }
        };

        const startTitleNotification = (count = 1) => {
            if (titleInterval) return;
            originalTitle = document.title;
            let showingAlert = false;
            titleInterval = setInterval(() => {
                document.title = showingAlert
                    ? originalTitle
                    : `(${count}) Nuevo${count > 1 ? 's' : ''} mensaje${count > 1 ? 's' : ''}`;
                showingAlert = !showingAlert;
            }, 1000);
        };

        const stopTitleNotification = () => {
            if (titleInterval) {
                clearInterval(titleInterval);
                titleInterval = null;
                document.title = originalTitle;
            }
        };

        // Unlock audio on user interaction
        const handleInteraction = () => {
            unlockAudio();
        };
        unlockAudio();
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });

        // Listen for chat messages from students
        const chatListener = (e) => {
            const data = e.detail;
            if (data?.type === 'chat_message' && data.data) {
                const msg = data.data;
                if (msg.sender_role === 'estudiante') {
                    // Play sound always
                    playNotificationSound();

                    // Show tab alert if not in chat route or tab is hidden
                    const isInChatRoute = window.location.pathname === '/asesor/chat';
                    if (!isInChatRoute || document.hidden) {
                        startTitleNotification(1);
                    }
                }
            }
        };
        window.addEventListener('student-ws-message', chatListener);

        // Stop title notification when tab becomes visible
        const visibilityHandler = () => {
            if (!document.hidden) {
                stopTitleNotification();
            }
        };
        document.addEventListener('visibilitychange', visibilityHandler);

        return () => {
            window.removeEventListener('student-ws-message', chatListener);
            document.removeEventListener('visibilitychange', visibilityHandler);
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
            stopTitleNotification();
        };
    }, []);

    return (
        <AsesorContext.Provider value={{
            datos1, preregistroId, loading, error,
            preSignup,
            saveTestResults,
            loadPreRegistro,
        }}>
            {children}
        </AsesorContext.Provider>
    )

}