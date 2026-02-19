/**
 * Componente Admin de Email
 * 
 * Interfaz de gestión de emails para administradores para comunicación con estudiantes y personal.
 * APIs de Backend a implementar:
 * - GET /api/admin/emails?folder={inbox|sent|drafts} - Obtener emails por carpeta
 * - POST /api/admin/emails/send - Enviar nuevo email
 * - PUT /api/admin/emails/{id}/read - Marcar email como leído
 * - DELETE /api/admin/emails/{id} - Eliminar email
 */
import React, { useState, useEffect, useRef } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { getAdminEmails, sendAdminEmail, markEmailRead, deleteAdminEmail } from '../../api/emails';
import { getGmailAuthUrl, listGmailInbox, sendGmail, getGmailStatus, getGmailEnvCheck } from '../../api/gmail';

function Email_Admin_comp() {
  const [emails, setEmails] = useState([]);
  const [emailSeleccionado, setEmailSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('bandeja'); // 'bandeja', 'redactar', 'enviados'
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [isGmailFetching, setIsGmailFetching] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState({
    para: '',
    asunto: '',
    mensaje: '',
    tipo: 'individual' // 'individual', 'group', 'all'
  });
  const [query, setQuery] = useState('');

  // Estado para modal de respuesta directa
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyEmail, setReplyEmail] = useState({ para: '', asunto: '', mensaje: '' });
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Estado para modales personalizados
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: '', onConfirm: null });

  const {
    isLoading,
    error,
    lastUpdated
  } = useAdminContext();

  // Estado de vinculación de Gmail
  const [gmailLinked, setGmailLinked] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  const linkPollRef = useRef(null);

  // Toast muy ligero en-local
  const [toast, setToast] = useState(null); // { msg, type: 'info'|'success'|'error' }
  const notify = (msg, type = 'info') => {
    setToast({ msg, type });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const check = async () => {
      try {
        const st = await getGmailStatus();
        setGmailLinked(!!st?.linked);
        setGmailEmail(st?.email || null);
      } catch { }
    };
    check();
  }, []);

  const handleLinkGmail = async () => {
    try {
      setIsLinking(true);
      // Pre-chequeo de configuración del servidor para evitar errores invalid_client
      const env = await getGmailEnvCheck();
      if (!env?.ok || !env?.hasId || !env?.hasSecret) {
        setConfirmConfig({
          message: 'Gmail no está configurado en el servidor. Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.\n\nPídele al administrador que configure el .env del servidor y lo reinicie.',
          onConfirm: () => setShowConfirmModal(false)
        });
        setShowConfirmModal(true);
        return;
      }
      const url = await getGmailAuthUrl();
      if (url) {
        notify('Abriendo ventana de Google para vincular tu cuenta…', 'info');
        // Abrir y comenzar un polling corto para reflejar estado
        window.open(url, '_blank');
        if (linkPollRef.current) window.clearInterval(linkPollRef.current);
        let attempts = 0;
        linkPollRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const st = await getGmailStatus();
            if (st?.linked) {
              setGmailLinked(true);
              setGmailEmail(st?.email || null);
              notify('Gmail vinculado correctamente.', 'success');
              window.clearInterval(linkPollRef.current);
              linkPollRef.current = null;
            }
          } catch { }
          if (attempts > 40) { // ~2 minutos si 3s
            window.clearInterval(linkPollRef.current);
            linkPollRef.current = null;
          }
        }, 3000);
      }
    } catch (e) {
      notify('No se pudo iniciar la vinculación', 'error');
    } finally {
      setIsLinking(false);
    }
  };

  // Transformar del backend a la forma de UI
  const mapEmail = (e) => ({
    id: e.id,
    de: e.de,
    para: e.para,
    asunto: e.asunto,
    mensaje: e.mensaje,
    fecha: e.fecha,
    leido: !!e.leido,
    tipo: e.tipo === 'sent' ? 'enviado' : (e.tipo === 'inbox' ? 'recibido' : e.tipo),
    etiqueta: e.etiqueta || 'general',
    threadId: e.threadId || null // Para respuestas de Gmail
  });

  // Cargar emails desde backend según vista
  useEffect(() => {
    const load = async () => {
      if (vistaActual !== 'bandeja' && vistaActual !== 'enviados') return;
      setLoadingEmails(true);
      try {
        const folder = vistaActual === 'bandeja' ? 'inbox' : 'sent';
        const data = await getAdminEmails(folder);
        setEmails((data || []).map(mapEmail));
      } catch (e) {
        notify('Error cargando emails', 'error');
      } finally {
        setLoadingEmails(false);
      }
    };
    load();
  }, [vistaActual]);

  const matches = (e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (e.de || '').toLowerCase().includes(q) ||
      (e.para || '').toLowerCase().includes(q) ||
      (e.asunto || '').toLowerCase().includes(q) ||
      (e.mensaje || '').toLowerCase().includes(q)
    );
  };
  const emailsRecibidos = emails.filter(email => email.tipo === 'recibido').filter(matches);
  const emailsEnviados = emails.filter(email => email.tipo === 'enviado').filter(matches);
  const emailsNoLeidos = emailsRecibidos.filter(email => !email.leido);

  const getEtiquetaColor = (etiqueta) => {
    switch (etiqueta) {
      case 'consulta': return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'pago': return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'confirmacion': return 'bg-green-50 text-green-800 border-green-300';
      case 'certificado': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'gmail': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'general': return 'bg-gray-50 text-gray-800 border-gray-300';
      default: return 'bg-gray-50 text-gray-800 border-gray-300';
    }
  };

  const handleMarcarComoLeido = async (id) => {
    try {
      await markEmailRead(id);
      setEmails((prev) => prev.map(email => email.id === id ? { ...email, leido: true } : email));
      if (emailSeleccionado?.id === id) {
        setEmailSeleccionado({ ...emailSeleccionado, leido: true });
      }
      notify('Email marcado como leído', 'success');
    } catch (e) {
      notify('No se pudo marcar como leído', 'error');
    }
  };

  const handleMarcarComoNoLeido = async (id) => {
    try {
      // Nota: Esto requeriría un endpoint PUT /api/admin/emails/{id}/unread
      // Por ahora, solo actualizamos el estado local
      setEmails((prev) => prev.map(email => email.id === id ? { ...email, leido: false } : email));
      if (emailSeleccionado?.id === id) {
        setEmailSeleccionado({ ...emailSeleccionado, leido: false });
      }
      notify('Email marcado como no leído', 'success');
    } catch (e) {
      notify('No se pudo actualizar el estado', 'error');
    }
  };

  const handleEliminarEmail = async (id) => {
    setConfirmConfig({
      message: '¿Estás seguro de que deseas eliminar este correo?',
      onConfirm: async () => {
        try {
          await deleteAdminEmail(id);
          setEmails((prev) => prev.filter(email => email.id !== id));
          if (emailSeleccionado?.id === id) {
            setEmailSeleccionado(null);
          }
          notify('Email eliminado', 'success');
        } catch (e) {
          notify('No se pudo eliminar el email', 'error');
        }
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleEnviarEmail = async () => {
    if (nuevoEmail.tipo !== 'individual') {
      notify('Por ahora el envío soportado es individual.', 'info');
      return;
    }
    if (!nuevoEmail.para || !nuevoEmail.asunto || !nuevoEmail.mensaje) {
      notify('Por favor completa todos los campos', 'error');
      return;
    }
    try {
      const saved = await sendAdminEmail({
        recipient: nuevoEmail.para,
        subject: nuevoEmail.asunto,
        body: nuevoEmail.mensaje,
        etiqueta: 'general'
      });
      if (saved) {
        notify('Email enviado correctamente', 'success');
        setNuevoEmail({ para: '', asunto: '', mensaje: '', tipo: 'individual' });
        setVistaActual('enviados');
        // Recargar emails enviados
        const data = await getAdminEmails('sent');
        setEmails((data || []).map(mapEmail));
      }
    } catch (e) {
      notify('No se pudo enviar el email', 'error');
    }
  };

  const handleResponderEmail = (email) => {
    // Extraer email del remitente (puede estar en formato "Nombre <email@example.com>")
    const emailMatch = email.de.match(/<(.+)>/);
    const emailAddress = emailMatch ? emailMatch[1] : email.de;

    setReplyEmail({
      para: emailAddress,
      asunto: email.asunto.startsWith('Re:') ? email.asunto : `Re: ${email.asunto}`,
      mensaje: `\n\n--- Mensaje original ---\nDe: ${email.de}\nFecha: ${email.fecha}\nAsunto: ${email.asunto}\n\n${email.mensaje}`
    });
    setShowReplyModal(true);
  };

  const handleEnviarRespuesta = async (useGmail = false) => {
    if (!replyEmail.para || !replyEmail.asunto || !replyEmail.mensaje.trim()) {
      notify('Por favor completa todos los campos', 'error');
      return;
    }
    setIsSendingReply(true);
    try {
      if (useGmail && gmailLinked) {
        await sendGmail({
          to: replyEmail.para,
          subject: replyEmail.asunto,
          text: replyEmail.mensaje
        });
        notify('Respuesta enviada con Gmail', 'success');
      } else {
        await sendAdminEmail({
          recipient: replyEmail.para,
          subject: replyEmail.asunto,
          body: replyEmail.mensaje,
          etiqueta: 'general'
        });
        notify('Respuesta enviada correctamente', 'success');
      }
      setShowReplyModal(false);
      setReplyEmail({ para: '', asunto: '', mensaje: '' });
      setEmailSeleccionado(null);
      // Recargar emails
      const folder = vistaActual === 'bandeja' ? 'inbox' : 'sent';
      const data = await getAdminEmails(folder);
      setEmails((data || []).map(mapEmail));
    } catch (e) {
      notify('No se pudo enviar la respuesta', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const Spinner = ({ size = 'h-5 w-5' }) => (
    <span className={`inline-block animate-spin rounded-full border-2 border-b-transparent border-current ${size}`} />
  );

  return (
    <div className="px-4 sm:px-6 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`mb-4 rounded-xl sm:rounded-2xl p-4 text-sm font-semibold transition-all border-2 shadow-lg ${toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-300'
              : toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">Gestión de Email</h1>
              <p className="text-sm sm:text-base font-semibold text-slate-600">
                Administra la comunicación con estudiantes y personal
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3 flex-wrap">
              {!gmailLinked ? (
                <button
                  type="button"
                  onClick={handleLinkGmail}
                  disabled={isLinking}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 text-sm font-semibold rounded-lg transition-all shadow-sm ${isLinking
                      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                      : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                >
                  {isLinking && <Spinner size="h-4 w-4" />} Vincular Gmail
                </button>
              ) : (
                <span className="text-sm font-semibold text-emerald-800 bg-emerald-50 border-2 border-emerald-300 px-3 py-2 rounded-lg">
                  Gmail vinculado{gmailEmail ? ` (${gmailEmail})` : ''}
                </span>
              )}
              <button
                onClick={() => setVistaActual('redactar')}
                className="inline-flex items-center px-4 py-2.5 border-2 border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Redactar Email
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setVistaActual('bandeja')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 font-semibold ${vistaActual === 'bandeja'
                      ? 'bg-slate-100 text-slate-900 border-slate-300 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Bandeja de Entrada</span>
                    {emailsNoLeidos.length > 0 && (
                      <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full border-2 border-red-700">
                        {emailsNoLeidos.length}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setVistaActual('enviados')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 font-semibold ${vistaActual === 'enviados'
                      ? 'bg-slate-100 text-slate-900 border-slate-300 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                >
                  Emails Enviados
                </button>

                <button
                  onClick={() => setVistaActual('redactar')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 font-semibold ${vistaActual === 'redactar'
                      ? 'bg-slate-100 text-slate-900 border-slate-300 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                >
                  Redactar Email
                </button>
              </div>

              {/* Estadísticas rápidas */}
              <div className="mt-6 pt-6 border-t-2 border-slate-200">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-3">Estadísticas</h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">No leídos</span>
                    <span className="font-extrabold text-red-700">{emailsNoLeidos.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">Recibidos hoy</span>
                    <span className="font-extrabold text-slate-900">2</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">Enviados hoy</span>
                    <span className="font-extrabold text-slate-900">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Vista de Bandeja de Entrada */}
            {vistaActual === 'bandeja' && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200">
                <div className="px-5 sm:px-6 py-4 border-b-2 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Bandeja de Entrada ({emailsRecibidos.length})
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="hidden sm:block flex-1 max-w-xs">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar…"
                        className="w-full text-sm px-3 py-2 rounded-lg border-2 border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      />
                    </div>
                    {!gmailLinked && (
                      <button
                        onClick={handleLinkGmail}
                        className="text-sm font-semibold text-slate-700 border-2 border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 transition-all"
                      >
                        Vincular Gmail
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          setIsGmailFetching(true);
                          const list = await listGmailInbox();
                          setEmails(list.map(e => ({ ...e })));
                          notify('Correos cargados desde Gmail', 'success');
                        } catch (e) {
                          const status = e?.response?.status;
                          const msg = e?.response?.data?.message || e?.message || 'No se pudo cargar Gmail';
                          if (status === 401 || status === 403) notify('Sesión o vinculación de Gmail no autorizada o expirada. Vuelve a vincular.', 'error');
                          else if (status === 400) notify(msg, 'error');
                          else notify('No se pudo cargar Gmail', 'error');
                        } finally { setIsGmailFetching(false); }
                      }}
                      disabled={!gmailLinked || isGmailFetching}
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border-2 transition-all ${!gmailLinked || isGmailFetching
                          ? 'text-slate-400 border-slate-200 cursor-not-allowed bg-slate-50'
                          : 'text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                        }`}
                    >
                      {isGmailFetching && <Spinner size="h-4 w-4" />} Cargar desde Gmail
                    </button>
                  </div>
                </div>
                {emailsRecibidos.length === 0 && (
                  <div className="px-6 py-12 text-sm text-slate-600 flex flex-col items-center gap-3">
                    <div className="text-5xl">📭</div>
                    {query ? (
                      <span className="font-semibold">No hay resultados para "{query}".</span>
                    ) : (
                      <span className="font-semibold text-center">
                        No hay correos para mostrar{!gmailLinked ? ' · Vincula Gmail y luego pulsa "Cargar desde Gmail".' : ''}
                      </span>
                    )}
                  </div>
                )}

                <div className="divide-y-2 divide-slate-100">
                  {emailsRecibidos.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setEmailSeleccionado(email);
                        if (!email.leido && email.etiqueta !== 'gmail') handleMarcarComoLeido(email.id);
                      }}
                      className={`p-5 sm:p-6 bg-white cursor-pointer border-l-4 transition-all hover:shadow-md ${!email.leido ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                              {email.de}
                            </p>
                            {!email.leido && (
                              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-blue-800 flex-shrink-0"></span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 ${getEtiquetaColor(email.etiqueta)}`}>
                              {email.etiqueta}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                            {email.asunto}
                          </p>
                          <p className="text-sm text-slate-600 truncate">
                            {email.mensaje}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {email.fecha}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Emails Enviados */}
            {vistaActual === 'enviados' && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200">
                <div className="px-5 sm:px-6 py-4 border-b-2 border-slate-200">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Emails Enviados ({emailsEnviados.length})
                  </h3>
                </div>

                <div className="divide-y-2 divide-slate-100">
                  {emailsEnviados.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setEmailSeleccionado(email)}
                      className="p-5 sm:p-6 bg-white hover:bg-slate-50 cursor-pointer border-l-4 border-transparent hover:border-slate-300 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                            <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                              Para: {email.para}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 ${getEtiquetaColor(email.etiqueta)}`}>
                              {email.etiqueta}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                            {email.asunto}
                          </p>
                          <p className="text-sm text-slate-600 truncate">
                            {email.mensaje}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {email.fecha}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Redactar Email */}
            {vistaActual === 'redactar' && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 border-slate-200 p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-6">Redactar Nuevo Email</h3>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEnviarEmail(); }}>
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Tipo de envío
                    </label>
                    <select
                      id="tipo"
                      value={nuevoEmail.tipo}
                      onChange={(e) => setNuevoEmail({ ...nuevoEmail, tipo: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    >
                      <option value="individual">Individual</option>
                      <option value="grupo">Grupo de estudiantes</option>
                      <option value="todos">Todos los estudiantes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="para" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Para
                    </label>
                    <input
                      type="email"
                      id="para"
                      value={nuevoEmail.para}
                      onChange={(e) => setNuevoEmail({ ...nuevoEmail, para: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="ejemplo@email.com"
                      disabled={nuevoEmail.tipo !== 'individual'}
                    />
                    {nuevoEmail.tipo === 'todos' && (
                      <p className="mt-1 text-sm text-slate-600 font-medium">
                        Se enviará a todos los estudiantes registrados
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="asunto" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      id="asunto"
                      value={nuevoEmail.asunto}
                      onChange={(e) => setNuevoEmail({ ...nuevoEmail, asunto: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Asunto del mensaje"
                    />
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="mensaje"
                      rows={8}
                      value={nuevoEmail.mensaje}
                      onChange={(e) => setNuevoEmail({ ...nuevoEmail, mensaje: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setVistaActual('bandeja')}
                      className="px-4 py-2 border-2 border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border-2 border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 transition-all disabled:opacity-60"
                    >
                      Enviar Email
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!nuevoEmail.para || !nuevoEmail.asunto || !nuevoEmail.mensaje) {
                          notify('Por favor completa todos los campos', 'error');
                          return;
                        }
                        try {
                          await sendGmail({ to: nuevoEmail.para, subject: nuevoEmail.asunto, text: nuevoEmail.mensaje });
                          setNuevoEmail({ para: '', asunto: '', mensaje: '', tipo: 'individual' });
                          setVistaActual('enviados');
                          notify('Enviado con Gmail', 'success');
                          // Recargar emails enviados
                          const data = await getAdminEmails('sent');
                          setEmails((data || []).map(mapEmail));
                        } catch (e) {
                          notify('No se pudo enviar con Gmail', 'error');
                        }
                      }}
                      disabled={!gmailLinked}
                      title={!gmailLinked ? 'Vincula tu Gmail para usar este botón' : ''}
                      className={`px-4 py-2 border-2 text-sm font-semibold rounded-lg shadow-sm text-white transition-all ${gmailLinked
                          ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700'
                          : 'bg-emerald-400 border-emerald-300 cursor-not-allowed'
                        }`}
                    >
                      Enviar con Gmail
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalle de email */}
        {emailSeleccionado && !showReplyModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-12 sm:pt-16 p-4">
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-4xl shadow-2xl rounded-xl sm:rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {emailSeleccionado.asunto}
                  </h3>
                  <button
                    onClick={() => setEmailSeleccionado(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="border-b-2 border-slate-200 pb-4 mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900">
                        {emailSeleccionado.tipo === 'recibido' ? 'De:' : 'Para:'} {emailSeleccionado.tipo === 'recibido' ? emailSeleccionado.de : emailSeleccionado.para}
                      </p>
                      <p className="text-sm text-slate-600 font-semibold">
                        {emailSeleccionado.fecha}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 ${getEtiquetaColor(emailSeleccionado.etiqueta)}`}>
                      {emailSeleccionado.etiqueta}
                    </span>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap font-medium">
                    {emailSeleccionado.mensaje}
                  </p>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex gap-2">
                    {emailSeleccionado.tipo === 'recibido' && (
                      <>
                        <button
                          onClick={() => handleMarcarComoLeido(emailSeleccionado.id)}
                          disabled={emailSeleccionado.leido}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${emailSeleccionado.leido
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                            }`}
                        >
                          Marcar como leído
                        </button>
                        <button
                          onClick={() => handleMarcarComoNoLeido(emailSeleccionado.id)}
                          disabled={!emailSeleccionado.leido}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${!emailSeleccionado.leido
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                            }`}
                        >
                          Marcar como no leído
                        </button>
                      </>
                    )}
                    {emailSeleccionado.etiqueta !== 'gmail' && (
                      <button
                        onClick={() => handleEliminarEmail(emailSeleccionado.id)}
                        className="px-3 py-2 text-sm font-semibold rounded-lg border-2 bg-red-50 text-red-700 border-red-300 hover:bg-red-100 transition-all"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEmailSeleccionado(null)}
                      className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 border-2 border-slate-400 transition-all font-semibold"
                    >
                      Cerrar
                    </button>
                    {emailSeleccionado.tipo === 'recibido' && (
                      <button
                        onClick={() => handleResponderEmail(emailSeleccionado)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 border-2 border-slate-700 transition-all font-semibold"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de respuesta directa */}
        {showReplyModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/50 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-12 sm:pt-16 p-4">
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-3xl shadow-2xl rounded-xl sm:rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Responder Email
                  </h3>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyEmail({ para: '', asunto: '', mensaje: '' });
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEnviarRespuesta(); }}>
                  <div>
                    <label htmlFor="reply-para" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Para
                    </label>
                    <input
                      type="email"
                      id="reply-para"
                      value={replyEmail.para}
                      onChange={(e) => setReplyEmail({ ...replyEmail, para: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="ejemplo@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reply-asunto" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      id="reply-asunto"
                      value={replyEmail.asunto}
                      onChange={(e) => setReplyEmail({ ...replyEmail, asunto: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Asunto del mensaje"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="reply-mensaje" className="block text-sm font-extrabold text-slate-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="reply-mensaje"
                      rows={10}
                      value={replyEmail.mensaje}
                      onChange={(e) => setReplyEmail({ ...replyEmail, mensaje: e.target.value })}
                      className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Escribe tu respuesta aquí..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyModal(false);
                        setReplyEmail({ para: '', asunto: '', mensaje: '' });
                      }}
                      className="px-4 py-2 border-2 border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReply}
                      className="px-4 py-2 border-2 border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 transition-all disabled:opacity-60"
                    >
                      {isSendingReply ? <Spinner size="h-4 w-4" /> : 'Enviar Respuesta'}
                    </button>
                    {gmailLinked && (
                      <button
                        type="button"
                        onClick={() => handleEnviarRespuesta(true)}
                        disabled={isSendingReply}
                        className="px-4 py-2 border-2 border-emerald-700 text-sm font-semibold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-60"
                      >
                        {isSendingReply ? <Spinner size="h-4 w-4" /> : 'Enviar con Gmail'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto border-2 border-slate-300 w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl bg-white">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Confirmar
                  </h3>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <p className="text-slate-700 font-medium mb-6 whitespace-pre-line">
                  {confirmConfig.message}
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 border-2 border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (confirmConfig.onConfirm) confirmConfig.onConfirm();
                    }}
                    className="px-4 py-2 border-2 border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 transition-all"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Email_Admin_comp;
