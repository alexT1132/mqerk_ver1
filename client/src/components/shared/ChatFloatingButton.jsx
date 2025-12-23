import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// Iconos SVG simples
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative">
        {/* Message bubble */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.2" />
        {/* Signal waves */}
        <path d="M9 10h.01" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 10h.01" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M17 10h.01" strokeWidth="2.5" strokeLinecap="round" />
        {/* Tech accent lines */}
        <circle cx="19" cy="5" r="2" fill="currentColor" opacity="0.6" className="animate-pulse" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
// Sonido de notificación simple (beep)
// Sonido de notificación personalizado
const NOTIFICATION_SOUND = '/notification-sound-for-whatsapp.mp3';
// Fallback for legacy HMR/Cached code
const playNotificationSound = () => { console.warn('Legacy playNotificationSound called'); };

const ChatFloatingButton = () => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [category, setCategory] = useState(null); // null = loading/default, 'academic', 'support'

    // Audio Ref para persistencia y unlock
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));
    const audioUnlocked = useRef(false);

    const unlockAudio = () => {
        if (audioUnlocked.current) return;
        // Intentar reproducir y pausar inmediatamente para desbloquear el contexto de audio
        const p = audioRef.current.play();
        if (p) {
            p.then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioUnlocked.current = true;
            }).catch(e => {
                // Si falla (ej: autoplay policy), no hacemos nada, se reintentará en la siguiente interacción
                // console.debug('Audio unlock pending user interaction');
            });
        }
    };

    const playSound = () => {
        try {
            if (!audioUnlocked.current) return; // Si no está desbloqueado, mejor no intentar para no spammear errores
            audioRef.current.volume = 0.5;
            audioRef.current.currentTime = 0;
            const p = audioRef.current.play();
            if (p) {
                p.catch(e => console.log('Audio play failed:', e));
            }
        } catch (e) { }
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


    // Status info
    const [advisorName, setAdvisorName] = useState('Tu Tutor Personal');
    const [isOnline, setIsOnline] = useState(false);

    const [advisorStatus, setAdvisorStatus] = useState(false); // Advisor specifically
    const [supportStatus, setSupportStatus] = useState(false); // Support team

    // Draggable Logic
    const [position, setPosition] = useState(null); // {x, y} or null (default CSS)
    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const handlePointerDown = (e) => {
        // Unlock audio on first interaction
        unlockAudio();

        // Only left click or touch
        if (e.type === 'mousedown' && e.button !== 0) return;

        isDragging.current = false;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        // Calculate offset from button top-left
        const rect = buttonRef.current.getBoundingClientRect();
        dragStartPos.current = {
            x: clientX - rect.left,
            y: clientY - rect.top,
            startX: clientX,
            startY: clientY
        };

        const handlePointerMove = (moveEvent) => {
            const moveClientX = moveEvent.clientX || moveEvent.touches?.[0].clientX;
            const moveClientY = moveEvent.clientY || moveEvent.touches?.[0].clientY;

            // Check if moved enough to consider it a drag
            if (Math.abs(moveClientX - dragStartPos.current.startX) > 5 ||
                Math.abs(moveClientY - dragStartPos.current.startY) > 5) {
                isDragging.current = true;
            }

            if (isDragging.current) {
                // Prevent scrolling on mobile while dragging
                if (moveEvent.cancelable) moveEvent.preventDefault();

                const newX = moveClientX - dragStartPos.current.x;
                const newY = moveClientY - dragStartPos.current.y;

                // Boundary checks
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;

                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            }
        };

        const handlePointerUp = () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };

        window.addEventListener('mousemove', handlePointerMove, { passive: false });
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerUp);
    };

    const toggleOpen = () => {
        if (!isDragging.current) {
            setIsOpen(!isOpen);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/chat/history');
            const history = Array.isArray(res.data.data) ? [...res.data.data] : [];

            // Merge with existing messages, keeping optimistic ones that haven't been confirmed
            setMessages(prev => {
                const newMessages = [...history];
                // Keep optimistic messages that aren't in the history yet
                prev.forEach(msg => {
                    if (!msg.id && !newMessages.some(m =>
                        m.message === msg.message &&
                        m.sender_role === msg.sender_role &&
                        Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 5000
                    )) {
                        newMessages.push(msg);
                    }
                });
                return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            setLoading(false);

            // Calculate unread count ONLY if window is closed
            if (!isOpen) {
                const unread = history.filter(m => m.sender_role !== 'estudiante' && !m.is_read).length;
                setUnreadCount(unread);
            }

            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Error loading chat:", error);
            setLoading(false);
        }
    };

    const loadStatus = async () => {
        try {
            const res = await axios.get('/chat/status');
            if (res.data) {
                setAdvisorName(res.data.advisorName);
                setAdvisorStatus(res.data.advisorOnline);
                setSupportStatus(res.data.supportOnline);
                // isOnline can remain as general indicator if needed, but we'll use specific ones
                setIsOnline(res.data.online);
            }
        } catch (e) {
            console.error("Error loading status:", e);
        }
    };

    const markRead = async () => {
        try {
            await axios.post('/chat/read');
            setUnreadCount(0);
        } catch (e) { }
    }

    useEffect(() => {
        // Load initial state (unread count) on mount
        loadHistory();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (!category) setCategory('academic'); // Default on open
            loadHistory();
            markRead();
            loadStatus();
            // Poll status every minute if open
            const interval = setInterval(loadStatus, 60000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Detener notificación de título cuando el usuario vuelve a la pestaña o abre el chat
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden || isOpen) {
                stopTitleNotification();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Detener al abrir el chat
        if (isOpen) {
            stopTitleNotification();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopTitleNotification(); // Limpiar al desmontar
        };
    }, [isOpen]);

    // Listen for advisor status changes
    useEffect(() => {
        const statusHandler = (e) => {
            const data = e.detail;
            if (data?.type === 'advisor-status-change') {
                const { online, role } = data;
                if (role === 'asesor') {
                    setAdvisorStatus(online);
                } else if (role === 'admin') {
                    setSupportStatus(online);
                }
            }
        };
        window.addEventListener('student-ws-message', statusHandler);
        return () => window.removeEventListener('student-ws-message', statusHandler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            if (data?.type === 'chat_message' && data.data) {
                const msg = data.data;

                setMessages(prev => {
                    // Deduplicación robusta - verificar por ID primero
                    if (msg.id && prev.some(m => m.id === msg.id)) return prev;

                    // Buscar mensaje optimista para reemplazar
                    const optimisticIndex = prev.findIndex(m =>
                        !m.id && // Es optimista (sin ID)
                        m.sender_role === msg.sender_role &&
                        m.message === msg.message &&
                        Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 5000
                    );

                    if (optimisticIndex !== -1) {
                        // Reemplazar mensaje optimista con el real
                        const newMessages = [...prev];
                        newMessages[optimisticIndex] = msg;
                        return newMessages;
                    }

                    // Si no es duplicado, agregar al final
                    return [...prev, msg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                });

                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                    playSound();
                    // Notificar en título si el chat está cerrado (siempre mostrar alerta cuando chat cerrado)
                    startTitleNotification(unreadCount + 1);
                } else {
                    if (msg.sender_role !== 'estudiante') markRead();
                    // También sonar si está abierto pero no es el usuario enviando
                    if (msg.sender_role !== 'estudiante') playSound();
                }
            }
        };
        window.addEventListener('student-ws-message', handler);
        return () => window.removeEventListener('student-ws-message', handler);
    }, [isOpen, unreadCount]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgContent = newMessage;
        const msgCategory = category || 'academic';
        setNewMessage('');

        const optimMsg = {
            sender_role: 'estudiante',
            message: msgContent,
            category: msgCategory,
            created_at: new Date().toISOString(),
            type: 'text'
        };

        setMessages(prev => [...prev, optimMsg]);

        try {
            await axios.post('/chat/send', { message: msgContent, type: 'text', category: msgCategory });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m !== optimMsg));
            alert("No se pudo enviar el mensaje");
        }
    };

    const currentOnlineStatus = category === 'academic' ? advisorStatus : supportStatus;

    if (!isAuthenticated || user?.role !== 'estudiante') return null;

    // Estilos dinámicos para posición
    const containerStyle = position
        ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
        : {}; // Usa clases CSS por defecto si no se ha movido

    // Clases CSS base (si position es null, usamos bottom/right por defecto)
    const defaultClasses = !position
        ? "fixed bottom-20 sm:bottom-6 right-4 sm:right-6"
        : "fixed";

    return (
        <div
            ref={buttonRef}
            style={containerStyle}
            className={`${defaultClasses} z-[9999] flex flex-col items-end gap-4 font-sans touch-none`}
        >
            {/* Ventana de Chat - Se renderiza relativa al contenedor movible */}
            {isOpen && (
                <div
                    className="w-[calc(100vw-2rem)] max-w-sm sm:max-w-md h-[85vh] max-h-[32rem] sm:h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 absolute bottom-16 right-0 origin-bottom-right"
                    // Evitar propagación del click/drag desde la ventana
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                >
                    {/* Header Dinámico */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 sm:p-3 text-white shadow-md shrink-0 cursor-auto">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-full relative">
                                    <span className="text-lg">
                                        {category === 'academic' ? '👨‍🏫' : '🛠️'}
                                    </span>
                                    {currentOnlineStatus && (
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-xs sm:text-sm leading-tight">
                                        {category === 'academic' ? advisorName : 'Soporte Técnico'}
                                    </h3>
                                    <p className="text-[9px] sm:text-[10px] text-indigo-100 opacity-90 flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${currentOnlineStatus ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                                        {currentOnlineStatus ? 'En línea' : 'Desconectado'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition text-white/80 hover:text-white">
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Selector de Canal */}
                        <div className="flex gap-1 sm:gap-2 bg-black/10 p-1 rounded-lg">
                            <button
                                onClick={() => setCategory('academic')}
                                className={`flex-1 text-[10px] sm:text-xs py-1.5 px-1 sm:px-2 rounded-md transition-all ${category === 'academic' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-white/70 hover:bg-white/10'}`}
                            >
                                Tutor Académico
                            </button>
                            <button
                                onClick={() => setCategory('support')}
                                className={`flex-1 text-[10px] sm:text-xs py-1.5 px-1 sm:px-2 rounded-md transition-all ${category === 'support' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-white/70 hover:bg-white/10'}`}
                            >
                                Soporte Técnico
                            </button>
                        </div>
                    </div>

                    {/* Lista de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 cursor-auto">
                        {loading && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            </div>
                        )}

                        {!loading && messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10 space-y-2">
                                <div className="text-4xl opacity-50">👋</div>
                                <p>¡Hola!</p>
                                <p className="text-xs max-w-[200px] mx-auto">
                                    {category === 'academic'
                                        ? `Estás hablando con ${advisorName}.`
                                        : '¿Problemas con la plataforma? Escribe a soporte técnico.'}
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isMsgForCurrentTab = (msg.category || 'general') === (category || 'academic') || (msg.category === 'general' && category === 'academic');
                            if (!isMsgForCurrentTab) return null;

                            const isMe = msg.sender_role === 'estudiante';
                            return (
                                <div key={msg.id || `opt-${idx}`} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                        </div>
                                        <span className="text-[10px] mt-1 px-1 text-gray-400">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-2 sm:p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 cursor-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Escribe a ${category === 'academic' ? 'tu tutor' : 'soporte'}...`}
                            onMouseDown={e => e.stopPropagation()} // Allow selecting text
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onClick={toggleOpen}
                className={`pointer-events-auto bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 group relative z-50 cursor-move ${isOpen ? 'rotate-90 scale-90 opacity-0 absolute' : 'opacity-100'}`}
                aria-label="Abrir Chat"
            >
                {/* Animated wave rings */}
                <span className="absolute inset-0 rounded-full bg-violet-400 opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
                <span className="absolute inset-0 rounded-full bg-violet-400 opacity-50 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></span>

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg z-10">
                        {unreadCount}
                    </span>
                )}
                <ChatIcon />
            </button>
            {/* Botón de cierre visible solo cuando está abierto (para separar funcionalidad de drag/close) opcional pero el diseño actual lo maneja con isOpen */}
            {isOpen && (
                <button
                    onMouseDown={handlePointerDown}
                    onTouchStart={handlePointerDown}
                    onClick={toggleOpen}
                    className="pointer-events-auto bg-white text-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all group relative z-50 cursor-move"
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    );
};

export default ChatFloatingButton;