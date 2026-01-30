import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { buildStaticUrl } from '../../utils/url';
import toast, { Toaster } from 'react-hot-toast';
// Asegúrate de importar también el StatusModal
import { compressFile, formatFileSize } from '../../utils/fileCompression';
import FileCompressionIndicator from '../shared/FileCompressionIndicator';
import StatusModal from '../shared/StatusModal'; 

//Iconos
const Icons = {
    Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>,
    Empty: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Attach: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
};

// --- COMPONENTE PRINCIPAL ---

const ChatAdmin = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Estados principales 
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [pdfViewerFailed, setPdfViewerFailed] = useState({});
    const [onlineStudents, setOnlineStudents] = useState(new Set());
    
    // Estados de Compresión y Modal
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState({ progress: 0, message: '' });
    const [modalData, setModalData] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [sending, setSending] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    
    // Refs para audio/título
    const audioRef = useRef(null);
    const audioUnlockedRef = useRef(false);
    const titleIntervalRef = useRef(null);
    const originalTitleRef = useRef(document.title);

    // --- HELPER PARA MODAL ---
    const showModal = (type, title, message) => {
        setModalData({ isOpen: true, type, title, message });
    };

    // --- FUNCIONES HELPER CON REFS (Audio y Título) ---
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

    // --- EFECTOS ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const handleInteraction = () => unlockAudioRef();
        unlockAudioRef();
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });

        return () => {
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

    useEffect(() => {
        loadStudents();
        loadUnreadCounts();
        loadOnlineStatus();
        const unreadHandler = () => loadUnreadCounts();
        window.addEventListener('admin-chat-update', unreadHandler);
        const interval = setInterval(loadOnlineStatus, 10000);
        return () => {
            window.removeEventListener('admin-chat-update', unreadHandler);
            clearInterval(interval);
        };
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/chat/support/students');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            const processed = list.map(s => ({
                id: s.id,
                usuario_id: s.usuario_id || null,
                name: `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim(),
                avatar: s.foto ? buildStaticUrl(s.foto) : "",
                grupo: s.grupo || "",
                tipo: s.tipo || 'estudiante'
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

    const loadOnlineStatus = async () => {
        try {
            const res = await axios.get('/chat/students/online');
            if (res.data?.data) {
                const onlineSet = new Set(res.data.data.map(id => Number(id)));
                setOnlineStudents(onlineSet);
            }
        } catch (error) {
            console.error("Error loading online status:", error);
        }
    };

    useEffect(() => {
        if (!selectedStudent) return;
        async function loadChat(isBackground = false) {
            if (!isBackground) setLoadingChat(true);
            try {
                let newMessages = [];
                if (selectedStudent.tipo === 'asesor') {
                    const asesorUserId = Number(selectedStudent.usuario_id);
                    if (asesorUserId) {
                        const res = await axios.get('/chat/admin-asesor/history', { params: { asesor_user_id: asesorUserId } });
                        newMessages = Array.isArray(res.data?.data) ? [...res.data.data] : [];
                    }
                } else {
                    const res = await axios.get(`/chat/support/history?student_id=${selectedStudent.id}`);
                    newMessages = Array.isArray(res.data.data) ? [...res.data.data] : [];
                }

                setMessages(prev => {
                    if (isBackground && prev.length === newMessages.length &&
                        prev[prev.length - 1]?.id === newMessages[newMessages.length - 1]?.id) {
                        return prev;
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

                if (selectedStudent.tipo !== 'asesor') {
                    await axios.post('/chat/support/read', { student_id: selectedStudent.id });
                    window.dispatchEvent(new CustomEvent('admin-chat-update'));
                }
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

            if (data?.type === 'admin_asesor_message' && data.data) {
                const msg = data.data;
                if (selectedStudent?.tipo === 'asesor') {
                    const asesorUserId = Number(selectedStudent.usuario_id);
                    if (asesorUserId && Number(msg.asesor_user_id) === asesorUserId) {
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
                        setTimeout(scrollToBottom, 100);

                        // Sonido/alerta solo si lo envía el asesor y no estamos viendo el chat visible
                        const isFromAsesor = String(msg.sender_role || '').toLowerCase() === 'asesor';
                        if (isFromAsesor && document.hidden) {
                            playNotificationSoundRef();
                            startTitleNotificationRef(1);
                        }
                    }
                }
                return;
            }

            if (data?.type === 'chat_message' && data.data && data.data.category === 'support') {
                const msg = data.data;

                if (msg.sender_role === 'admin' || msg.sender_role === 'asesor') {
                    if (selectedStudent && (msg.student_id === selectedStudent.id)) {
                        setMessages(prev => {
                            if (prev.some(m => m.id === msg.id)) return prev;
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
                    }
                    return;
                }

                if (selectedStudent && (msg.student_id === selectedStudent.id)) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
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
                    if (msg.sender_role === 'estudiante') {
                        loadStudents();
                        window.dispatchEvent(new CustomEvent('admin-chat-update'));
                        playNotificationSoundRef();
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

    const scrollToBottom = (instant = false) => {
        if (instant) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    // -------------------------------------------------------------
    // LOGICA DE CARGA DE ARCHIVOS (MEJORADA CON MODAL Y PERSISTENCIA)
    // -------------------------------------------------------------
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Configuración de límites
        const MAX_SIZE_MB = 5;
        const maxSize = MAX_SIZE_MB * 1024 * 1024;
        const compressionThreshold = 1 * 1024 * 1024;
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
                toast.success(`Optimizado: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);

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
        const tempId = 'opt-' + Date.now();
        const msgText = newMessage;
        const fileToSend = selectedFile;
        const messageType = fileToSend ? (fileToSend.type.startsWith('image/') ? 'image' : 'file') : 'text';

        try {
            // === Admin -> Asesor (solo texto por ahora) ===
            if (selectedStudent.tipo === 'asesor') {
                const asesorUserId = Number(selectedStudent.usuario_id);
                if (!asesorUserId) {
                    toast.error('Este asesor no tiene usuario asignado aún (no se puede chatear).');
                    return;
                }
                const content = String(msgText || '').trim();
                if (!content) return;

                const optimMsg = {
                    id: tempId,
                    asesor_user_id: asesorUserId,
                    sender_user_id: user?.id,
                    sender_role: 'admin',
                    message: content,
                    created_at: new Date().toISOString()
                };

                setMessages(prev => [...prev, optimMsg]);
                setNewMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(scrollToBottom, 50);

                const res = await axios.post('/chat/admin-asesor/send', { asesor_user_id: asesorUserId, message: content });
                const saved = res.data?.message;
                if (saved?.id) {
                    setMessages(prev => prev.map(m => (String(m.id) === String(tempId) ? saved : m)));
                }
                return;
            }

            const formData = new FormData();
            formData.append('student_id', selectedStudent.id);
            formData.append('message', msgText || '');
            formData.append('type', messageType);
            formData.append('category', 'support');
            formData.append('sender_role', 'admin');

            if (fileToSend) {
                formData.append('file', fileToSend);
            }

            const optimMsg = {
                student_id: selectedStudent.id,
                message: msgText || (fileToSend ? `Archivo: ${fileToSend.name}` : ''),
                type: messageType,
                category: 'support',
                sender_role: 'admin',
                file_path: fileToSend ? (URL.createObjectURL(fileToSend)) : null,
                id: tempId,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, optimMsg]);
            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setTimeout(scrollToBottom, 50);

            await axios.post('/chat/support/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            // Mantenemos toast aquí porque es un error de envío rápido, no de proceso de archivo
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

    const filteredStudents = useMemo(() => {
        if (!debouncedSearchTerm) return students;
        const lowerTerm = debouncedSearchTerm.toLowerCase();
        return students.filter(s =>
            s.name.toLowerCase().includes(lowerTerm) ||
            s.grupo.toLowerCase().includes(lowerTerm)
        );
    }, [students, debouncedSearchTerm]);

    // --- RENDERIZADO---

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

            <div className="flex h-[calc(100vh-132px)] min-h-[500px] w-full max-w-[1600px] mx-auto mt-12 bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-200/80 backdrop-blur-sm">

                {/* SIDEBAR - LISTA DE ESTUDIANTES */}
                <div className={`
                    flex flex-col bg-slate-50 border-r border-slate-200/60 transition-all duration-300
                    h-full
                    ${selectedStudent ? 'hidden md:flex md:w-80 lg:w-96' : 'flex w-full md:w-80 lg:w-96'} 
                `}>
                    <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10 shadow-sm shrink-0">
                        <h2 className="font-bold text-base sm:text-lg text-slate-800 mb-3 flex items-center gap-2">
                            <span className="text-xl">💬</span>
                            <span>Soporte Técnico</span>
                        </h2>
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200/60 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 outline-none transition-all placeholder:text-slate-400"
                            />
                            <span className="absolute left-2.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                                <Icons.Search />
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600"></div>
                                <span className="text-xs text-slate-500 font-medium">Cargando chats...</span>
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-400">
                                <Icons.Search />
                                <p className="text-sm font-medium mt-2">No se encontraron estudiantes</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100/60">
                                {filteredStudents.map(s => {
                                    const itemKey = `${s.tipo || 'estudiante'}-${s.id}`;
                                    const unreadCount = (s.tipo === 'estudiante') ? (unreadCounts[s.id] || 0) : 0;
                                    const isSelected = (selectedStudent?.id === s.id) && (selectedStudent?.tipo === s.tipo);
                                    const studentId = Number(s.id);
                                    const isOnline = (s.tipo === 'estudiante') ? onlineStudents.has(studentId) : false;

                                    return (
                                        <button
                                            key={itemKey}
                                            onClick={() => setSelectedStudent(s)}
                                            className={`w-full p-3 sm:p-4 min-h-[72px] flex items-center gap-3 transition-all duration-200 text-left relative group
                                            ${isSelected ? 'bg-white border-l-4 border-indigo-600 shadow-sm' : 'hover:bg-white border-l-4 border-transparent'}
                                            `}
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden shadow-sm ring-1 ring-slate-200/50">
                                                    {s.avatar ? (
                                                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <span className="w-full h-full flex items-center justify-center" style={{ display: s.avatar ? 'none' : 'flex' }}>
                                                        {getInitials(s.name)}
                                                    </span>
                                                </div>
                                                {s.tipo === 'asesor' && (
                                                    <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-md z-20">A</div>
                                                )}
                                                {isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-lg z-10 animate-pulse" title="En línea" />
                                                )}
                                                {unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border-2 border-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <p className={`font-semibold truncate text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                        {s.name}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 flex-wrap">
                                                    {s.tipo === 'asesor' ? (
                                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-semibold">Asesor</span>
                                                    ) : (
                                                        <>
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-semibold">Estudiante</span>
                                                            {s.grupo && <span className="bg-slate-200 px-1.5 rounded text-[10px] font-medium text-slate-600">{s.grupo}</span>}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className={`
                    flex-col bg-[#f0f2f5] relative h-full
                    ${selectedStudent ? 'flex w-full flex-1' : 'hidden md:flex md:flex-1'}
                `}>
                    {selectedStudent ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-3 sm:px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200/60 shadow-sm flex items-center justify-between z-10 sticky top-0 shrink-0 h-[64px]">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <button onClick={() => setSelectedStudent(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Icons.Back />
                                    </button>

                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                        {selectedStudent.avatar ? (
                                            <img src={selectedStudent.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        ) : null}
                                        <span className="text-sm font-bold text-indigo-700" style={{ display: selectedStudent.avatar ? 'none' : 'flex' }}>
                                            {getInitials(selectedStudent.name)}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                            {selectedStudent.name}
                                        </h3>
                                        {onlineStudents.has(Number(selectedStudent.id)) && (
                                            <span className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En línea
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div
                                className="flex-1 overflow-y-auto pt-4 px-3 sm:px-4 pb-3 space-y-3 custom-scrollbar"
                                ref={chatContainerRef}
                                style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.7px, transparent 0.7px)', backgroundSize: '24px 24px' }}
                            >
                                {loadingChat ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                                        <Icons.Empty />
                                        <p className="text-slate-500 font-medium text-sm mt-3">Comienza la conversación</p>
                                    </div>
                                ) : (
                                    [...messages]
                                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                                        .map((msg, idx) => {
                                        const isMe = msg.sender_role === 'admin';
                                        const isEstudiante = msg.sender_role === 'estudiante';
                                        const isAsesor = msg.sender_role === 'asesor';
                                        const fileUrl = msg.file_path ? (msg.isOptimistic ? msg.file_path : buildStaticUrl(msg.file_path)) : null;
                                        const fileName = msg.file_path?.split('/').pop() || 'Archivo';

                                        const fileExt = fileName.toLowerCase().split('.').pop();
                                        const isImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
                                        const isPdfExt = fileExt === 'pdf';

                                        const isImage = (msg.type === 'image' || (msg.file_path && isImageExt)) && fileUrl;
                                        const isFile = (msg.type === 'file' || (msg.file_path && isPdfExt)) && fileUrl;
                                        const isPdf = isFile;

                                        return (
                                            <div key={msg.id || idx} className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[90%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {!isMe && (
                                                        <div className="mb-1 px-2">
                                                            {isAsesor ? <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">Asesor</span> :
                                                                isEstudiante ? <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Estudiante</span> :
                                                                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{msg.sender_role}</span>}
                                                        </div>
                                                    )}

                                                    <div className={`px-4 py-3 shadow-sm text-sm break-words relative 
                                                        ${isMe
                                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                            : isAsesor
                                                                ? 'bg-purple-50 text-slate-800 border border-purple-200 rounded-2xl rounded-tl-sm'
                                                                : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
                                                        }`}>

                                                        {isImage && (
                                                            <div className="mb-2">
                                                                <img src={fileUrl} alt="Imagen adjunta" className="max-w-full max-h-64 rounded-lg object-contain bg-black/10" onError={(e) => { e.target.style.display = 'none'; }} />
                                                            </div>
                                                        )}

                                                        {/* Lógica original de PDF Viewer restaurada */}
                                                        {isPdf && (
                                                            <div className="mb-2 -mx-2">
                                                                <div className="bg-slate-100 rounded-lg p-2 border border-slate-200">
                                                                    {pdfViewerFailed[msg.id || idx] ? (
                                                                        <iframe
                                                                            src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`}
                                                                            className="w-full rounded-lg border bg-white"
                                                                            title={fileName}
                                                                            style={{ height: '300px' }}
                                                                            allowFullScreen
                                                                        />
                                                                    ) : (
                                                                        <iframe
                                                                            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                                                                            className="w-full rounded-lg border bg-white"
                                                                            title={fileName}
                                                                            style={{ height: '300px' }}
                                                                            allowFullScreen
                                                                            type="application/pdf"
                                                                            onError={() => setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }))}
                                                                            onLoad={(e) => {
                                                                                try {
                                                                                    // Intento simple de detectar carga fallida en iframe
                                                                                    const iframe = e.target;
                                                                                    setTimeout(() => {
                                                                                        if (iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML.trim() === '') {
                                                                                            setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }));
                                                                                        }
                                                                                    }, 2000);
                                                                                } catch (err) {
                                                                                    // Error de CORS, usar visor alternativo
                                                                                    setPdfViewerFailed(prev => ({ ...prev, [msg.id || idx]: true }));
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}

                                                                    <div className="mt-2 flex gap-2 justify-center flex-wrap">
                                                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                                                                            Abrir en nueva pestaña
                                                                        </a>
                                                                        <a href={fileUrl} download
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white'}`}>
                                                                            Descargar PDF
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Lógica original para otros archivos */}
                                                        {isFile && !isPdf && !isImage && (
                                                            <div className="mb-2">
                                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}>
                                                                    <Icons.Attach /> {fileName}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Fallback para archivos sin tipo detectado */}
                                                        {msg.file_path && !isImage && !isPdf && !isFile && (
                                                            <div className="mb-2">
                                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}>
                                                                    <Icons.Attach /> {fileName}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                                                    </div>

                                                    <div className="flex items-center gap-1 mt-1 px-1">
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && <span className={`text-indigo-500 ${sending && idx === messages.length - 1 ? 'opacity-50' : ''}`}><Icons.Check /></span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
                                {selectedFile && (
                                    <div className="mb-2 flex items-center gap-2 p-2 bg-indigo-50 rounded-lg max-w-max border border-indigo-100">
                                        <span className="text-xs text-indigo-700 font-medium truncate max-w-[200px] flex items-center gap-1">
                                            <Icons.Attach /> {selectedFile.name}
                                        </span>
                                        <button type="button" onClick={handleRemoveFile} className="text-indigo-400 hover:text-indigo-600 font-bold px-1">✕</button>
                                    </div>
                                )}
                                <form onSubmit={handleSend} className="flex items-end gap-2">
                                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-full transition-colors shrink-0" title="Adjuntar">
                                        <Icons.Attach />
                                    </button>
                                    <div className="flex-1 bg-slate-100 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 border border-transparent focus-within:border-indigo-300 transition-all flex items-center">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Escribe un mensaje..."
                                            className="w-full bg-transparent border-none px-4 py-3 focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <button type="submit" disabled={(!newMessage.trim() && !selectedFile) || sending} className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shrink-0">
                                        <Icons.Send />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (

                        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50 min-h-0 h-full">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <span className="text-4xl">👋</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700">Soporte Técnico</h2>
                            <p className="text-slate-500 mt-2 max-w-xs text-center">
                                Selecciona un estudiante de la lista para ver su historial y responder consultas.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Mantenemos el Toaster por si otros componentes (o la app) lo usan */}
            <Toaster position="top-right" />
        </>
    );
};

export default ChatAdmin;