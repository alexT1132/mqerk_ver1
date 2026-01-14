import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMisEstudiantes } from '../../api/asesores';
import axios from '../../api/axios';
import { buildStaticUrl } from '../../utils/url';
import { useLocation } from 'react-router-dom';
import { compressFile, formatFileSize } from '../../utils/fileCompression';
import FileCompressionIndicator from '../shared/FileCompressionIndicator';
import StatusModal from '../shared/StatusModal'; // IMPORTAR EL MODAL

// Sonido de notificación
const NOTIFICATION_SOUND = '/notification-sound-for-whatsapp.mp3';

// Ícono de adjuntar archivo
const AttachIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);

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
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [pdfViewerFailed, setPdfViewerFailed] = useState({});
    const [onlineStudents, setOnlineStudents] = useState(new Set()); // Set de IDs de estudiantes online
    
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
            }).catch(e => { });
        }
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
        unlockAudio();
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
                setStudents(processed);

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
        
        const interval = setInterval(loadOnlineStatus, 10000);
        return () => clearInterval(interval);
    }, [user, location.state]);

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
                const res = await axios.get(`/chat/history?student_id=${selectedStudent.id}`);
                const newMessages = Array.isArray(res.data.data) ? [...res.data.data] : [];

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

                await axios.post('/chat/read', { student_id: selectedStudent.id });
                window.dispatchEvent(new CustomEvent('advisor-chat-update'));
            } catch (error) {
                console.error("Error loading chat:", error);
            } finally {
                if (!isBackground) setLoadingChat(false);
            }
        }
        loadChat(false);

        const interval = setInterval(() => loadChat(true), 10000);
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
                        const isInChatRoute = location.pathname === '/asesor/chat';
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

    // -------------------------------------------------------------
    // LÓGICA DE ARCHIVOS MEJORADA (COMPRESIÓN + MODAL + MENSAJE)
    // -------------------------------------------------------------
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Configuración de límites
        const MAX_SIZE_MB = 5;
        const maxSize = MAX_SIZE_MB * 1024 * 1024; // 5MB
        const compressionThreshold = 1 * 1024 * 1024; // 1MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        
        // 1. Validación de Tipo
        if (!allowedTypes.includes(file.type)) {
            showModal('warning', 'Archivo no compatible', 'Solo permitimos imágenes (JPG, PNG) y documentos PDF.');
            e.target.value = '';
            return;
        }

        try {
            // CASO A: Archivo MUY GRANDE (> 5MB) - Compresión Obligatoria
            if (file.size > maxSize) {
                setCompressing(true);
                
                // Mensaje Inicial con icono persistente
                setCompressionProgress({ 
                    progress: 0, 
                    message: `⚠️ Archivo pesado detectado (${formatFileSize(file.size)}). Comprimiendo...` 
                });

                const compressedFile = await compressFile(file, (progress, message) => {
                    // Mantenemos el icono de alerta
                    setCompressionProgress({ 
                        progress, 
                        message: `⚠️ Reduciendo tamaño... ${message}` 
                    });
                });

                // Si aún comprimido sigue siendo gigante
                if (compressedFile.size > maxSize) {
                    showModal('error', 'Imposible enviar', `Aun comprimido, el archivo pesa ${formatFileSize(compressedFile.size)}. El límite es 5MB.`);
                    e.target.value = '';
                    setCompressing(false);
                    return;
                }

                setSelectedFile(compressedFile);
                setCompressing(false);

            // CASO B: Archivo mediano (1MB - 5MB) - Optimización recomendada
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

            // CASO C: Archivo ligero - Pasa directo
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
            const formData = new FormData();
            formData.append('student_id', selectedStudent.id);
            formData.append('message', newMessage || '');
            formData.append('type', 'text');
            formData.append('sender_role', 'asesor');

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            // Optimistic Update
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

    return (
        <>
            {/* COMPONENTES DE ESTADO Y MODAL */}
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
                                const isOnline = onlineStudents.has(s.id);
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
                                            {/* Indicador de estado online */}
                                            {isOnline && (
                                                <div
                                                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                                                    style={{ zIndex: 10 }}
                                                    title="En línea"
                                                />
                                            )}
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
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-700 truncate">{s.name}</p>
                                                {isOnline && (
                                                    <span className="text-[10px] text-green-600 font-medium">●</span>
                                                )}
                                            </div>
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
                                {onlineStudents.has(selectedStudent.id) && (
                                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        En línea
                                    </span>
                                )}
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
                                    const fileUrl = msg.file_path ? (msg.isOptimistic ? msg.file_path : buildStaticUrl(msg.file_path)) : null;
                                    const fileName = msg.file_path?.split('/').pop() || 'Archivo';
                                    
                                    const fileExt = fileName.toLowerCase().split('.').pop();
                                    const isImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                                    const isPdfExt = fileExt === 'pdf';
                                    
                                    const isImage = (msg.type === 'image' || (msg.file_path && isImageExt)) && fileUrl;
                                    const isFile = (msg.type === 'file' || (msg.file_path && isPdfExt)) && fileUrl;
                                    const isPdf = isFile;
                                    
                                    return (
                                        <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                                                    }`}>
                                                    {isImage && (
                                                        <div className="mb-2">
                                                            <img 
                                                                src={fileUrl} 
                                                                alt="Imagen adjunta" 
                                                                className="max-w-full max-h-64 rounded-lg object-contain"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {isPdf && (
                                                        <div className="mb-2 -mx-2">
                                                            <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
                                                                {pdfViewerFailed[msg.id || idx] ? (
                                                                    <iframe
                                                                        src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`}
                                                                        className="w-full rounded-lg border-2 border-slate-300 bg-white"
                                                                        title={fileName}
                                                                        style={{ height: '400px', minHeight: '300px' }}
                                                                        allowFullScreen
                                                                    />
                                                                ) : (
                                                                    <iframe
                                                                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                                                        className="w-full rounded-lg border-2 border-slate-300 bg-white"
                                                                        title={fileName}
                                                                        style={{ height: '400px', minHeight: '300px' }}
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
                                                                <div className="mt-2 flex gap-2 justify-center flex-wrap">
                                                                    <a
                                                                        href={fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                                            isMe 
                                                                                ? 'bg-white/20 hover:bg-white/30 text-white' 
                                                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                                        }`}
                                                                    >
                                                                        Abrir en nueva pestaña
                                                                    </a>
                                                                    <a
                                                                        href={fileUrl}
                                                                        download
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                                            isMe 
                                                                                ? 'bg-white/20 hover:bg-white/30 text-white' 
                                                                                : 'bg-slate-600 hover:bg-slate-700 text-white'
                                                                        }`}
                                                                    >
                                                                        Descargar PDF
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isFile && !isPdf && !isImage && (
                                                        <div className="mb-2">
                                                            <a 
                                                                href={fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}
                                                            >
                                                                <AttachIcon /> {fileName}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {msg.file_path && !isImage && !isPdf && !isFile && (
                                                        <div className="mb-2">
                                                            <a 
                                                                href={fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}
                                                            >
                                                                <AttachIcon /> {fileName}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
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
                            {selectedFile && (
                                <div className="mb-2 flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                                    <span className="text-sm text-indigo-700 flex-1 truncate">
                                        <AttachIcon /> {selectedFile.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSend} className="flex gap-2">
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
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center"
                                    title="Adjuntar archivo"
                                >
                                    <AttachIcon />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Escribir mensaje..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition"
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || sending}
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
        </>
    );
};

export default ChatAsesor;