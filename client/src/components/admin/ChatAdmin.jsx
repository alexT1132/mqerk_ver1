import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { buildStaticUrl } from '../../utils/url';
import toast, { Toaster } from 'react-hot-toast';

//Iconos (SVG inline para evitar dependencias externas como lucide-react si no las tienes)
const Icons = {
    Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>,
    Empty: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
};

// --- LÓGICA DE AUDIO Y NOTIFICACIONES (Sin cambios funcionales, solo limpieza) ---
let audioUnlocked = false;
let notificationAudio = null;
let titleInterval = null;
let originalTitle = document.title;

const unlockAudio = () => {
    if (audioUnlocked) return;
    try {
        notificationAudio = new Audio('/notification-sound-for-whatsapp.mp3');
        notificationAudio.volume = 0.5;
        notificationAudio.play().then(() => {
            notificationAudio.pause();
            notificationAudio.currentTime = 0;
            audioUnlocked = true;
        }).catch(() => { });
    } catch (e) { console.warn('Audio unlock failed:', e); }
};

const playNotificationSound = () => {
    try {
        if (!audioUnlocked || !notificationAudio) { unlockAudio(); return; }
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(e => console.warn('Audio play blocked:', e));
    } catch (e) { console.error('Audio error:', e); }
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

// --- COMPONENTE PRINCIPAL ---

const ChatAdmin = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Estados principales
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Búsqueda inmediata
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Búsqueda debounced
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});

    // Estados de carga
    const [loading, setLoading] = useState(true); // Carga inicial de lista
    const [loadingChat, setLoadingChat] = useState(false); // Carga de historial
    const [sending, setSending] = useState(false);

    // Refs para DOM y polling
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const latestMessagesLengthRef = useRef(0); // Para polling sin stale closures

    // Refs para audio/título (evitar variables globales)
    const audioRef = useRef(null);
    const audioUnlockedRef = useRef(false);
    const titleIntervalRef = useRef(null);
    const originalTitleRef = useRef(document.title);

    // --- FUNCIONES HELPER CON REFS ---

    const unlockAudioRef = useCallback(() => {
        if (audioUnlockedRef.current) return;
        try {
            audioRef.current = new Audio('/notification-sound-for-whatsapp.mp3');
            audioRef.current.volume = 0.5;
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioUnlockedRef.current = true;
            }).catch(() => { });
        } catch (e) { console.warn('Audio unlock failed:', e); }
    }, []);

    const playNotificationSoundRef = useCallback(() => {
        try {
            if (!audioUnlockedRef.current || !audioRef.current) { unlockAudioRef(); return; }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
        } catch (e) { console.error('Audio error:', e); }
    }, [unlockAudioRef]);

    const startTitleNotificationRef = useCallback((count = 1) => {
        if (titleIntervalRef.current) return;
        let showingAlert = false;
        titleIntervalRef.current = setInterval(() => {
            document.title = showingAlert
                ? originalTitleRef.current
                : `(${count}) Nuevo${count > 1 ? 's' : ''} mensaje${count > 1 ? 's' : ''}`;
            showingAlert = !showingAlert;
        }, 1000);
    }, []);

    const stopTitleNotificationRef = useCallback(() => {
        if (titleIntervalRef.current) {
            clearInterval(titleIntervalRef.current);
            titleIntervalRef.current = null;
            document.title = originalTitleRef.current;
        }
    }, []);

    // --- EFECTOS (Lógica de carga y sockets) ---

    // 1. Debounce para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Audio Unlock y Cleanup
    useEffect(() => {
        const handleInteraction = () => unlockAudioRef();
        unlockAudioRef();
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });

        return () => {
            // Cleanup completo
            stopTitleNotificationRef();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [unlockAudioRef, stopTitleNotificationRef]);

    // 3. Visibilidad y Título
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) stopTitleNotificationRef();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopTitleNotificationRef();
        };
    }, [stopTitleNotificationRef]);

    // 3. Cargar Estudiantes y Contadores
    useEffect(() => {
        loadStudents();
        loadUnreadCounts();

        const unreadHandler = () => loadUnreadCounts();
        window.addEventListener('admin-chat-update', unreadHandler);

        // Polling para refrescar lista cada 15 segundos (detecta cambios en DB)
        const studentInterval = setInterval(() => {
            loadStudents();
        }, 15000);

        return () => {
            window.removeEventListener('admin-chat-update', unreadHandler);
            clearInterval(studentInterval);
        };
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/chat/support/students');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            const processed = list.map(s => ({
                id: s.id,
                name: `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim(),
                avatar: s.foto ? buildStaticUrl(s.foto) : "",
                grupo: s.grupo || ""
            }));
            setStudents(processed);
        } catch (e) {
            console.error("Error loading students:", e);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCounts = async () => {
        try {
            const res = await axios.get('/chat/support/unread');
            setUnreadCounts(res.data?.data?.by_student || {});
        } catch (e) { console.error('Error loading unread counts:', e); }
    };

    // 4. Cargar Historial de Chat
    useEffect(() => {
        if (!selectedStudent) return;

        async function loadChat(isBackground = false) {
            if (!isBackground) setLoadingChat(true);
            try {
                const res = await axios.get(`/chat/support/history?student_id=${selectedStudent.id}`);
                const newMessages = Array.isArray(res.data.data) ? [...res.data.data] : [];

                setMessages(prev => {
                    // Evitar re-render si no hay cambios (comparación simple del último mensaje)
                    if (isBackground && prev.length === newMessages.length &&
                        prev[prev.length - 1]?.id === newMessages[newMessages.length - 1]?.id) {
                        return prev;
                    }
                    return newMessages;
                });

                // Scroll logic
                if (!isBackground || newMessages.length > messages.length) {
                    setTimeout(scrollToBottom, 100);
                }

                // Marcar como leído
                await axios.post('/chat/support/read', { student_id: selectedStudent.id });
                window.dispatchEvent(new CustomEvent('admin-chat-update'));
            } catch (error) {
                console.error("Error loading chat:", error);
            } finally {
                if (!isBackground) setLoadingChat(false);
            }
        }

        loadChat(false);
        const interval = setInterval(() => loadChat(true), 10000); // Polling cada 10s
        return () => clearInterval(interval);
    }, [selectedStudent]); // Quitamos 'messages' de dependencias para evitar loops en polling

    // 5. WebSockets Listener
    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            if (data?.type === 'chat_message' && data.data && data.data.category === 'support') {
                const msg = data.data;

                if (selectedStudent && (msg.student_id === selectedStudent.id)) {
                    // Mensaje dentro del chat abierto
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        // Manejo optimista deduplication
                        const optimIdx = prev.findIndex(m =>
                            String(m.id).startsWith('opt-') &&
                            m.message.trim() === msg.message.trim()
                        );
                        if (optimIdx !== -1) {
                            const newArr = [...prev];
                            newArr[optimIdx] = msg;
                            return newArr;
                        }
                        return [...prev, msg];
                    });

                    setTimeout(scrollToBottom, 100);

                    if (msg.sender_role === 'estudiante') {
                        playNotificationSoundRef();
                        axios.post('/chat/support/read', { student_id: selectedStudent.id }).catch(() => { });
                        if (document.hidden) startTitleNotificationRef(1);
                    }
                } else {
                    // Mensaje de otro estudiante
                    if (msg.sender_role === 'estudiante') {
                        // Refrescar lista de estudiantes para mostrar quién envió mensaje
                        loadStudents();
                        window.dispatchEvent(new CustomEvent('admin-chat-update'));
                        playNotificationSoundRef();

                        // Solo notificar título si no estamos en chat visible
                        const isInChat = location.pathname === '/administrativo/chat';
                        if (!isInChat || document.hidden) {
                            const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0) + 1;
                            startTitleNotificationRef(totalUnread);
                        }
                    }
                }
            }
        };
        window.addEventListener('student-ws-message', handler);
        return () => window.removeEventListener('student-ws-message', handler);
    }, [selectedStudent, location.pathname, unreadCounts]);

    // --- FUNCIONES AUXILIARES ---

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent) return;

        setSending(true);
        const tempId = 'opt-' + Date.now();
        const msgText = newMessage;

        try {
            const msgData = {
                student_id: selectedStudent.id,
                message: msgText,
                type: 'text',
                category: 'support',
                sender_role: 'admin'
            };

            const optimMsg = {
                ...msgData,
                id: tempId,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, optimMsg]);
            setNewMessage('');
            setTimeout(scrollToBottom, 50);

            await axios.post('/chat/support/send', msgData);
        } catch (error) {
            console.error("Error sending message:", error);
            // Opcional: Mostrar error visual o reintentar
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Rollback simple
            toast.error("Error al enviar mensaje");
        } finally {
            setSending(false);
        }
    };

    const getInitials = (name) => {
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0]?.substring(0, 2).toUpperCase() || '?';
    };

    // Filtrado de estudiantes para la búsqueda
    const filteredStudents = useMemo(() => {
        if (!debouncedSearchTerm) return students;
        const lowerTerm = debouncedSearchTerm.toLowerCase();
        return students.filter(s =>
            s.name.toLowerCase().includes(lowerTerm) ||
            s.grupo.toLowerCase().includes(lowerTerm)
        );
    }, [students, debouncedSearchTerm]);

    // --- RENDERIZADO ---

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 mx-4 my-6">

            {/* 
               SIDEBAR - LISTA DE ESTUDIANTES
               Mobile: W-full (oculto si hay selectedStudent)
               Desktop: W-80 o W-96 (siempre visible)
            */}
            <div className={`
                flex flex-col bg-slate-50 border-r border-slate-200 transition-all duration-300
                w-full md:w-80 lg:w-96
                ${selectedStudent ? 'hidden md:flex' : 'flex'}
            `}>
                {/* Header Sidebar */}
                <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
                    <h2 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <span>💬</span> Soporte Técnico
                    </h2>
                    <div className="relative group">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o grupo..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent border rounded-lg text-sm 
                                     focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Icons.Search />
                        </span>
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="text-xs text-slate-400">Cargando chats...</span>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-400">
                            <Icons.Search />
                            <p className="text-sm font-medium mt-2">No se encontraron estudiantes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredStudents.map(s => {
                                const unreadCount = unreadCounts[s.id] || 0;
                                const isSelected = selectedStudent?.id === s.id;

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className={`w-full p-4 flex items-center gap-3 transition-all duration-200 text-left relative group
                                            ${isSelected ? 'bg-white border-l-4 border-indigo-600 shadow-sm' : 'hover:bg-white hover:pl-5 border-l-4 border-transparent'}
                                        `}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-sm">
                                                {s.avatar ? (
                                                    <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{getInitials(s.name)}</span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-sm border-2 border-white animate-bounce">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className={`font-semibold truncate text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                    {s.name}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                                <span className="bg-slate-200 px-1.5 rounded text-[10px] font-medium text-slate-600">
                                                    {s.grupo}
                                                </span>
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 
               CHAT AREA 
               Mobile: W-full (visible si hay selectedStudent)
               Desktop: Flex-1
            */}
            <div className={`
                flex-col bg-[#FDFDFD] relative
                flex-1 w-full
                ${selectedStudent ? 'flex' : 'hidden md:flex'}
            `}>
                {selectedStudent ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between z-10 sticky top-0">
                            <div className="flex items-center gap-3">
                                {/* Botón volver (Mobile Only) */}
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Icons.Back />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-slate-100">
                                    {selectedStudent.avatar ? (
                                        <img src={selectedStudent.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-indigo-600">{getInitials(selectedStudent.name)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                        {selectedStudent.name}
                                    </h3>
                                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        En línea
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mensajes Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 scroll-smooth"
                            ref={chatContainerRef}
                            style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        >
                            {loadingChat ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                                    <Icons.Empty />
                                    <p className="text-slate-500 font-medium text-sm mt-3">Comienza la conversación</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_role === 'admin';

                                    return (
                                        <div key={msg.id} className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`px-4 py-2 shadow-sm text-[15px] break-words relative transition-all
                                                        ${isMe
                                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                            : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 px-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        <span className={`text-indigo-600 opacity-80 ${isLast && sending ? 'animate-pulse' : ''}`}>
                                                            <Icons.Check />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                                <div className="flex-1 bg-slate-100 rounded-2xl border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all flex items-center">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        aria-label="Escribe un mensaje de soporte"
                                        className="w-full bg-transparent border-none px-4 py-3 focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400 max-h-32"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                                >
                                    <Icons.Send />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* EMPTY STATE DESKTOP */
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <svg className="w-16 h-16 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-700">Soporte Técnico</h2>
                        <p className="text-slate-500 mt-2 max-w-xs text-center">
                            Selecciona un estudiante de la lista para ver su historial y responder consultas.
                        </p>
                    </div>
                ))}
            </div>
        </div>
        <Toaster position="top-right" />
    );
};

export default ChatAdmin;