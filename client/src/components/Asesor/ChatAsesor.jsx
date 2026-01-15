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
                        // const isInChatRoute = location.pathname === '/asesor/chat';
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
        const compressionThreshold = 1 * 1024 * 1024; 
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
    // INTERFAZ VISUAL MEJORADA (PERO CON LA ESTRUCTURA DE LÓGICA ORIGINAL)
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
            
            {/* SIDEBAR */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-slate-700">Mis Estudiantes</h2>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                            {students.length}
                        </span>
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                        <span className="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                            <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                            <span className="text-xs">Cargando...</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100/50">
                            {students.map(s => {
                                const unreadCount = unreadCounts[s.id] || 0;
                                const isOnline = onlineStudents.has(s.id);
                                const isSelected = selectedStudent?.id === s.id;
                                
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
                                        className={`w-full p-3 flex items-center gap-3 transition-all duration-200 text-left relative group
                                            ${isSelected 
                                                ? 'bg-white border-l-4 border-indigo-600 shadow-sm z-10' 
                                                : 'hover:bg-white border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden 
                                                ${isSelected ? 'ring-2 ring-indigo-100' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {s.avatar ? (
                                                    <img
                                                        src={s.avatar}
                                                        alt={s.name}
                                                        className="w-full h-full object-cover absolute inset-0"
                                                        style={{ zIndex: 1 }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="w-full h-full flex items-center justify-center rounded-full absolute inset-0"
                                                    style={{ display: s.avatar ? 'none' : 'flex', zIndex: 1 }}
                                                >
                                                    {getInitials(s.name)}
                                                </div>
                                            </div>
                                            {isOnline && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" style={{ zIndex: 10 }}></div>
                                            )}
                                            {unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm ring-2 ring-white animate-pulse" style={{ zIndex: 10 }}>
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold truncate text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{s.name}</p>
                                            </div>
                                            <p className="text-xs text-slate-400 truncate">Grupo: {s.grupo}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {selectedStudent ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between z-20 h-16">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-slate-800 text-sm">{selectedStudent.name}</h3>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full font-medium">Estudiante</span>
                                {onlineStudents.has(selectedStudent.id) && (
                                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        En línea
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mensajes - Manteniendo la lógica de renderizado original */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50">
                            {loadingChat ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                                    <p className="font-medium">Inicia la conversación</p>
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
                                        <div key={idx} className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                
                                                <div className={`px-4 py-3 shadow-sm relative text-sm
                                                    ${isMe
                                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
                                                    }`}>
                                                    
                                                    {isImage && (
                                                        <div className="mb-2 -mx-1">
                                                            <img 
                                                                src={fileUrl} 
                                                                alt="Imagen adjunta" 
                                                                className="max-w-full rounded-lg object-contain bg-black/5"
                                                                style={{ maxHeight: '250px' }}
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Mantengo lógica original de PDF con los iframes */}
                                                    {isPdf && (
                                                        <div className="mb-2 -mx-1">
                                                            <div className="bg-slate-100 rounded-lg p-1 border border-slate-200">
                                                                {pdfViewerFailed[msg.id || idx] ? (
                                                                    <iframe
                                                                        src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`}
                                                                        className="w-full rounded bg-white"
                                                                        title={fileName}
                                                                        style={{ height: '300px', minHeight: '200px' }}
                                                                        allowFullScreen
                                                                    />
                                                                ) : (
                                                                    <iframe
                                                                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                                                        className="w-full rounded bg-white"
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
                                                                <div className="mt-2 flex gap-2 justify-center flex-wrap">
                                                                    <a
                                                                        href={fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                                            isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                                        }`}
                                                                    >
                                                                        Abrir nueva pestaña
                                                                    </a>
                                                                    <a
                                                                        href={fileUrl}
                                                                        download
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                                            isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white'
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
                                                                className={`flex items-center gap-2 underline text-xs ${isMe ? 'text-indigo-100' : 'text-indigo-600'}`}
                                                            >
                                                                <AttachIcon className="w-4 h-4" /> {fileName}
                                                            </a>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Fallback original */}
                                                    {msg.file_path && !isImage && !isPdf && !isFile && (
                                                         <div className="mb-2">
                                                            <a 
                                                                href={fileUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-2 underline text-xs ${isMe ? 'text-indigo-100' : 'text-indigo-600'}`}
                                                            >
                                                                <AttachIcon className="w-4 h-4" /> {fileName}
                                                            </a>
                                                        </div>
                                                    )}

                                                    {msg.message && <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>}
                                                </div>
                                                
                                                <span className={`text-[10px] mt-1 px-1 font-medium ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
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

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200 z-20">
                            {selectedFile && (
                                <div className="mb-2 animate-fade-in-up">
                                    <div className="inline-flex items-center gap-3 p-1.5 pr-3 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
                                        <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600">
                                            <AttachIcon className="w-3 h-3"/>
                                        </div>
                                        <span className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                                            {selectedFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="ml-2 text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
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
                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-95 flex items-center justify-center"
                                    title="Adjuntar archivo"
                                >
                                    <AttachIcon className="w-5 h-5" />
                                </button>
                                
                                <div className="flex-1 bg-slate-100 rounded-xl border border-transparent focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="w-full bg-transparent px-3 py-2.5 focus:outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                                    className="p-2.5 rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center"
                                >
                                    {sending ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                            <span className="text-2xl">💬</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Selecciona un estudiante</p>
                    </div>
                )}
            </div>
        </div>
        
        </>
    );
};

export default ChatAsesor;