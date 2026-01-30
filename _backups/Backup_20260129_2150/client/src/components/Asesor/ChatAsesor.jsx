import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMisEstudiantes } from '../../api/asesores';
import axios from '../../api/axios';
import { buildStaticUrl } from '../../utils/url';
import { useLocation } from 'react-router-dom';
import { compressFile, formatFileSize } from '../../utils/fileCompression';
import FileCompressionIndicator from '../shared/FileCompressionIndicator';
import StatusModal from '../shared/StatusModal';

// Sonido de notificación
const NOTIFICATION_SOUND = '/notification-sound-for-whatsapp.mp3';

// Ícono de adjuntar archivo (Estilizado)
const AttachIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);

const ChatAsesor = () => {
    // ----------------------------------------------------------------------
    // LÓGICA ORIGINAL (INTACTA)
    // ----------------------------------------------------------------------
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
    const [unreadCounts, setUnreadCounts] = useState({});
    const [adminUnreadCount, setAdminUnreadCount] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [pdfViewerFailed, setPdfViewerFailed] = useState({});
    const [onlineStudents, setOnlineStudents] = useState(new Set());

    // --- ESTADOS DE COMPRESIÓN Y MODAL ---
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState({ progress: 0, message: '' });
    const [modalData, setModalData] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    // Audio Ref para persistencia y unlock
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));
    const audioUnlocked = useRef(false);
    const titleInterval = useRef(null);
    const originalTitle = useRef(document.title);

    // --- HELPER PARA MOSTRAR MODAL ---
    const showModal = (type, title, message) => {
        setModalData({ isOpen: true, type, title, message });
    };

    // Función para desbloquear el audio
    const unlockAudio = () => {
        if (audioUnlocked.current) return;
        const p = audioRef.current.play();
        if (p) {
            p.then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioUnlocked.current = true;
            }).catch(e => { /* Silenciar errores de autoplay */ });
        }
    };

    const playSound = () => {
        try {
            if (!audioUnlocked.current) unlockAudio();
            if (!audioRef.current) return;
            audioRef.current.volume = 0.5;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        } catch { }
    };

    // Función para detener notificación de título
    const stopTitleNotification = () => {
        if (titleInterval.current) {
            clearInterval(titleInterval.current);
            titleInterval.current = null;
            document.title = originalTitle.current;
        }
    };

    // Unlock audio on mount and user interaction
    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio();
        };
        unlockAudio(); // Desbloquea al montar si es posible
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    // Cargar estado online de estudiantes
    const loadOnlineStatus = async () => {
        try {
            const res = await axios.get('/chat/students/online');
            if (res.data?.data) {
                setOnlineStudents(new Set(res.data.data));
            }
        } catch (error) {
            console.error("Error loading online status:", error);
        }
    };

    // Cargar estudiantes
    useEffect(() => {
        async function loadStudents() {
            setLoading(true);
            try {
                const grupoAsesor = user?.grupo_asesor || user?.asesor_profile?.grupo_asesor || null;
                const params = grupoAsesor ? { grupo: grupoAsesor } : undefined;
                const { data } = await getMisEstudiantes(params);
                const list = Array.isArray(data?.data) ? data.data : (data || []);
                const processed = list
                    .filter(s => s.estatus === 'Activo')
                    .map(s => ({
                        id: s.id,
                        name: `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim(),
                        avatar: s.foto ? buildStaticUrl(s.foto) : "",
                        grupo: s.grupo || ""
                    }));
                // Insertar contacto especial para chat con Admin
                setStudents([
                    { id: 'admin', name: 'Administrador', avatar: '', grupo: '', tipo: 'admin' },
                    ...processed.map(s => ({ ...s, tipo: 'estudiante' }))
                ]);
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
        loadUnreadCounts();
        loadOnlineStatus();
        const interval = setInterval(loadOnlineStatus, 10000); // Actualiza cada 10 segundos
        return () => clearInterval(interval);
    }, [user, location.state]);

    // Al abrir el hilo con Admin, limpiar badge local
    useEffect(() => {
        if (selectedStudent?.tipo === 'admin') {
            setAdminUnreadCount(0);
        }
    }, [selectedStudent?.id, selectedStudent?.tipo]);

    const loadUnreadCounts = async () => {
        try {
            const res = await axios.get('/chat/unread/count');
            const counts = res.data?.data?.by_student || {};
            setUnreadCounts(counts);
        } catch (e) {
            console.error('Error loading unread counts:', e);
        }
    };

    useEffect(() => {
        const handler = () => loadUnreadCounts();
        window.addEventListener('advisor-chat-update', handler);
        return () => window.removeEventListener('advisor-chat-update', handler);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                stopTitleNotification();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopTitleNotification();
        };
    }, []);

    useEffect(() => {
        if (!selectedStudent) return;
        async function loadChat(isBackground = false) {
            if (!isBackground) setLoadingChat(true);
            try {
                let newMessages = [];
                if (selectedStudent.tipo === 'admin') {
                    const res = await axios.get('/chat/admin-asesor/history');
                    newMessages = Array.isArray(res.data?.data) ? [...res.data.data] : [];
                } else {
                    const res = await axios.get(`/chat/history?student_id=${selectedStudent.id}`);
                    newMessages = Array.isArray(res.data.data) ? [...res.data.data] : [];
                }
                setMessages(prev => {
                    if (isBackground) {
                        if (prev.length === newMessages.length &&
                            JSON.stringify(prev[prev.length - 1]) === JSON.stringify(newMessages[newMessages.length - 1])) {
                            return prev;
                        }
                    }
                    return newMessages;
                });
                if (!isBackground) {
                    setTimeout(() => scrollToBottom(true), 0);
                    setTimeout(() => scrollToBottom(true), 100);
                    setTimeout(() => scrollToBottom(true), 300);
                } else if (newMessages.length > messages.length) {
                    setTimeout(() => scrollToBottom(false), 100);
                }
                if (selectedStudent.tipo !== 'admin') {
                    await axios.post('/chat/read', { student_id: selectedStudent.id });
                    window.dispatchEvent(new CustomEvent('advisor-chat-update'));
                }
            } catch (error) {
                console.error("Error loading chat:", error);
            } finally {
                if (!isBackground) setLoadingChat(false);
            }
        }
        loadChat(false);
        const interval = setInterval(() => loadChat(true), 10000); // Actualiza cada 10 segundos
        return () => clearInterval(interval);
    }, [selectedStudent]);

    useEffect(() => {
        if (messages.length > 0 && !loadingChat) {
            requestAnimationFrame(() => {
                setTimeout(() => scrollToBottom(true), 0);
            });
        }
    }, [messages.length, loadingChat]);

    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            if (data?.type === 'admin_asesor_message' && data.data) {
                const msg = data.data;
                // Dedup / reemplazo optimista
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    const optimIdx = prev.findIndex(m =>
                        String(m.id).startsWith('opt-') &&
                        m.sender_role === msg.sender_role &&
                        String(m.message || '').trim() === String(msg.message || '').trim() &&
                        Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 20000
                    );
                    if (optimIdx !== -1) {
                        const next = [...prev];
                        next[optimIdx] = msg;
                        return next;
                    }
                    return [...prev, msg];
                });

                // Notificación (solo si viene de admin y no estamos viendo el hilo admin abierto y visible)
                const isFromAdmin = String(msg.sender_role || '').toLowerCase() === 'admin';
                const isInAdminThread = selectedStudent?.tipo === 'admin';
                const shouldNotify = isFromAdmin && (!isInAdminThread || document.hidden);
                if (shouldNotify) {
                    playSound();
                    setAdminUnreadCount(c => c + 1);
                }

                if (selectedStudent?.tipo === 'admin') {
                    setTimeout(scrollToBottom, 100);
                }
                return;
            }

            if (data?.type === 'chat_message' && data.data) {
                const msg = data.data;
                if (selectedStudent && (msg.student_id === selectedStudent.id)) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        const optimIdx = prev.findIndex(m =>
                            String(m.id).startsWith('opt-') &&
                            (m.sender_role === msg.sender_role || (['asesor', 'admin'].includes(m.sender_role) && ['asesor', 'admin'].includes(msg.sender_role))) &&
                            m.message.trim() === msg.message.trim() &&
                            Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 20000
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
                        axios.post('/chat/read', { student_id: selectedStudent.id }).catch(() => { });
                        setTimeout(() => window.dispatchEvent(new CustomEvent('advisor-chat-update')), 500);
                    }
                } else {
                    if (msg.sender_role === 'estudiante') {
                        window.dispatchEvent(new CustomEvent('advisor-chat-update'));
                    }
                }
            }
        };
        window.addEventListener('student-ws-message', handler);
        return () => window.removeEventListener('student-ws-message', handler);
    }, [selectedStudent, location.pathname, unreadCounts]);

    const scrollToBottom = (instant = false) => {
        if (instant) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE_MB = 5;
        const maxSize = MAX_SIZE_MB * 1024 * 1024;
        const compressionThreshold = 1 * 1024 * 1024; // 1MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            showModal('warning', 'Archivo no compatible', 'Solo permitimos imágenes (JPG, PNG) y documentos PDF.');
            e.target.value = '';
            return;
        }

        try {
            if (file.size > maxSize) {
                setCompressing(true);
                setCompressionProgress({
                    progress: 0,
                    message: `⚠️ Archivo pesado detectado (${formatFileSize(file.size)}). Comprimiendo...`
                });
                const compressedFile = await compressFile(file, (progress, message) => {
                    setCompressionProgress({
                        progress,
                        message: `⚠️ Reduciendo tamaño... ${message}`
                    });
                });

                if (compressedFile.size > maxSize) {
                    showModal('error', 'Imposible enviar', `Aun comprimido, el archivo pesa ${formatFileSize(compressedFile.size)}. El límite es 5MB.`);
                    e.target.value = '';
                    setCompressing(false);
                    return;
                }
                setSelectedFile(compressedFile);
                setCompressing(false);
            } else if (file.size > compressionThreshold && file.type.startsWith('image/')) {
                setCompressing(true);
                setCompressionProgress({
                    progress: 0,
                    message: 'Optimizando imagen para carga rápida...'
                });
                const compressedFile = await compressFile(file, (progress, message) => {
                    setCompressionProgress({ progress, message });
                });
                setSelectedFile(compressedFile);
                setCompressing(false);
            } else {
                setSelectedFile(file);
            }
        } catch (error) {
            console.error('Error procesando archivo:', error);
            setCompressing(false);
            if (error.message === 'NOT_SUPPORTED_TYPE') {
                showModal('warning', 'Atención', 'Este archivo no se puede optimizar, se intentará enviar original.');
                setSelectedFile(file);
            } else {
                showModal('error', 'Error', 'No se pudo procesar el archivo. Intenta con otro más ligero.');
                e.target.value = '';
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedStudent) return;

        setSending(true);
        try {
            // Asesor -> Admin (solo texto por ahora)
            if (selectedStudent.tipo === 'admin') {
                const content = String(newMessage || '').trim();
                if (!content) return;

                const tempId = 'opt-' + Date.now();
                const optimMsg = {
                    id: tempId,
                    asesor_user_id: user?.id,
                    sender_user_id: user?.id,
                    sender_role: 'asesor',
                    message: content,
                    created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, optimMsg]);
                setNewMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(scrollToBottom, 50);

                const res = await axios.post('/chat/admin-asesor/send', { message: content });
                const saved = res.data?.message;
                if (saved?.id) {
                    setMessages(prev => prev.map(m => (String(m.id) === String(tempId) ? saved : m)));
                }
                return;
            }

            const formData = new FormData();
            formData.append('student_id', selectedStudent.id);
            formData.append('message', newMessage || '');
            formData.append('type', 'text');
            formData.append('sender_role', 'asesor');

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const optimMsg = {
                student_id: selectedStudent.id,
                message: newMessage || (selectedFile ? `Archivo: ${selectedFile.name}` : ''),
                type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
                sender_role: 'asesor',
                file_path: selectedFile ? URL.createObjectURL(selectedFile) : null,
                id: 'opt-' + Date.now(),
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, optimMsg]);
            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setTimeout(scrollToBottom, 50);

            await axios.post('/chat/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

        } catch (error) {
            console.error("Error sending message:", error);
            showModal('error', 'Error', 'No se pudo enviar el mensaje. Verifica tu conexión.');
        } finally {
            setSending(false);
        }
    };

    // ----------------------------------------------------------------------
    // INTERFAZ VISUAL MEJORADA
    // ----------------------------------------------------------------------

    return (
        <>
            {/* MODALES Y STATUS */}
            {compressing && (
                <FileCompressionIndicator
                    isOpen={compressing}
                    progress={compressionProgress.progress}
                    message={compressionProgress.message}
                    fileName={fileInputRef.current?.files?.[0]?.name || 'Archivo'}
                    onCancel={() => {
                        setCompressing(false);
                        // Recarga para limpiar estado de archivo si se cancela
                        window.location.reload();
                    }}
                />
            )}
            <StatusModal
                isOpen={modalData.isOpen}
                type={modalData.type}
                title={modalData.title}
                message={modalData.message}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
            />

            <div className="flex h-[calc(100vh-4rem)] bg-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden mx-4 my-4">
                {/* Sidebar de Estudiantes */}
                <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-gray-800 text-lg">Mis Estudiantes</h2>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                {students.length}
                            </span>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                                <span className="text-sm">Cargando...</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {students.map(s => {
                                    const itemKey = `${s.tipo || 'estudiante'}-${s.id}`;
                                    const unreadCount = (s.tipo === 'admin') ? adminUnreadCount : (unreadCounts[s.id] || 0);
                                    const isOnline = (s.tipo === 'admin') ? false : onlineStudents.has(s.id);
                                    const isSelected = (selectedStudent?.id === s.id) && (selectedStudent?.tipo === s.tipo);

                                    const getInitials = (name) => {
                                        const parts = name.trim().split(' ').filter(Boolean);
                                        if (parts.length >= 2) {
                                            return (parts[0][0] + parts[1][0]).toUpperCase();
                                        }
                                        return parts[0]?.substring(0, 2).toUpperCase() || '?';
                                    };

                                    return (
                                        <button
                                            key={itemKey}
                                            onClick={() => setSelectedStudent(s)}
                                            className={`w-full p-3 flex items-center gap-3 transition-all duration-150 text-left relative
                                                ${isSelected
                                                    ? 'bg-blue-50 border-l-4 border-blue-600 shadow-inner'
                                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm overflow-hidden
                                                    ${isSelected ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-200' : 'bg-gray-100 text-gray-700'}`}>
                                                    {s.avatar ? (
                                                        <img
                                                            src={s.avatar}
                                                            alt={s.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="w-full h-full flex items-center justify-center rounded-full absolute inset-0"
                                                        style={{ display: s.avatar ? 'none' : 'flex' }}
                                                    >
                                                        {getInitials(s.name)}
                                                    </div>
                                                </div>
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                                {unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 shadow-sm ring-1 ring-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>{s.name}</p>
                                                </div>
                                                {s.tipo === 'admin'
                                                    ? <p className="text-xs text-gray-500 truncate">Administración</p>
                                                    : <p className="text-xs text-gray-500 truncate">Grupo: {s.grupo}</p>
                                                }
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Área de Chat Principal */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedStudent ? (
                        <>
                            {/* Cabecera del Chat */}
                            <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold shadow-sm overflow-hidden">
                                        {selectedStudent.avatar ? (
                                            <img
                                                src={selectedStudent.avatar}
                                                alt={selectedStudent.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-full h-full flex items-center justify-center rounded-full absolute inset-0"
                                            style={{ display: selectedStudent.avatar ? 'none' : 'flex' }}
                                        >
                                            {selectedStudent.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                    </div>
                                    {(selectedStudent.tipo !== 'admin' && onlineStudents.has(selectedStudent.id)) && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900">{selectedStudent.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedStudent.tipo === 'admin' ? (
                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">Administrador</span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">Estudiante</span>
                                        )}
                                        {(selectedStudent.tipo !== 'admin' && onlineStudents.has(selectedStudent.id)) && (
                                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                En línea
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contenedor de Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {loadingChat ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <p className="font-medium">Inicia la conversación</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {[...messages]
                                            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                                            .map((msg, idx) => {
                                            const isMe = (selectedStudent?.tipo === 'admin')
                                                ? (String(msg.sender_role || '').toLowerCase() === 'asesor')
                                                : (String(msg.sender_role || '').toLowerCase() === 'asesor');
                                            const fileUrl = msg.file_path ? (msg.isOptimistic ? msg.file_path : buildStaticUrl(msg.file_path)) : null;
                                            const fileName = msg.file_path?.split('/').pop() || 'Archivo';
                                            const fileExt = fileName.toLowerCase().split('.').pop();
                                            const isImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                                            const isPdfExt = fileExt === 'pdf';
                                            const isImage = (msg.type === 'image' || (msg.file_path && isImageExt)) && fileUrl;
                                            const isFile = (msg.type === 'file' || (msg.file_path && isPdfExt)) && fileUrl;
                                            const isPdf = isFile;

                                            return (
                                                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        {/* Mensaje de texto */}
                                                        {msg.message && (
                                                            <div className={`px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm text-sm
                                                                ${isMe
                                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                                                    : 'bg-white text-gray-800 border border-gray-200'
                                                                }`}>
                                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                            </div>
                                                        )}

                                                        {/* Adjunto de Imagen */}
                                                        {isImage && (
                                                            <div className="mt-1">
                                                                <img
                                                                    src={fileUrl}
                                                                    alt="Imagen adjunta"
                                                                    className="max-w-full rounded-lg object-contain border border-gray-200 bg-white shadow-sm"
                                                                    style={{ maxHeight: '250px' }}
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Adjunto de PDF */}
                                                        {isPdf && (
                                                            <div className="mt-1">
                                                                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                                                                    {pdfViewerFailed[msg.id || idx] ? (
                                                                        <iframe
                                                                            src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`}
                                                                            className="w-full rounded"
                                                                            title={fileName}
                                                                            style={{ height: '300px', minHeight: '200px' }}
                                                                            allowFullScreen
                                                                        />
                                                                    ) : (
                                                                        <iframe
                                                                            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                                                            className="w-full rounded"
                                                                            title={fileName}
                                                                            style={{ height: '300px', minHeight: '200px' }}
                                                                            allowFullScreen
                                                                            type="application/pdf"
                                                                            onError={() => setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }))}
                                                                            onLoad={(e) => {
                                                                                try {
                                                                                    const iframe = e.target;
                                                                                    setTimeout(() => {
                                                                                        if (iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML.trim() === '') {
                                                                                            setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }));
                                                                                        }
                                                                                    }, 2000);
                                                                                } catch (err) {
                                                                                    setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }));
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <div className="mt-2 flex gap-2 justify-center">
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                                                                ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                                                        >
                                                                            Abrir en Nueva Pestaña
                                                                        </a>
                                                                        <a
                                                                            href={fileUrl}
                                                                            download
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                                                                ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                                                                        >
                                                                            Descargar
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Otros Archivos */}
                                                        {isFile && !isPdf && !isImage && (
                                                            <div className="mt-1">
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 underline text-xs ${isMe ? 'text-blue-100' : 'text-blue-600'}`}
                                                                >
                                                                    <AttachIcon className="w-4 h-4" /> {fileName}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Fallback para otros tipos de archivos */}
                                                        {msg.file_path && !isImage && !isPdf && !isFile && (
                                                            <div className="mt-1">
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 underline text-xs ${isMe ? 'text-blue-100' : 'text-blue-600'}`}
                                                                >
                                                                    <AttachIcon className="w-4 h-4" /> {fileName}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Timestamp */}
                                                        <span className={`text-xs mt-1 font-medium ${isMe ? 'text-blue-500' : 'text-gray-500'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isMe && <span className="ml-1 opacity-70">({msg.sender_role})</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Área de Entrada */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                {selectedFile && (
                                    <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                                        <AttachIcon className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                                <form onSubmit={handleSend} className="flex gap-2 items-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex items-center justify-center"
                                        title="Adjuntar archivo"
                                    >
                                        <AttachIcon className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 bg-gray-100 rounded-xl border border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Escribe un mensaje..."
                                            className="w-full bg-transparent px-4 py-3 focus:outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedFile) || sending}
                                        className={`p-2.5 rounded-full shadow-sm transition-all flex items-center justify-center
                                            ${(!newMessage.trim() && !selectedFile) || sending
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                            }`}
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <p className="text-gray-500 font-medium">Selecciona un estudiante para comenzar</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatAsesor;