
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMisEstudiantes } from '../../api/asesores';
import axios from '../../api/axios';
import { buildStaticUrl } from '../../utils/url';
import { useLocation } from 'react-router-dom';

// Audio preloading para evitar bloqueo del navegador
let audioUnlocked = false;
let notificationAudio = null;

const unlockAudio = () => {
    if (audioUnlocked) return;
    try {
        notificationAudio = new Audio('/notification-sound-for-whatsapp.mp3');
        notificationAudio.volume = 0.5;
        // Intentar reproducir y pausar inmediatamente para "desbloquear"
        notificationAudio.play().then(() => {
            notificationAudio.pause();
            notificationAudio.currentTime = 0;
            audioUnlocked = true;
        }).catch(() => {
            // Si falla, intentaremos de nuevo en la próxima interacción
        });
    } catch (e) {
        console.log('Audio unlock failed:', e);
    }
};

const playNotificationSound = () => {
    try {
        if (!audioUnlocked || !notificationAudio) {
            // Si aún no está desbloqueado, intentar desbloquear
            unlockAudio();
            return;
        }
        // Reproducir el audio precargado
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(e => {
            console.log('Audio play blocked:', e);
        });
    } catch (e) {
        console.log('Audio error:', e);
    }
};

// Notificación en el título de la pestaña
let titleInterval = null;
let originalTitle = document.title;

const startTitleNotification = (count = 1) => {
    if (titleInterval) return; // Ya está parpadeando

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

const ChatAsesor = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [loadingChat, setLoadingChat] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({}); // { studentId: count }

    // Unlock audio on mount and user interaction
    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio();
        };

        // Try to unlock immediately
        unlockAudio();

        // Add listeners for user interactions
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    // Cargar estudiantes (reutilizando lógica de ListaAlumnos)
    useEffect(() => {
        async function loadStudents() {
            setLoading(true);
            try {
                // Filtrar por grupo del asesor si aplica
                const grupoAsesor = user?.grupo_asesor || user?.asesor_profile?.grupo_asesor || null;
                const params = grupoAsesor ? { grupo: grupoAsesor } : undefined;
                const { data } = await getMisEstudiantes(params);
                const list = Array.isArray(data?.data) ? data.data : (data || []);

                // Procesar lista similar a ListaAlumnos
                const processed = list
                    .filter(s => s.estatus === 'Activo')
                    .map(s => ({
                        id: s.id,
                        name: `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim(),
                        avatar: s.foto ? buildStaticUrl(s.foto) : "",
                        grupo: s.grupo || ""
                    }));
                setStudents(processed);

                // Si viene preseleccionado por navegación (future proofing)
                if (location.state?.studentId) {
                    const target = processed.find(s => s.id === location.state.studentId);
                    if (target) setSelectedStudent(target);
                }
            } catch (e) {
                console.error("Error loading students:", e);
            } finally {
                setLoading(false);
            }
        }
        loadStudents();
        loadUnreadCounts(); // Cargar conteos iniciales
    }, [user, location.state]);

    // Cargar conteo de mensajes sin leer por estudiante
    const loadUnreadCounts = async () => {
        try {
            const res = await axios.get('/chat/unread/count');
            // Formato esperado: { data: { total: N, by_student: { studentId: count } } }
            const counts = res.data?.data?.by_student || {};
            setUnreadCounts(counts);
        } catch (e) {
            console.error('Error loading unread counts:', e);
        }
    };

    // Actualizar conteos cuando cambie el chat o lleguen mensajes
    useEffect(() => {
        const handler = () => loadUnreadCounts();
        window.addEventListener('advisor-chat-update', handler);
        return () => window.removeEventListener('advisor-chat-update', handler);
    }, []);

    // Desbloquear audio con la primera interacción del usuario
    useEffect(() => {
        const handleFirstClick = () => {
            unlockAudio();
            // Remover listener después de la primera interacción
            document.removeEventListener('click', handleFirstClick);
            document.removeEventListener('touchstart', handleFirstClick);
        };

        document.addEventListener('click', handleFirstClick);
        document.addEventListener('touchstart', handleFirstClick);

        return () => {
            document.removeEventListener('click', handleFirstClick);
            document.removeEventListener('touchstart', handleFirstClick);
        };
    }, []);

    // Detener notificación de título cuando el usuario vuelve a la pestaña
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                stopTitleNotification();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopTitleNotification(); // Limpiar al desmontar
        };
    }, []);

    // Cargar historial y marcar como leídos al seleccionar estudiante
    useEffect(() => {
        if (!selectedStudent) return;

        // isBackground = true evita mostrar el spinner de carga (útil para polling)
        async function loadChat(isBackground = false) {
            if (!isBackground) setLoadingChat(true);
            try {
                const res = await axios.get(`/chat/history?student_id=${selectedStudent.id}`);
                const newMessages = Array.isArray(res.data.data) ? [...res.data.data] : [];

                setMessages(prev => {
                    // Si es background update, solo actualizamos si hay cambios reales en longitud o contenido último
                    // para evitar re-renders innecesarios o saltos de scroll
                    if (isBackground) {
                        if (prev.length === newMessages.length &&
                            JSON.stringify(prev[prev.length - 1]) === JSON.stringify(newMessages[newMessages.length - 1])) {
                            return prev;
                        }
                    }
                    return newMessages;
                });

                // Solo scroll al fondo si no es background o si hay nuevos mensajes
                if (!isBackground) {
                    setTimeout(scrollToBottom, 100);
                } else if (newMessages.length > messages.length) {
                    // Opcional: solo scrollear si el usuario ya estaba abajo
                    setTimeout(scrollToBottom, 100);
                }

                // Marcar como leído
                await axios.post('/chat/read', { student_id: selectedStudent.id });
                // Disparar evento para actualizar sidebar badge
                window.dispatchEvent(new CustomEvent('advisor-chat-update'));
            } catch (error) {
                console.error("Error loading chat:", error);
            } finally {
                if (!isBackground) setLoadingChat(false);
            }
        }
        loadChat(false);

        // Polling simple para updates (idealmente WS)
        const interval = setInterval(() => loadChat(true), 10000);
        return () => clearInterval(interval);

    }, [selectedStudent]);

    // Escuchar WS (reutilizando el evento global student-ws-message si llega algo relevante para advisor)
    // Nota: El backend actualmente emite a admins/asesores via broadcastAdmins.
    // Necesitamos asegurarnos que el cliente escuche esos eventos.
    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            if (data?.type === 'chat_message' && data.data) {
                const msg = data.data;
                // Si el mensaje es del estudiante seleccionado o YO se lo envié a él
                if (selectedStudent && (msg.student_id === selectedStudent.id)) {
                    setMessages(prev => {
                        // 1. Si ya existe por ID real, ignorar
                        if (prev.some(m => m.id === msg.id)) return prev;

                        // 2. Buscar si existe un mensaje optimista (id empieza con 'opt-')
                        // que coincida en contenido (trim) y sea rol "mío" (asesor/admin)
                        const optimIdx = prev.findIndex(m =>
                            String(m.id).startsWith('opt-') &&
                            (m.sender_role === msg.sender_role || (['asesor', 'admin'].includes(m.sender_role) && ['asesor', 'admin'].includes(msg.sender_role))) &&
                            m.message.trim() === msg.message.trim() &&
                            Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 20000 // 20s window
                        );

                        if (optimIdx !== -1) {
                            // Reemplazar el optimista con el real
                            const newArr = [...prev];
                            newArr[optimIdx] = msg;
                            return newArr;
                        }

                        // 3. Si no es duplicado, agregar
                        return [...prev, msg];
                    });
                    setTimeout(scrollToBottom, 100);

                    // Si el mensaje es del estudiante (no mío) y estoy viendo el chat, marcar leido
                    if (msg.sender_role === 'estudiante') {
                        // Verificar si estamos en la ruta del chat
                        const isInChatRoute = location.pathname === '/asesor/chat';

                        // Reproducir sonido siempre que llegue un mensaje del estudiante
                        playNotificationSound();

                        // Si no estamos en la ruta del chat O la pestaña está oculta, mostrar alerta en título
                        if (!isInChatRoute || document.hidden) {
                            startTitleNotification(1);
                        }

                        axios.post('/chat/read', { student_id: selectedStudent.id }).catch(() => { });
                        // Disparar update global (puede que el conteo baje o se mantenga)
                        // Pequeño delay para que el backend procese
                        setTimeout(() => window.dispatchEvent(new CustomEvent('advisor-chat-update')), 500);
                    }
                } else {
                    // Si es de otro estudiante, disparar update para que suba el badge
                    if (msg.sender_role === 'estudiante') {
                        window.dispatchEvent(new CustomEvent('advisor-chat-update'));

                        // Verificar si estamos en la ruta del chat
                        const isInChatRoute = location.pathname === '/asesor/chat';

                        // Reproducir sonido siempre
                        playNotificationSound();

                        // Notificar en título si no estamos en chat O si la pestaña está oculta
                        if (!isInChatRoute || document.hidden) {
                            const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0) + 1;
                            startTitleNotification(totalUnread);
                        }
                    }
                }
            }
        };
        // Asumiendo que el cliente WS global también despacha eventos para asesores
        window.addEventListener('student-ws-message', handler);
        return () => window.removeEventListener('student-ws-message', handler);
    }, [selectedStudent, location.pathname, unreadCounts]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent) return;

        setSending(true);
        try {
            const msgData = {
                student_id: selectedStudent.id,
                message: newMessage,
                type: 'text',
                sender_role: 'asesor' // Backend lo validará con el token, pero enviamos explícito por claridad
            };

            // Optimistic Update
            const optimMsg = {
                ...msgData,
                id: 'opt-' + Date.now(),
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, optimMsg]);
            setNewMessage('');
            setTimeout(scrollToBottom, 50);

            await axios.post('/chat/send', msgData);
            // El WS o el polling confirmarán el mensaje real
        } catch (error) {
            console.error("Error sending message:", error);
            alert("No se pudo enviar el mensaje");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-4 my-4">
            {/* Sidebar lista de alumnos */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h2 className="font-bold text-slate-700">Mis Estudiantes</h2>
                    <div className="mt-2 relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                        <span className="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400">Cargando...</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {students.map(s => {
                                const unreadCount = unreadCounts[s.id] || 0;
                                const getInitials = (name) => {
                                    const parts = name.trim().split(' ').filter(Boolean);
                                    if (parts.length >= 2) {
                                        return (parts[0][0] + parts[1][0]).toUpperCase();
                                    }
                                    return parts[0]?.substring(0, 2).toUpperCase() || '?';
                                };

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className={`w-full p-3 flex items-center gap-3 hover:bg-white transition-colors text-left relative ${selectedStudent?.id === s.id ? 'bg-white border-l-4 border-indigo-600 shadow-sm' : ''}`}
                                    >
                                        {/* Avatar con fallback mejorado */}
                                        <div className="relative w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                            {s.avatar ? (
                                                <img
                                                    src={s.avatar}
                                                    alt={s.name}
                                                    className="w-full h-full rounded-full object-cover absolute inset-0"
                                                    style={{ zIndex: 1 }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="w-full h-full flex items-center justify-center text-sm rounded-full absolute inset-0"
                                                style={{ display: s.avatar ? 'none' : 'flex', zIndex: 1 }}
                                            >
                                                {getInitials(s.name)}
                                            </div>
                                            {/* Badge de notificación */}
                                            {unreadCount > 0 && (
                                                <div
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white animate-pulse"
                                                    style={{ zIndex: 10 }}
                                                >
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-700 truncate">{s.name}</p>
                                            <p className="text-xs text-slate-400">Grupo: {s.grupo}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
                {selectedStudent ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-slate-800">{selectedStudent.name}</h3>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">Estudiante</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingChat ? (
                                <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-slate-400 mt-20">
                                    <p>No hay mensajes aún.</p>
                                    <p className="text-sm">Inicia la conversación.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_role === 'asesor' || msg.sender_role === 'admin';
                                    return (
                                        <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                                                    }`}>
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1 px-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <span className="ml-1 opacity-70">({msg.sender_role})</span>}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Escribir mensaje..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                                >
                                    Enviar
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-2xl">💬</div>
                        <p className="font-medium">Selecciona un estudiante</p>
                        <p className="text-sm">para comenzar a chatear</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatAsesor;
