// C:\Users\isc20\Desktop\MQERK\mqerk_ver1-Miguel-el-Angel\client\src\components\shared\ChatFloatingButton.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios'; 
import { buildStaticUrl } from '../../utils/url'; 
import { compressFile, formatFileSize } from '../../utils/fileCompression'; 

const ChatFloatingButton = () => {
  const { user, isAuthenticated } = useAuth();

  // --- ESTADOS ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Estados de carga y paginación
  const [loading, setLoading] = useState(false); // Carga inicial
  const [loadingMore, setLoadingMore] = useState(false); // Carga de historial antiguo
  const [hasMore, setHasMore] = useState(true); // ¿Quedan mensajes en la BD?

  const [unreadCount, setUnreadCount] = useState(0);
  const [category, setCategory] = useState('academic');
  const [advisorName, setAdvisorName] = useState('Tu Tutor Personal');
  const [advisorStatus, setAdvisorStatus] = useState(false);
  const [supportStatus, setSupportStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ progress: 0, message: '' });
  const [modalData, setModalData] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [position, setPosition] = useState(null); 
  const [pdfViewerFailed, setPdfViewerFailed] = useState({}); 

  // --- REFERENCIAS ---
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // NUEVO: Para controlar el scroll manual
  const fileInputRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const audioRef = useRef(null);
  const audioUnlocked = useRef(false);
  const titleIntervalRef = useRef(null);
  const originalTitleRef = useRef(document.title);

  // --- CONSTANTES MEMORIZADAS ---
  const validCategories = useMemo(() => ['academic', 'support', 'general'], []);
  const currentOnlineStatus = useMemo(() => category === 'academic' ? advisorStatus : supportStatus, [category, advisorStatus, supportStatus]);
  const filteredMessages = useMemo(() => messages.filter(msg => {
    const msgCategory = msg.category || 'general';
    return msgCategory === category || msgCategory === 'general';
  }), [messages, category]);

  // --- HOOKS PERSONALIZADOS (Manteniendo tu lógica exacta) ---
  
  // useAudioNotification
  const unlockAudio = useCallback(() => {
    if (audioUnlocked.current) return;
    if (!audioRef.current) {
      try {
        const soundUrl = `/notification-sound-for-whatsapp.mp3?v=${Date.now()}`;
        audioRef.current = new Audio(soundUrl);
        audioRef.current.addEventListener('error', (e) => {
          console.warn('No se pudo cargar el sonido de notificación:', e);
          audioRef.current = null;
        });
      } catch (e) {
        console.warn('Error al crear Audio:', e);
        audioRef.current = null;
        return;
      }
    }
    if (!audioRef.current) return;

    try {
      const p = audioRef.current.play();
      if (p) {
        p.then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioUnlocked.current = true;
          }
        }).catch(e => console.warn('Error al desbloquear audio:', e));
      }
    } catch (e) {
      console.warn('Error al desbloquear audio:', e);
    }
  }, []);

  const playSound = useCallback(() => {
    try {
      if (!audioUnlocked.current) {
        unlockAudio();
        setTimeout(() => {
          if (audioUnlocked.current && audioRef.current) {
            try {
              audioRef.current.volume = 0.5;
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => { });
            } catch (e) { console.warn('Error al reproducir sonido:', e); }
          }
        }, 200);
        return;
      }
      if (!audioRef.current) {
        unlockAudio();
        return;
      }
      audioRef.current.volume = 0.5;
      audioRef.current.currentTime = 0;
      const p = audioRef.current.play();
      if (p) {
        p.catch(e => {
          console.warn('Error al reproducir sonido:', e);
          audioUnlocked.current = false;
          unlockAudio();
        });
      }
    } catch (e) {
      console.warn('Error al reproducir sonido:', e);
    }
  }, [unlockAudio]);

  // useTitleNotification
  const startTitleNotification = useCallback((count = 1) => {
    if (titleIntervalRef.current) return;
    originalTitleRef.current = document.title;
    let showingAlert = false;
    titleIntervalRef.current = setInterval(() => {
      document.title = showingAlert
        ? originalTitleRef.current
        : `(${count}) Nuevo${count > 1 ? 's' : ''} mensaje${count > 1 ? 's' : ''}`;
      showingAlert = !showingAlert;
    }, 1000);
  }, []);

  const stopTitleNotification = useCallback(() => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = originalTitleRef.current;
    }
  }, []);

  // useDraggablePosition
  const handlePointerDown = useCallback((e) => {
    unlockAudio();
    if (e.type === 'mousedown' && e.button !== 0) return;
    isDragging.current = false;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
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
      if (Math.abs(moveClientX - dragStartPos.current.startX) > 5 ||
          Math.abs(moveClientY - dragStartPos.current.startY) > 5) {
        isDragging.current = true;
      }
      if (isDragging.current) {
        if (moveEvent.cancelable) moveEvent.preventDefault();
        const newX = moveClientX - dragStartPos.current.x;
        const newY = moveClientY - dragStartPos.current.y;
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
  }, [unlockAudio]);

  const toggleOpen = useCallback(() => {
    if (!isDragging.current) {
      setIsOpen(prev => !prev);
    }
  }, []);

  // useFileHandling
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    const maxSize = MAX_SIZE_MB * 1024 * 1024;
    const compressionThreshold = 1 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setModalData({ isOpen: true, type: 'warning', title: 'Archivo no compatible', message: 'Solo permitimos imágenes (JPG, PNG) y documentos PDF.' });
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
          setModalData({ isOpen: true, type: 'error', title: 'Imposible enviar', message: `Aun comprimido, el archivo pesa ${formatFileSize(compressedFile.size)}. El límite es 5MB.` });
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
        setModalData({ isOpen: true, type: 'warning', title: 'Atención', message: 'Este archivo no se puede optimizar, se intentará enviar original.' });
        setSelectedFile(file);
      } else {
        setModalData({ isOpen: true, type: 'error', title: 'Error', message: 'No se pudo procesar el archivo. Intenta con otro más ligero.' });
        e.target.value = '';
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // --- FUNCIONES PRINCIPALES (MODIFICADAS PARA INFINITE SCROLL) ---

  const loadHistory = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Calculamos offset: Si es cargar más, saltamos los que ya tenemos. Si es inicio, 0.
      const offset = isLoadMore ? messages.length : 0;
      const limit = 50;

      // Petición al endpoint (que ahora soporta limit y offset)
      const res = await axios.get('/chat/history', {
        params: { limit, offset }
      });

      const newBatch = Array.isArray(res.data.data) ? [...res.data.data] : [];
      
      // Si llegan menos de los pedidos, ya no hay más historial
      if (newBatch.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setMessages(prev => {
        // Lógica de combinación:
        // Si es isLoadMore -> Ponemos los nuevos al PRINCIPIO (...newBatch, ...prev)
        // Si es inicio -> Ponemos los nuevos y buscamos coincidencias optimistas
        
        let mergedMessages;

        if (isLoadMore) {
             // Concatenar historial viejo al principio y filtrar duplicados por ID
             const combined = [...newBatch, ...prev];
             // Usamos Map para asegurar unicidad por ID
             const uniqueMap = new Map();
             combined.forEach(msg => {
                 if (msg.id) uniqueMap.set(msg.id, msg);
                 else uniqueMap.set(JSON.stringify(msg), msg); // Fallback para optimistas sin ID
             });
             mergedMessages = Array.from(uniqueMap.values());
        } else {
            // Lógica original preservada para carga inicial / updates
            mergedMessages = [...newBatch];
            prev.forEach(msg => {
              if (!msg.id && !mergedMessages.some(m =>
                m.message === msg.message &&
                m.sender_role === msg.sender_role &&
                Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 5000
              )) {
                mergedMessages.push(msg);
              }
            });
        }
        
        return mergedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });

      if (!isLoadMore && !isOpen) {
        const unread = newBatch.filter(m => m.sender_role !== 'estudiante' && !m.is_read).length;
        setUnreadCount(unread);
      }

      // Solo hacemos scroll al fondo si es la carga inicial
      if (!isLoadMore) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 0);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 300);
      }

    } catch (error) {
      console.error("Error loading chat:", error);
      // Si el error es 400 (usuario sin id_estudiante), no mostrar error en consola
      // Esto puede pasar en páginas donde el usuario no es estudiante (ej: preregistro asesor)
      if (error?.response?.status === 400) {
        const errorMsg = error?.response?.data?.error || '';
        if (errorMsg.includes('Student record not linked') || errorMsg.includes('student_id required')) {
          // Usuario no tiene id_estudiante - esto es normal en algunas páginas
          setMessages([]);
          setHasMore(false);
          return;
        }
      }
      // Para otros errores, mantener el comportamiento actual
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [messages.length, isOpen]);

  // NUEVO: Manejador de scroll para detectar cuando llega arriba
  const handleScroll = useCallback((e) => {
    const container = e.target;
    // Si scrollTop es 0 (arriba), hay más mensajes y no estamos cargando...
    if (container.scrollTop === 0 && hasMore && !loading && !loadingMore) {
        const currentHeight = container.scrollHeight; // Guardar altura actual
        
        loadHistory(true).then(() => {
            // Ajustar scroll para mantener posición visual
            requestAnimationFrame(() => {
                if(container) {
                    container.scrollTop = container.scrollHeight - currentHeight;
                }
            });
        });
    }
  }, [hasMore, loading, loadingMore, loadHistory]);

  const loadStatus = useCallback(async () => {
    try {
      const res = await axios.get('/chat/status');
      if (res.data) {
        setAdvisorName(res.data.advisorName || 'Tu Asesor');
        const advisorOnline = (res.data.advisorOnline !== undefined) ? Boolean(res.data.advisorOnline) : Boolean(res.data.online);
        const supportOnline = (res.data.supportOnline !== undefined) ? Boolean(res.data.supportOnline) : Boolean(res.data.online);
        setAdvisorStatus(advisorOnline);
        setSupportStatus(supportOnline);
      }
    } catch (e) {
      // Si el error es 400 (usuario sin id_estudiante), no mostrar error
      if (e?.response?.status === 400) {
        setAdvisorStatus(false);
        setSupportStatus(false);
        return;
      }
      console.error("Error loading status:", e);
      setAdvisorStatus(false);
      setSupportStatus(false);
    }
  }, [setAdvisorName, setAdvisorStatus, setSupportStatus]);

  const markRead = useCallback(async () => {
    try {
      await axios.post('/chat/read');
      setUnreadCount(0);
    } catch (e) {
      // Si el error es 400 (usuario sin id_estudiante), no mostrar error
      if (e?.response?.status === 400) {
        const errorMsg = e?.response?.data?.error || '';
        if (errorMsg.includes('Student record not linked') || errorMsg.includes('student_id required')) {
          // Usuario no tiene id_estudiante - esto es normal en algunas páginas
          return;
        }
      }
      console.error("Error marking messages as read:", e);
    }
  }, [setUnreadCount]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const msgContent = newMessage;
    const msgCategory = category;
    const messageType = selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text';

    setNewMessage('');
    const fileToSend = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }

    const optimMsg = {
      sender_role: 'estudiante',
      message: msgContent || (fileToSend ? `Archivo: ${fileToSend.name}` : ''),
      category: msgCategory,
      created_at: new Date().toISOString(),
      type: messageType,
      file_path: fileToSend ? URL.createObjectURL(fileToSend) : null
    };

    setMessages(prev => [...prev, optimMsg]);
    // Scroll suave al enviar
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const formData = new FormData();
      formData.append('message', msgContent || '');
      formData.append('type', messageType);
      formData.append('category', msgCategory);
      if (fileToSend) {
        formData.append('file', fileToSend);
      }

      await axios.post('/chat/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(m => m !== optimMsg)); 
      setModalData({ isOpen: true, type: 'error', title: 'Error de envío', message: 'No se pudo enviar el mensaje. Verifica tu conexión.' });
    }
  }, [newMessage, selectedFile, category, setModalData]);

  // --- EFECTOS ---

  useEffect(() => {
    if (isAuthenticated && user?.role === 'estudiante') {
      // Solo intentar cargar si el usuario tiene id_estudiante
      // Si no lo tiene, el error 400 será manejado silenciosamente en loadHistory
      loadHistory(false).catch(() => {
        // Error ya manejado en loadHistory, no hacer nada
      });
      loadStatus().catch(() => {
        // Error en status también se maneja silenciosamente
      });
    }
  }, [isAuthenticated, user?.role, loadStatus]); // Quitamos loadHistory de deps para evitar loop

  useEffect(() => {
    let intervalId = null;
    if (isOpen && isAuthenticated && user?.role === 'estudiante') {
      if (messages.length === 0) {
        loadHistory(false).catch(() => {
          // Error ya manejado en loadHistory
        });
      }
      markRead();
      loadStatus().catch(() => {
        // Error ya manejado en loadStatus
      });
      intervalId = setInterval(() => {
        loadStatus().catch(() => {
          // Error ya manejado en loadStatus
        });
      }, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, isAuthenticated, user?.role, markRead, loadStatus]);

  // Efecto Scroll: Solo baja si NO estamos cargando historial antiguo
  useEffect(() => {
    if (isOpen && messages.length > 0 && !loading && !loadingMore) {
        // Verificación adicional: Solo bajar si el último mensaje es reciente (o si es la primera carga pequeña)
        const lastMsg = messages[messages.length - 1];
        const isRecent = new Date() - new Date(lastMsg.created_at) < 5000;
        
        if (isRecent || messages.length <= 50) {
            requestAnimationFrame(() => {
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 0);
            });
        }
    }
  }, [messages.length, isOpen, loading, loadingMore]);

  // Visibilidad y WebSockets (Sin cambios)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOpen) {
        stopTitleNotification();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (isOpen && !document.hidden) stopTitleNotification();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTitleNotification();
    };
  }, [isOpen, stopTitleNotification]);

  useEffect(() => {
    const statusHandler = (e) => {
      const data = e.detail;
      if (data?.type === 'advisor-status-change') {
        if (data.role === 'admin') {
          // Soporte es global (cualquier admin en línea)
          setSupportStatus(Boolean(data.online));
        } else if (data.role === 'asesor') {
          // Asesor del alumno es específico (no "cualquier asesor"),
          // así que dejamos que /chat/status resuelva el asesor asignado.
          // (Evita falsos positivos si hay otros asesores conectados)
        }
        loadStatus(); // Revalidar en backend (asesor asignado + soporte)
      }
    };
    window.addEventListener('student-ws-message', statusHandler);
    return () => window.removeEventListener('student-ws-message', statusHandler);
  }, [loadStatus]);

  useEffect(() => {
    const handler = (e) => {
      const data = e.detail;
      if (data?.type !== 'chat_message' || !data.data) return;

      const msg = data.data;

      // --- INICIO DE LA CORRECCIÓN (anti "eco") ---
      // Normalizamos para evitar errores por mayúsculas/espacios: "Estudiante", "estudiante ", etc.
      const msgCategory = String(msg.category || 'academic').toLowerCase().trim();
      const incomingRole = String(msg.sender_role || '').toLowerCase().trim();
      const myRole = String(user?.role || '').toLowerCase().trim();

      // Categoría válida
      if (!validCategories.includes(msgCategory)) return;

      setMessages((prev) => {
        // Evitar duplicados por ID real
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;

        // Reemplazo optimista (sin ID) por el confirmado del backend
        const optimisticIndex = prev.findIndex((m) =>
          !m.id &&
          String(m.sender_role || '').toLowerCase().trim() === incomingRole &&
          m.message === msg.message &&
          Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 5000
        );

        if (optimisticIndex !== -1) {
          const newMessages = [...prev];
          newMessages[optimisticIndex] = msg;
          return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        return [...prev, msg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });

      // Scroll suave (si es la pestaña activa o general)
      const currentCategory = String(category || 'academic').toLowerCase().trim();
      if (msgCategory === currentCategory || msgCategory === 'general') {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }

      // --- LÓGICA DEL SONIDO CORREGIDA ---
      // Es mío si el rol entrante es estudiante/student o coincide con mi rol actual.
      const isMe =
        incomingRole === 'estudiante' ||
        incomingRole === 'student' ||
        (myRole && incomingRole === myRole);

      if (!isMe) {
        playSound();

        if (!isOpen) {
          setUnreadCount((prev) => {
            const newCount = prev + 1;
            startTitleNotification(newCount);
            return newCount;
          });
        } else {
          const isFromActiveTab = msgCategory === currentCategory || msgCategory === 'general';
          if (isFromActiveTab && !document.hidden) {
            markRead();
          } else {
            setUnreadCount((prev) => {
              const newCount = prev + 1;
              if (document.hidden) startTitleNotification(newCount);
              return newCount;
            });
          }
        }
      } else {
        // Si soy yo (eco del propio mensaje), cortar cualquier parpadeo de título por si acaso
        stopTitleNotification();
      }
      // --- FIN DE LA CORRECCIÓN ---
    };

    window.addEventListener('student-ws-message', handler);
    return () => window.removeEventListener('student-ws-message', handler);
  }, [
    isOpen,
    category,
    playSound,
    startTitleNotification,
    stopTitleNotification,
    markRead,
    validCategories,
    user?.role
  ]);

  // --- COMPONENTES INTERNOS (Sin cambios) ---
  // (ChatMessage, FileAttachmentPreview, ChatHeader, StatusModal, FileCompressionIndicator, Iconos... se mantienen igual)
  
  const ChatMessage = ({ msg, idx }) => {
    // ... Tu lógica original de ChatMessage ...
    const isMe = msg.sender_role === 'estudiante';
    const fileUrl = msg.file_path ? buildStaticUrl(msg.file_path) : null;
    const fileName = msg.file_path?.split('/').pop() || 'Archivo';
    const fileExt = fileName.toLowerCase().split('.').pop();
    const isImageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
    const isPdfExt = fileExt === 'pdf';
    const isImage = (msg.type === 'image' || (msg.file_path && isImageExt)) && fileUrl;
    const isFile = (msg.type === 'file' || (msg.file_path && isPdfExt)) && fileUrl;
    const isPdf = isFile;
    const handlePdfError = (id) => setPdfViewerFailed(prev => ({ ...prev, [id]: true }));
    const handlePdfLoad = (e, id) => {
      try {
        const iframe = e.target;
        setTimeout(() => {
          if (iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML.trim() === '') handlePdfError(id);
        }, 2000);
      } catch (err) { handlePdfError(id); }
    };
    return (
      <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
            {isImage && (<div className="mb-2"><img src={fileUrl} alt="Imagen" className="max-w-full max-h-48 rounded-lg object-contain" onError={(e) => e.target.style.display = 'none'} /></div>)}
            {isPdf && (<div className="mb-2 -mx-2"><div className="bg-slate-100 rounded-lg p-2 border border-slate-200">{pdfViewerFailed[idx] ? (<iframe src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`} className="w-full rounded-lg border-2 border-slate-300 bg-white" title={fileName} style={{ height: '300px', minHeight: '200px' }} allowFullScreen />) : (<iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`} className="w-full rounded-lg border-2 border-slate-300 bg-white" title={fileName} style={{ height: '300px', minHeight: '200px' }} allowFullScreen type="application/pdf" onError={() => handlePdfError(idx)} onLoad={(e) => handlePdfLoad(e, idx)} />)}<div className="mt-2 flex gap-2 justify-center flex-wrap"><a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>Abrir</a><a href={fileUrl} download className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-600 hover:bg-slate-700 text-white'}`}>Descargar</a></div></div></div>)}
            {isFile && !isPdf && !isImage && (<div className="mb-2"><a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}><AttachIcon /> {fileName}</a></div>)}
            {msg.file_path && !isImage && !isPdf && !isFile && (<div className="mb-2"><a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`underline flex items-center gap-2 ${isMe ? 'text-white' : 'text-indigo-600'}`}><AttachIcon /> {fileName}</a></div>)}
            {msg.message && <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>}
          </div>
          <span className="text-[10px] mt-1 px-1 text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
        </div>
      </div>
    );
  };

  const FileAttachmentPreview = ({ selectedFile, onRemove }) => (
    <div className="px-2 sm:px-3 pt-2 flex items-center gap-2 bg-indigo-50 border-t border-gray-100"><span className="text-xs text-indigo-700 flex-1 truncate"><AttachIcon /> {selectedFile.name}</span><button type="button" onClick={onRemove} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">✕</button></div>
  );

  const ChatHeader = ({ advisorName, currentOnlineStatus, category, setCategory, setIsOpen }) => (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-3 text-white shadow-md shrink-0 cursor-auto"><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="bg-white/20 p-1.5 rounded-full relative"><span className="text-lg">{category === 'academic' ? '👨‍🏫' : '🛠️'}</span>{currentOnlineStatus && (<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>)}</div><div className="flex flex-col"><h3 className="font-bold text-xs sm:text-sm leading-tight">{category === 'academic' ? advisorName : 'Administrador'}</h3><p className="text-[9px] sm:text-[10px] text-indigo-100 opacity-90 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full inline-block ${currentOnlineStatus ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>{currentOnlineStatus ? 'En línea' : 'Desconectado'}</p></div></div><button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 sm:p-1 rounded transition text-white/80 hover:text-white"><CloseIcon /></button></div><div className="flex gap-1 sm:gap-2 bg-black/10 p-1 rounded-lg"><button onClick={() => setCategory('academic')} className={`flex-1 text-[10px] sm:text-xs py-1.5 px-1 sm:px-2 rounded-md transition-all ${category === 'academic' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-white/70 hover:bg-white/10'}`}>Tutor Académico</button><button onClick={() => setCategory('support')} className={`flex-1 text-[10px] sm:text-xs py-1.5 px-1 sm:px-2 rounded-md transition-all ${category === 'support' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-white/70 hover:bg-white/10'}`}>Administrador</button></div></div>
  );

  // StatusModal y FileCompressionIndicator los mantienes igual, no los pego para ahorrar espacio pero deben estar
  const StatusModal = ({ isOpen, type, title, message, onClose }) => {
     // ... (tu código original aquí)
     if (!isOpen) return null;
     const iconMap = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
     return (<div className="fixed inset-0 bg-black/50 z-[100000] flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300"><div className="text-center"><div className="text-4xl mb-3">{iconMap[type]}</div><h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3><p className="text-gray-600 mb-4">{message}</p><button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full">Aceptar</button></div></div></div>);
  };
  
  const FileCompressionIndicator = ({ isOpen, progress, message, fileName, onCancel }) => {
     // ... (tu código original aquí)
     if (!isOpen) return null;
     return (<div className="fixed inset-0 bg-black/50 z-[100000] flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300"><div className="text-center"><div className="text-4xl mb-3">🔄</div><h3 className="font-bold text-lg text-gray-800 mb-2">Procesando Archivo</h3><p className="text-gray-600 mb-2">{message}</p><p className="text-xs text-gray-500 mb-4 truncate">{fileName}</p><div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div></div><button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full">Cancelar y Recargar</button></div></div></div>);
  };

  // Iconos
  const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.2" /><path d="M9 10h.01" strokeWidth="2.5" strokeLinecap="round" /><path d="M13 10h.01" strokeWidth="2.5" strokeLinecap="round" /><path d="M17 10h.01" strokeWidth="2.5" strokeLinecap="round" /><circle cx="19" cy="5" r="2" fill="currentColor" opacity="0.6" className="animate-pulse" /></svg>);
  const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
  const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
  const AttachIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>);

  if (!isAuthenticated || user?.role !== 'estudiante') return null;

  const containerStyle = position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto', pointerEvents: 'none' } : { pointerEvents: 'none' };
  const defaultClasses = !position ? "fixed bottom-20 left-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[9998]" : "fixed z-[9998]";

  return (
    <>
      {compressing && <FileCompressionIndicator isOpen={compressing} progress={compressionProgress.progress} message={compressionProgress.message} fileName={fileInputRef.current?.files?.[0]?.name || 'Archivo'} onCancel={() => { setCompressing(false); window.location.reload(); }} />}
      <StatusModal isOpen={modalData.isOpen} type={modalData.type} title={modalData.title} message={modalData.message} onClose={() => setModalData({ ...modalData, isOpen: false })} />

      <div ref={buttonRef} style={containerStyle} className={`${defaultClasses} flex flex-col items-end gap-4 font-sans`}>
        {isOpen && (
          <div className="fixed inset-0 z-[99998] w-full h-full bg-white sm:fixed sm:bottom-20 sm:right-6 sm:left-auto sm:top-auto sm:w-[28rem] sm:h-[36rem] sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
            <ChatHeader advisorName={advisorName} currentOnlineStatus={currentOnlineStatus} category={category} setCategory={setCategory} setIsOpen={setIsOpen} />

            <div 
              ref={chatContainerRef} // Ref agregado para el scroll
              onScroll={handleScroll} // Evento agregado para infinite scroll
              className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 cursor-auto"
            >
              {/* Spinner de carga superior (mensajes viejos) */}
              {loadingMore && (
                 <div className="w-full flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                 </div>
              )}

              {loading && !loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              )}
              
              {!loading && filteredMessages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 space-y-2">
                  <div className="text-4xl opacity-50">👋</div>
                  <p>¡Hola!</p>
                  <p className="text-xs max-w-[200px] mx-auto">{category === 'academic' ? `Estás hablando con ${advisorName}.` : '¿Problemas con la plataforma? Escribe al administrador.'}</p>
                </div>
              )}
              {filteredMessages.map((msg, idx) => (
                <ChatMessage key={msg.id || `opt-${idx}`} msg={msg} idx={idx} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {selectedFile && <FileAttachmentPreview selectedFile={selectedFile} onRemove={handleRemoveFile} />}

            <form onSubmit={handleSend} className="p-2 sm:p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0 cursor-auto">
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all active:scale-95 flex items-center justify-center" title="Adjuntar archivo"><AttachIcon /></button>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Escribe a ${category === 'academic' ? 'tu tutor' : 'administrador'}...`} onMouseDown={e => e.stopPropagation()} className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all placeholder-gray-400" />
              <button type="submit" disabled={(!newMessage.trim() && !selectedFile)} className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"><SendIcon /></button>
            </form>
          </div>
        )}

        {!isOpen && (
          <button onMouseDown={handlePointerDown} onTouchStart={handlePointerDown} onClick={toggleOpen} className="pointer-events-auto bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 group relative z-[9999] cursor-move" aria-label="Abrir Chat" style={{ pointerEvents: 'auto' }}>
            <span className="absolute inset-0 rounded-full bg-violet-400 opacity-75 animate-ping" style={{ animationDuration: '2s' }}></span>
            <span className="absolute inset-0 rounded-full bg-violet-400 opacity-50 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></span>
            {unreadCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg z-10">{unreadCount}</span>)}
            <ChatIcon />
          </button>
        )}
        {isOpen && (
          <button onMouseDown={handlePointerDown} onTouchStart={handlePointerDown} onClick={toggleOpen} className="hidden sm:flex pointer-events-auto bg-white text-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all group relative z-[9999] cursor-move items-center justify-center" style={{ pointerEvents: 'auto' }}><CloseIcon /></button>
        )}
      </div>
    </>
  );
};

export default ChatFloatingButton;