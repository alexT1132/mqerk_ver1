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
const NOTIFICATION_SOUND = '/public/notification-sound-for-whatsapp.mp3';

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

    // --- NUEVOS ESTADOS PARA IMÁGENES ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const [viewerImage, setViewerImage] = useState(null);

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
            let finalFile = file;
            if (file.size > maxSize) {
                setCompressing(true);
                setCompressionProgress({
                    progress: 0,
                    message: `⚠️ Archivo pesado detectado (${formatFileSize(file.size)}). Comprimiendo...`
                });
                finalFile = await compressFile(file, (progress, message) => {
                    setCompressionProgress({
                        progress,
                        message: `⚠️ Reduciendo tamaño... ${message}`
                    });
                });

                if (finalFile.size > maxSize) {
                    showModal('error', 'Imposible enviar', `Aun comprimido, el archivo pesa ${formatFileSize(finalFile.size)}. El límite es 5MB.`);
                    e.target.value = '';
                    setCompressing(false);
                    return;
                }
                setCompressing(false);
            } else if (file.size > compressionThreshold && file.type.startsWith('image/')) {
                setCompressing(true);
                setCompressionProgress({
                    progress: 0,
                    message: 'Optimizando imagen para carga rápida...'
                });
                finalFile = await compressFile(file, (progress, message) => {
                    setCompressionProgress({ progress, message });
                });
                setCompressing(false);
            }

            setSelectedFile(finalFile);
            if (finalFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(finalFile);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }

        } catch (error) {
            console.error('Error procesando archivo:', error);
            setCompressing(false);
            if (error.message === 'NOT_SUPPORTED_TYPE') {
                showModal('warning', 'Atención', 'Este archivo no se puede optimizar, se intentará enviar original.');
                setSelectedFile(file);
                if (file.type.startsWith('image/')) {
                    setPreviewUrl(URL.createObjectURL(file));
                }
            } else {
                showModal('error', 'Error', 'No se pudo procesar el archivo. Intenta con otro más ligero.');
                e.target.value = '';
            }
        }
    };

    const handleRemoveFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
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
                isOptimistic: true,
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

    // ----------------------------------------------------------------------
    // INTERFAZ VISUAL PREMIUM (Update Step 1284)
    // ----------------------------------------------------------------------

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    return (
        <div className="flex flex-col h-full relative p-4 font-sans text-slate-600 sm:h-[calc(100vh-1rem)] overflow-hidden">
            <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

            {/* MODALES Y STATUS */}
            {compressing && (
                <FileCompressionIndicator
                    isOpen={compressing}
                    progress={compressionProgress.progress}
                    message={compressionProgress.message}
                    fileName={fileInputRef.current?.files?.[0]?.name || 'Archivo'}
                    onCancel={() => {
                        setCompressing(false);
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

            <div className="flex flex-1 overflow-hidden bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5">

                {/* SIDEBAR DE ESTUDIANTES */}
                <aside className="w-80 flex flex-col border-r border-slate-100 bg-white z-20">
                    <div className="p-5 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mensajes</h2>
                            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                {students.length}
                            </span>
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Buscar estudiante..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm 
                                         focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none placeholder:text-slate-400"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                        {loading ? (
                            <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-3"></div>
                                <span className="text-xs font-medium">Cargando lista...</span>
                            </div>
                        ) : (
                            <div className="px-3 py-2 space-y-1">
                                {students.map(s => {
                                    const itemKey = `${s.tipo || 'estudiante'}-${s.id}`;
                                    const unreadCount = (s.tipo === 'admin') ? adminUnreadCount : (unreadCounts[s.id] || 0);
                                    const isOnline = (s.tipo === 'admin') ? false : onlineStudents.has(s.id);
                                    const isSelected = (selectedStudent?.id === s.id) && (selectedStudent?.tipo === s.tipo);

                                    const getInitials = (name) => {
                                        const parts = name.trim().split(' ').filter(Boolean);
                                        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0]?.substring(0, 2).toUpperCase() || '?';
                                    };

                                    return (
                                        <button
                                            key={itemKey}
                                            onClick={() => setSelectedStudent(s)}
                                            className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group relative
                                                ${isSelected
                                                    ? 'bg-violet-50 text-violet-900 shadow-sm ring-1 ring-violet-100'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden transition-transform group-hover:scale-105
                                                    ${isSelected ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {s.avatar ? (
                                                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <div className="w-full h-full flex items-center justify-center" style={{ display: s.avatar ? 'none' : 'flex' }}>
                                                        {getInitials(s.name)}
                                                    </div>
                                                </div>
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
                                                )}
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex justify-between items-baseline">
                                                    <p className="font-semibold text-sm truncate">{s.name}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {s.tipo === 'admin'
                                                        ? <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">ADMIN</span>
                                                        : <span className="text-xs text-slate-400 truncate group-hover:text-slate-500">Grupo {s.grupo}</span>
                                                    }
                                                </div>
                                            </div>

                                            {/* Active indicator bar */}
                                            {isSelected && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-violet-600 rounded-r-md"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                {/* AREA DE CHAT */}
                <main className="flex-1 flex flex-col bg-slate-50/30 relative min-w-0">
                    {selectedStudent ? (
                        <>
                            {/* Header del Chat */}
                            <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner font-bold text-slate-500 text-sm relative">
                                            {selectedStudent.avatar ? (
                                                <img src={selectedStudent.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            ) : null}
                                            <div className="w-full h-full flex items-center justify-center" style={{ display: selectedStudent.avatar ? 'none' : 'flex' }}>
                                                {selectedStudent.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        {selectedStudent.tipo !== 'admin' && onlineStudents.has(selectedStudent.id) && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 leading-tight">{selectedStudent.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {selectedStudent.tipo !== 'admin' && onlineStudents.has(selectedStudent.id) ? (
                                                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> En línea
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {selectedStudent.tipo === 'admin' ? 'Soporte y Administración' : 'Estudiante'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Actions could go here */}
                                </div>
                            </header>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                                {loadingChat ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
                                        <p className="text-slate-400 text-sm animate-pulse">Cargando conversación...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-4 text-4xl">👋</div>
                                        <h4 className="text-lg font-semibold text-slate-700">¡Comienza la charla!</h4>
                                        <p className="text-sm text-slate-500 max-w-xs mt-2">Envía un mensaje para iniciar la conversación con {selectedStudent.name}.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = (String(msg.sender_role || '').toLowerCase() === 'asesor');
                                        const fileUrl = msg.file_path ? (msg.isOptimistic ? msg.file_path : buildStaticUrl(msg.file_path)) : null;
                                        const fileName = msg.file_path?.split('/').pop() || 'Archivo';
                                        const isImage = (msg.type === 'image' || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && fileUrl;
                                        const isPdf = (msg.type === 'file' || fileName.endsWith('.pdf')) && fileUrl;

                                        return (
                                            <div key={msg.id || idx} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

                                                    {/* Burbuja de Texto */}
                                                    {msg.message && (
                                                        <div className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed break-words
                                                            ${isMe
                                                                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                                : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'
                                                            }`}>
                                                            {msg.message}
                                                        </div>
                                                    )}

                                                    {/* Archivos Adjuntos */}
                                                    {(isImage || isPdf || msg.file_path) && (
                                                        <div className={`mt-2 p-1 rounded-xl overflow-hidden ${isMe ? '' : 'bg-white border border-slate-100 shadow-sm'}`}>
                                                            {isImage ? (
                                                                <div
                                                                    className="relative group/img cursor-zoom-in"
                                                                    onClick={() => setViewerImage(fileUrl)}
                                                                >
                                                                    <img src={fileUrl} alt="Adjunto" className="max-w-xs max-h-64 rounded-lg object-contain bg-slate-100 transition-transform hover:scale-[1.02]" />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                                                        <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            ) : isPdf ? (
                                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg min-w-[200px]">
                                                                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">PDF</div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-slate-700 truncate">{fileName}</p>
                                                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Ver documento</a>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                                    <AttachIcon className="w-4 h-4 text-slate-500" />
                                                                    <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{fileName}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Metabox del mensaje */}
                                                    <div className={`mt-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-medium text-slate-400 select-none
                                                        ${isMe ? 'pr-1' : 'pl-1'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <span>· Enviado</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 sm:p-5 bg-white border-t border-slate-100">
                                {selectedFile && (
                                    <div className="mb-3 flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-xl animate-in slide-in-from-bottom-2">
                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm text-violet-600 overflow-hidden shrink-0 border border-violet-100">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                selectedFile.type.startsWith('image/')
                                                    ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-violet-900 truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-violet-600 font-medium">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                        <button onClick={handleRemoveFile} className="p-1.5 hover:bg-violet-200 rounded-full text-violet-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={(e) => { e.preventDefault(); handleSend(e); }} className="flex items-end gap-2 relative">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={sending}
                                        className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all disabled:opacity-50"
                                        title="Adjuntar archivo"
                                    >
                                        <AttachIcon className="w-6 h-6" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                    />

                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Escribe un mensaje..."
                                            className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20 max-h-32 min-h-[50px] resize-none shadow-sm scrollbar-none"
                                            rows={1}
                                            style={{ minHeight: '52px' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedFile) || sending}
                                        className={`p-3 rounded-xl shadow-lg shadow-violet-200 transition-all duration-200 flex items-center justify-center
                                            ${(!newMessage.trim() && !selectedFile) || sending
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                                : 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-violet-300 hover:-translate-y-0.5 active:translate-y-0'}`}
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5 translate-x-0.5 translate-y-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                            </svg>
                                        )}
                                    </button>
                                </form>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-slate-300 font-medium">Presiona Enter para enviar</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Estado vacío (sin chat seleccionado)
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-80">
                            <div className="w-32 h-32 bg-violet-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                                <svg className="w-16 h-16 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">Chat del Asesor</h2>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                Selecciona un estudiante del panel izquierdo para ver el historial, responder consultas y dar seguimiento personalizado.
                            </p>
                            <div className="mt-8 flex gap-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Offline</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* LIGHTBOX DE IMÁGENES */}
            {viewerImage && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setViewerImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                        onClick={(e) => { e.stopPropagation(); setViewerImage(null); }}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <img
                        src={viewerImage}
                        alt="Vista ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
                        Click fuera para cerrar
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAsesor;